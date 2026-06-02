import { create } from 'zustand';
import { User } from '../types';

interface AuthStore {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUsername: (token: string, username: string) => void;
  updateAvatar: (avatarPath: string | null) => void;
  updateNickname: (nickname: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('token'),
  user: JSON.parse(localStorage.getItem('user') ?? 'null'),
  isAuthenticated: !!localStorage.getItem('token'),

  login: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  updateUsername: (token, username) => {
    set(state => {
      const updatedUser = state.user ? { ...state.user, username } : null;
      if (updatedUser) localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('token', token);
      return { token, user: updatedUser };
    });
  },

  updateAvatar: (avatarPath) => {
    set(state => {
      const updatedUser = state.user ? { ...state.user, avatar_path: avatarPath } : null;
      if (updatedUser) localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },

  updateNickname: (nickname) => {
    set(state => {
      const updatedUser = state.user ? { ...state.user, nickname } : null;
      if (updatedUser) localStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
}));
