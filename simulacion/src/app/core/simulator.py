import random
import asyncio
from typing import List, Optional
from app.models import NavalSystem, Relay, Sensor, RelayState, SensorType

class Simulator:
    def __init__(self):
        self.systems: List[NavalSystem] = self._initialize_systems()
        self.running = False

    def _initialize_systems(self) -> List[NavalSystem]:
        # Inicializa 6 sistemas navales esenciales con valores típicos
        return [
            # 1. Motor Principal (Propulsión)
            NavalSystem(
                id="sys_main_engine", name="Motor Principal",
                relay=Relay(id="rel_engine", state=RelayState.ON),
                sensors=[
                    Sensor(id="sens_eng_temp", type=SensorType.TEMPERATURE, value=85.0, unit="ºC", 
                           min_val=20, max_val=150, drift=1.5,
                           safe_min=40, safe_max=95, critical_min=0, critical_max=110),
                    Sensor(id="sens_eng_rpm", type=SensorType.RPM, value=1200.0, unit="rpm", 
                           min_val=0, max_val=2500, drift=15.0,
                           safe_min=500, safe_max=1800, critical_min=0, critical_max=2200)
                ]
            ),

            # 2. Generador Eléctrico Auxiliar
            NavalSystem(
                id="sys_aux_gen", name="Generador Auxiliar",
                relay=Relay(id="rel_gen", state=RelayState.ON),
                sensors=[
                    Sensor(id="sens_gen_volt", type=SensorType.VOLTAGE, value=220.0, unit="V", 
                           min_val=0, max_val=300, drift=0.2,
                           safe_min=210, safe_max=230, critical_min=190, critical_max=250),
                    Sensor(id="sens_gen_curr", type=SensorType.CURRENT, value=45.0, unit="A", 
                           min_val=0, max_val=150, drift=2.0,
                           safe_min=0, safe_max=100, critical_min=-1, critical_max=120)
                ]
            ),

            # 3. Bomba de Achique (Sentina)
            NavalSystem(
                id="sys_bilge_pump", name="Bomba de Achique",
                relay=Relay(id="rel_bilge", state=RelayState.OFF),
                sensors=[
                    Sensor(id="sens_bilge_curr", type=SensorType.CURRENT, value=0.0, unit="A", 
                           min_val=0, max_val=50, drift=0.0,
                           safe_min=0, safe_max=25, critical_min=-1, critical_max=30)
                ]
            ),

            # 4. Radar de Navegación
            NavalSystem(
                id="sys_radar", name="Radar Banda-X",
                relay=Relay(id="rel_radar", state=RelayState.ON),
                sensors=[
                    Sensor(id="sens_radar_temp", type=SensorType.TEMPERATURE, value=40.0, unit="ºC", 
                           min_val=0, max_val=100, drift=0.5,
                           safe_min=10, safe_max=60, critical_min=0, critical_max=75)
                ]
            ),

            # 5. Sistema de Gobierno (Timón)
            NavalSystem(
                id="sys_steering", name="Sistema de Gobierno",
                relay=Relay(id="rel_steering", state=RelayState.ON),
                sensors=[
                    Sensor(id="sens_steer_volt", type=SensorType.VOLTAGE, value=24.0, unit="V", 
                           min_val=0, max_val=40, drift=0.1,
                           safe_min=22, safe_max=28, critical_min=18, critical_max=32)
                ]
            ),

            # 6. Sistema Contraincendios
            NavalSystem(
                id="sys_fire", name="Sistema Contraincendios",
                relay=Relay(id="rel_fire", state=RelayState.ON),
                sensors=[
                    Sensor(id="sens_fire_temp", type=SensorType.TEMPERATURE, value=22.0, unit="ºC", 
                           min_val=0, max_val=100, drift=0.2,
                           safe_min=5, safe_max=40, critical_min=-5, critical_max=50)
                ]
            )
        ]

    def update_simulation(self):
        import time
        current_time = time.time()

        # Actualiza los valores de los sensores y gestiona la lógica de seguridad
        for system in self.systems:
            # 1. GESTIÓN DE SEGURIDAD (Trip y Recuperación)
            if system.relay.state == RelayState.TRIPPED:
                # Verificar si ha pasado el tiempo de recuperación (ej. 10 segundos)
                if system.relay.tripped_at and (current_time - system.relay.tripped_at > 10):
                     system.relay.state = RelayState.ON
                     system.relay.tripped_at = None
                     # Restaurar sensores a valores seguros (promedio de safe_min/max)
                     for sensor in system.sensors:
                         sensor.value = (sensor.safe_min + sensor.safe_max) / 2
                else:
                    # During TRIPPED, stopping simulation (freezing values)
                    # The user requested: "La simulación ... debería detenerse hasta que vuelva a estar ON"
                    # So we just continue, effectively keeping the last values.
                    continue

            # 2. ACTUALIZACIÓN NORMAL Y DETECCIÓN DE FALLOS
            is_active = system.relay.state == RelayState.ON
            
            for sensor in system.sensors:
                if not is_active:
                    # Si el sistema está APAGADO (OFF), los valores decaen
                    if sensor.type == SensorType.TEMPERATURE:
                        # Decaer hacia temperatura ambiente (e.g., 20.0)
                        diff = sensor.value - 20.0
                        sensor.value = max(20.0, sensor.value - (diff * 0.05)) # Decaimiento exponencial suave
                    else:
                        # Otros sensores (RPM, Voltaje, etc.) decaen a 0
                        sensor.value = max(0.0, sensor.value * 0.9) # Decaer un 10% por ciclo
                    
                    sensor.value = round(sensor.value, 2)
                    continue # Saltar lógica de fluctuación normal
                else:
                    # Variación aleatoria normal
                    change = random.uniform(-sensor.drift, sensor.drift)
                    new_value = sensor.value + change

                    # Respetar límites físicos simulados
                    new_value = max(sensor.min_val, min(new_value, sensor.max_val))
                    sensor.value = round(new_value, 2)

                    # 3. VERIFICACIÓN CRÍTICA
                    # Si el valor excede los límites críticos, disparar el relé
                    if new_value > sensor.critical_max or new_value < sensor.critical_min:
                        system.relay.state = RelayState.TRIPPED
                        system.relay.tripped_at = current_time
                        # No reseteamos el valor aquí para que se vea el pico en la gráfica


    def get_system(self, system_id: str) -> Optional[NavalSystem]:
        return next((s for s in self.systems if s.id == system_id), None)

# Instancia global del simulador
simulator_instance = Simulator()