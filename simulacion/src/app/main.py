from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import httpx
import asyncio
import logging
from app.core.settings import settings
from app.api.routes import health, systems
from contextlib import asynccontextmanager
from app.core.simulator import simulator_instance 

# Configuración de Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Tarea en segundo plano par la simulación continua
async def run_simulation():
    # Usamos un cliente HTTP persistente para mayor eficiencia
    async with httpx.AsyncClient() as client:
        while True:
            try:
                # 1. Actualizar física de la simulación
                simulator_instance.update_simulation()

                # 2. Enviar datos al colector
                for system in simulator_instance.systems:
                    # Convertimos el modelo a dict compatible con JSON
                    payload = system.model_dump()

                    # Enviamos POST al microservicio de datos
                    try:
                        await client.post(settings.DATA_COLLECTOR_URL, json=payload)
                    except httpx.RequestError as e:
                        logger.error(f"Error de conexión enviando datos: {e}")
                    except Exception as e:
                        logger.error(f"Error inesperado enviando datos: {e}")

            except Exception as e:
                logger.critical(f"Error crítico en el bucle de simulación: {e}")
            
            await asyncio.sleep(1)

@asynccontextmanager
async def lifespan(app:FastAPI):
    # Startup: iniciar la tarea de simulación
    logger.info("Iniciando simulación...")
    simulation_task = asyncio.create_task(run_simulation())
    yield
    # Shutdown: cancelar la tarea de simulación
    logger.info("Deteniendo simulación...")
    simulation_task.cancel()
    try:
        await simulation_task
    except asyncio.CancelledError:
        pass

def get_application() -> FastAPI:
    application = FastAPI(
        title=settings.APP_NAME,
        version="0.1.0",
        debug=settings.DEBUG,
        lifespan=lifespan # Aquí registramos el ciclo de vida
    )

    # Global Exception Handler
    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Error no manejado: {exc}")
        return JSONResponse(
            status_code=500,
            content={"message": "Internal Server Error"},
        )

    # Registramos las rutas
    application.include_router(health.router, tags=["Health"])
    application.include_router(systems.router, prefix="/api/systems", tags=["Systems"])
    
    @application.get("/")
    async def root():
        return {"message": "Simulador de Barco activado"}
    
    return application

app = get_application()