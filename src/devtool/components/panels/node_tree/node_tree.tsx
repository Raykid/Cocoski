import { PrinterOutlined } from "@ant-design/icons";
import { Button, message, Space, Tooltip, Tree } from "antd";
import { DataNode } from "antd/lib/tree";
import React, { useCallback, useMemo, useState } from "react";
import { NodeSummary } from "../../../../global/node_summary";
import { nodeModel } from "../../../models/node_model";
import { withStore } from "../../../store/store";
import { sendToPage } from "../../../utils/message_util";
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
            className="tree"
            checkable
            checkStrictly
            treeData={[treeData]}
            checkedKeys={checked}
            expandedKeys={expanded}
            onCheck={(checked, info) => {
              // 更新显示
              updateChecked(checked as string[]);
              // 更新游戏节点
              getVisitor(info.node.key as string)?.set("active", info.checked);
            }}
            onExpand={(expanded) => {
              // 更新显示
              updateExpanded(expanded as string[]);
            }}
            titleRender={(node) => {
              return (
                <Space className="node">
                  <span className="title">{node.title}</span>
                  <Tooltip title="输出至控制台">
                    <Button
                      className="log-button"
                      type="text"
                      icon={<PrinterOutlined />}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        sendToPage("logNode", { id: node.key as string }).then(
                          () => {
                            message.info(
                              `已输出节点 ${node.title}，请到控制台查看`,
                              3
                            );
                          }
                        );
                      }}
                    />
                  </Tooltip>
                </Space>
              );
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
