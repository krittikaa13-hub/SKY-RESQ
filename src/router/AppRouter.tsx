/**
 * @file src/router/AppRouter.tsx
 * Enterprise React Router 7 / React Router v6 Configuration for Q-OPTIMA
 */

import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GlobalLayout } from '../layouts/GlobalLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { NetworkPage } from '../pages/NetworkPage';
import { QuantumOptimizationPage } from '../pages/QuantumOptimizationPage';
import { AttackDetectionPage } from '../pages/AttackDetectionPage';
import { TrustEnginePage } from '../pages/TrustEnginePage';
import { QaoaPage } from '../pages/QaoaPage';
import { QuantumCircuitPage } from '../pages/QuantumCircuitPage';
import { IbmQuantumPage } from '../pages/IbmQuantumPage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { ExperimentsPage } from '../pages/ExperimentsPage';
import { ResearchPage } from '../pages/ResearchPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { Error500Page } from '../pages/Error500Page';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GlobalLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="network" element={<NetworkPage />} />
          <Route path="optimization" element={<QuantumOptimizationPage />} />
          <Route path="attack" element={<AttackDetectionPage />} />
          <Route path="trust" element={<TrustEnginePage />} />
          <Route path="qaoa" element={<QaoaPage />} />
          <Route path="quantum" element={<QuantumCircuitPage />} />
          <Route path="ibm" element={<IbmQuantumPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="experiments" element={<ExperimentsPage />} />
          <Route path="research" element={<ResearchPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="500" element={<Error500Page />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
