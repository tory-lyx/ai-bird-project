
from contextlib import asynccontextmanager

from fastapi import FastAPI, UploadFile, File, HTTPException
from bird_classifier import analyze_image, load_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("AI Bird Lab: запуск AI-сервера")
    print("Модель завантажиться під час першого аналізу.")
    yield
    print("AI-сервер зупинено.")


app = FastAPI(
    title="AI Bird Lab - AI Server",
    description="Сервер штучного інтелекту для розпізнавання птахів",
    version="1.0.0",
    lifespan=lifespan
)


@app.get("/")
def home():
    return {
        "message": "AI Bird Lab AI Server працює!",
        "status": "online"
    }


@app.get("/health")
def health():
    return {
        "status": "online",
        "model_loaded": load_model() is not None
    }


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Приймає фотографію та повертає результати розпізнавання."""

    allowed_formats = ["image/jpeg", "image/png"]

    if file.content_type not in allowed_formats:
        raise HTTPException(
            status_code=400,
            detail="Підтримуються лише JPG, JPEG та PNG."
        )

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(
            status_code=400,
            detail="Файл порожній."
        )

    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail="Максимальний розмір фотографії — 10 МБ."
        )

    try:
        predictions = analyze_image(image_bytes)

        return {
            "success": True,
            "predictions": predictions
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception as error:
        print(f"Помилка аналізу: {error}")

        raise HTTPException(
            status_code=500,
            detail="Не вдалося виконати аналіз фотографії."
        )
