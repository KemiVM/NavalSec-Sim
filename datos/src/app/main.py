from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import logging
from app.core.settings import settings
from app.core.database import create_db_and_tables
from app.api.routes import logs
from fastapi.middleware.cors import CORSMiddleware

# Configuración de Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Gestiona el ciclo de vida del microservicio de Datos.
    Crea las tablas SQL locales de SQLite si no existen en el arranque base de la instancia Docker.
    """
    logger.info("Verificando/Creando tablas de base de datos...")
    create_db_and_tables()
    yield

app = FastAPI(
    title=settings.APP_NAME,
    lifespan=lifespan
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
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Atrapa errores fatales a nivel global para evitar que
    el contenedor caiga y se reinicie crónicamente devolviendo trazas unificadas JSON 500.
    """
    logger.exception(f"Error no manejado: {exc}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error"},
    )

# Registrar rutas
app.include_router(logs.router, prefix="/api/logs", tags=["Logs"])

@app.get("/health")
def health_check() -> dict:
    """ Comprobación pasiva de disponibilidad inter-contenedores. """
    return {"status": "ok", "service": "datos"}