from fastapi import APIRouter, HTTPException, Request
import time
from typing import List
from app.core.simulator import simulator_instance
from app.models import NavalSystem, RelayState, Sensor

router = APIRouter()

def get_client_ip(request: Request) -> str:
    """
    Extrae la dirección IP del cliente desde la Request HTTP.
    
    Esta función soporta operar detrás de un proxy (como el servicio 'fallos'),
    leyendo la cabecera 'X-Forwarded-For' para identificar la IP original
    del emisor del HTTP request original simulado.

    Args:
        request (Request): La petición entrante de FastAPI.

    Returns:
        str: La cadena de texto representando la IP (ej. '192.168.1.100').
             Devuelve 'unknown' si no puede ser resuelta.
    """
    # Get IP from X-Forwarded-For if available (from fallos proxy), else direct client host
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

def is_authorized(ip: str) -> bool:
    """
    Verifica de forma estricta si una IP está autorizada en la lista blanca del simulador.
    
    Args:
        ip (str): La IP a verificar.

    Returns:
        bool: True si la IP pertenece a la lista blanca o la subred interna segura. False en caso de IP hostil.
    """
    valid_ips = simulator_instance.config.get("valid_ips", [])
    if ip in valid_ips or ip.startswith("172."):
        return True
    return False

@router.get("/config")
async def get_config() -> dict:
    """ Obtiene la configuración operativa actual del núcleo del simulador. """
    return simulator_instance.config

@router.patch("/config")
async def update_config(updates: dict) -> dict:
    """
    Actualiza la configuración central del simulador de forma parcial (Patch).
    Admite la modificación de tiempos de loop e IPs listas blancas en caliente.
    """
    for key, value in updates.items():
        if key in simulator_instance.config:
            simulator_instance.config[key] = value
    return simulator_instance.config

@router.get("/", response_model=List[NavalSystem])
async def get_all_systems() -> List[NavalSystem]:
    """ Retorna una radiografía instantánea de todos los sistemas navales y sus telemetrías actuales. """
    return simulator_instance.systems

@router.get("/{system_id}", response_model=NavalSystem)
async def get_system(system_id: str) -> NavalSystem:
    """
    Recupera el estado físico actual de un sistema naval en concreto mediante su ID.
    (Utilizado de forma constante por la interfaz de Sala de Control).
    """
    system = simulator_instance.get_system(system_id)
    if not system:
        raise HTTPException(status_code=404, detail="System not found")
    return system

# Endpoints para control e Inyección de Fallos
@router.put("/{system_id}/relay")
async def set_relay_state(system_id: str, state: RelayState, request: Request) -> dict:
    """
    Fuerza el cambio de estado electromecánico en un relé. (ON, OFF, TRIPPED)
    Este endpoint intercepta peticiones. Si detecta IPs no autorizadas, levanta el flag preventivo
    interno simulando un ataque físico remoto sin arrojar el 401 para seguir simulando.
    """
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
    if state == RelayState.TRIPPED:
        system.relay.tripped_at = time.time()

    return {"message": f"Relay {system.relay.id} set to {state.value if hasattr(state, 'value') else state}"}

@router.put("/{system_id}/sensors/{sensor_id}")
async def set_sensor_value(system_id: str, sensor_id: str, value: float, request: Request) -> dict:
    """
    Fuerza el valor telemetrico de un sensor (Spoofing signal param).
    Al igual que el relé principal, soporta inyecciones por intrusos auditando la 
    request IP para registrar el intento de sabotaje cibernético.
    """
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