import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import UploadExcel from '../../components/UploadExcel';
import { StudentSelector } from '../../components/StudentSelector';
import { supabase } from '../../lib/supabase';
import { Shield, LogOut, Loader2, Users } from 'lucide-react';
import { StatsCards } from '../../components/StatsCards';
import { ModulosChart, TemasChart } from '../../components/Charts';

export default function AdminDashboard() {
  const { isAdmin, logout } = useAuthStore();
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentData, setStudentData] = useState<any>(null);
  const [loadingStudent, setLoadingStudent] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
    }
  }, [isAdmin, navigate]);

  useEffect(() => {
    if (!selectedStudent) {
      setStudentData(null);
      return;
    }

    const fetchStudentDetails = async () => {
      setLoadingStudent(true);
      try {
        const [partRes, calRes, asisRes] = await Promise.all([
          supabase.from('participantes').select('*').eq('cedula', selectedStudent).single(),
          supabase.from('calificaciones').select('*').eq('cedula', selectedStudent),
          supabase.from('asistencias').select('*').eq('cedula', selectedStudent)
        ]);

        const calificaciones = calRes.data || [];
        const notas = calificaciones.map((c: any) => c.calificacion);

        // Modulos chart
        const modulosMap = new Map();
        const temasMap = new Map();

        calificaciones.forEach((c: any) => {
          if (!modulosMap.has(c.modulo)) modulosMap.set(c.modulo, { total: 0, count: 0 });
          const m = modulosMap.get(c.modulo);
          m.total += c.calificacion;
          m.count += 1;

          if (!temasMap.has(c.tema)) temasMap.set(c.tema, { total: 0, count: 0 });
          const t = temasMap.get(c.tema);
          t.total += c.calificacion;
          t.count += 1;
        });

        const asisRecords = asisRes.data || [];
        const totalAsistencias = asisRecords.reduce((acc: any, curr: any) => ({
          presencias: acc.presencias + (Number(curr.presencias) || 0),
          ausencias: acc.ausencias + (Number(curr.ausencias) || 0)
        }), { presencias: 0, ausencias: 0 });

        const maxCal = calificaciones.length > 0 ? calificaciones.reduce((prev: any, current: any) => (prev.calificacion > current.calificacion) ? prev : current) : null;
        const minCal = calificaciones.length > 0 ? calificaciones.reduce((prev: any, current: any) => (prev.calificacion < current.calificacion) ? prev : current) : null;

        setStudentData({
          participante: partRes.data,
          asistencias: totalAsistencias,
          stats: {
            alta: { 
              valor: maxCal ? maxCal.calificacion : 0, 
              actividad: maxCal ? maxCal.actividad : '-' 
            },
            baja: { 
              valor: minCal ? minCal.calificacion : 0, 
              actividad: minCal ? minCal.actividad : '-' 
            },
            promedio: notas.length > 0 ? notas.reduce((a, b) => a + b, 0) / notas.length : 0,
          },
          charts: {
            modulos: Array.from(modulosMap.entries()).map(([name, data]) => ({
              name: String(name).match(/^\d+$/) ? `Módulo ${name}` : name,
              promedio: Math.round(data.total / data.count)
            })),
            temas: Array.from(temasMap.entries()).map(([name, data]) => ({ name, promedio: Math.round(data.total / data.count) }))
          }
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingStudent(false);
      }
    };

    fetchStudentDetails();
  }, [selectedStudent, refresh]);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-slate-950 p-6 flex flex-col">
      <header className="flex justify-between items-center mb-8 bg-slate-900 border border-slate-800 p-6 rounded-2xl shrink-0">
        <div className="flex items-center space-x-4">
          <img
            src="/logo_redondo.png"
            alt="Moronta Virtual Class"
            className="w-12 h-12 object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
          />
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Panel Administrativo</h1>
            <p className="text-slate-400 text-sm">Gestión de calificaciones y estudiantes</p>
          </div>
        </div>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
        >
          <LogOut size={18} />
          <span className="hidden sm:inline">Cerrar Sesión</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Sidebar */}
        <div className="lg:col-span-3 space-y-6 flex flex-col h-full">
          <UploadExcel onUploadSuccess={() => setRefresh(r => r + 1)} />
          <div className="flex-1 min-h-[300px]">
            <StudentSelector
              selectedCedula={selectedStudent}
              onSelect={setSelectedStudent}
              refreshTrigger={refresh}
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-y-auto custom-scrollbar flex flex-col">
          {!selectedStudent ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <Users className="w-20 h-20 mb-4 opacity-20" />
              <h2 className="text-xl font-medium text-slate-400">Ningún estudiante seleccionado</h2>
              <p className="text-sm mt-2">Selecciona un estudiante del directorio para ver sus métricas detalladas.</p>
            </div>
          ) : loadingStudent ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
          ) : studentData ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-2xl font-bold text-white">{studentData.participante?.nombre}</h2>
                  <p className="text-slate-400">CI: {selectedStudent} • {studentData.participante?.correo} • {studentData.participante?.telefono}</p>
                </div>
              </div>

              <StatsCards
                alta={studentData.stats.alta}
                baja={studentData.stats.baja}
                promedio={studentData.stats.promedio}
                asistencias={studentData.asistencias}
              />

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ModulosChart data={studentData.charts.modulos} />
                <TemasChart data={studentData.charts.temas} />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
