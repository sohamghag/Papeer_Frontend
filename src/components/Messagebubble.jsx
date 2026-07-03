import { useState } from "react";
import ReactMarkdown from "react-markdown";

function CopyIcon() {
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
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
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
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default function MessageBubble({ role, content }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, fail silently
    }
  };

  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[70%] rounded-3xl bg-neutral-800 px-4 py-2.5 text-sm text-neutral-100">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="group flex flex-col items-start">
      <div
        className="
          prose prose-invert prose-sm max-w-none text-neutral-100
          prose-p:my-2 prose-headings:my-3 prose-headings:font-semibold
          prose-strong:text-neutral-50 prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
          prose-ol:my-2 prose-ul:my-2 prose-li:my-0.5
          prose-code:text-neutral-200 prose-code:bg-neutral-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        "
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      <div className="mt-2 flex items-center opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={handleCopy}
          className="flex h-7 w-7 items-center justify-center rounded-md text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
          aria-label="Copy message"
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
    </div>
  );
}
