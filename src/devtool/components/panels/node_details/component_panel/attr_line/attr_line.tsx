import { CheckOutlined, DownOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Input,
  InputNumber,
  Menu,
  Slider,
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
            size="small"
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
        size="small"
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
          name: key.charAt(0),
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
              name={name}
              attr={{ type: typeof value, value }}
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

    const [enumMap, menuItems] = useMemo(() => {
      const enumMap: Record<number, string> = {};
      const menuItems: ReactNode[] = [];
      for (const temp of attr.enumList || []) {
        enumMap[temp.value] = temp.name;
        menuItems.push(
          <Menu.Item
            icon={value === temp.value && <CheckOutlined />}
            key={temp.value}
          >
            {temp.name}
          </Menu.Item>
        );
      }
      return [enumMap, menuItems];
    }, [attr.enumList, value]);

    return (
      <Dropdown
        trigger={["click"]}
        overlay={
          <Menu
            onClick={({ key }) => {
              const value = parseInt(key);
              updateValue(value);
              onChange(value);
            }}
          >
            {menuItems}
          </Menu>
        }
      >
        <Button className="attr-line-enum">
          {enumMap[value]} <DownOutlined />
        </Button>
      </Dropdown>
    );
  },
  bitMask: ({ attr, onChange }) => {
    const [value, updateValue] = useState<number>(attr.value);
    useEffect(() => {
      updateValue(attr.value);
    }, [attr.value]);

    const regSingleBit = useMemo(() => /^0*10*$/, []);

    const [, /* enumMap */ menuItems] = useMemo(() => {
      const enumMap: Record<number, string> = {};
      const menuItems: ReactNode[] = [];
      for (const temp of attr.bitmaskList || []) {
        enumMap[temp.value] = temp.name;
        menuItems.push(
          <Menu.Item
            icon={
              regSingleBit.test(temp.value.toString(2)) &&
              (value & temp.value) === temp.value && <CheckOutlined />
            }
            key={temp.value}
          >
            {`${temp.name} (${temp.value})`}
          </Menu.Item>
        );
      }
      return [enumMap, menuItems];
    }, [attr.bitmaskList, value]);

    return (
      <Dropdown
        trigger={["click"]}
        overlay={
          <Menu
            onClick={({ key }) => {
              let v = parseInt(key);
              // 单一 bit 是需要切换的，否则是直接赋值
              if (regSingleBit.test(v.toString(2))) {
                v = (v & value ? v ^ value : v | value) >>> 0;
              }
              updateValue(v);
              onChange(v);
            }}
          >
            {menuItems}
          </Menu>
        }
      >
        <Button className="attr-line-enum">
          {value} <DownOutlined />
        </Button>
      </Dropdown>
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
      <div className="attr-line-content">
        {Attr ? <Attr attr={attr} onChange={onChange} /> : JSON.stringify(attr)}
      </div>
    </div>
  );
};
