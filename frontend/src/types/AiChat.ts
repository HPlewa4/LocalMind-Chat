import React from "react";

export interface Session {
  session_id: string;
  title?: string;
  created_at: string;
  timestamp: string;
}

export interface Messages {
  message_id: string
  session_id: string;
  role: 'user' | 'assistant';
  content:string;
  timestamp: string;
}

export interface ChatInputProps {
  question: string;
  setQuestion: (value: string) => void;
  loading: boolean;
  askAI: () => void;
}

export interface ChatSidebarProps {
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  sessions: Session[];
  setSessions: React.Dispatch<React.SetStateAction<Session[]>>;
  currentSessionId: string;
  setCurrentSessionId: (sessionId: string) => void;
  currentSessionTitle: string;
  setCurrentSessionTitle: (title: string) => void;
  editingSessionId: string;
  setEditingSessionId: (sessionId: string) => void;
  editTitle: string;
  setEditTitle: (title: string) => void;
  switchSession: (sessionId: string) => void;
  setMessages: React.Dispatch<React.SetStateAction<any[]>>;
}

export interface ChatSearchProps {
  sessions: Session[];
  onFilteredSessions: (filteredSessions: Session[]) => void;
  placeholder?: string;
}
