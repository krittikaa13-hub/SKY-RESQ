/**
 * @file src/hooks/useTelemetryStream.ts
 * Hook for subscribing to real-time WebSocket telemetry updates
 */

import { useEffect } from 'react';
import { wsClient } from '../services/websocket/wsClient';
import { useNetworkStore } from '../store/useNetworkStore';
import { NetworkPacket } from '../types';

export const useTelemetryStream = () => {
  const { addPacket } = useNetworkStore();

  useEffect(() => {
    wsClient.connect();
    const unsubscribe = wsClient.subscribe<NetworkPacket>('PACKET_EVENT', (packet) => {
      addPacket(packet);
    });

    return () => {
      unsubscribe();
      wsClient.disconnect();
    };
  }, [addPacket]);
};
