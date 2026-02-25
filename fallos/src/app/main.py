from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
from app.core.settings import settings
from app.api.routes import attacks
from fastapi.middleware.cors import CORSMiddleware

# Configuración de Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled Error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error"},
    )

app.include_router(attacks.router, prefix="/api/attacks", tags=["Attacks"])

@app.get("/health")
def health_check():
    return {"status": "OK", "service": settings.APP_NAME}