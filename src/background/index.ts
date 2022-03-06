chrome.webNavigation.onCommitted.addListener((details) => {
  const { tabId } = details;
  console.log(tabId, "reloaded");
  send("tabReloaded", { tabId });
});

function send(type: string, data?: any): Promise<any> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        type: `cocoski::background2devtool_request|${type}`,
        data,
      },
      (response) => {
        if (response) {
          const { type, data } = response;
          if (type === "cocoski::devtool2background_response") {
            resolve(data);
          } else {
            reject(new Error("Invalid message type: " + type));
          }
        }
      }
    );
  });
}
