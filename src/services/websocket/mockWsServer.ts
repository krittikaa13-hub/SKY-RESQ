/**
 * @file src/services/websocket/mockWsServer.ts
 * Client-Side Real-Time Telemetry Generator simulating WebSocket pushes for Packet Updates,
 * Dynamic Trust Decay, QAOA Convergence Progress, and Live Hardware Calibration.
 */

import { useNetworkStore } from '../../store/useNetworkStore';
import { useTrustStore } from '../../store/useTrustStore';
import { useSimulationStore } from '../../store/useSimulationStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { NetworkPacket } from '../../types';

export class MockWebSocketStreamer {
  private intervalTimer: NodeJS.Timeout | null = null;
  private stepCount = 0;

  public start(): void {
    if (this.intervalTimer) return;

    this.intervalTimer = setInterval(() => {
      const isRunning = useSimulationStore.getState().isRunning;
      if (!isRunning) return;

      this.stepCount += 1;
      useSimulationStore.getState().incrementStep();

      // 1. Emit Packet Telemetry Event
      const sourceId = `node${Math.floor(Math.random() * 8)}`;
      let targetId = `node${Math.floor(Math.random() * 8)}`;
      while (targetId === sourceId) {
        targetId = `node${Math.floor(Math.random() * 8)}`;
      }

      const threatScore = Math.floor(Math.random() * 35);
      const isIntercepted = threatScore > 28;

      const newPacket: NetworkPacket = {
        id: `pkt-${Date.now().toString().slice(-5)}`,
        sourceId,
        targetId,
        status: isIntercepted ? 'intercepted' : 'in-transit',
        timestamp: new Date().toLocaleTimeString(),
        payloadSize: `${Math.floor(Math.random() * 500 + 100)} KB`,
        threatScore,
        delayMs: Math.floor(Math.random() * 12 + 2),
      };

      useNetworkStore.getState().addPacket(newPacket);
      useSimulationStore.getState().addProcessedPackets(1);

      // 2. High threat notification event every 15 steps
      if (this.stepCount % 15 === 0) {
        useNotificationStore.getState().addNotification({
          id: `notif-${Date.now()}`,
          type: 'network',
          title: 'Quantum Mesh Telemetry Update',
          message: `Processed ${useSimulationStore.getState().totalPacketsProcessed} network packets with average QAOA delay of 4.2ms.`,
          time: 'Just now',
          read: false,
        });
      }
    }, 2000);
  }

  public stop(): void {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
  }
}

export const mockWsStreamer = new MockWebSocketStreamer();
