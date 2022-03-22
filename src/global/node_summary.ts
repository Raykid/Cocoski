export type NodeSummary = {
  uuid: string;
  name: string;
  active: boolean;
  children: NodeSummary[];
};
