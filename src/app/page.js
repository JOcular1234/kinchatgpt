// // // src/app/page.js
'use client';

import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, SunIcon, MoonIcon, TrashIcon, ChevronRightIcon, ChevronLeftIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('chatHistory');
    return saved ? JSON.parse(saved) : [];
  }
  return [];
});
  const [currentChatId, setCurrentChatId] = useState(null);

  // Persist history to localStorage whenever it changes
  /**
   * Saves the chat history to localStorage whenever it changes.
   *
   * @return {void}
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('chatHistory', JSON.stringify(history))
    }
  }, [history]);
  const chatRef = useRef(null);

  // Handler to delete a single chat history item
  const deleteHistoryItem = (id) => {
    setHistory((prev) => prev.filter((h) => h.id !== id));
    if (currentChatId === id) {
      setMessages([]);
      setCurrentChatId(null);
    }
  };

  // Handler to delete all chat history
  const deleteAllHistory = () => {
    setHistory([]);
    setMessages([]);
    setCurrentChatId(null);
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  // Dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  // Load history from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('chatHistory')) || [];
    setHistory(saved);
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(history));
  }, [history]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };

    // If new chat, create it automatically
    if (!currentChatId) {
      const newChatId = Date.now();
      const newChat = {
        id: newChatId,
        title: input.slice(0, 20) + '...',
        chat: [userMessage]
      };
      setHistory((prev) => [newChat, ...prev]);
      setCurrentChatId(newChatId);
      setMessages([userMessage]);
    } else {
      // Add message to current chat
      setMessages((prev) => [...prev, userMessage]);
      setHistory((prev) =>
        prev.map((item) =>
          item.id === currentChatId
            ? { ...item, chat: [...item.chat, userMessage] }
            : item
        )
      );
    }

    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';

      // Add placeholder for streaming
      setMessages((prev) => [...prev, { role: 'ai', content: '', isStreaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiResponse += decoder.decode(value);

        // Update last AI message
        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, content: aiResponse } : msg
          )
        );
      }

      // Stop streaming flag
      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, isStreaming: false } : msg
        )
      );

      // Save AI reply to history
      setHistory((prev) =>
        prev.map((item) =>
          item.id === currentChatId
            ? { ...item, chat: [...item.chat, { role: 'ai', content: aiResponse }] }
            : item
        )
      );

    } catch (err) {
      const errorMsg = { role: 'error', content: 'Error: Failed to fetch response. Try again.' };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (chatObj) => {
    setMessages(chatObj.chat);
    setCurrentChatId(chatObj.id);
  };

  const clearChat = () => {
    setMessages([]);
    setCurrentChatId(null);
  };

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter transition-colors duration-300">
      
      {/* Sidebar */}
      {isHistoryOpen && (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <div className="p-4 font-bold text-lg border-b dark:border-gray-700">
            History
          </div>
          <div className="flex-1 overflow-y-auto">
            {history.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No history yet</p>
            ) : (
              history.map((item) => (
                <div key={item.id} className="flex items-center group">
                  <button
                    onClick={() => loadFromHistory(item)}
                    className="flex-1 text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {item.title}
                  </button>
                  <button
                    onClick={() => deleteHistoryItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete this chat"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
          <button
            onClick={deleteAllHistory}
            className="p-4 text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Delete All History
          </button>
        </aside>
      )}

      {/* Vertical toggle button */}
      <button
        onClick={() => setIsHistoryOpen((prev) => !prev)}
        className="fixed top-1/2 left-0 -translate-y-1/2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 p-2 rounded-r-lg shadow-md z-20"
      >
        {isHistoryOpen ? (
          <ChevronLeftIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        ) : (
          <ChevronRightIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        )}
      </button>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="fixed top-0 w-full h-16 flex justify-between items-center px-6 bg-white dark:bg-gray-800 shadow-lg z-10">
          <div className="flex items-center gap-3">
            <img src="/kinChAT1.png" alt="kinchat" className="w-24 hidden dark:block" />
            <img src="/kinchatdarkmode.png" alt="kinchatdarkmode" className="w-24 block dark:hidden" />
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            {isDarkMode ? (
              <SunIcon className="w-6 h-6 text-white" />
            ) : (
              <MoonIcon className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </header>

        {/* Chat Area */}
        <main
          className="flex-1 max-w-4xl mx-auto mt-20 mb-24 px-4 sm:px-6 overflow-y-auto"
          ref={chatRef}
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
              <img src="/kinChAT1.png" alt="kinchat" className="w-48 hidden dark:block mb-4" />
              <img src="/kinchatdarkmode.png" alt="kinchatdarkmode" className="w-48 block dark:hidden mb-4" />
              <p className="text-lg">Ask anything to start the conversation!</p>
            </div>
          )}
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`my-3 p-4 rounded-xl max-w-[80%] sm:max-w-[70%] ${
                msg.role === 'user'
                  ? 'ml-auto bg-blue-600 text-white'
                  : msg.role === 'error'
                  ? 'mr-auto bg-red-500 text-white'
                  : 'mr-auto bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
              } shadow-sm`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>
              {msg.isStreaming && (
                <span className="ml-2 inline-block animate-pulse text-gray-400">...</span>
              )}
            </div>
          ))}
        </main>

        {/* Input Box */}
        <div className="fixed left-1/2 bottom-10 transform -translate-x-1/2 w-full max-w-4xl p-2 bg-white dark:bg-gray-800 shadow-[0_-4px_6px_rgba(0,0,0,0.1)] flex items-center gap-3 rounded-full">
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-3 mx-0 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:outline-none resize-none transition-all duration-200"
            rows="1"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            className="p-1 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white"
            disabled={!input.trim() || isLoading}
          >
            <PaperAirplaneIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Footer */}
        <footer className="text-center py-3 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
          <p>© 2025 KinGPT. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
