import { listenFromDevTool } from "../utils/message_util";

export function initLog() {
  listenFromDevTool("log", ({ datas, level = "log" }) => {
    console[level].apply(console, datas);
  });
}
