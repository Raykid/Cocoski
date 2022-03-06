import { Button, Space } from "antd";
import React from "react";
import { layoutModel } from "../../../models/layout_model";
import { withStore } from "../../../store/store";
import "./controls.less";

export const Controls = withStore(
  () => {
    const { reset } = layoutModel.commands;
    return (
      <div className="controls">
        <Space className="button-container">
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
  () => [layoutModel.selectors.config]
);
