/**
 * @file src/pages/AttackDetectionPage.tsx
 * Threat Detection & Adversarial Attack Mitigation Page
 */

import React from 'react';
import { AttackDetectionPage as AttackComponent } from '../components/attacks/AttackDetectionPage';
import { useAttackStore } from '../store/useAttackStore';
import { useNetworkStore } from '../store/useNetworkStore';
import { useNotificationStore } from '../store/useNotificationStore';

export const AttackDetectionPage: React.FC = () => {
  const { attacks, mitigateAttack } = useAttackStore();
  const { toggleQuarantine } = useNetworkStore();
  const { addNotification } = useNotificationStore();

  const handleMitigate = (attackId: string) => {
    mitigateAttack(attackId);
    const atk = attacks.find((a) => a.id === attackId);
    if (atk) {
      toggleQuarantine(atk.nodeId);
      addNotification({
        id: `notif-${Date.now()}`,
        type: 'alert',
        title: 'Attack Vector Neutralized',
        message: `Isolated ${atk.nodeName} and re-routed data packets away from malicious path.`,
        time: 'Just now',
        read: false,
      });
    }
  };

  return <AttackComponent attacks={attacks} onMitigateAttack={handleMitigate} />;
};
