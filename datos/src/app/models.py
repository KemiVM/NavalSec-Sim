from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlmodel import Field, SQLModel
from pydantic import BaseModel

# Modelo de la base de datos (Tabla)
class SystemLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    system_id: str
    system_name: str
    relay_state: str

    # Guardaremos los sensores como un string JSON simple
    sensor_data: str # Ej: {"temp": 80, "rpm": 1200}

    is_abnormal: bool = Field(default=False)
    
    # Cyberattack detection
    is_attack: bool = Field(default=False)
    source_ip: Optional[str] = None

# Modelos Pydantic para recibir datos en la API
class SensorData(BaseModel):
    id: str
    value: float
    unit: str
    # Metadatos opcionales pero útiles para análisis
    min_val: Optional[float] = None
    max_val: Optional[float] = None
    safe_min: Optional[float] = None
    safe_max: Optional[float] = None
    critical_min: Optional[float] = None
    critical_max: Optional[float] = None

class NavalSystemInput(BaseModel):
    id: str
    name: str
    relay: Dict[str, Any] # Esperamos un objeto relay con campo 'state'
    sensors: list[SensorData]
    under_attack_ip: Optional[str] = None