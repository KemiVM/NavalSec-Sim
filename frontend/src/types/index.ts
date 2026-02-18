export type RelayState = "ON" | "OFF" | "TRIPPED";

export interface Relay {
    id: string;
    state: RelayState;
}

export interface Sensor {
    id: string;
    type: "temperature" | "pressure" | "voltage" | "vibration" | "flow";
    value: number;
    unit: string;
    critical_min?: number;
    critical_max?: number;
    safe_min?: number;
    safe_max?: number;
    history?: { timestamp: string; value: number }[];
}

export interface NavalSystem {
    id: string;
    name: string;
    relay: Relay;
    sensors: Sensor[];
}

export interface SystemLog {
    id?: number;
    timestamp: string;
    system_id: string;
    system_name: string;
    relay_state: RelayState;
    sensor_data: string; // JSON string
    is_abnormal: boolean;
}

export interface RelayFaultRequest {
    system_id: string;
    duration: number;
}

export interface SensorAttackRequest {
    system_id: string;
    sensor_id: string;
    value: number;
    duration: number;
}
