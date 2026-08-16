#!/bin/bash

# Wait for the database to be ready (handled by Docker Compose depends_on healthcheck now)

echo "Apply database migrations"
python manage.py migrate

echo "Starting server"
python manage.py runserver 0.0.0.0:8000
