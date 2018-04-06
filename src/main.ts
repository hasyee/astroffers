import { app, Menu, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import log = require('electron-log');
import { autoUpdater } from 'electron-updater';
import { dialog } from 'electron';
const isDev = require('electron-is-dev');

log.transports.file.level = 'info';
autoUpdater.logger = log;
log.info('App starting...');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;
let checkUpdateTimer;

const notifyAboutUpdate = version => {
  dialog.showMessageBox(
    win,
    {
      buttons: [ 'Relaunch' ],
      defaultId: 0,
      title: `New version: ${version}`,
      message: `New version (${version}) downloaded. Relaunch to install...`
    },
    index => {
      setImmediate(() => autoUpdater.quitAndInstall());
    }
  );
};

autoUpdater.on('download-progress', progress => {
  log.info('Download progress: ', Math.round(progress.percent));
});

autoUpdater.on('update-downloaded', ({ version }) => {
  clearInterval(checkUpdateTimer);
  notifyAboutUpdate(version);
});

autoUpdater.on('error', (event, error) => {
  //dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString());
  log.error('ERROR:', error == null ? 'unknown' : (error.stack || error).toString());
});

function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 1300,
    height: 850,
    webPreferences: {
      nodeIntegrationInWorker: true
    }
  });

  // and load the index.html of the app.
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, '../index.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // Open the DevTools.
  //win.webContents.openDevTools();

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
    app.quit();
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

app.on('ready', () => {
  autoUpdater.checkForUpdatesAndNotify();
  checkUpdateTimer = setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 5 * 60 * 1000);
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.on('ready', () => {
  if (process.platform === 'darwin') {
    Menu.setApplicationMenu(
      Menu.buildFromTemplate([
        {
          label: 'Edit',
          submenu: [
            { role: 'undo' },
            { role: 'redo' },
            { type: 'separator' },
            { role: 'cut' },
            { role: 'copy' },
            { role: 'paste' },
            { role: 'pasteandmatchstyle' },
            { role: 'delete' },
            { role: 'selectall' }
          ]
        },
        isDev
          ? {
              label: 'View',
              submenu: [
                { role: 'reload' },
                { role: 'forcereload' },
                { role: 'toggledevtools' },
                { type: 'separator' },
                { role: 'resetzoom' },
                { role: 'zoomin' },
                { role: 'zoomout' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
              ]
            }
          : {}
      ])
    );
  }
});
