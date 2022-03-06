import { v3, v5 } from "uuid";

export const NEW_KEY = `[COCOSKI::NEW_KEY] ${new Array(36)
  .fill(0)
  .reduce(
    (temp, i) =>
      (temp.charCodeAt(i) % 2 === 0 ? v3 : v5)(
        window.navigator.userAgent,
        temp
      ),
    "7407946f-8eb0-4a38-a221-14a3f822bbd1"
  )}`;
