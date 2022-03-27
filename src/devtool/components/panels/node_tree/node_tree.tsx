import { CloseOutlined, PrinterOutlined } from "@ant-design/icons";
import { Button, Empty, Input, message, Space, Tooltip, Tree } from "antd";
import { DataNode } from "antd/lib/tree";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { NodeInfo } from "../../../../global/node_info";
import { nodeModel } from "../../../models/node_model";
import { withStore } from "../../../store/store";
import { sendToPage } from "../../../utils/message_util";
import { NodeTitle } from "./node_title";
import "./node_tree.less";

export const NodeTree = withStore(
  () => {
    const { nodeTree, visitorMap } = nodeModel.state;
    const { selectNode } = nodeModel.commands;
    const { getVisitor } = nodeModel.calculators;

    // 搜索框
    const [search, _updateSearch] = useState("");
    const updateSearch = useMemo(() => debounce(_updateSearch, 200), []);
    const [searchStr, updateSearchStr] = useState("");
    useEffect(() => {
      updateSearch(searchStr);
    }, [searchStr]);
    const regSearch = useMemo(() => {
      try {
        return new RegExp(search, "i");
      } catch (err) {
        return null;
      }
    }, [search]);

    const handleNode = useCallback(
      (node: NodeInfo, checked: string[]) => {
        if (node.active) {
          checked.push(node.id);
        }
        const data: DataNode = {
          key: node.id,
          title: node.name,
          children: node.children.reduce((children, child) => {
            const childData = handleNode(child, checked);
            if (childData) {
              children.push(childData);
            }
            return children;
          }, [] as DataNode[]),
        };
        return regSearch?.test(node.name) || data.children!.length > 0
          ? data
          : null;
      },
      [regSearch]
    );

    const [checked, updateChecked] = useState<string[]>([]);
    const [expanded, updateExpanded] = useState<string[]>([]);
    const treeData = useMemo(() => {
      if (nodeTree) {
        const checked: string[] = [];
        const treeData = handleNode(nodeTree, checked);
        updateChecked(checked);
        if (!search && !expanded.includes(nodeTree.id)) {
          updateExpanded([nodeTree.id, ...expanded]);
        }
        return treeData;
      } else {
        return null;
      }
    }, [nodeTree, search, handleNode]);

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
            expandedKeys={search ? Object.keys(visitorMap) : expanded}
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
            onSelect={(_, info) => {
              selectNode(info.selected ? (info.node.key as string) : null);
            }}
            titleRender={(node) => {
              return (
                <Space className="node">
                  <NodeTitle title={node.title as string} search={search} />
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
        return <Empty />;
      }
    }, [treeData, checked, expanded, search, visitorMap]);

    return (
      <div className="node-tree">
        <div className="search-container">
          <Input
            className="search-bar"
            value={searchStr}
            placeholder="搜索节点名"
            onChange={(evt) => {
              updateSearchStr(evt.target.value);
            }}
            addonAfter={
              <Button
                size="small"
                type="text"
                icon={<CloseOutlined />}
                style={{ display: search ? "" : "none" }}
                onClick={() => {
                  updateSearchStr("");
                }}
              />
            }
          />
        </div>
        {tree}
      </div>
    );
  },
  () => [nodeModel.state]
);
