import random
from faker import Faker

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

from analytics.models import Dataset, Record


class Command(BaseCommand):
    help = "Seed the database with 1,500 rows of Q4 sales data"

    def handle(self, *args, **kwargs):
        fake = Faker()

        # 1️⃣ Ensure admin user exists
        user, created = User.objects.get_or_create(username="admin")
        if created:
            user.set_password("admin123")  # optional
            user.save()

        # 2️⃣ Create Dataset
        metadata = {
            "order_id": "string",
            "date": "date",
            "region": "string",
            "product": "string",
            "units": "integer",
            "revenue": "integer",
        }

        dataset = Dataset.objects.create(
            name="Q4 Global Sales",
            description="Seeded dataset for LLM testing",
            created_by=user,
            metadata=metadata,
        )

        # 3️⃣ Generate 1,500 records
        records_to_create = []

        for _ in range(1500):
            row = {
                "order_id": fake.uuid4(),
                "date": fake.date_between(start_date="-1y", end_date="today").isoformat(),
                "region": random.choice(["North", "South", "East", "West"]),
                "product": random.choice(["Laptop", "Phone", "Tablet", "Monitor"]),
                "units": random.randint(1, 50),
                "revenue": random.randint(100, 5000),
            }

            record = Record(
                dataset=dataset,
                row_data=row
            )

            records_to_create.append(record)

        # 4️⃣ Bulk insert
        Record.objects.bulk_create(records_to_create)

        self.stdout.write(
            self.style.SUCCESS("Successfully seeded 1,500 records!")
        )