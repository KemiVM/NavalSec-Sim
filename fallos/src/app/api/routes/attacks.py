from fastapi import APIRouter, BackgroundTasks, HTTPException, Request
from app.models import RelayFaultRequest, SensorAttackRequest
from app.services.attacker import attacker

router = APIRouter()

def get_real_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

@router.post("/relay")
async def inject_relay_fault(request_body: RelayFaultRequest, request: Request, background_tasks: BackgroundTasks):
    # Inicia un escenario de fallo en un relé
    # Lanzamos el ataque en segundo plano
    client_ip = request_body.simulated_ip or get_real_ip(request)
    background_tasks.add_task(
        attacker.trigger_relay_trip,
        request_body.system_id,
        request_body.duration,
        client_ip
    )
    return {"message": f"Fallo inyectado en {request_body.system_id} por {request_body.duration}s"}

@router.post("/sensor")
async def inject_sensor_attack(request_body: SensorAttackRequest, request: Request, background_tasks: BackgroundTasks):
    # Fuerza un valor específico en un sensor
    client_ip = request_body.simulated_ip or get_real_ip(request)
    background_tasks.add_task(
        attacker.trigger_sensor_spoof,
        request_body.system_id,
        request_body.sensor_id,
        request_body.value,
        request_body.duration,
        client_ip
    )
    return {"message": f"Ataque a sensor {request_body.sensor_id} iniciado"}