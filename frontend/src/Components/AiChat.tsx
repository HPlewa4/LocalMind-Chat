import React from 'react'
import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { useAutoScroll } from '../hooks/useAutoScroll';
import { Messages, Session } from '../types/AiChat';
import { generateId, getTimestamp } from '../utils/AiChatHelpers';
import { API_URL, nameChat, loadSessions, loadMessages, changeTimestamp } from '../services/AiApiCalls';
import { apiFetch } from '../services/browserIdentity';
import ChatInput from './AiChat/ChatInput';
import ChatSidebar from './AiChat/ChatSidebar';
import { useToast } from '../contexts/ToastContext';
export default function AiChat() {

  const [question, setQuestion] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [editingSessionId, setEditingSessionId] = useState<string>("");
  const [editTitle, setEditTitle] = useState<string>("");
  
  // minimal session management
  const [currentSessionTitle, setCurrentSessionTitle] = useState<string>("");
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => 
    Date.now().toString() + Math.random().toString(36).substr(2, 9)
  );
  const [sessions, setSessions] = useState<Session[]>([]);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const scrollRef = useAutoScroll(messages);
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  const ToastFunctions = { showSuccess, showError, showWarning, showInfo };
  
  const askAI = async () => {
  if (!question.trim()) {
    showWarning("Please enter a message");
    return;
  }
  
  setLoading(true);
  let sessionId = currentSessionId;
  let isNewSession = false;

  // If no sessions exist, create one first
  if (sessions.length === 0 || !currentSessionTitle) {
    const newSessionId = generateId();
    const newTitle = `New Chat ${newSessionId}`;
    try {
      await apiFetch(`${API_URL}/chat/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: newSessionId,
          title: newTitle,
          created_at: getTimestamp(),
          timestamp: getTimestamp()
        }),
      });
      
      sessionId = newSessionId;
      isNewSession = true;
      setCurrentSessionId(newSessionId);
      setCurrentSessionTitle(newTitle);
      await loadSessions(setSessions);
      // Load messages for the new session (should be empty initially)
      await loadMessages(newSessionId, setMessages);
    } catch (error) {
      console.error("Failed to create session:", error);
      setLoading(false);
      return;
    }
  }

  const currentQuestion = question;
  setQuestion("");
  changeTimestamp(sessionId, setSessions);

  // Add user message to local state
    const userMessage: Messages = {
    message_id: generateId(),
    session_id: sessionId,
    role: "user",
    content: currentQuestion,
    timestamp: getTimestamp()
  };
  setMessages((prev) => [...prev, userMessage]);

  try {
    const res = await apiFetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: currentQuestion,
        session_id: sessionId,
        timestamp: Date.now().toString()
      }),
    });

    if (!res.ok) {
      showError("Failed to send message to AI");
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let accumulatedResponse = "";
           
    // Add initial assistant message
      const assistantMessage: Messages = {
      message_id: generateId(),
      session_id: sessionId,
      role: "assistant",
      content: "",
      timestamp: getTimestamp()
    };
    setMessages((prev) => [...prev, assistantMessage]);

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedResponse += chunk;
        const currentResponse = accumulatedResponse;
                   
        // Update the assistant message in place
        setMessages((prev) =>
           prev.map((msg) =>
             msg.message_id === assistantMessage.message_id
              ? { ...msg, content: currentResponse }
              : msg
          )
        );
      }
    }
  } catch (err) {
    console.error(err);
    showError("Error connecting to ai");
  } finally {
    setLoading(false);
           
    // Only sync with server after a delay to avoid race conditions
    setTimeout(async () => {
      await loadMessages(sessionId, setMessages);
               
      // Check if we should name the chat - only for new sessions with first message
      if (isNewSession || messages.length < 2) {
        const newTitle = await nameChat(currentQuestion, sessionId, ToastFunctions);
        if (newTitle) {
          setCurrentSessionTitle(newTitle);
          await loadSessions(setSessions);
        }
      }
    }, 1000);
  }
};

  const switchSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  useEffect(() => {
    loadSessions(setSessions);
  }, []);

  useEffect(() => {
    if (currentSessionId) {
      loadMessages(currentSessionId,setMessages);
    }
  }, [currentSessionId]);

  useEffect(() => {
    const session = sessions.find((item) => item.session_id === currentSessionId);
    if (session) {
      setCurrentSessionTitle(session.title || "Untitled Chat");
    }
  }, [currentSessionId, sessions]);

  return (
    <div className="h-[100vh] max-h-[100vh] flex bg-black text-white">
      <ChatSidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        sessions={sessions}
        setSessions={setSessions}
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        currentSessionTitle={currentSessionTitle}
        setCurrentSessionTitle={setCurrentSessionTitle}
        editingSessionId={editingSessionId}
        setEditingSessionId={setEditingSessionId}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        switchSession={switchSession}
        setMessages={setMessages}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-gray-900 border-b border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
      
              {sidebarCollapsed && (
                <button
                  onClick={() => setSidebarCollapsed(false)}
                  className="text-gray-400 hover:text-white p-1 rounded"
                  title="Show sidebar"
                >
                  <Menu size={20} />
                </button>
              )}
              <div>
                <h1 className="text-xl font-semibold">AI Chat</h1>
                <p className="text-sm text-gray-400">{currentSessionTitle}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages History */}
        <div className="h-full overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No messages yet. Start a conversation!
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg, index) => (
                <div
                  key={`${msg.message_id}-${index}`}
                  className={`p-4 rounded-lg max-w-[85%] ${
                    msg.role === "user" 
                      ? "bg-blue-600 ml-auto" 
                      : "bg-gray-700 mr-auto"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-sm">
                      {msg.role === "user" ? "You" : "AI"}
                    </span>
                    <span className="text-xs text-gray-300">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="break-words overflow-wrap-anywhere whitespace-pre-wrap">
                    {(msg.content.length === 0 && msg.role === "assistant" && index === messages.length - 1) ? "Thinking..." : msg.content}
                  </div>
                </div>
              ))}

              {/*Scroll target*/}
              <div ref={scrollRef} />
            </div>
          )}
        </div>

        <ChatInput
          question={question}
          setQuestion={setQuestion}
          loading={loading}
          askAI={askAI}
        />
      </div>
    </div>
  )
}
