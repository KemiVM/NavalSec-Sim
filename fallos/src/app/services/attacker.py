import httpx
import asyncio
import logging
from app.core.settings import settings

logger = logging.getLogger("attacker")

class AttackService:
    def __init__(self):
        self.base_url = settings.SIMULATOR_URL

    async def trigger_relay_trip(self, system_id: str, duration: int):
        """
        1. Fuerza el relé a TRIPPED.
        2. Espera 'duration' segundos.
        3. Intenta devolverlo a ON (recuperación automática)
        """
        async with httpx.AsyncClient() as client:
            # 1. Disparo por fallo
            url = f"{self.base_url}/api/systems/{system_id}/relay"
            logger.info(f"Inyectando fallo en Relé: {system_id}")
            try:
                # Enviamos el estado como query param
                await client.put(url, params={"state": "TRIPPED"})
            except Exception as e:
                logger.error(f"Fallo al atacar relé: {e}")
                return

            # 2. Espera del escenario
            await asyncio.sleep(duration)

            # 3. Vuelta a la normalidad
            logger.info(f"Restaurando relé: {system_id}")
            try:
                await client.put(url, params={"state": "ON"})
            except Exception as e:
                logger.error(f"Fallo al restaurar relé: {e}")
    
    async def trigger_sensor_spoof(self, system_id: str, sensor_id: str, value: float, duration: int):
        # Fuerza un valor en un sensor
        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}/api/systems/{system_id}/sensors/{sensor_id}"
            logger.info(f"Hackeando sensor {sensor_id} a valor {value}")

            try:
                await client.put(url, params={"value": value})
            except Exception as e:
                logger.error(f"Fallo al atacar sensor: {e}")

# Instancia global
attacker = AttackService()