import type React from 'react';
import { useEffect, useRef, useState } from 'react';
/* Eliminada importación de 'cn' porque no existe el módulo '../../utils/classnames' */
import { type CanvasNode, useCanvasStore } from '../store/slices/canvas';
import { CanvasModeBar } from './CanvasModeBar';
import { CanvasToolbar } from './CanvasToolbar';
import { DesignPreviewFrame } from './DesignPreviewFrame';

// Utilidades para la rejilla cuadriculada
const GRID_SIZE = 24;

function CanvasBackground({ zoom }: { zoom: number }) {
  // Usamos background CSS con dos lineas para crear grid cuadriculada
  const size = GRID_SIZE * zoom;
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(#2a2a2a 1px, transparent 1px),
          linear-gradient(90deg, #2a2a2a 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

interface CanvasNodeBoxProps {
  node: CanvasNode;
  selected: boolean;
  interactionMode: 'preview' | 'select' | 'comment';
  onSelect: (id: string) => void;
  onDrag: (id: string, pos: { x: number; y: number }) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  children?: React.ReactNode;
}

function CanvasNodeBox({
  node,
  selected,
  interactionMode,
  onSelect,
  onDrag,
  onResize,
  children,
}: CanvasNodeBoxProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const [resizeDragging, setResizeDragging] = useState(false);
  const resizeOrigin = useRef<{ x: number; y: number } | null>(null);
  const startSize = useRef<{ width: number; height: number }>({
    width: node.width,
    height: node.height,
  });

  function onDragStart(e: React.MouseEvent) {
    e.stopPropagation();
    if (e.button !== 0) return;
    // Ahora el modo que permite mover el nodo con Ctrl+drag es SELECT.
    // PREVIEW queda reservado para interactuar con el contenido (iframe) sin mover el frame.
    if (!(interactionMode === 'select' && e.ctrlKey)) return;
    setDragging(true);
    dragOrigin.current = { x: e.clientX, y: e.clientY };
  }

  // Cambia la posición SOLO al soltar el mouse (dragend), almacenando en refs durante el drag
  const dragPos = useRef<{ x: number; y: number }>({ x: node.x, y: node.y });

  function onDragMove(e: MouseEvent) {
    if (!dragging || !dragOrigin.current) return;
    e.preventDefault();
    const deltaX = e.clientX - dragOrigin.current.x;
    const deltaY = e.clientY - dragOrigin.current.y;
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    // Calcula y almacena nueva posición sin mutar el state aún
    dragPos.current = { x: dragPos.current.x + deltaX, y: dragPos.current.y + deltaY };
    // Mueve visualmente mientras se está arrastrando
    if (boxRef.current) {
      boxRef.current.style.left = `${dragPos.current.x}px`;
      boxRef.current.style.top = `${dragPos.current.y}px`;
    }
  }

  function onDragEnd() {
    setDragging(false);
    dragOrigin.current = null;
    // Al soltar, actualiza la posición en zustand y resetea el ref visual
    onDrag(node.id, dragPos.current);
    // Resetea el ref para el próximo drag
    dragPos.current = { x: node.x, y: node.y };
  }

  function onResizeStart(e: React.MouseEvent) {
    e.stopPropagation();
    if (e.button !== 0) return;
    setResizeDragging(true);
    resizeOrigin.current = { x: e.clientX, y: e.clientY };
    startSize.current = { width: node.width, height: node.height };
  }

  function onResizeMove(e: MouseEvent) {
    if (!resizeDragging || !resizeOrigin.current) return;
    e.preventDefault();
    const deltaX = e.clientX - resizeOrigin.current.x;
    const deltaY = e.clientY - resizeOrigin.current.y;
    resizeOrigin.current = { x: e.clientX, y: e.clientY };
    const newWidth = Math.max(50, startSize.current.width + deltaX);
    const newHeight = Math.max(50, startSize.current.height + deltaY);
    onResize(node.id, { width: newWidth, height: newHeight });
  }

  function onResizeEnd() {
    setResizeDragging(false);
    resizeOrigin.current = null;
  }

  useEffect(() => {
    if (dragging) {
      // Inicia desde la posición actual
      dragPos.current = { x: node.x, y: node.y };
      window.addEventListener('mousemove', onDragMove);
      window.addEventListener('mouseup', onDragEnd);
      return () => {
        window.removeEventListener('mousemove', onDragMove);
        window.removeEventListener('mouseup', onDragEnd);
      };
    }
  }, [dragging, node.x, node.y]);

  useEffect(() => {
    if (resizeDragging) {
      window.addEventListener('mousemove', onResizeMove);
      window.addEventListener('mouseup', onResizeEnd);
      return () => {
        window.removeEventListener('mousemove', onResizeMove);
        window.removeEventListener('mouseup', onResizeEnd);
      };
    }
  }, [resizeDragging]);

  return (
    <div
      ref={boxRef}
      onClick={(e) => {
        // Si haces click *sobre el bloque*, seleccionas el nodo,
        // pero si haces click/adentro del iframe, NO fuerzas selección ni bloqueas la interacción.
        if (
          e.target instanceof HTMLIFrameElement ||
          (e.target instanceof HTMLElement && e.target.closest('iframe'))
        ) {
          return;
        }
        e.stopPropagation();
        onSelect(node.id);
      }}
      onMouseDown={onDragStart}
      style={{
        position: 'absolute',
        top: node.y,
        left: node.x,
        width: node.width,
        height: node.height,
        borderRadius: 4,
        border: selected ? '2px solid #3b82f6' : '1px solid #666',
        backgroundColor: selected ? 'rgba(59,130,246,0.1)' : '#222',
        boxShadow: selected ? '0 0 8px rgba(59,130,246,0.5)' : undefined,
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: selected ? '#3b82f6' : '#aaa',
        fontSize: 14,
        fontWeight: selected ? '600' : '400',
        textShadow: selected ? '0 0 2px rgba(59,130,246,0.6)' : 'none',
        touchAction: 'none',
      }}
    >
      {/* Overlay para selección y manipulación del nodo.
          ¡Importante!: en modo PREVIEW, el overlay NO debe renderizarse en absoluto,
          ya que esto puede romper la interacción bubbling/captura real con el iframe.
          Renderiza el overlay sólo en los modos select y comment. */}
      {(interactionMode === 'select' || interactionMode === 'comment') && (
        <div
          style={{
            position: 'absolute',
            zIndex: 1001,
            inset: 0,
            pointerEvents: 'auto',
            background: 'transparent',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node.id);
          }}
        />
      )}
      <div style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: 'none' }}>
        {children ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              inset: 0,
              pointerEvents: 'auto',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {children}
          </div>
        ) : (
          <span
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              color: '#777',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            {node.title}
          </span>
        )}
      </div>
      {selected && node.device === 'custom' ? (
        <div
          onMouseDown={onResizeStart}
          title="Arrastra para cambiar ancho/alto"
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            width: 16,
            height: 16,
            backgroundColor: '#3b82f6',
            cursor: 'nwse-resize',
            borderRadius: 2,
            touchAction: 'none',
            zIndex: 2,
          }}
        />
      ) : null}
    </div>
  );
}

