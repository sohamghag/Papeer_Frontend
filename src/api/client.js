const BASE = "/api";

export async function createSession() {
  const res = await fetch(`${BASE}/session`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export async function sendChat(sessionId, message) {
  const res = await fetch(`${BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, message }),
  });
  if (!res.ok) throw new Error("Failed to send message");
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

export async function uploadFile(sessionId, file) {
  const formData = new FormData();
  formData.append("session_id", sessionId);
  formData.append("file", file);

  const res = await fetch(`${BASE}/upload`, {
    method: "POST",
    body: formData, // no Content-Type header — browser sets multipart boundary automatically
  });
  if (!res.ok) throw new Error("Failed to upload file");
  return res.json();
}

export async function getDocuments(sessionId) {
  const res = await fetch(`${BASE}/documents/${sessionId}`);
  if (!res.ok) throw new Error("Failed to load documents");
  return res.json();
}

export async function loadUrl(sessionId, url) {
  const res = await fetch(`${BASE}/load-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, url }),
  });
  if (!res.ok) throw new Error("Failed to load URL");
  return res.json();
}
