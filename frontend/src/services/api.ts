import axios from 'axios';
import type { NavalSystem, SystemLog } from '@/types/api';

const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
});

export const SimulationService = {
  getSystems: async () => {
    const response = await api.get<NavalSystem[]>('/api/systems/');
    return response.data;
  },
  getSystem: async (id: string) => {
    const response = await api.get<NavalSystem>(`/api/systems/${id}`);
    return response.data;
  },
  toggleRelay: async (systemId: string, state: "ON" | "OFF" | "TRIPPED") => {
    const response = await api.put(`/api/systems/${systemId}/relay`, null, {
        params: { state }
    });
    return response.data;
  },
  setSensorValue: async (systemId: string, sensorId: string, value: number) => {
    const response = await api.put(`/api/systems/${systemId}/sensors/${sensorId}`, null, {
        params: { value }
    });
    return response.data;
  },
  getConfig: async () => {
    const response = await api.get('/api/systems/config');
    return response.data;
  },
  updateConfig: async (updates: any) => {
    const response = await api.patch('/api/systems/config', updates);
    return response.data;
  },
};

export const FaultsService = {
  injectRelayFault: async (systemId: string, duration: number, simulatedIp?: string) => {
    const response = await api.post('/api/attacks/relay', { 
      system_id: systemId, 
      duration,
      simulated_ip: simulatedIp 
    });
    return response.data;
  },
  injectSensorAttack: async (systemId: string, sensorId: string, value: number, duration: number, simulatedIp?: string) => {
    const response = await api.post('/api/attacks/sensor', { 
        system_id: systemId, 
        sensor_id: sensorId, 
        value, 
        duration,
        simulated_ip: simulatedIp
    });
    return response.data;
  }
};

export const DataService = {
  getLogs: async (limit: number = 50, abnormalOnly: boolean = false, search?: string) => {
    const response = await api.get<SystemLog[]>('/api/logs/', {
      params: { limit, abnormal_only: abnormalOnly, search }
    });
    return response.data;
  }
};
