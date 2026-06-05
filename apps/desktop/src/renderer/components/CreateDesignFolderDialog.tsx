import { useT } from '@open-codesign/i18n';
import { FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { useCodesignStore } from '../src/store';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreateSuccess: () => void;
}

export function CreateDesignFolderDialog({ visible, onClose, onCreateSuccess }: Props) {
  const t = useT();
  const createNewDesign = useCodesignStore((s) => s.createNewDesign);
  const renameCurrentDesign = useCodesignStore((s) => s.renameCurrentDesign);

  const [projectName, setProjectName] = useState('');
  const [basePath, setBasePath] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!visible) return null;

  async function handlePickFolder() {
    setBusy(true);
    setError(null);
    try {
      if (window.codesign?.snapshots?.pickWorkspaceFolder) {
        const picked = await window.codesign.snapshots.pickWorkspaceFolder();
        if (picked) setBasePath(picked);
      } else {
        setError('API de integración no disponible. Reinicia la aplicación.');
      }
    } catch {
      setError('Error al seleccionar la carpeta');
    } finally {
      setBusy(false);
    }
  }

  async function handleCreate() {
    setError(null);
    if (!basePath) { setError('Debes seleccionar una carpeta'); return; }
    if (!projectName.trim()) { setError('Debes escribir un nombre de proyecto'); return; }
    setBusy(true);
    try {
      // Siguiendo el flujo oficial: sólo pasamos la ruta base, el backend crea la subcarpeta.
      const design = await createNewDesign(basePath);
      if (design && projectName.trim()) {
        await renameCurrentDesign(projectName.trim());
      }
      setProjectName('');
      setBasePath(null);
      onCreateSuccess();
      onClose();
    } catch (e: any) {
      if (e?.message?.includes('already bound')) {
        setError('Ya existe un proyecto asociado a esa carpeta/nombre. Prueba otro nombre.');
      } else if (e?.message?.includes('EEXIST')) {
        setError('Ya existe una carpeta con ese nombre en la ruta seleccionada. Usa otro nombre.');
      } else {
        setError('No se pudo crear el proyecto. Verifica permisos de la carpeta.');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-sm w-full">
        <h2 className="text-lg font-bold mb-2">{t('canvas.newDesignDialog.title')}</h2>
        <p className="mb-4">{t('canvas.newDesignDialog.subtitle')}</p>

        <div className="mb-4">
          <label className="block font-semibold mb-1">
            {t('canvas.workspace.label')}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={basePath ?? t('canvas.newDesignDialog.noWorkspace')}
              className="border rounded px-2 py-1 flex-grow"
            />
            <button
              onClick={handlePickFolder}
              className="bg-gray-300 hover:bg-gray-400 px-3 rounded flex items-center gap-2"
              type="button"
              disabled={busy}
            >
              <FolderOpen className="size-4" />
              {t('canvas.workspace.choose')}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="block font-semibold mb-1" htmlFor="projectName">{t('create.fields.name')}</label>
          <input
            type="text"
            id="projectName"
            placeholder={t('create.fields.namePlaceholder')}
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            className="border rounded px-2 py-1 w-full"
            disabled={busy}
          />
        </div>

        {error && <div className="text-red-600 mb-4">{error}</div>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            type="button"
            disabled={busy}
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleCreate}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded"
            type="button"
            disabled={busy || !basePath || !projectName.trim()}
          >
            {t('canvas.newDesignDialog.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
