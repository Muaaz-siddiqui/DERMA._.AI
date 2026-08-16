import logging
import numpy as np
import cv2
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, Request
from fastapi.responses import JSONResponse
from datetime import datetime
import uvicorn
import pytz
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ml_service")

MODEL_PATH = "/dermaai_model.keras"

LABELS = [
    'Acne',               # 0
    'Actinic Keratosis',  # 1
    'Basal Cell Carcinoma', # 2
    'Benign Keratosis',   # 3
    'Dermatofibroma',     # 4
    'Eczema',             # 5
    'Melanocytic Nevi',   # 6
    'Melanoma',           # 7
    'Psoriasis',          # 8
    'Vascular Lesion',
]

DESCRIPTIONS = {
    'Acne': 'Acne is a common skin condition that causes pimples, blackheads, and whiteheads due to clogged pores. It is usually managed with proper skincare and medications.',
    'Actinic Keratosis': 'Actinic keratosis is a rough, scaly patch caused by prolonged sun exposure. It is considered precancerous and should be monitored or treated early.',
    'Basal Cell Carcinoma': 'Basal cell carcinoma is the most common type of skin cancer. It grows slowly and rarely spreads, but early treatment is important.',
    'Benign Keratosis': 'Benign keratosis includes non-cancerous skin growths such as seborrheic keratosis. These are harmless but may resemble other skin conditions.',
    'Dermatofibroma': 'Dermatofibroma is a small, benign skin growth often found on the limbs. It is harmless and usually does not require treatment.',
    'Eczema': 'Eczema is a condition that causes dry, itchy, and inflamed skin. Regular moisturizing and avoiding triggers help manage symptoms.',
    'Melanocytic Nevi': 'Melanocytic nevi, commonly known as moles, are benign growths of pigment-producing cells. Most are harmless but should be checked for changes.',
    'Melanoma': 'Melanoma is a serious and potentially deadly form of skin cancer. Early detection and medical treatment are critical for survival.',
    'Psoriasis': 'Psoriasis is a chronic autoimmune condition that causes thick, scaly patches on the skin. It is managed with medications and lifestyle care.',
    'Vascular Lesion': 'Vascular lesions are skin conditions caused by abnormal blood vessels, such as angiomas. They are usually benign and harmless.',
}

DISCLAIMER = 'This is a preliminary AI result. Please consult a qualified dermatologist.'

model = None

local_timezone = pytz.timezone("Asia/Kolkata")
DEPLOYED_AT = datetime.now(local_timezone).strftime("%d-%m-%Y %I:%M %p")


def is_likely_skin_image(image: Image.Image) -> bool:
    try:
        arr = np.array(image.convert("RGB"))
        if arr.ndim != 3 or arr.shape[2] != 3:
            return False

        hsv = cv2.cvtColor(arr, cv2.COLOR_RGB2HSV)
        h, s, v = hsv[:, :, 0], hsv[:, :, 1], hsv[:, :, 2]

        # 1) Brightness gate
        brightness = np.mean(v / 255.0)
        if brightness > 0.95 or brightness < 0.05:
            return False

        # 2) Saturation gate — logos/cartoons often have very uniform saturation
        saturation = np.mean(s / 255.0)
        if saturation < 0.05:
            return False

        # 3) Skin-tone pixel ratio in HSV (H: 0-50, S: 40-170, V: 80-255)
        skin_mask = (h <= 50) & (s >= 40) & (s <= 170) & (v >= 80) & (v <= 255)
        skin_ratio = np.mean(skin_mask)
        if skin_ratio < 0.15:
            return False

        # 4) Color quantisation — logos have very few unique colours
        small = cv2.resize(arr, (64, 64))
        reshaped = small.reshape(-1, 3).astype(np.float32)
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
        _, labels, centers = cv2.kmeans(reshaped, 5, None, criteria, 3, cv2.KMEANS_PP_CENTERS)
        unique_colors = len(np.unique(centers.astype(int), axis=0))
        if unique_colors <= 2:
            return False

        # 5) Edge density — cartoons/logos have sharp, frequent edges
        gray = cv2.cvtColor(arr, cv2.COLOR_RGB2GRAY)
        edges = cv2.Canny(gray, 80, 160)
        edge_ratio = np.mean(edges > 0)
        if edge_ratio > 0.35:
            return False

        return True
    except Exception:
        return True


def load_model():
    global model
    import tensorflow as tf
    logger.info(f"Loading model from {MODEL_PATH}...")
    model = tf.keras.models.load_model(MODEL_PATH)
    logger.info(f"Model loaded. Input shape: {model.input_shape}, Output shape: {model.output_shape}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_model()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/")
async def health(request: Request):
    current_time = datetime.now(local_timezone).strftime("%d-%m-%Y %I:%M %p")
    return {"status": "ok", "deployed_at": DEPLOYED_AT, "checked_at": current_time}


@app.post("/")
async def predict(file: UploadFile = File(...)):
    try:
        if file.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(status_code=400, detail="Invalid file type. Upload JPEG or PNG.")

        image_bytes = await file.read()
        img = Image.fromarray(
            cv2.cvtColor(
                cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR),
                cv2.COLOR_BGR2RGB,
            )
        )

        if not is_likely_skin_image(img):
            raise HTTPException(status_code=400, detail="This does not look like a skin image. Please upload a clear photo of the affected skin area.")

        img_resized = img.resize((224, 224))
        img_array = np.array(img_resized) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array, verbose=0)
        probs = predictions[0].tolist()

        num_classes = len(probs)
        labels = LABELS[:num_classes] if num_classes <= len(LABELS) else [f"class_{i}" for i in range(num_classes)]

        top_3_idx = sorted(range(len(probs)), key=lambda i: probs[i], reverse=True)[:3]
        top_3 = [(labels[i], round(probs[i], 4)) for i in top_3_idx]

        return JSONResponse(content={"predictions": top_3})

    except HTTPException:
        raise
    except Exception as e:
        logger.exception("Prediction failed.")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
