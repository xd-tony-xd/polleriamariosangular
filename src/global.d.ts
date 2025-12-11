// src/global.d.ts
import type { IStaticMethods } from "preline/dist/preline";
declare global {
  interface Window {
    HSStaticMethods: IStaticMethods;
  }
}
export {};
