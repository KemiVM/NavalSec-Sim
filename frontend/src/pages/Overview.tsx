import { Activity, AlertTriangle, Shield, Signal } from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import PageTransition from '../components/ui/PageTransition';

const Overview = () => {
  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">System Overview</h1>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 hover:animate-ping"></span>
          <span className="text-sm text-muted-foreground">System Operational</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Alerts" 
          value="1,284" 
          icon={AlertTriangle} 
          trend={{ value: 12, isPositive: false }}
          color="destructive"
          delay={0.1}
        />
        <StatCard 
          title="Security Events" 
          value="42" 
          icon={Shield} 
          trend={{ value: 2, isPositive: true }}
          color="primary"
          delay={0.2}
        />
        <StatCard 
          title="System Load" 
          value="64%" 
          icon={Activity} 
          color="warning"
          delay={0.3}
        />
        <StatCard 
          title="Active Sensors" 
          value="15/16" 
          icon={Signal} 
          color="success"
          delay={0.4}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4 rounded-lg border border-border bg-card shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold">Event Volume</h3>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-secondary/20 mt-4 rounded border border-dashed border-border">
              Chart Placeholder (Recharts)
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3 rounded-lg border border-border bg-card shadow-sm">
          <div className="p-6">
            <h3 className="font-semibold">Recent Alerts</h3>
            <div className="mt-4 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0 hover:bg-secondary/30 p-2 rounded transition-colors cursor-default">
                  <div className="h-2 w-2 mt-2 rounded-full bg-destructive" />
                  <div>
                    <p className="text-sm font-medium">Unauthorized access attempt detected</p>
                    <p className="text-xs text-muted-foreground">2 minutes ago • Module: Auth</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Overview;
