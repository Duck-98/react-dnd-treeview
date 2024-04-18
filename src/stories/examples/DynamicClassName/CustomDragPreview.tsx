import React from "react";
import { DragLayerMonitorProps } from "~/types";
import { FileProperties } from "../../types";
import { TypeIcon } from "~/stories/examples/components/TypeIcon";
import styles from "./CustomDragPreview.module.css";

type Props = {
  monitorProps: DragLayerMonitorProps<FileProperties>;
};

export const CustomDragPreview: React.FC<Props> = (props) => {
  const item = props.monitorProps.item;
  const colorStyle = item.data?.fileType ? styles[item.data.fileType] : "";

  return (
    <div
      className={`${styles.root} ${colorStyle}`}
      data-testid="custom-drag-preview"
    >
      <div className={styles.icon}>
        <TypeIcon
          droppable={item.droppable || false}
          fileType={item?.data?.fileType}
        />
      </div>
      <div className={styles.label}>{item.text}</div>
    </div>
  );
};
