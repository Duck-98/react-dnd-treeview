import React, { forwardRef } from "react";
import { ReactElement } from "react";
import { Node } from "./Node";
import { Placeholder } from "./Placeholder";
import { NodeModel } from "./types";
import { useTreeContext } from "./hooks";
import { sortNodes } from "./utils/sortNodes";

interface StandardContainerProps<T> {
  ref: React.RefObject<HTMLElement>;
  className: string;
  depth: number;
  parentId: NodeModel["id"];
}

export const StandardContainer = forwardRef(
  <T,>(
    { className, depth, parentId }: StandardContainerProps<T>,
    ref: React.Ref<HTMLElement>
  ): ReactElement => {
    const treeContext = useTreeContext<T>();
    const Component = treeContext.listComponent;
    const rootProps = treeContext.rootProps || {};

    const nodes = treeContext.tree.filter((l) => l.parent === parentId);
    const view = sortNodes(nodes, treeContext);

    return (
      <Component ref={ref} role="list" {...rootProps} className={className}>
        {view.map((node, index) => {
          // console.log(parentId, "standard parentId");

          return (
            <React.Fragment key={node.id}>
              <Placeholder
                depth={depth}
                listCount={view.length}
                dropTargetId={parentId}
                index={index}
              />
              <Node id={node.id} depth={depth} />
            </React.Fragment>
          );
        })}
        <Placeholder
          depth={depth}
          listCount={view.length}
          dropTargetId={parentId}
        />
      </Component>
    );
  }
);

StandardContainer.displayName = "StandardContainer";
