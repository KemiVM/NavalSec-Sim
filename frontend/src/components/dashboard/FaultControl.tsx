import { GlassCard, NeonButton } from '../ui';
import { Skull, AlertOctagon } from 'lucide-react';
import { api } from '../../api/client';

export function FaultControl() {
    
    const triggerMassFailure = async () => {
        // En una implementación real, esto llamaría a un endpoint de "caos"
        // Por ahora, simulamos disparar a varios sistemas conocidos
        const systems = ['propulsion', 'hull', 'navigation'];
        systems.forEach(id => api.injectRelayFault({ system_id: id, duration: 10 }));
    };

    return (
        <GlassCard className="border-neon-pink/30 bg-neon-pink/5">
            <h3 className="font-cyber text-neon-pink flex items-center gap-2 mb-4">
                <Skull className="w-6 h-6" />
                CONTROL DE CAOS
            </h3>
            <div className="grid grid-cols-2 gap-4">
                <NeonButton variant="pink" onClick={triggerMassFailure} className="w-full flex items-center justify-center gap-2">
                    <AlertOctagon className="w-4 h-4" />
                    FALLO MASIVO
                </NeonButton>
            </div>
        </GlassCard>
    );
}
