from fastapi import APIRouter, HTTPException, Request
from typing import List
from app.core.simulator import simulator_instance
from app.models import NavalSystem, RelayState, Sensor

router = APIRouter()

def get_client_ip(request: Request) -> str:
    # Get IP from X-Forwarded-For if available (from fallos proxy), else direct client host
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def is_authorized(ip: str) -> bool:
    valid_ips = simulator_instance.config.get("valid_ips", [])
    if ip in valid_ips or ip.startswith("172."):
        return True
    return False

@router.get("/config")
async def get_config():
    return simulator_instance.config

@router.patch("/config")
async def update_config(updates: dict):
    # Actualización simple de parámetros
    for key, value in updates.items():
        if key in simulator_instance.config:
            simulator_instance.config[key] = value
    return simulator_instance.config

@router.get("/", response_model=List[NavalSystem])
async def get_all_systems():
    return simulator_instance.systems

@router.get("/{system_id}", response_model=NavalSystem)
async def get_system(system_id: str):
    system = simulator_instance.get_system(system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    return system

# Endpoints para control e Inyección de Fallos
@router.put("/{system_id}/relay")
async def set_relay_state(system_id: str, state: RelayState, request: Request):
    # Permite forzar el estado de un relé (ON, OFF, TRIPPED)
    system = simulator_instance.get_system(system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
        
    ip = get_client_ip(request)
    if not is_authorized(ip):
        system.under_attack_ip = ip

    # Si el sistema está OFF, solo permitimos encenderlo (ON) o apagarlo de nuevo (OFF)
    # No permitimos TRIPPED (fallo) si está apagado
    current_state_str = system.relay.state.value if hasattr(system.relay.state, "value") else str(system.relay.state)
    
    if current_state_str == "OFF" and state == RelayState.TRIPPED:
        raise HTTPException(status_code=400, detail="Cannot trip a system that is currently OFF")

    system.relay.state = state
    return {"message": f"Relay {system.relay.id} set to {state}"}

@router.put("/{system_id}/sensors/{sensor_id}")
async def set_sensor_value(system_id: str, sensor_id: str, value: float, request: Request):
    # Permite forzar un valor específico en un sensor
    system = simulator_instance.get_system(system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")

    # Buscar el sensor dentro del sistema
    sensor = next((s for s in system.sensors if s.id == sensor_id), None)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
        
    ip = get_client_ip(request)
    if not is_authorized(ip):
        system.under_attack_ip = ip

    # Validar que el sistema no esté APAGADO
    current_state_str = system.relay.state.value if hasattr(system.relay.state, "value") else str(system.relay.state)
    if current_state_str == "OFF":
         raise HTTPException(status_code=400, detail="Cannot modify sensors while system is OFF")

    sensor.value = value
    return {"message": f"Sensor {sensor.id} set to {value}"}