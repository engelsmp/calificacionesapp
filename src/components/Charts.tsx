import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';

export function ModulosChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wider text-slate-400">Desempeño por Módulo</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip
            cursor={{ fill: '#1e293b' }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="promedio" fill="#3b82f6" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="promedio" position="insideTop" fill="#fff" fontSize={12} offset={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TemasChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wider text-slate-400">Promedio por Temas</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
          <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
          <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} width={150} />
          <Tooltip
            cursor={{ fill: '#1e293b' }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="promedio" fill="#8b5cf6" radius={[0, 4, 4, 0]}>
            <LabelList dataKey="promedio" position="insideRight" fill="#fff" fontSize={12} offset={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActividadesChart({ data }: { data: any[] }) {
  return (
    <div className="h-[380px] w-full bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-white font-medium mb-4 text-sm uppercase tracking-wider text-slate-400">Últimas Actividades</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 90 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} angle={-45} textAnchor="end" />
          <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
          <Tooltip
            cursor={{ fill: '#1e293b' }}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
          />
          <Bar dataKey="calificacion" fill="#10b981" radius={[4, 4, 0, 0]}>
            <LabelList dataKey="calificacion" position="insideTop" fill="#fff" fontSize={12} offset={10} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
