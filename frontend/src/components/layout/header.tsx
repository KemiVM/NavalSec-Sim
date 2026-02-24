import { useState, useRef, useEffect } from "react"
import { Bell, Search, Menu, CheckCircle, Info, AlertTriangle, AlertCircle, X, Sun, Moon, User as UserIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useNotifications, type AppNotification } from "@/contexts/NotificationContext"
import { cn } from "@/lib/utils"
import { useTheme } from "@/contexts/ThemeContext"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"

export function Header() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, clearNotifications } = useNotifications()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()
  const { user } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
        case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
        case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
        case 'error': return <AlertCircle className="h-4 w-4 text-destructive" />
        default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-md shadow-sm">
      <Button variant="ghost" size="icon" className="md:hidden">
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex-1">
        <div className="relative max-w-md hidden md:block group">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <Input
            type="search"
            placeholder={t("header.search")}
            className="w-full bg-muted/40 pl-9 focus-visible:ring-primary/20 transition-all duration-300 border-transparent focus:border-primary/50 focus:bg-background shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} 
            className="hover:bg-primary/10 transition-colors"
        >
            <span className="font-bold text-xs">{language.toUpperCase()}</span>
        </Button>
        
        {/* Theme Toggle */}
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            className="hover:bg-primary/10 transition-colors"
        >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
            <Button 
                variant="ghost" 
                size="icon" 
                className={cn("relative hover:bg-primary/10 transition-colors", showNotifications ? "bg-primary/10 text-primary" : "")}
                onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-destructive flex items-center justify-center text-[10px] text-white font-bold ring-2 ring-background animate-in zoom-in duration-300">
                      {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
              )}
            </Button>

            {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border shadow-lg rounded-xl z-50 animate-in fade-in slide-in-from-top-4 duration-200">
                    <div className="flex items-center justify-between px-4 py-3 border-b">
                        <span className="font-semibold">{t("header.notifications")}</span>
                        <div className="flex gap-2">
                            {unreadCount > 0 && (
                                <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto px-2 py-1 text-xs text-muted-foreground hover:text-primary">
                                    {t("header.markRead")}
                                </Button>
                            )}
                            {notifications.length > 0 && (
                                <Button variant="ghost" size="sm" onClick={clearNotifications} className="h-auto px-2 py-1 text-xs text-destructive hover:bg-destructive/10">
                                    {t("header.clearAll")}
                                </Button>
                            )}
                        </div>
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto py-2">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center justify-center flex flex-col items-center">
                                <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                                <span className="text-sm text-muted-foreground">{t("header.noNotifications")}</span>
                            </div>
                        ) : (
                            <div className="flex flex-col">
                                {notifications.map((notif: AppNotification) => (
                                    <div 
                                        key={notif.id} 
                                        className={cn(
                                            "px-4 py-3 hover:bg-muted/50 transition-colors flex gap-3 group relative",
                                            !notif.read ? "bg-primary/5" : ""
                                        )}
                                        onClick={() => markAsRead(notif.id)}
                                    >
                                        <div className="mt-0.5 flex-shrink-0">
                                            {getIcon(notif.type)}
                                        </div>
                                        <div className="flex-1 min-w-0 pr-6">
                                            <p className={cn("text-sm font-medium leading-none mb-1", !notif.read ? "text-foreground" : "text-muted-foreground")}>
                                                {notif.title}
                                            </p>
                                            {notif.description && (
                                                <p className="text-xs text-muted-foreground line-clamp-2">
                                                    {notif.description}
                                                </p>
                                            )}
                                            <span className="text-[10px] text-muted-foreground/70 block mt-1">
                                                {notif.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            {notif.action && !notif.read && (
                                                <Button 
                                                    variant="secondary" 
                                                    size="sm" 
                                                    className="mt-2 text-xs h-7"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        markAsRead(notif.id);
                                                        notif.action?.onClick();
                                                        setShowNotifications(false);
                                                    }}
                                                >
                                                    {notif.action.label}
                                                </Button>
                                            )}
                                            
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeNotification(notif.id);
                                                }}
                                                title="Eliminar notificación"
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </div>
                                        {!notif.read && (
                                            <div className="absolute right-4 top-10 h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>

        <Link to="/perfil">
          <Button variant="ghost" size="sm" className="gap-2 ml-2 hover:bg-primary/10">
              <div className="h-8 w-8 rounded-full overflow-hidden border border-primary/20 bg-muted flex items-center justify-center text-primary-foreground font-bold shadow-md">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon className="h-4 w-4 text-primary" />
                  )}
              </div>
              <div className="hidden md:flex flex-col items-start">
                  <span className="text-sm font-medium leading-none">{user?.name}</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{user?.role}</span>
              </div>
          </Button>
        </Link>
      </div>
    </header>
  )
}
