# backend/analytics/views.py
import json
import re
import decimal

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import connection

from .serializers import DatasetSerializer, SavedVisualizationSerializer
from .models import Dataset, Record, SavedVisualization
from .llm_service import analyze_prompt_with_llm

ROW_LIMIT = 500


def serialize_row(columns, row):
    result = {}
    for i, v in enumerate(row):
        if isinstance(v, decimal.Decimal):
            result[columns[i]] = float(v)
        else:
            result[columns[i]] = v
    return result


def enforce_row_limit(sql):
    sql_stripped = sql.rstrip().rstrip(";").rstrip()
    upper = sql_stripped.upper()
    if "LIMIT" not in upper:
        return f"{sql_stripped} LIMIT {ROW_LIMIT}"
    return sql_stripped


def execute_block_sql(raw_sql, dataset_id):
    if not raw_sql.upper().startswith("SELECT"):
        return None, None, "Query rejected: only SELECT statements are permitted."

    secured_sql = enforce_row_limit(raw_sql)

    try:
        with connection.cursor() as cursor:
            cursor.execute(secured_sql, [dataset_id])
            columns = [col[0] for col in cursor.description]
            rows = cursor.fetchmany(ROW_LIMIT)
            data = [serialize_row(columns, row) for row in rows]
        return columns, data, None
    except Exception as e:
        return None, None, f"SQL execution error: {str(e)}"


@api_view(['GET'])
def get_datasets(request):
    datasets = Dataset.objects.all()
    serializer = DatasetSerializer(datasets, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_dataset_sample(request, id):
    dataset = get_object_or_404(Dataset, id=id)
    records = Record.objects.filter(dataset=dataset)[:5]
    sample_data = [record.row_data for record in records]
    return Response({
        "dataset_id": dataset.id,
        "dataset_name": dataset.name,
        "sample": sample_data
    })


@api_view(['POST'])
def ask_dataset(request):
    prompt = request.data.get("prompt")
    dataset_id = request.data.get("dataset_id")

    if not prompt or not dataset_id:
        return Response(
            {"error": "Both 'prompt' and 'dataset_id' are required."},
            status=status.HTTP_400_BAD_REQUEST
        )

    dataset = get_object_or_404(Dataset, id=dataset_id)
    records = dataset.records.all()[:5]
    sample_rows = [record.row_data for record in records]

    try:
        raw_llm_output = analyze_prompt_with_llm(
            prompt=prompt,
            schema=dataset.metadata,
            sample_rows=sample_rows
        )

        try:
            parsed_blocks = json.loads(raw_llm_output)
        except json.JSONDecodeError:
            cleaned = re.sub(r"```json|```", "", raw_llm_output).strip()
            parsed_blocks = json.loads(cleaned)

        if not isinstance(parsed_blocks, list):
            return Response(
                {"error": "AI returned an unexpected format (expected a JSON array of blocks)."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    except json.JSONDecodeError:
        return Response(
            {"error": "AI returned unparseable JSON."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
    except Exception as e:
        return Response(
            {"error": str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    assembled_blocks = []
    warnings = []

    for i, block in enumerate(parsed_blocks):
        render_type = block.get("render")
        title = block.get("title", f"Block {i + 1}")
        raw_sql = (block.get("sql") or "").strip()

        # --- KPI block ---
        if render_type == "kpi":
            columns, data, warning = execute_block_sql(raw_sql, dataset_id)
            if warning:
                warnings.append(f"Block '{title}': {warning}")
                assembled_blocks.append({
                    "render": "kpi",
                    "title": title,
                    "error": warning,
                })
            else:
                # KPI: first column of first row is the value
                value = data[0][columns[0]] if data else None
                assembled_blocks.append({
                    "render": "kpi",
                    "title": title,
                    "value": value,
                    "value_label": columns[0] if columns else None,
                })

        # --- Chart block ---
        elif render_type == "chart":
            columns, data, warning = execute_block_sql(raw_sql, dataset_id)
            if warning:
                warnings.append(f"Block '{title}': {warning}")
                assembled_blocks.append({
                    "render": "chart",
                    "title": title,
                    "error": warning,
                })
            else:
                assembled_blocks.append({
                    "render": "chart",
                    "title": title,
                    "chart_type": block.get("chart_type"),
                    "x_axis": block.get("x_axis"),
                    "y_axis": block.get("y_axis"),
                    "data": data,
                    "columns": columns,
                })

        # --- Table block ---
        elif render_type == "table":
            columns, data, warning = execute_block_sql(raw_sql, dataset_id)
            if warning:
                warnings.append(f"Block '{title}': {warning}")
                assembled_blocks.append({
                    "render": "table",
                    "title": title,
                    "error": warning,
                })
            else:
                assembled_blocks.append({
                    "render": "table",
                    "title": title,
                    "data": data,
                    "columns": columns,
                })

        # --- Unknown render type ---
        else:
            warning = f"Block '{title}': unknown render type '{render_type}' — skipped."
            warnings.append(warning)

    final_response = {
        "type": "dashboard_response",
        "warnings": warnings,
        "blocks": assembled_blocks,
    }

    return Response(final_response, status=status.HTTP_200_OK)


@api_view(['POST'])
def save_visualization(request):
    serializer = SavedVisualizationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)