// // src/app/page.js
// "use client";
// import { useState } from "react";

// export default function Home() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     setError(""); // Clear previous errors if any
//     setMessages((prev) => [...prev, { role: "user", content: input }, { role: "assistant", content: "" }]);
//     setLoading(true);
//     try {
//       const res = await fetch("/api/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: input }),
//       });

//       if (!res.ok || !res.body) {
//         throw new Error("Failed to get response from server.");
//       }

//       const reader = res.body.getReader();
//       const decoder = new TextDecoder();
//       let assistantMessage = "";

//       while (true) {
//         const { value, done } = await reader.read();
//         if (done) break;
//         assistantMessage += decoder.decode(value, { stream: true });

//         setMessages((prev) => {
//           const updated = [...prev];
//           updated[updated.length - 1].content = assistantMessage;
//           return updated;
//         });
//       }
//     } catch (err) {
//       setError(err.message || "An unexpected error occurred.");
//       setMessages((prev) => {
//         const updated = [...prev];
//         updated[updated.length - 1].content = "[Error: " + (err.message || "Unknown error") + "]";
//         return updated;
//       });
//       console.error("Send error:", err);
//     } finally {
//       setLoading(false);
//       setInput("");
//     }
//   };

//   return (
//     <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
//       <h1>Streaming AI Chatbot 🤖</h1>
//       <div style={{ border: "1px solid #ccc", padding: "10px", height: "400px", overflowY: "auto" }}>
//         {messages.map((m, i) => (
//           <p key={i}>
//             <b>{m.role}:</b> {m.content}
//           </p>
//         ))}
//         {loading && <p><i>Thinking...</i></p>}
//       </div>
//       <input
//         style={{ width: "80%" }}
//         value={input}
//         onChange={(e) => setInput(e.target.value)}
//         placeholder="Ask me something..."
//       />
//       <button style={{ width: "18%" }} onClick={sendMessage} disabled={loading}>
//         Send
//       </button>
//     </div>
//   );
// }

// // src/app/page.js
// 'use client';

// import { useState, useEffect, useRef } from 'react';
// import { PaperAirplaneIcon, SunIcon, MoonIcon, TrashIcon } from '@heroicons/react/24/outline';

// export default function Home() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   const [isDarkMode, setIsDarkMode] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const chatRef = useRef(null);

//   useEffect(() => {
//     if (chatRef.current) {
//       chatRef.current.scrollTop = chatRef.current.scrollHeight;
//     }
//   }, [messages]);

//   useEffect(() => {
//     // Apply dark mode to the root element for better theme management
//     if (isDarkMode) {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   }, [isDarkMode]);

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     const userMessage = { role: 'user', content: input };
//     setMessages((prev) => [...prev, userMessage]);
//     setInput('');
//     setIsLoading(true);

//     try {
//       const res = await fetch('/api/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: input }),
//       });

//       const reader = res.body.getReader();
//       const decoder = new TextDecoder();
//       let aiResponse = '';

//       setMessages((prev) => [...prev, { role: 'ai', content: '', isStreaming: true }]);

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;
//         aiResponse += decoder.decode(value);
//         setMessages((prev) =>
//           prev.map((msg, idx) =>
//             idx === prev.length - 1 ? { ...msg, content: aiResponse } : msg
//           )
//         );
//       }

//       setMessages((prev) =>
//         prev.map((msg, idx) =>
//           idx === prev.length - 1 ? { ...msg, isStreaming: false } : msg
//         )
//       );
//     } catch (err) {
//       setMessages((prev) => [
//         ...prev,
//         { role: 'error', content: 'Error: Failed to fetch response. Try again.' },
//       ]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const clearChat = () => {
//     setMessages([]);
//   };

//   const toggleTheme = () => {
//     setIsDarkMode((prev) => !prev);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   return (
//     <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter transition-colors duration-300">
//       <header className="fixed top-0 w-full h-16 flex justify-between items-center px-6 bg-white dark:bg-gray-800 shadow-lg z-10">
//         <div className="text-2xl font-bold tracking-tight">AI Chat</div>
//         <button
//           onClick={toggleTheme}
//           className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
//           aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
//         >
//           {isDarkMode ? (
//             <SunIcon className="w-6 h-6 text-yellow-400" />
//           ) : (
//             <MoonIcon className="w-6 h-6 text-gray-600" />
//           )}
//         </button>
//       </header>

//       <main
//         className="flex-1 max-w-4xl mx-auto mt-20 mb-24 px-4 sm:px-6 overflow-y-auto"
//         ref={chatRef}
//         role="log"
//         aria-live="polite"
//       >
//         {messages.length === 0 && (
//           <div className="text-center mt-10 text-gray-500 dark:text-gray-400">
//             <p className="text-lg">Start a conversation by typing below!</p>
//           </div>
//         )}
//         {messages.map((msg, idx) => (
//           <div
//             key={idx}
//             className={`my-3 p-4 rounded-xl max-w-[80%] sm:max-w-[70%] animate-slide-in ${
//               msg.role === 'user'
//                 ? 'ml-auto bg-blue-600 text-white'
//                 : msg.role === 'error'
//                 ? 'mr-auto bg-red-500 text-white'
//                 : 'mr-auto bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
//             } shadow-sm`}
//           >
//             {msg.content}
//             {msg.isStreaming && (
//               <span className="ml-2 inline-block animate-pulse text-gray-400">...</span>
//             )}
//           </div>
//         ))}
//         {isLoading && !messages[messages.length - 1]?.isStreaming && (
//           <div className="my-3 mr-auto animate-pulse text-gray-400">...</div>
//         )}
//       </main>

