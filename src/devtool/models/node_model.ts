import { message } from "antd";
import { NodeSummary } from "../../global/node_summary";
import { createModel } from "../store/store";
import { injectScript, listenFromPage } from "../utils/message_util";

export const nodeModel = createModel({
  name: "Node",
  initState: () => {
    listenFromPage("sceneNodeTree", ({ tree }) => {
      nodeModel.commands.setTree(tree);
    });
    listenFromPage("tabReloaded", ({ tabId }) => {
      if (tabId === chrome.devtools.inspectedWindow.tabId) {
        nodeModel.commands.reset();
        // 显示提示
        const cancelLoading = message.loading("标签已刷新，请稍等……");
        // 等待一段时间，重新注入脚本
        injectScript().then(() => {
          cancelLoading();
          message.success("标签刷新完毕", 3);
        });
      }
    });
    return {
      nodeTree: <NodeSummary | null>null,
      curNode: <NodeSummary | null>null,
    };
  },
  operations: {
    reset: function (state) {
      state.nodeTree = null;
      state.curNode = null;
    },
    setTree: function (state, tree: NodeSummary) {
      state.nodeTree = tree;
      state.curNode = null;
    },
  },
  selectors: {},
});
