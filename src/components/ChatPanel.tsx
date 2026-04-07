"use client";

import { useState, KeyboardEvent, RefObject } from "react";
import { ChatMessage } from "@/app/page";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface ChatPanelProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (content: string) => void;
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function ChatPanel({
  messages,
  isLoading,
  onSendMessage,
  messagesEndRef,
}: ChatPanelProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Ready to learn!
            </h2>
            <p className="text-slate-400 max-w-md text-sm">
              Tell me what you&apos;d like to learn about. I&apos;ll guide you
              step by step with questions and interactive activities.
            </p>
            <div className="flex gap-2 mt-6">
              {["Teach me fractions", "Help with algebra", "Explain equations"].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => onSendMessage(suggestion)}
                    className="px-4 py-2 rounded-full bg-slate-800 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border border-slate-700"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.uuid}
            className={`message-enter flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700/50"
              }`}
            >
              {msg.role === "ai" && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white">S</span>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    StepWise
                  </span>
                </div>
              )}
              <div className="markdown-content text-sm leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start message-enter">
            <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-3 border border-slate-700/50">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                  <span className="text-[8px] font-bold text-white">S</span>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  StepWise is thinking...
                </span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-blue-400 typing-dot" />
                <div className="w-2 h-2 rounded-full bg-blue-400 typing-dot" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-800 px-6 py-4 bg-slate-900/50">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer or ask a question..."
              rows={1}
              className="w-full resize-none bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
              style={{ minHeight: "44px", maxHeight: "120px" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "44px";
                target.style.height = target.scrollHeight + "px";
              }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="shrink-0 w-11 h-11 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19V5m0 0l-7 7m7-7l7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
