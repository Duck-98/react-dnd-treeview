import React from "react";
import { Story, Meta } from "@storybook/react";
import { DndProvider, MultiBackend, getBackendOptions } from "~/index";
import { Tree } from "~/Tree";
import { NodeModel, TreeProps } from "~/types";
import { CustomNode } from "~/stories/examples/components/CustomNode";
import { CustomDragPreview } from "~/stories/examples/components/CustomDragPreview";
import styles from "./VirtualTree.module.css";
import mediumTreeData from "~/stories/assets/sample-data.json";
import largeTreeData from "~/stories/assets/large-sample-data.json";
import hugeTreeData from "~/stories/assets/huge-sample-data.json";

export default {
  component: Tree,
  title: "Advanced Examples/Virtual Tree",
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

const Template: Story<TreeProps<any>> = (args) => (
  <div className={styles.container}>
    <div className={styles.treeContainer}>
      <Tree {...args} />
    </div>
  </div>
);

export const StandardTree = Template.bind({});

StandardTree.args = {
  tree: largeTreeData,
  rootId: "root",
  render: (node, options) => <CustomNode node={node} {...options} />,
  dragPreviewRender: (monitorProps) => (
    <CustomDragPreview monitorProps={monitorProps} />
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

export const VirtualizedTree = Template.bind({});
VirtualizedTree.args = {
  ...StandardTree.args,
  tree: largeTreeData,
  virtualizeOptions: {
    enabled: true, // 가상 스크롤 활성화
    threshold: 10, // 100개 이상일 때 가상 스크롤 적용
    itemHeight: 32, // 각 아이템 높이
    overscanCount: 5, // 오버스캔 개수
    containerHeight: "500px",
  },
};

VirtualizedTree.parameters = {
  docs: {
    description: {
      story:
        "Virtualized tree for handling large datasets efficiently. Demonstrates smooth scrolling and performance optimization.",
    },
  },
};

// export const HugeTree = Template.bind({});
// HugeTree.args = {
//   ...StandardTree.args,
//   tree: mediumTreeData,
//   virtualizeOptions: {
//     enabled: true,
//     threshold: 50,
//     height: 600,
//     itemSize: 35,
//     autoSize: true,
//   },
// };
// HugeTree.parameters = {
//   docs: {
//     description: {
//       story:
//         "Extreme case with 10,000+ nodes to demonstrate virtualization performance with very large datasets.",
//     },
//   },
// };
