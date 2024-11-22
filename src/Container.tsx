// import React, { useRef, PropsWithChildren, ReactElement } from "react";
// import { Node } from "./Node";
// import { Placeholder } from "./Placeholder";
// import { NodeModel } from "./types";
// import { useTreeContext, useDropRoot, useContainerClassName } from "./hooks";
// import { compareItems, isDroppable } from "./utils";

// type Props = PropsWithChildren<{
//   parentId: NodeModel["id"];
//   depth: number;
// }>;

// export const Container = <T,>(props: Props): ReactElement => {
//   const treeContext = useTreeContext<T>();
//   const ref = useRef<HTMLLIElement>(null);
//   const nodes = treeContext.tree.filter((l) => l.parent === props.parentId);

//   let view = nodes;
//   const sortCallback =
//     typeof treeContext.sort === "function" ? treeContext.sort : compareItems;

//   if (treeContext.insertDroppableFirst) {
//     let droppableNodes = nodes.filter((n) => n.droppable);
//     let nonDroppableNodes = nodes.filter((n) => !n.droppable);

//     if (treeContext.sort === false) {
//       view = [...droppableNodes, ...nonDroppableNodes];
//     } else {
//       droppableNodes = droppableNodes.sort(sortCallback);
//       nonDroppableNodes = nonDroppableNodes.sort(sortCallback);
//       view = [...droppableNodes, ...nonDroppableNodes];
//     }
//   } else {
//     if (treeContext.sort !== false) {
//       view = nodes.sort(sortCallback);
//     }
//   }

//   const [isOver, dragSource, drop] = useDropRoot<T>(ref);

//   if (
//     props.parentId === treeContext.rootId &&
//     isDroppable<T>(dragSource, treeContext.rootId, treeContext)
//   ) {
//     drop(ref);
//   }

//   const className = useContainerClassName(props.parentId, isOver);
//   const rootProps = treeContext.rootProps || {};
//   const Component = treeContext.listComponent;

//   return (
//     <Component ref={ref} role="list" {...rootProps} className={className}>
//       {view.map((node, index) => (
//         <React.Fragment key={node.id}>
//           <Placeholder
//             depth={props.depth}
//             listCount={view.length}
//             dropTargetId={props.parentId}
//             index={index}
//           />
//           <Node id={node.id} depth={props.depth} />
//         </React.Fragment>
//       ))}
//       <Placeholder
//         depth={props.depth}
//         listCount={view.length}
//         dropTargetId={props.parentId}
//       />
//     </Component>
//   );
// };
// import React, { useRef, PropsWithChildren, ReactElement, useMemo } from "react";
// import { useVirtualizer } from "@tanstack/react-virtual";
// import { Node } from "./Node";
// import { Placeholder } from "./Placeholder";
// import { NodeModel } from "./types";
// import { useTreeContext, useDropRoot, useContainerClassName } from "./hooks";
// import { compareItems, isDroppable } from "./utils";

// type Props = PropsWithChildren<{
//   parentId: NodeModel["id"];
//   depth: number;
// }>;

// export const Container = <T,>(props: Props): ReactElement => {
//   const treeContext = useTreeContext<T>();
//   const ref = useRef<HTMLElement>(null);
//   const nodes = treeContext.tree.filter((l) => l.parent === props.parentId);

//   // 노드 정렬 로직
//   const view = useMemo(() => {
//     let sorted = [...nodes];
//     const sortCallback =
//       typeof treeContext.sort === "function" ? treeContext.sort : compareItems;

//     if (treeContext.insertDroppableFirst) {
//       let droppableNodes = sorted.filter((n) => n.droppable);
//       let nonDroppableNodes = sorted.filter((n) => !n.droppable);

//       if (treeContext.sort === false) {
//         return [...droppableNodes, ...nonDroppableNodes];
//       } else {
//         droppableNodes = droppableNodes.sort(sortCallback);
//         nonDroppableNodes = nonDroppableNodes.sort(sortCallback);
//         return [...droppableNodes, ...nonDroppableNodes];
//       }
//     } else {
//       if (treeContext.sort !== false) {
//         return sorted.sort(sortCallback);
//       }
//     }
//     return sorted;
//   }, [nodes, treeContext.sort, treeContext.insertDroppableFirst]);

//   // 드래그 앤 드롭 설정
//   const [isOver, dragSource, drop] = useDropRoot<T>(ref);

//   if (
//     props.parentId === treeContext.rootId &&
//     isDroppable<T>(dragSource, treeContext.rootId, treeContext)
//   ) {
//     drop(ref);
//   }

//   const className = useContainerClassName(props.parentId, isOver);
//   const rootProps = treeContext.rootProps || {};
//   const Component = treeContext.listComponent;

//   // 가상 스크롤 사용 여부 확인
//   const shouldUseVirtual = useMemo(() => {
//     const { virtualizeOptions } = treeContext;
//     return (
//       virtualizeOptions?.enabled &&
//       view.length >= (virtualizeOptions?.threshold || 50)
//     );
//   }, [treeContext.virtualizeOptions, view.length]);

