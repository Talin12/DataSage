from django.contrib import admin
from .models import Dataset, Record, SavedVisualization

# Register your models here.
admin.site.register(Dataset)
admin.site.register(Record)
admin.site.register(SavedVisualization)
