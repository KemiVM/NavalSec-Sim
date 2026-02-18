from fastapi import APIRouter, HTTPException
from typing import List
from app.core.simulator import simulator_instance
from app.models import NavalSystem, RelayState, Sensor

router = APIRouter()

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
async def set_relay_state(system_id: str, state: RelayState):
    # Permite forzar el estado de un relé (ON, OFF, TRIPPED)
    system = simulator_instance.get_system(system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")

    # Si el sistema está OFF, solo permitimos encenderlo (ON) o apagarlo de nuevo (OFF)
    # No permitimos TRIPPED (fallo) si está apagado
    current_state_str = system.relay.state.value if hasattr(system.relay.state, "value") else str(system.relay.state)
    
    if current_state_str == "OFF" and state == RelayState.TRIPPED:
        raise HTTPException(status_code=400, detail="Cannot trip a system that is currently OFF")

    system.relay.state = state
    return {"message": f"Relay {system.relay.id} set to {state}"}

@router.put("/{system_id}/sensors/{sensor_id}")
async def set_sensor_value(system_id: str, sensor_id: str, value: float):
    # Permite forzar un valor específico en un sensor
    system = simulator_instance.get_system(system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")

    # Buscar el sensor dentro del sistema
    sensor = next((s for s in system.sensors if s.id == sensor_id), None)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")

    # Validar que el sistema no esté APAGADO
    current_state_str = system.relay.state.value if hasattr(system.relay.state, "value") else str(system.relay.state)
    if current_state_str == "OFF":
         raise HTTPException(status_code=400, detail="Cannot modify sensors while system is OFF")

    sensor.value = value
    return {"message": f"Sensor {sensor.id} set to {value}"}