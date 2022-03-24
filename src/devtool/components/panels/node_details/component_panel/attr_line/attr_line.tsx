import { Input, InputNumber, Slider, Switch, Tooltip } from "antd";
import { debounce } from "lodash";
import React, { ComponentType, FC, useEffect, useMemo, useState } from "react";
import { ComponentAttr } from "../../../../../../global/component_attr";
import { NEW_KEY } from "../../../../../../global/new_key";
import { ColorPicker } from "../color_picker/color_picker";
import "./attr_line.less";

const attrMap: Record<
  string,
  ComponentType<{ attr: ComponentAttr; onChange: (value: any) => void }>
> = {
  number: ({ attr, onChange }) => {
    const { step = 0.01, min, max, slide } = attr;
    const [value, updateValue] = useState<number>(attr.value);
    useEffect(() => {
      updateValue(attr.value);
    }, [attr.value]);

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
  string: ({ attr, onChange }) => {
    const [value, updateValue] = useState<string>(attr.value);
    useEffect(() => {
      updateValue(attr.value);
    }, [attr.value]);

    const _onChange = useMemo(() => {
      return debounce(onChange, 200);
    }, [onChange]);

    return (
      <Input
        style={{ width: "100%" }}
        value={value}
        onChange={(evt) => {
          const value = evt.target.value;
          updateValue(value);
          _onChange(value);
        }}
      />
    );
  },
  boolean: ({ attr, onChange }) => {
    const [value, updateValue] = useState<boolean>(attr.value);
    useEffect(() => {
      updateValue(attr.value);
    }, [attr.value]);

    const _onChange = useMemo(() => {
      return debounce(onChange, 200);
    }, [onChange]);

    return (
      <Switch
        checked={value}
        size="small"
        onChange={(checked) => {
          updateValue(checked);
          _onChange(checked);
        }}
      />
    );
  },
  color: ({ attr, onChange }) => {
    const [value, updateValue] = useState<number>(attr.value);
    useEffect(() => {
      updateValue(attr.value);
    }, [attr.value]);

    return (
      <ColorPicker
        color={value}
        onChange={({ rgba, value }) => {
          const { r, g, b, a } = rgba;
          updateValue(value);
          onChange({
            [NEW_KEY]: {
              cls: "cc.Color",
              args: [r, g, b, a],
            },
          });
        }}
      />
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
