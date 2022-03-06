export type ImmediateOrDelayed<T> = Promise<T> | T;

export type Vec2 = {
  x: number;
  y: number;
};

export type Vec3 = Vec2 & {
  z: number;
};

export type Size = {
  width: number;
  height: number;
};

export type Rect = Vec2 & Size;
