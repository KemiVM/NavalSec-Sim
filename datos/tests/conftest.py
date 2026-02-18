import pytest
import sys
import os

# Add src to python path to allow imports of app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../src")))

from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool

from app.main import app
from app.core.database import engine as prod_engine

# 1. Crear un engine en memoria para tests
test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

# 2. Fixture para la sesión de base de datos
@pytest.fixture(name="session")
def session_fixture():
    # Crear tablas
    SQLModel.metadata.create_all(test_engine)
    with Session(test_engine) as session:
        yield session
    # Limpiar al terminar
    SQLModel.metadata.drop_all(test_engine)

# 3. Fixture para el cliente API
@pytest.fixture(name="cliente")
def client_fixture():
    from app.core import database
    database.engine = test_engine

    with TestClient(app) as client:
        yield client

    # Restaurar engine original
    database.engine = prod_engine