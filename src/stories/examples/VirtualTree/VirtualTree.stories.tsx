import React from "react";
import { Story, Meta } from "@storybook/react";
import { DndProvider, MultiBackend, getBackendOptions } from "~/index";
import { Tree } from "~/Tree";
import { DragLayerMonitorProps, NodeModel, TreeProps } from "~/types";
import { CustomNode } from "~/stories/examples/components/CustomNode";
import { CustomDragPreview } from "~/stories/examples/components/CustomDragPreview";
import styles from "./VirtualTree.module.css";

import largeTreeData from "~/stories/assets/large-sample-data.json";
import sampleData from "~/stories/assets/sample-data.json";
import * as argTypes from "~/stories/argTypes";
import { FileProperties } from "~/stories/types";
import { interactionsDisabled } from "../interactionsDisabled";
import { within, fireEvent } from "@storybook/testing-library";
import { wait, getPointerCoords, dragEnterAndDragOver } from "../helpers";
import { expect } from "@storybook/jest";
import { DefaultTemplate } from "~/stories/examples/DefaultTemplate";
import { Placeholder } from "~/stories/examples/components/Placeholder";

export default {
  component: Tree,
  title: "Advanced Examples/Virtual Tree",
  argTypes,
  parameters: {
    docs: {
      description: {
        component: `
          A tree component with virtualization support for handling large datasets efficiently.
          Demonstrates different virtualization scenarios and performance optimizations.
        `,
      },
    },
  },
  decorators: [
    (Story) => (
      <DndProvider backend={MultiBackend} options={getBackendOptions()}>
        <Story />
      </DndProvider>
    ),
  ],
} as Meta;

export const StandardTree = DefaultTemplate.bind({});

StandardTree.args = {
  rootId: 0,
  tree: sampleData,
  classes: {
    root: styles.treeRoot,
    draggingSource: styles.draggingSource,
    dropTarget: styles.dropTarget,
    placeholder: styles.placeholderContainer,
  },
  render: function render(node, options) {
    return <CustomNode node={node} {...options} />;
  },
  dragPreviewRender: (monitorProps: DragLayerMonitorProps<FileProperties>) => (
    <CustomDragPreview monitorProps={monitorProps} />
  ),
  sort: false,
  insertDroppableFirst: false,
  canDrop: (tree, { dragSource, dropTargetId }) => {
    if (dragSource?.parent === dropTargetId) {
      return true;
    }
  },
  dropTargetOffset: 10,
  placeholderRender: (node, { depth }) => (
    <Placeholder node={node} depth={depth} />
  ),
};

StandardTree.parameters = {
  docs: {
    description: {
      story:
        "Standard tree without virtualization, suitable for small to medium-sized datasets.",
    },
  },
};

export const VirtualizedTree = DefaultTemplate.bind({});
VirtualizedTree.args = {
  ...StandardTree.args,
  tree: sampleData,
  classes: {
    ...StandardTree.args.classes, // 기존 classes 설정을 모두 상속
  },
  virtualizeOptions: {
    enabled: true, // 가상 스크롤 활성화
    threshold: 10, // 100개 이상일 때 가상 스크롤 적용
    itemHeight: 32, // 각 아이템 높이
    overscan: 5, // 오버스캔 개수
    containerHeight: "200px",
  },

  render: function render(node, options) {
    return <CustomNode node={node} {...options} />;
  },
  dragPreviewRender: (monitorProps: DragLayerMonitorProps<FileProperties>) => (
    <CustomDragPreview monitorProps={monitorProps} />
  ),
  sort: false,
  insertDroppableFirst: false,
  canDrop: (tree, { dragSource, dropTargetId }) => {
    if (dragSource?.parent === dropTargetId) {
      return true;
    }
  },
  dropTargetOffset: 10,
  placeholderRender: (node, { depth }) => (
    <Placeholder node={node} depth={depth} />
  ),
};

VirtualizedTree.parameters = {
  docs: {
    description: {
      story:
        "Virtualized tree for handling large datasets efficiently. Demonstrates smooth scrolling and performance optimization.",
    },
  },
};

if (!interactionsDisabled) {
  StandardTree.play = async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // 드래그 앤 드롭 테스트
    const dragSource = canvas.getByText("File 3"); // 실제 노드 텍스트로 변경
    const dropTarget = canvas.getByTestId("custom-node-1"); // 실제 테스트 ID로 변경

    await wait();
    fireEvent.dragStart(dragSource);

    const coords = getPointerCoords(dropTarget);
    await dragEnterAndDragOver(dropTarget, coords);

    // 테스트 검증
    expect(
      await canvas.findByTestId("custom-drag-preview")
    ).toBeInTheDocument();
  };
}
