import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function NeonButton({ children, className, variant = 'blue', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'blue' | 'pink' | 'green' | 'red' | 'gray' }) {
  const variants = {
    blue: 'border-blue-600 text-blue-700 bg-white/50 hover:bg-blue-50 dark:bg-transparent dark:border-neon-blue dark:text-neon-blue dark:shadow-[0_0_10px_rgba(0,243,255,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,243,255,0.6)]',
    pink: 'border-pink-600 text-pink-700 bg-white/50 hover:bg-pink-50 dark:bg-transparent dark:border-neon-pink dark:text-neon-pink dark:shadow-[0_0_10px_rgba(255,0,255,0.3)] dark:hover:shadow-[0_0_20px_rgba(255,0,255,0.6)]',
    green: 'border-green-600 text-green-700 bg-white/50 hover:bg-green-50 dark:bg-transparent dark:border-neon-green dark:text-neon-green dark:shadow-[0_0_10px_rgba(0,255,157,0.3)] dark:hover:shadow-[0_0_20px_rgba(0,255,157,0.6)]',
    red: 'border-red-600 text-red-700 bg-white/50 hover:bg-red-50 dark:bg-transparent dark:border-red-500 dark:text-red-500 dark:shadow-[0_0_10px_rgba(239,68,68,0.3)] dark:hover:shadow-[0_0_20px_rgba(239,68,68,0.6)]',
    gray: 'border-gray-400 text-gray-700 bg-white/50 hover:bg-gray-50 dark:bg-transparent dark:text-gray-400 dark:border-gray-400',
  };

  return (
    <button
      className={cn(
        "relative px-6 py-2 border rounded transition-all duration-300 font-cyber uppercase tracking-wider",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "bg-white dark:bg-neon-surface/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm dark:shadow-xl text-gray-900 dark:text-white transition-colors duration-300",
      className
    )}>
      {children}
    </div>
  );
}

export function StatusBadge({ status }: { status: 'ON' | 'OFF' | 'TRIPPED' }) {
    const styles = {
        ON: "bg-green-100 text-green-700 border-green-200 dark:bg-neon-green/20 dark:text-neon-green dark:border-neon-green",
        OFF: "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400 dark:border-gray-500",
        TRIPPED: "bg-red-100 text-red-700 border-red-200 dark:bg-red-500/20 dark:text-red-500 dark:border-red-500 animate-pulse"
    };

    const labels = {
        ON: "ACTIVO",
        OFF: "INACTIVO",
        TRIPPED: "FALLO"
    };

    return (
        <span className={cn(
            "px-3 py-1 rounded-full text-xs font-mono border",
            styles[status]
        )}>
            {labels[status]}
        </span>
    );
}
