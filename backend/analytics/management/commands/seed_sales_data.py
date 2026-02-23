import random
from faker import Faker
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from analytics.models import Dataset, Record


class Command(BaseCommand):
    help = "Seed the database with 1,500 rows each of sales, traffic, and HR data"

    def handle(self, *args, **kwargs):
        fake = Faker()

        user, created = User.objects.get_or_create(username="admin")
        if created:
            user.set_password("admin123")
            user.save()

        datasets_config = [
            {
                "name": "Q4 Global Sales",
                "description": "Seeded dataset for LLM testing",
                "generation_type": "sales",
                "metadata": {
                    "order_id": "string",
                    "date": "date",
                    "region": "string",
                    "product": "string",
                    "units": "integer",
                    "revenue": "integer",
                },
            },
            {
                "name": "Website Traffic Analytics",
                "description": "Seeded website session data for LLM testing",
                "generation_type": "traffic",
                "metadata": {
                    "session_id": "string",
                    "date": "date",
                    "device_type": "string",
                    "browser": "string",
                    "page_views": "integer",
                    "time_on_site_seconds": "integer",
                },
            },
            {
                "name": "HR Employee Data",
                "description": "Seeded employee HR data for LLM testing",
                "generation_type": "hr",
                "metadata": {
                    "employee_id": "string",
                    "department": "string",
                    "years_at_company": "integer",
                    "salary": "integer",
                    "performance_score": "integer",
                    "remote_worker": "boolean",
                },
            },
        ]

        for config in datasets_config:
            dataset = Dataset.objects.create(
                name=config["name"],
                description=config["description"],
                created_by=user,
                metadata=config["metadata"],
            )

            records_to_create = []

            for _ in range(1500):
                if config["generation_type"] == "sales":
                    row = {
                        "order_id": fake.uuid4(),
                        "date": fake.date_between(start_date="-1y", end_date="today").isoformat(),
                        "region": random.choice(["North", "South", "East", "West"]),
                        "product": random.choice(["Laptop", "Phone", "Tablet", "Monitor"]),
                        "units": random.randint(1, 50),
                        "revenue": random.randint(100, 5000),
                    }
                elif config["generation_type"] == "traffic":
                    row = {
                        "session_id": fake.uuid4(),
                        "date": fake.date_between(start_date="-1y", end_date="today").isoformat(),
                        "device_type": random.choice(["Mobile", "Desktop", "Tablet"]),
                        "browser": random.choice(["Chrome", "Safari", "Firefox", "Edge"]),
                        "page_views": random.randint(1, 15),
                        "time_on_site_seconds": random.randint(10, 600),
                    }
                elif config["generation_type"] == "hr":
                    row = {
                        "employee_id": fake.uuid4(),
                        "department": random.choice(["Engineering", "Sales", "HR", "Marketing", "Finance"]),
                        "years_at_company": random.randint(1, 15),
                        "salary": random.randint(50000, 150000),
                        "performance_score": random.randint(1, 100),
                        "remote_worker": random.choice([True, False]),
                    }

                records_to_create.append(Record(dataset=dataset, row_data=row))

            Record.objects.bulk_create(records_to_create)

            self.stdout.write(
                self.style.SUCCESS(f"Successfully seeded 1,500 records for '{config['name']}'!")
            )