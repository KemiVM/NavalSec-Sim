import { useState, useEffect } from 'react';
import { GlassCard, NeonButton } from '../ui';
import { Syringe, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../../api/client';
import type { NavalSystem } from '../../types';
import { t } from '../../utils/translations';

export function ValueInjector() {
    const [systems, setSystems] = useState<NavalSystem[]>([]);
    const [selectedSystem, setSelectedSystem] = useState<string>('');
    const [selectedSensor, setSelectedSensor] = useState<string>('');
    const [value, setValue] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        api.getSystems().then(setSystems).catch(console.error);
    }, []);

    const handleInject = async () => {
        if (!selectedSystem || !selectedSensor || !value) return;

        setLoading(true);
        try {
            await api.setSensorValue(selectedSystem, selectedSensor, parseFloat(value));
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
            setValue('');
        } catch (error) {
            console.error("Error injecting value:", error);
        } finally {
            setLoading(false);
        }
    };

    const currentSystem = systems.find(s => s.id === selectedSystem);

    return (
        <GlassCard className="border-pink-200 bg-pink-50/50 dark:border-neon-pink/30 dark:bg-neon-pink/5 p-4">
            <h3 className="font-cyber text-pink-600 dark:text-neon-pink flex items-center gap-2 mb-4">
                <Syringe className="w-5 h-5" />
                INYECTOR DE ANOMALÍAS
            </h3>
            
            <div className="space-y-4">
                {/* System Selector */}
                <div>
                    <label className="block text-xs font-mono text-gray-600 dark:text-gray-400 mb-1">SISTEMA</label>
                    <select 
                        className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-neon-pink/30 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 dark:focus:border-neon-pink transition-colors"
                        value={selectedSystem}
                        onChange={e => {
                            setSelectedSystem(e.target.value);
                            setSelectedSensor('');
                        }}
                    >
                        <option value="" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">Seleccionar sistema...</option>
                        {systems.map(s => (
                            <option key={s.id} value={s.id} className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">{t(s.name)}</option>
                        ))}
                    </select>
                </div>

                {/* Sensor Selector */}
                <div>
                    <label className="block text-xs font-mono text-gray-600 dark:text-gray-400 mb-1">SENSOR</label>
                    <select 
                        className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-neon-pink/30 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 dark:focus:border-neon-pink transition-colors"
                        value={selectedSensor}
                        onChange={e => setSelectedSensor(e.target.value)}
                        disabled={!selectedSystem}
                    >
                        <option value="" className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">Seleccionar sensor...</option>
                        {currentSystem?.sensors.map(s => (
                            <option key={s.id} value={s.id} className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">{t(s.type)} ({s.unit})</option>
                        ))}
                    </select>
                </div>

                {/* Value Input */}
                <div>
                    <label className="block text-xs font-mono text-gray-600 dark:text-gray-400 mb-1">VALOR ANORMAL</label>
                    <input 
                        type="number" 
                        className="w-full bg-white dark:bg-black/20 border border-gray-300 dark:border-neon-pink/30 rounded px-2 py-1 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-pink-500 dark:focus:border-neon-pink placeholder-gray-400 dark:placeholder-gray-600 transition-colors"
                        placeholder="Ej: 150.5"
                        value={value}
                        onChange={e => setValue(e.target.value)}
                        disabled={!selectedSensor}
                    />
                </div>

                <NeonButton 
                    variant="pink" 
                    onClick={handleInject} 
                    disabled={loading || !selectedSystem || !selectedSensor || !value}
                    className="w-full flex items-center justify-center gap-2 mt-2"
                >
                    {success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    {success ? "INYECTADO" : "INYECTAR"}
                </NeonButton>
            </div>
        </GlassCard>
    );
}
