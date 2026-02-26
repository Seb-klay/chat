import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import {
  DocumentIcon,
  PlusIcon,
} from "@heroicons/react/16/solid";
import { useTheme } from "../contexts/theme-provider";
import { useRef, useState } from "react";
import FileUploadCard from "../cards/fileUploadCard";

interface AiToolsProps {
  onFile: (files: File[], folderName?: string) => void;
}

export default function AiTools({ onFile }: AiToolsProps) {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [onFolderCreation, setOnFolderCreation] = useState<boolean>(false);

  const handleFileSelect = (files: File[], folderName?: string) => {
    // Handle your files here
    if (files) {
      // Convert FileList to array
      const fileArray = Array.from(files);
      if (folderName) {
        onFile(fileArray, folderName)
      } else {
        onFile(fileArray);
      }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    } else {
      onFile([]); // Handle no files selected
    }
  };

  const handleBrowseClick = () => {
    // Programmatically trigger the hidden file input
    fileInputRef.current?.click();
  };

  return (
    <Menu as="div" className="relative inline-block">
      <MenuButton
        style={{
          backgroundColor: theme.colors.background_second,
          color: theme.colors.primary,
        }}
        className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-semibold shadow-lg ring-1 ring-white/10 hover:bg-white/20 transition-all duration-200"
      >
        <PlusIcon className="w-5 h-5 transition-transform duration-300" />
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mb-2 w-64 origin-bottom-right bottom-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 backdrop-blur-sm transition-all duration-200 data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-200 data-enter:ease-out data-leave:duration-150 data-leave:ease-in"
        style={{
          backgroundColor: theme.colors.background_second,
        }}
      >
        <div className="p-2 space-y-1">
          {/* File Upload Option */}
          <MenuItem>
            <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer"
            style={{ color: theme.colors.primary }}
            onClick={handleBrowseClick}
            >
            <div className="p-1.5 rounded-md bg-white/5">
                <DocumentIcon className="w-5 h-5 text-blue-400" />
            </div>
            <span className="flex-1 text-sm font-medium">Upload Files</span>
            </div>
          </MenuItem>

          {/* Add more menu items here */}
          <MenuItem>
            <button
            onClick={() => setOnFolderCreation(true)}
            className={`
                w-full flex items-center gap-3 px-3 py-2.5
                text-sm font-medium rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer
            `}
            style={{ color: theme.colors.primary }}
            >
            <div className="p-1.5 rounded-md bg-white/5">
                <PlusIcon className="w-5 h-5 text-green-400" />
            </div>
            <span>Create New Folder</span>
            </button>
          </MenuItem>
        </div>

        {/* Decorative gradient line */}
        <div className="h-1 bg-linear-to-r from-blue-500 via-purple-500 to-pink-500" />
      </MenuItems>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            handleFileSelect(filesArray);
          }
        }}
      />


      {onFolderCreation && (
      <FileUploadCard
        isOpen={onFolderCreation}
        onClose={() => setOnFolderCreation(false)}
        onSubmit={handleFileSelect}
      />
      )}
    </Menu>
  );
}
