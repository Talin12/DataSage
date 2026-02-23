import json
import re
import decimal

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.db import connection

from .serializers import DatasetSerializer
from .models import Dataset, Record
from .llm_service import analyze_prompt_with_llm


def serialize_row(columns, row):
    result = {}
    for i, v in enumerate(row):
        if isinstance(v, decimal.Decimal):
            result[columns[i]] = float(v)
        else:
            result[columns[i]] = v
    return result


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
            parsed_output = json.loads(raw_llm_output)
        except json.JSONDecodeError:
            cleaned = re.sub(r"```json|```", "", raw_llm_output).strip()
            parsed_output = json.loads(cleaned)

        raw_sql = parsed_output.get("sql", "").strip()
        if not raw_sql.upper().startswith("SELECT"):
            raise ValueError("Only SELECT queries are allowed.")

        with connection.cursor() as cursor:
            cursor.execute(raw_sql, [dataset_id])
            columns = [col[0] for col in cursor.description]
            real_data = [serialize_row(columns, row) for row in cursor.fetchall()]

        chart_type = parsed_output.get("chart_type")
        block_type = "chart" if chart_type in ["bar", "line", "pie"] else "table"

        final_response = {
            "type": "dashboard_response",
            "warnings": [],
            "blocks": [
                {
                    "type": block_type,
                    "title": parsed_output.get("title", "Query Result"),
                    "chart_type": chart_type,
                    "x_axis": parsed_output.get("x_axis"),
                    "y_axis": parsed_output.get("y_axis"),
                    "data": real_data,
                    "columns": columns,
                }
            ]
        }

        return Response(final_response, status=status.HTTP_200_OK)

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