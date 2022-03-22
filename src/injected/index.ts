/// <reference path="./types/cc.d.ts"/>
/// <reference path="./types/adapter.d.ts"/>

import { initLog } from "./services/log";
import { initNodeTree } from "./services/node_tree";
import { sendToDevTool } from "./utils/message_util";

function main() {
  // 日志
  initLog();
  // 节点树
  initNodeTree();
  // 发送事件通知
  sendToDevTool("injectedComplete");
}

if (window.cc) {
  main();
} else {
  Object.defineProperty(window, "cc", {
    configurable: true,
    enumerable: false,
    set: (v) => {
      if (v) {
        delete (window as any).cc;
        window.cc = v;
        if (window.cc.director) {
          main();
        } else {
          Object.defineProperty(window.cc, "director", {
            configurable: true,
            enumerable: false,
            set: (v) => {
              if (v) {
                delete (window.cc as any).director;
                (window.cc as any).director = v;
                main();
              }
            },
          });
        }
      }
    },
  });
}
