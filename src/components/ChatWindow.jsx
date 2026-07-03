import { useEffect, useRef } from "react";
import MessageBubble from "./Messagebubble";
import InputBox from "./InputBox";

function FileIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 py-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500 [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-neutral-500" />
    </div>
  );
}

function DocumentChips({ documents }) {
  if (!documents || documents.length === 0) return null;
  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {documents.map((title) => (
        <div
          key={title}
          className="flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-800/60 px-2.5 py-1 text-xs text-neutral-300"
        >
          <FileIcon />
          <span className="max-w-40 truncate">{title}</span>
        </div>
      ))}
    </div>
  );
}

export default function ChatWindow({
  messages,
  onSend,
  isLoading,
  onFileSelect,
  selectedFile,
  onClearFile,
  uploading,
  onUrlSubmit,
  loadingUrl,
  documents,
}) {
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isEmpty = messages.length === 0;

  const inputBoxProps = {
    onSend,
    disabled: isLoading,
    onFileSelect,
    selectedFile,
    onClearFile,
    uploading,
    onUrlSubmit,
    loadingUrl,
  };

  if (isEmpty) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-4">
        <h1 className="mb-6 text-2xl font-medium text-neutral-100">
          What's on your mind?
        </h1>

        <div className="w-full max-w-2xl">
          <DocumentChips documents={documents} />
          <InputBox ref={inputRef} {...inputBoxProps} />

          <p className="mt-2 text-center text-xs text-neutral-500">
            Click <span className="text-neutral-400">+</span> to add files, add
            a web URL, or quickly start a document / claim question
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
          {isLoading && (
            <div className="flex flex-col items-start">
              <TypingIndicator />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-4 pb-6">
        <DocumentChips documents={documents} />
        <InputBox {...inputBoxProps} />
      </div>
    </div>
  );
}
