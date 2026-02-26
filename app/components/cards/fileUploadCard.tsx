"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import {
  XMarkIcon,
  FolderIcon,
  CloudArrowUpIcon,
  DocumentIcon,
} from "@heroicons/react/24/outline";
import { preparedFiles } from "@/app/(main)/conversation/[id]/page";
import { prepareFilesForServer } from "@/app/utils/chatUtils";
import { createFiles } from "@/app/service";

interface FileUploadCardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (files: File[], folderName: string) => void;
}

export default function FileUploadCard({
  isOpen,
  onClose,
  onSubmit,
}: FileUploadCardProps) {
  const [folderName, setFolderName] = useState("");
  const [files, setFiles] = useState<Set<File>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle drag events
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isMobile) {
        setIsDragging(true);
      }
    },
    [isMobile],
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Only set dragging to false if we're leaving the dropzone (not its children)
    if (
      dropZoneRef.current &&
      !dropZoneRef.current.contains(e.relatedTarget as Node)
    ) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isMobile) {
        setIsDragging(true);
      }
    },
    [isMobile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (isMobile) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => new Set([...prev, ...droppedFiles]));
    },
    [isMobile],
  );

  // Handle file selection via input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const selectedFiles = Array.from(event.target.files);

      setFiles((prev) => {
        const existingNames = new Set(Array.from(prev).map((f) => f.name));
        // make sure there is not twice the same file
        const newUniqueFiles = selectedFiles.filter(
          (file) => !existingNames.has(file.name),
        );
        // Combine them
        return new Set([...prev, ...newUniqueFiles]);
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove file from list
  const removeFile = (fileToRemove: File) => {
    setFiles((prev) => {
      const newSet = new Set(prev);
      newSet.delete(fileToRemove);
      return newSet;
    });
  };

  const createProject = async () => {
    try {
        // first create folder
        const newFolder: preparedFiles = {
            name: folderName,
            type: null,
            size: 0,
            path: '/',
            isdirectory: true,
            isdeleted: false,
            data: undefined,
        }
        const response = await createFiles([newFolder]);
        if (!response?.ok) throw new Error("Could not store files in database. ");

        // send back the data
        onSubmit(Array.from(files), folderName);
    } catch (error) {
        console.log(error)
    } finally {
        onClose();
    }
  }

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay with half black and z-index 50 */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

      {/* Card in the middle of the screen */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-6 mx-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Upload Files</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              type="button"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* <form onSubmit={handleSubmit}> */}
          {/* Folder name input */}
          <div className="mb-4">
            <label
              htmlFor="folderName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Folder Name
            </label>
            <div className="relative">
              <FolderIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                id="folderName"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter folder name"
                required
              />
            </div>
          </div>

          {/* Drag and drop area (desktop) or file input (mobile) */}
          <div className="mb-4">
            <p className="block text-sm font-medium text-gray-700 mb-1">
              Files
            </p>

            {!isMobile ? (
              // Desktop: Flowbite-style drag and drop
              <div
                ref={dropZoneRef}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                    flex flex-col items-center justify-center w-full h-48
                    border-2 border-dashed rounded-lg cursor-pointer
                    transition-colors duration-200
                    ${
                      isDragging
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }
                  `}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <CloudArrowUpIcon
                    className={`w-8 h-8 mb-4 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
                  />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or
                    drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  id="dropzone-file"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            ) : (
              // Mobile: Simple file input button
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="mobileFileInput"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-blue-500 text-white text-center rounded-md hover:bg-blue-600 transition-colors"
                >
                  Select Files
                </button>
                <p className="text-xs text-gray-400 text-center">
                  Tap to browse your files
                </p>
              </div>
            )}

            {/* File set */}
            {files.size > 0 && (
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                {Array.from(files).map((file) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                  >
                    <div className="flex items-center space-x-2 min-w-0">
                      <DocumentIcon className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="text-sm text-gray-600 truncate">
                        {file.name}
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file)}
                      className="text-red-500 hover:text-red-700 shrink-0 ml-2"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit button */}
          <button
            type="button"
            disabled={!folderName.trim()}
            onClick={createProject}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Create Folder & Upload
          </button>
          {/* </form> */}
        </div>
      </div>
    </>
  );
}
