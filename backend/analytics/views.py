from django.shortcuts import render
from .serializers import DatasetSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Dataset, Record
from django.shortcuts import get_object_or_404

# Create your views here.
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