"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import {
  deleteConversation,
  getUserConversations,
  updateTitleConversation,
} from "@/app/service";
import { redirect, useParams } from "next/navigation";
import ConversationsUser from "./conversationsUser";
import { ConfirmationConvCard } from "../cards/confirmationConvCard";
import { IConversation } from "@/app/(main)/conversation/[id]/page";
import { useTheme } from "../contexts/theme-provider";
import { logout } from "@/app/(auth)/login/actions";
import PagesSideBar from "./pageSideBar";
import CollapseButton from "../buttons/collapseButton";
import CollapseSmallButton from "../buttons/collapseSmartphoneButton";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";


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
      <CollapseSmallButton
        isCollapsed={isCollapsed}
        onCollapse={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Sidebar */}
      <div
        style={{
          backgroundColor: theme.colors.background_second,
          color: theme.colors.primary,
        }}
        className={`
          h-dvh transition-all duration-300 z-40 flex flex-col 
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
            <CollapseButton
              isCollapsed={isCollapsed}
              onCollapse={() => setIsCollapsed(!isCollapsed)}
            />
          </div>

          {/* Essential Buttons - Always visible, icon-only when collapsed */}
          <PagesSideBar
            isCollapsed={isCollapsed}
            onCollapse={() => setIsCollapsed(true)}
          />
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
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
            {!isCollapsed && <span className="ml-3">Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}
