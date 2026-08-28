import { Messages, Session } from "../types/AiChat";
import { ToastFunctions } from "../types/ToastUsageTypes";
import { getTimestamp } from "../utils/AiChatHelpers";
import { apiFetch } from "./browserIdentity";

export const API_URL = (process.env.REACT_APP_API_URL || "http://localhost:8000").replace(/\/$/, "");

export const nameChat = async (
  questionText: string, 
  currentSessionId: string,
  toastFunctions: ToastFunctions
) => {
  try {
    const res = await apiFetch(`${API_URL}/chat/name`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: questionText,
        session_id: currentSessionId,
      }),
    });

    if (!res.ok) {
      toastFunctions.showError("Failed to name chat using AI");
      return null;
    }
    
    const data = await res.json();
    toastFunctions.showSuccess("Chat named successfully!");
    return data;
  } catch (err) {
    console.error(err);
    toastFunctions.showError("Error connecting to AI service");
    return null;
  }
};

export const loadMessages = async (
  currentSessionId: string, 
  setMessages: (messages: Messages[]) => void,
  toastFunctions?: ToastFunctions
) => {
  try {
    const res = await apiFetch(`${API_URL}/chat/session/${currentSessionId}/messages`);
    if (!res.ok) {
      throw new Error(`Failed to load messages (${res.status})`);
    }
    const data = await res.json();
    setMessages(Array.isArray(data.messages) ? data.messages : []);
  } catch (error) {
    console.error("Failed to load messages:", error);
    toastFunctions?.showError("Failed to load messages");
    setMessages([]);
  }
};

export const loadSessions = async (
  setSessions: (sessions: Session[]) => void,
  toastFunctions?: ToastFunctions
) => {
  try {
    const res = await apiFetch(`${API_URL}/chat/sessions`);
    if (!res.ok) {
      throw new Error(`Failed to load chat sessions (${res.status})`);
    }
    const data = await res.json();
    setSessions(Array.isArray(data.sessions) ? data.sessions : []);
  } catch (error) {
    console.error("Failed to load sessions:", error);
    toastFunctions?.showError("Failed to load chat sessions");
    setSessions([]);
  }
};

export const changeTimestamp = async (
  sessionId: string, 
  setSessions: (sessions: Session[]) => void,
  toastFunctions?: ToastFunctions
) => {
  try {
    const res = await apiFetch(`${API_URL}/chat/sessions/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timestamp: getTimestamp() }),
    });

    if (!res.ok) throw new Error("Failed to update session");

    // Sync with server (fresh sessions list)
    await loadSessions(setSessions, toastFunctions);

  } catch (error) {
    console.error("Failed to update session:", error);
    toastFunctions?.showError("Failed to update session timestamp");
  }
};
