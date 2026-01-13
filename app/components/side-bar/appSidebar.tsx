"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getUserConversations } from "@/app/service";
import { usePathname, useParams } from "next/navigation";
import { ConversationDropdown } from "./conversationDropdown";

interface Conversation {
  convid: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
}

export default function ConversationSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const currentConversationId = pathname.split("/").pop();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [renamingConversationId, setRenamingConversationId] = useState<
    string | null
  >(null);
  const [deletingConversationId, setDeletingConversationId] = useState<
    string | null
  >(null);
  const [newTitle, setNewTitle] = useState("");
  const [menuRect, setMenuRect] = useState<DOMRect | null>(null);
  const params = useParams();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await getUserConversations();
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error("Failed to fetch conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {};

  const handleDelete = async () => {};

  const openMenu = (conversationId: string, e: React.MouseEvent<HTMLButtonElement>) => {

      e.stopPropagation();

  const rect = e.currentTarget.getBoundingClientRect();
  setMenuRect(rect);
    setActiveMenu((prevActiveMenu) =>
      prevActiveMenu === conversationId ? null : conversationId
    );
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-gray-800 text-white shadow-lg hover:bg-gray-700 transition-all sm:hidden"
        aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
      >
        <div className="w-5 h-5 relative">
          <span className={`absolute left-0 top-1 h-0.5 w-full bg-current transform transition-all duration-300 ${
            isCollapsed ? '' : 'rotate-45 top-2'
          }`}></span>
          <span className={`absolute left-0 top-2 h-0.5 w-full bg-current transition-all duration-300 ${
            isCollapsed ? '' : 'opacity-0'
          }`}></span>
          <span className={`absolute left-0 top-3 h-0.5 w-full bg-current transform transition-all duration-300 ${
            isCollapsed ? '' : '-rotate-45 top-2'
          }`}></span>
        </div>
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed top-0 left-0 h-screen bg-gray-900 border-r border-gray-800
          transition-all duration-300 z-40 flex flex-col
          ${isCollapsed ? "w-20" : "w-64"}
        `}
      >
        {/* Header Section - Always visible */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-4">
            {!isCollapsed && (
              <h2 className="text-lg font-semibold text-white">
                Conversations
              </h2>
            )}

            {/* Collapse button - top right */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
              title={isCollapsed ? "Expand" : "Collapse"}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Essential Buttons - Always visible, icon-only when collapsed */}
          <div className="flex flex-col space-y-2">
            {/* User Account */}
            <button
              className={`
                flex items-center p-2 rounded-lg hover:bg-gray-800 text-gray-300
                ${isCollapsed ? "justify-center" : "justify-start"}
              `}
              title={isCollapsed ? "Account" : ""}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              {!isCollapsed && <span className="ml-3">Account</span>}
            </button>

            {/* Parameters/Settings */}
            <button
              className={`
                flex items-center p-2 rounded-lg hover:bg-gray-800 text-gray-300
                ${isCollapsed ? "justify-center" : "justify-start"}
              `}
              title={isCollapsed ? "Settings" : ""}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {!isCollapsed && <span className="ml-3">Settings</span>}
            </button>

            {/* Create New Conversation */}
            <Link
              href="/"
              className={`
                flex items-center p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white
                ${isCollapsed ? "justify-center" : "justify-start"}
              `}
              title={isCollapsed ? "New Chat" : ""}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {!isCollapsed && <span className="ml-3">New Chat</span>}
            </Link>
          </div>
        </div>

        {/* Conversations List */}
        {!isCollapsed && 
        <div className="flex-1 overflow-y-scroll">
          {loading ? (
            <div className="p-4 flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              No conversations yet
            </div>
          ) : (
            <div className="py-2">
              {conversations.map((conv) => (
                <div
                  key={conv.convid}
                  className={`group relative px-4 py-3 transition-colors border-l-2 ${
                    currentConversationId === conv.convid
                      ? "border-red-500 bg-gradient-to-r from-blue-900/40 to-blue-800/20 text-white font-medium shadow-inner hover:from-blue-900/50 hover:to-blue-800/30"
                      : "border-transparent text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Link href={`/conversation/${conv.convid}`} className="block">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0 pr-8">
                        <h3 className="text-white font-medium truncate">
                          {conv.title || "Untitled"}
                        </h3>
                      </div>
                      <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                        {new Date(conv.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>

                  {/* 3-dots button - shows on hover */}
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openMenu(conv.convid, e);
                      }}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-700 rounded"
                      aria-label="Conversation options"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                      >
                        <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                      </svg>
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {activeMenu === conv.convid && (
                      <ConversationDropdown
                      anchorRect={menuRect}
                      conv={conv}
                      setDeletingConversationId={setDeletingConversationId}
                      setRenamingConversationId={setRenamingConversationId}
                      setNewTitle={setNewTitle}
                      setActiveMenu={setActiveMenu}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
}

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div
            className={`
            flex items-center p-2 rounded-lg hover:bg-gray-800 text-gray-300
            ${isCollapsed ? "justify-center" : "justify-start"}
          `}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </div>
        </div>
      </div>
    </>
  );
}
