import { GoldenLayout } from "golden-layout";
import "golden-layout/dist/less/goldenlayout-base.less";
import "golden-layout/dist/less/themes/goldenlayout-dark-theme.less";
import { debounce } from "lodash";
import React, { ReactPortal, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { layoutModel } from "../../models/layout_model";
import { withStore } from "../../store/store";
import { Controls } from "../panels/controls/controls";
import { NodeDetails } from "../panels/node_details/node_details";
import { NodeTree } from "../panels/node_tree/node_tree";
import "./page.less";

const panels: { [name: string]: React.ComponentType<{}> } = {
  Controls,
  NodeTree,
  NodeDetails,
};

const panelResolves: { [name: string]: (portal: ReactPortal) => void } = {};

export const Page = withStore(
  () => {
    const { config } = layoutModel.state;
    const { saveConfig } = layoutModel.commands;
    const refContainer = useRef<HTMLDivElement>(null);
    const [layout, updateLayout] = useState<GoldenLayout | null>(null);
    const [portals, updatePortals] = useState<ReactPortal[]>([]);

    useEffect(() => {
      if (!layout && refContainer.current) {
        updateLayout(new GoldenLayout(refContainer.current));
      }
    }, [refContainer.current, layout]);

    useEffect(() => {
      if (layout) {
        layout.on("stateChanged", () => {
          saveConfig(layout.saveLayout());
        });
        // 监听页面尺寸变化
        window.addEventListener(
          "resize",
          debounce(() => {
            layout.updateRootSize(true);
          }, 100)
        );
        const promisePanelPortal: Promise<ReactPortal>[] = [];
        for (const panelName in panels) {
          promisePanelPortal.push(
            new Promise((resolve) => {
              panelResolves[panelName] = resolve;
              const PanelClass = panels[panelName];
              layout.registerComponentFactoryFunction(
                panelName,
                (container) => {
                  const portal = createPortal(
                    <PanelClass />,
                    container.element
                  );
                  panelResolves[panelName](portal);
                }
              );
            })
          );
        }
        updatePortals([]);
        Promise.all(promisePanelPortal).then(updatePortals);
      }
    }, [layout]);

    useEffect(() => {
      if (layout) {
        const promisePanelPortal: Promise<ReactPortal>[] = [];
        for (const panelName in panels) {
          promisePanelPortal.push(
            new Promise((resolve) => {
              panelResolves[panelName] = resolve;
            })
          );
        }
        updatePortals([]);
        Promise.all(promisePanelPortal).then(updatePortals);
        layout.loadLayout(config);
      }
    }, [layout, config]);

    return (
      <div className="page">
        <div className="panel-container" ref={refContainer}>
          {portals}
        </div>
      </div>
    );
  },
  () => [layoutModel.state]
);
