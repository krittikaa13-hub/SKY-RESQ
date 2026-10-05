/**
 * @file src/hooks/useQuantumExecution.ts
 * Custom React Hook for managing Qiskit Transpilation & IBM Quantum execution states
 */

import { useState, useCallback } from 'react';
import { useQuantumStore } from '../store/useQuantumStore';
import { quantumApi } from '../api/quantumApi';

export const useQuantumExecution = () => {
  const { activeBackend, circuitSpec, setCircuitSpec, setExecuting, setTranspiling } =
    useQuantumStore();
  const [lastJobId, setLastJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transpileAndRun = useCallback(
    async (optLevel = 3, shots = 4096) => {
      setError(null);
      setTranspiling(true);
      try {
        const transpileRes = await quantumApi.transpileCircuit(circuitSpec, optLevel);
        if (transpileRes.success) {
          setCircuitSpec(transpileRes.data);
        }

        setTranspiling(false);
        setExecuting(true);

        const execRes = await quantumApi.executeCircuit(activeBackend.id, shots);
        if (execRes.success) {
          setLastJobId(execRes.data.jobId);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Execution failed');
      } finally {
        setTranspiling(false);
        setExecuting(false);
      }
    },
    [activeBackend, circuitSpec, setCircuitSpec, setExecuting, setTranspiling]
  );

  return { transpileAndRun, lastJobId, error };
};
