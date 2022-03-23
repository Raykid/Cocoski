import { Button, message, Space } from "antd";
import React from "react";
import { layoutModel } from "../../../models/layout_model";
import { nodeModel } from "../../../models/node_model";
import { withStore } from "../../../store/store";
import "./controls.less";

export const Controls = withStore(
  () => {
    const { requestNodeTree } = nodeModel.calculators;
    const { reset } = layoutModel.commands;
    return (
      <div className="controls">
        <Space className="button-container">
          <Button
            type="primary"
            onClick={() => {
              const cancelLoading = message.loading(
                "正在刷新节点树，请稍候……",
                3
              );
              requestNodeTree().then(() => {
                cancelLoading();
                message.success("刷新成功");
              });
            }}
          >
            刷新节点树
          </Button>
          <Button
            type="primary"
            onClick={() => {
              reset();
            }}
          >
            重置布局
          </Button>
        </Space>
      </div>
    );
  },
  () => []
);
