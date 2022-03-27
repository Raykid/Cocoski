import { BaseNode, Node } from "cc";
import { debounce } from "lodash";
import { NodeInfo } from "../../global/node_info";
import { listenFromDevTool, sendToDevTool } from "../utils/message_util";
import { getById, Mutator } from "../utils/mutator";
import { serializeComponent } from "../utils/serialize_util";

const effects: (() => void)[] = [];

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
  const regNumber = /^\d+$/;
  const regSingle = /^0*10*$/;
  return {
    id: mutatorNode.id,
    name: node.name,
    active: node.active,
    children: node.children.map(wrapTree),
    info:
      node instanceof Node
        ? {
            position: {
              type: "valueType",
              valueType: "cc.Vec3",
              value: {
                x: node.position.x,
                y: node.position.y,
                z: node.position.z,
              },
            },
            eulerAngles: {
              type: "valueType",
              valueType: "cc.Vec3",
              displayName: "rotation",
              value: {
                x: node.eulerAngles.x,
                y: node.eulerAngles.y,
                z: node.eulerAngles.z,
              },
            },
            scale: {
              type: "valueType",
              valueType: "cc.Vec3",
              value: {
                x: node.scale.x,
                y: node.scale.y,
                z: node.scale.z,
              },
            },
            layer: {
              type: "enum",
              value: node.layer,
              enumList: Object.keys(window.cc.Layers.Enum).reduce(
                (enumList, key) => {
                  if (!regNumber.test(key)) {
                    const value: number = (window.cc.Layers.Enum as any)[key];
                    if (regSingle.test(value.toString(2))) {
                      enumList.push({
                        name: key,
                        value,
                      });
                    }
                  }
                  return enumList;
                },
                [] as {
                  name: string;
                  value: number;
                }[]
              ),
            },
          }
        : undefined,
    components: node.components.map((target) => {
      const { comp, effect } = serializeComponent(target, mutatorNode.id);
      effects.push(effect);
      return comp;
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
