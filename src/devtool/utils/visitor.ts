import { VISITOR_KEY } from "../../global/visitor_key";
import { sendToPage } from "./message_util";

const visitorMap: { [id: string]: Visitor } = {};

export class Visitor {
  private _target: { id: string; [key: string]: any };

  public get id() {
    return this._target.id;
  }

  public get target() {
    return this._target;
  }

  public constructor(target: { id: string; [key: string]: any }) {
    this._target = target;
    visitorMap[this.id] = this;
  }

  public async get(name: string): Promise<any> {
    const result = await sendToPage("mutatorGet", this.id, { name });
    if (result && typeof result === "object" && VISITOR_KEY in result) {
      return visitorMap[result[VISITOR_KEY]] || new Visitor(result);
    } else {
      return result;
    }
  }

  public async set(name: string, value: any): Promise<boolean> {
    return await sendToPage("mutatorSet", this.id, { name, value });
  }

  public async call(name: string, ...args: any[]): Promise<any> {
    const result = await sendToPage("mutatorCall", this.id, { name, args });
    if (result && typeof result === "object") {
      return new Visitor(result);
    } else {
      return result;
    }
  }

  public destroy(): void {
    delete visitorMap[this.id];
  }
}
