import type { RefObject, ElementType, ReactElement } from "react";
import type { XYCoord, DragSourceMonitor } from "react-dnd";
import type { DragDropMonitor } from "dnd-core";
import React from "react";

export type NodeModel<T = unknown> = {
  id: number | string;
  parent: number | string;
  text: string;
  droppable?: boolean;
  data?: T;
};

export type DragItem<T> = NodeModel<T> & {
  ref: RefObject<HTMLElement>;
};

export type NativeDragItem = {
  dataTransfer: DataTransfer;
};

export type RenderParams = {
  depth: number;
  isOpen: boolean;
  isDragging: boolean;
  isDropTarget: boolean;
  draggable: boolean;
  hasChild: boolean;
  containerRef: RefObject<HTMLElement>;
  handleRef: RefObject<any>;
  onToggle(): void;
};

export type NodeRender<T> = (
  node: NodeModel<T>,
  params: RenderParams
) => ReactElement;

export type ClickHandler = (data: NodeModel) => void;

export type DropHandler<T> = (
  dragSource: NodeModel<T> | null,
  dropTargetId: NodeModel["id"],
  index: number
) => void;

export type CanDropHandler = (
  dragSourceId: NodeModel["id"] | null,
  dropTargetId: NodeModel["id"]
) => boolean | void;

export type CanDragHandler = (id: NodeModel["id"]) => boolean;

export type Classes<T = unknown> = {
  root?: string;
  container?: string;
  listItem?: string | ((node: NodeModel<T>, params: RenderParams) => string);
  dropTarget?: string;
  draggingSource?: string;
  placeholder?: string;
};

export type SortCallback<T = unknown> = (
  a: NodeModel<T>,
  b: NodeModel<T>
) => number;

export type DragLayerMonitorProps<T> = {
  item: DragItem<T>;
  clientOffset: XYCoord | null;
  isDragging: boolean;
};

export type DragPreviewRender<T> = (
  monitorProps: DragLayerMonitorProps<T>
) => ReactElement;

export type PlaceholderRenderParams = {
  depth: number;
};

export type PlaceholderRender<T> = (
  node: NodeModel<T>,
  params: PlaceholderRenderParams
) => ReactElement;

export type DragOverProps = {
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
};

export type OpenHandler = (
  targetIds: NodeModel["id"] | NodeModel["id"][],
  callback?: ChangeOpenHandler
) => void;

export type CloseHandler = (
  targetIds: NodeModel["id"] | NodeModel["id"][],
  callback?: ChangeOpenHandler
) => void;

export type ToggleHandler = (
  id: NodeModel["id"],
  callback?: ChangeOpenHandler
) => void;

export type ChangeOpenHandler = (newOpenIds: NodeModel["id"][]) => void;

export type InitialOpen = boolean | NodeModel["id"][];

export type DragSourceElement = EventTarget | null;

export type DragControlState = {
  isLock: boolean;
  lock: () => void;
  unlock: () => void;
};

export type PlaceholderState = {
  dropTargetId: NodeModel["id"] | undefined;
  index: number | undefined;
  showPlaceholder: (parentId: NodeModel["id"], index: number) => void;
  hidePlaceholder: () => void;
};

export type RootProps = Omit<
  React.HtmlHTMLAttributes<HTMLElement>,
  "ref" | "role"
>;

export type TreeStateBase<T> = {
  tree: NodeModel<T>[];
  rootId: NodeModel["id"];
  classes?: Classes<T>;
  rootProps?: RootProps;
  render: NodeRender<T>;
  dragPreviewRender?: DragPreviewRender<T>;
  placeholderRender?: PlaceholderRender<T>;
  onDragStart?: (node: NodeModel<T>, monitor: DragSourceMonitor) => void;
  onDragEnd?: (node: NodeModel<T>, monitor: DragSourceMonitor) => void;
};

export type TreeState<T> = TreeStateBase<T> & {
  extraAcceptTypes: string[];
  listComponent: ElementType;
  listItemComponent: ElementType;
  placeholderComponent: ElementType;
  sort: SortCallback<T> | boolean;
  insertDroppableFirst: boolean;
  enableAnimateExpand: boolean;
  dropTargetOffset: number;
  initialOpen: InitialOpen;
  openIds: NodeModel["id"][];
  virtualizeOptions?: VirtualizeOptions;
  searchTerm?: string;
  searchResults?: NodeModel<T>[];
  onDrop: DropHandler<T>;
  canDrop?: CanDropHandler;
  canDrag?: CanDragHandler;
  onToggle: ToggleHandler;
};

export type DropOptions<T = unknown> = {
  dragSourceId?: NodeModel["id"];
  dropTargetId: NodeModel["id"];
  dragSource?: NodeModel<T>;
  dropTarget?: NodeModel<T>;
  destinationIndex?: number;
  relativeIndex?: number;
  monitor: DragDropMonitor;
};

export type TreeProps<T = unknown> = TreeStateBase<T> & {
  extraAcceptTypes?: string[];
  listComponent?: ElementType;
  listItemComponent?: ElementType;
  placeholderComponent?: ElementType;
  sort?: SortCallback<T> | boolean;
  insertDroppableFirst?: boolean;
  enableAnimateExpand?: boolean;
  dropTargetOffset?: number;
  initialOpen?: InitialOpen;
  onChangeOpen?: ChangeOpenHandler;
  virtualizeOptions?: VirtualizeOptions;
  searchTerm?: string;
  onSearchResultsChange?: (results: NodeModel<T>[]) => void;
  onDrop: (tree: NodeModel<T>[], options: DropOptions<T>) => void;
  canDrop?: (tree: NodeModel<T>[], options: DropOptions<T>) => boolean | void;
  canDrag?: (node: NodeModel<T> | undefined) => boolean;
};

export type TreeMethods = {
  open: OpenHandler;
  close: CloseHandler;
  openAll(): void;
  closeAll(): void;
};

export type SearchHelpers<T> = {
  getNode: (id: NodeModel["id"]) => NodeModel<T> | undefined;
  getParent: (id: NodeModel["id"]) => NodeModel<T> | undefined;
  getChildren: (id: NodeModel["id"]) => NodeModel<T>[];
  getAllParents: (id: NodeModel["id"]) => NodeModel<T>[];
  getAllChildren: (id: NodeModel["id"]) => NodeModel<T>[];
};

export type SearchFunction<T> = (
  searchTerm: string,
  node: NodeModel<T>,
  helpers: SearchHelpers<T>
) => boolean;

export type TreeSearchOptions<T> = {
  searchFn?: SearchFunction<T>;
  includeParents?: boolean;
  includeChildren?: boolean;
  minSearchLength?: number;
  maxResults?: number;
};

export interface VirtualizeOptions {
  enabled: boolean;
  threshold?: number;
  itemHeight?: number;
  overscan?: number;
  containerHeight?: number | string;
}
