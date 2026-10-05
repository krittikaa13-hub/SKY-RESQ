"""
backend/network/topology.py
UAV Dynamic Graph Topology Manager
"""

class SwarmTopologyGraph:
    def __init__(self, num_nodes: int = 12):
        self.num_nodes = num_nodes

    def get_adjacency_matrix(self):
        return [[1 if i != j else 0 for j in range(self.num_nodes)] for i in range(self.num_nodes)]
