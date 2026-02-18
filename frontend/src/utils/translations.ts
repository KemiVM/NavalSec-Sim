export const translations: Record<string, string> = {
    // Systems (Fallbacks if backend sends English)
    "Propulsion": "Propulsión",
    "Hull": "Casco",
    "Navigation": "Navegación",
    "Communications": "Comunicaciones",
    "Life Support": "Soporte Vital",
    "Power": "Energía",
    
    // Sensor Types (Enum values)
    "TEMPERATURE": "Temperatura",
    "PRESSURE": "Presión",
    "VIBRATION": "Vibración",
    "RPM": "RPM",
    "VOLTAGE": "Voltaje",
    "CURRENT": "Corriente",
    "FREQUENCY": "Frecuencia",
    "HUMIDITY": "Humedad",
    "LEVEL": "Nivel",
    "FLOW": "Flujo",
    
    // Lowercase fallbacks just in case
    "temperature": "Temperatura",
    "pressure": "Presión",
    "vibration": "Vibración",
    "rpm": "RPM",
    "voltage": "Voltaje",
    "current": "Corriente",
    "frequency": "Frecuencia",
    "unit": "Unidad",
    
    // Default fallback
    "Unknown": "Desconocido"
};

export function t(key: string): string {
    return translations[key] || key;
}
