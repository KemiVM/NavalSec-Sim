import axios from 'axios';
import type { NavalSystem, SystemLog, RelayFaultRequest, SensorAttackRequest } from '../types';

// En desarrollo (Vite) usamos el proxy, en prod la URL directa si es necesario
const API_BASE_URL = '/api'; 

const client = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const api = {
    // Systems
    getSystems: async (): Promise<NavalSystem[]> => {
        const response = await client.get('/systems/');
        return response.data as NavalSystem[];
    },

    getSystem: async (id: string): Promise<NavalSystem> => {
        const response = await client.get<NavalSystem>(`/systems/${id}`);
        return response.data;
    },

    // Logs
    getLogs: async (limit: number = 50, abnormalOnly: boolean = false, search?: string): Promise<SystemLog[]> => {
        const response = await client.get<SystemLog[]>('/logs/', {
            params: { limit, abnormal_only: abnormalOnly, search }
        });
        return response.data;
    },

    // Attacks (Fault Injection)
    injectRelayFault: async (data: RelayFaultRequest): Promise<void> => {
        await client.post('/attacks/relay', data);
    },

    injectSensorAttack: async (data: SensorAttackRequest): Promise<void> => {
        await client.post('/attacks/sensor', data);
    },

    // Manual Override
    setSensorValue: async (systemId: string, sensorId: string, value: number): Promise<void> => {
        await client.put(`/systems/${systemId}/sensors/${sensorId}?value=${value}`);
    },

    setRelayState: async (systemId: string, state: "ON" | "OFF" | "TRIPPED"): Promise<void> => {
        await client.put(`/systems/${systemId}/relay?state=${state}`);
    }
};
