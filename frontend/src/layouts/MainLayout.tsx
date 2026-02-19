import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { 
  LayoutDashboard, 
  ShieldAlert, 
  Ship, 
  Settings, 
  Menu, 
  Search, 
  Bell,
  Radar
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = (props: { isOpen: boolean; toggleSidebar: () => void }) => {
  const { isOpen } = props;
  const location = useLocation();
  
  const navItems = [
    { name: 'Overview', path: '/', icon: LayoutDashboard },
    { name: 'Security Events', path: '/security', icon: ShieldAlert },
    { name: 'Naval Systems', path: '/naval', icon: Ship },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside 
      className={clsx(
        "fixed left-0 top-0 z-40 h-screen w-64 transform bg-card border-r border-border transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        !isOpen && "-translate-x-full"
      )}
    >
      <div className="flex h-16 items-center justify-center border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <Radar className="h-6 w-6 text-primary" />
          </motion.div>
          <h1 className="text-xl font-bold tracking-wider text-primary">
            NAVAL<span className="text-foreground">SEC</span>
          </h1>
        </div>
      </div>
      
      <nav className="mt-6 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={clsx(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200",
                isActive 
                  ? "bg-primary/10 text-primary translate-x-1" 
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground hover:translate-x-1"
              )}
            >
              <Icon className={clsx("mr-3 h-5 w-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

const Topbar = (props: { toggleSidebar: () => void }) => {
  const { toggleSidebar } = props;
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar} 
          className="lg:hidden p-2 text-muted-foreground hover:bg-secondary rounded-md"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md w-64 lg:w-96">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search alerts, logs, or IPs..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button className="relative p-2 text-muted-foreground hover:bg-secondary rounded-full">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive border-2 border-card"></span>
        </button>
        <div className="flex items-center gap-2 pl-4 border-l border-border">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
            AD
          </div>
          <div className="hidden md:block text-sm">
            <p className="font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">System Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

const MainLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default MainLayout;
