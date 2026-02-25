from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
import time

router = APIRouter()

# Global in-memory user registry for the simulation (cross-device sync)
# A permanent db is overkill for a mock simulation, but this fixes the localStorage split-brain.
class User(BaseModel):
    id: str
    username: str
    password: str
    name: str
    email: str
    role: str
    avatar: str

# Default users matching the original frontend mocks
auth_db: List[User] = [
    User(
        id="1", username="admin", password="password123", name="Administrador de Sistemas",
        email="admin@navalsec.com", role="admin", avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
    ),
    User(
        id="2", username="operator1", password="password123", name="Operador de Cubierta",
        email="operator1@navalsec.com", role="user", avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=operator1"
    ),
    User(
        id="3", username="operator2", password="password123", name="Técnico de Máquinas",
        email="operator2@navalsec.com", role="user", avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=operator2"
    )
]

@router.get("/users", response_model=List[User])
async def get_users():
    return auth_db

@router.post("/users", response_model=User)
async def create_user(user: User):
    if any(u.username == user.username for u in auth_db):
        raise HTTPException(status_code=400, detail="El nombre de usuario ya existe")
    auth_db.append(user)
    return user

@router.put("/users/{user_id}", response_model=User)
async def update_user(user_id: str, updates: dict):
    for idx, u in enumerate(auth_db):
        if u.id == user_id:
            # Update attributes
            current_data = u.model_dump()
            for k, v in updates.items():
                if k in current_data and v is not None:
                    current_data[k] = v
            auth_db[idx] = User(**current_data)
            return auth_db[idx]
    raise HTTPException(status_code=404, detail="Usuario no encontrado")

@router.delete("/users/{user_id}")
async def delete_user(user_id: str):
    global auth_db
    auth_db = [u for u in auth_db if u.id != user_id]
    return {"message": "Usuario eliminado"}
