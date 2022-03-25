import { CloseCircleTwoTone, SelectOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import React, { useMemo } from "react";
import { nodeModel } from "../../../../../models/node_model";
import { withStore } from "../../../../../store/store";
import "./object_ref.less";

export type ObjectRefProps = {
  type?: string;
  id?: string;
  onChange: (id?: string) => void;
};

export const ObjectRef = withStore(
  ({ onChange, type, id }: ObjectRefProps) => {
    const { visitorMap } = nodeModel.state;

    const visitor = useMemo(() => {
      return id ? visitorMap[id] || null : null;
    }, [visitorMap, id]);
    onChange;
    return (
      <div className="object-ref">
        <div className={`object-ref-tag ${type?.replace(/\.+/g, "_") || ""}`}>
          {type || ""}
        </div>
        <div className={`object-ref-container ${visitor ? "" : "blank"}`}>
          <span>{visitor ? visitor.target.name : type}</span>
          <div className="object-ref-button-container">
            <Tooltip title="清除引用">
              <Button
                className="object-ref-clear-button"
                type="text"
                icon={
                  <CloseCircleTwoTone twoToneColor={["red", "lightpink"]} />
                }
                onClick={() => {
                  onChange();
                }}
              />
            </Tooltip>
            <Button
              className="object-ref-ref-button"
              type="text"
              icon={<SelectOutlined />}
              onClick={() => {
                console.log("Select");
              }}
            />
          </div>
        </div>
      </div>
    );
  },
  () => [nodeModel.state.visitorMap]
);
