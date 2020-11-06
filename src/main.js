const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const Store = require('electron-store');

const store = new Store();

let window;

if (!store.has('disableHardwareAcceleration')) {
  store.set('disableHardwareAcceleration', false);
}
if (store.get('disableHardwareAcceleration') === true) {
  app.disableHardwareAcceleration();
}

function criarJanela() {
  window = new BrowserWindow({
    width: 900,
    height: 600,
    icon: './src/assets/icon.ico',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  window.loadFile(`${__dirname}/index.html`);
  window.removeMenu();
}

app.whenReady().then(criarJanela);

ipcMain.on('download-complete', (event) => {
  dialog.showMessageBox(window, {
    title: 'Download completed',
    message: 'Video downloaded with success',
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
    .then((promise) => {
      event.reply('file-path', promise.filePath);
    });
});

ipcMain.on('fill_inputs', (event) => {
  dialog.showMessageBoxSync(window, {
    title: 'Empty inputs',
    message: 'Please fill all the inputs',
  });
});

ipcMain.on('invalid_url', (event) => {
  dialog.showMessageBoxSync(window, {
    title: 'Invalid URL',
    message: 'Type a valid YouTube URL',
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) criarJanela();
});
