const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("media_local_view", {
  getNowConfig: () =>
    ipcRenderer.invoke("LiteLoader.media_local_view.getNowConfig"),
  saveConfig: (config) =>
    ipcRenderer.invoke("LiteLoader.media_local_view.saveConfig", config)
});
