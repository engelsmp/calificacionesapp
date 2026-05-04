import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import { supabase } from './lib/supabase';
import { useAuthStore } from './store/authStore';

function App() {
  const { setAdminStatus } = useAuthStore();

  useEffect(() => {
    // Verificar sesión al cargar la app
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setAdminStatus(true);
      }
    });

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminStatus(!!session);
    });

    return () => subscription.unsubscribe();
  }, [setAdminStatus]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/dashboard" element={<StudentDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

