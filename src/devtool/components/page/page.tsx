import { Button, Space } from "antd";
import React from "react";
import { testModel } from "../../models/test_model";
import { withStore } from "../../store/store";
import { sendToPage } from "../../utils/message_util";
import "./page.less";

export const Page = withStore(
  () => {
    return (
      <Space className="page" direction="vertical">
        <Button
          onClick={async () => {
            await sendToPage("log", { datas: ["Hello!", 1, { fuck: "you" }] });
            console.log("log done.");
          }}
        >
          log
        </Button>
        <div>
          {testModel.selectors.a} {testModel.selectors.b}
        </div>
        <Button
          onClick={() => {
            testModel.commands.addA(3);
          }}
        >
          Add 3 to a
        </Button>
        <Button
          onClick={() => {
            testModel.commands.addB(3);
          }}
        >
          Add 3 to b. Won't Refresh before click the button above.
        </Button>
      </Space>
    );
  },
  () => [testModel.state.a]
);
