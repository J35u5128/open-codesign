import { buildPreviewDocument } from '@open-codesign/runtime';
import { useMemo } from 'react';
import { inferPreviewSourcePath } from '../preview/workspace-source';
import { useCodesignStore } from '../store';

interface DesignPreviewFrameProps {
  width: number;
  height: number;
  device: 'mobile' | 'tablet' | 'desktop' | 'custom';
}

/**
 * Versión inicial simplificada del antiguo PreviewSlot,
 * reutilizable dentro del Canvas.
 *
 * Más adelante moveremos aquí también la lógica avanzada
 * de mensajes postMessage, comentarios, pines, etc.
 */
export function DesignPreviewFrame({ width, height }: DesignPreviewFrameProps) {
  const previewSource = useCodesignStore((s) => s.previewSource);

  const srcDoc = useMemo(() => {
    if (!previewSource) {
      return `
        <html>
          <body style="margin:0;background:#111;color:#888;display:flex;align-items:center;justify-content:center;font-family:sans-serif;">
            No preview yet
          </body>
        </html>
      `;
    }
    return buildPreviewDocument(previewSource, {
      path: inferPreviewSourcePath(previewSource),
    });
  }, [previewSource]);

  return (
    <iframe
      title="Design preview"
      sandbox="allow-scripts"
      srcDoc={srcDoc}
      style={{
        width: width,
        height: height,
        border: 0,
        background: '#fff',
      }}
    />
  );
}
