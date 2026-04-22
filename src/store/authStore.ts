import { create } from 'zustand';

interface AuthState {
  cedula: string | null;
  isAdmin: boolean;
  login: (cedula: string) => void;
  loginAdmin: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  cedula: localStorage.getItem('student_cedula'),
  isAdmin: localStorage.getItem('is_admin') === 'true',
  
  login: (cedula: string) => {
    localStorage.setItem('student_cedula', cedula);
    localStorage.removeItem('is_admin');
    set({ cedula, isAdmin: false });
  },
  
  loginAdmin: () => {
    localStorage.setItem('is_admin', 'true');
    localStorage.removeItem('student_cedula');
    set({ isAdmin: true, cedula: null });
  },
  
  logout: () => {
    localStorage.removeItem('student_cedula');
    localStorage.removeItem('is_admin');
    set({ cedula: null, isAdmin: false });
  },
}));
