import { Checkbox, Collapse, Space } from "antd";
import React, { ComponentType } from "react";
import { NodeComponent } from "../../../../../global/node_component";
import { nodeModel } from "../../../../models/node_model";
import { withStore } from "../../../../store/store";
import { CommonPanel } from "./common_panel/common_panel";
import "./component_panel.less";

const registerPanel: Record<
  string,
  ComponentType<{ comp: NodeComponent }>
> = {};

export const ComponentPanel = withStore(
  (props: { comp: NodeComponent }) => {
    const { comp } = props;
    const { getVisitor } = nodeModel.calculators;
    const Panel = registerPanel[comp.name] || CommonPanel;

    return (
      <div className="component-panel">
        <Collapse defaultActiveKey={["1"]}>
          <Collapse.Panel
            key="1"
            header={
              <Space className="component-name">
                <Checkbox
                  checked={comp.enabled}
                  onClick={(evt) => {
                    evt.stopPropagation();
                  }}
                  onChange={(evt) => {
                    const checked = evt.target.checked;
                    const visitor = getVisitor(comp.id);
                    visitor?.set("enabled", checked);
                  }}
                />
                <b>{comp.name}</b>
              </Space>
            }
          >
            <Panel comp={comp} />
          </Collapse.Panel>
        </Collapse>
      </div>
    );
  },
  () => [nodeModel.state.visitorMap]
);
