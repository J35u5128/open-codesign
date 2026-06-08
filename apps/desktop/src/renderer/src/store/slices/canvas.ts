// Nuevo slice para manejar el estado del Canvas con nodos de diseños.

import type { StateCreator } from 'zustand';
import { create } from 'zustand';

export type CanvasDevice = 'mobile' | 'tablet' | 'desktop' | 'custom';

export interface Comment {
  id: string;
  selector: string;
  rect: { top: number; left: number; width: number; height: number };
  text: string;
}

export interface CanvasNode {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  device: CanvasDevice;
  isPrimary?: boolean;
  comments: Comment[];
}

export type CanvasInteractionMode = 'preview' | 'select' | 'comment';

export interface CanvasState {
  // Asociación de nodos a proyectos usando un map
  nodesByProjectId: Record<string, CanvasNode[]>;
  activeProjectId: string | null;
  selectedNodeId: string | null;
  zoom: number;
  offsetX: number;
  offsetY: number;
  interactionMode: CanvasInteractionMode;
  setInteractionMode: (mode: CanvasInteractionMode) => void;

  // Actions
  setActiveProjectId: (projectId: string) => void;

  addNode: (projectId: string, node: CanvasNode) => void;
  removeNode: (projectId: string, nodeId: string) => void;
  updateNode: (projectId: string, nodeId: string, partial: Partial<CanvasNode>) => void;
  selectNode: (id: string | null) => void;
  setZoom: (zoom: number) => void;
  setOffset: (offsetX: number, offsetY: number) => void;
  reset: () => void;
}
export const useCanvasStore = create<CanvasState>(((
  set: (fn: (state: CanvasState) => Partial<CanvasState> | CanvasState) => void,
  get: () => CanvasState,
) => ({
  nodesByProjectId: {},
  activeProjectId: null,
  selectedNodeId: null,
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
  interactionMode: 'preview',
  setInteractionMode: (mode) => set(() => ({ interactionMode: mode })),
  setActiveProjectId: (projectId: string) => set(() => ({ activeProjectId: projectId })),
  addNode: (projectId: string, node: CanvasNode) => set((state: CanvasState) => ({
    nodesByProjectId: {
      ...state.nodesByProjectId,
      [projectId]: [...(state.nodesByProjectId[projectId] ?? []), node],
    },
  })),
  removeNode: (projectId: string, nodeId: string) => set((state: CanvasState) => {
    const nodesForProject = state.nodesByProjectId[projectId] ?? [];
    const filteredNodes = nodesForProject.filter(n => n.id !== nodeId);
    return {
      nodesByProjectId: {
        ...state.nodesByProjectId,
        [projectId]: filteredNodes,
      },
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    };
  }),
  updateNode: (projectId: string, nodeId: string, partial: Partial<CanvasNode>) => set((state: CanvasState) => {
    const nodesForProject = state.nodesByProjectId[projectId] ?? [];
    const updatedNodes = nodesForProject.map(n => n.id === nodeId
      ? { ...n, ...partial, comments: Array.isArray((partial as any).comments) ? (partial as any).comments : n.comments ?? [] }
      : n
    );
    return {
      nodesByProjectId: {
        ...state.nodesByProjectId,
        [projectId]: updatedNodes,
      },
    };
  }),
  selectNode: (id: string | null) => set(() => ({ selectedNodeId: id })),
  setZoom: (zoom: number) => set(() => ({ zoom })),
  setOffset: (offsetX: number, offsetY: number) => set(() => ({ offsetX, offsetY })),
  reset: () => set(() => ({
    nodesByProjectId: {},
    activeProjectId: null,
    selectedNodeId: null,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    interactionMode: 'preview',
  })),

  addCommentToNode: (nodeId: string, comment: Comment) =>
    set((state: CanvasState) => {
      if (!state.activeProjectId) return {};
      const nodesForProject = state.nodesByProjectId[state.activeProjectId] ?? [];
      const updatedNodes = nodesForProject.map(n =>
        n.id === nodeId ? { ...n, comments: [...(n.comments ?? []), comment] } : n
      );
      return {
        nodesByProjectId: {
          ...state.nodesByProjectId,
          [state.activeProjectId]: updatedNodes,
        },
      };
    }),

  updateCommentOnNode: (nodeId: string, commentId: string, newText: string) =>
    set((state: CanvasState) => {
      if (!state.activeProjectId) return {};
      const nodesForProject = state.nodesByProjectId[state.activeProjectId] ?? [];
      const updatedNodes = nodesForProject.map(n =>
        n.id === nodeId
          ? {
              ...n,
              comments: n.comments?.map(c => (c.id === commentId ? { ...c, text: newText } : c)),
            }
          : n
      );
      return {
        nodesByProjectId: {
          ...state.nodesByProjectId,
          [state.activeProjectId]: updatedNodes,
        },
      };
    }),

  removeCommentFromNode: (nodeId: string, commentId: string) =>
    set((state: CanvasState) => {
      if (!state.activeProjectId) return {};
      const nodesForProject = state.nodesByProjectId[state.activeProjectId] ?? [];
      const updatedNodes = nodesForProject.map(n =>
        n.id === nodeId
          ? {
              ...n,
              comments: n.comments?.filter(c => c.id !== commentId),
            }
          : n
      );
      return {
        nodesByProjectId: {
          ...state.nodesByProjectId,
          [state.activeProjectId]: updatedNodes,
        },
      };
    }),
})) as StateCreator<CanvasState>);
