import { ComponentAttr } from "./component_attr";
import { NodeComponent } from "./node_component";

export type NodeInfo = {
  id: string;
  name: string;
  active: boolean;
  children: NodeInfo[];
  info?: {
    position: ComponentAttr;
    eulerAngles: ComponentAttr;
    scale: ComponentAttr;
    layer: ComponentAttr;
  };
  components: NodeComponent[];
};
