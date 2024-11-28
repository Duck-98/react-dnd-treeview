import React, {
  useImperativeHandle,
  PropsWithChildren,
  ReactElement,
  createContext,
  useMemo,
  useEffect,
} from "react";
import { useDragDropManager } from "react-dnd";
import {
  mutateTree,
  mutateTreeWithIndex,
  getTreeItem,
  getDestIndex,
  getModifiedIndex,
} from "~/utils";
import { useOpenIdsHelper } from "~/hooks";
import {
  TreeState,
  TreeProps,
  TreeMethods,
  DropOptions,
  NodeModel,
} from "~/types";

type Props<T> = PropsWithChildren<
  TreeProps<T> & {
    treeRef: React.ForwardedRef<TreeMethods>;
  }
>;

export const TreeContext = createContext({});

export const TreeProvider = <T,>(props: Props<T>): ReactElement => {
  const [
    openIds,
    { handleToggle, handleCloseAll, handleOpenAll, handleOpen, handleClose },
  ] = useOpenIdsHelper(props.tree, props.initialOpen);

  /* search logic */
  const { filteredTree, searchPaths, searchResults } = useMemo(() => {
    if (!props.searchTerm) {
      return {
        filteredTree: props.tree,
        searchPaths: [],
        searchResults: [],
      };
    }

    const searchTerm = props.searchTerm.toLowerCase();
    const matches = props.tree.filter((node) =>
      node.text.toLowerCase().includes(searchTerm)
    );

    const paths = new Set<NodeModel["id"]>();
    matches.forEach((node) => {
      let current = node;
      while (current) {
        paths.add(current.id);
        const parent = props.tree.find((n) => n.id === current.parent);
        if (!parent) break;
        current = parent;
      }
    });

    const filtered = props.tree.filter((node) => paths.has(node.id));

    return {
      filteredTree: filtered,
      searchPaths: Array.from(paths),
      searchResults: matches,
    };
  }, [props.tree, props.searchTerm]);

  useEffect(() => {
    props.onSearchResultsChange?.(searchResults);
  }, [searchResults, props.onSearchResultsChange]);

  useEffect(() => {
    if (props.searchTerm && searchPaths.length > 0) {
      handleOpen(searchPaths, props.onChangeOpen);
    }
  }, [props.searchTerm, searchPaths]);

  useImperativeHandle(props.treeRef, () => ({
    open: (targetIds) => handleOpen(targetIds, props.onChangeOpen),
    close: (targetIds) => handleClose(targetIds, props.onChangeOpen),
    openAll: () => handleOpenAll(props.onChangeOpen),
    closeAll: () => handleCloseAll(props.onChangeOpen),
  }));

  const monitor = useDragDropManager().getMonitor();
  const canDropCallback = props.canDrop;
  const canDragCallback = props.canDrag;

  const value: TreeState<T> = {
    extraAcceptTypes: [],
    listComponent: "ul",
    listItemComponent: "li",
    placeholderComponent: "li",
    sort: true,
    insertDroppableFirst: true,
    enableAnimateExpand: false,
    dropTargetOffset: 0,
    initialOpen: false,
    // vi
    virtualizeOptions: {
      enabled: false,
      threshold: 50,
      itemHeight: 32,
      overscan: 5,
      containerHeight: "600px",
      ...props.virtualizeOptions,
    },
    ...props,
    tree: props.searchTerm ? filteredTree : props.tree,
    openIds,
    searchResults,
    onDrop: (dragSource, dropTargetId, placeholderIndex) => {
      if (!dragSource) {
        const options: DropOptions<T> = {
          dropTargetId,
          dropTarget: getTreeItem<T>(props.tree, dropTargetId),
          monitor,
        };

        if (props.sort === false) {
          options.destinationIndex = getDestIndex(
            props.tree,
            dropTargetId,
            placeholderIndex
          );
          options.relativeIndex = placeholderIndex;
        }

        props.onDrop(props.tree, options);
      } else {
        const options: DropOptions<T> = {
          dragSourceId: dragSource.id,
          dropTargetId,
          dragSource: dragSource,
          dropTarget: getTreeItem<T>(props.tree, dropTargetId),
          monitor,
        };

        let tree = props.tree;

        if (!getTreeItem(tree, dragSource.id)) {
          tree = [...tree, dragSource];
        }

        if (props.sort === false) {
          const [, destIndex] = getModifiedIndex(
            tree,
            dragSource.id,
            dropTargetId,
            placeholderIndex
          );
          options.destinationIndex = destIndex;
          options.relativeIndex = placeholderIndex;
          props.onDrop(
            mutateTreeWithIndex<T>(
              tree,
              dragSource.id,
              dropTargetId,
              placeholderIndex
            ),
            options
          );
          return;
        }

        props.onDrop(mutateTree<T>(tree, dragSource.id, dropTargetId), options);
      }
    },
    canDrop: canDropCallback
      ? (dragSourceId, dropTargetId) =>
          canDropCallback(props.tree, {
            dragSourceId: dragSourceId ?? undefined,
            dropTargetId,
            dragSource: monitor.getItem(),
            dropTarget: getTreeItem(props.tree, dropTargetId),
            monitor,
          })
      : undefined,
    canDrag: canDragCallback
      ? (id) => canDragCallback(getTreeItem(props.tree, id))
      : undefined,
    onToggle: (id) => handleToggle(id, props.onChangeOpen),
  };

  return (
    <TreeContext.Provider value={value}>{props.children}</TreeContext.Provider>
  );
};
