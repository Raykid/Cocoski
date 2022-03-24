import { message } from "antd";
import { NodeInfo } from "../../global/node_info";
import { createModel } from "../store/store";
import {
  injectScript,
  listenFromPage,
  sendToPage,
} from "../utils/message_util";
import { Visitor } from "../utils/visitor";

let _waitTree: ((tree: NodeInfo) => void) | null = null;

export const nodeModel = createModel({
  name: "Node",
  initState: () => {
    listenFromPage("sceneNodeTree", ({ tree }) => {
      nodeModel.commands.setTree(tree);
      if (_waitTree) {
        _waitTree(tree);
        _waitTree = null;
      }
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
      nodeTree: <NodeInfo | null>null,
      curId: <string | null>null,
      visitorMap: <Record<string, Visitor>>{},
    };
  },
  operations: {
    setTree: function (state, tree: NodeInfo | null) {
      state.nodeTree = tree;
      // 销毁现有 Visitor
      for (const id in state.visitorMap) {
        state.visitorMap[id].destroy();
      }
      if (tree) {
        const visitorMap: Record<string, Visitor> = {};
        const handleNode = (node: NodeInfo) => {
          visitorMap[node.id] = new Visitor(node, ({ name, value }) => {
            nodeModel.commands.setNodeAttr({ id: node.id, name, value });
          });
          // 处理节点上的组件
          node.components.forEach((comp) => {
            visitorMap[comp.id] = new Visitor(comp, ({ name, value }) => {
              nodeModel.commands.setCompAttr({
                nodeId: node.id,
                compId: comp.id,
                name,
                value,
              });
            });
          });
          node.children.forEach(handleNode);
        };
        handleNode(tree);
        state.visitorMap = visitorMap;
      } else {
        state.visitorMap = {};
      }
      // 如果更新后仍然包含之前选中的节点，则继承之。否则移除之
      if (!state.curId || !(state.curId in state.visitorMap)) {
        state.curId = null;
      }
    },
    selectNode: function (state, id: string | null) {
      state.curId = id;
    },
    setNodeAttr: function (
      state,
      data: { id: string; name: string; value: any }
    ) {
      const { id, name, value } = data;
      if (state.nodeTree) {
        const targetNode: any = nodeModel.pureCalculators.getNode(
          state.nodeTree,
          id
        );
        if (targetNode) {
          targetNode[name] = value;
        }
      }
    },
    setCompAttr: function (
      state,
      data: {
        nodeId: string;
        compId: string;
        name: string;
        value: any;
      }
    ) {
      const { nodeId, compId, name, value } = data;
      if (state.nodeTree) {
        const targetNode = nodeModel.pureCalculators.getNode(
          state.nodeTree,
          nodeId
        );
        if (targetNode) {
          for (const comp of targetNode.components) {
            if (comp.id === compId) {
              if (name in comp) {
                (comp as any)[name] = value;
              } else {
                const target = comp.attrs[name];
                if (target) {
                  target.value = value;
                }
              }
              break;
            }
          }
        }
      }
    },
  },
  selectors: {},
  calculators: {
    getVisitor: (state, id: string): Visitor | null => {
      return state.visitorMap[id] || null;
    },
  },
  pureCalculators: {
    requestNodeTree: () => {
      return new Promise<NodeInfo>((resolve) => {
        _waitTree = resolve;
        sendToPage("requestNodeTree");
      });
    },
    getNode: (tree: NodeInfo, id: string | null): NodeInfo | null => {
      if (id) {
        const handleNode = (node: NodeInfo): NodeInfo | null => {
          if (node.id === id) {
            return node;
          } else {
            for (const child of node.children) {
              const childNode = handleNode(child);
              if (childNode) {
                return childNode;
              }
            }
            return null;
          }
        };
        return handleNode(tree);
      } else {
        return null;
      }
    },
  },
});
