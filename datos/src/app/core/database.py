from sqlmodel import SQLModel, create_engine
from .settings import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
)

def create_db_and_tables():
    # Crea las tablas en la base de datos si no existen.
    SQLModel.metadata.create_all(engine)