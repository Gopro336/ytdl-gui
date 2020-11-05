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

  window.loadFile(`${__dirname}/index.html`);
}

app.whenReady().then(criarJanela);

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
    title: 'fill the inputs',
    message: 'please fill all the inputs',
  });
});

ipcMain.on('invalid_url', (event) => {
  dialog.showMessageBoxSync(window, {
    title: 'invalid url',
    message: 'please enter a valid youtube url',
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) criarJanela();
});
