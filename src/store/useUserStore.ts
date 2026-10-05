/**
 * @file src/store/useUserStore.ts
 * Zustand store for Current User Profile & Authorization Clearance
 */

import { create } from 'zustand';
import { UserProfile } from '../types';

interface UserState {
  user: UserProfile;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: UserProfile) => void;
  setAuthenticated: (val: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: {
    id: 'usr-9021',
    name: 'Dr. Evelyn Vance',
    email: 'evelyn.vance@ibm-quantum.hackathon.org',
    role: 'Quantum Cyber Analyst',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    clearanceLevel: 'LEVEL-5 TOP SECRET',
    lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 16),
  },
  isAuthenticated: true,

  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
}));
