import { Trophy, TrendingDown, Target, UserCheck, Clock } from 'lucide-react';

interface StatsProps {
  alta: { valor: number; actividad: string };
  baja: { valor: number; actividad: string };
  promedio: number;
  asistencias: {
    presencias: number;
    ausencias: number;
  };
}

export function StatsCards({ alta, baja, promedio, asistencias }: StatsProps) {
  const totalClases = asistencias.presencias + asistencias.ausencias;
  const porcentajeAsistencia = totalClases > 0 ? Math.round((asistencias.presencias / totalClases) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Promedio */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Target className="w-16 h-16 text-blue-500" />
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-blue-500/20 p-2 rounded-lg">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-slate-400 font-medium text-sm">Promedio General</h3>
        </div>
        <div className="text-3xl font-bold text-white mt-4">{promedio.toFixed(1)}</div>
      </div>

      {/* Nota más alta */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Trophy className="w-16 h-16 text-emerald-500" />
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-emerald-500/20 p-2 rounded-lg">
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-slate-400 font-medium text-sm">Calificación Más Alta</h3>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold text-white">{alta.valor.toFixed(1)}</div>
          <div className="text-sm text-emerald-400/80 mt-1 truncate font-medium" title={alta.actividad}>{alta.actividad}</div>
        </div>
      </div>

      {/* Nota más baja */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingDown className="w-16 h-16 text-rose-500" />
        </div>
        <div className="flex items-center space-x-3 mb-2">
          <div className="bg-rose-500/20 p-2 rounded-lg">
            <TrendingDown className="w-5 h-5 text-rose-400" />
          </div>
          <h3 className="text-slate-400 font-medium text-sm">Calificación Más Baja</h3>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold text-white">{baja.valor.toFixed(1)}</div>
          <div className="text-sm text-rose-400/80 mt-1 truncate font-medium" title={baja.actividad}>{baja.actividad}</div>
        </div>
      </div>

      {/* Asistencias */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <UserCheck className="w-16 h-16 text-purple-500" />
        </div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500/20 p-2 rounded-lg">
              <UserCheck className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-slate-400 font-medium text-sm">Asistencia</h3>
          </div>
        </div>
        <div className="text-3xl font-bold text-white mt-4">{porcentajeAsistencia}%</div>
        <div className="mt-2 text-xs text-slate-500 flex gap-3">
          <span className="flex items-center"><UserCheck className="w-3 h-3 mr-1 text-emerald-400" /> {asistencias.presencias}</span>
          <span className="flex items-center"><Clock className="w-3 h-3 mr-1 text-rose-400" /> {asistencias.ausencias}</span>
        </div>
      </div>
    </div>
  );
}
