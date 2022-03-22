import * as cc from "cc";

declare global {
  interface Window {
    cc: typeof cc;
  }
}
