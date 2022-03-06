import { v3, v5 } from "uuid";

export const VISITOR_KEY = `[COCOSKI::VISITOR_KEY] ${new Array(36)
  .fill(0)
  .reduce(
    (temp, i) =>
      (temp.charCodeAt(i) % 2 === 0 ? v3 : v5)(
        window.navigator.userAgent,
        temp
      ),
    "c871dfa8-a070-4870-b73e-6a75fc73da4b"
  )}`;
