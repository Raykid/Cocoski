import { NodeComponent } from "./node_component";

export type NodeInfo = {
  id: string;
  name: string;
  active: boolean;
  children: NodeInfo[];
  components: NodeComponent[];
};
