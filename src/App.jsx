import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Monitoreo from './pages/Monitoreo';
import Registros from './pages/Registros';
import Periodos from './pages/Periodos';
import Reportes from './pages/Reportes';
import Gestion from './pages/Gestion';
import CambiarPassword from './pages/CambiarPassword';

function App() {
  return (
    <Router>
      <AuthProvider>
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

          <Route element={<ProtectedRoute />}>
            <Route path="/cambiar-password" element={<CambiarPassword />} />
            
            <Route element={<Layout />}>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/nuevo"     element={<Monitoreo />} />
              <Route path="/registros" element={<Registros />} />
              <Route path="/periodos"  element={<Periodos />} />
              <Route path="/gestion"   element={<Gestion />} />
              <Route path="/reportes"  element={<Reportes />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
