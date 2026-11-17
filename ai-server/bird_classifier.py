from io import BytesIO

import torch
from PIL import Image, UnidentifiedImageError
from transformers import pipeline


MODEL_NAME = "prithivMLmods/Bird-Species-Classifier-526"

classifier = None


def load_model():
    """Завантажує модель Hugging Face один раз."""
    global classifier

    if classifier is None:
        print("Завантаження AI-моделі...")

        device = 0 if torch.cuda.is_available() else -1

        classifier = pipeline(
            task="image-classification",
            model=MODEL_NAME,
            device=device
        )

        print("AI-модель успішно завантажена!")

    return classifier


def analyze_image(image_bytes):
    """Аналізує фотографію та повертає три результати."""

    try:
        image = Image.open(BytesIO(image_bytes))
        image.verify()

        image = Image.open(BytesIO(image_bytes))
        image = image.convert("RGB")

    except (UnidentifiedImageError, OSError, ValueError):
        raise ValueError("Некоректне або пошкоджене зображення.")

    model = load_model()

    predictions = model(image, top_k=3)

    return [
        {
            "species": item["label"],
            "confidence": round(float(item["score"]), 4)
        }
        for item in predictions
    ]
