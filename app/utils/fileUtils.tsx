import {
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { deleteFiles, downloadFile, downloadFileWithPath } from "../service";

const getIcon = ({ fileType }: any) => {
  if (fileType.includes("image")) {
    return <PhotoIcon className="w-5 h-5" />;
  }
  if (fileType.includes("text")) {
    return <DocumentTextIcon className="w-5 h-5" />;
  }
  return <DocumentIcon className="w-5 h-5" />;
};

// Helper function to format file size
export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const FileIcon = ({ fileType }: any) => {
  const isUnsupported =
    fileType?.startsWith("video/") || fileType?.startsWith("audio/");

  const getIconColor = () => {
    if (isUnsupported) return "text-gray-400";
    if (fileType.includes("pdf")) return "text-red-500";
    if (fileType.includes("image")) return "text-blue-500";
    if (fileType.includes("word") || fileType.includes("document"))
      return "text-blue-700";
    if (fileType.includes("excel") || fileType.includes("sheet"))
      return "text-green-600";
    if (fileType.includes("text")) return "text-gray-500";
    return "text-gray-400";
  };

  return <div className={`${getIconColor()}`}>{getIcon({ fileType })}</div>;
};

// Handle file download
export const handleFileDownload = async ({
  fileName,
  fileId,
  filePath,
}: {
  fileName: string;
  fileId?: string;
  filePath?: string;
}) => {
  try {
    if (!fileId && !filePath) {
      throw new Error(`Could not download file named ${fileName}. `);
    }

    // Appwrite returns ArrayBuffer
    let response: Response | null = null;
    if (fileId) {
      response = await downloadFile(fileId);
    } else if (filePath) {
      response = await downloadFileWithPath(filePath);
    }

    if (!response)
      throw new Error("No file returned from server. ");

    const arrayBuffer = await response.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });

    // Create object URL
    const url = window.URL.createObjectURL(blob);

    // Create temporary anchor
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);

    // Trigger download
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw new Error(String(error));
  }
};

export const handleFileDelete = async ({ filesPath }: { filesPath: string[] }) => {
  try {
    const response = await deleteFiles(filesPath);
    if (!response)
      throw new Error("No file returned from server. ");
  } catch (error) {
    throw new Error(String(error));
  }
};
