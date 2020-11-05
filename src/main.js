const { app, BrowserWindow, dialog, ipcMain } = require('electron');

let window;

function criarJanela() {
  window = new BrowserWindow({
    width: 800,
    height: 600,
    icon: './src/assets/icon.ico',
    webPreferences: {
      nodeIntegration: true,
    },
  });

  window.setMenu(null);
  window.loadFile(`${__dirname}/index.html`);
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
          name: 'MP4',
          extensions: ['mp4'],
        },
        {
          name: 'MKV',
          extensions: ['mkv'],
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
