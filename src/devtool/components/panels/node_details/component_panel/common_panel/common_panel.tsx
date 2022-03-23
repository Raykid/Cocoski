import React, { FC } from "react";
import { NodeComponent } from "../../../../../../global/node_component";

export const CommonPanel: FC<{ comp: NodeComponent }> = ({ comp }) => {
  return <div className="common-panel">{JSON.stringify(comp)}</div>;
};
