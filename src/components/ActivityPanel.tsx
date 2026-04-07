"use client";

import { useState } from "react";
import { Activity } from "@/app/page";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

interface ActivityPanelProps {
  activity: Activity;
  onSubmit: (answer: string) => void;
  onDismiss: () => void;
}

export default function ActivityPanel({
  activity,
  onSubmit,
  onDismiss,
}: ActivityPanelProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState("");
  const [equationAnswer, setEquationAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const handleSubmit = () => {
    let answer = "";

    switch (activity.type) {
      case "mcq":
        if (selectedOption === null) return;
        answer = activity.options?.[selectedOption] || "";
        const correctIdx = parseInt(activity.correctAnswer || "0");
        setIsCorrect(selectedOption === correctIdx);
        break;
      case "equation":
        answer = equationAnswer;
        setIsCorrect(
          equationAnswer.trim().toLowerCase() ===
            (activity.correctAnswer || "").trim().toLowerCase()
        );
        break;
      case "written":
        answer = writtenAnswer;
        setIsCorrect(true); // Written answers are always "correct" — evaluated by AI
        break;
      case "ordering":
        answer = writtenAnswer;
        setIsCorrect(null);
        break;
    }

    setSubmitted(true);

    // After showing feedback, send to parent after delay
    setTimeout(() => {
      onSubmit(answer);
    }, 2500);
  };

  const typeConfig = {
    mcq: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      label: "Multiple Choice",
      color: "blue",
    },
    equation: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      label: "Solve It",
      color: "purple",
    },
    written: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      label: "Written Response",
      color: "emerald",
    },
    ordering: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      label: "Put in Order",
      color: "amber",
    },
  };

  const config = typeConfig[activity.type];

  return (
    <div className="h-full flex flex-col bg-slate-900 activity-enter">
      {/* Activity header */}
      <div className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl bg-${config.color}-500/20 flex items-center justify-center text-${config.color}-400`}
          >
            {config.icon}
          </div>
          <div>
            <span
              className={`text-xs font-semibold uppercase tracking-wider text-${config.color}-400`}
            >
              {config.label}
            </span>
            <h3 className="text-sm font-medium text-white">{activity.title}</h3>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Activity content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Question */}
        <div className="mb-6">
          <div className="markdown-content text-base text-slate-200 leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {activity.question}
            </ReactMarkdown>
          </div>
        </div>

        {/* MCQ Options */}
        {activity.type === "mcq" && activity.options && (
          <div className="space-y-3">
            {activity.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => !submitted && setSelectedOption(idx)}
                disabled={submitted}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                  submitted
                    ? idx === parseInt(activity.correctAnswer || "0")
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                      : selectedOption === idx
                      ? "border-red-500 bg-red-500/10 text-red-300"
                      : "border-slate-700 bg-slate-800/50 text-slate-500"
                    : selectedOption === idx
                    ? "border-blue-500 bg-blue-500/10 text-white"
                    : "border-slate-700 bg-slate-800/50 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      submitted
                        ? idx === parseInt(activity.correctAnswer || "0")
                          ? "bg-emerald-500 text-white"
                          : selectedOption === idx
                          ? "bg-red-500 text-white"
                          : "bg-slate-700 text-slate-400"
                        : selectedOption === idx
                        ? "bg-blue-500 text-white"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                    >
                      {option}
                    </ReactMarkdown>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Equation input */}
        {activity.type === "equation" && (
          <div className="space-y-3">
            <input
              type="text"
              value={equationAnswer}
              onChange={(e) => setEquationAnswer(e.target.value)}
              disabled={submitted}
              placeholder="Type your answer here..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-lg font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
            />
            <p className="text-xs text-slate-500">
              Enter a number or expression (e.g., 42, 3/4, 2x + 1)
            </p>
          </div>
        )}

        {/* Written response */}
        {activity.type === "written" && (
          <textarea
            value={writtenAnswer}
            onChange={(e) => setWrittenAnswer(e.target.value)}
            disabled={submitted}
            placeholder="Write your answer here..."
            rows={4}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none disabled:opacity-50"
          />
        )}

        {/* Ordering */}
        {activity.type === "ordering" && (
          <textarea
            value={writtenAnswer}
            onChange={(e) => setWrittenAnswer(e.target.value)}
            disabled={submitted}
            placeholder="Type the items in the correct order, one per line..."
            rows={5}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none disabled:opacity-50"
          />
        )}

        {/* Hint */}
        {activity.hint && !submitted && (
          <div className="mt-4">
            {showHint ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-sm text-amber-200">
                <span className="font-semibold">Hint:</span> {activity.hint}
              </div>
            ) : (
              <button
                onClick={() => setShowHint(true)}
                className="text-sm text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Need a hint?
              </button>
            )}
          </div>
        )}

        {/* Feedback after submission */}
        {submitted && (
          <div
            className={`mt-6 rounded-xl p-4 border ${
              isCorrect === true
                ? "bg-emerald-500/10 border-emerald-500/30"
                : isCorrect === false
                ? "bg-red-500/10 border-red-500/30"
                : "bg-blue-500/10 border-blue-500/30"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isCorrect === true && (
                <>
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-emerald-400">
                    Correct!
                  </span>
                </>
              )}
              {isCorrect === false && (
                <>
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-red-400">
                    Not quite!
                  </span>
                </>
              )}
              {isCorrect === null && (
                <>
                  <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-blue-400">
                    Submitted!
                  </span>
                </>
              )}
            </div>
            {activity.explanation && (
              <p className="text-sm text-slate-300">{activity.explanation}</p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Sending to your tutor for feedback...
            </p>
          </div>
        )}
      </div>

      {/* Submit button */}
      {!submitted && (
        <div className="border-t border-slate-700/50 px-6 py-4">
          <button
            onClick={handleSubmit}
            disabled={
              (activity.type === "mcq" && selectedOption === null) ||
              (activity.type === "equation" && !equationAnswer.trim()) ||
              (activity.type === "written" && !writtenAnswer.trim()) ||
              (activity.type === "ordering" && !writtenAnswer.trim())
            }
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors"
          >
            Submit Answer
          </button>
        </div>
      )}
    </div>
  );
}
