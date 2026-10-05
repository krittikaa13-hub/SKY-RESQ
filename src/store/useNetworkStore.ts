/**
 * @file src/store/useNetworkStore.ts
 * Zustand store for Swarm Network Topology & Packet telemetry
 */

import { create } from 'zustand';
import { UAVNode, NetworkPacket } from '../types';
import { INITIAL_UAV_NODES, INITIAL_PACKETS } from '../data/mockData';

interface NetworkState {
  nodes: UAVNode[];
  packets: NetworkPacket[];
  selectedNodeId: string | null;
  filterCluster: string | 'All';
  
  // Actions
  setNodes: (nodes: UAVNode[]) => void;
  setPackets: (packets: NetworkPacket[]) => void;
  selectNode: (id: string | null) => void;
  setClusterFilter: (cluster: string) => void;
  toggleQuarantine: (nodeId: string) => void;
  resetTrust: (nodeId: string) => void;
  addPacket: (packet: NetworkPacket) => void;
  updatePacketStatus: (packetId: string, status: NetworkPacket['status']) => void;
  updateNodeCoordinates: (id: string, x: number, y: number) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  nodes: INITIAL_UAV_NODES,
  packets: INITIAL_PACKETS,
  selectedNodeId: null,
  filterCluster: 'All',

  setNodes: (nodes) => set({ nodes }),
  setPackets: (packets) => set({ packets }),
  selectNode: (selectedNodeId) => set({ selectedNodeId }),
  setClusterFilter: (filterCluster) => set({ filterCluster }),

  toggleQuarantine: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.map((node) => {
        if (node.id === nodeId) {
          const isQuarantined = node.status === 'quarantined';
          const newStatus = isQuarantined ? 'healthy' : 'quarantined';
          const newTrust = isQuarantined ? 85 : 12;
          return {
            ...node,
            status: newStatus,
            trustScore: newTrust,
            riskScore: 100 - newTrust,
          };
        }
        return node;
      }),
    })),

  resetTrust: (nodeId) =>
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? { ...node, trustScore: 95.0, riskScore: 5.0, status: 'healthy' }
          : node
      ),
    })),

  addPacket: (packet) =>
    set((state) => ({ packets: [packet, ...state.packets.slice(0, 49)] })),

  updatePacketStatus: (packetId, status) =>
    set((state) => ({
      packets: state.packets.map((p) =>
        p.id === packetId ? { ...p, status } : p
      ),
    })),

  updateNodeCoordinates: (id, x, y) =>
    set((state) => ({
      nodes: state.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
    })),
}));
