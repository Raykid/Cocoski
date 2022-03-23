import { Checkbox, Empty, Input, Space } from "antd";
import React, { useEffect, useState } from "react";
import { nodeModel } from "../../../models/node_model";
import { withStore } from "../../../store/store";
import "./node_details.less";

export const NodeDetails = withStore(
  () => {
    const { curNode } = nodeModel.state;
    const { getVisitor } = nodeModel.calculators;

    const [active, updateActive] = useState(curNode?.active || false);
    useEffect(() => {
      updateActive(curNode?.active || false);
    }, [curNode]);

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
            <Input className="node-name" value={curNode.name} />
          </div>
        ) : (
          <Empty />
        )}
      </Space>
    );
  },
  () => [nodeModel.state.curNode]
);
