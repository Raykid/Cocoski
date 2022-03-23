import { BaseNode } from "cc";
import { debounce } from "lodash";
import { NodeSummary } from "../../global/node_summary";
import { sendToDevTool } from "../utils/message_util";
import { Mutator } from "../utils/mutator";

const mutatorCache: Mutator[] = [];

function wrapTree(node: BaseNode): NodeSummary {
  const mutator = new Mutator(node);
  mutatorCache.push(mutator);
  return {
    id: mutator.id,
    name: node.name,
    active: node.active,
    children: node.children.map(wrapTree),
  };
}

const syncScene = debounce(() => {
  const scene = window.cc.director.getScene();
  if (scene) {
    // 销毁当前 Mutator
    mutatorCache
      .splice(0, mutatorCache.length)
      .forEach((mutator) => mutator.destroy());
    // 重新遍历节点树
    const tree = wrapTree(scene);
    sendToDevTool("sceneNodeTree", { tree });
  }
}, 300);

export function initNodeTree() {
  syncScene();
  // 监听场景切换
  window.cc.director.on(window.cc.Director.EVENT_AFTER_SCENE_LAUNCH, () => {
    // 场景切换后需要发送最新的节点数据
    syncScene();
  });
}
