import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Radio, Zap, Database, Settings, LifeBuoy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"
import { Lock } from "lucide-react"

const navigationKeys = [
  { key: "dashboard", href: "/", icon: LayoutDashboard },
  { key: "simulation", href: "/simulacion", icon: Radio },
  { key: "faults", href: "/fallos", icon: Zap },
  { key: "history", href: "/datos", icon: Database },
]

export function Sidebar() {
  const location = useLocation()
  const { t } = useLanguage()
  const { user } = useAuth()

  return (
    <div className="hidden border-r bg-card/80 backdrop-blur-xl md:flex md:w-64 md:flex-col shadow-lg z-20">
      <div className="flex h-16 items-center border-b px-6 bg-primary/5">
        <Zap className="mr-2 h-6 w-6 text-primary animate-pulse" />
        <span className="text-lg font-bold tracking-tight text-foreground">
          NAVAL<span className="text-primary">SEC</span>
        </span>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto py-4">
        <nav className="flex-1 px-3 space-y-1">
          {navigationKeys.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.key}
                to={item.href}
                className={cn(
                  "group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 relative overflow-hidden",
                  isActive
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                 {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                 )}
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {t(`sidebar.${item.key}`)}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="p-4 border-t bg-muted/20">
        {user?.role === "admin" ? (
          <Link to="/parametros" className={cn(
              "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
              location.pathname === "/parametros" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}>
              <Settings className="h-4 w-4" /> {t("sidebar.settings")}
          </Link>
        ) : (
          <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground/50 cursor-not-allowed">
              <Lock className="h-4 w-4" /> {t("sidebar.settings")}
          </div>
        )}
        <Link to="/ayuda" className={cn(
            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer w-full text-left mt-1",
            location.pathname === "/ayuda" ? "bg-primary/10 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
        )}>
            <LifeBuoy className="h-4 w-4" /> {t("sidebar.help")}
        </Link>
      </div>
    </div>
  )
}
