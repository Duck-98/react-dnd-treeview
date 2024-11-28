import { sortNodes } from "./sortNodes";
import { compareItems } from "./compareItems";
import { NodeModel } from "~/types";

describe("sortNodes", () => {
  // Mock nodes for testing
  const mockNodes: NodeModel[] = [
    { id: 1, parent: 0, droppable: true, text: "B Folder" },
    { id: 2, parent: 0, droppable: false, text: "A File" },
    { id: 3, parent: 0, droppable: true, text: "A Folder" },
    { id: 4, parent: 0, droppable: false, text: "C File" },
  ];

  // Example custom sort function
  const customSortCallback = (a: NodeModel, b: NodeModel): number => {
    return (a.id as number) - (b.id as number);
  };

  describe("Basic sorting (insertDroppableFirst: false)", () => {
    const treeContext = { sort: true, insertDroppableFirst: false };

    it("should sort using compareItems by default", () => {
      const result = sortNodes([...mockNodes], treeContext);

      expect(result).toEqual([
        { id: 2, parent: 0, droppable: false, text: "A File" },
        { id: 3, parent: 0, droppable: true, text: "A Folder" },
        { id: 1, parent: 0, droppable: true, text: "B Folder" },
        { id: 4, parent: 0, droppable: false, text: "C File" },
      ]);
    });

    it("should not sort when sort is false", () => {
      const result = sortNodes([...mockNodes], { ...treeContext, sort: false });
      expect(result).toEqual(mockNodes);
    });

    it("should use custom sort function when provided", () => {
      const result = sortNodes([...mockNodes], {
        ...treeContext,
        sort: customSortCallback,
      });
      expect(result).toEqual([
        { id: 1, parent: 0, droppable: true, text: "B Folder" },
        { id: 2, parent: 0, droppable: false, text: "A File" },
        { id: 3, parent: 0, droppable: true, text: "A Folder" },
        { id: 4, parent: 0, droppable: false, text: "C File" },
      ]);
    });
  });

  describe("Droppable first sorting (insertDroppableFirst: true)", () => {
    const treeContext = { sort: true, insertDroppableFirst: true };

    it("should place droppable nodes first and sort within groups", () => {
      const result = sortNodes([...mockNodes], treeContext);

      expect(result).toEqual([
        // droppable nodes sorted
        { id: 3, parent: 0, droppable: true, text: "A Folder" },
        { id: 1, parent: 0, droppable: true, text: "B Folder" },
        // non-droppable nodes sorted
        { id: 2, parent: 0, droppable: false, text: "A File" },
        { id: 4, parent: 0, droppable: false, text: "C File" },
      ]);
    });

    it("should only group by droppable when sort is false", () => {
      const result = sortNodes([...mockNodes], { ...treeContext, sort: false });

      expect(result).toEqual([
        { id: 1, parent: 0, droppable: true, text: "B Folder" },
        { id: 3, parent: 0, droppable: true, text: "A Folder" },
        { id: 2, parent: 0, droppable: false, text: "A File" },
        { id: 4, parent: 0, droppable: false, text: "C File" },
      ]);
    });

    it("should sort groups using custom sort function", () => {
      const result = sortNodes([...mockNodes], {
        ...treeContext,
        sort: customSortCallback,
      });

      expect(result).toEqual([
        // droppable nodes sorted by id
        { id: 1, parent: 0, droppable: true, text: "B Folder" },
        { id: 3, parent: 0, droppable: true, text: "A Folder" },
        // non-droppable nodes sorted by id
        { id: 2, parent: 0, droppable: false, text: "A File" },
        { id: 4, parent: 0, droppable: false, text: "C File" },
      ]);
    });
  });

  describe("Edge cases", () => {
    it("should handle empty array", () => {
      const result = sortNodes([], { sort: true, insertDroppableFirst: true });
      expect(result).toEqual([]);
    });

    it("should handle all droppable nodes", () => {
      const allDroppable = mockNodes.map((node) => ({
        ...node,
        droppable: true,
      }));
      const result = sortNodes(allDroppable, {
        sort: true,
        insertDroppableFirst: true,
      });
      expect(result).toHaveLength(mockNodes.length);
      expect(result.every((node) => node.droppable)).toBe(true);
    });

    it("should handle all non-droppable nodes", () => {
      const allNonDroppable = mockNodes.map((node) => ({
        ...node,
        droppable: false,
      }));
      const result = sortNodes(allNonDroppable, {
        sort: true,
        insertDroppableFirst: true,
      });
      expect(result).toHaveLength(mockNodes.length);
      expect(result.every((node) => !node.droppable)).toBe(true);
    });

    it("should not mutate original array", () => {
      const original = [...mockNodes];
      sortNodes(mockNodes, { sort: true, insertDroppableFirst: true });
      expect(mockNodes).toEqual(original);
    });
  });
});
