/**
 * @file src/utils/quantumMath.ts
 * Helper Math for Bloch Sphere Coordinates & QAOA Energy Expectation Values
 */

export const calculateBlochCoordinates = (theta: number, phi: number) => {
  const x = Math.sin(theta) * Math.cos(phi);
  const y = Math.sin(theta) * Math.sin(phi);
  const z = Math.cos(theta);
  return { x, y, z };
};

export const calculateQaoaApproximation = (cost: number, optimalCost: number): number => {
  if (optimalCost === 0) return 1.0;
  return Math.min(1.0, Math.abs(cost / optimalCost));
};
