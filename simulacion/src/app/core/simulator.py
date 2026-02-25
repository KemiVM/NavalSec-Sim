import random
import asyncio
import math
from typing import List, Optional
from app.models import NavalSystem, Relay, Sensor, RelayState, SensorType

class Simulator:
    def __init__(self):
        self.systems: List[NavalSystem] = self._initialize_systems()
        self.running = False
        # Configuración dinámica
        self.config = {
            "valid_ips": ["127.0.0.1", "localhost", "::1", "172.18.0.1"],
            "log_interval": 20, # segundos
            "simulation_sleep": 1.0 # segundos (delay del loop)
        }

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
                           safe_min=200, safe_max=240, critical_min=180, critical_max=250),
                    Sensor(id="sens_gen_curr", type=SensorType.CURRENT, value=45.0, unit="A", 
                           min_val=0, max_val=150, drift=2.0,
                           safe_min=0, safe_max=100, critical_min=-1, critical_max=120)
                ]
            ),

            # 3. Bomba de Achique (Sentina)
            NavalSystem(
                id="sys_bilge_pump", name="Bomba de Achique",
                relay=Relay(id="rel_bilge", state=RelayState.ON),
                sensors=[
                    Sensor(id="sens_bilge_curr", type=SensorType.CURRENT, value=12.5, unit="A", 
                           min_val=0, max_val=50, drift=2.5,
                           safe_min=5, safe_max=35, critical_min=-1, critical_max=45)
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
                           safe_min=20, safe_max=30, critical_min=15, critical_max=35)
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
                         if sensor.safe_min and sensor.safe_max:
                             sensor.value = (sensor.safe_min + sensor.safe_max) / 2
                else:
                    # During TRIPPED, stopping simulation (freezing values)
                    # The user requested: "La simulación ... debería detenerse hasta que vuelva a estar ON"
                    # So we just continue, effectively keeping the last values.
                    continue

            # 2. ACTUALIZACIÓN NORMAL Y DETECCIÓN DE FALLOS
            # Usamos comparación robusta con .value para asegurar que comparamos strings
            # RelayState puede ser un Enum, así que .value nos da "ON" o "OFF"
            state_str = system.relay.state.value if hasattr(system.relay.state, "value") else str(system.relay.state)
            
            is_active = state_str == "ON"
            is_off = state_str == "OFF"
            
            for sensor in system.sensors:
                if is_off:
                    # Si el sistema está APAGADO (OFF), los valores decaen RÁPIDAMENTE
                    if sensor.type == SensorType.TEMPERATURE:
                        # Decaer hacia temperatura ambiente (e.g., 20.0) más rápido
                        diff = sensor.value - 20.0
                        sensor.value = max(20.0, sensor.value - (diff * 0.2)) # Decaer un 20% de la diferencia por ciclo
                    else:
                        # Otros sensores (RPM, Voltaje, etc.) decaen a 0 más rápido
                        sensor.value = max(0.0, sensor.value * 0.5) # Decaer un 50% por ciclo
                    
                    sensor.value = round(sensor.value, 2)
                    # Eliminamos el continue para que no salte al siguiente sensor sin pasar por abajo
                    # pero abajo hay lógica de 'is_active', así que usamos continue aquí para saltar solo esa parte
                    continue 
                elif not is_active: 
                     # TRIPPED u otro estado no activo que no sea OFF explícito
                     pass 

                # Variación aleatoria normal solo si está ON
                if is_active:
                    # Lógica de ARRANQUE/RECUPERACIÓN
                    # Si el valor está muy por debajo del mínimo seguro, subirlo rápidamente
                    if sensor.safe_min and sensor.value < sensor.safe_min:
                         # Subir un 20% de la diferencia hacia el safe_min
                         diff = sensor.safe_min - sensor.value
                         # Asegurar un incremento mínimo para evitar atascarse en asintotas
                         increment = max(diff * 0.2, sensor.max_val * 0.05)
                         new_value = sensor.value + increment
                    else:
                        if sensor.safe_min and sensor.safe_max:
                            if sensor.type == SensorType.TEMPERATURE:
                                # Thermal inertia (Newton's law of cooling/heating)
                                median = (sensor.safe_max + sensor.safe_min) / 2
                                # Target moves slowly using sine wave
                                target = median + math.sin(current_time * 0.1 + hash(sensor.id)) * (sensor.safe_max - sensor.safe_min) * 0.3
                                # Move towards target slowly (inertia)
                                diff = target - sensor.value
                                change = diff * 0.05 + random.uniform(-sensor.drift * 0.2, sensor.drift * 0.2)
                                new_value = sensor.value + change
                            else:
                                # Voltage/Current/RPM
                                # Use sine wave for mechanical/electrical oscillations + noise
                                median = (sensor.safe_max + sensor.safe_min) / 2
                                amplitude = (sensor.safe_max - sensor.safe_min) * 0.2
                                wave = math.sin(current_time * 0.5 + hash(sensor.id)) * amplitude
                                noise = random.uniform(-sensor.drift * 0.5, sensor.drift * 0.5)
                                
                                # Small drift pushing it slowly out of bounds for the "tension" requested by user
                                tension = math.sin(current_time * 0.01 + hash(sensor.id)) * amplitude * 1.5
                                target = median + wave + noise + tension
                                
                                # Smoothly transition towards the dynamic target to allow spoofed values to persist
                                diff = target - sensor.value
                                change = diff * 0.2 + random.uniform(-sensor.drift * 0.1, sensor.drift * 0.1)
                                new_value = sensor.value + change
                        else:
                            # Fallback if safe bounds are missing
                            change = random.uniform(-sensor.drift, sensor.drift)
                            new_value = sensor.value + change

                    # Respetar límites físicos simulados
                    new_value = max(sensor.min_val, min(new_value, sensor.max_val))

                    # 3. COMPORTAMIENTO AUTOMÁTICO DE ADVERTENCIAS (TERMOSTATO / SOBRECARGA)
                    # Si el sensor entra en zona de advertencia (cerca de los límites seguros), reaccionar.
                    if sensor.safe_max and sensor.safe_min:
                        range_span = sensor.safe_max - sensor.safe_min
                        warning_high = sensor.safe_max - (range_span * 0.1) # 10% from the top limit
                        warning_low = sensor.safe_min + (range_span * 0.1)  # 10% from the bottom limit
                        
                        is_warning_high = new_value >= warning_high
                        is_warning_low = new_value <= warning_low

                        if is_warning_high or is_warning_low:
                            # % de probabilidad: 98% de corrección segura (50-60% del rango seguro), 2% de escalar a crítico
                            if random.random() < 0.02:
                                # 2% FATAL: Escalar dramáticamente hacia/sobre el crítico (TRIPPED chance)
                                if is_warning_high:
                                    jump = (sensor.critical_max - new_value) * random.uniform(0.9, 1.2)
                                    new_value += jump
                                else:
                                    jump = (new_value - sensor.critical_min) * random.uniform(0.9, 1.2)
                                    new_value -= jump
                            else:
                                # 98% CORRECCIÓN: Bajar o subir a un valor entre 40% y 60% del rango útil
                                target_min = sensor.safe_min + (range_span * 0.40)
                                target_max = sensor.safe_min + (range_span * 0.60)
                                # Smoothing jump - instead of jumping completely, smoothly transition
                                target_value = random.uniform(target_min, target_max)
                                new_value = new_value + (target_value - new_value) * 0.3
                                
                            # Re-aplicar límites por si el salto crítico lo saca de banda física
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