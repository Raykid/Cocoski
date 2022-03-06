/// <reference path="./types/cc.d.ts"/>

import { listenFromDevTool } from "./utils/message_util";

// 监听打印日志
listenFromDevTool("log", ({ datas, level = "log" }) => {
  console[level].apply(console, datas);
});
