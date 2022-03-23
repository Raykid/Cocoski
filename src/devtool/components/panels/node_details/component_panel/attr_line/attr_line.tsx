import { InputNumber, Slider, Tooltip } from "antd";
import React, { ComponentType, FC, useMemo, useState } from "react";
import { ComponentAttr } from "../../../../../../global/component_attr";
import "./attr_line.less";

const attrMap: Record<
  string,
  ComponentType<{ attr: ComponentAttr; onChange: (value: any) => void }>
> = {
  number: ({ attr, onChange }) => {
    const { step = 0.01, min, max, slide } = attr;
    const [value, updateValue] = useState<number>(attr.value);

    return (
      <div className="attr-line-number">
        {slide && min && max && (
          <Slider
            className="attr-line-number-slider"
            value={value}
            step={step}
            min={min}
            max={max}
            onChange={(value) => {
              updateValue(value);
              onChange(value);
            }}
          />
        )}
        <Tooltip
          title={
            <div>
              <div>Step: {step}</div>
              {min && <div>Min: {min}</div>}
              {max && <div>Max: {max}</div>}
            </div>
          }
        >
          <InputNumber
            className="attr-line-number-input"
            value={value}
            step={step}
            min={min}
            max={max}
            style={{ width: "100%" }}
            onChange={(value) => {
              updateValue(value);
              onChange(value);
            }}
          />
        </Tooltip>
      </div>
    );
  },
};

export const AttrLine: FC<{
  name: string;
  attr: ComponentAttr;
  onChange: (value: any) => void;
}> = ({ name, attr, onChange }) => {
  const { type, tooltip, displayName } = attr;
  const Attr = type && attrMap[type];
  const nameToShow = useMemo(() => {
    const targetName = displayName || name;
    return targetName.charAt(0).toUpperCase() + targetName.substring(1);
  }, [name, displayName]);
  return (
    <div className="attr-line">
      <Tooltip title={tooltip || nameToShow}>
        <div className="attr-line-name">{nameToShow}</div>
      </Tooltip>
      <div className="attr-line-content">
        {Attr ? <Attr attr={attr} onChange={onChange} /> : JSON.stringify(attr)}
      </div>
    </div>
  );
};
