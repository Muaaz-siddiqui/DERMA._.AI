import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.contrib.auth.models import User

admin_email = 'admin@email.com'
admin_pass = 'admin123'

if not User.objects.filter(username=admin_email).exists():
    User.objects.create_superuser(admin_email, admin_email, admin_pass)
    print(f"Superuser {admin_email} created.")
else:
    print(f"Superuser {admin_email} already exists.")
