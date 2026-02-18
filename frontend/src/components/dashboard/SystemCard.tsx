import { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';
import type { NavalSystem, Sensor } from '../../types';
import { GlassCard, StatusBadge, NeonButton } from '../ui';
import { Zap, Activity, AlertTriangle, Power } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { t } from '../../utils/translations';

import { motion } from 'framer-motion';

interface SystemCardProps {
    system: NavalSystem;
    onInjectFault: (systemId: string) => void;
    onShutdownRelay: (systemId: string) => void;
}

export function SystemCard({ system, onInjectFault, onShutdownRelay }: SystemCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="h-full"
        >
            <GlassCard className="h-full relative overflow-hidden group hover:border-blue-400 dark:hover:border-neon-blue/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-cyber text-xl text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                            <Zap className="w-5 h-5 text-blue-600 dark:text-neon-blue" />
                            {t(system.name)}
                        </h3>
                        <div className="mt-2">
                            <StatusBadge status={system.relay.state} />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <NeonButton 
                            variant={system.relay.state === "OFF" ? "green" : "red"} 
                            className={`text-xs px-3 py-1 ${
                                system.relay.state === "OFF" 
                                    ? "bg-green-500/10 hover:bg-green-500/20 border-green-500/50 text-green-500 hover:text-green-400"
                                    : "bg-red-500/10 hover:bg-red-500/20 border-red-500/50 text-red-500 hover:text-red-400"
                            }`}
                            onClick={() => onShutdownRelay(system.id)}
                            title={system.relay.state === "OFF" ? "Encender Sistema" : "Apagar Sistema"}
                        >
                            <Power className="w-4 h-4" />
                        </NeonButton>
                        <NeonButton 
                            variant="red" 
                            className="text-xs px-3 py-1"
                            onClick={() => onInjectFault(system.id)}
                            title="Inyectar Fallo"
                        >
                            <AlertTriangle className="w-4 h-4" />
                        </NeonButton>
                    </div>
                </div>

                <div className="space-y-4">
                    {system.sensors.map(sensor => (
                        <SensorDisplay key={sensor.id} sensor={sensor} />
                    ))}
                </div>
                
                {/* Background decoration */}
                <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-neon-blue/5 rounded-full blur-3xl group-hover:bg-neon-blue/10 transition-all" />
            </GlassCard>
        </motion.div>
    );
}

function SensorDisplay({ sensor }: { sensor: Sensor }) {
    const { theme } = useTheme();
    
    // Use real history if available, otherwise fallback to current value
    const data = useMemo(() => {
        if (sensor.history && sensor.history.length > 0) {
            return sensor.history.map(h => ({
                time: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                value: h.value
            }));
        }
        // Fallback for initial state
        return [{ time: new Date().toLocaleTimeString(), value: sensor.value }];
    }, [sensor.history, sensor.value]);

    const tooltipStyle = theme === 'dark' 
        ? { backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #333', borderRadius: '4px' }
        : { backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb', borderRadius: '4px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

    const tooltipItemStyle = theme === 'dark'
        ? { color: '#00ff9d', fontSize: '10px', fontFamily: 'monospace' }
        : { color: '#059669', fontSize: '10px', fontFamily: 'monospace', fontWeight: 'bold' };

    return (
        <div className="bg-white dark:bg-black/20 p-3 rounded-lg border border-gray-200 dark:border-white/5 transition-colors shadow-sm dark:shadow-none">
            <div className="flex justify-between items-center mb-1">
                <span className="text-gray-600 dark:text-gray-400 text-sm flex items-center gap-1 transition-colors">
                    <Activity className="w-3 h-3" />
                    {t(sensor.type)}
                </span>
                <span className="font-mono text-green-700 dark:text-neon-green transition-colors font-bold">
                    {sensor.value.toFixed(2)} {sensor.unit}
                </span>
            </div>
            <div className="h-10 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={['auto', 'auto']} hide />
                        <Tooltip 
                            contentStyle={tooltipStyle}
                            itemStyle={tooltipItemStyle}
                            formatter={(value: number | undefined) => [value ? `${value.toFixed(2)} ${sensor.unit}` : 'N/A', 'Valor']}
                            labelStyle={{ color: theme === 'dark' ? '#ccc' : '#666', marginBottom: '0.25rem' }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={theme === 'dark' ? '#10b981' : '#059669'} 
                            strokeWidth={2} 
                            dot={{ r: 2, fill: theme === 'dark' ? '#10b981' : '#059669' }} 
                            activeDot={{ r: 4, stroke: theme === 'dark' ? '#10b981' : '#059669', strokeWidth: 2 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
