import json
from typing import List
from fastapi import APIRouter, HTTPException, Query
from sqlmodel import Session, select
from app.core.database import engine
from app.models import SystemLog, NavalSystemInput

router = APIRouter()

@router.post("/", status_code=201)
async def receive_log(data: NavalSystemInput):
    # Recibe un estado de sistema, valida y guarda en la base de datos
    try:
        # Validación robusta de estado
        # Nota: data.relay es un Dict según el modelo, pero podría venir como objeto si Pydantic es flexible
        relay_val = data.relay.get('state', 'UNKNOWN') if isinstance(data.relay, dict) else getattr(data.relay, 'state', 'UNKNOWN')
        is_abnormal_state = relay_val == "TRIPPED"
        
        # Verificar si algún sensor está fuera de rangos seguros
        is_sensor_anomaly = False
        for s in data.sensors:
            if s.safe_max is not None and s.value > s.safe_max:
                is_sensor_anomaly = True
                break
            if s.safe_min is not None and s.value < s.safe_min:
                is_sensor_anomaly = True
                break
        
        is_abnormal = is_abnormal_state or is_sensor_anomaly

        # Convertir sensores a JSON string
        try:
            sensors_json = json.dumps([s.model_dump() for s in data.sensors])
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error serializing sensor data: {str(e)}")

        new_log = SystemLog(
            system_id=data.id,
            system_name=data.name,
            relay_state=relay_val,
            sensor_data=sensors_json,
            is_abnormal=is_abnormal
        )

        with Session(engine) as session:
            session.add(new_log)
            session.commit()
            session.refresh(new_log)

        return {"status": "saved", "log_id": new_log.id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving log: {str(e)}")

@router.get("/", response_model=List[SystemLog])
async def get_logs(limit: int = 50, abnormal_only: bool = False, search: str = Query(None, description="Search term")):
    # API para que la interfaz web consulte los datos
    with Session(engine) as session:
        query = select(SystemLog).order_by(SystemLog.timestamp.desc())

        if abnormal_only:
            query = query.where(SystemLog.is_abnormal == True)
        
        if search:
            # Búsqueda simple en nombre del sistema o estado del relé
            query = query.where(
                (SystemLog.system_name.contains(search)) | 
                (SystemLog.relay_state.contains(search))
            )

        query = query.limit(limit)
        results = session.exec(query).all()
        return results