export type NodeSummary = {
  id: string;
  name: string;
  active: boolean;
  children: NodeSummary[];
};
