import { CheckOutlined, LockOutlined } from "@ant-design/icons";
import {
  Input,
  InputNumber,
  Select,
  Slider,
  Space,
  Switch,
  Tooltip,
} from "antd";
import { debounce } from "lodash";
import React, {
  ComponentType,
  FC,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ComponentAttr } from "../../../../../../global/component_attr";
import { NEW_KEY } from "../../../../../../global/new_key";
import { VISITOR_KEY } from "../../../../../../global/visitor_key";
import { ColorPicker } from "../color_picker/color_picker";
import { ComponentPanel } from "../component_panel";
import { ObjectRef } from "../object_ref/object_ref";
import "./attr_line.less";

const attrMap: Record<
  string,
  ComponentType<{ attr: ComponentAttr; onChange: (value: any) => void }>
> = {
  number: ({ attr, onChange }) => {
    const { step = 0.01, min, max, slide, addonBefore } = attr;
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
            size="small"
            value={value}
            precision={step.toString().split(".")[1]?.length || 0}
            step={step}
            min={min}
            max={max}
            addonBefore={addonBefore}
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
        size="small"
        value={value}
        addonBefore={attr.addonBefore}
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
              value,
            },
          });
        }}
      />
    );
  },
  valueType: ({ attr, onChange }) => {
    const [valueMap, updateValueMap] = useState<Record<string, any>>(
      attr.value
    );
    useEffect(() => {
      updateValueMap(attr.value);
    }, [attr.value]);

    const values = useMemo(() => {
      const values: { name: string; value: any }[] = [];
      for (const key in valueMap) {
        values.push({
          name: key,
          value: valueMap[key],
        });
      }
      return values;
    }, [valueMap]);

    return (
      <div
        className={`attr-line-value-type ${
          values.length === 1 ? "single" : values.length === 3 ? "triple" : ""
        }`}
      >
        {values.map(({ name, value }) => {
          return (
            <AttrLine
              key={name}
              name=""
              attr={{
                type: typeof value,
                value,
                addonBefore: name.charAt(0).toUpperCase(),
              }}
              onChange={(value) => {
                const newValueMap = {
                  ...valueMap,
                  [name]: value,
                };
                updateValueMap(newValueMap);
                onChange({
                  [NEW_KEY]: {
                    cls: attr.valueType,
                    args: Object.values(newValueMap),
                    value: newValueMap,
                  },
                });
              }}
            />
          );
        })}
      </div>
    );
  },
  enum: ({ attr, onChange }) => {
    const [value, updateValue] = useState<number>(attr.value);
    useEffect(() => {
      updateValue(attr.value);
    }, [attr.value]);

    const [enumMap, options] = useMemo(() => {
      const enumMap: Record<number, string> = {};
      const options: ReactNode[] = [];
      for (const temp of attr.enumList || []) {
        enumMap[temp.value] = temp.name;
        options.push(
          <Select.Option key={temp.value} value={temp.value}>
            <Space>
              {value === temp.value && (
                <CheckOutlined style={{ color: "rgb(23, 125, 220)" }} />
              )}
              {temp.name}
            </Space>
          </Select.Option>
        );
      }
      return [enumMap, options];
    }, [attr.enumList, value]);

    return (
      <Select
        className="attr-line-enum"
        size="small"
        value={enumMap[value]}
        onChange={(value) => {
          const v = parseInt(value);
          updateValue(v);
          onChange(v);
        }}
      >
        {options}
      </Select>
    );
  },
  bitMask: ({ attr, onChange }) => {
    const [value, updateValue] = useState<number>(attr.value);
    useEffect(() => {
      updateValue(attr.value);
    }, [attr.value]);

    const regSingleBit = useMemo(() => /^0*10*$/, []);

    const [enumMap, options, allValue] = useMemo(() => {
      const enumMap: Record<number, string> = {};
      const options: ReactNode[] = [];
      let allValue = -1;
      for (const temp of attr.bitmaskList || []) {
        if (regSingleBit.test(temp.value.toString(2))) {
          enumMap[temp.value] = temp.name;
          options.push(
            <Select.Option key={temp.value} value={temp.value}>
              {temp.name}
            </Select.Option>
          );
        } else if (temp.name === "ALL") {
          allValue = temp.value;
        }
      }
      return [enumMap, options, allValue];
    }, [attr.bitmaskList, value]);

    const values = useMemo(() => {
      const values: number[] = [];
      for (let i = 0; i < 32; i++) {
        const temp = (1 << i) >>> 0;
        if ((temp & value) !== 0 && temp in enumMap) {
          values.push(temp);
        }
      }
      return values;
    }, [value, enumMap]);

    return (
      <Tooltip title={value}>
        <Select
          className="attr-line-enum"
          size="small"
          mode="multiple"
          allowClear
          value={values}
          onChange={(selected) => {
            let value = selected.reduce((value, temp) => {
              return value | temp;
            }, 0);
            // 如果全选中了，要使用 allValue
            if (allValue >= 0 && selected.length === options.length) {
              value = allValue;
            }

            updateValue(value);
            onChange(value);
          }}
        >
          {options}
        </Select>
      </Tooltip>
    );
  },
  object: ({ attr, onChange }) => {
    const id = attr.value && attr.value[VISITOR_KEY];

    const refType = useMemo<"cc.Node" | "internal" | "custom">(() => {
      const { valueType } = attr;
      if (valueType?.startsWith("cc.")) {
        if (valueType === "cc.Node") {
          return "internal";
        } else {
          return "cc.Node";
        }
      } else {
        return "custom";
      }
    }, [attr.valueType]);

    return (
      <ObjectRef
        refType={refType}
        type={attr.valueType}
        id={id}
        onChange={(id) => {
          if (id) {
            onChange({ [VISITOR_KEY]: id });
          } else {
            onChange(null);
          }
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
  const {
    type,
    value,
    tooltip,
    displayName,
    readonly = false,
    hasGetter = true,
    hasSetter = true,
  } = attr;
  const Attr = type && attrMap[type];
  const nameToShow = useMemo(() => {
    const targetName = displayName || name;
    return targetName.charAt(0).toUpperCase() + targetName.substring(1);
  }, [name, displayName]);
  return hasGetter ? (
    type === "subComp" ? (
      <ComponentPanel comp={{ ...value, name: nameToShow }} hasLog />
    ) : (
      <div className={`attr-line ${readonly || !hasSetter ? "readonly" : ""}`}>
        <Tooltip
          title={
            tooltip
              ? tooltip.startsWith("i18n:")
                ? nameToShow
                : tooltip
              : nameToShow
          }
        >
          <div className="attr-line-name">{nameToShow}</div>
        </Tooltip>
        <LockOutlined className="lock" />
        <div className="attr-line-content">
          {Attr ? (
            <Attr attr={attr} onChange={onChange} />
          ) : (
            JSON.stringify(attr)
          )}
        </div>
      </div>
    )
  ) : null;
};
