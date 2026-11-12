"use client";

import React, { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import ChatGPTView from "@/components/ChatGPTView";
import ThreatFeedView from "@/components/ThreatFeedView";
import ThreatDetailModal from "@/components/ThreatDetailModal";
import { ThreatArticle, ThreatStats, ChatMessage } from "@/types/threat";
import { ChatSession } from "@/types/chat";

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<"chat" | "feed">("chat");

  // Threat Feed State
  const [articles, setArticles] = useState<ThreatArticle[]>([]);
  const [stats, setStats] = useState<ThreatStats>({
    totalThreats: 0,
    criticalCount: 0,
    activeCves: 0,
    threatActorsCount: 0,
  });
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState(0);
  const [sourceFilter, setSourceFilter] = useState("all");

  // In-UI Dossier Modal State
  const [selectedArticle, setSelectedArticle] = useState<ThreatArticle | null>(null);

  // ChatGPT Sessions State
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: "session-default",
      title: "Threat Intelligence Briefing",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-default");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Load chat sessions from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sentinel_chat_sessions");
      if (saved) {
        const parsed: ChatSession[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setActiveSessionId(parsed[0].id);
        }
      }
    } catch (e) {
      console.warn("Failed to restore chat sessions from localStorage", e);
    }
  }, []);

  // Save chat sessions to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem("sentinel_chat_sessions", JSON.stringify(sessions));
    } catch (e) {
      console.warn("Failed to persist chat sessions", e);
    }
  }, [sessions]);

  // Fetch Threat Feed Data
  const fetchThreatData = useCallback(async () => {
    setIsLoadingFeed(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("search", searchQuery);
      if (severityFilter > 0) params.set("severity_min", severityFilter.toString());
      if (sourceFilter && sourceFilter !== "all") params.set("source", sourceFilter);

      const res = await fetch(`/api/feed?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setArticles(data.articles || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error("Failed to load threat intelligence feed:", err);
    } finally {
      setIsLoadingFeed(false);
    }
  }, [searchQuery, severityFilter, sourceFilter]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchThreatData();
    }, 250);
    return () => clearTimeout(handler);
  }, [fetchThreatData]);

  // Get current active session
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Send message in current active session
  const handleSendMessage = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isAiLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Update session title on first message
    const isFirstMessage = !activeSession.messages || activeSession.messages.length === 0;
    const newTitle = isFirstMessage
      ? trimmed.length > 36
        ? trimmed.substring(0, 33) + "..."
        : trimmed
      : activeSession.title;

    // Append user message immediately
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            title: newTitle,
            messages: [...(s.messages || []), userMessage],
            updatedAt: new Date().toISOString(),
          };
        }
        return s;
      })
    );

    setIsAiLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await res.json();

      if (res.ok && data.reply) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          sources: data.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setSessions((prev) =>
          prev.map((s) => {
            if (s.id === activeSessionId) {
              return {
                ...s,
                messages: [...(s.messages || []), assistantMessage],
                updatedAt: new Date().toISOString(),
              };
            }
            return s;
          })
        );
      } else {
        throw new Error(data.error || "RAG engine failed to generate answer.");
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `⚠️ **Error querying Sentinel AI:** ${err.message || "Failed to reach AI pipeline."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...(s.messages || []), errorMessage],
              updatedAt: new Date().toISOString(),
            };
          }
          return s;
        })
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // Create New Chat Session (ChatGPT Style)
  const handleNewChat = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newSessionId,
      title: "New Investigation",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSessionId);
    setActiveView("chat");
  };

  // Delete Chat Session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== id);
      if (filtered.length === 0) {
        const fallback: ChatSession = {
          id: `session-${Date.now()}`,
          title: "New Investigation",
          messages: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setActiveSessionId(fallback.id);
        return [fallback];
      }
      if (activeSessionId === id) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Ask Chat from a ThreatCard action
  const handleAskChatFromCard = (article: ThreatArticle) => {
    const prompt = `Analyze this security incident: "${article.title}" (Severity: ${article.severity}/10, Actor: ${article.threat_actor}). What are the key indicators of compromise, affected systems, and recommended triage mitigations?`;
    handleNewChat();
    setTimeout(() => {
      handleSendMessage(prompt);
    }, 100);
  };

  // Quick navigation filter selection
  const handleSelectViewWithFilter = (view: "chat" | "feed", filter?: string) => {
    setActiveView(view);
    if (view === "feed") {
      if (filter === "critical") {
        setSeverityFilter(8);
        setSearchQuery("");
      } else if (filter === "cve") {
        setSeverityFilter(0);
        setSearchQuery("CVE");
      } else {
        setSeverityFilter(0);
        setSearchQuery("");
      }
    }
  };

  // Hotkey for New Chat (Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* ChatGPT Collapsible Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(false)}
        activeView={activeView}
        onSelectView={handleSelectViewWithFilter}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => setActiveSessionId(id)}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        threatCount={stats.totalThreats}
        criticalCount={stats.criticalCount}
        cveCount={stats.activeCves}
      />

      {/* Main Workspace Area (Offsets when sidebar is open) */}
      <div
        className={`flex flex-1 flex-col h-full overflow-hidden transition-all duration-200 ${
          isSidebarOpen ? "md:pl-72" : "pl-0"
        }`}
      >
        {/* Top Navbar */}
        <Navbar
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          activeView={activeView}
          onSelectView={(v) => setActiveView(v)}
          onNewChat={handleNewChat}
          threatCount={stats.totalThreats}
        />

        {/* View Switcher: ChatGPT AI Analyst vs Live Threat Feed */}
        <div className="relative flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
          {activeView === "chat" ? (
            <ChatGPTView
              messages={activeSession.messages || []}
              onSendMessage={handleSendMessage}
              isLoading={isAiLoading}
              onOpenModal={(art) => setSelectedArticle(art)}
              onRegenerateLast={() => {
                const userMsgs = (activeSession.messages || []).filter((m) => m.role === "user");
                if (userMsgs.length > 0) {
                  const lastUser = userMsgs[userMsgs.length - 1];
                  handleSendMessage(lastUser.content);
                }
              }}
            />
          ) : (
            <ThreatFeedView
              articles={articles}
              stats={stats}
              isLoading={isLoadingFeed}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              severityFilter={severityFilter}
              setSeverityFilter={setSeverityFilter}
              sourceFilter={sourceFilter}
              setSourceFilter={setSourceFilter}
              onRefresh={fetchThreatData}
              onAskChat={handleAskChatFromCard}
              onOpenModal={(art) => setSelectedArticle(art)}
            />
          )}
        </div>
      </div>

      {/* Full Threat Intelligence Dossier Modal (In-UI, Zero External Navigation) */}
      <ThreatDetailModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onAskChat={handleAskChatFromCard}
      />
    </div>
  );
}
