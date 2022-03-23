import { Checkbox, Empty, Input, Space } from "antd";
import { debounce } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { nodeModel } from "../../../models/node_model";
import { withStore } from "../../../store/store";
import "./node_details.less";

export const NodeDetails = withStore(
  () => {
    const { nodeTree, curId } = nodeModel.state;
    const { getVisitor } = nodeModel.calculators;
    const { getNode } = nodeModel.pureCalculators;

    const curNode = useMemo(
      () => nodeTree && getNode(nodeTree, curId),
      [nodeTree, curId]
    );
    const [active, updateActive] = useState(curNode?.active || false);
    const [name, updateName] = useState(curNode?.name || "");
    useEffect(() => {
      updateActive(curNode?.active || false);
      updateName(curNode?.name || "");
    }, [curNode?.active, curNode?.name]);

    const syncName = useMemo(
      () =>
        debounce((id: string, name: string) => {
          getVisitor(id)?.set("name", name);
        }, 300),
      []
    );

    return (
      <Space className="node-details" direction="vertical">
        {curNode ? (
          <div className="node-info">
            <Checkbox
              checked={active}
              onChange={(evt) => {
                const active = evt.target.checked;
                updateActive(active);
                getVisitor(curNode.id)?.set("active", active);
              }}
            />
            <Input
              className="node-name"
              value={name}
              onChange={(evt) => {
                const name = evt.target.value;
                updateName(name);
                syncName(curNode.id, name);
              }}
            />
          </div>
        ) : (
          <Empty />
        )}
      </Space>
    );
  },
  () => [nodeModel.state.nodeTree, nodeModel.state.curId]
);
