import logo from '@/assets/logo.jpg'

export function AppLogo({ className }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex h-12 w-12 items-center justify-center rounded-xl shadow-lg overflow-hidden">
        <img src={logo} alt="App Logo" className="h-full w-full object-cover" />
      </div>
      <div className="flex flex-col">
        <span className="text-lg font-bold tracking-tight text-amber-900">自家焙煎ロガー</span>
        <span className="text-xs text-amber-600">Home Roast Logger</span>
      </div>
    </div>
  )
}
