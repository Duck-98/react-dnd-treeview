import React, { useState } from "react";
import { Story, Meta } from "@storybook/react";
import { DndProvider, MultiBackend, getBackendOptions } from "~/index";
import { Tree } from "~/Tree";
import { TreeProps } from "~/types";
import { useTreeSearch } from "~/hooks/useTreeSearch";
import { CustomNode } from "~/stories/examples/components/CustomNode";
import { CustomDragPreview } from "~/stories/examples/components/CustomDragPreview";
import styles from "./SearchTreeNode.module.css";
import { generateSearchableTreeData } from "./generateSearchableTreeData";

export default {
  component: Tree,
  title: "Advanced Examples/Searchable Tree",
  parameters: {
    docs: {
      description: {
        component: `
          Demonstrates different search capabilities in a tree structure:
          - Basic search
          - Virtualized search for large datasets
          - Advanced search with custom logic
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

const Template: Story<TreeProps<any>> = (args) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search files or folders..."
          className={styles.searchInput}
        />
      </div>
      <div className={styles.treeContainer}>
        <Tree
          {...args}
          searchTerm={searchTerm}
          classes={{
            root: styles.treeRoot,
            container: styles.treeInner,
            listItem: styles.treeItem,
            draggingSource: styles.draggingSource,
            dropTarget: styles.dropTarget,
          }}
        />
      </div>
    </div>
  );
};

export const Basic = Template.bind({});
Basic.args = {
  tree: generateSearchableTreeData(100),
  rootId: "root",
  render: (node, options) => <CustomNode node={node} {...options} />,
  dragPreviewRender: (monitorProps) => (
    <CustomDragPreview monitorProps={monitorProps} />
  ),
};
Basic.parameters = {
  docs: {
    description: {
      story: "Basic search functionality with default search behavior.",
    },
  },
};

export const Virtualized = Template.bind({});
Virtualized.args = {
  ...Basic.args,
  tree: generateSearchableTreeData(10000),
  virtualizeOptions: {
    enabled: true,
    threshold: 10, // 100개 이상일 때 가상 스크롤 적용
    itemHeight: 32, // 각 아이템 높이
    overscan: 5, // 오버스캔 개수
    containerHeight: "100px",
  },
};
Virtualized.parameters = {
  docs: {
    description: {
      story: "Search functionality with virtualization for large datasets.",
    },
  },
};

const CustomSearchTemplate: Story<TreeProps<any>> = (args) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOptions, setSearchOptions] = useState({
    includeParents: true,
    includeChildren: false,
    minSearchLength: 2,
  });

  const searchResults = useTreeSearch(args.tree, searchTerm, {
    searchFn: (term, node, helpers) => {
      if (node.droppable) {
        // Exact match for folders
        return node.text.toLowerCase() === term.toLowerCase();
      } else {
        // File name or extension match
        const extension = node.text.split(".").pop()?.toLowerCase() || "";
        return (
          node.text.toLowerCase().includes(term.toLowerCase()) ||
          extension === term.toLowerCase()
        );
      }
    },
    ...searchOptions,
  });

  return (
    <div className={styles.container}>
      <div className={styles.searchContainer}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by filename or extension (e.g., .jpg, .docx)"
          className={styles.searchInput}
        />
        <div className={styles.searchOptions}>
          <label>
            <input
              type="checkbox"
              checked={searchOptions.includeParents}
              onChange={(e) =>
                setSearchOptions((prev) => ({
                  ...prev,
                  includeParents: e.target.checked,
                }))
              }
            />
            Include parent folders
          </label>
          <label>
            <input
              type="checkbox"
              checked={searchOptions.includeChildren}
              onChange={(e) =>
                setSearchOptions((prev) => ({
                  ...prev,
                  includeChildren: e.target.checked,
                }))
              }
            />
            Include child items
          </label>
        </div>
        {searchResults.totalMatches > 0 && (
          <div className={styles.searchStats}>
            Found: {searchResults.totalMatches} items
            {searchResults.hasMore && " (max results exceeded)"}
          </div>
        )}
      </div>
      <div className={styles.treeContainer}>
        <Tree
          {...args}
          tree={searchResults.filteredTree}
          initialOpen={searchResults.openIds}
          classes={{
            root: styles.treeRoot,
            container: styles.treeInner,
            listItem: styles.treeItem,
            draggingSource: styles.draggingSource,
            dropTarget: styles.dropTarget,
          }}
        />
      </div>
    </div>
  );
};

export const Advanced = CustomSearchTemplate.bind({});
Advanced.args = {
  tree: generateSearchableTreeData(1000),
  rootId: "root",
  render: (node, options) => <CustomNode node={node} {...options} />,
  dragPreviewRender: (monitorProps) => (
    <CustomDragPreview monitorProps={monitorProps} />
  ),
  virtualizeOptions: {
    enabled: true, // 가상 스크롤 활성화
    threshold: 10, // 100개 이상일 때 가상 스크롤 적용
    itemHeight: 32, // 각 아이템 높이
    overscan: 5, // 오버스캔 개수
    containerHeight: "500px",
  },
};
Advanced.parameters = {
  docs: {
    description: {
      story: `
        Advanced search example demonstrating:
        - Custom search logic with file extension support
        - Parent/child inclusion options
        - Search result statistics
        - Virtualization for performance
      `,
    },
  },
};
