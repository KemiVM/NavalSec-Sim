import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Outlet } from "react-router-dom"

export function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--color-wazuh-bg)] dark:bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden transition-all duration-300">
        <Header />
        <main className="flex-1 overflow-auto p-6 scroll-smooth">
          <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
