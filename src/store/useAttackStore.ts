/**
 * @file src/store/useAttackStore.ts
 * Zustand store for Cyber Attack Incidents & Automated Mitigation Protocols
 */

import { create } from 'zustand';
import { AttackIncident } from '../types';
import { ATTACK_INCIDENTS } from '../data/mockData';

interface AttackState {
  attacks: AttackIncident[];
  selectedAttackId: string | null;
  filterSeverity: string | 'All';

  // Actions
  setAttacks: (attacks: AttackIncident[]) => void;
  selectAttack: (id: string | null) => void;
  setFilterSeverity: (severity: string) => void;
  mitigateAttack: (attackId: string) => void;
  addAttack: (attack: AttackIncident) => void;
}

export const useAttackStore = create<AttackState>((set) => ({
  attacks: ATTACK_INCIDENTS,
  selectedAttackId: null,
  filterSeverity: 'All',

  setAttacks: (attacks) => set({ attacks }),
  selectAttack: (selectedAttackId) => set({ selectedAttackId }),
  setFilterSeverity: (filterSeverity) => set({ filterSeverity }),

  mitigateAttack: (attackId) =>
    set((state) => ({
      attacks: state.attacks.map((a) =>
        a.id === attackId ? { ...a, mitigated: true } : a
      ),
    })),

  addAttack: (attack) =>
    set((state) => ({ attacks: [attack, ...state.attacks] })),
}));
