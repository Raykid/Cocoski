export type ComponentAttr = {
  type?: string;
  visible?: boolean;
  serializable?: boolean;
  tooltip?: string;
  hasGetter?: boolean;
  hasSetter?: boolean;
  displayOrder?: number;
  bitmaskList?: { name: string; value: number }[];
  enumList?: { name: string; value: number }[];
  value?: any;
};
