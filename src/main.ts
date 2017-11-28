import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';
import log = require('electron-log');
import { autoUpdater } from 'electron-updater';
import { dialog } from 'electron';

log.transports.file.level = 'info';
autoUpdater.logger = log;
log.info('App starting...');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

const notifyAboutUpdate = () => {
  dialog.showMessageBox(
    {
      buttons: [ 'Install and relaunch', 'Later' ],
      defaultId: 0,
      title: 'Install Updates',
      message: 'Updates downloaded, application will be quit for update...'
    },
    index => {
      if (index === 0) {
        setImmediate(() => autoUpdater.quitAndInstall());
      } else if (index === 1) {
        setTimeout(() => notifyAboutUpdate(), 5 * 60 * 1000);
      }
    }
  );
};

autoUpdater.on('update-downloaded', () => notifyAboutUpdate());

autoUpdater.on('error', (event, error) =>
  dialog.showErrorBox('Error: ', error == null ? 'unknown' : (error.stack || error).toString())
);

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
  setInterval(() => autoUpdater.checkForUpdatesAndNotify(), 5 * 60 * 1000);
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
