// Nuevo slice para manejar el estado del Canvas con nodos de diseños.

import type { StateCreator } from 'zustand';
import { create } from 'zustand';

export type CanvasDevice = 'mobile' | 'tablet' | 'desktop' | 'custom';

export interface CanvasNode {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  device: CanvasDevice;
  isPrimary?: boolean;
}

export interface CanvasState {
  nodes: CanvasNode[];
  selectedNodeId: string | null;
  zoom: number;
  offsetX: number;
  offsetY: number;
  // Actions
  addNode: (node: CanvasNode) => void;
  removeNode: (id: string) => void;
  updateNode: (id: string, partial: Partial<CanvasNode>) => void;
  selectNode: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setOffset: (offsetX: number, offsetY: number) => void;
  reset: () => void;
}

export const useCanvasStore = create<CanvasState>(((
  set: (fn: (state: CanvasState) => Partial<CanvasState> | CanvasState) => void,
  get: () => CanvasState,
) => ({
  nodes: [],
  selectedNodeId: null,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  addNode: (node: CanvasNode) => set((state: CanvasState) => ({ nodes: [...state.nodes, node] })),
  removeNode: (id: string) =>
    set((state: CanvasState) => ({
      nodes: state.nodes.filter((n: CanvasNode) => n.id !== id),
      selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
    })),
  updateNode: (id: string, partial: Partial<CanvasNode>) =>
    set((state: CanvasState) => ({
      nodes: state.nodes.map((n: CanvasNode) => (n.id === id ? { ...n, ...partial } : n)),
    })),
  selectNode: (id: string | null) => set(() => ({ selectedNodeId: id })),
  setZoom: (zoom: number) => set(() => ({ zoom })),
  setOffset: (offsetX: number, offsetY: number) => set(() => ({ offsetX, offsetY })),
  reset: () =>
    set(() => ({
      nodes: [],
      selectedNodeId: null,
      zoom: 1,
      offsetX: 0,
      offsetY: 0,
    })),
})) as StateCreator<CanvasState>);
