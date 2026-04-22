import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { LogOut, Loader2, } from 'lucide-react';
import { StatsCards } from '../../components/StatsCards';
import { ModulosChart, TemasChart, ActividadesChart } from '../../components/Charts';

export default function StudentDashboard() {
  const { cedula, logout } = useAuthStore();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [participante, setParticipante] = useState<any>(null);
  const [calificaciones, setCalificaciones] = useState<any[]>([]);
  const [asistencias, setAsistencias] = useState({ presencias: 0, ausencias: 0 });

  useEffect(() => {
    if (!cedula) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [partRes, calRes, asisRes] = await Promise.all([
          supabase.from('participantes').select('*').eq('cedula', cedula).single(),
          supabase.from('calificaciones').select('*').eq('cedula', cedula),
          supabase.from('asistencias').select('*').eq('cedula', cedula)
        ]);

        if (partRes.data) setParticipante(partRes.data);
        if (calRes.data) setCalificaciones(calRes.data);
        if (asisRes.data) {
          const totalAsistencias = asisRes.data.reduce((acc: any, curr: any) => ({
            presencias: acc.presencias + (Number(curr.presencias) || 0),
            ausencias: acc.ausencias + (Number(curr.ausencias) || 0)
          }), { presencias: 0, ausencias: 0 });
          setAsistencias(totalAsistencias);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cedula, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Procesar datos para gráficos
  const modulosMap = new Map();
  const temasMap = new Map();

  calificaciones.forEach(c => {
    // Módulos
    if (!modulosMap.has(c.modulo)) {
      modulosMap.set(c.modulo, { total: 0, count: 0 });
    }
    const m = modulosMap.get(c.modulo);
    m.total += c.calificacion;
    m.count += 1;

    // Temas
    if (!temasMap.has(c.tema)) {
      temasMap.set(c.tema, { total: 0, count: 0 });
    }
    const t = temasMap.get(c.tema);
    t.total += c.calificacion;
    t.count += 1;
  });

  const modulosData = Array.from(modulosMap.entries()).map(([name, data]) => ({
    name: String(name).match(/^\d+$/) ? `Módulo ${name}` : name,
    promedio: Math.round(data.total / data.count)
  }));

  const temasData = Array.from(temasMap.entries()).map(([name, data]) => ({
    name,
    promedio: Math.round(data.total / data.count)
  }));

  const actividadesData = calificaciones.slice(-10).map(c => ({
    name: c.actividad,
    calificacion: c.calificacion
  }));

  // Estadísticas globales
  const notas = calificaciones.map(c => c.calificacion);
  const maxCal = calificaciones.length > 0 ? calificaciones.reduce((prev, current) => (prev.calificacion > current.calificacion) ? prev : current) : null;
  const minCal = calificaciones.length > 0 ? calificaciones.reduce((prev, current) => (prev.calificacion < current.calificacion) ? prev : current) : null;

  const alta = {
    valor: maxCal ? maxCal.calificacion : 0,
    actividad: maxCal ? maxCal.actividad : '-'
  };
  const baja = {
    valor: minCal ? minCal.calificacion : 0,
    actividad: minCal ? minCal.actividad : '-'
  };
  const promedio = notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0;

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center space-x-4">
            <img
              src="/logo_redondo.png"
              alt="Moronta Virtual Class"
              className="w-14 h-14 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">{participante?.nombre || 'Estudiante'}</h1>
              <p className="text-slate-400 text-sm">Cédula: {cedula} | {participante?.correo}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 hover:border-slate-600"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </header>

        <StatsCards
          alta={alta}
          baja={baja}
          promedio={promedio}
          asistencias={asistencias}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ModulosChart data={modulosData} />
          <TemasChart data={temasData} />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <ActividadesChart data={actividadesData} />
        </div>
      </div>
    </div>
  );
}
