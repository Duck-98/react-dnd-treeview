import { useMemo } from "react";
import {
  NodeModel,
  SearchFunction,
  TreeSearchOptions,
  SearchHelpers,
} from "../types";

const defaultSearchFn = <T>(
  searchTerm: string,
  node: NodeModel<T>,
  _helpers: SearchHelpers<T>
): boolean => {
  return node.text.toLowerCase().includes(searchTerm.toLowerCase());
};

export function useTreeSearch<T>(
  tree: NodeModel<T>[],
  searchTerm: string,
  options?: TreeSearchOptions<T>
) {
  // 검색 인덱스 생성
  const searchIndex = useMemo(() => {
    const nodeMap = new Map(tree.map((node) => [node.id, node]));
    const parentMap = new Map(tree.map((node) => [node.id, node.parent]));
    const childrenMap = new Map<NodeModel["id"], NodeModel["id"][]>();

    tree.forEach((node) => {
      if (node.parent) {
        const siblings = childrenMap.get(node.parent) || [];
        siblings.push(node.id);
        childrenMap.set(node.parent, siblings);
      }
    });

    return { nodeMap, parentMap, childrenMap };
  }, [tree]);

  // 검색 도우미 함수들
  const searchHelpers = useMemo<SearchHelpers<T>>(
    () => ({
      getNode: (id) => searchIndex.nodeMap.get(id),
      getParent: (id) => {
        const parentId = searchIndex.parentMap.get(id);
        return parentId ? searchIndex.nodeMap.get(parentId) : undefined;
      },
      getChildren: (id) => {
        const childrenIds = searchIndex.childrenMap.get(id) || [];
        return childrenIds
          .map((childId) => searchIndex.nodeMap.get(childId))
          .filter((node): node is NodeModel<T> => node !== undefined);
      },
      getAllParents: (id) => {
        const parents: NodeModel<T>[] = [];
        let currentId = searchIndex.parentMap.get(id);
        while (currentId) {
          const parent = searchIndex.nodeMap.get(currentId);
          if (parent) parents.push(parent);
          currentId = searchIndex.parentMap.get(currentId);
        }
        return parents;
      },
      getAllChildren: (id) => {
        const children: NodeModel<T>[] = [];
        const traverse = (nodeId: NodeModel["id"]) => {
          const childrenIds = searchIndex.childrenMap.get(nodeId) || [];
          childrenIds.forEach((childId) => {
            const child = searchIndex.nodeMap.get(childId);
            if (child) {
              children.push(child);
              traverse(childId);
            }
          });
        };
        traverse(id);
        return children;
      },
    }),
    [searchIndex]
  );

  return useMemo(() => {
    const {
      searchFn = defaultSearchFn as SearchFunction<T>,
      includeParents = true,
      includeChildren = false,
      minSearchLength = 2,
      maxResults = 1000,
    } = options || {};

    if (!searchTerm || searchTerm.length < minSearchLength) {
      return {
        matches: [],
        openIds: [],
        filteredTree: tree,
        totalMatches: 0,
        hasMore: false,
      };
    }

    const resultIds = new Set<NodeModel["id"]>();
    const matches: NodeModel<T>[] = [];

    // 검색 실행
    for (const node of tree) {
      if (matches.length >= maxResults) break;

      if (searchFn(searchTerm, node, searchHelpers)) {
        matches.push(node);
        resultIds.add(node.id);

        if (includeParents) {
          searchHelpers.getAllParents(node.id).forEach((parent) => {
            resultIds.add(parent.id);
          });
        }

        if (includeChildren) {
          searchHelpers.getAllChildren(node.id).forEach((child) => {
            resultIds.add(child.id);
          });
        }
      }
    }

    const filteredTree = Array.from(resultIds)
      .map((id) => searchIndex.nodeMap.get(id))
      .filter((node): node is NodeModel<T> => node !== undefined);

    return {
      matches,
      openIds: Array.from(resultIds),
      filteredTree,
      totalMatches: matches.length,
      hasMore: matches.length >= maxResults,
    };
  }, [tree, searchTerm, options, searchHelpers]);
}
