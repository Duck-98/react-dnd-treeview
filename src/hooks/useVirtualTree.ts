import { useVirtualizer } from "@tanstack/react-virtual";
import { NodeModel } from "../types";

interface UseVirtualTreeProps {
  tree: NodeModel[];
  virtualizeOptions?: {
    enabled: boolean;
    threshold?: number;
    itemHeight?: number;
    overscan?: number;
    containerHeight?: string;
  };
  scrollRef: React.RefObject<HTMLElement>;
}

export const useVirtualTree = ({
  tree,
  virtualizeOptions,
  scrollRef,
}: UseVirtualTreeProps) => {
  // 가상 스크롤 설정
  const virtualizer = useVirtualizer({
    count: tree.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => virtualizeOptions?.itemHeight || 32,
    overscan: virtualizeOptions?.overscan || 5,
  });

  return virtualizer;
};
