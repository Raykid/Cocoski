import { NodeSummary } from "./node_summary";

export type MessageTypes = {
  // tabReloaded
  tabReloaded: [{ tabId: number }, void];

  // injectedComplete
  injectedComplete: [void, void];

  // log
  log: [
    {
      datas: any[];
      level?: "log" | "warn" | "error";
    },
    void
  ];

  // mutator
  mutatorGet: [{ name: string }, any];
  mutatorSet: [{ name: string; value: any }, boolean];
  mutatorCall: [{ name: string; args: any[] }, any];
  mutatorSync: [{ name: string; value: any }, void];

  // node_tree
  sceneNodeTree: [{ tree: NodeSummary }, void];
  requestNodeTree: [void, void];
  logNode: [{ id: string }, void];
};
