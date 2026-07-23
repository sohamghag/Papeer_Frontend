import { useState, useEffect, useRef } from "react";
import { verifyKeys } from "../api/client";
import { getApiKeys, saveApiKey, removeApiKey } from "../utils/apiKeys";

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

const PROVIDER_LABELS = {
  openai: "OpenAI API Key",
  kimi: "Kimi API Key",
};

function KeyField({ provider }) {
  const [value, setValue] = useState("");
  const [saved, setSaved] = useState(false);
  const [show, setShow] = useState(false);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const { openaiKey, kimiKey } = getApiKeys();
    const existing = provider === "openai" ? openaiKey : kimiKey;
    if (existing) {
      setValue(existing);
      setSaved(true);
    }
  }, [provider]);

  const handleSave = async () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    setVerifying(true);
    setError(null);
    try {
      const result = await verifyKeys(
        provider === "openai" ? trimmed : undefined,
        provider === "kimi" ? trimmed : undefined,
      );
      const valid =
        provider === "openai" ? result.openai_valid : result.kimi_valid;
      const errMsg =
        provider === "openai" ? result.openai_error : result.kimi_error;
      if (valid) {
        saveApiKey(provider, trimmed);
        setSaved(true);
        setShow(false);
      } else {
        setError(errMsg || "This key doesn't seem to be valid.");
      }
    } catch {
      setError(
        "Couldn't reach the server to verify this key. Please try again.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleRemove = () => {
    removeApiKey(provider);
    setValue("");
    setSaved(false);
    setShow(false);
    setError(null);
  };

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-400">
        {PROVIDER_LABELS[provider]}
      </p>
      <div className="flex items-center gap-2">
        <input
          type={saved && !show ? "password" : "text"}
          value={saved && !show ? "••••••" : value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={saved}
          placeholder="Paste your key here"
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 outline-none disabled:opacity-60"
        />
        {saved && (
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="shrink-0 rounded-lg border border-neutral-700 px-3 py-2 text-xs text-neutral-200 hover:bg-neutral-700"
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {saved && (
        <p className="mt-1.5 text-xs text-neutral-500">
          Stored only on this device, never synced or logged.
        </p>
      )}
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={verifying || !value.trim() || saved}
          className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {verifying ? "Verifying…" : "Save key"}
        </button>
        {saved && (
          <button
            type="button"
            onClick={handleRemove}
            className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs text-red-400 hover:bg-neutral-700"
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
}

export default function ApiKeysModal({ open, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        ref={modalRef}
        className="w-full max-w-md rounded-xl border border-neutral-700 bg-neutral-800 p-5 shadow-lg"
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-100">API Keys</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-700 hover:text-neutral-100"
            aria-label="Close"
          >
            <XIcon />
          </button>
        </div>
        <p className="mb-4 text-xs text-neutral-400">
          Use your own OpenAI and Kimi API keys instead of the app's default.
          Falls back to the app's key if left empty.
        </p>

        <div className="space-y-5">
          <KeyField provider="openai" />
          <KeyField provider="kimi" />
        </div>
      </div>
    </div>
  );
}
