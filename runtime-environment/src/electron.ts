export {};
import type { ElectronApi, PupApi } from "../main/preload";

declare global {
  interface Window {
    electron: ElectronApi;
    api: PupApi;
  }
}