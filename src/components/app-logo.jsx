export function AppLogo({ className }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-700 via-amber-800 to-amber-900 shadow-lg">
        {/* Coffee bean icon */}
        <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-amber-100" stroke="currentColor" strokeWidth="1.5">
          <ellipse cx="12" cy="12" rx="6" ry="9" className="fill-amber-100/20" />
          <path d="M12 3c-3.5 0-6 4-6 9s2.5 9 6 9 6-4 6-9-2.5-9-6-9z" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 3c-1 2-1 6 0 9s1 7 0 9" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {/* Steam effect */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2">
          <svg viewBox="0 0 20 12" className="h-3 w-5 text-amber-400/60">
            <path
              d="M4 12C4 8 2 6 2 3M10 12C10 8 10 6 10 2M16 12C16 8 18 6 18 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-amber-900">自家焙煎ロガー</span>
        <span className="text-xs text-amber-600">Home Roast Logger</span>
      </div>
    </div>
  )
}
