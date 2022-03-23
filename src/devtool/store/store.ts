import produce from "immer";
import React, { ComponentType, FunctionComponent } from "react";
import { connect, Provider as RRProvider } from "react-redux";
import { createStore } from "redux";
import { v4 } from "uuid";
import { isGenerator } from "../utils/generator_util";
import { wrapProxy } from "../utils/store_util";
import { Action } from "./action";

const typeInitModel = "@@INIT-MODEL";
const typeUpdateModel = "@@UPDATE-MODEL";
const typeRevertModel = "@@REVERT_MODEL";

type OperationMap<State> = Record<
  string,
  (
    state: State,
    ...args: any[]
  ) => Generator<unknown, State | void> | State | void
>;

type SelectorMap<State> = Record<string, (state: State) => any>;

type CalculatorMap<State> = Record<
  string,
  (state: State, ...args: any[]) => any
>;

type Model<
  State extends object,
  Operations extends OperationMap<State>,
  Selectors extends SelectorMap<State>,
  Calculators extends CalculatorMap<State>
> = {
  readonly state: State;
  readonly commands: {
    [K in keyof Operations]: (
      ...args: Operations[K] extends (state: State, ...args: infer R) => unknown
        ? R
        : never
    ) => ReturnType<Operations[K]> extends Generator ? Promise<State> : State;
  };
  readonly selectors: {
    readonly [K in keyof Selectors]: ReturnType<Selectors[K]>;
  };
  readonly calculators: {
    readonly [K in keyof Calculators]: (
      ...args: Calculators[K] extends (
        state: State,
        ...args: infer R
      ) => unknown
        ? R
        : never
    ) => ReturnType<Calculators[K]>;
  };
};

type StoreState = {
  [K in keyof typeof modelMap]: typeof modelMap[K]["model"]["state"];
};

type CreateModelOptions<State, Operations, Selectors, Calculators> = {
  name: string;
  initState: () => State;
  operations?: Operations;
  selectors?: Selectors;
  calculators?: Calculators;
};

const modelMap: {
  [name: string]: {
    model: Model<any, any, any, any>;
    operations: OperationMap<any>;
    selectors: SelectorMap<any>;
    calculators: CalculatorMap<any>;
  };
} = {};

let delayedActionPromise: Promise<void> | null = null;
const store = createStore(
  (state: StoreState | undefined, action: Action<any>) => {
    delayedActionPromise = null;
    // 初始化
    if (!state) {
      state = {} as StoreState;
      for (const k in modelMap) {
        const key = k as keyof typeof modelMap;
        state[key] = modelMap[key].model.state;
      }
    } else {
      // 判断 action
      switch (action.type) {
        case typeUpdateModel:
        case typeInitModel:
        case typeRevertModel:
          const { name, state: modelState } = action.data as {
            name: string;
            state: any;
          };
          if (modelState !== state[name]) {
            state = {
              ...state,
              [name]: modelState,
            };
          }
          break;
        default:
          const [modelName, operationName] = action.type.split("::");
          const args = action.data as any[];
          const { model, operations } = modelMap[modelName];
          const operation = operations[operationName];
          let generator: Generator | null = null;
          const oldState = state[modelName];
          const { proxy, update, effect } = wrapProxy(oldState);
          const newState = produce(oldState, (draft: any) => {
            // 用 draft 更新 proxy
            update(draft);
            // 首次执行操作，使用 proxy
            const stateOrGenerator = operation(proxy, ...args);
            if (!isGenerator(stateOrGenerator)) {
              // 同步任务
              return stateOrGenerator;
            } else {
              // 异步任务
              generator = stateOrGenerator as Generator;
            }
          });
          // 检查状态即时更新
          if (newState !== oldState) {
            state = {
              ...state,
              [modelName]: newState,
            };
          }
          // 判断是否是异步操作
          if (generator) {
            generator = generator as Generator;
            delayedActionPromise = (async () => {
              // 需要增加一个微任务延时，使得在异步 reducer 的一开始也能够调用其他 reducer
              await Promise.resolve();
              let result: IteratorResult<any>;
              let tempValue: any;
              do {
                if (tempValue instanceof Promise) {
                  tempValue = await tempValue;
                }
                const oldState = model.state;
                let error: any = null;
                const newState = produce(oldState, (draft: any) => {
                  // 更新 root
                  update(draft);
                  // 随时监听状态变化，更新 draft
                  const unsubscribe = store.subscribe(() => {
                    if (result && !result.done) {
                      // 使用最新状态更新一下 draft
                      const newState = store.getState()[modelName];
                      for (const key in newState) {
                        draft[key] = newState[key];
                      }
                    }
                  });
                  try {
                    result = generator!.next(tempValue);
                    tempValue = result.value;
                  } catch (err) {
                    error = err;
                  }
                  // 取消监听
                  unsubscribe();
                });
                // 更新 store
                if (error) {
                  // 出错了，需要回滚状态
                  store.dispatch({
                    type: typeRevertModel,
                    data: {
                      name: modelName,
                      state: oldState,
                    },
                  });
                  // 打印错误到控制台
                  console.error(error);
                  // 退出循环
                  break;
                } else {
                  if (newState !== oldState) {
                    store.dispatch({
                      type: typeUpdateModel,
                      data: {
                        name: modelName,
                        state: newState,
                      },
                    });
                  }
                }
              } while (!result!.done);
              // 回收副作用
              effect();
            })();
          }
          break;
      }
    }
    return state;
  }
);

