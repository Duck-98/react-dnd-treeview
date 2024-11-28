import React, { PropsWithChildren, ReactElement } from "react";
import { NodeModel } from "./types";
import { useTreeContext, useDropRoot, useContainerClassName } from "./hooks";
import { isDroppable } from "./utils";

import { StandardContainer } from "./StandardContainer";
import { VirtualContainer } from "./VirtualContainer";
import { useVirtualTree } from "./hooks/useVirtualTree";

type Props = PropsWithChildren<{
  parentId: NodeModel["id"];
  depth: number;
}>;

export const Container = <T,>(props: Props): ReactElement => {
  const treeContext = useTreeContext<T>();

  const { ref, shouldUseVirtual, visibleNodes, virtualizer } = useVirtualTree(
    props.parentId,
    props.depth
  );

  const [isOver, dragSource, drop] = useDropRoot<T>(ref);
  const className = useContainerClassName(props.parentId, isOver);

  const isRootContainer = props.parentId === treeContext.rootId;

  if (
    isRootContainer &&
    isDroppable<T>(dragSource, treeContext.rootId, treeContext)
  ) {
    drop(ref);
  }

  if (shouldUseVirtual) {
    return (
      <VirtualContainer
        ref={ref}
        virtualizer={virtualizer}
        visibleNodes={visibleNodes}
        className={className}
        depth={props.depth}
        parentId={props.parentId}
      />
    );
  }

  return (
    <StandardContainer
      ref={ref}
      className={className}
      depth={props.depth}
      parentId={props.parentId}
    />
  );
};
