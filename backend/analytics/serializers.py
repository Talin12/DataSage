from rest_framework import serializers
from .models import Dataset, SavedVisualization

class DatasetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataset
        fields = ['id', 'name', 'description', 'metadata']

class SavedVisualizationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedVisualization
        fields = ['id', 'prompt', 'render_plan', 'created_at']
        read_only_fields = ['id', 'created_at']