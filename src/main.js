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
  window.setMenu(null);
}

app.whenReady().then(criarJanela);

ipcMain.on('fill_inputs', (event) => {
  dialog.showMessageBoxSync(window, {
    message: 'please fill all the inputs',
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) criarJanela();
});
