import type { BrowserWindow as ElectronBrowserWindow } from 'electron';
import { autoUpdater } from 'electron-updater';
import { app, ipcMain } from '../electron-runtime';
import { getLogger } from '../logger';
import { getUpdateErrorMessage, isMissingUpdateMetadataError } from '../update-errors';

// Cached update-available payload so a window opened after the event still
// shows the banner. Cleared only on app quit (matching the one-shot nature
// of autoUpdater — a new check will re-emit if still applicable).
let pendingUpdateAvailable: unknown = null;

export function getPendingUpdate(): unknown {
  return pendingUpdateAvailable;
}

export function setupAutoUpdater(getMainWindow: () => ElectronBrowserWindow | null): void {
  if (!app.isPackaged) return;
  autoUpdater.autoDownload = false;
  autoUpdater.on('update-available', (info) => {
    pendingUpdateAvailable = info;
    getMainWindow()?.webContents.send('2design:update-available', info);
  });
  autoUpdater.on('error', (err) => {
    const log = getLogger('main:updates');
    const message = getUpdateErrorMessage(err);
    if (isMissingUpdateMetadataError(err)) {
      log.warn('autoUpdater.missingChannel', { message });
      return;
    }
    log.error('autoUpdater.error', {
      message,
      stack: err.stack,
    });
  });
  ipcMain.handle('2design:check-for-updates', () => autoUpdater.checkForUpdates());
  ipcMain.handle('2design:download-update', () => autoUpdater.downloadUpdate());
  ipcMain.handle('2design:install-update', () => autoUpdater.quitAndInstall());
}
