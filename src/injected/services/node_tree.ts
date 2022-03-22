import { BaseNode } from "cc";
import { debounce } from "lodash";
import { NodeSummary } from "../../global/node_summary";
import { sendToDevTool } from "../utils/message_util";

const syncScene = debounce(() => {
  const scene = window.cc.director.getScene();
  if (scene) {
    const tree = wrapTree(scene);
    sendToDevTool("sceneNodeTree", { tree });
  }
}, 500);

export function initNodeTree() {
  syncScene();
  // 监听场景切换
  window.cc.director.on(window.cc.Director.EVENT_AFTER_SCENE_LAUNCH, () => {
    // 场景切换后需要发送最新的节点数据
    syncScene();
  });
}

function wrapTree(node: BaseNode): NodeSummary {
  return {
    uuid: node.uuid,
    name: node.name,
    active: node.active,
    children: node.children.map(wrapTree),
  };
}
