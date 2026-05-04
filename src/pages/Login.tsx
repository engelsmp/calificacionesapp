import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { LogIn, KeyRound, ChevronLeft } from 'lucide-react';

export default function Login() {
  const [cedula, setCedula] = useState('');
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loginStep, setLoginStep] = useState<'cedula' | 'pin'>('cedula');
  const [hasPin, setHasPin] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, setAdminStatus } = useAuthStore();

  const handleCheckCedula = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cedula.trim()) {
      setError('Por favor ingresa tu cédula');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: rpcError } = await supabase.rpc('get_student_auth_info', {
        p_cedula: cedula.trim()
      });

      if (rpcError) throw rpcError;
      
      const authInfo = data?.[0];
      if (!authInfo || !authInfo.student_exists) {
        setError('Cédula no encontrada. Verifica tus datos.');
      } else {
        setHasPin(authInfo.has_pin);
        setStudentName(authInfo.nombre);
        setLoginStep('pin');
      }
    } catch (err: any) {
      setError('Error al verificar cédula: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError('El PIN debe ser de 4 números');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (!hasPin) {
        // Set PIN for the first time
        const { data, error: setPinError } = await supabase.rpc('set_student_pin', {
          p_cedula: cedula.trim(),
          p_pin: pin
        });

        if (setPinError || !data) {
          throw new Error(setPinError?.message || 'No se pudo guardar el PIN');
        }
      }

      // Verify PIN and get data (to ensure it works)
      const { data, error: verifyError } = await supabase.rpc('get_student_complete_data', {
        p_cedula: cedula.trim(),
        p_pin: pin
      });

      if (verifyError || (data as any).error) {
        setError((data as any).error || 'PIN incorrecto. Intenta de nuevo.');
      } else {
        login(cedula.trim(), pin);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'engelsmp3@hotmail.com',
        password: password,
      });

      if (error) {
        setError('Acceso denegado: ' + error.message);
      } else if (data.user) {
        setAdminStatus(true);
        navigate('/admin');
      }
    } catch (err) {
      setError('Error al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/20 blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 transition-all duration-500">
        <div className="text-center mb-8">
          <div className="flex flex-col items-center justify-center mx-auto mt-6 -mb-8">
            <img
              src="/logo.png"
              alt="Moronta Virtual Class"
              className="w-48 h-48 md:w-56 md:h-56 object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            Moronta Virtual Class
          </h1>
          <h2 className="text-lg font-medium text-blue-400 mb-3">
            {isAdminLogin ? 'Acceso Administrativo' : 'Portal Estudiantil'}
          </h2>
          <p className="text-slate-400 text-sm">
            {isAdminLogin 
              ? 'Ingresa la contraseña maestra para continuar' 
              : loginStep === 'cedula' 
                ? 'Ingresa tu número de cédula para ver tus calificaciones'
                : `Hola ${studentName}, ${hasPin ? 'ingresa tu PIN de 4 dígitos' : 'asigna tu nuevo PIN de 4 dígitos'}`}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm mb-6 flex items-center">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {!isAdminLogin ? (
          loginStep === 'cedula' ? (
            <form onSubmit={handleCheckCedula} className="space-y-6">
              <div>
                <label htmlFor="cedula" className="block text-sm font-medium text-slate-300 mb-2">
                  Número de Cédula
                </label>
                <div className="relative">
                  <input
                    id="cedula"
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ej: 1234567890"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Verificando...' : (
                  <>
                    <span>Continuar</span>
                    <LogIn className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePinLogin} className="space-y-6">
              <button 
                type="button"
                onClick={() => setLoginStep('cedula')}
                className="flex items-center text-sm text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
                <span>Cambiar cédula</span>
              </button>
              
              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-slate-300 mb-2">
                  {hasPin ? 'Ingresar PIN' : 'Crear PIN (4 dígitos)'}
                </label>
                <div className="relative">
                  <input
                    id="pin"
                    type="password"
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-center text-2xl tracking-[1em] text-white placeholder-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0000"
                  />
                </div>
                {!hasPin && (
                  <p className="mt-2 text-xs text-yellow-500/80 italic text-center">
                    * Este PIN será necesario para tus próximos ingresos. No lo olvides.
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || pin.length !== 4}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Procesando...' : (
                  <>
                    <span>{hasPin ? 'Entrar' : 'Guardar y Entrar'}</span>
                    <KeyRound className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )
        ) : (
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 shadow-lg shadow-purple-500/25 disabled:opacity-50"
            >
              {loading ? 'Accediendo...' : 'Acceder como Admin'}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsAdminLogin(!isAdminLogin);
              setError('');
              setLoginStep('cedula');
              setPin('');
            }}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            {isAdminLogin ? 'Volver al portal de estudiantes' : '¿Eres administrador?'}
          </button>
        </div>
      </div>
    </div>
  );
}
