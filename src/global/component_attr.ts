export type ComponentAttr = {
  type?: string;
  visible?: boolean;
  serializable?: boolean;
  tooltip?: string;
  hasGetter?: boolean;
  hasSetter?: boolean;
  displayOrder?: number;
  displayName?: string;
  bitmaskList?: { name: string; value: number }[];
  enumList?: { name: string; value: number }[];
  value?: any;

  // number
  step?: number;
  min?: number;
  max?: number;
  slide?: boolean;
};
