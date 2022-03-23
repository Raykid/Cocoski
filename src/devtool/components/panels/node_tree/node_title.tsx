import React, { FC, ReactNode, useMemo } from "react";

export const NodeTitle: FC<{ title: string; search: string }> = ({
  title,
  search,
}) => {
  return useMemo(() => {
    let titleNode: ReactNode = title;
    if (search && title) {
      const regTitle = new RegExp(search, "ig");
      let result: RegExpExecArray | null = null;
      let lastIndex = 0;
      const titleContents: ReactNode[] = [];
      while ((result = regTitle.exec(title))) {
        titleContents.push(
          title.substring(lastIndex, result.index),
          <b style={{ color: "rgb(23, 125, 220)" }}>{result[0]}</b>
        );
        lastIndex = regTitle.lastIndex;
      }
      titleContents.push(title.substring(lastIndex));
      titleNode = titleContents;
    }
    return <div className="node-title">{titleNode}</div>;
  }, [title, search]);
};
