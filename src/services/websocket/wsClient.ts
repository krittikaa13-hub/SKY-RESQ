/**
 * @file src/services/websocket/wsClient.ts
 * Enterprise WebSocket Client with Auto-Reconnect, Heartbeat Ping/Pong & Sub-Channel Event Multiplexing
 */

import { WsMessage } from '../../types';

type MessageHandler<T = unknown> = (data: T) => void;

export class QuantumWebSocketClient {
  private url: string;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<MessageHandler>> = new Map();
  private reconnectInterval = 3000;
  private pingIntervalTimer: NodeJS.Timeout | null = null;
  private isExplicitClose = false;

  constructor(url?: string) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    this.url = url || `${protocol}//${window.location.host}/ws/telemetry`;
  }

  public connect(): void {
    this.isExplicitClose = false;
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('[WebSocket] Connected to Q-OPTIMA Telemetry Stream');
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const message: WsMessage = JSON.parse(event.data);
          this.emit(message.type, message.payload);
        } catch (err) {
          console.warn('[WebSocket] Unparseable frame received:', event.data);
        }
      };

      this.ws.onclose = () => {
        console.log('[WebSocket] Connection closed.');
        this.stopHeartbeat();
        if (!this.isExplicitClose) {
          setTimeout(() => this.connect(), this.reconnectInterval);
        }
      };

      this.ws.onerror = (err) => {
        console.warn('[WebSocket] Connection error:', err);
      };
    } catch (e) {
      console.warn('[WebSocket] Failed to instantiate WebSocket:', e);
    }
  }

  public disconnect(): void {
    this.isExplicitClose = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public subscribe<T>(eventType: WsMessage['type'], handler: MessageHandler<T>): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler as MessageHandler);

    return () => {
      const set = this.listeners.get(eventType);
      if (set) {
        set.delete(handler as MessageHandler);
      }
    };
  }

  private emit(eventType: string, payload: unknown): void {
    const handlers = this.listeners.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => handler(payload));
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.pingIntervalTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING', timestamp: new Date().toISOString() }));
      }
    }, 15000);
  }

  private stopHeartbeat(): void {
    if (this.pingIntervalTimer) {
      clearInterval(this.pingIntervalTimer);
      this.pingIntervalTimer = null;
    }
  }
}

export const wsClient = new QuantumWebSocketClient();
