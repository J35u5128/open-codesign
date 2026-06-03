import type React from 'react';

interface CanvasToolbarProps {
  x: number;
  y: number;
  width: number;
  height: number;
  device: 'mobile' | 'tablet' | 'desktop' | 'custom';
  onDeviceChange: (device: 'mobile' | 'tablet' | 'desktop' | 'custom') => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

const DEVICE_LABELS = {
  mobile: 'Mobile',
  tablet: 'Tablet',
  desktop: 'Desktop',
  custom: 'Custom',
};

export function CanvasToolbar({
  x,
  y,
  width,
  height,
  device,
  onDeviceChange,
  onDelete,
  onDuplicate,
}: CanvasToolbarProps) {
  // Toolbar style: floating box centered horizontally above the node, with buttons
  const style: React.CSSProperties = {
    position: 'absolute',
    top: y - 36, // float 36 px above the design
    left: x + width / 2,
    transform: 'translateX(-50%)',
    backgroundColor: '#202020dd',
    borderRadius: 6,
    padding: '6px 12px',
    display: 'flex',
    gap: 8,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.9)',
    zIndex: 1000,
    userSelect: 'none',
    color: 'white',
    fontSize: 14,
    alignItems: 'center',
  };

  return (
    <div style={style} data-canvas-toolbar-root="true">
      <select
        value={device}
        onChange={(e) =>
          onDeviceChange(e.target.value as 'mobile' | 'tablet' | 'desktop' | 'custom')
        }
        style={{ backgroundColor: '#333', borderRadius: 4, color: 'white', border: 'none' }}
        onMouseDown={(e) => e.stopPropagation()} // Para evitar perder selection al interactuar con el desplegable
      >
        {Object.entries(DEVICE_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDuplicate();
        }}
        title="Duplicate Design (Ctrl+D)"
        style={{
          backgroundColor: '#333',
          borderRadius: 4,
          border: 'none',
          color: 'white',
          padding: '4px 8px',
          cursor: 'pointer',
        }}
      >
        Duplicate
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Delete Design (Delete)"
        style={{
          backgroundColor: '#b43434',
          borderRadius: 4,
          border: 'none',
          color: 'white',
          padding: '4px 8px',
          cursor: 'pointer',
        }}
      >
        Delete
      </button>
      <span style={{ marginLeft: 12 }}>
        {width.toFixed(0)} x {height.toFixed(0)}
      </span>
    </div>
  );
}
