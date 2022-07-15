/* eslint-disable promise/catch-or-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */
import path from 'path';
import {
  app,
  autoUpdater,
  dialog,
  BrowserWindow,
  session,
  screen,
} from 'electron';
import { resolveHtmlPath } from './util';

const server = 'https://hazel-63ng.vercel.app/';
const url = `${server}/update/${process.platform}/${app.getVersion()}`;
autoUpdater.setFeedURL({ url });

setInterval(() => {
  autoUpdater.checkForUpdates();
}, 120000);

autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail:
      'A new version has been downloaded. Restart the application to apply the updates.',
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDev =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const createWindow = async (arg?, fixed? = false) => {
  if (isDev) {
    // require('electron-debug')();
    // await session.defaultSession.loadExtension(
    //   path.join(__dirname, '../../extensions/react-devtool')
    // );
  }

  let mainWindow: BrowserWindow | null = null;

  const args = {
    agent: arg && arg.agent ? arg.agent : null,
    proxy: arg && arg.proxy ? arg.proxy : null,
    cookies: arg && arg.cookies ? arg.cookies : null,
    url: arg && arg.dashboardURL ? arg.dashboardURL : null,
    storage: arg && arg.localStorage ? arg.localStorage : null,
  };

  console.log(1);

  if (args.agent) {
    await session.defaultSession.setUserAgent(args.agent);
  }

  if (args.url && args.cookies) {
    if (typeof args.cookies === 'object' && args.cookies.length > 0) {
      args.cookies.forEach((cookie) => {
        try {
          session.defaultSession.cookies.set({
            url: args.url,
            name: cookie.name,
            path: cookie.path,
            value: cookie.value,
            domain: cookie.domain,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
          });
        } catch (error) {
          console.log(error);
        }
      });
    }
  }

  const RESOURCES_PATH = !isDev
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  console.log(2);

  mainWindow = new BrowserWindow({
    icon: getAssetPath('icon.png'),
    width,
    height,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      devTools: isDev,
      preload: !isDev
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  if (args.storage) {
    const storageKey = await args.storage.key.toString();
    mainWindow.webContents.executeJavaScript(
      `
      localStorage.removeItem('${storageKey}');
      localStorage.setItem('${storageKey}', '${args.storage.value}');
      window.location.reload();
      `
    );
  }

  if (args.proxy) {
    const proxy = await args.proxy;
    mainWindow.webContents.session.setProxy({
      proxyRules: `${proxy.ip}:${proxy.port}`,
      proxyBypassRules: process.env.SHOP_DOMAIN,
    });

    mainWindow.webContents.on('login', (event, request, authInfo, callback) => {
      console.log(authInfo);
      callback(proxy.user, proxy.pass);
    });
  }

  console.log(3);

  mainWindow.webContents.on('did-start-navigation', () => {
    mainWindow.webContents.executeJavaScript(`
      if(document.getElementById("srf-browser-unhappy")) {
        document.getElementById("srf-browser-unhappy").remove();
      }
    `);
  });

  await mainWindow.loadURL(
    (await args.url) || (await resolveHtmlPath('index.html'))
  );

  console.log(4);

  await mainWindow.show();

  if (fixed) {
    mainWindow.close();
  }

  await mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    const params = new URL(url);
    const data = params.searchParams.get('data');
    if (data) {
      createWindow(JSON.parse(params.searchParams.get('data')));
    } else {
      // shell.openExternal(url);
    }

    return { action: 'deny' };
  });
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady(async () => {})
  .then(async () => {
    await createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  })
  .catch(console.log);
