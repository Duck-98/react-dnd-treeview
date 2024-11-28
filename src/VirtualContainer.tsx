import React, { forwardRef } from "react";
import { ReactElement } from "react";
import { Placeholder } from "./Placeholder";
import { Node } from "./Node";
import { NodeModel } from "./types";
import { useTreeContext } from "./hooks";

interface VirtualContainerProps<T> {
  virtualizer: {
    getTotalSize: () => number;
    getVirtualItems: () => Array<{
      index: number;
      start: number;
      size: number;
    }>;
  };
  visibleNodes: Array<{
    node: NodeModel;
    depth: number;
  }>;
  className: string;
  depth: number;
  parentId: string | number;
}

export const VirtualContainer = forwardRef(
  <T,>(
    {
      virtualizer,
      visibleNodes,
      className,
      depth,
      parentId,
    }: VirtualContainerProps<T>,
    ref: React.Ref<HTMLElement>
  ): ReactElement => {
    const treeContext = useTreeContext<T>();
    const Component = treeContext.listComponent;
    const rootProps = treeContext.rootProps || {};

    return (
      <Component
        ref={ref}
        role="list"
        data-virtualized="true"
        data-total-items={visibleNodes.length}
        data-virtual-start={virtualizer.getVirtualItems()[0]?.index || 0}
        {...rootProps}
        className={className}
        style={{
          height: treeContext.virtualizeOptions?.containerHeight || "600px",
          overflow: "auto",
          ...rootProps?.style,
        }}
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const { node, depth: nodeDepth } = visibleNodes[virtualRow.index];

            return (
              <div
                key={node.id}
                data-index={virtualRow.index}
                data-virtual-index={virtualRow.index} // 추가: 가상 인덱스
                data-real-index={visibleNodes.findIndex(
                  (vn) => vn.node.id === node.id
                )} // 추가: 실제 인덱스
                data-node-id={node.id}
                data-parent-id={node.parent}
                data-depth={nodeDepth}
                style={{
                  position: "absolute",
                  top: `${virtualRow.start}px`,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                }}
              >
                <Placeholder
                  depth={nodeDepth}
                  listCount={visibleNodes.length}
                  dropTargetId={node.parent}
                  index={virtualRow.index}
                />
                <Node id={node.id} depth={nodeDepth} />
              </div>
            );
          })}
          <Placeholder
            depth={depth}
            listCount={visibleNodes.length}
            dropTargetId={parentId}
          />
        </div>
      </Component>
    );
  }
);

VirtualContainer.displayName = "VirtualContainer";
