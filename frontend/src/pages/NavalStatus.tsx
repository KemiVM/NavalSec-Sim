import { Gauge, Ship, Anchor, Wind, Thermometer, Droplets } from 'lucide-react';
import PageTransition from '../components/ui/PageTransition';

const NavalStatus = () => {
    return (
        <PageTransition className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Naval Systems Status</h1>
            
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Engine Status */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Ship className="h-5 w-5 text-primary" />
                                Main Engine
                            </h3>
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-500 text-xs font-bold rounded">OPERATIONAL</span>
                        </div>
                        
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Gauge className="h-4 w-4" />
                                    <span className="text-sm">RPM</span>
                                </div>
                                <span className="text-2xl font-bold">1,250</span>
                            </div>
                            <div className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Thermometer className="h-4 w-4" />
                                    <span className="text-sm">Temperature</span>
                                </div>
                                <span className="text-2xl font-bold">82°C</span>
                            </div>
                            <div className="p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                                    <Droplets className="h-4 w-4" />
                                    <span className="text-sm">Oil Pressure</span>
                                </div>
                                <span className="text-2xl font-bold">4.2 Bar</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
                         <h3 className="text-lg font-semibold mb-4">Historical Performance</h3>
                         <div className="h-48 bg-secondary/30 rounded flex items-center justify-center border border-dashed border-border text-muted-foreground">
                            Engine Performance Graph Placeholder
                         </div>
                    </div>
                </div>

                {/* Navigation & Environmental */}
                <div className="space-y-6">
                    <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Anchor className="h-5 w-5 text-primary" />
                            Navigation
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-border hover:bg-secondary/10 px-2 rounded -mx-2 transition-colors">
                                <span className="text-muted-foreground">Speed</span>
                                <span className="font-bold">18.5 kn</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-border hover:bg-secondary/10 px-2 rounded -mx-2 transition-colors">
                                <span className="text-muted-foreground">Heading</span>
                                <span className="font-bold">245° SW</span>
                            </div>
                             <div className="flex justify-between items-center pb-2 border-b border-border hover:bg-secondary/10 px-2 rounded -mx-2 transition-colors">
                                <span className="text-muted-foreground">Depth</span>
                                <span className="font-bold">428 m</span>
                            </div>
                            <div className="flex justify-between items-center hover:bg-secondary/10 px-2 rounded -mx-2 transition-colors">
                                <span className="text-muted-foreground">Latitude</span>
                                <span className="font-mono text-xs">36° 12' 42" N</span>
                            </div>
                             <div className="flex justify-between items-center hover:bg-secondary/10 px-2 rounded -mx-2 transition-colors">
                                <span className="text-muted-foreground">Longitude</span>
                                <span className="font-mono text-xs">004° 25' 18" W</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Wind className="h-5 w-5 text-primary" />
                            Environmental
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-secondary/20 rounded hover:bg-secondary/30 transition-colors">
                                <span className="block text-2xl font-bold">12</span>
                                <span className="text-xs text-muted-foreground">Wind (kn)</span>
                            </div>
                             <div className="text-center p-3 bg-secondary/20 rounded hover:bg-secondary/30 transition-colors">
                                <span className="block text-2xl font-bold">1.5</span>
                                <span className="text-xs text-muted-foreground">Swell (m)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};

export default NavalStatus;
