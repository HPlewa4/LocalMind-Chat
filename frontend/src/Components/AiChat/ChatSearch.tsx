import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { ChatSearchProps } from '../../types/AiChat';


export default function ChatSearch({ 
  sessions, 
  onFilteredSessions, 
  placeholder = "Search chats..." 
}: ChatSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter sessions based on search query
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) {
      return sessions;
    }

    const query = searchQuery.toLowerCase();
    return sessions.filter(session => 
      session.title?.toLowerCase().includes(query) || 
      (!session.title && 'untitled chat'.includes(query))
    );
  }, [sessions, searchQuery]);

  // Update parent component with filtered results whenever they change
  React.useEffect(() => {
    onFilteredSessions(filteredSessions);
  }, [filteredSessions, onFilteredSessions]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="relative mb-0">
      <div className="relative">
        <Search 
          size={16} 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            title="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Search results indicator */}
      {searchQuery && (
        <div className="text-xs text-gray-400 mt-1 px-1">
          {filteredSessions.length === 0 
            ? "No chats found" 
            : `${filteredSessions.length} chat${filteredSessions.length === 1 ? '' : 's'} found`
          }
        </div>
      )}
    </div>
  );
}