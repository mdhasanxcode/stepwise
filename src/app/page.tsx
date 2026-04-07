"use client";

import { useState, useRef, useEffect } from "react";
import ChatPanel from "@/components/ChatPanel";
import ActivityPanel from "@/components/ActivityPanel";
import Header from "@/components/Header";

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  uuid: string;
}

export interface Activity {
  type: "mcq" | "equation" | "written" | "ordering";
  title: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  hint?: string;
  explanation?: string;
}

export default function Home() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [activityHistory, setActivityHistory] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [conversationId, setConversationId] = useState<string>(() =>
    crypto.randomUUID()
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string) => {
    const userMessage: ChatMessage = {
      role: "user",
      content,
      uuid: crypto.randomUUID(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          chatHistory: messages,
          conversationId,
        }),
      });

      const data = await res.json();

      const aiMessage: ChatMessage = {
        role: "ai",
        content: data.message || "I had trouble processing that. Could you try again?",
        uuid: crypto.randomUUID(),
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Handle activity
      if (data.activity) {
        setCurrentActivity(data.activity);
        setActivityHistory((prev) => [...prev, data.activity]);
      }

      // Update progress
      setProgress((prev) => Math.min(prev + 8, 100));
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        role: "ai",
        content: "Sorry, I had trouble connecting. Please try again.",
        uuid: crypto.randomUUID(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivitySubmit = async (answer: string) => {
    // Send the activity result back to the chat
    const resultMessage = `[Activity completed] My answer: ${answer}`;
    await sendMessage(resultMessage);
    setCurrentActivity(null);
  };

  const handleActivityDismiss = () => {
    setCurrentActivity(null);
  };

  return (
    <div className="h-screen flex flex-col">
      <Header
        progress={progress}
        activitiesCompleted={activityHistory.length}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Panel — Left Side */}
        <div
          className={`flex flex-col transition-all duration-300 ${
            currentActivity ? "w-1/2" : "w-full"
          }`}
        >
          <ChatPanel
            messages={messages}
            isLoading={isLoading}
            onSendMessage={sendMessage}
            messagesEndRef={messagesEndRef}
          />
        </div>

        {/* Activity Panel — Right Side */}
        {currentActivity && (
          <div className="w-1/2 border-l border-slate-700/50">
            <ActivityPanel
              activity={currentActivity}
              onSubmit={handleActivitySubmit}
              onDismiss={handleActivityDismiss}
            />
          </div>
        )}
      </div>
    </div>
  );
}
