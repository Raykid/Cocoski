import { createModel } from "../store/store";

export const testModel = createModel({
  name: "Test",
  initState: () => {
    return { a: 1, b: 1 };
  },
  operations: {
    addA: (state, count: number) => {
      state.a += count;
    },
    addB: (state, count: number) => {
      state.b += count;
    },
  },
  selectors: {
    a: (state) => `a: ${state.a}`,
    b: (state) => `b: ${state.b}`,
  },
});
