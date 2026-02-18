from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.models import RelayFaultRequest, SensorAttackRequest
from app.services.attacker import attacker

router = APIRouter()

@router.post("/relay")
async def inject_relay_fault(request: RelayFaultRequest, background_tasks: BackgroundTasks):
    # Inicia un escenario de fallo en un relé
    # Lanzamos el ataque en segundo plano
    background_tasks.add_task(
        attacker.trigger_relay_trip,
        request.system_id,
        request.duration
    )
    return {"message": f"Fallo inyectado en {request.system_id} por {request.duration}s"}

@router.post("/sensor")
async def inject_sensor_attack(request: SensorAttackRequest, background_tasks: BackgroundTasks):
    # Fuerza un valor específico en un sensor
    background_tasks.add_task(
        attacker.trigger_sensor_spoof,
        request.system_id,
        request.sensor_id,
        request.value,
        request.duration
    )
    return {"message": f"Ataque a sensor {request.sensor_id} iniciado"}