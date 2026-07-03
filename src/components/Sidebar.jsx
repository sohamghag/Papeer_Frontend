import { useState, useRef, useEffect } from "react";

function NewChatIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function MoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

function ConversationRow({ conv, isActive, onSelect, onRename, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(conv.title);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const commitRename = () => {
    const trimmed = draftTitle.trim();
    setRenaming(false);
    if (trimmed && trimmed !== conv.title) {
      onRename(conv.session_id, trimmed);
    } else {
      setDraftTitle(conv.title);
    }
  };

  return (
    <div
      className={
        "group relative flex items-center rounded-lg px-2.5 py-2 text-sm cursor-pointer " +
        (isActive
          ? "bg-neutral-800 text-neutral-100"
          : "text-neutral-300 hover:bg-neutral-800/60")
      }
      onClick={() => !renaming && onSelect(conv.session_id)}
    >
      {renaming ? (
        <input
          autoFocus
          value={draftTitle}
          onChange={(e) => setDraftTitle(e.target.value)}
          onBlur={commitRename}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitRename();
            if (e.key === "Escape") {
              setDraftTitle(conv.title);
              setRenaming(false);
            }
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-full bg-transparent outline-none border-b border-neutral-500"
        />
      ) : (
        <span className="flex-1 truncate">{conv.title}</span>
      )}

      {!renaming && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className={
              "flex h-6 w-6 items-center justify-center rounded text-neutral-400 hover:bg-neutral-700 " +
              (menuOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100")
            }
            aria-label="Conversation options"
          >
            <MoreIcon />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 w-32 overflow-hidden rounded-lg border border-neutral-700 bg-neutral-800 shadow-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  setRenaming(true);
                }}
                className="block w-full px-3 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-700"
              >
                Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(conv.session_id);
                }}
                className="block w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-neutral-700"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  conversations,
  activeSessionId,
  onNewChat,
  onSelectConversation,
  onRename,
  onDelete,
}) {
  return (
    <div className="flex h-full w-65 shrink-0 flex-col border-r border-neutral-800 bg-neutral-950 p-2">
      <button
        onClick={onNewChat}
        className="mb-3 flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-neutral-200 hover:bg-neutral-800 mt-2"
      >
        <NewChatIcon />
        New chat
      </button>

      <div className="flex-1 space-y-0.5 overflow-y-auto scrollbar-hide">
        {conversations.length === 0 ? (
          <p className="px-2.5 py-2 text-xs text-neutral-500">
            No conversations yet
          </p>
        ) : (
          conversations.map((conv) => (
            <ConversationRow
              key={conv.session_id}
              conv={conv}
              isActive={conv.session_id === activeSessionId}
              onSelect={onSelectConversation}
              onRename={onRename}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
