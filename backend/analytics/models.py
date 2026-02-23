from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Dataset(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='datasets')
    metadata = models.JSONField()

    def __str__(self):
        return self.name

class Record(models.Model):
    dataset = models.ForeignKey(Dataset, on_delete=models.CASCADE, related_name='records')
    row_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Record in {self.dataset.name}"


class SavedVisualization(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_visualizations')
    prompt = models.TextField()
    render_plan = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.prompt[:50]