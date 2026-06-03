import type React from 'react';
import { useCanvasStore } from '../store/slices/canvas';

type InteractionMode = 'preview' | 'select' | 'comment';

export function CanvasModeBar() {
  const interactionMode = useCanvasStore((s) => s.interactionMode);
  const setInteractionMode = useCanvasStore((s) => s.setInteractionMode);

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    backgroundColor: active ? '#3b82f6' : '#2a2a2a',
    color: active ? '#fff' : '#aaa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 12,
  });

  return (
    <div
      style={{
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 8,
        backgroundColor: '#1a1a1a',
        borderRadius: 12,
        boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
        zIndex: 2000,
      }}
    >
      <button
        style={buttonStyle(interactionMode === 'preview')}
        onClick={() => setInteractionMode('preview')}
        title="Preview mode"
      >
        👁
      </button>

      <button
        style={buttonStyle(interactionMode === 'select')}
        onClick={() => setInteractionMode('select')}
        title="Select elements"
      >
        🎯
      </button>

      <button
        style={buttonStyle(interactionMode === 'comment')}
        onClick={() => setInteractionMode('comment')}
        title="Comment mode"
      >
        💬
      </button>
    </div>
  );
}
