import { Popover } from "antd";
import React, { FC, useMemo, useState } from "react";
import { RGBColor, SketchPicker } from "react-color";
import "./color_picker.less";

export const ColorPicker: FC<{
  color: number;
  onChange: (color: {
    value: number;
    rgba: { r: number; g: number; b: number; a: number };
  }) => void;
}> = ({ color, onChange }) => {
  const [rgbStr, aStr, rgba] = useMemo(() => {
    const [a, b, g, r] = [
      color >>> 24,
      (color >>> 16) & 0xff,
      (color >>> 8) & 0xff,
      color & 0xff,
    ];
    const rgb = (r << 16) | (g << 8) | b;
    let rgbStr = rgb.toString(16);
    while (rgbStr.length < 6) {
      rgbStr = "0" + rgbStr;
    }
    return ["#" + rgbStr, a / 2.55 + "%", { a: a / 255, b, g, r }];
  }, [color]);
  const [value, updateValue] = useState<Required<RGBColor>>(rgba);

  return (
    <Popover
      content={
        <SketchPicker
          className="color-picker-picker"
          color={value}
          onChange={(color) => {
            const rgba = color.rgb as Required<RGBColor>;
            updateValue(rgba);
            onChange({
              rgba,
              value:
                ((rgba.a * 255) << 24) |
                (rgba.b << 16) |
                (rgba.g << 8) |
                rgba.r,
            });
          }}
        />
      }
      trigger={["click"]}
    >
      <div className="color-picker">
        <div className="color" style={{ backgroundColor: rgbStr }} />
        <div className="alpha" style={{ width: aStr }} />
      </div>
    </Popover>
  );
};
