from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import httpx
import asyncio
import logging
from app.core.settings import settings
from app.api.routes import health, systems
from contextlib import asynccontextmanager
from app.core.simulator import simulator_instance 
from fastapi.middleware.cors import CORSMiddleware 

# Configuración de Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

import time

# Tarea en segundo plano par la simulación continua
async def run_simulation():
    # Usamos un cliente HTTP persistente para mayor eficiencia
    async with httpx.AsyncClient() as client:
        # Estado de alertas y logs de los sistemas
        last_log_time = 0
        
        # Diccionario para rastrear el último estado de alerta de cada sistema
        # keys: system_id, values: 'NORMAL', 'WARNING', 'CRITICAL'
        alert_states = {}

        while True:
            try:
                # 1. Actualizar física de la simulación
                simulator_instance.update_simulation()
                
                current_time = time.time()
                log_interval = simulator_instance.config.get("log_interval", 20)
                should_log_all = (current_time - last_log_time) >= log_interval

                # 2. Comprobar el estado de cada sistema y enviar logs
                for system in simulator_instance.systems:
                    # Determinar el nivel de alerta actual del sistema
                    current_state = "NORMAL"
                    state_obj = system.relay.state
                    state_str = state_obj.value if hasattr(state_obj, "value") else str(state_obj)
                    
                    if state_str == "TRIPPED":
                        current_state = "CRITICAL"
                    else:
                        for sensor in system.sensors:
                            if sensor.safe_max and sensor.safe_min:
                                if sensor.value > sensor.safe_max or sensor.value < sensor.safe_min:
                                    current_state = "WARNING"
                                    break
                    
                    # ¿Ha cambiado el estado de alerta a un nivel más grave o retornó a normal para resetearse?
                    last_state = alert_states.get(system.id, "NORMAL")
                    
                    # Logic: We must log IMMEDIATELY if we enter WARNING or CRITICAL state
                    # for the first time. If it goes WARNING -> CRITICAL, we log.
                    # If it goes CRITICAL -> WARNING, we log.
                    # If it goes anything -> NORMAL, we don't necessarily need to event-log it, 
                    # but we update the state so the next warning triggers a log.
                    # Actually, logging the return to normal might be good, but user specified:
                    # "solo una vez para que no se registre un informe... solo cuando entre en dicho estado"
                    state_changed_to_alert = (current_state != last_state) and (current_state in ["WARNING", "CRITICAL"])
                    
                    alert_states[system.id] = current_state
                    
                    if should_log_all or state_changed_to_alert or system.under_attack_ip:
                        # Convertimos el modelo a dict compatible con JSON
                        payload = system.model_dump()

                        # Enviamos POST al microservicio de datos
                        try:
                            await client.post(settings.DATA_COLLECTOR_URL, json=payload)
                            # Clear attack flag after sending
                            system.under_attack_ip = None
                        except httpx.RequestError as e:
                            logger.error(f"Error de conexión enviando datos: {e}")
                        except Exception as e:
                            logger.error(f"Error inesperado enviando datos: {e}")

                if should_log_all:
                    last_log_time = current_time

            except Exception as e:
                logger.critical(f"Error crítico en el bucle de simulación: {e}")
            
            sleep_time = simulator_instance.config.get("simulation_sleep", 1.0)
            await asyncio.sleep(sleep_time)

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

    application.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Global Exception Handler
    @application.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.exception(f"Unhandled Error: {exc}")
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