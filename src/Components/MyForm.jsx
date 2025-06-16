import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./MyForm.css";
import { auth } from "../firebase";
import Cookies from "js-cookie";
import { signOut, onAuthStateChanged } from "firebase/auth";

function MyForm() {
  const messagesEndRef = useRef(null);
  const handleLogout = () => {
    signOut(auth).then(() => {
      Cookies.remove("user");
      window.location.reload();
    });
  };

  const [userName, setUserName] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("theme");
    console.log("Loaded theme from localStorage:", stored);
    return stored === "dark";
  });

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem("chatHistory");
    console.log("Loaded history from localStorage:", saved);
    return saved ? JSON.parse(saved) : [];
  });

  const [question, setQuestion] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const displayName = user.displayName || user.email || "User";
        setUserName(displayName.split("@")[0]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("chatHistory", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";
    localStorage.setItem("theme", theme);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
  }, [darkMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleTheme = () => setDarkMode((prev) => !prev);

 const handleAsk = async (e) => {
  e.preventDefault();
  if (!question.trim()) return;
  setLoading(true);

  try {
    const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/ask`, { question });

    const data = res?.data;
    console.log("✅ Raw API Response:", JSON.stringify(data, null, 2));

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
      "⚠️ Could not extract model response.";

    console.log("🧪 Extracted Text:", text);

    setHistory((prev) => [...prev, { question, answer: text }]);
  } catch (error) {
    console.error("❌ API Error:", error?.response?.data || error.message);
    setHistory((prev) => [
      ...prev,
      {
        question,
        answer: "❌ Error getting response from API. Please try again."
      }
    ]);
  } finally {
    setQuestion("");
    setLoading(false);
  }
};


  const handleNewChat = () => {
    setHistory([]);
    setQuestion("");
  };

  return (
    <div className="dashboard-wrapper">
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <div className="sidebar-top">
            <div className="user-info">
              <h3>👤 {userName}</h3>
            </div>
            <button className="sidebar-close-btn" onClick={toggleSidebar}>✖</button>
          </div>
          <button onClick={handleNewChat} className="new-chat-btn">+ New Chat</button>
        </div>

        <nav className="history-list">
          {history.length === 0 && <p className="no-history">No chats yet. Start a new chat!</p>}
          {history.map((item, idx) => (
            <div key={idx} className="history-item" title={item.question}>
              {item.question.length > 40 ? item.question.slice(0, 40) + "..." : item.question}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="auth-button logout-button" onClick={handleLogout}>
            🔓 Logout
          </button>
        </div>
      </aside>

      <main className="main-chat">
        <header className="main-header">
          <div className="header-left">
            <button className="sidebar-toggle-btn" onClick={toggleSidebar}>☰</button>
            <span><h2 style={{ color: "#ffffff" }}>Hrushi AI✨</h2></span>
          </div>
          <div className="header-right">
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </header>

        <div className="chat-messages">
          {history.map((item, idx) => (
            <div key={idx}>
              <div className="message user"><strong>👤:</strong> {item.question}</div>
              <div className="message bot"><strong>Hrushi:</strong> {item.answer}</div>
            </div>
          ))}
          {loading && (
            <div className="message bot"><strong>Hrushi:</strong> <em>Thinking..</em></div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="form" onSubmit={handleAsk}>
          <input
            type="text"
            className="input"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask something to Hrushi.."
          />
          <button className="button" type="submit">Ask</button>
        </form>
      </main>
    </div>
  );
}

export default MyForm;
