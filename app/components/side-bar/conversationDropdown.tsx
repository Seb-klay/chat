"use client";

import { createPortal } from "react-dom";

type Props = {
  anchorRect: DOMRect | null;
  conv: any;
  setDeletingConversationId: (id: string) => void;
  setRenamingConversationId: (id: string) => void;
  setNewTitle: (t: string) => void;
  setActiveMenu: (id: string | null) => void;
};

export function ConversationDropdown({
  anchorRect,
  conv,
  setDeletingConversationId,
  setRenamingConversationId,
  setNewTitle,
  setActiveMenu,
}: Props) {
    if (!anchorRect) return null;
    const { top, right } = anchorRect;
    
  return createPortal(
    <div
      style={{
        position: "fixed",
        top: top - 8,
        left: right - 192,
        zIndex: 9999,
      }}
      onClick={(e) => e.stopPropagation()}
      className="w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl"
    >
                    <div className="absolute right-2 bottom-full mb-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-100">
                      <div className="py-1">
                        {/* Rename Option */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setRenamingConversationId(conv.convid);
                            setNewTitle(conv.title || "");
                            setActiveMenu(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Rename
                        </button>

                        {/* Delete Option */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeletingConversationId(conv.convid);
                            setActiveMenu(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-700"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Delete
                        </button>

                        {/* Share Option (optional) */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Implement share functionality
                            setActiveMenu(null);
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
                        >
                          <svg
                            className="w-4 h-4 mr-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                            />
                          </svg>
                          Share
                        </button>
                      </div>
                    </div>
    </div>,
    document.body
  );
}
