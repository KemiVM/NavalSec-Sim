from fastapi.testclient import TestClient
from app.main import app
from unittest.mock import patch

client = TestClient(app)

# Test de health
def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "OK", "service": "Fault Injection Service"}

# Test de Inyección de Fallo en Relé
@patch("app.services.attacker.attacker.trigger_relay_trip")
def test_relay_attack_endpoint(mock_trigger):
    # Probamos que el endpoint responde 200 y encola la tarea
    payload = {
        "system_id": "sys_main_engine",
        "duration": 5
    }

    response = client.post("/api/attacks/relay", json=payload)

    assert response.status_code == 200
    assert "Fallo inyectado" in response.json()["message"]  