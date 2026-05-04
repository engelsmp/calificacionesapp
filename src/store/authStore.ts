import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  cedula: string | null;
  isAdmin: boolean;
  login: (cedula: string) => void;
  setAdminStatus: (status: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  cedula: localStorage.getItem('student_cedula'),
  isAdmin: false, // Se verificará al cargar
  
  login: (cedula: string) => {
    localStorage.setItem('student_cedula', cedula);
    set({ cedula, isAdmin: false });
  },
  
  setAdminStatus: (status: boolean) => {
    set({ isAdmin: status });
  },
  
  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('student_cedula');
    set({ cedula: null, isAdmin: false });
  },
}));

