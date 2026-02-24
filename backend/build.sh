#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input

python manage.py migrate

python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'talindaga692@gmail.com', 'admin')
    print('Superuser created.')
else:
    u = User.objects.get(username='admin')
    u.set_password('admin')
    u.save()
    print('Superuser password reset.')
"

python manage.py seed_sales_data