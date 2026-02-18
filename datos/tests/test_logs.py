from fastapi.testclient import TestClient

def test_health_check(cliente: TestClient):
    response = cliente.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_create_log(cliente: TestClient):
    # Datos simulados como los que enviaría el Microservicio de simulación
    payload = {
        "id": "sys_test",
        "name": "Sistema de prueba",
        "relay": {"id":"r1", "state": "ON"},
        "sensors": [
            {"id": "s1", "type": "TEMPERATURE", "value": 50.5, "unit": "C"}
        ]
    }

    # 1. Enviar datos (POST)
    response = cliente.post("/api/logs/", json=payload)

    # Validar respuesta
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "saved"
    assert "log_id" in data

def test_read_logs(cliente: TestClient):
    # 1. Crear un log primero
    payload = {
        "id": "sys_read_test",
        "name": "Sistema Lectura",
        "relay": {"id":"r2", "state": "TRIPPED"},
        "sensors": []
    }
    cliente.post("/api/logs/", json=payload)

    #2. Leer logs (GET)
    response = cliente.get("/api/logs/")
    assert response.status_code == 200
    logs = response.json()
    
    # Validar que recibimos una lista y contiene el dato
    assert len(logs) > 0
    assert logs[0]["system_id"] == "sys_read_test"
    assert logs[0]["relay_state"] == "TRIPPED"
    assert logs[0]["is_abnormal"] == True