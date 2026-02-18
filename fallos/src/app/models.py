from pydantic import BaseModel
from typing import Optional

class RelayFaultRequest(BaseModel):
    system_id: str
    duration: int = 10 # Segundos que dura el fallo

class SensorAttackRequest(BaseModel):
    system_id: str
    sensor_id: str
    value: float
    duration: int = 10 # Segundos antes de soltar el control