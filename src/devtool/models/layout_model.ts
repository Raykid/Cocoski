import { LayoutConfig } from "golden-layout";
import { createModel } from "../store/store";

const LAYOUT_KEY = "Cocoski::LayoutConfig";
const initConfig = (): LayoutConfig => ({
  root: {
    type: "column",
    content: [
      {
        type: "stack",
        content: [
          {
            type: "component",
            content: [],
            width: 50,
            minWidth: 0,
            height: 50,
            minHeight: 50,
            id: "",
            maximised: false,
            isClosable: true,
            reorderEnabled: true,
            title: "Controls",
            header: { show: false },
            componentType: "Controls",
            componentState: {},
          },
        ],
        width: 50,
        minWidth: 0,
        height: 11.363636363636363,
        minHeight: 50,
        id: "",
        isClosable: true,
        maximised: false,
        activeItemIndex: 0,
      },
      {
        type: "row",
        content: [
          {
            type: "stack",
            content: [
              {
                type: "component",
                content: [],
                width: 50,
                minWidth: 0,
                height: 50,
                minHeight: 0,
                id: "",
                maximised: false,
                isClosable: true,
                reorderEnabled: true,
                title: "NodeTree",
                componentType: "NodeTree",
                componentState: {},
              },
            ],
            width: 50,
            minWidth: 0,
            height: 50,
            minHeight: 0,
            id: "",
            isClosable: true,
            maximised: false,
            activeItemIndex: 0,
          },
          {
            type: "stack",
            content: [
              {
                type: "component",
                content: [],
                width: 50,
                minWidth: 0,
                height: 50,
                minHeight: 0,
                id: "",
                maximised: false,
                isClosable: true,
                reorderEnabled: true,
                title: "NodeDetails",
                componentType: "NodeDetails",
                componentState: {},
              },
            ],
            width: 50,
            minWidth: 0,
            height: 50,
            minHeight: 0,
            id: "",
            isClosable: true,
            maximised: false,
            activeItemIndex: 0,
          },
        ],
        width: 50,
        minWidth: 0,
        height: 88.63636363636364,
        minHeight: 0,
        id: "",
        isClosable: true,
      },
    ],
    width: 50,
    minWidth: 0,
    height: 50,
    minHeight: 0,
    id: "",
    isClosable: true,
  },
  openPopouts: [],
  settings: {
    constrainDragToContainer: true,
    reorderEnabled: true,
    popoutWholeStack: false,
    blockedPopoutsThrowError: true,
    closePopoutsOnUnload: true,
    responsiveMode: "none",
    tabOverlapAllowance: 0,
    reorderOnTabMenuClick: true,
    tabControlOffset: 10,
    popInOnClose: false,
  },
  dimensions: {
    borderWidth: 5,
    borderGrabWidth: 5,
    minItemHeight: 10,
    minItemWidth: 10,
    headerHeight: 20,
    dragProxyWidth: 300,
    dragProxyHeight: 200,
  },
  header: {
    show: "top",
    popout: "open in new window",
    close: "close",
    maximise: "maximise",
    minimise: "minimise",
    tabDropdown: "additional tabs",
  },
});

export const layoutModel = createModel({
  name: "Layout",
  initState: () => {
    const configStr = window.localStorage.getItem(LAYOUT_KEY);
    const config: LayoutConfig = configStr
      ? JSON.parse(configStr)
      : initConfig();
    return {
      config,
    };
  },
  operations: {
    saveConfig: function (_, config: any) {
      const configStr = JSON.stringify(config);
      window.localStorage.setItem(LAYOUT_KEY, configStr);
    },
    reset: function (state) {
      state.config = initConfig();
    },
  },
});
