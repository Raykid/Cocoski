import { ComponentAttr } from "./component_attr";

export type NodeComponent = {
  id: string;
  name: string;
  enabled: boolean;
  attrs: Record<string, ComponentAttr>;
};