//   // 일반 렌더링 (가상 스크롤 비활성화)
//   if (!shouldUseVirtual) {
//     return (
//       <Component ref={ref} role="list" {...rootProps} className={className}>
//         {view.map((node, index) => (
//           <React.Fragment key={node.id}>
//             <Placeholder
//               depth={props.depth}
//               listCount={view.length}
//               dropTargetId={props.parentId}
//               index={index}
//             />
//             <Node id={node.id} depth={props.depth} />
//           </React.Fragment>
//         ))}
//         <Placeholder
//           depth={props.depth}
//           listCount={view.length}
//           dropTargetId={props.parentId}
//         />
//       </Component>
//     );
//   }

//   // 가상 스크롤 설정
//   const virtualizer = useVirtualizer({
//     count: view.length,
//     getScrollElement: () => ref.current,
//     estimateSize: () => treeContext.virtualizeOptions?.itemHeight || 32,
//     overscan: treeContext.virtualizeOptions?.overscanCount || 5,
//   });

//   // 가상 스크롤 렌더링
//   return (
//     <Component
//       ref={ref}
//       role="list"
//       {...rootProps}
//       className={className}
//       style={{
//         height: treeContext.virtualizeOptions?.containerHeight || "600px",
//         overflow: "auto",
//         ...rootProps?.style,
//       }}
//     >
//       <div
//         style={{
//           height: `${virtualizer.getTotalSize()}px`,
//           width: "100%",
//           position: "relative",
//         }}
//       >
//         {virtualizer.getVirtualItems().map((virtualRow) => {
//           const node = view[virtualRow.index];

//           return (
//             <div
//               key={node.id}
//               style={{
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 width: "100%",
//                 transform: `translateY(${virtualRow.start}px)`,
//               }}
//             >
//               <Node id={node.id} depth={props.depth} />
//             </div>
//           );
//         })}
//       </div>
//     </Component>
//   );
// };

import React, {
  useRef,
  PropsWithChildren,
  ReactElement,
  useMemo,
  useCallback,
} from "react";
import { Node } from "./Node";
import { Placeholder } from "./Placeholder";
import { NodeModel } from "./types";
import { useTreeContext, useDropRoot, useContainerClassName } from "./hooks";
import { compareItems, isDroppable } from "./utils";
import { useVirtualTree } from "./hooks/useVirtualTree";
import { useVirtualizer } from "@tanstack/react-virtual";

type Props = PropsWithChildren<{
  parentId: NodeModel["id"];
  depth: number;
}>;

export const Container = <T,>(props: Props): ReactElement => {
  const treeContext = useTreeContext<T>();
  const ref = useRef<HTMLElement>(null);
  const [isOver, dragSource, drop] = useDropRoot<T>(ref);
  const className = useContainerClassName(props.parentId, isOver);
  const rootProps = treeContext.rootProps || {};
  const Component = treeContext.listComponent;

  // 최상위 컨테이너인지 확인
  const isRootContainer = props.parentId === treeContext.rootId;

  // 모든 보이는 노드를 flat하게 수집 (열린 노드의 하위 트리 포함)
  const visibleNodes = useMemo(() => {
    const result: { node: NodeModel; depth: number }[] = [];

    const collectNodes = (parentId: string, depth: number) => {
      const nodes = treeContext.tree.filter((n) => n.parent === parentId);
      nodes.forEach((node) => {
        result.push({ node, depth });
        if (node.droppable && treeContext.openIds.includes(node.id)) {
          collectNodes(node.id, depth + 1);
        }
      });
    };

    collectNodes(props.parentId, props.depth);
    return result;
  }, [props.parentId, props.depth, treeContext.tree, treeContext.openIds]);

  // 가상화는 최상위 컨테이너에서만 적용
  const shouldUseVirtual = useMemo(() => {
    return (
      isRootContainer &&
      treeContext.virtualizeOptions?.enabled &&
      visibleNodes.length >= (treeContext.virtualizeOptions?.threshold || 50)
    );
  }, [
    isRootContainer,
    treeContext.virtualizeOptions?.enabled,
    treeContext.virtualizeOptions?.threshold,
    visibleNodes.length,
  ]);

  // 내부 컨테이너는 아무것도 렌더링하지 않음
  if (!isRootContainer) {
    return null;
  }

  // 가상화가 필요한 경우
  if (shouldUseVirtual) {
    const virtualizer = useVirtualizer({
      count: visibleNodes.length,
      getScrollElement: () => ref.current,
      estimateSize: useCallback(
        () => treeContext.virtualizeOptions?.itemHeight || 32,
        [treeContext.virtualizeOptions?.itemHeight]
      ),
      overscan: treeContext.virtualizeOptions?.overscan || 5,
      getItemKey: useCallback(
        (index: number) => visibleNodes[index].node.id,
        [visibleNodes]
      ),
    });

    return (
      <Component
        ref={ref}
        role="list"
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
            const { node, depth } = visibleNodes[virtualRow.index];

            return (
              <div
                key={node.id}
                style={{
                  position: "absolute",
                  top: `${virtualRow.start}px`,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  paddingLeft: `${depth * 24}px`,
                }}
              >
                <Node id={node.id} depth={depth} />
              </div>
            );
          })}
        </div>
      </Component>
    );
  }

  // 가상화가 필요없는 경우
  return (
    <Component ref={ref} role="list" {...rootProps} className={className}>
      {visibleNodes.map(({ node, depth }, index) => (
        <React.Fragment key={node.id}>
          <Placeholder
            depth={depth}
            listCount={visibleNodes.length}
            dropTargetId={node.parent || ""}
            index={index}
          />
          <Node id={node.id} depth={depth} />
        </React.Fragment>
      ))}
      <Placeholder
        depth={props.depth}
        listCount={visibleNodes.length}
        dropTargetId={props.parentId}
      />
    </Component>
  );
};

