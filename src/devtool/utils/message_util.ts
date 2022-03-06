import { throttle } from "lodash";
import { v4 } from "uuid";
import { MessageTypes } from "../../global/message_types";
import { ImmediateOrDelayed } from "../../global/types";

const resolveMap: { [responseId: string]: (data: any) => void } = {};
const handlerMap: {
  [type: string]: ((data: any) => ImmediateOrDelayed<any>) | undefined;
} = {};

export const curTabId = chrome.devtools.inspectedWindow.tabId;

export function injectScript(): void {
  chrome.devtools.inspectedWindow.eval(`(()=>{
  if(!window.__Cocoski_script_injected__) {
    const temp = document.createElement("script");
    temp.setAttribute("type", "text/javascript");
    temp.src = "${chrome.runtime.getURL("injected.js")}";
    temp.onload = function()
    {
      this.parentNode.removeChild(this);
    };
    document.head.appendChild(temp);
  }
})();
`);
}

chrome.runtime.onMessage.addListener(
  async (
    message: { type: string; id: string; data: any },
    sender,
    sendResponse
  ) => {
    const { type, id, data } = message;
    // 判断是否自己的页面发送的消息
    if (sender.tab?.id === curTabId) {
      if (type === "cocoski::content2devtool_response") {
        const resolve = resolveMap[id];
        if (resolve) {
          delete resolveMap[id];
          resolve(data);
        }
      } else if (type === "cocoski::content2devtool_request") {
        const responses = await Promise.all(
          (data as { id: string; type: string; data: any }[]).map((message) => {
            const { type, data } = message;
            const handler = handlerMap[type];
            let response: any;
            if (handler) {
              response = handler(data);
            }
            return response;
          })
        );
        // 调用回调
        sendResponse({
          type: "cocoski::devtool2content_response",
          data: responses,
        });
      }
    } else {
      if (type.startsWith("cocoski::background2devtool_request")) {
        const [, subType] = type.split("|");
        const handler = handlerMap[subType];
        let response: any;
        if (handler) {
          response = handler(data);
          if (response instanceof Promise) {
            response = await response;
          }
        }
        // 调用回调
        sendResponse({
          type: "cocoski::devtool2background_response",
          data: response,
        });
      }
    }
  }
);

const messageCache = [] as { id: string; type: string; data: any }[];
const flush = throttle(() => {
  const id = v4();
  const caches = messageCache.splice(0, messageCache.length);
  resolveMap[id] = (responses: any[]) => {
    caches.forEach((cache, i) => {
      const { id } = cache;
      const resolve = resolveMap[id];
      if (resolve) {
        delete resolveMap[id];
        resolve(responses[i]);
      }
    });
  };
  chrome.tabs.sendMessage(curTabId, {
    type: "cocoski::devtool2content_request",
    id,
    data: caches,
  });
}, 100);

/**
 * 监听页面消息
 *
 * @export
 * @template T
 * @param {T} type 消息类型
 * @param {(data: MessageTypes[T][0]) => ImmediateOrDelayed<MessageTypes[T][1]>} handler 处理函数
 * @return {*}  {() => void} 取消句柄
 */
export function listenFromPage<T extends keyof MessageTypes>(
  type: T,
  handler: (data: MessageTypes[T][0]) => ImmediateOrDelayed<MessageTypes[T][1]>
): () => void;
/**
 * 监听页面消息
 *
 * @export
 * @template T
 * @param {T} type 消息主类型
 * @param {string} subType 消息次类型
 * @param {(data: MessageTypes[T][0]) => ImmediateOrDelayed<MessageTypes[T][1]>} handler 处理函数
 * @return {*}  {() => void} 取消句柄
 */
export function listenFromPage<T extends keyof MessageTypes>(
  type: T,
  subType: string,
  handler: (data: MessageTypes[T][0]) => ImmediateOrDelayed<MessageTypes[T][1]>
): () => void;
/**
 * @private
 */
export function listenFromPage(
  type: string,
  subType: string | ((data: any) => ImmediateOrDelayed<any>),
  handler?: (data: any) => ImmediateOrDelayed<any>
): () => void {
  if (handler) {
    type = `${type}-${subType}`;
  } else {
    handler = <(data: any) => ImmediateOrDelayed<any>>subType;
  }
  handlerMap[type] = handler;
  return () => {
    delete handlerMap[type];
  };
}

/**
 * 发送消息到页面
 *
 * @export
 * @template T
 * @param {T} type 消息类型
 * @param {MessageTypes[T][0]} [data] 参数
 * @return {*}  {Promise<MessageTypes[T][1]>} 返回值
 */
export function sendToPage<T extends keyof MessageTypes>(
  type: T,
  data?: MessageTypes[T][0]
): Promise<MessageTypes[T][1]>;
/**
 * 发送消息到页面
 *
 * @export
 * @template T
 * @param {T} type 消息主类型
 * @param {string} subType 消息次类型
 * @param {MessageTypes[T][0]} [data] 参数
 * @return {*}  {Promise<MessageTypes[T][1]>} 返回值
 */
export function sendToPage<T extends keyof MessageTypes>(
  type: T,
  subType: string,
  data?: MessageTypes[T][0]
): Promise<MessageTypes[T][1]>;
/**
 * @private
 */
export function sendToPage(
  type: string,
  subType?: any,
  data?: any
): Promise<any> {
  return new Promise<any>((resolve) => {
    if (data) {
      type = `${type}-${subType}`;
    } else {
      data = subType;
    }
    const id = v4();
    resolveMap[id] = resolve;
    messageCache.push({ id, type, data });
    flush();
  });
}
