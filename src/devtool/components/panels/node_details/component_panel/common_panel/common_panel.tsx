import React, { useMemo } from "react";
import { NodeComponent } from "../../../../../../global/node_component";
import { nodeModel } from "../../../../../models/node_model";
import { withStore } from "../../../../../store/store";
import { AttrLine } from "../attr_line/attr_line";
import "./common_panel.less";

export const CommonPanel = withStore(
  ({ comp }: { comp: NodeComponent }) => {
    const { getVisitor } = nodeModel.calculators;
    const attrs = useMemo(() => {
      return Object.keys(comp.attrs).map((name) => {
        return (
          <AttrLine
            key={name}
            name={name}
            attr={comp.attrs[name]}
            onChange={(value) => {
              getVisitor(comp.id)?.set(name, value);
            }}
          />
        );
      });
    }, [comp.attrs]);
    return <div className="common-panel">{attrs}</div>;
  },
  () => [nodeModel.state.visitorMap]
);
