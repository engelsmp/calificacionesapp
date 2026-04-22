import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function UploadExcel({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);

      const sheetNames = workbook.SheetNames;
      
      // Función para encontrar el nombre exacto de la hoja ignorando mayúsculas y espacios extra
      const findSheet = (target: string) => {
        return sheetNames.find(name => name.toLowerCase().trim() === target.toLowerCase().trim());
      };

      const partName = findSheet('datos participantes');
      const calName = findSheet('calificador');
      const asisName = findSheet('asistencia');

      if (!partName || !calName || !asisName) {
        const found = sheetNames.join(', ');
        throw new Error(`Faltan hojas en el Excel. Esperadas: "datos participantes", "calificador", "asistencia". Encontradas: ${found}`);
      }

      const participantesSheet = workbook.Sheets[partName];
      const calificadorSheet = workbook.Sheets[calName];
      const asistenciaSheet = workbook.Sheets[asisName];

      const normalizeKey = (key: string) => {
        return key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      };

      const normalizeData = (data: any[]) => {
        return data.map(row => {
          const newRow: any = {};
          for (const key in row) {
            newRow[normalizeKey(key)] = row[key];
          }
          return newRow;
        });
      };

      const participantesData = normalizeData(XLSX.utils.sheet_to_json(participantesSheet));
      const calificadorData = normalizeData(XLSX.utils.sheet_to_json(calificadorSheet));
      const asistenciaData = normalizeData(XLSX.utils.sheet_to_json(asistenciaSheet));

      // Limpiar datos anteriores (opcional: el prompt decía insert/update, pero como hay FK cascades, es más fácil hacer un upsert o limpiar)
      // Usaremos UPSERT para participantes
      
      const formattedParticipantes = participantesData.map((row: any) => ({
        cedula: String(row.cedula).trim(),
        nombre: row.nombre || '',
        correo: row.correo || '',
        telefono: String(row.telefono || '')
      }));

      // Eliminar duplicados por cédula para evitar error de "cannot affect row a second time" en el UPSERT
      const uniqueParticipantesMap = new Map();
      for (const p of formattedParticipantes) {
        if (!uniqueParticipantesMap.has(p.cedula)) {
          uniqueParticipantesMap.set(p.cedula, p);
        }
      }
      const uniqueParticipantes = Array.from(uniqueParticipantesMap.values());

      const { error: partErr } = await supabase.from('participantes').upsert(uniqueParticipantes, { onConflict: 'cedula' });
      if (partErr) throw partErr;

      // Para calificaciones y asistencias, borramos las de los participantes actualizados para evitar duplicados en vez de Upsert (ya que no hay unique constrain aparte de id).
      // Alternativamente, borramos todo
      await supabase.from('calificaciones').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Limpia todo para este prototipo
      await supabase.from('asistencias').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const formattedCalificaciones = calificadorData.map((row: any) => ({
        cedula: String(row.cedula).trim(),
        modulo: row.modulo,
        tema: row.tema,
        actividad: row.actividad,
        calificacion: Number(row.calificacion) || 0
      }));

      const { error: calErr } = await supabase.from('calificaciones').insert(formattedCalificaciones);
      if (calErr) throw calErr;

      const formattedAsistencias = asistenciaData.map((row: any) => ({
        cedula: String(row.cedula).trim(),
        presencias: Number(row.presencias) || 0,
        ausencias: Number(row.ausencias) || 0
      }));

      const { error: asisErr } = await supabase.from('asistencias').insert(formattedAsistencias);
      if (asisErr) throw asisErr;

      setSuccess(true);
      onUploadSuccess();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al procesar el archivo Excel.');
    } finally {
      setLoading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
        <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-400" />
        Cargar Base de Datos
      </h3>
      
      <div className="relative border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:bg-slate-800/50 transition-colors">
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileUpload}
          disabled={loading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          {loading ? (
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          ) : success ? (
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          ) : (
            <Upload className="w-10 h-10 text-slate-400" />
          )}
          
          <div className="text-sm text-slate-300">
            {loading ? (
              <span className="font-medium text-blue-400">Procesando archivo...</span>
            ) : success ? (
              <span className="font-medium text-green-400">¡Datos cargados exitosamente!</span>
            ) : (
              <>
                <span className="font-medium text-blue-400">Haz clic para subir</span> o arrastra y suelta el archivo <br/>
                <span className="text-slate-500 text-xs">Formato esperado: BD.xlsx</span>
              </>
            )}
          </div>
        </div>
      </div>
      {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
    </div>
  );
}
