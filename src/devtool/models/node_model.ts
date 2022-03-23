import { message } from "antd";
import { NodeSummary } from "../../global/node_summary";
import { createModel } from "../store/store";
import { injectScript, listenFromPage } from "../utils/message_util";
import { Visitor } from "../utils/visitor";

export const nodeModel = createModel({
  name: "Node",
  initState: () => {
    listenFromPage("sceneNodeTree", ({ tree }) => {
      nodeModel.commands.setTree(tree);
    });
    listenFromPage("tabReloaded", ({ tabId }) => {
      if (tabId === chrome.devtools.inspectedWindow.tabId) {
        nodeModel.commands.setTree(null);
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
      visitorMap: <Record<string, Visitor>>{},
    };
  },
  operations: {
    setTree: function (state, tree: NodeSummary | null) {
      state.nodeTree = tree;
      state.curNode = null;
      // 销毁现有 Visitor
      for (const id in state.visitorMap) {
        state.visitorMap[id].destroy();
      }
      if (tree) {
        const visitorMap: Record<string, Visitor> = {};
        const handleNode = (node: NodeSummary) => {
          visitorMap[node.id] = new Visitor(node);
          node.children.forEach(handleNode);
        };
        handleNode(tree);
        state.visitorMap = visitorMap;
      } else {
        state.visitorMap = {};
      }
    },
  },
  selectors: {},
  calculators: {
    getVisitor: (state, id: string): Visitor | null => {
      return state.visitorMap[id] || null;
    },
  },
});
