import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { IEProvider } from './hooks/useIE.jsx';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import IEOnlyRoute from './components/IEOnlyRoute';

// Pages
import Login from './pages/Login';
import FirstSetup from './pages/FirstSetup';
import Dashboard from './pages/Dashboard';
import Monitoreo from './pages/Monitoreo';
import Registros from './pages/Registros';
import Periodos from './pages/Periodos';
import Reportes from './pages/Reportes';
import Gestion from './pages/Gestion';
import CambiarPassword from './pages/CambiarPassword';
import GestionIE from './pages/GestionIE';

function App() {
  return (
    <Router>
      <AuthProvider>
        <IEProvider>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/setup" element={<FirstSetup />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/cambiar-password" element={<CambiarPassword />} />

            <Route element={<Layout />}>
              {/* Accesible para todos los roles autenticados */}
              <Route path="/"              element={<Dashboard />} />
              <Route path="/instituciones" element={<GestionIE />} />

              {/* Solo roles IE (admin, director, subdirector) — super_admin redirige a / */}
              <Route element={<IEOnlyRoute />}>
                <Route path="/nuevo"     element={<Monitoreo />} />
                <Route path="/registros" element={<Registros />} />
                <Route path="/periodos"  element={<Periodos />} />
                <Route path="/gestion"   element={<Gestion />} />
                <Route path="/reportes"  element={<Reportes />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </IEProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
