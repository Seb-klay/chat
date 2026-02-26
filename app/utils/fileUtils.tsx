import {
  DocumentIcon,
  PhotoIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import {
  deleteFiles,
  downloadFile,
  downloadFileWithPath,
  createFiles,
} from "../service";
import { preparedFiles } from "../(main)/conversation/[id]/page";

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

    if (!response) throw new Error("No file returned from server. ");

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

function hasFileExtension(inputPath: string) {
  const cleanPath = inputPath.replace(/\/+/g, "/");
  const segments = cleanPath.split("/");
  const lastSegment = segments.pop();
  const hasExtension = lastSegment ? /\.[^/.]+$/.test(lastSegment) : false;

  return { cleanPath, lastSegment, hasExtension };
}

export type PathItem = {
  path: string;
  isdirectory: boolean;
  name: string;
};

export const handleFileDelete = async ({
  filesPath,
}: {
  filesPath: string[];
}) => {
  try {
    const normalizedPaths = filesPath.map((path) => {
      const fileExtension = hasFileExtension(path);

      // keep file as-is
      if (fileExtension.hasExtension) {
        const file = {
          isdirectory: false,
          path: fileExtension.cleanPath,
          name: fileExtension.lastSegment || "",
        };
        return file;
      }

      // remove folder's last segment
      const parentPath = fileExtension.cleanPath.substring(
        0,
        fileExtension.cleanPath.lastIndexOf("/"),
      );
      return {
        isdirectory: true,
        path: parentPath.length === 0 ? "/" : parentPath,
        name: fileExtension.lastSegment || "",
      };
    });

    const returnedFiles: PathItem[] = normalizedPaths;
    const response = await deleteFiles(returnedFiles);
    if (!response) throw new Error("No file returned from server. ");
  } catch (error) {
    throw new Error(String(error));
  }
};

// function for File manager
// export const handleCreateFile = async ({ parent, file }: { parent: string, file: preparedFiles }) => {
//   try {
//       const preparedFile: preparedFiles = {
//         name: file.name,
//         type: file.type,
//         size: 0,
//         path: parent,
//         isdirectory: file.isdirectory,
//         isdeleted: false,
//       };
//     const response = await createFiles([preparedFile]);
//     if (!response)
//       throw new Error("No file returned from server. ");
//   } catch (error) {
//     throw new Error(String(error));
//   }
// };
