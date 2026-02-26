import httpx
import asyncio
import logging
from app.core.settings import settings

logger = logging.getLogger("attacker")

class AttackService:
    def __init__(self):
        self.base_url = settings.SIMULATOR_URL

    async def trigger_relay_trip(self, system_id: str, duration: int, client_ip: str = "unknown"):
        """
        Ejecuta un ataque DDoS o de sobrecarga física sobre un relé específico.
        
        Args:
            system_id (str): ID del sistema objetivo (ej. 'sys_main_engine').
            duration (int): Duración en segundos que persistirá el ataque antes de restaurar.
            client_ip (str): IP del atacante (por defecto 'unknown' si es tráfico directo).
            
        Proceso:
        1. Fuerza el relé a un estado crítico (TRIPPED).
        2. Espera 'duration' segundos bloqueando la recuperación natural.
        3. Falsa la restauración enviando señal de encendido (ON).
        """
        async with httpx.AsyncClient() as client:
            # 1. Disparo por fallo
            url = f"{self.base_url}/api/systems/{system_id}/relay"
            logger.info(f"Inyectando fallo en Relé: {system_id}")
            try:
                # Enviamos el estado como query param
                res = await client.put(url, params={"state": "TRIPPED"}, headers={"X-Forwarded-For": client_ip})
                res.raise_for_status()
            except Exception as e:
                logger.error(f"Fallo al atacar relé: {e}")
                return

            # 2. Espera del escenario
            await asyncio.sleep(duration)

            # 3. Vuelta a la normalidad
            logger.info(f"Restaurando relé: {system_id}")
            try:
                res = await client.put(url, params={"state": "ON"})
                res.raise_for_status()
            except Exception as e:
                logger.error(f"Fallo al restaurar relé: {e}")
    
    async def trigger_sensor_spoof(self, system_id: str, sensor_id: str, value: float, duration: int, client_ip: str = "unknown"):
        """
        Inyecta telemetría falsa de manera continuada para engañar al sistema de seguridad.
        
        Args:
            system_id (str): ID del sistema que contiene el sensor.
            sensor_id (str): ID exacto del sensor objetivo (ej. 'sens_eng_temp').
            value (float): Magnitud del valor falso a inyectar (ej. 9999).
            duration (int): Duración en segundos para la sobreescritura continua.
            client_ip (str): IP remota ofuscada enviada desde el cliente hacker.
            
        Nota técnica:
        Al sobreescribir repetidamente el sensor a alta frecuencia el motor de físicas
        es incapaz de utilizar la inercia termal para bajar el número y colapsa el relé.
        """
        logger.info(f"Hackeando sensor {sensor_id} a valor {value} durante {duration}s")
        
        start_time = asyncio.get_event_loop().time()
        
        async with httpx.AsyncClient() as client:
            url = f"{self.base_url}/api/systems/{system_id}/sensors/{sensor_id}"
            
            while (asyncio.get_event_loop().time() - start_time) < duration:
                try:
                    res = await client.put(url, params={"value": value}, headers={"X-Forwarded-For": client_ip})
                    res.raise_for_status()
                except Exception as e:
                    logger.error(f"Fallo al atacar sensor: {e}")
                
                # Bucle de alta frecuencia: Sobreescribe los datos físicos reales.
                # Spamear el valor cada 0.5 segundos sirve para "abrumar" la inercia térmica
                # y las funciones seno del ciclo principal del motor, forzando la rotura.
                await asyncio.sleep(0.5)

# Instancia global inyectada en Main Router

attacker = AttackService()