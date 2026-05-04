import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";

export type PupInputPayload = {
  type: string;
  prompt: string;
};

export type PupSayOutputPayload = {
  output: string;
};

const electronApi = {
  getVersion: () => ipcRenderer.sendSync("app/version"),
  maximize: () => ipcRenderer.send("app/maximize"),
  minimize: () => ipcRenderer.send("app/minimize"),
  onToggleTitlebar: (callback: (show: boolean) => void) => {
    const listener = (_event: IpcRendererEvent, show: boolean) => callback(show);
    ipcRenderer.on("toggle-titlebar", listener);
    return () => {
      ipcRenderer.removeListener("toggle-titlebar", listener);
    };
  },
  close: () => ipcRenderer.send("app/close"),
  onPupInput: (callback: (payload: PupInputPayload) => void) => {
    const listener = (_event: IpcRendererEvent, payload: PupInputPayload) => {
      callback(payload);
    };
    ipcRenderer.on("pup:input", listener);
    return () => {
      ipcRenderer.removeListener("pup:input", listener);
    };
  },
  sendPupInput: (value: string) => {
    ipcRenderer.send("pup:send-input", value);
  },
  onSayOutput: (callback: (payload: PupSayOutputPayload) => void) => {
    const listener = (_event: IpcRendererEvent, payload: PupSayOutputPayload) => {
      callback(payload);
    };
    ipcRenderer.on("pup:say-output", listener);
    return () => {
      ipcRenderer.removeListener("pup:say-output", listener);
    };
  },
  resumePup: () => {
    ipcRenderer.send("pup:resume");
  },
};

const pupApi = {
  runPup: (code: string) => ipcRenderer.invoke("pup:run", code),
  stopPup: () => ipcRenderer.send("pup:stop"),
  openFile: () => ipcRenderer.invoke("file:open"),
  saveFile: (opts: { content: string; defaultPath?: string }) => ipcRenderer.invoke("file:save", opts),
};

contextBridge.exposeInMainWorld("electron", electronApi);
contextBridge.exposeInMainWorld("api", pupApi);

export type ElectronApi = typeof electronApi;
export type PupApi = typeof pupApi;
