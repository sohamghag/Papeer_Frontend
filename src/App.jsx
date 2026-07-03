import { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import {
  createSession,
  sendChat,
  getConversations,
  getHistory,
  deleteConversation,
  renameConversation,
  uploadFile,
  getDocuments,
  loadUrl,
} from "./api/client";

function MenuIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-neutral-500"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export default function App() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loadingUrl, setLoadingUrl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sendingRef = useRef(false); // synchronous lock, immune to render-cycle races

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations();
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }, []);

  const loadDocuments = useCallback(async (id) => {
    if (!id) {
      setDocuments([]);
      return;
    }
    try {
      const data = await getDocuments(id);
      setDocuments(data.documents || []);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setDocuments([]);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleNewChat = async () => {
    setSidebarOpen(false);
    try {
      const data = await createSession();
      setSessionId(data.session_id);
      setMessages([]);
      setSelectedFile(null);
      setDocuments([]);
      setConversations((prev) => [
        { session_id: data.session_id, title: data.title },
        ...prev,
      ]);
    } catch (err) {
      console.error("Failed to create new chat:", err);
    }
  };

  const handleSelectConversation = async (id) => {
    setSidebarOpen(false);
    if (id === sessionId) return;
    try {
      const data = await getHistory(id);
      setSessionId(id);
      setMessages(data.messages || []);
      setSelectedFile(null);
      loadDocuments(id);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    }
  };

  const handleSend = async (text) => {
    if (sendingRef.current) return; // synchronous lock — immune to render-timing races
    sendingRef.current = true;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setIsLoading(true);
    try {
      const data = await sendChat(sessionId, text);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer },
      ]);
      if (!sessionId) {
        setSessionId(data.session_id);
      }
      loadConversations();
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
      sendingRef.current = false;
    }
  };

  const handleRename = async (id, newTitle) => {
    setConversations((prev) =>
      prev.map((c) => (c.session_id === id ? { ...c, title: newTitle } : c)),
    );
    try {
      await renameConversation(id, newTitle);
    } catch (err) {
      console.error("Failed to rename conversation:", err);
      loadConversations();
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.session_id !== id));
      if (id === sessionId) {
        setSessionId(null);
        setMessages([]);
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Failed to delete conversation:", err);
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setUploading(true);
    try {
      let activeSessionId = sessionId;

      // auto-create a session first, same pattern as "New chat" and first message
      if (!activeSessionId) {
        const data = await createSession();
        activeSessionId = data.session_id;
        setSessionId(activeSessionId);
        setConversations((prev) => [
          { session_id: activeSessionId, title: data.title },
          ...prev,
        ]);
      }

      const result = await uploadFile(activeSessionId, file);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `**${result.filename}** uploaded — ${result.chunks_added} chunk(s) added. You can now ask about it — try phrasing like "as per the report..." or "what does the document say about..." for best results.`,
        },
      ]);

      loadDocuments(activeSessionId);
    } catch (err) {
      console.error("Failed to upload file:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to upload the file. Please try again.",
        },
      ]);
    } finally {
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleUrlSubmit = async (url) => {
    setLoadingUrl(true);
    try {
      let activeSessionId = sessionId;

      if (!activeSessionId) {
        const data = await createSession();
        activeSessionId = data.session_id;
        setSessionId(activeSessionId);
        setConversations((prev) => [
          { session_id: activeSessionId, title: data.title },
          ...prev,
        ]);
      }

      const result = await loadUrl(activeSessionId, url);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `**${result.title}** loaded from the web — ${result.chunks_added} chunk(s) added. You can now ask about it — try "as per the report..." for best results.`,
        },
      ]);

      loadDocuments(activeSessionId);
    } catch (err) {
      console.error("Failed to load URL:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to load that URL. Please try again.",
        },
      ]);
    } finally {
      setLoadingUrl(false);
    }
  };

  const handleClearFile = () => {
    if (uploading) return; // don't allow clearing mid-upload
    setSelectedFile(null);
  };

  return (
    <div className="flex h-screen bg-neutral-900 text-neutral-100">
      {/* Desktop sidebar */}
      <div className="hidden md:block">
        <Sidebar
          conversations={conversations}
          activeSessionId={sessionId}
          onNewChat={handleNewChat}
          onSelectConversation={handleSelectConversation}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </div>

      {/* Mobile sidebar drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full">
            <Sidebar
              conversations={conversations}
              activeSessionId={sessionId}
              onNewChat={handleNewChat}
              onSelectConversation={handleSelectConversation}
              onRename={handleRename}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop top bar */}
        <div className="hidden items-center justify-between border-b border-neutral-800 px-4 py-4 md:flex">
          <div className="flex items-center gap-1.5">
            <span className="text-md  font-semibold text-neutral-100">
              Papeer
            </span>
          </div>
        </div>

        {/* Mobile top bar */}
        <div className="flex items-center gap-3 border-b border-neutral-800 p-3 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-800"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
          <span className="text-sm font-medium">Papeer</span>
        </div>

        <div className="min-h-0 flex-1">
          <ChatWindow
            messages={messages}
            onSend={handleSend}
            isLoading={isLoading}
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            onClearFile={handleClearFile}
            uploading={uploading}
            onUrlSubmit={handleUrlSubmit}
            loadingUrl={loadingUrl}
            documents={documents}
          />
        </div>
      </div>
    </div>
  );
}
