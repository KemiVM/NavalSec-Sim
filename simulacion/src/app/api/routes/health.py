from fastapi import APIRouter
from app.core.settings import settings

router = APIRouter()

@router.get("/health")
async def health_check():
    # Comprobación del estado del servicio
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV
    }