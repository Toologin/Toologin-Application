import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import WooCommerceAPI from '@woocommerce/woocommerce-rest-api';
import config from '../renderer/config.json';

export const WooCommerce = new WooCommerceAPI({
  url: config.WOO_API.url,
  consumerKey: config.WOO_API.consumerKey,
  consumerSecret: config.WOO_API.consumerSecret,
  version: 'wc/v3',
});

contextBridge.exposeInMainWorld('WooCommerce', {
  get(endpoint) {
    return WooCommerce.get(endpoint).then((res) => res.data);
  },
});

export type Channels = 'ipc-example';
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => ipcRenderer.removeListener(channel, subscription);
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
