import { throttle } from "lodash";
import { MessageTypes } from "../../global/message_types";
import { ImmediateOrDelayed } from "../../global/types";

const resolveMap: { [id: string]: (data: any) => void } = {};
const handlerMap: { [type: string]: (data: any) => ImmediateOrDelayed<any> } =
  {};

// 监听 content 发送的消息
window.addEventListener("message", (evt) => {
  const { type, id, data } = evt.data || {};
  if (type) {
    if (type === "cocoski::content2page_response") {
      // 是某个消息的返回值，调用 resolve
      const resolve = resolveMap[id];
      if (resolve) {
        resolve(data);
        delete resolveMap[id];
      }
    } else if (type === "cocoski::content2page_request") {
      const doPost = (response?: any) => {
        window.postMessage(
          {
            type: "cocoski::page2content_response",
            id,
            data: response,
          },
          window.location.origin
        );
      };
      // 是 devtool.html 页面请求，遍历
      Promise.all(
        (data as { id: string; type: string; data: any }[]).map((message) => {
          const { type, data } = message;
          const handler = handlerMap[type];
          let response: any;
          if (handler) {
            response = handler(data);
          }
          return response;
        })
      ).then(doPost);
    }
  }
});

const messageCache = [] as { id: string; type: string; data: any }[];
const flush = throttle(() => {
  const id = `${Date.now()}-${Math.random()}`;
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
  try {
    window.postMessage({
      type: "cocoski::page2content_request",
      id,
      data: caches,
    });
  } catch (err) {
    console.error(caches, err);
  }
}, 100);

/**
 * 监听 DevTool 页面发来的消息
 *
 * @export
 * @template T
 * @param {T} type 消息类型
 * @param {(data: MessageTypes[T][0]) => ImmediateOrDelayed<MessageTypes[T][1]>} handler 处理函数
 * @return {*}  {() => void} 取消句柄
 */
export function listenFromDevTool<T extends keyof MessageTypes>(
  type: T,
  handler: (data: MessageTypes[T][0]) => ImmediateOrDelayed<MessageTypes[T][1]>
): () => void;
/**
 * 监听 DevTool 页面发来的消息
 *
 * @export
 * @template T
 * @param {T} type 消息主类型
 * @param {string} subType 消息次类型
 * @param {(data: MessageTypes[T][0]) => ImmediateOrDelayed<MessageTypes[T][1]>} handler 处理函数
 * @return {*}  {() => void} 取消句柄
 */
export function listenFromDevTool<T extends keyof MessageTypes>(
  type: T,
  subType: string,
  handler: (data: MessageTypes[T][0]) => ImmediateOrDelayed<MessageTypes[T][1]>
): () => void;
/**
 * @private
 */
export function listenFromDevTool(
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
 * 发送消息到 DevTool 页面
 *
 * @export
 * @template T
 * @param {T} type 消息类型
 * @param {MessageTypes[T][0]} data 参数
 * @return {*}  {Promise<MessageTypes[T][1]>} 返回值
 */
export function sendToDevTool<T extends keyof MessageTypes>(
  type: T,
  data?: MessageTypes[T][0]
): Promise<MessageTypes[T][1]>;
/**
 * 发送消息到 DevTool 页面
 *
 * @export
 * @template T
 * @param {T} type 消息主类型
 * @param {string} subType 消息次类型
 * @param {MessageTypes[T][0]} data 参数
 * @return {*}  {Promise<MessageTypes[T][1]>} 返回值
 */
export function sendToDevTool<T extends keyof MessageTypes>(
  type: T,
  subType: string,
  data: MessageTypes[T][0]
): Promise<MessageTypes[T][1]>;
/**
 * @private
 */
export function sendToDevTool(
  type: string,
  subType: any,
  data?: any
): Promise<any> {
  return new Promise((resolve) => {
    if (data) {
      type = `${type}-${subType}`;
    } else {
      data = subType;
    }
    // 不能用 uuid，随机生成一个字符串，不能包含 |
    const id = `${Date.now()}-${Math.random()}`;
    resolveMap[id] = resolve;
    messageCache.push({ id, type, data });
    flush();
  });
}