// <div className="fixed left-1/2 bottom-10 transform -translate-x-1/2 w-full max-w-4xl p-2 bg-white dark:bg-gray-800 shadow-[0_-4px_6px_rgba(0,0,0,0.1)] flex items-center gap-3 rounded-full">
//   <button
//     onClick={clearChat}
//     className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
//     aria-label="Clear chat"
//     disabled={!messages.length}
//   >
//     <TrashIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
//   </button>
//   <textarea
//     value={input}
//     onChange={(e) => setInput(e.target.value)}
//     onKeyDown={handleKeyPress}
//     placeholder="Type your message..."
//     className="flex-1 p-3 mx-0 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-700 focus:outline-none resize-none transition-all duration-200"
//     rows="1"
//     disabled={isLoading}
//   />
//   <button
//     onClick={sendMessage}
//     className="p-1 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white transition-colors duration-200"
//     disabled={!input.trim() || isLoading}
//     aria-label="Send message"
//   >
//     <PaperAirplaneIcon className="w-6 h-6" />
//   </button>
// </div>

// <footer className="text-center py-3 text-sm text-gray-500 dark:text-gray-400">
//         <a
//           href="https://x.ai/api"
//           target="_blank"
//           rel="noopener noreferrer"
//           className="hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
//         >
//           API Docs
//         </a>
//       </footer>

//     </div>
//   );
// }


'use client';

import { useState, useEffect, useRef } from 'react';
import { PaperAirplaneIcon, SunIcon, MoonIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
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

      setMessages((prev) => [...prev, { role: 'ai', content: '', isStreaming: true }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiResponse += decoder.decode(value);
        setMessages((prev) =>
          prev.map((msg, idx) =>
            idx === prev.length - 1 ? { ...msg, content: aiResponse } : msg
          )
        );
      }

      setMessages((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1 ? { ...msg, isStreaming: false } : msg
        )
      );
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'error', content: 'Error: Failed to fetch response. Try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-inter transition-colors duration-300">
      <header className="fixed top-0 w-full h-16 flex justify-between items-center px-6 bg-white dark:bg-gray-800 shadow-lg z-10">
        <div className="text-2xl font-bold tracking-tight">
  <img src="/KinChAT1.png" alt="KinGPT" className="w-24 hidden dark:block" />
  <img src="/kinchatdarkmode.png" alt="KinGPT" className="w-24 block dark:hidden" />
</div>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? (
            <SunIcon className="w-6 h-6 text-yellow-400" />
          ) : (
            <MoonIcon className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </header>

      <main
        className="flex-1 max-w-4xl mx-auto mt-20 mb-24 px-4 sm:px-6 overflow-y-auto"
        ref={chatRef}
        role="log"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <img src="/KinChAT1.png" alt="KinGPT Logo" className="w-48 hidden dark:block mb-4" />
            <img src="/kinchatdarkmode.png" alt="KinGPT Logo" className="w-48 block dark:hidden mb-4" />
            <p className="text-lg">Ask anything to start the conversation!</p>
          </div>
        )}
        {messages.length > 0 && (
          <>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`my-3 p-4 rounded-xl max-w-[80%] sm:max-w-[70%] animate-slide-in ${
                  msg.role === 'user'
                    ? 'ml-auto bg-blue-600 text-white'
                    : msg.role === 'error'
                    ? 'mr-auto bg-red-500 text-white'
                    : 'mr-auto bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                } shadow-sm`}
              >
                {msg.content}
                {msg.isStreaming && (
                  <span className="ml-2 inline-block animate-pulse text-gray-400">...</span>
                )}
              </div>
            ))}
            {isLoading && !messages[messages.length - 1]?.isStreaming && (
              <div className="my-3 mr-auto animate-pulse text-gray-400">...</div>
            )}
          </>
        )}
      </main>

      <div className="fixed left-1/2 bottom-10 transform -translate-x-1/2 w-full max-w-4xl p-2 bg-white dark:bg-gray-800 shadow-[0_-4px_6px_rgba(0,0,0,0.1)] flex items-center gap-3 rounded-full">
        <button
          onClick={clearChat}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
          aria-label="Clear chat"
          disabled={!messages.length}
        >
          <TrashIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
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
          className="p-1 rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white transition-colors duration-200"
          disabled={!input.trim() || isLoading}
          aria-label="Send message"
        >
          <PaperAirplaneIcon className="w-6 h-6" />
        </button>
      </div>

      <footer className="text-center py-3 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
        <p>© 2025 KinGPT. All rights reserved.</p>
      </footer>
    </div>
  );
}