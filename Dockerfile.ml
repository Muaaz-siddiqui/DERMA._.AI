FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 libglib2.0-0 libsm6 libxext6 libxrender-dev \
    && rm -rf /var/lib/apt/lists/*

COPY ml/requirements.txt .
RUN pip install --no-cache-dir --timeout 600 --retries 10 -r requirements.txt

COPY ml/ ./ml/

EXPOSE 7860

CMD ["uvicorn", "ml.app:app", "--host", "0.0.0.0", "--port", "7860"]
