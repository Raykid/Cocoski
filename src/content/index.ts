/// <reference types="chrome"/>
/// <reference types="uuid"/>

import { v4 } from "uuid";

const resolveMap: { [responseId: string]: (data: any) => void } = {};
// 监听页面消息，resolve 或 透传给 devtool.html
window.addEventListener("message", (evt) => {
  if (typeof evt.data === "object") {
    const { type, id, data } = evt.data as {
      type: string;
      id: string;
      data: any;
    };
    if (typeof type === "string") {
      if (type === "cocoski::page2content_response") {
        // 是某个消息的返回值，调用 resolve
        const resolve = resolveMap[id];
        if (resolve) {
          resolve(data);
          delete resolveMap[id];
        }
      } else if (type === "cocoski::page2content_request") {
        // 是发往 devtool.html 页面的消息，转发并处理返回值
        chrome.runtime.sendMessage(
          {
            type: "cocoski::content2devtool_request",
            data,
          },
          (response: { type: string; data: any }) => {
            if (response) {
              const { type, data } = response;
              if (type === "cocoski::devtool2content_response") {
                window.postMessage({
                  type: "cocoski::content2page_response",
                  id,
                  data,
                });
              }
            }
          }
        );
      }
    }
  }
});

// 监听 cocoski.html 页面消息，透传给页面并等待返回值
chrome.runtime.onMessage.addListener(async (message) => {
  const { type, id, data } = message as { type: string; id: string; data: any };
  // 生成一个 resolve 并记录，等待其完成时调用回调
  const response = await new Promise<any>((resolve) => {
    // 发送消息
    if (type === "cocoski::devtool2content_request") {
      // 生成一个发送记录，将 resolve 记录到 map 里
      const id = v4();
      resolveMap[id] = resolve;
      window.postMessage(
        {
          type: "cocoski::content2page_request",
          id,
          data,
        },
        window.location.origin
      );
    }
  });
  // 发送返回值，sendResponse 貌似没法传递参数，改用 sendMessage
  chrome.runtime.sendMessage({
    type: "cocoski::content2devtool_response",
    id,
    data: response,
  });
});
