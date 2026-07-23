// Stores the user's own OpenAI/Kimi API keys locally in the browser only —
// never sent anywhere except as part of a request the user is already making.
const STORAGE_KEYS = {
  openai: "papeer_openai_key",
  kimi: "papeer_kimi_key",
};

export function getApiKeys() {
  return {
    openaiKey: localStorage.getItem(STORAGE_KEYS.openai) || "",
    kimiKey: localStorage.getItem(STORAGE_KEYS.kimi) || "",
  };
}

export function saveApiKey(provider, value) {
  localStorage.setItem(STORAGE_KEYS[provider], value);
}

export function removeApiKey(provider) {
  localStorage.removeItem(STORAGE_KEYS[provider]);
}
