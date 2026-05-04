import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  cedula: string | null;
  pin: string | null;
  isAdmin: boolean;
  login: (cedula: string, pin: string) => void;
  setAdminStatus: (status: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  cedula: localStorage.getItem('student_cedula'),
  pin: localStorage.getItem('student_pin'),
  isAdmin: false,
  
  login: (cedula: string, pin: string) => {
    localStorage.setItem('student_cedula', cedula);
    localStorage.setItem('student_pin', pin);
    set({ cedula, pin, isAdmin: false });
  },
  
  setAdminStatus: (status: boolean) => {
    set({ isAdmin: status });
  },
  
  logout: async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('student_cedula');
    localStorage.removeItem('student_pin');
    set({ cedula: null, pin: null, isAdmin: false });
  },
}));

