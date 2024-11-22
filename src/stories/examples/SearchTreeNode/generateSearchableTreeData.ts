import { NodeModel } from "~/types";

export const generateSearchableTreeData = (count: number): NodeModel<any>[] => {
  const data: NodeModel<any>[] = [];
  const categories = ["Documents", "Images", "Videos", "Code", "Projects"];
  const videoSubFolders = ["Tutorials", "Meetings", "Events", "Recordings"];

  // Create root node
  data.push({
    id: "root",
    parent: 0,
    droppable: true,
    text: "All Files",
  });

  // Create category folders
  categories.forEach((category, index) => {
    data.push({
      id: `category-${index}`,
      parent: "root",
      droppable: true,
      text: category,
    });

    // Add sub-folders for Videos category
    if (category === "Videos") {
      videoSubFolders.forEach((subFolder, subIndex) => {
        data.push({
          id: `videos-folder-${subIndex}`,
          parent: `category-${index}`,
          droppable: true,
          text: subFolder,
        });
      });
    }
  });

  // Generate child nodes
  for (let i = 1; i <= count; i++) {
    const categoryIndex = i % categories.length;
    const categoryId = `category-${categoryIndex}`;
    const fileType = categories[categoryIndex];

    let fileName;
    let parentId;

    switch (fileType) {
      case "Videos":
        fileName = `video_${Math.floor(i / 5)}_${i % 5}.mp4`;
        // Distribute videos across sub-folders
        const subFolderIndex = Math.floor(
          Math.random() * videoSubFolders.length
        );
        parentId = `videos-folder-${subFolderIndex}`;
        break;
      case "Documents":
        fileName = `report_${Math.floor(i / 5)}_${i % 5}.docx`;
        parentId = categoryId;
        break;
      case "Images":
        fileName = `photo_${Math.floor(i / 5)}_${i % 5}.jpg`;
        parentId = categoryId;
        break;
      case "Code":
        fileName = `script_${Math.floor(i / 5)}_${i % 5}.ts`;
        parentId = categoryId;
        break;
      default:
        fileName = `project_${Math.floor(i / 5)}_${i % 5}`;
        parentId = categoryId;
    }

    data.push({
      id: `node-${i}`,
      parent: parentId,
      droppable: false,
      text: fileName,
    });
  }

  return data;
};
