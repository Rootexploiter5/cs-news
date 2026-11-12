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
      gradient: "from-cyan-500/20 via-blue-500/10 to-transparent",
      border: "hover:border-cyan-500/50",
      iconColor: "text-cyan-400 bg-cyan-950/40 border-cyan-500/30",
    },
    {
      title: "LockBit Ransomware Activity",
      desc: "Summarize recent LockBit campaigns, targets, and attack vectors",
      prompt: "Summarize recent LockBit ransomware campaigns, targets, and attack vectors.",
      icon: Lock,
      gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
      border: "hover:border-purple-500/50",
      iconColor: "text-purple-400 bg-purple-950/40 border-purple-500/30",
    },
    {
      title: "Critical RCE Zero-Days",
      desc: "Identify critical unauthenticated remote code execution zero-days (Sev >= 9)",
      prompt: "Identify critical unauthenticated remote code execution zero-days with severity >= 9.",
      icon: Flame,
      gradient: "from-pink-500/20 via-red-500/10 to-transparent",
      border: "hover:border-pink-500/50",
      iconColor: "text-pink-400 bg-pink-950/40 border-pink-500/30",
    },
    {
      title: "Industrial & ICS Advisories",
      desc: "Correlate recent Siemens, CISA, and industrial control systems threats",
      prompt: "Correlate recent Siemens, CISA, and industrial control systems threats.",
      icon: Factory,
      gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
      border: "hover:border-emerald-500/50",
      iconColor: "text-emerald-400 bg-emerald-950/40 border-emerald-500/30",
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
    <div className="relative flex flex-1 flex-col h-full overflow-hidden bg-black text-slate-100">
      {/* Ambient Animated Gradient Glow Mesh in background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 h-[34rem] w-[34rem] rounded-full ambient-glow-cyan animate-pulse-glow blur-3xl opacity-60" />
        <div className="absolute top-1/4 -right-32 h-[38rem] w-[38rem] rounded-full ambient-glow-purple animate-pulse-glow blur-3xl opacity-50" />
        <div className="absolute -bottom-32 left-1/4 h-[32rem] w-[32rem] rounded-full ambient-glow-crimson animate-pulse-glow blur-3xl opacity-40" />
      </div>

      {/* Scrollable Chat Area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 pb-36 pt-4">
        {messages.length === 0 ? (
          /* Empty / Hero State (ChatGPT style with Animated Flowing Gradient) */
          <div className="mx-auto flex min-h-[72vh] max-w-2xl flex-col items-center justify-center text-center px-4">
            {/* Glowing Logo with Flowing Gradient Ring */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 opacity-75 blur-md animate-gradient-flow" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-black border border-white/20 text-white shadow-2xl">
                <Sparkles className="h-8 w-8 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              What threat intelligence can I{" "}
              <span className="gradient-flow-text">investigate?</span>
            </h1>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
              Sentinel AI autonomously indexes live cyber news into 768-dimensional vector embeddings using PostgreSQL and pgvector.
            </p>

            {/* 2x2 Suggested Cards with Flowing Glow */}
            <div className="mt-8 grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 text-left">
              {suggestedPrompts.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    onClick={() => handleSend(item.prompt)}
                    className={`group relative flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-950/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cyan-500/5 ${item.border} backdrop-blur-sm`}
                  >
                    <div>
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`flex h-7 w-7 items-center justify-center rounded-lg border shadow-sm ${item.iconColor}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-normal">
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
                  className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {/* Bot Avatar with Gradient Aura */}
                  {!isUser && (
                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black border border-cyan-500/40 text-cyan-400 mt-1 shadow-md shadow-cyan-500/20">
                      <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 opacity-40 blur-xs" />
                      <Bot className="relative h-4 w-4" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[88%] ${isUser ? "" : "flex-1 space-y-3"}`}>
                    {isUser ? (
                      <div className="rounded-3xl bg-zinc-900 border border-zinc-800 px-5 py-3 text-sm leading-relaxed text-zinc-100 shadow-lg">
                        {msg.content}
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-zinc-850 bg-zinc-950/90 p-5 text-sm text-zinc-200 space-y-3.5 shadow-2xl backdrop-blur-md">
                        {/* Response Text */}
                        <div className="whitespace-pre-wrap leading-relaxed space-y-2.5 font-normal text-zinc-200">
                          {msg.content}
                        </div>

                        {/* Semantic Sources Accordion */}
                        {hasSources && (
                          <div className="mt-4 border-t border-zinc-850 pt-3">
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
                                    className="rounded-xl border border-zinc-850 bg-black/80 p-3.5 text-xs space-y-1.5 transition hover:border-zinc-750"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-semibold text-zinc-100 line-clamp-1">
                                        [{sIdx + 1}] {source.title}
                                      </span>
                                      <span className="shrink-0 rounded bg-red-950/80 px-2 py-0.5 text-[10px] font-bold text-red-400 border border-red-500/40">
                                        SEV {source.severity}/10
                                      </span>
                                    </div>

                                    <p className="text-zinc-400 text-[11px] line-clamp-2">
                                      {source.summary}
                                    </p>

                                    <div className="flex items-center justify-between pt-1 text-[11px]">
                                      <span className="text-zinc-500">
                                        Actor: <strong className="text-zinc-300">{source.threat_actor}</strong>
                                      </span>

                                      <button
                                        onClick={() => onOpenModal(source)}
                                        className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold"
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
                        <div className="flex items-center justify-between border-t border-zinc-850/80 pt-2.5 text-[11px] text-zinc-500">
                          <span>{msg.timestamp}</span>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToClipboard(msg.id, msg.content)}
                              className="flex items-center gap-1 rounded px-2.5 py-1 hover:bg-zinc-900 hover:text-zinc-200 transition"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-medium">Copied</span>
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
                                className="flex items-center gap-1 rounded px-2.5 py-1 hover:bg-zinc-900 hover:text-zinc-200 transition"
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
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 mt-1 border border-zinc-700">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator with Animated Glow */}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black border border-cyan-500/40 text-cyan-400">
                  <Bot className="h-4 w-4 animate-spin" />
                </div>
                <div className="rounded-2xl border border-zinc-850 bg-zinc-950/90 px-4 py-3 text-xs text-zinc-400 shadow-xl">
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

      {/* Floating Bottom Prompt Bar with Animated Flowing Gradient Border */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none bg-gradient-to-t from-black via-black/95 to-transparent pt-8 pb-4">
        <div className="mx-auto max-w-3xl px-4 pointer-events-auto">
          {/* Animated Gradient Flow Container Wrapper */}
          <div className="relative rounded-3xl p-[1.5px] bg-gradient-to-r from-cyan-500/40 via-purple-500/30 to-pink-500/40 animate-gradient-flow shadow-2xl focus-within:from-cyan-400 focus-within:via-purple-500 focus-within:to-pink-500 transition-all duration-300">
            <div className="relative rounded-[22px] bg-black p-2.5">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={handleInputResize}
                onKeyDown={handleKeyDown}
                placeholder="Ask Sentinel AI about vulnerabilities, threat actors, zero-days, or campaigns..."
                disabled={isLoading}
                className="w-full resize-none bg-transparent px-3 py-1 text-sm text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50 max-h-40 leading-relaxed"
              />

              <div className="flex items-center justify-between px-2 pt-1 border-t border-zinc-850 mt-1 text-xs">
                <span className="text-[11px] text-zinc-500 flex items-center gap-1.5">
                  <span>Engine:</span>
                  <strong className="text-cyan-400 font-mono">pgvector 768d</strong>
                </span>

                <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed transition shadow-md"
                  title="Send Message (Enter)"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          <p className="mt-2 text-center text-[10px] text-zinc-500">
            Sentinel AI correlates threat feeds via PostgreSQL pgvector. Verify indicators of compromise with operational SIEM logs.
          </p>
        </div>
      </div>
    </div>
  );
}
