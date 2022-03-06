export function wrapProxy<T>(root: any): {
  proxy: T;
  update: (root: any) => void;
  effect: () => void;
} {
  const cache: any = {};
  const subWrapperMap: Map<any, ReturnType<typeof wrapProxy>> = new Map();
  return {
    proxy: new Proxy(
      { ...root },
      {
        get: (_, key: string) => {
          const temp = root[key];
          if (temp && typeof temp === "object") {
            // 移除缓存并释放副作用
            const cached = cache[key];
            if (cached && subWrapperMap.has(cached)) {
              subWrapperMap.get(cached)!.effect();
              subWrapperMap.delete(cached);
            }
            if (Object.getOwnPropertyDescriptor(root, key)) {
              const wrapper = wrapProxy(temp);
              subWrapperMap.set(wrapper.proxy, wrapper);
              return (cache[key] = wrapper.proxy);
            } else {
              return temp;
            }
          } else {
            return temp;
          }
        },
        set: (_, key: string, value) => {
          root[key] = value;
          return true;
        },
        deleteProperty: (_, key) => {
          delete root[key];
          delete cache[key];
          return true;
        },
      }
    ) as T,
    update: (_root) => {
      root = _root;
      subWrapperMap.forEach((wrapper) => wrapper.update(root));
    },
    effect: () => {
      for (const key of Object.keys(cache)) {
        delete cache[key];
      }
      subWrapperMap.forEach((wrapper) => wrapper.effect());
      subWrapperMap.clear();
    },
  };
}
