import json
import re

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .serializers import DatasetSerializer
from .models import Dataset, Record
from .llm_service import analyze_prompt_with_llm

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
            cleaned = re.sub(r"```json|```", "", raw_llm_output)
            cleaned = cleaned.strip()
            parsed_output = json.loads(cleaned)

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

    return Response(parsed_output, status=status.HTTP_200_OK)