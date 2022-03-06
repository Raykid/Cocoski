import { Action as ReduxAction } from "redux";

export type Action<D> = ReduxAction<string> & {
  data: D;
};
