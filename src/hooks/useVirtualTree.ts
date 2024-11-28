import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef, useCallback } from "react";
import { useTreeContext } from "./useTreeContext";
import { NodeModel } from "~/types";
import { sortNodes } from "~/utils/sortNodes";

export const useVirtualTree = (parentId: string | number, depth: number) => {
  const ref = useRef<HTMLElement>(null);
  const treeContext = useTreeContext();

  // 가상화 전체 활성화 여부 체크
  const isVirtualizationEnabled = useMemo(() => {
    return (
      treeContext.virtualizeOptions?.enabled &&
      treeContext.tree.length >=
        (treeContext.virtualizeOptions?.threshold || 50)
    );
  }, [
    treeContext.virtualizeOptions?.enabled,
    treeContext.virtualizeOptions?.threshold,
    treeContext.tree.length,
  ]);

  // 현재 컨테이너가 가상화를 사용해야 하는지 체크
  const shouldUseVirtual = useMemo(() => {
    // 가상화가 비활성화되어 있으면 false
    if (!isVirtualizationEnabled) return false;

    // 루트 컨테이너이거나 열린 상태의 droppable 노드의 자식인 경우
    if (parentId === treeContext.rootId) return true;

    // 부모 노드가 존재하고 열려있는지 확인
    const parentNode = treeContext.tree.find((node) => node.id === parentId);
    return !!(
      parentNode?.droppable && treeContext.openIds.includes(parentNode.id)
    );
  }, [
    isVirtualizationEnabled,
    parentId,
    treeContext.rootId,
    treeContext.tree,
    treeContext.openIds,
  ]);

  const visibleNodes = useMemo(() => {
    // 가상화가 완전히 비활성화된 경우 빈 배열 반환
    if (!isVirtualizationEnabled) return [];

    const result: { node: NodeModel; depth: number }[] = [];
    const processedIds = new Set<string | number>();

    const collectNodes = (
      currentParentId: string | number,
      currentDepth: number
    ) => {
      const nodes = treeContext.tree.filter(
        (n) => n.parent === currentParentId
      );
      const sortedNodes = sortNodes(nodes, treeContext);

      sortedNodes.forEach((node) => {
        if (!processedIds.has(node.id)) {
          result.push({ node, depth: currentDepth });
          processedIds.add(node.id);

          if (node.droppable && treeContext.openIds.includes(node.id)) {
            collectNodes(node.id, currentDepth + 1);
          }
        }
      });
    };

    // 루트 컨테이너에서만 전체 트리 수집
    if (parentId === treeContext.rootId) {
      collectNodes(parentId, depth);
    }

    return result;
  }, [
    isVirtualizationEnabled,
    parentId,
    depth,
    treeContext.rootId,
    treeContext.tree,
    treeContext.openIds,
    treeContext.sort,
    treeContext.insertDroppableFirst,
  ]);

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
    enabled: shouldUseVirtual,
  });

  return {
    ref,
    shouldUseVirtual,
    visibleNodes,
    virtualizer,
  };
};
