"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, ExternalLink, ShieldAlert, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { ChatMessage, ThreatArticle } from "@/types/threat";

interface ChatBoxProps {
  initialPrompt?: string;
  onClearPrompt?: () => void;
}

export default function ChatBox({ initialPrompt, onClearPrompt }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "**Sentinel AI RAG Analyst Online.**\n\nI perform real-time semantic retrieval over ingested threat intelligence feeds using **PostgreSQL + pgvector (768-dim)**. Ask any question about recent vulnerabilities, campaigns, threat actors, or CVEs.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "What vulnerabilities affected VPNs recently?",
    "Summarize recent LockBit ransomware activity",
    "List critical RCE zero-days with CVEs",
    "What threat actors were active this week?",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialPrompt) {
      setInput(initialPrompt);
      if (onClearPrompt) onClearPrompt();
    }
  }, [initialPrompt, onClearPrompt]);

  const toggleSources = (msgId: string) => {
    setExpandedSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: queryText }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.reply,
          sources: data.sources || [],
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || "RAG engine failed to generate answer.");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ **Error querying Sentinel AI:** ${err.message || "Failed to reach AI pipeline."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: "Chat cleared. Ask a new threat intelligence question.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-slate-950 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/80 px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/30 text-cyan-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">Sentinel RAG Assistant</h2>
            <p className="text-[10px] text-cyan-400">Vector Cosine Similarity & Synthesizer</p>
          </div>
        </div>
        <button
          onClick={clearHistory}
          className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
          title="Clear Conversation"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Suggested Quick Queries (if few messages) */}
      {messages.length <= 2 && (
        <div className="border-b border-slate-800/80 bg-slate-900/30 p-2.5">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
            Suggested Threat Queries:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                disabled={loading}
                className="rounded-full border border-slate-800 bg-slate-900/90 px-2.5 py-1 text-[11px] text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 transition text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const hasSources = msg.sources && msg.sources.length > 0;
          const isSourcesOpen = expandedSources[msg.id] ?? false;

          return (
            <div key={msg.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-xs ${
                isUser
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "border border-slate-800 bg-slate-900/90 text-slate-200"
              }`}>
                {/* Content */}
                <div className="whitespace-pre-wrap leading-relaxed space-y-2">
                  {msg.content}
                </div>

                {/* Sources Section */}
                {hasSources && (
                  <div className="mt-3 border-t border-slate-800 pt-2">
                    <button
                      onClick={() => toggleSources(msg.id)}
                      className="flex items-center gap-1 text-[11px] font-medium text-cyan-400 hover:text-cyan-300 transition"
                    >
                      <span>{msg.sources!.length} Semantically Retrieved Sources (pgvector)</span>
                      {isSourcesOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>

                    {isSourcesOpen && (
                      <div className="mt-2 space-y-1.5 pl-1">
                        {msg.sources!.map((source, sIdx) => (
                          <div
                            key={source.id || sIdx}
                            className="rounded border border-slate-800/80 bg-slate-950/60 p-2 text-[11px]"
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-slate-200 line-clamp-1">
                                [{sIdx + 1}] {source.title}
                              </span>
                              <span className="shrink-0 rounded bg-red-950/60 px-1 py-0.2 text-[9px] font-bold text-red-400 border border-red-500/30">
                                SEV {source.severity}
                              </span>
                            </div>
                            <p className="mt-0.5 text-slate-400 line-clamp-2">{source.summary}</p>
                            <a
                              href={source.source_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline"
                            >
                              <span>View Raw Advisory</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className={`mt-1.5 text-[9px] ${isUser ? "text-cyan-200 text-right" : "text-slate-500"}`}>
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/90 px-3.5 py-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                <span>Calculating 768-dim cosine similarity in PostgreSQL...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 bg-slate-900/90 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about CVEs, threat actors, zero-days, or campaign trends..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-600 text-white hover:bg-cyan-500 disabled:opacity-50 transition"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
