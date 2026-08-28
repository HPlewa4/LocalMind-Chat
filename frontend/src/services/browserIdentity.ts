const BROWSER_ID_STORAGE_KEY = "localmind-browser-id";

export const getBrowserId = (): string => {
  let browserId = window.localStorage.getItem(BROWSER_ID_STORAGE_KEY);

  if (!browserId) {
    browserId = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    window.localStorage.setItem(BROWSER_ID_STORAGE_KEY, browserId);
  }

  return browserId;
};

export const apiFetch = (path: string, init: RequestInit = {}) => {
  const headers = new Headers(init.headers);
  headers.set("X-Chat-Browser-Id", getBrowserId());

  return fetch(path, { ...init, headers });
};
