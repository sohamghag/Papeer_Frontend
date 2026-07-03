import {
  useState,
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import { TRIGGER_PHRASES } from "../constants/constants";
function PlusIcon() {
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
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="16"
      height="16"
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

function LinkIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function DocMsgIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="9" y1="13" x2="15" y2="13" />
      <line x1="9" y1="17" x2="12" y2="17" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

const ACCEPTED_TYPES = ".pdf,.txt,.md,.markdown";

// Phrases that match the router's keyword rules — nudges users toward
// phrasing that reliably triggers "retrieve" or "verify_claim".

const ROUTE_LABEL = {
  retrieve: "Document",
  verify_claim: "Verify Claim",
};

const InputBox = forwardRef(function InputBox(
  {
    onSend,
    disabled,
    onFileSelect,
    selectedFile,
    onClearFile,
    uploading,
    onUrlSubmit,
    loadingUrl,
  },
  ref,
) {
  const [value, setValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [urlMode, setUrlMode] = useState(false);
  const [urlValue, setUrlValue] = useState("");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);
  const urlInputRef = useRef(null);

  const resizeTextarea = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 160) + "px";
    }
  };

  useImperativeHandle(ref, () => ({
    setText(text) {
      setValue(text);
      textareaRef.current?.focus();
      requestAnimationFrame(resizeTextarea);
    },
  }));

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (urlMode) urlInputRef.current?.focus();
  }, [urlMode]);

  // close the URL input only AFTER loading actually finishes,
  // not immediately on submit — this is what lets "Loading…" actually show
  const prevLoadingUrlRef = useRef(false);
  useEffect(() => {
    if (prevLoadingUrlRef.current && !loadingUrl) {
      setUrlMode(false);
    }
    prevLoadingUrlRef.current = loadingUrl;
  }, [loadingUrl]);

  const suggestions = useMemo(() => {
    const trimmedLower = value.toLowerCase();
    if (!trimmedLower || trimmedLower.length < 2) return [];
    return TRIGGER_PHRASES.filter((p) => {
      const phraseLower = p.text.toLowerCase();
      return (
        phraseLower.startsWith(trimmedLower) && phraseLower !== trimmedLower
      );
    });
  }, [value]);

  const handleInput = (e) => {
    setValue(e.target.value);
    resizeTextarea();
  };

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (phraseText) => {
    setValue(phraseText);
    textareaRef.current?.focus();
    requestAnimationFrame(resizeTextarea);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect?.(file);
    e.target.value = "";
  };

  const handleUrlKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitUrl();
    }
    if (e.key === "Escape") {
      setUrlMode(false);
      setUrlValue("");
    }
  };

  const submitUrl = () => {
    const trimmed = urlValue.trim();
    if (!trimmed) return;
    onUrlSubmit?.(trimmed);
    setUrlValue("");
    // urlMode stays open — the loadingUrl effect above closes it once loading finishes
  };

  // menu item actions
  const startAddFiles = () => {
    setMenuOpen(false);
    fileInputRef.current?.click();
  };
  const startAddUrl = () => {
    setMenuOpen(false);
    setUrlMode(true);
  };
  const insertChatWithDocPhrase = () => {
    setMenuOpen(false);
    handleSuggestionClick("as per the report, ");
  };
  const insertVerifyClaimPhrase = () => {
    setMenuOpen(false);
    handleSuggestionClick("verify this claim: ");
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className="relative">
      {/* trigger-phrase autocomplete dropdown */}
      {suggestions.length > 0 && !urlMode && (
        <div className="absolute bottom-full left-0 mb-2 w-full overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 shadow-lg">
          {suggestions.map((s) => (
            <button
              key={s.text}
              type="button"
              onClick={() => handleSuggestionClick(s.text)}
              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700"
            >
              <span className="truncate">{s.text.trim()}…</span>
              <span className="ml-2 shrink-0 rounded-full border border-neutral-600 px-2 py-0.5 text-[10px] text-neutral-400">
                {ROUTE_LABEL[s.route]}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="rounded-3xl border border-neutral-700 bg-neutral-800/50 px-3 py-2">
        {selectedFile && (
          <div className="mb-2 flex w-fit items-center gap-2 rounded-lg bg-neutral-700/60 px-2.5 py-1.5 text-xs text-neutral-200">
            <FileIcon />
            <span className="max-w-[180px] truncate">{selectedFile.name}</span>
            {uploading ? (
              <span className="text-neutral-400">Uploading…</span>
            ) : (
              <button
                type="button"
                onClick={onClearFile}
                className="rounded p-0.5 text-neutral-400 hover:bg-neutral-600 hover:text-neutral-100"
                aria-label="Remove file"
              >
                <XIcon />
              </button>
            )}
          </div>
        )}

        {/* inline URL input mode */}
        {urlMode ? (
          <div className="flex items-center gap-2">
            <LinkIcon />
            <input
              ref={urlInputRef}
              type="url"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onKeyDown={handleUrlKeyDown}
              placeholder="Paste a webpage URL…"
              disabled={loadingUrl}
              className="flex-1 bg-transparent py-1.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none disabled:opacity-60"
            />
            {loadingUrl ? (
              <span className="text-xs text-neutral-400">Loading…</span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={submitUrl}
                  className="rounded-full bg-white px-3 py-1 text-xs font-medium text-black hover:bg-neutral-200"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setUrlMode(false);
                    setUrlValue("");
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-700"
                  aria-label="Cancel"
                >
                  <XIcon />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                disabled={disabled || uploading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="More options"
              >
                <PlusIcon />
              </button>

              {menuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-56 overflow-hidden rounded-xl border border-neutral-700 bg-neutral-800 py-1 shadow-lg">
                  <button
                    type="button"
                    onClick={startAddFiles}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700"
                  >
                    <FileIcon />
                    Add files
                  </button>
                  <button
                    type="button"
                    onClick={startAddUrl}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700"
                  >
                    <LinkIcon />
                    Add web URL
                  </button>
                  <div className="my-1 border-t border-neutral-700" />
                  <button
                    type="button"
                    onClick={insertChatWithDocPhrase}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700"
                  >
                    <DocMsgIcon />
                    Chat with the document
                  </button>
                  <button
                    type="button"
                    onClick={insertVerifyClaimPhrase}
                    className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-neutral-200 hover:bg-neutral-700"
                  >
                    <ShieldIcon />
                    Verify a claim
                  </button>
                </div>
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder="Ask anything"
              disabled={disabled}
              className="max-h-40 flex-1 resize-none bg-transparent py-1.5 text-sm text-neutral-100 placeholder-neutral-500 outline-none disabled:opacity-60"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend}
              className={
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors " +
                (canSend
                  ? "bg-white text-black hover:bg-neutral-200"
                  : "cursor-not-allowed bg-neutral-700 text-neutral-500")
              }
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default InputBox;
