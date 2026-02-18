import Dashboard from './views/Dashboard'

function App() {
  return (
    <div className="min-h-screen bg-neon-dark bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-neon-dark to-black text-white selection:bg-neon-pink/30">
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="relative z-10 container mx-auto">
        <Dashboard />
      </div>
    </div>
  )
}

export default App
