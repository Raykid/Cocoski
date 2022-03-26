import { PrinterOutlined } from "@ant-design/icons";
import { Button, Checkbox, Collapse, message, Space, Tooltip } from "antd";
import React, { ComponentType } from "react";
import { NodeComponent } from "../../../../../global/node_component";
import { nodeModel } from "../../../../models/node_model";
import { withStore } from "../../../../store/store";
import { sendToPage } from "../../../../utils/message_util";
import { CommonPanel } from "./common_panel/common_panel";
import "./component_panel.less";

const registerPanel: Record<
  string,
  ComponentType<{ comp: NodeComponent }>
> = {};

export const ComponentPanel = withStore(
  (props: { comp: NodeComponent; hasEnabled?: boolean; hasLog?: boolean }) => {
    const { comp, hasEnabled = false, hasLog = false } = props;
    const { getVisitor } = nodeModel.calculators;
    const Panel = registerPanel[comp.name] || CommonPanel;

    return (
      <div className="component-panel">
        <Collapse defaultActiveKey={["1"]}>
          <Collapse.Panel
            className="collapse-panel"
            key="1"
            header={
              <div className="component-title">
                <Space className="component-name">
                  {hasEnabled && (
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
                  )}
                  <b>{comp.name}</b>
                </Space>
                {hasLog && (
                  <Tooltip title="输出至控制台">
                    <Button
                      className="log-button"
                      type="text"
                      icon={<PrinterOutlined />}
                      onClick={(evt) => {
                        evt.stopPropagation();
                        sendToPage("logNode", { id: comp.id }).then(() => {
                          message.info(
                            `已输出组件 ${comp.name}，请到控制台查看`,
                            3
                          );
                        });
                      }}
                    />
                  </Tooltip>
                )}
              </div>
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