export function CanvasPane() {
  const {
    nodes,
    selectedNodeId,
    selectNode,
    zoom,
    offsetX,
    offsetY,
    interactionMode,
    setZoom,
    setOffset,
    updateNode,
  } = useCanvasStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Selección del nodo activo
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null;

  function handleDuplicateSelected() {
    if (!selectedNode) return;
    const cloneId = `${selectedNode.id}-copy-${Date.now().toString(36)}`;
    useCanvasStore.getState().addNode({
      ...selectedNode,
      id: cloneId,
      x: selectedNode.x + 40,
      y: selectedNode.y + 40,
      isPrimary: false,
    });
    selectNode(cloneId);
  }

  function handleDeleteSelected() {
    if (!selectedNode) return;
    useCanvasStore.getState().removeNode(selectedNode.id);
  }

  function handleDeviceChange(device: 'mobile' | 'tablet' | 'desktop' | 'custom') {
    if (!selectedNode) return;
    // Configuración simple de presets
    const presets = {
      mobile: { width: 390, height: 844 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1280, height: 720 },
      custom: { width: selectedNode.width, height: selectedNode.height },
    } as const;
    const preset = presets[device];
    updateNode(selectedNode.id, {
      device,
      width: preset.width,
      height: preset.height,
    });
  }

  // Control pan by dragging the background
  const [dragging, setDragging] = useState(false);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);

  // Handle wheel zoom + pan.
  // IMPORTANTE: en modo PREVIEW no interceptamos el wheel en absoluto,
  // porque los eventos de scroll dentro de iframes NO burbujean correctamente
  // y React termina bloqueando el scroll nativo si hacemos preventDefault.
  function onWheel(e: React.WheelEvent) {
    if (interactionMode === 'preview') {
      return; // deja scroll completamente nativo
    }

    e.preventDefault();

    if (e.ctrlKey) {
      // Zoom
      const delta = -e.deltaY / 300;
      const newZoom = Math.min(Math.max(zoom + delta, 0.2), 3);
      setZoom(newZoom);
    } else {
      // Pan
      setOffset(offsetX - e.deltaX, offsetY - e.deltaY);
    }
  }

  // Mouse drag pan handlers
  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    if (e.target !== containerRef.current) return; // only background drag
    setDragging(true);
    dragOrigin.current = { x: e.clientX, y: e.clientY };
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragging || dragOrigin.current === null) return;

    const deltaX = e.clientX - dragOrigin.current.x;
    const deltaY = e.clientY - dragOrigin.current.y;
    setOffset(offsetX + deltaX, offsetY + deltaY);

    dragOrigin.current = { x: e.clientX, y: e.clientY };
  }
  function onMouseUp() {
    setDragging(false);
    dragOrigin.current = null;
  }
  function onClickBackground(e: React.MouseEvent) {
    // Si el click viene de la toolbar (o sus hijos), no deseleccionar
    const target = e.target as HTMLElement | null;
    if (target && target.closest?.('[data-canvas-toolbar-root="true"]')) {
      return;
    }
    selectNode(null);
  }

  // Mock node inicial para visualizar el canvas con al menos un cuadro
  useEffect(() => {
    if (nodes.length === 0) {
      // Añadir un nodo de prueba solo si está vacío
      useCanvasStore.getState().addNode({
        id: 'mock-1',
        title: 'Design Principal',
        x: 150,
        y: 120,
        width: 420,
        height: 300,
        device: 'desktop',
        isPrimary: true,
      });
      selectNode('mock-1');
    }
  }, [nodes, selectNode]);

  function handleNodeDrag(id: string, pos: { x: number; y: number }) {
    updateNode(id, { x: pos.x, y: pos.y });
  }

  function handleNodeResize(id: string, size: { width: number; height: number }) {
    updateNode(id, { width: size.width, height: size.height });
  }

  // Expone setters globales para CanvasToolbar "custom" input
  (window as any).__canvasResizeWidth = (val: number) => {
    const sel: CanvasNode | undefined = nodes.find((n) => n.id === selectedNodeId);
    if (sel && sel.device === 'custom' && val > 0) {
      updateNode(sel.id, { width: val });
    }
  };
  (window as any).__canvasResizeHeight = (val: number) => {
    const sel: CanvasNode | undefined = nodes.find((n) => n.id === selectedNodeId);
    if (sel && sel.device === 'custom' && val > 0) {
      updateNode(sel.id, { height: val });
    }
  };

  return (
    <div
      ref={containerRef}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onClick={onClickBackground}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#121212',
        overflow: 'hidden',
        userSelect: dragging ? 'none' : 'auto',
        cursor: dragging ? 'grabbing' : 'grab',
      }}
    >
      <CanvasBackground zoom={zoom} />
      <div
        style={{
          position: 'absolute',
          top: offsetY,
          left: offsetX,
          transform: `scale(${zoom})`,
          transformOrigin: 'top left',
          width: '100%',
          height: '100%',
          transition: dragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        {nodes.map((node) => (
          <CanvasNodeBox
            key={node.id}
            node={node}
            selected={selectedNodeId === node.id}
            interactionMode={interactionMode}
            onSelect={selectNode}
            onDrag={handleNodeDrag}
            onResize={handleNodeResize}
          >
            <DesignPreviewFrame width={node.width} height={node.height} device={node.device} />
          </CanvasNodeBox>
        ))}
        {selectedNode ? (
          <CanvasToolbar
            x={selectedNode.x}
            y={selectedNode.y}
            width={selectedNode.width}
            height={selectedNode.height}
            device={selectedNode.device}
            onDeviceChange={handleDeviceChange}
            onDuplicate={handleDuplicateSelected}
            onDelete={handleDeleteSelected}
          />
        ) : null}
      </div>
      <CanvasModeBar />
    </div>
  );
}
