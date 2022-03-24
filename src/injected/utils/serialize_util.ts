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
      const attr = attrMap[name];
      // 处理 Color 类型
      if (attr.value instanceof window.cc.Color) {
        attr.type = "color";
        attr.value = attr.value._val;
      }
      // 没有 type 的，通过 value 猜
      if (!attr.type) {
        attr.type = typeof attr.value;
      } else if (typeof attr.type === "object") {
        attr.type = (attr.type as { name: string }).name;
      }
      // 类型首字母小写
      attr.type = attr.type.charAt(0).toLowerCase() + attr.type.substring(1);
      // 特殊处理
      switch (attr.type) {
        case "object":
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
