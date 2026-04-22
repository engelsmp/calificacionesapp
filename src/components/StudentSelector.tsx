import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ChevronRight, Search, User } from 'lucide-react';

interface Props {
  onSelect: (cedula: string) => void;
  selectedCedula: string | null;
  refreshTrigger: number;
}

export function StudentSelector({ onSelect, selectedCedula, refreshTrigger }: Props) {
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchEstudiantes = async () => {
      const { data } = await supabase.from('participantes').select('cedula, nombre, correo').order('nombre');
      if (data) setEstudiantes(data);
    };
    fetchEstudiantes();
  }, [refreshTrigger]);

  const filtered = estudiantes.filter(e => 
    e.nombre?.toLowerCase().includes(search.toLowerCase()) || 
    e.cedula.includes(search)
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full max-h-[600px]">
      <div className="p-4 border-b border-slate-800">
        <h3 className="text-white font-semibold mb-4">Directorio de Estudiantes</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1 p-2 space-y-1 custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="text-center p-4 text-slate-500 text-sm">No se encontraron estudiantes</div>
        ) : (
          filtered.map((estudiante) => (
            <button
              key={estudiante.cedula}
              onClick={() => onSelect(estudiante.cedula)}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center justify-between group transition-all ${
                selectedCedula === estudiante.cedula 
                  ? 'bg-blue-600/20 border border-blue-500/50' 
                  : 'hover:bg-slate-800 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3 overflow-hidden">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  selectedCedula === estudiante.cedula ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-blue-400'
                }`}>
                  <User size={14} />
                </div>
                <div className="truncate">
                  <div className={`text-sm font-medium truncate ${selectedCedula === estudiante.cedula ? 'text-blue-400' : 'text-slate-300'}`}>
                    {estudiante.nombre || 'Sin nombre'}
                  </div>
                  <div className="text-xs text-slate-500 truncate">CI: {estudiante.cedula}</div>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${selectedCedula === estudiante.cedula ? 'text-blue-400 translate-x-1' : 'text-slate-600 group-hover:text-slate-400'}`} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
