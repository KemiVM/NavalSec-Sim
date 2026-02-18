import { useState, useEffect } from 'react';
import { X, Search, FileText } from 'lucide-react';
import { api } from '../api/client';
import type { SystemLog } from '../types';
import { t } from '../utils/translations';

interface LogViewerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LogViewer({ isOpen, onClose }: LogViewerProps) {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchLogs();
        }
    }, [isOpen, searchTerm]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            // Get all logs (abnormalOnly = false)
            const data = await api.getLogs(100, false, searchTerm);
            setLogs(data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        if (!isoString.endsWith('Z')) {
            const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
            return utcDate.toLocaleString();
        }
        return date.toLocaleString();
    };

    const formatSensorData = (jsonString: string) => {
        try {
            const data = JSON.parse(jsonString);
            if (Array.isArray(data)) {
                return data.map((sensor: any) => {
                    const type = t(sensor.type || '');
                    const value = typeof sensor.value === 'number' ? sensor.value.toFixed(2) : sensor.value;
                    const unit = sensor.unit || '';
                    return `${type}: ${value} ${unit}`;
                }).join(', ');
            } else if (typeof data === 'object' && data !== null) {
                // Handle case where it might be a single object
                return Object.entries(data).map(([key, value]) => {
                     // Try to humanize keys if possible, or just use values if it fits the schema
                     if (key === 'value' && 'unit' in data) return `${Number(value).toFixed(2)} ${data.unit}`;
                     return `${key}: ${value}`;
                }).join(', ');
            }
            return jsonString;
        } catch (e) {
            return jsonString;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-[#0a0a1a] border border-gray-200 dark:border-neon-blue/30 rounded-xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden transition-colors duration-300">
                
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
                    <h2 className="text-xl font-cyber text-gray-800 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600 dark:text-neon-blue" />
                        REGISTRO COMPLETO DEL SISTEMA
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-neon-pink transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-transparent">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar en todos los registros..." 
                            className="w-full bg-gray-100 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-neon-blue transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-0">
                    <table className="w-full text-left text-sm font-mono">
                        <thead className="bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 sticky top-0">
                            <tr>
                                <th className="p-3">HORA</th>
                                <th className="p-3">SISTEMA</th>
                                <th className="p-3">ESTADO</th>
                                <th className="p-3">DATOS SENSOR</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-white/5">
                            {logs.map(log => (
                                <tr key={log.id} className="hover:bg-blue-50 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5">
                                    <td className="p-3 text-gray-700 dark:text-gray-400 whitespace-nowrap font-medium">
                                        {formatTime(log.timestamp.toString())}
                                    </td>
                                    <td className="p-3 font-bold text-gray-900 dark:text-white">
                                        {log.system_name}
                                    </td>
                                    <td className="p-3">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                            log.relay_state === 'TRIPPED' 
                                            ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-500 dark:border-red-500' 
                                            : log.relay_state === 'ON'
                                            ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/20 dark:text-neon-green dark:border-neon-green'
                                            : 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500'
                                        }`}>
                                            {log.relay_state}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-700 dark:text-gray-300">
                                        {formatSensorData(log.sensor_data)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-500">No se encontraron registros.</div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-3 border-t border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-xs text-center text-gray-500">
                    Mostrando últimos 100 registros
                </div>
            </div>
        </div>
    );
}
