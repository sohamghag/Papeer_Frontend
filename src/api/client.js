// const BASE = "/api";

const BASE = import.meta.env.VITE_API_BASE_URL;
// const BASE = "http://127.0.0.1:8000/api";

// Reads the backend's actual error message (FastAPI's {detail: "..."} body)
// instead of throwing a generic string that hides why a request failed.
// Attaches the HTTP status so callers can react to specific cases
// (e.g. 400 = missing API key) without string-matching the message.
async function throwApiError(res, fallbackMessage) {
  let detail = fallbackMessage;
  try {
    const body = await res.json();
    if (body?.detail) detail = body.detail;
  } catch {
    // response wasn't JSON — keep the fallback message
  }
  const err = new Error(detail);
  err.status = res.status;
  throw err;
}

export async function createSession() {
  const res = await fetch(`${BASE}/session`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function sendChat(sessionId, message, openaiKey, kimiKey) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      message,
      openai_api_key: openaiKey || null,
      kimi_api_key: kimiKey || null,
    }),
  });
  if (!res.ok) return throwApiError(res, "Failed to send message");
  return res.json();
}

export async function verifyKeys(openaiKey, kimiKey) {
  const res = await fetch(`${BASE}/keys/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      openai_api_key: openaiKey || null,
      kimi_api_key: kimiKey || null,
    }),
  });
  if (!res.ok) return throwApiError(res, "Failed to verify key");
  return res.json();
}

export async function getConversations() {
  const res = await fetch(`${BASE}/conversations`);
  if (!res.ok) throw new Error("Failed to load conversations");
  return res.json();
}

export async function getHistory(sessionId) {
  const res = await fetch(`${BASE}/history/${sessionId}`);
  if (!res.ok) throw new Error("Failed to load history");
  return res.json();
}

export async function deleteConversation(sessionId) {
  const res = await fetch(`${BASE}/conversations/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete conversation");
  return res.json();
}

export async function renameConversation(sessionId, title) {
  const res = await fetch(`${BASE}/conversations/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to rename conversation");
  return res.json();
}

export async function uploadFile(sessionId, file, openaiKey, kimiKey) {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("file", file);
  if (openaiKey) formData.append("openai_api_key", openaiKey);
  if (kimiKey) formData.append("kimi_api_key", kimiKey);

  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    body: formData, // no Content-Type header — browser sets multipart boundary automatically
  });
  if (!res.ok) return throwApiError(res, "Failed to upload file");
  return res.json();
}

export async function getDocuments(sessionId) {
  const res = await fetch(`${BASE}/documents/${sessionId}`);
  if (!res.ok) throw new Error("Failed to load documents");
  return res.json();
}

export async function loadUrl(sessionId, url, openaiKey, kimiKey) {
  const res = await fetch(`${BASE}/load-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      url,
      openai_api_key: openaiKey || null,
      kimi_api_key: kimiKey || null,
    }),
  });
  if (!res.ok) return throwApiError(res, "Failed to load URL");
  return res.json();
}
