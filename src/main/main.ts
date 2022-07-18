/* eslint-disable no-new */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable promise/catch-or-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint global-require: off, no-console: off, promise/always-return: off */
import path from 'path';
import { app, BrowserWindow, session, screen, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDev =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.autoDownload = true;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const installExtensions = async () => {
  const installer = require('@toologin/toologin-extension-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['TOOLOGIN_EXTENSION'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

let adminBrowser = null;

const createWindow = async (arg?) => {
  console.log(1);

  if (!isDev) {
    await installExtensions();
  }

  if (isDev) {
    require('electron-debug')();
    await session.defaultSession.loadExtension(
      path.join(__dirname, '../../extensions/Toologin')
    );
  }

  let mainWindow: BrowserWindow | null = null;

  const args = {
    agent: arg && arg.agent ? arg.agent : null,
    proxy: arg && arg.proxy ? arg.proxy : null,
    cookies: arg && arg.cookies ? arg.cookies : null,
    url: arg && arg.dashboardURL ? arg.dashboardURL : null,
    storage: arg && arg.localStorage ? arg.localStorage : null,
  };

  if (args.agent) {
    await session.defaultSession.setUserAgent(args.agent);
  }

  if (args.url && args.cookies) {
    try {
      const { url, cookies } = args;
      cookies.forEach((cookie) => {
        const { name, path, value, domain, secure, httpOnly } = cookie;
        session.defaultSession.cookies.set({
          url,
          name,
          path,
          value,
          domain,
          secure,
          httpOnly,
        });
      });
    } catch (error) {
      console.log(error);
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
      console.log(`Proxy: ${authInfo.host}:${authInfo.port}`);
      callback(proxy.user, proxy.pass);
    });
  }

  console.log(2);

  await mainWindow.loadURL(
    (await args.url) || (await resolveHtmlPath('index.html'))
  );

  console.log(3);

  await mainWindow.show();

  await mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(async (details) => {
    const params = new URL(details.url);
    const data = JSON.parse(params.searchParams.get('data'));
    if (data) {
      if (mainWindow) {
        await createWindow(data);
        mainWindow.webContents.send('load_success', data);
      }
      if (isDev && !adminBrowser) {
        data.dashboardURL = data.loginURL;
        adminBrowser = await createWindow(data);
      }
    } else if (!details.url.includes('toolsurf.com')) {
      shell.openExternal(details.url);
    }
    return { action: 'deny' };
  });

  new AppUpdater();
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
