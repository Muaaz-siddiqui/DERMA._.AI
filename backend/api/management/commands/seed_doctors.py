from django.core.management.base import BaseCommand
from api.models import Doctor


DOCTORS = [
    {
        "name": "Ayesha Khan",
        "qualification": "MBBS, FCPS Dermatology",
        "rating": 4.8,
        "reviews": 312,
        "address": "23-A, Gulberg III",
        "city": "Lahore",
        "phone": "+92-42-35781234",
        "fee": "PKR 2000",
        "specialty": "Dermatology",
    },
    {
        "name": "Ahmed Raza",
        "qualification": "MBBS, MD Dermatology",
        "rating": 4.6,
        "reviews": 245,
        "address": "15, Mall Road",
        "city": "Lahore",
        "phone": "+92-42-36391100",
        "fee": "PKR 1500",
        "specialty": "Dermatology",
    },
    {
        "name": "Fatima Malik",
        "qualification": "MBBS, FCPS Dermatology",
        "rating": 4.9,
        "reviews": 420,
        "address": "Clifton Block 5",
        "city": "Karachi",
        "phone": "+92-21-35871000",
        "fee": "PKR 2500",
        "specialty": "Dermatology",
    },
    {
        "name": "Hassan Ali",
        "qualification": "MBBS, FCPS Dermatology",
        "rating": 4.7,
        "reviews": 189,
        "address": "Defence Phase 6",
        "city": "Karachi",
        "phone": "+92-21-34561234",
        "fee": "PKR 2000",
        "specialty": "Dermatology",
    },
    {
        "name": "Saira Bibi",
        "qualification": "MBBS, MD Dermatology",
        "rating": 4.5,
        "reviews": 156,
        "address": "F-8 Markaz",
        "city": "Islamabad",
        "phone": "+92-51-22561000",
        "fee": "PKR 3000",
        "specialty": "Dermatology",
    },
    {
        "name": "Usman Sheikh",
        "qualification": "MBBS, FCPS Dermatology",
        "rating": 4.4,
        "reviews": 134,
        "address": "Blue Area, Jinnah Avenue",
        "city": "Islamabad",
        "phone": "+92-51-23451234",
        "fee": "PKR 2500",
        "specialty": "Dermatology",
    },
    {
        "name": "Zainab Noor",
        "qualification": "MBBS, FCPS Dermatology",
        "rating": 4.3,
        "reviews": 98,
        "address": "Satellite Town",
        "city": "Rawalpindi",
        "phone": "+92-51-44211000",
        "fee": "PKR 1500",
        "specialty": "Dermatology",
    },
    {
        "name": "Bilal Ahmed",
        "qualification": "MBBS, MD Dermatology",
        "rating": 4.6,
        "reviews": 178,
        "address": "Commercial Area, DHA Phase 1",
        "city": "Rawalpindi",
        "phone": "+92-51-55671234",
        "fee": "PKR 2000",
        "specialty": "Dermatology",
    },
    {
        "name": "Nadia Iqbal",
        "qualification": "MBBS, FCPS Dermatology",
        "rating": 4.8,
        "reviews": 267,
        "address": "Gulshan-e-Iqbal Block 13",
        "city": "Karachi",
        "phone": "+92-21-34861000",
        "fee": "PKR 1800",
        "specialty": "Dermatology",
    },
    {
        "name": "Omar Farooq",
        "qualification": "MBBS, FCPS Dermatology",
        "rating": 4.2,
        "reviews": 87,
        "address": "Model Town",
        "city": "Lahore",
        "phone": "+92-42-35161234",
        "fee": "PKR 1200",
        "specialty": "Dermatology",
    },
    {
        "name": "Rabia Shah",
        "qualification": "MBBS, MD Dermatology",
        "rating": 4.7,
        "reviews": 203,
        "address": "E-11 Sector",
        "city": "Islamabad",
        "phone": "+92-51-26101000",
        "fee": "PKR 3500",
        "specialty": "Dermatology",
    },
    {
        "name": "Kamran Tariq",
        "qualification": "MBBS, FCPS Dermatology",
        "rating": 4.1,
        "reviews": 72,
        "address": "Wapda Town",
        "city": "Lahore",
        "phone": "+92-42-37891234",
        "fee": "PKR 1000",
        "specialty": "Dermatology",
    },
]


class Command(BaseCommand):
    help = "Seed the database with dummy doctor records"

    def handle(self, *args, **options):
        created_count = 0
        skipped_count = 0

        for data in DOCTORS:
            _, created = Doctor.objects.get_or_create(
                name=data["name"],
                defaults=data,
            )
            if created:
                created_count += 1
                self.stdout.write(f"  Created: Dr. {data['name']} ({data['city']})")
            else:
                skipped_count += 1
                self.stdout.write(f"  Exists:  Dr. {data['name']} ({data['city']})")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone! Created: {created_count}, Skipped: {skipped_count}"
            )
        )
