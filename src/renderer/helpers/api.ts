/* eslint-disable import/prefer-default-export */
/* eslint-disable @typescript-eslint/no-unused-vars */

export async function ipcRenderer(name, data) {
  window.electron.ipcRenderer.sendMessage(name, data);
}
