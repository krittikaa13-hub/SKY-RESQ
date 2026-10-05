/**
 * @file src/app/index.ts
 * Application Bootstrap Config & Initialization Hooks
 */

export const APP_CONFIG = {
  name: 'SKY-RESQ Q',
  version: '2.4.0',
  tagline: 'Drone and Robot Emergency Response Platform',
  buildEnv: typeof import.meta !== 'undefined' && 'env' in import.meta ? (import.meta as Record<string, any>).env?.MODE : 'production',
};
