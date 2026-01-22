import Link from "next/link";
import { ConversationDropdown } from "./conversationDropdown";
import { Conversation } from "./appSidebar";

type Props = {
  conversation: Conversation;
  isActive: boolean;
  anchorRect: DOMRect | null;
  setMenuRect: React.Dispatch<React.SetStateAction<DOMRect | null>>;
  setDeletingConversationId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  setRenamingConversationId: React.Dispatch<
    React.SetStateAction<string | null>
  >;
  setActiveMenu: React.Dispatch<React.SetStateAction<string | null>>;
};

export default function ConversationsUser({
  conversation,
  isActive,
  anchorRect,
  setMenuRect,
  setDeletingConversationId,
  setRenamingConversationId,
  setActiveMenu,
}: Props) {
  if (!conversation) return null;

  const { convid, title, createdat, updatedat, messageCount } = conversation;

  const openMenu = (
    conversationId: string,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const rect = e.currentTarget.getBoundingClientRect();
    setMenuRect(rect);
    setActiveMenu((prevActiveMenu) =>
      prevActiveMenu === conversationId ? null : conversationId
    );
  };

  return (
    <>
      <Link href={`/conversation/${convid}`} className="block rounded-lg py-3">
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-8">
            <h3 className="text-gray-100 font-medium truncate">
              { title }
            </h3>
          </div>
        </div>
      </Link>

      {/* 3-dots button - shows on hover */}
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            openMenu(convid, e);
          }}
          className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-gray-700 rounded"
          aria-label="Conversation options"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
            <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isActive && (
        <ConversationDropdown
          anchorRect={anchorRect}
          conv={conversation}
          setDeletingConversationId={setDeletingConversationId}
          setRenamingConversationId={setRenamingConversationId}
          setActiveMenu={setActiveMenu}
        />
      )}
    </>
  );
}
