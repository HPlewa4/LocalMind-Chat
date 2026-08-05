import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Save, X, ChevronLeft } from 'lucide-react';
import { Session } from '../../types/AiChat';
import { loadSessions, loadMessages } from '../../services/AiApiCalls';
import { generateId, getTimestamp } from '../../utils/AiChatHelpers';
import { ChatSidebarProps } from '../../types/AiChat';
import ChatSearch from './ChatSearch';
import { timeAgo } from '../../utils/AiChatHelpers';

export default function ChatSidebar({
  sidebarCollapsed,
  setSidebarCollapsed,
  sessions,
  setSessions,
  currentSessionId,
  setCurrentSessionId,
  currentSessionTitle,
  setCurrentSessionTitle,
  editingSessionId,
  setEditingSessionId,
  editTitle,
  setEditTitle,
  switchSession,
  setMessages,
}: ChatSidebarProps) {
  
  const [filteredSessions, setFilteredSessions] = useState<Session[]>(sessions);

  React.useEffect(() => {
    setFilteredSessions(sessions);
  }, [sessions]);

const createNewSession = async () => {
  const newSessionId = generateId();
  const newTitle = `New Chat`;
  
  try {
    await fetch("http://localhost:8000/chat/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: newSessionId,
        title: newTitle,
        created_at: getTimestamp(),
        timestamp: getTimestamp()
      }),
    });
    
    setCurrentSessionId(newSessionId);
    setCurrentSessionTitle(newTitle);
    setMessages([]);
    
    await loadSessions(setSessions);
  } catch (error) {
    console.error("Failed to create session:", error);
  }
};

const deleteSession = async (sessionId: string, e: React.MouseEvent) => {
  e.stopPropagation();
  try {
    await fetch(`http://localhost:8000/chat/sessions/${sessionId}`, {
      method: "DELETE",
    });
    
    const updatedSessions = sessions.filter((s) => s.session_id !== sessionId);
    setSessions(updatedSessions);

    // session switching logic
    if (updatedSessions.length === 0) {
      await createNewSession();
    } else if (sessionId === currentSessionId) {
      switchSession(updatedSessions[0].session_id);
    }
    
    await loadSessions(setSessions);
    loadMessages(currentSessionId, setMessages);
  } catch (error) {
    console.error("Failed to delete session:", error);
  }
};

  function cancelEditing() {
    setEditingSessionId("");
  }

  const saveEdit = async (sessionId: string, e: React.MouseEvent | null) => {
    e?.stopPropagation();
    try {
      setSessions((prev) =>
        prev.map((s) =>
          s.session_id === sessionId ? { ...s, title: editTitle } : s
        )
      );

      if (sessionId === currentSessionId) {
        setCurrentSessionTitle(editTitle);
      }

      const res = await fetch(`http://localhost:8000/chat/sessions/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, timestamp: getTimestamp() }),
      });

      if (!res.ok) throw new Error("Failed to update session");

      await loadSessions(setSessions);

    } catch (error) {
      console.error("Failed to update session:", error);
    } finally {
      setEditingSessionId("");
    }
  };

  function startEditTitle(sessionId: string, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingSessionId(sessionId);
    const session = sessions.find((s) => s.session_id === sessionId);
    setEditTitle(session?.title || "");
  }

  const keyPressName = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && editingSessionId) {
      saveEdit(editingSessionId, null);
    }
  };

  return (
    <div className={`bg-gray-900 border-r border-gray-700 transition-all duration-300 flex-shrink-0 ${
      sidebarCollapsed ? 'w-0' : 'w-80'
    }`}>
      <div className={`h-full flex flex-col ${sidebarCollapsed ? 'hidden' : 'block'}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">Chat Sessions</h3>
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="text-gray-400 hover:text-white p-1 rounded"
              title="Collapse sidebar"
            >
              <ChevronLeft size={20} />
            </button>
          </div>
          
          <button
            onClick={createNewSession}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition flex items-center justify-center gap-2 mb-3"
          >
            <Plus size={16} />
            New Chat
          </button>

          <ChatSearch 
            sessions={sessions}
            onFilteredSessions={setFilteredSessions}
            placeholder="Search chats..."
          />
        </div>

        {/* Sessions List */}
        <div className="flex-1 p-2 overflow-y-auto">
          {filteredSessions.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              {sessions.length === 0 ? "No sessions yet" : "No matching chats found"}
            </p>
          ) : (
            <div className="space-y-1">
              {filteredSessions.map((session) => (
                <div
                  key={session.session_id}
                  onClick={() => switchSession(session.session_id)}
                  className={`group p-3 cursor-pointer rounded-lg transition-colors ${
                    session.session_id === currentSessionId 
                      ? 'bg-blue-600 text-white' 
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  {editingSessionId !== session.session_id ? (
                    <>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="font-medium text-sm break-words overflow-wrap-anywhere">
                            {session.title || 'Untitled Chat'}
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            {timeAgo(session.timestamp)}
                          </div>
                        </div>
                        <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => startEditTitle(session.session_id, e)}
                            className="text-gray-400 hover:text-white p-1 rounded"
                            title="Edit title"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={(e) => deleteSession(session.session_id, e)}
                            className="text-gray-400 hover:text-red-400 p-1 rounded"
                            title="Delete session"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editTitle}
                        onKeyPress={keyPressName}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        autoFocus
                      />
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={(e) => saveEdit(session.session_id, e)}
                          className="text-green-400 hover:text-green-300 p-1 rounded"
                          title="Save"
                        >
                          <Save size={14} />
                        </button>
                        <button
                          onClick={cancelEditing}
                          className="text-red-400 hover:text-red-300 p-1 rounded"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
