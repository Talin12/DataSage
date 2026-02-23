from django.urls import path
from . import views

urlpatterns = [
    path('datasets/', views.get_datasets, name='get_datasets'),
    path('datasets/<int:id>/sample/', views.get_dataset_sample, name='get_dataset_sample'),
    path("ask/", views.ask_dataset),
]