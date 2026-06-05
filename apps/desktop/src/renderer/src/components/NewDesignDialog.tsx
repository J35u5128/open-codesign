import path from 'path';
import { useT } from '@open-codesign/i18n';
import { FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { useCodesignStore } from '../store';

export function NewDesignDialog() {
  const t = useT();
  const open = useCodesignStore((s) => s.newDesignDialogOpen);
  const close = useCodesignStore((s) => s.closeNewDesignDialog);
  const createNewDesign = useCodesignStore((s) => s.createNewDesign);
  const renameCurrentDesign = useCodesignStore((s) => s.renameCurrentDesign);
  const setView = useCodesignStore((s) => s.setView);

  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [picking, setPicking] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string|null>(null);

  if (!open) return null;

  // Eliminar función local renameCurrentDesign: usaremos directamente del store

  // Le damos la vuelta: primero nombre, luego carpeta
  async function handlePickFolder() {
    if (!window.codesign?.snapshots?.pickWorkspaceFolder) return;
    setPicking(true);
    try {
      const picked = await window.codesign.snapshots.pickWorkspaceFolder();
      if (picked) setSelectedPath(picked);
    } finally {
      setPicking(false);
    }
  }

  async function handleCreate() {
    if (!selectedPath) { setError('Selecciona una carpeta válida.'); return; }
    if (!projectName.trim()) { setError('El nombre del proyecto es obligatorio.'); return; }
    setError(null);

  setCreating(true);
  try {
    // Import estático de path arriba, no código quebrado dentro de la función
    const finalFolder = path.join(selectedPath, projectName.trim());
    const design = await createNewDesign(finalFolder);
    // Si quieres forzar el nombre mostrado, sólo si difiere de la carpeta:
    // if (design && projectName.trim() !== design.name) await renameCurrentDesign(projectName.trim());
    close();
    setSelectedPath(null);
    setProjectName('');
    setError(null);
    if (design) setView('workspace');
  } catch (e: any) {
    if (e?.message?.includes('already bound')) {
      setError('Ya existe un proyecto asociado a esa carpeta/nombre. Prueba otro nombre.');
    } else {
      setError('No se pudo crear el proyecto. Verifica la carpeta.');
    }
  } finally {
    setCreating(false);
  }
}

  const busy = picking || creating;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Crear proyecto de diseño"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--color-overlay)] animate-[overlay-in_120ms_ease-out]"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) {
          close();
          setSelectedPath(null);
          setProjectName('');
          setError(null);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && !busy) {
          close();
          setSelectedPath(null);
          setProjectName('');
          setError(null);
        }
      }}
    >
      <div
        role="document"
        className="w-full max-w-sm rounded-2xl bg-[#fef8f3] border border-[#eddecd] shadow-lg p-6 space-y-5 animate-[panel-in_160ms_ease-out]"
      >
        <div className="space-y-1 pb-3 border-b border-[var(--color-border)]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Crear proyecto de diseño</h3>
          <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
            Introduce el nombre de tu diseño y selecciona una carpeta donde se guardará.<br/>
            <span className="font-semibold text-[#c96c42]">Ambos campos son obligatorios.</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--color-text-primary)]">
            {t('create.fields.name')}
          </label>
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder={t('create.fields.namePlaceholder')}
            className="w-full rounded-md border border-[#eddecd] bg-[#fbf5ef] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[#bbab9a] focus:outline-none focus:ring-2 focus:ring-[#d39f8e] focus:border-transparent"
            autoFocus
          />
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            Carpeta destino
          </label>
          <div className="flex items-center gap-2 rounded-md border border-[#eddecd] bg-[#fbf5ef] px-3 py-2 text-[var(--color-text-primary)] font-mono">
            <span className="flex-grow truncate text-xs">
              {selectedPath ?? 'Selecciona una carpeta'}
            </span>
            <button
              type="button"
              onClick={() => void handlePickFolder()}
              disabled={busy}
              className="flex items-center gap-1.5 shrink-0 h-7 px-2.5 rounded-md text-xs border border-[#d7c6b8] hover:bg-[#eaded5] hover:text-[#735241] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Elegir carpeta destino"
            >
              <FolderOpen className="size-4" />
              Elegir
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-[#ffefec] border border-[#ffd2ce] text-[#c5482c] rounded-md px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              if (!busy) {
                close();
                setSelectedPath(null);
                setProjectName('');
                setError(null);
              }
            }}
            disabled={busy}
            className="h-9 px-3 rounded-md text-sm text-[var(--color-text-secondary)] hover:bg-[#eaded5] hover:text-[#4e4034] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={busy || !selectedPath || !projectName.trim()}
            className="h-9 px-3 rounded-md bg-[#b54b22] text-[#fff4e6] text-sm font-semibold hover:bg-[#8f3518] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('canvas.newDesignDialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
