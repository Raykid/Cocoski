import { NEW_KEY } from "../../global/new_key";
import { VISITOR_KEY } from "../../global/visitor_key";
import { listenFromDevTool, sendToDevTool } from "./message_util";

const mutatorMap: { [id: string]: Mutator } = {};

export const symbolMutate = Symbol("Cocoski Mutate");

export function getMutator(target: any): Mutator | null {
  return (target && target[symbolMutate]) || null;
}

export function getById(id: string): Mutator | null {
  return mutatorMap[id] || null;
}

class MutatorSetter {
  constructor(public toSet: any, public toSync: any) {}
}

export class Mutator {
  private _id: string;
  get id() {
    return this._id;
  }

  private _target: any;
  get target() {
    return this._target;
  }

  private _proxy: any;

  private _listens: (() => void)[];

  constructor(target: any) {
    this._target = target;
    this._proxy = new Proxy(target, {
      set: (target, key, value) => {
        if (value instanceof MutatorSetter) {
          target[key] = value.toSet;
          value = value.toSync;
        } else {
          target[key] = value;
        }
        // 发送消息
        sendToDevTool("mutatorSync", this._id, { name: key as string, value });
        return true;
      },
    });
    this._id =
      this.target.uuid || this.target._uuid || `${Date.now()}-${Math.random()}`;
    mutatorMap[this._id] = this;
    // 监听获取属性消息
    this._listens = [
      listenFromDevTool("mutatorGet", this._id, ({ name }) => {
        const result = this._proxy[name];
        if (result && ["object", "function"].includes(typeof result)) {
          const subMutator = (result[symbolMutate] =
            result[symbolMutate] || new Mutator(result));
          return {
            [VISITOR_KEY]: subMutator.id,
          };
        } else {
          return result;
        }
      }),
      listenFromDevTool("mutatorSet", this._id, ({ name, value }) => {
        const isObject = value && typeof value === "object";
        if (isObject && VISITOR_KEY in value) {
          const id = value[VISITOR_KEY];
          if (!id) {
            this._proxy[name] = null;
            return this._proxy[name] === null;
          } else {
            const tempMutator = mutatorMap[id];
            if (tempMutator) {
              this._proxy[name] = tempMutator.target;
              return this._proxy[name] === tempMutator.target;
            } else {
              console.error(
                `value is invalid. visitorId=${id}, name=${name}, value=${value}`
              );
              return false;
            }
          }
        } else if (isObject && NEW_KEY in value) {
          try {
            const { cls, args, value: toSync } = value[NEW_KEY];
            const Cls = eval(cls);
            value = new Cls(...args);
            this._proxy[name] = new MutatorSetter(value, toSync);
          } catch (err) {}
          return this._proxy[name] === value;
        } else {
          this._proxy[name] = value;
          return this._proxy[name] === value;
        }
      }),
      listenFromDevTool(
        "mutatorCall",
        this._id,
        ({ name, args }: { name: string; args: any[] }) => {
          // 处理参数
          args = args.map((arg) => {
            const isObject = arg && typeof arg === "object";
            if (isObject && VISITOR_KEY in arg) {
              const id = arg[VISITOR_KEY];
              if (!id) {
                return null;
              } else {
                const tempMutator = mutatorMap[id];
                if (tempMutator) {
                  return tempMutator.target;
                } else {
                  throw new Error("arg is invalid. visitorId=" + id);
                }
              }
            } else if (isObject && NEW_KEY in arg) {
              try {
                const { cls, args } = arg[NEW_KEY];
                const Cls = eval(cls);
                arg = new Cls(...args);
              } catch (err) {}
              return arg;
            } else {
              return arg;
            }
          });
          // 调用函数
          const func = this._proxy[name];
          if (!(func instanceof Function)) {
            throw new Error(`There is no function called ${name}`);
          } else {
            return func.apply(this._proxy, args);
          }
        }
      ),
    ];
  }

  destroy() {
    this._listens
      .splice(0, this._listens.length)
      .forEach((handler) => handler());
    delete mutatorMap[this.id];
    this._target = null;
    this._proxy = null;
  }
}
