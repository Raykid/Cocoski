import { GoldenLayout, LayoutConfig } from "golden-layout";
import "golden-layout/dist/less/goldenlayout-base.less";
import "golden-layout/dist/less/themes/goldenlayout-dark-theme.less";
import React, { FC, ReactPortal, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { withStore } from "../../store/store";
import { NodeTree } from "../node_tree/node_tree";
import "./page.less";

const panels: { [name: string]: FC } = {
  NodeTree,
};

export const Page = withStore(
  () => {
    const refContainer = useRef<HTMLDivElement>(null);

    const [portals, updatePortals] = useState<ReactPortal[]>([]);
    const [layout, updateLayout] = useState<GoldenLayout | null>(null);

    useEffect(() => {
      if (!layout && refContainer.current) {
        const config: LayoutConfig = {
          root: {
            type: "stack",
            content: [
              {
                type: "component",
                componentType: "NodeTree",
              },
            ],
          },
        };
        const layout = new GoldenLayout(refContainer.current);
        const promisePanelPortal: Promise<ReactPortal>[] = [];
        for (const panelName in panels) {
          promisePanelPortal.push(
            new Promise((resolve) => {
              const PanelClass = panels[panelName];
              layout.registerComponentFactoryFunction(
                panelName,
                (container) => {
                  const portal = createPortal(
                    <PanelClass />,
                    container.element
                  );
                  resolve(portal);
                }
              );
            })
          );
        }
        Promise.all(promisePanelPortal).then(updatePortals);
        layout.loadLayout(config);
        updateLayout(layout);
      }
    }, [refContainer.current, layout]);
    return (
      <div className="page">
        <div className="panel-container" ref={refContainer} />
        {portals}
      </div>
    );
  },
  () => []
);
