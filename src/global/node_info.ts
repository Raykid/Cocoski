export type NodeInfo = {
  id: string;
  name: string;
  active: boolean;
  children: NodeInfo[];
};