// export const Container = <T,>(props: Props): ReactElement => {
//   const treeContext = useTreeContext<T>();
//   const ref = useRef<HTMLElement>(null);
//   const [isOver, dragSource, drop] = useDropRoot<T>(ref);
//   const className = useContainerClassName(props.parentId, isOver);
//   const rootProps = treeContext.rootProps || {};
//   const Component = treeContext.listComponent;

//   // 일반적인 노드 필터링 (기존 로직)
//   const nodes = treeContext.tree.filter((l) => l.parent === props.parentId);
//   let view = nodes;

//   const sortCallback =
//     typeof treeContext.sort === "function" ? treeContext.sort : compareItems;

//   if (treeContext.insertDroppableFirst) {
//     let droppableNodes = nodes.filter((n) => n.droppable);
//     let nonDroppableNodes = nodes.filter((n) => !n.droppable);

//     if (treeContext.sort === false) {
//       view = [...droppableNodes, ...nonDroppableNodes];
//     } else {
//       droppableNodes = droppableNodes.sort(sortCallback);
//       nonDroppableNodes = nonDroppableNodes.sort(sortCallback);
//       view = [...droppableNodes, ...nonDroppableNodes];
//     }
//   } else {
//     if (treeContext.sort !== false) {
//       view = nodes.sort(sortCallback);
//     }
//   }

//   // 가상화 사용 여부 확인
//   const shouldUseVirtual = useMemo(() => {
//     return (
//       props.parentId === treeContext.rootId && // 최상위에서만 가상화
//       treeContext.virtualizeOptions?.enabled &&
//       treeContext.tree.length >=
//         (treeContext.virtualizeOptions?.threshold || 50)
//     );
//   }, [
//     props.parentId,
//     treeContext.rootId,
//     treeContext.virtualizeOptions,
//     treeContext.tree.length,
//   ]);

//   // 가상화가 필요한 경우에만 hook 사용
//   const virtualTree = shouldUseVirtual
//     ? useVirtualTree({
//         tree: treeContext.tree,
//         openIds: treeContext.openIds,
//         virtualizeOptions: treeContext.virtualizeOptions,
//         scrollRef: ref,
//       })
//     : null;

//   // 드래그 앤 드롭 설정
//   if (
//     props.parentId === treeContext.rootId &&
//     isDroppable<T>(dragSource, treeContext.rootId, treeContext)
//   ) {
//     drop(ref);
//   }

//   // 가상화 렌더링
//   if (shouldUseVirtual && virtualTree) {
//     return (
//       <Component
//         ref={ref}
//         role="list"
//         {...rootProps}
//         className={className}
//         style={{
//           height: treeContext.virtualizeOptions?.containerHeight || "600px",
//           overflow: "auto",
//           ...rootProps?.style,
//         }}
//       >
//         <div
//           style={{
//             height: `${virtualTree.virtualizer.getTotalSize()}px`,
//             width: "100%",
//             position: "relative",
//           }}
//         >
//           {virtualTree.virtualizer.getVirtualItems().map((virtualRow) => {
//             const { node, depth } = virtualTree.visibleNodes[virtualRow.index];

//             return (
//               <div
//                 key={node.id}
//                 style={{
//                   position: "absolute",
//                   top: `${virtualRow.start}px`,
//                   left: 0,
//                   width: "100%",
//                   height: `${virtualRow.size}px`,
//                   paddingLeft: `${depth * 24}px`,
//                 }}
//               >
//                 <Node id={node.id} depth={depth} />
//               </div>
//             );
//           })}
//         </div>
//       </Component>
//     );
//   }

//   // 일반 렌더링 (기존 로직)
//   return (
//     <Component ref={ref} role="list" {...rootProps} className={className}>
//       {view.map((node, index) => (
//         <React.Fragment key={node.id}>
//           <Placeholder
//             depth={props.depth}
//             listCount={view.length}
//             dropTargetId={props.parentId}
//             index={index}
//           />
//           <Node id={node.id} depth={props.depth} />
//         </React.Fragment>
//       ))}
//       <Placeholder
//         depth={props.depth}
//         listCount={view.length}
//         dropTargetId={props.parentId}
//       />
//     </Component>
//   );
// };
