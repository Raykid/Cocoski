import React from "react";
import { withStore } from "../../../store/store";
import "./node_tree.less";

export const NodeTree = withStore(
  () => {
    return <div className="node-tree">asdf</div>;
  },
  () => []
);
