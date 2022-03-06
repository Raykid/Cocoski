/**
 * 判断一个对象是否是 Generator
 *
 * @export
 * @param {*} target
 * @return {*}  {boolean}
 */
export function isGenerator(target: any): boolean {
  return (
    target != null &&
    typeof target.next === "function" &&
    typeof target.return === "function" &&
    typeof target.throw === "function" &&
    typeof target[Symbol.iterator] === "function"
  );
}
