import { Shield, Lock, AlertOctagon, FileText } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import PageTransition from '../components/ui/PageTransition';

const Security = () => {
    return (
        <PageTransition className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Security Events</h1>
                    <p className="text-muted-foreground">Real-time threat monitoring and analysis</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md shadow hover:bg-primary/90 transition-colors">
                        Generate Report
                    </button>
                    <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md shadow hover:bg-secondary/80 transition-colors">
                        Explore Agents
                    </button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Critical Threats"
                    value="3"
                    icon={AlertOctagon}
                    color="destructive"
                    trend={{ value: 50, isPositive: false }}
                    delay={0.1}
                />
                <StatCard
                    title="Auth Failures"
                    value="128"
                    icon={Lock}
                    color="warning"
                    trend={{ value: 12, isPositive: false }}
                    delay={0.2}
                />
                <StatCard
                    title="Active Agents"
                    value="4/4"
                    icon={Shield}
                    color="success"
                    delay={0.3}
                />
                <StatCard
                    title="Log Volume/hr"
                    value="2.4GB"
                    icon={FileText}
                    color="default"
                    trend={{ value: 5, isPositive: true }}
                    delay={0.4}
                />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">MITRE ATT&CK Matrix</h3>
                    <div className="flex items-center justify-center h-64 bg-secondary/30 rounded border border-dashed border-border border-2">
                        <span className="text-muted-foreground">Attack Matrix Visualization Placeholder</span>
                    </div>
                </div>

                <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
                    <h3 className="text-lg font-semibold mb-4">Top 5 Alert Groups</h3>
                    <div className="space-y-4">
                        {[
                            { name: 'Brute Force Attempt', count: 45, color: 'bg-red-500' },
                            { name: 'SSH Login Failure', count: 32, color: 'bg-orange-500' },
                            { name: 'Policy Violation', count: 28, color: 'bg-yellow-500' },
                            { name: 'Privilege Escalation', count: 15, color: 'bg-blue-500' },
                            { name: 'Malware Detected', count: 8, color: 'bg-purple-500' },
                        ].map((item) => (
                            <div key={item.name} className="flex items-center justify-between hover:bg-secondary/20 p-1 rounded cursor-default transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className="text-sm font-medium">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-muted-foreground">{item.count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

             <div className="p-6 bg-card rounded-lg border border-border shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Security Alerts</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-secondary text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 rounded-tl-lg">Timestamp</th>
                                <th className="px-4 py-3">Level</th>
                                <th className="px-4 py-3">Agent</th>
                                <th className="px-4 py-3">Description</th>
                                <th className="px-4 py-3 rounded-tr-lg">Rule ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <tr key={i} className="hover:bg-secondary/20 transition-colors cursor-pointer">
                                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">Oct 24, 10:42:15</td>
                                    <td className="px-4 py-3"><span className="px-2 py-1 rounded bg-destructive/20 text-destructive text-xs font-bold">12</span></td>
                                    <td className="px-4 py-3 font-medium">Main Server</td>
                                    <td className="px-4 py-3">Multiple authentication failures from source IP</td>
                                    <td className="px-4 py-3 text-primary">5710</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </PageTransition>
    );
};

export default Security;
