"use client";

import { useEffect, useState } from "react";
import { Filemanager, Willow, WillowDark } from "@svar-ui/react-filemanager";
import "@svar-ui/react-filemanager/all.css";
import {
  getFilesMetadata,
} from "../../service";
import { preparedFiles } from "../conversation/[id]/page";
import { useTheme } from "../../components/contexts/theme-provider";
import { handleFileDelete, handleFileDownload } from "@/app/utils/fileUtils";

export default function Documents() {
  const [files, setFiles] = useState([]);
  const { theme, mode } = useTheme();

  useEffect(() => {
    getFiles();
  }, []);

  const getFiles = async () => {
    try {
      const response = await getFilesMetadata(); // we don't want the deleted files (metadata)
      const data = await response?.json();

      const formattedFiles = data.files.map((file: preparedFiles) => {
        const buildId = (file: preparedFiles) => {
          const par = file.path && file.path !== "/" ? file.path : "";
          return `${par}/${file.name}`;
        }

        return {
          id: buildId(file),
          name: file.name,
          type: file.isdirectory ? "folder" : "file",
          size: file.size ?? 0,
          date: file.createdat ? new Date(file.createdat) : new Date(),
        };
      });

      setFiles(formattedFiles);
    } catch (err) {
      console.log(err);
    }
  };

  // this mode is deactivated by readonly because files data cannot be loaded from the file manager
  const init = (api: any) => {
    api.on("download-file", async (ev: { id: string }) => {
      try {
        const filePath = ev.id as string;
        const fileName = filePath.split("/").pop() || "New File";
        await handleFileDownload({fileName: fileName, filePath: filePath}); // id is the file path with React-file-manager
      } catch (error) {
        console.log(error)
      }

    });

    api.on("delete-files", async ({ ids }: { ids: string[] }) => {
      try {
        await handleFileDelete({filesPath: ids});
      } catch (error) {
        console.log(error)
      }
    });

    // api.on("create-file", async ({ parent, file }: { parent: string, file: File }) => {
    //   try {
    //     await handleCreateFile({parent: parent, file: file});
    //   } catch (error) {
    //     console.log(error)
    //   }
    // });
  };

  return (
    <div
      style={{
        backgroundColor: theme.colors.background,
        color: theme.colors.primary,
      }}
      className="flex flex-col h-dvh px-2"
    >
      {mode === "dark" ? (
        <WillowDark>
          <Filemanager init={init} data={files} mode={"table"} readonly={true} />
        </WillowDark>
      ) : (
        <Willow>
          <Filemanager init={init} data={files} mode={"table"} readonly={true} />
        </Willow>
      )}
    </div>
  );
}
