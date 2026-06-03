// Canvas sustituye al preview clásico temporalmente
import { CanvasPane } from './CanvasPane';

export interface PreviewPaneProps {
  onPickStarter: (prompt: string) => void;
}

// Sustituye completamente el antiguo layout por el nuevo canvas.
// Pronto se podrá migrar la integración avanzada; por ahora, canvas puro.
export function PreviewPane({ onPickStarter }: PreviewPaneProps) {
  return <CanvasPane />;
}
