const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const Store = require('electron-store');
require('v8-compile-cache');

const store = new Store();

let window;

if (!store.has('disableHardwareAcceleration')) {
  store.set('disableHardwareAcceleration', false);
}
if (store.get('disableHardwareAcceleration') === true) {
  app.disableHardwareAcceleration();
}

function createWindow() {
  window = new BrowserWindow({
    width: 900,
    height: 600,
    icon: './src/assets/icon.ico',
    show: false,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false,
    },
  });

  window.loadFile(`${__dirname}/index.html`);
  window.removeMenu();

  window.once('ready-to-show', () => {
    window.show();
  });
}

app.whenReady().then(createWindow);

ipcMain.on('invalid-path', () => {
  window.reload();
});

ipcMain.on('download-complete', () => {
  dialog
    .showMessageBox(window, {
      title: 'Download complete',
      message: 'Video downloaded successfully.',
    })
    .then(() => {
      window.reload();
    });
});

ipcMain.on('video-error', () => {
  dialog.showMessageBox(window, {
    title: 'Download error',
    message: 'An error occurred while trying to download the video.',
  });
});

ipcMain.on('open-dialog', (event) => {
  dialog
    .showSaveDialog({
      filters: [
        {
          name: 'MPEG-4',
          extensions: ['mp4'],
        },
        {
          name: 'Matroska',
          extensions: ['mkv'],
        },
        {
          name: 'Flash Video',
          extensions: ['flv'],
        },
        {
          name: 'AVI',
          extensions: ['avi'],
        },
      ],
    })
    .then((dialogInfo) => {
      event.reply('file-path', dialogInfo.filePath);
    });
});

ipcMain.on('fill-inputs', () => {
  dialog.showMessageBoxSync(window, {
    title: 'Empty inputs',
    message: 'Please fill in all fields.',
  });
});

ipcMain.on('invalid-url', () => {
  dialog.showMessageBoxSync(window, {
    title: 'Invalid URL',
    message: 'Type a valid YouTube URL.',
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
