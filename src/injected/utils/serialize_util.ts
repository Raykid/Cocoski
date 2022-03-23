import { Component } from "cc";
import { ComponentAttr } from "../../global/component_attr";
import { VISITOR_KEY } from "../../global/visitor_key";
import { getMutator, Mutator } from "./mutator";

type OriginalComponentAttr = Omit<ComponentAttr, "value"> & {
  ctor?: Function;
  default?: () => any;
};

export function serializeComponent(
  target: Component
): Record<string, ComponentAttr> {
  const oriAttrMap: Record<string, OriginalComponentAttr> = {};
  const attrs = (target.constructor as any)?.__attrs__;
  for (const key in attrs) {
    const [name, attrName] = key.split("$_$");
    const oriAttr = (oriAttrMap[name] = oriAttrMap[name] || {});
    oriAttr[attrName as keyof OriginalComponentAttr] = attrs[key];
  }
  // 不要 __scriptAsset
  delete oriAttrMap.__scriptAsset;
  // 整理成可序列化的形态
  const attrMap: Record<string, ComponentAttr> = {};
  for (const name in oriAttrMap) {
    const oriAttr = oriAttrMap[name];
    // 有些 visible 是个 getter
    if (typeof oriAttr.visible === "function") {
      oriAttr.visible = (oriAttr.visible as () => boolean).call(target);
    }
    // visible 显式设置为 false 的不处理
    if (oriAttr.visible !== false) {
      const tempAttr = { ...oriAttr };
      delete tempAttr.ctor;
      delete tempAttr.default;
      attrMap[name] = tempAttr;
      attrMap[name].value =
        name in target
          ? (target as any)[name]
          : oriAttr.default
          ? oriAttr.default()
          : undefined;
      // 特殊处理
      const attr = attrMap[name];
      switch (attr.type) {
        case "Object":
          if (attr.value) {
            const mutator = getMutator(attr.value) || new Mutator(attr.value);
            attr.value = {
              [VISITOR_KEY]: mutator.id,
            };
          }
          break;
        default:
          break;
      }
    }
  }
  return attrMap;
}
