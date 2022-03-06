export type MessageTypes = {
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
};
