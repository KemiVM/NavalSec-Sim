from enum import Enum
from typing import List
from pydantic import BaseModel, Field

# Enums para estados fijos
class RelayState(str, Enum):
    ON = "ON"
    OFF = "OFF"
    TRIPPED = "TRIPPED"

class SensorType(str, Enum):
    TEMPERATURE = "TEMPERATURE" # Grados celsius
    VOLTAGE = "VOLTAGE"         # Voltios
    CURRENT = "CURRENT"         # Amperios
    RPM = "RPM"                 # Revoluciones por minuto
    
# Modelos de componentes
class Sensor(BaseModel):
    id: str
    type: SensorType
    value: float
    unit: str

    # Metadatos para la simulación
    min_val: float = 0.0
    max_val: float = 100.0
    drift: float = 0.5

    # Umbrales de Seguridad
    safe_min: float = 0.0
    safe_max: float = 100.0
    critical_min: float = -10.0
    critical_max: float = 110.0

class Relay(BaseModel):
    id: str
    state: RelayState = RelayState.OFF
    # Timestamp para recuperación automática
    tripped_at: float | None = None

class NavalSystem(BaseModel):
    id: str
    name: str
    relay: Relay
    sensors: List[Sensor] = []

# Modelo para respuesta de la API
class SystemResponse(BaseModel):
    systems: List[NavalSystem]