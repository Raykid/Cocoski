import { BaseNode } from "cc";
import { debounce } from "lodash";
import { NodeInfo } from "../../global/node_info";
import { listenFromDevTool, sendToDevTool } from "../utils/message_util";
import { getById, Mutator } from "../utils/mutator";
import { serializeComponent } from "../utils/serialize_util";

const effects: (() => void)[] = [];
const regCompName = /^(.*)<(.+)>$/;

function wrapTree(node: BaseNode): NodeInfo {
  const mutatorNode = new Mutator(node);
  const { EventType } = window.cc.Node;
  node.on(EventType.CHILD_ADDED, syncScene);
  node.on(EventType.CHILD_REMOVED, syncScene);
  effects.push(() => {
    if (node.isValid) {
      node.off(EventType.CHILD_ADDED, syncScene);
      node.off(EventType.CHILD_REMOVED, syncScene);
    }
    mutatorNode.destroy();
  });
  return {
    id: mutatorNode.id,
    name: node.name,
    active: node.active,
    children: node.children.map(wrapTree),
    components: node.components.map((comp) => {
      const mutatorComp = new Mutator(comp);
      effects.push(() => {
        mutatorComp.destroy();
      });
      const resultName = regCompName.exec(comp.name);
      return {
        id: mutatorComp.id,
        nodeId: mutatorNode.id,
        name: (resultName && resultName[2]) || "",
        enabled: comp.enabled,
        attrs: serializeComponent(comp),
      };
    }),
  };
}

const syncScene = debounce(() => {
  const scene = window.cc.director.getScene();
  if (scene) {
    // 清理 Effects
    effects.splice(0, effects.length).forEach((effect) => effect());
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
  // 监听同步请求
  listenFromDevTool("requestNodeTree", () => {
    syncScene();
  });
  // 监听打印节点
  listenFromDevTool("logNode", ({ id }) => {
    const mutator = getById(id);
    if (mutator) {
      console.log(mutator.target);
    }
  });
}
