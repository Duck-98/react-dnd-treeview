import { NodeModel, SortCallback, TreeState } from "~/types";
import { compareItems } from "./compareItems";

export const sortNodes = <T>(
  nodes: NodeModel<T>[],
  treeContext: Pick<TreeState<T>, "sort" | "insertDroppableFirst">
) => {
  const sortCallback: SortCallback<T> =
    typeof treeContext.sort === "function" ? treeContext.sort : compareItems;

  if (treeContext.insertDroppableFirst) {
    const droppableNodes = nodes.filter((n) => n.droppable);
    const nonDroppableNodes = nodes.filter((n) => !n.droppable);

    if (treeContext.sort === false) {
      return [...droppableNodes, ...nonDroppableNodes];
    }

    return [
      ...droppableNodes.sort(sortCallback),
      ...nonDroppableNodes.sort(sortCallback),
    ];
  }

  return treeContext.sort !== false ? nodes.sort(sortCallback) : nodes;
};
