/**
 * @file src/types/index.ts
 * Re-exports shared domain models and UI router state types
 */

export * from '../../shared/types';

export type NavigationTab =
  | 'dashboard'
  | 'network'
  | 'quantum'
  | 'attacks'
  | 'trust'
  | 'qaoa'
  | 'circuits'
  | 'ibm'
  | 'analytics'
  | 'experiments'
  | 'research'
  | 'settings';
