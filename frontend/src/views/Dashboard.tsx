import { useEffect, useState, useRef } from 'react';
import type { NavalSystem, SystemLog } from '../types';
import { api } from '../api/client';
import { SystemCard } from '../components/dashboard/SystemCard';
import { ValueInjector } from '../components/dashboard/ValueInjector';
import { LogViewer } from '../components/LogViewer';
import { GlassCard } from '../components/ui';
import { ThemeToggle } from '../components/ThemeToggle';
import { Activity, Terminal, ExternalLink, AlertTriangle, CheckCircle, Power } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { t } from '../utils/translations';

export default function Dashboard() {
    const [systems, setSystems] = useState<NavalSystem[]>([]);
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLogViewerOpen, setIsLogViewerOpen] = useState(false);
    
    // Track previous states to trigger alerts only on change
    const systemStates = useRef<Record<string, string>>({});
    

    const formatTime = (isoString: string) => {
        const date = new Date(isoString);
        // Ensure we are interpreting the string as UTC if it lacks the 'Z'
        if (!isoString.endsWith('Z')) {
            // If backend sends "2023-01-01T10:00:00", treat it as UTC
            const utcDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
            return utcDate.toLocaleTimeString();
        }
        return date.toLocaleTimeString();
    };

    const fetchData = async () => {
        try {
            const [systemsData, logsData] = await Promise.all([
                api.getSystems(),
                // Fetch for sidebar history
                api.getLogs(50, true) 
            ]);
            setSystems(prevSystems => {
                const now = new Date().toISOString();
                
                return systemsData.map(newSystem => {
                    const prevSystem = prevSystems.find(s => s.id === newSystem.id);
                    
                    const sensorsWithHistory = newSystem.sensors.map(newSensor => {
                        const prevSensor = prevSystem?.sensors.find(s => s.id === newSensor.id);
                        const prevHistory = prevSensor?.history || [];
                        
                        // Keep last 20 points
                        const newHistory = [
                            ...prevHistory, 
                            { timestamp: now, value: newSensor.value }
                        ].slice(-20);
                        
                        return { ...newSensor, history: newHistory };
                    });

                    return { ...newSystem, sensors: sensorsWithHistory };
                });
            });
            
            // Check for state transitions to trigger alerts
            systemsData.forEach(system => {
                let currentState: "NORMAL" | "WARNING" | "TRIPPED" = "NORMAL";
                let problematicSensor: typeof system.sensors[0] | undefined;

                if (system.relay.state === "TRIPPED") {
                    currentState = "TRIPPED";
                    // Find the sensor that likely caused the trip (critical range)
                    problematicSensor = system.sensors.find(s => 
                        (s.critical_max !== undefined && s.value > s.critical_max) || 
                        (s.critical_min !== undefined && s.value < s.critical_min)
                    );
                } else {
                    // Check for Warning (Safe range but not Critical)
                    problematicSensor = system.sensors.find(s => 
                        (s.safe_max !== undefined && s.value > s.safe_max) || 
                        (s.safe_min !== undefined && s.value < s.safe_min)
                    );
                    if (problematicSensor) currentState = "WARNING";
                }

                const previousState = systemStates.current[system.id] || "NORMAL";

                // State Transition Logic
                if (currentState !== previousState) {
                    
                    // Helper for sensor text
                    const sensorText = problematicSensor 
                        ? `${t(problematicSensor.type)}: ${problematicSensor.value.toFixed(1)} ${problematicSensor.unit}`
                        : "Revisar sensores";

                    // 1. TRIPPED Alert
                    if (currentState === "TRIPPED") {
                        toast.error(`¡FALLO EN ${t(system.name).toUpperCase()}!`, {
                            description: `Relé disparado por seguridad. ${sensorText}`,
                            icon: <AlertTriangle className="w-5 h-5" />,
                            duration: 5000,
                        });
                    }
                    
                    // 2. WARNING Alert
                    else if (currentState === "WARNING" && previousState === "NORMAL") {
                        toast.warning(`Advertencia: ${t(system.name)}`, {
                            description: `Niveles cercanos al límite crítico. ${sensorText}`,
                            icon: <AlertTriangle className="w-5 h-5" />,
                            duration: 4000,
                        });
                    }
                    
                    // 3. RECOVERY Alert
                    else if (currentState === "NORMAL" && previousState === "TRIPPED") {
                        toast.success(`Sistema Recuperado: ${t(system.name)}`, {
                            description: "Parámetros estabilizados y funcionamiento normal.",
                            icon: <CheckCircle className="w-5 h-5" />,
                            duration: 4000,
                        });
                    }

                    // Update tracker
                    systemStates.current[system.id] = currentState;
                }
            });

            setLogs(logsData.filter(log => log.relay_state === "TRIPPED").slice(0, 20));
            setError(null);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Error conectando con los sistemas del barco. Reintentando...");
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, []);

    const handleInjectFault = async (systemId: string) => {
        try {
            await api.injectRelayFault({ system_id: systemId, duration: 5 });
            fetchData();
        } catch (error) {
            console.error("Error injecting fault:", error);
        }
    };

    const handleShutdownRelay = async (systemId: string) => {
        try {
            const system = systems.find(s => s.id === systemId);
            if (!system) return;

            const newState = system.relay.state === "OFF" ? "ON" : "OFF";
            await api.setRelayState(systemId, newState); 
            
            if (newState === "OFF") {
                toast.info(`${t(system.name)}: Sistema Desactivado Manualmente`, {
                    icon: <Power className="w-5 h-5 text-gray-400" />
                });
            } else {
                toast.success(`${t(system.name)}: Sistema Activado Manualmente`, {
                    icon: <Power className="w-5 h-5 text-green-500" />
                });
            }
            
            fetchData();
        } catch (error) {
            console.error("Error toggling relay:", error);
            toast.error("Error al cambiar estado del relé");
        }
    };

    return (
        <div className="p-6 space-y-6 min-h-screen bg-gray-100 dark:bg-[#050510] transition-colors duration-300">
            <Toaster richColors position="top-right" theme="system" />
            <header className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    {/* Logo / Ship Hologram */}
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                        <img 
                            src="/Logotipo%20barco.png" 
                            alt="Ship Logo" 
                            className="relative z-10 w-full h-full object-contain drop-shadow-[0_0_15px_rgba(0,149,255,0.5)]"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full text-6xl">🚢</div>';
                            }}
                        />
                    </div>
                    <div>
                        <h1 className="text-5xl font-cyber text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-pink-600 dark:from-neon-blue dark:to-neon-pink transition-all">
                            Ship SIM v3.0
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mt-1">
                            INTERFAZ DE MONITORIZACIÓN DE INTEGRIDAD
                        </p>
                    </div>
                </div>
                <div className="flex gap-4 items-center">
                    <ThemeToggle />
                    <div className="text-right border-l border-gray-300 dark:border-gray-700 pl-4">
                        <div className="text-xs text-gray-500 font-mono">HORA DEL SISTEMA</div>
                        <div className="font-mono text-blue-600 dark:text-neon-blue text-xl">
                            {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>
            </header>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-lg mb-6 font-mono animate-pulse">
                    ⚠️ {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Systems Grid */}
                <div className="lg:col-span-3 space-y-6">
                    <section>
                        <h2 className="text-xl font-cyber text-gray-800 dark:text-white mb-4 flex items-center gap-2 transition-colors">
                            <Activity className="w-5 h-5 text-green-600 dark:text-neon-green" />
                            SISTEMAS ACTIVOS
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {systems.map(system => (
                                <SystemCard 
                                    key={system.id} 
                                    system={system} 
                                    onInjectFault={handleInjectFault}
                                    onShutdownRelay={handleShutdownRelay}
                                />
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar Controls & Logs */}
                <div className="space-y-6">
                    <ValueInjector />

                    <GlassCard className="h-[500px] flex flex-col">
                        <div className="flex flex-col gap-2 mb-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-cyber text-gray-800 dark:text-white flex items-center gap-2 transition-colors">
                                    <Terminal className="w-5 h-5 text-blue-600 dark:text-neon-blue" />
                                    Historial de Fallos
                                </h2>
                                <button 
                                    onClick={() => setIsLogViewerOpen(true)}
                                    className="text-xs text-blue-500 hover:text-blue-400 dark:text-neon-blue dark:hover:text-neon-blue/80 flex items-center gap-1 transition-colors"
                                >
                                    VER TODO <ExternalLink className="w-3 h-3" />
                                </button>
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                                Mostrando alertas recientes.
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-2 custom-scrollbar">
                            {logs.length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    Sin alertas activas
                                </div>
                            ) : (
                                logs.map(log => (
                                    <div key={log.id} className="p-2 border-b border-gray-200 dark:border-white/5 last:border-0 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-gray-500 dark:text-gray-400">
                                                {formatTime(log.timestamp.toString())}
                                            </span>
                                            <span className="text-red-500 dark:text-neon-pink">
                                                {log.relay_state}
                                            </span>
                                        </div>
                                        <div className="font-semibold text-gray-800 dark:text-white mb-1">
                                            {t(log.system_name)}
                                            {log.sensor_data && (
                                                <span className="block font-normal text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    {(() => {
                                                        try {
                                                            const data = JSON.parse(log.sensor_data);
                                                            if (Array.isArray(data)) {
                                                                return data.map((s: any) => `${t(s.type || '')}: ${typeof s.value === 'number' ? s.value.toFixed(2) : s.value} ${s.unit || ''}`).join(', ');
                                                            } else if (typeof data === 'object' && data !== null) {
                                                                if ('value' in data && 'unit' in data) return `${Number(data.value).toFixed(2)} ${data.unit}`;
                                                                return Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(', ');
                                                            }
                                                            return log.sensor_data;
                                                        } catch { return log.sensor_data; }
                                                    })()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </GlassCard>
                </div>
            </div>
            
            <LogViewer isOpen={isLogViewerOpen} onClose={() => setIsLogViewerOpen(false)} />
        </div>
    );
}