export function withStore<P = {}>(
  cls: ComponentType<P>,
  usedState?: (state: StoreState) => object | any[]
): ComponentType<P> {
  let map: (state: StoreState, props: P) => P;
  if (usedState) {
    const keys: any = {};
    map = (state: StoreState, props: P) => {
      const _state: any = usedState(state);
      const result: any = {
        ...props,
      };
      for (const i in _state) {
        if (!keys[i]) {
          keys[i] = `${i}::${v4()}`;
        }
        result[keys[i]] = _state[i];
      }
      return result;
    };
  } else {
    const key = v4();
    map = (state: StoreState, props: P) => {
      return {
        ...props,
        [key]: state,
      };
    };
  }
  return connect(map)(cls as any);
}

export const Provider: FunctionComponent = ({ children }) => {
  return React.createElement(RRProvider, { store } as any, children);
};

export function createModel<
  State extends object,
  Operations extends OperationMap<State>,
  Selectors extends SelectorMap<State>,
  Calculators extends CalculatorMap<State>
>(
  options: CreateModelOptions<State, Operations, Selectors, Calculators>
): Model<State, Operations, Selectors, Calculators> {
  const {
    name,
    initState,
    operations = {},
    selectors = {},
    calculators = {},
  } = options;
  const commands: any = {};
  for (const key in operations) {
    commands[key] = (...args: any[]) => {
      // 更新 store
      store.dispatch({
        type: `${name}::${key}`,
        data: args,
      });
      return delayedActionPromise?.then(() => model.state) || model.state;
    };
  }
  const _selectors: any = {};
  for (const key in selectors) {
    const selector = selectors[key as keyof typeof selectors] as (
      state: State
    ) => any;
    Object.defineProperty(_selectors, key, {
      configurable: true,
      enumerable: true,
      get() {
        return selector(model.state);
      },
    });
  }
  const _calculators: any = {};
  for (const key in calculators) {
    const calculator = calculators[key as keyof typeof calculators] as (
      state: State,
      ...args: any[]
    ) => any;
    _calculators[key] = (...args: any[]) => {
      // 间接调用 calculators 的同名方法
      return calculator(model.state, ...args);
    };
  }
  const model: Model<State, Operations, Selectors, Calculators> = {
    get state() {
      return store.getState()[name];
    },
    commands,
    selectors: _selectors,
    calculators: _calculators,
  };
  modelMap[name] = {
    model,
    operations,
    selectors,
    calculators,
  };
  store.dispatch({
    type: typeUpdateModel,
    data: {
      name,
      state: initState(),
    },
  });
  return model;
}
