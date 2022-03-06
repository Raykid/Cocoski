/** @format */

/// <reference types="chrome"/>
/// <reference types="react"/>
/// <reference types="redux"/>
/// <reference types="react-redux"/>
/// <reference types="immer"/>
/// <reference types="golden-layout"/>
/// <reference types="antd"/>
/// <reference types="react-color"/>
/// <reference types="lodash"/>
/// <reference path="./types.d.ts"/>

import "antd/dist/antd.dark.css";
import React from "react";
import ReactDOM from "react-dom";
import { Page } from "./components/page/page";
import "./index.less";
import { Provider } from "./store/store";
import { injectScript } from "./utils/message_util";

injectScript();

ReactDOM.render(
  <Provider>
    <Page />
  </Provider>,
  document.getElementById("root")
);
