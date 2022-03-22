import { Tree } from "antd";
import { DataNode } from "antd/lib/tree";
import React, { useCallback, useMemo } from "react";
import { NodeSummary } from "../../../../global/node_summary";
import { nodeModel } from "../../../models/node_model";
import { withStore } from "../../../store/store";
import "./node_tree.less";

export const NodeTree = withStore(
  () => {
    const { nodeTree, curNode } = nodeModel.state;

    const handleNode = useCallback((node: NodeSummary, checked: string[]) => {
      if (node.active) {
        checked.push(node.uuid);
      }
      const data: DataNode = {
        key: node.uuid,
        title: node.name,
        children: node.children.map((child) => {
          return handleNode(child, checked);
        }),
      };
      return data;
    }, []);

    const tree = useMemo(() => {
      if (nodeTree) {
        const checked: string[] = [];
        const treeData = handleNode(nodeTree, checked);
        treeData.disableCheckbox = true;
        return (
          <Tree
            checkable
            checkStrictly
            treeData={[treeData]}
            defaultCheckedKeys={checked}
            defaultExpandedKeys={[treeData.key]}
          />
        );
      } else {
        return null;
      }
    }, [nodeTree, curNode]);

    return <div className="node-tree">{tree}</div>;
  },
  () => [nodeModel.state]
);
