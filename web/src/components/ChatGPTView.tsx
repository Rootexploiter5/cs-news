"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Maximize2,
  RefreshCw,
  Zap,
  Lock,
  Flame,
  Factory
} from "lucide-react";
import { ChatMessage, ThreatArticle } from "@/types/threat";

interface ChatGPTViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onOpenModal: (article: ThreatArticle) => void;
  onRegenerateLast?: () => void;
}

export default function ChatGPTView({
  messages,
  onSendMessage,
  isLoading,
  onOpenModal,
  onRegenerateLast,
}: ChatGPTViewProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openSources, setOpenSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const suggestedPrompts = [
    {
      title: "Active VPN Gateway Exploits",
      desc: "What vulnerabilities affected VPNs and edge appliances this week?",
      prompt: "What vulnerabilities affected VPNs and edge appliances this week?",
      icon: Zap,
      color: "text-amber-400 bg-amber-950/40 border-amber-500/30",
    },
    {
      title: "LockBit Ransomware Activity",
      desc: "Summarize recent LockBit campaigns, targets, and attack vectors",
      prompt: "Summarize recent LockBit ransomware campaigns, targets, and attack vectors.",
      icon: Lock,
      color: "text-red-400 bg-red-950/40 border-red-500/30",
    },
    {
      title: "Critical RCE Zero-Days",
      desc: "Identify critical unauthenticated remote code execution zero-days (Sev >= 9)",
      prompt: "Identify critical unauthenticated remote code execution zero-days with severity >= 9.",
      icon: Flame,
      color: "text-orange-400 bg-orange-950/40 border-orange-500/30",
    },
    {
      title: "Industrial & ICS Advisories",
      desc: "Correlate recent Siemens, CISA, and industrial control systems threats",
      prompt: "Correlate recent Siemens, CISA, and industrial control systems threats.",
      icon: Factory,
      color: "text-cyan-400 bg-cyan-950/40 border-cyan-500/30",
    },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;
    onSendMessage(text);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleSources = (msgId: string) => {
    setOpenSources((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  return (
    <div className="relative flex flex-1 flex-col h-full overflow-hidden bg-slate-950">
      {/* Scrollable Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 pb-36 pt-4">
        {messages.length === 0 ? (
          /* Empty / Hero State (ChatGPT style) */
          <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center text-center px-4">
            {/* Glowing Logo */}
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 shadow-xl shadow-cyan-500/10">
              <Sparkles className="h-8 w-8 animate-pulse" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              What threat intelligence can I investigate?
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-lg">
              Sentinel AI queries 768-dimensional vector embeddings across live cybersecurity feeds using PostgreSQL with pgvector.
            </p>

            {/* 2x2 Suggested Cards */}
            <div className="mt-8 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 text-left">
              {suggestedPrompts.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => handleSend(item.prompt)}
                    className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-900/60 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 hover:shadow-lg"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className={`flex h-6 w-6 items-center justify-center rounded-md border ${item.color}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 transition">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Conversation Message Stream */
          <div className="mx-auto max-w-3xl space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const hasSources = msg.sources && msg.sources.length > 0;
              const isSourcesOpen = openSources[msg.id] ?? false;

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {/* Bot Avatar */}
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400 mt-1 shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  {/* Message Bubble / Container */}
                  <div className={`max-w-[88%] ${isUser ? "" : "flex-1 space-y-3"}`}>
                    {isUser ? (
                      <div className="rounded-2xl bg-slate-800 px-4 py-2.5 text-sm leading-relaxed text-white shadow-sm border border-slate-700/60">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 sm:p-5 text-sm text-slate-200 space-y-3 shadow-md">
                        {/* Markdown / Response Text */}
                        <div className="whitespace-pre-wrap leading-relaxed space-y-2 font-normal">
                          {msg.content}
                        </div>

                        {/* Semantic Sources Accordion */}
                        {hasSources && (
                          <div className="mt-4 border-t border-slate-800/80 pt-3">
                            <button
                              onClick={() => toggleSources(msg.id)}
                              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition"
                            >
                              <ShieldAlert className="h-3.5 w-3.5" />
                              <span>{msg.sources!.length} Semantically Retrieved Intelligence Reports (pgvector)</span>
                              {isSourcesOpen ? (
                                <ChevronUp className="h-3.5 w-3.5" />
                              ) : (
                                <ChevronDown className="h-3.5 w-3.5" />
                              )}
                            </button>

                            {isSourcesOpen && (
                              <div className="mt-3 space-y-2">
                                {msg.sources!.map((source, sIdx) => (
                                  <div
                                    key={source.id || sIdx}
                                    className="rounded-xl border border-slate-800 bg-slate-950/70 p-3 text-xs space-y-1.5"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-semibold text-slate-100 line-clamp-1">
                                        [{sIdx + 1}] {source.title}
                                      </span>
                                      <span className="shrink-0 rounded bg-red-950/70 px-1.5 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/30">
                                        SEV {source.severity}/10
                                      </span>
                                    </div>

                                    <p className="text-slate-400 text-[11px] line-clamp-2">
                                      {source.summary}
                                    </p>

                                    <div className="flex items-center justify-between pt-1 text-[11px]">
                                      <span className="text-slate-500">
                                        Actor: <strong className="text-slate-300">{source.threat_actor}</strong>
                                      </span>

                                      <button
                                        onClick={() => onOpenModal(source)}
                                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-medium"
                                      >
                                        <Maximize2 className="h-3 w-3" />
                                        <span>Read Full Report In-UI</span>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Bottom Actions Row */}
                        <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[11px] text-slate-500">
                          <span>{msg.timestamp}</span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(msg.id, msg.content)}
                              className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-800 hover:text-slate-300 transition"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  <span className="text-emerald-400">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3.5 w-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            {onRegenerateLast && (
                              <button
                                onClick={onRegenerateLast}
                                className="flex items-center gap-1 rounded px-2 py-1 hover:bg-slate-800 hover:text-slate-300 transition"
                                title="Regenerate"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                                <span>Retry</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-300 mt-1">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator (ChatGPT Pulse) */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400">
                  <Bot className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2.5">
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
                    <span>Retrieving semantically correlated threats via pgvector...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Floating Bottom Prompt Bar (Exact ChatGPT style) */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-8 pb-4">
        <div className="mx-auto max-w-3xl px-4 pointer-events-auto">
          <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900/90 shadow-2xl backdrop-blur-md p-2 transition focus-within:border-slate-500">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={handleInputResize}
              onKeyDown={handleKeyDown}
              placeholder="Ask Sentinel AI about vulnerabilities, threat actors, zero-days, or campaigns..."
              disabled={isLoading}
              className="w-full resize-none bg-transparent px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none disabled:opacity-50 max-h-40 leading-relaxed"
            />

            <div className="flex items-center justify-between px-2 pt-1 border-t border-slate-800/60 mt-1 text-xs">
              <span className="text-[11px] text-slate-500 flex items-center gap-1">
                <span>Model:</span>
                <strong className="text-cyan-400">Sentinel AI (768d RAG)</strong>
              </span>

              <button
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:bg-slate-200 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed transition shadow-sm"
                title="Send Message (Enter)"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <p className="mt-2 text-center text-[10px] text-slate-500">
            Sentinel AI correlates threat feeds via PostgreSQL pgvector. Verify indicators of compromise with operational SIEM logs.
          </p>
        </div>
      </div>
    </div>
  );
}

