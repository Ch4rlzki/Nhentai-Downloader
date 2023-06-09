const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openCookies: () => ipcRenderer.send('open-cookies'),
  openHeaders: () => ipcRenderer.send('open-headers'),
  chooseDp: () => ipcRenderer.send('choose-downloadpath'),
  downloadPath: (path) => ipcRenderer.on('downloadPath', path),
  downloadManga: (url) => ipcRenderer.send('download-manga', url),
  downloading: (callback) => ipcRenderer.on('downloading', callback),
  notDownloading: (callback) => ipcRenderer.on('not-downloading', callback),
  testRequest: () => ipcRenderer.send('test-request'),
  openLink: (link) => ipcRenderer.send('open-link', link),
  clearCookies: () => ipcRenderer.send('clear-cookies'),
  clearHeaders: () => ipcRenderer.send('clear-headers'),
  clearCookiesNHeaders: () => ipcRenderer.send('clear-cookiesnheaders'),
});