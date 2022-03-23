import { Tree } from "antd";
import { DataNode } from "antd/lib/tree";
import React, { useCallback, useMemo, useState } from "react";
import { NodeSummary } from "../../../../global/node_summary";
import { nodeModel } from "../../../models/node_model";
import { withStore } from "../../../store/store";
import "./node_tree.less";

export const NodeTree = withStore(
  () => {
    const { nodeTree, curNode } = nodeModel.state;
    const { getVisitor } = nodeModel.calculators;

    const handleNode = useCallback((node: NodeSummary, checked: string[]) => {
      if (node.active) {
        checked.push(node.id);
      }
      const data: DataNode = {
        key: node.id,
        title: node.name,
        children: node.children.map((child) => {
          return handleNode(child, checked);
        }),
      };
      return data;
    }, []);

    const [checked, updateChecked] = useState<string[]>([]);
    const [expanded, updateExpanded] = useState<string[]>([]);
    const treeData = useMemo(() => {
      if (nodeTree) {
        const checked: string[] = [];
        const treeData = handleNode(nodeTree, checked);
        updateChecked(checked);
        updateExpanded([nodeTree.id]);
        return treeData;
      } else {
        return null;
      }
    }, [nodeTree]);

    const tree = useMemo(() => {
      if (treeData) {
        treeData.disableCheckbox = true;
        return (
          <Tree
            checkable
            checkStrictly
            treeData={[treeData]}
            checkedKeys={checked}
            expandedKeys={expanded}
            onCheck={(checked, info) => {
              updateChecked(checked as string[]);
              getVisitor(info.node.key as string)?.set("active", info.checked);
            }}
            onExpand={(expanded) => {
              updateExpanded(expanded as string[]);
            }}
          />
        );
      } else {
        return null;
      }
    }, [curNode, treeData, checked, expanded]);

    return <div className="node-tree">{tree}</div>;
  },
  () => [nodeModel.state]
);
