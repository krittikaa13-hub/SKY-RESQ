/**
 * @file src/pages/TrustEnginePage.tsx
 * Dynamic Beta-Reputation & EigenTrust Calculation Page
 */

import React from 'react';
import { TrustEnginePage as TrustComponent } from '../components/trust/TrustEnginePage';
import { useNetworkStore } from '../store/useNetworkStore';

export const TrustEnginePage: React.FC = () => {
  const { nodes, toggleQuarantine, resetTrust } = useNetworkStore();

  return (
    <TrustComponent
      nodes={nodes}
      onToggleQuarantine={toggleQuarantine}
      onResetTrust={resetTrust}
    />
  );
};
