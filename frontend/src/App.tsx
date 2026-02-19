import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Overview from './pages/Overview';
import Security from './pages/Security';
import NavalStatus from './pages/NavalStatus';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Overview />} />
          <Route path="security" element={<Security />} />
          <Route path="naval" element={<NavalStatus />} />
          <Route path="settings" element={<Settings />} />
          {/* Redirect generic dashboard to overview if accessed directly via old link */}
          <Route path="dashboard" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
