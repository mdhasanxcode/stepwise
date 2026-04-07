"use client";

interface HeaderProps {
  progress: number;
  activitiesCompleted: number;
}

export default function Header({ progress, activitiesCompleted }: HeaderProps) {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700/50 px-6 py-3 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-sm">
          SW
        </div>
        <div>
          <h1 className="text-lg font-semibold text-white leading-tight">
            StepWise
          </h1>
          <p className="text-xs text-slate-400">AI-Guided Active Learning</p>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Progress indicator */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">Progress</span>
          <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-medium text-slate-300">
            {Math.round(progress)}%
          </span>
        </div>

        {/* Activities counter */}
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg">
          <svg
            className="w-4 h-4 text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-xs text-slate-300">
            {activitiesCompleted} activities
          </span>
        </div>

        {/* Powered by badge */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Powered by</span>
          <span className="font-semibold text-blue-400">Cogniti</span>
          <span>+</span>
          <span className="font-semibold text-orange-400">Groq</span>
        </div>
      </div>
    </header>
  );
}
