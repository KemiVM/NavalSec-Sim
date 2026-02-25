
export interface SensorData {
  id: string;
  type: string;
  value: number;
  unit: string;
  [key: string]: unknown;
}

const SENSOR_NAMES: Record<string, string> = {
  // Motores y Propulsión
  "sens_eng_temp": "Temperatura del Motor",
  "sens_eng_rpm": "Revoluciones del Motor (RPM)",
  "sys_main_engine": "Motor Principal",
  
  // Generación y Eléctrico
  "sens_gen_volt": "Voltaje del Generador",
  "sens_gen_curr": "Corriente del Generador",
  "sys_power_gen": "Generador de Potencia",
  
  // Auxiliares
  "sens_bilge_curr": "Corriente Bomba de Achique",
  "sys_bilge_pump": "Bomba de Achique",
  
  // Navegación
  "sens_radar_temp": "Temperatura del Radar",
  "sys_radar": "Sistema de Radar",
  
  // Gobierno
  "sens_steer_volt": "Voltaje del Timón",
  "sys_steering": "Sistema de Gobierno",
  
  // Contraincendios
  "sens_fire_temp": "Sensor Tº Incendios",
  "sys_fire_alarm": "Alarma Contraincendios",

  // Armas/Combate
  "sens_weapon_temp": "Temperatura Sistema CMS",
  "sys_weapons": "Sistema de Combate CMS",

  // Otros genéricos (Fallback partials)
  "temp": "Temperatura",
  "rpm": "RPM",
  "volt": "Voltaje",
  "curr": "Corriente",
};

export function getSensorName(id: string): string {
  return SENSOR_NAMES[id] || id;
}

export function parseSensorData(jsonString: string): SensorData[] {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data)) {
      return data;
    } else if (typeof data === 'object' && data !== null) {
      // Handle legacy/fallback case where it might be a simple key-value object
      return Object.entries(data).map(([key, value]) => ({
        id: key,
        type: 'UNKNOWN',
        value: Number(value),
        unit: '', // Unknown unit in legacy format
      }));
    }
    return [];
  } catch (e) {
    console.warn("Failed to parse sensor data:", e);
    return [];
  }
}

export function formatSensorReading(sensor: SensorData): string {
  const name = getSensorName(sensor.id);
  // Ensure value is a number and format it
  const val = typeof sensor.value === 'number' ? sensor.value.toFixed(2) : sensor.value;
  return `${name}: ${val} ${sensor.unit}`;
}
