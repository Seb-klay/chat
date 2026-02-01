"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  deleteConversation,
  getUserConversations,
  updateTitleConversation,
} from "@/app/service";
import { redirect, useParams } from "next/navigation";
import ConversationsUser from "./conversationsUser";
import { ConfirmationConvCard } from "../cards/confirmationConvCard";
import { IConversation } from "@/app/conversation/[id]/page";
import { useTheme } from "../contexts/theme-provider";
import { logout } from "@/app/login/actions";

export interface Conversation {
  convid: string;
  title: string;
  createdat: string;
  updatedat: string;
  messageCount: number;
}

export type ConfirmationAction = "delete" | "rename" | "share";

export type ConfirmationState =
  | {
      action: ConfirmationAction;
      conversationId: string;
    }
  | undefined;

export default function ConversationSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true); // sidebar collapsed or not
  const [conversations, setConversations] = useState<Conversation[]>([]); // list of conversation
  const params = useParams();
  const currentConversationId = params.id; // get id of current conversation
  const [confirmationState, setConfirmationState] =
    useState<ConfirmationState | null>(null);
  const [onError, setOnError] = useState<string | null>(null); // for confirmation cards
  const { theme } = useTheme();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await getUserConversations();
      const data = await response.json();
      setConversations(data.conversations || []);
    } catch (error) {
      throw new Error("Failed to fetch conversations: " + error);
    }
  };

  // When conversation is created with a generated title, it triggers this reload of the list
  useEffect(() => {
    const handleNewConvEvent = (event: any) => {
      const newChat: IConversation = event.detail;
      // Update state directly so it appears in the list instantly
      setConversations((prev: any) => {
        // Prevent duplicates if already exists
        if (prev.some((c: { convid: string }) => c.convid === newChat.convid))
          return prev;
        return [newChat, ...prev];
      });
    };
    window.addEventListener("chat-created", handleNewConvEvent);
    return () => window.removeEventListener("chat-created", handleNewConvEvent);
  }, []);

  const handleRename = async (newTitle: string | undefined) => {
    if (!newTitle) throw new Error("No title was found");

    try {
      const response = await updateTitleConversation(
        confirmationState?.conversationId,
        newTitle,
      );
      if (!response?.ok)
        setOnError(
          `New title could not be stored with status ${response?.status}.`,
        );
      setConversations((prev) =>
        prev.map((conv) =>
          conv.convid === confirmationState?.conversationId
            ? { ...conv, title: newTitle }
            : conv,
        ),
      );
      setConfirmationState(null);
    } catch (err) {
      throw new Error("Failed to rename conversations: " + err);
    }
  };

  const handleDeleteConversation = async () => {
    if (confirmationState?.conversationId) {
      // call API to delete the conversation
      const response = await deleteConversation(
        confirmationState.conversationId,
      );
      if (!response.ok) {
        setOnError("The conversation could not be deleted.");
      } else {
        fetchConversations();
        setConfirmationState(null);
        redirect("/");
      }
    }
  };

  const handleCancel = () => {
    setConfirmationState(null);
    setOnError(null);
  };

  function getDateGroup(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();

    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) {
      return "Last hour";
    }

    if (diffDays < 1) {
      return "Today";
    }

    if (diffDays < 7) {
      return "Last week";
    }

    if (diffDays < 30) {
      return "Last month";
    }

    if (date.getFullYear() === now.getFullYear()) {
      // Month name (December, November, ...)
      return date.toLocaleString("default", { month: "long" });
    }

    return String(date.getFullYear());
  }

  const groupedConversations = useMemo(() => {
    return conversations.reduce<Record<string, Conversation[]>>(
      (groups, conv) => {
        const dateToUse = conv.updatedat ?? conv.createdat;
        const group = getDateGroup(dateToUse);

        if (!groups[group]) {
          groups[group] = [];
        }

        groups[group].push(conv);

        return groups;
      },
      {},
    );
  }, [conversations]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{
          backgroundColor: theme.colors.background_second,
          color: theme.colors.primary,
        }}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-lg shadow-lg hover:opacity-70 transition-all md:hidden"
        aria-label={isCollapsed ? "Open sidebar" : "Close sidebar"}
      >
        <div className="w-5 h-5 relative">
          <span
            className={`absolute left-0 top-1 h-0.5 w-full bg-current transform transition-all duration-300 ${
              isCollapsed ? "" : "rotate-45 top-2"
            }`}
          ></span>
          <span
            className={`absolute left-0 top-2 h-0.5 w-full bg-current transition-all duration-300 ${
              isCollapsed ? "" : "opacity-0"
            }`}
          ></span>
          <span
            className={`absolute left-0 top-3 h-0.5 w-full bg-current transform transition-all duration-300 ${
              isCollapsed ? "" : "-rotate-45 top-2"
            }`}
          ></span>
        </div>
      </button>

      {/* Sidebar */}
      <div
        style={{
          backgroundColor: theme.colors.background_second,
          color: theme.colors.primary,
        }}
        className={`
          h-[100dvh] transition-all duration-300 z-40 flex flex-col 
          ${isCollapsed ? "w-0 md:w-20" : "w-full md:w-64"}
        `}
      >
        {/* Header Section - Always visible */}
        <div className="p-2">
          <div
            className={`flex justify-between my-2 ${
              isCollapsed ? "flex-col items-center" : ""
            }`}
          >
            {!isCollapsed && (
              <h2
                style={{ color: theme.colors.primary }}
                className="text-lg font-semibold my-auto"
              >
                Conversations
              </h2>
            )}

            {/* Collapse button - top right */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={`p-2 rounded hover:opacity-70 hidden md:block ${
                isCollapsed ? "justify-center" : "justify-end"
              }`}
              title={isCollapsed ? "Expand" : "Collapse"}
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Essential Buttons - Always visible, icon-only when collapsed */}
          <div className="flex flex-col space-y-2">
            {/* User Account */}
            <Link
              href="/account"
              style={{ color: theme.colors.primary }}
              className={`
                flex items-center p-2 rounded-lg hover:opacity-70
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
            </Link>

            {/* Parameters/Settings */}
            <Link
              href="/settings"
              style={{ color: theme.colors.primary }}
              className={`
                flex items-center p-2 rounded-lg hover:opacity-70
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
            </Link>

            {/* Create New Conversation */}
            <Link
              href="/"
              className={`
                flex items-center p-2 rounded-lg duration-500 ease-in-out bg-gradient-to-br from-indigo-500 to-indigo-800 hover:to-violet-900 text-gray-100
                ${
                  isCollapsed
                    ? "justify-center items-center hidden md:block md:mx-auto"
                    : "justify-start"
                }
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
        {!isCollapsed && (
          <div className="flex-1 overflow-y-scroll">
            <Suspense
              fallback={
                <div className="p-2 flex justify-center">
                  <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              }
            >
              {conversations.length === 0 ? (
                <div
                  style={{ color: theme.colors.secondary }}
                  className="p-4 text-center"
                >
                  No conversations yet
                </div>
              ) : (
                <div className="py-1 px-1">
                  {Object.entries(groupedConversations)
                    // sort conversation from most recent to oldest
                    .sort(([, convsA], [, convsB]) => {
                      const getTime = (convs: Conversation[]) =>
                        Math.max(
                          ...convs.map((c) =>
                            new Date(c.updatedat ?? c.createdat).getTime(),
                          ),
                        );
                      // Sort descending (newest groups first)
                      return getTime(convsB) - getTime(convsA);
                    })
                    .map(([groupName, convs]) => {
                      return (
                        <div key={groupName}>
                          {/* Section Header */}
                          <div
                            style={{ color: theme.colors.secondary }}
                            className="px-2 pt-4 pb-2 text-xs font-semibold"
                          >
                            {groupName}
                          </div>

                          {convs.map((conv) => {
                            return (
                              <div
                                key={conv.convid}
                                style={{
                                  backgroundColor:
                                    String(currentConversationId) ===
                                    String(conv.convid)
                                      ? theme.colors.tertiary_background
                                      : "transparent",
                                }}
                                className="group relative px-2 transition-colors rounded-lg overflow-x-hidden hover:opacity-70"
                              >
                                <ConversationsUser
                                  conversation={conv}
                                  onOption={setConfirmationState}
                                />
                              </div>
                            );
                          })}
                          {/* Delete, Rename, Share, ..., confirmation card */}
                          {confirmationState && (
                            <ConfirmationConvCard
                              action={confirmationState.action}
                              onCancel={handleCancel}
                              onDelete={handleDeleteConversation}
                              onRename={handleRename}
                              onShare={() => {}}
                              onError={onError}
                            />
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </Suspense>
          </div>
        )}

        {/* Footer */}
        <div className="py-2">
          <button
            onClick={logout}
            style={{ color: theme.colors.primary }}
            className={`
            flex items-center p-2 rounded-lg hover:opacity-70
            ${isCollapsed ? "justify-center text-center mx-auto hidden md:block" : "justify-start"}
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
          </button>
        </div>
      </div>
    </>
  );
}
