import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'default' | 'primary' | 'destructive' | 'warning' | 'success';
  delay?: number;
}

const colorMap = {
  default: "text-foreground",
  primary: "text-primary",
  destructive: "text-destructive",
  warning: "text-yellow-500",
  success: "text-emerald-500",
};

const bgMap = {
  default: "bg-secondary",
  primary: "bg-primary/10",
  destructive: "bg-destructive/10",
  warning: "bg-yellow-500/10",
  success: "bg-emerald-500/10",
};

export const StatCard = ({ title, value, icon: Icon, trend, color = 'default', delay = 0 }: StatCardProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <div className={clsx("p-2 rounded-full", bgMap[color])}>
          <Icon className={clsx("h-4 w-4", colorMap[color])} />
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-tight">{value}</span>
          {trend && (
            <span className={clsx(
              "text-xs font-medium",
              trend.isPositive ? "text-emerald-500" : "text-destructive"
            )}>
              {trend.isPositive ? '+' : ''}{trend.value}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};
