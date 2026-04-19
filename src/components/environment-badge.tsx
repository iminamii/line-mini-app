import { useState, useEffect } from 'react'

export function EnvironmentBadge() {
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const checkStandalone = () => {
      const standalone = 
        (window.navigator as any).standalone || 
        window.matchMedia('(display-mode: standalone)').matches
      setIsStandalone(!!standalone)
    }

    checkStandalone()
    // Listen for changes (though unlikely to change within a session)
    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    mediaQuery.addEventListener('change', checkStandalone)
    return () => mediaQuery.removeEventListener('change', checkStandalone)
  }, [])

  return (
    <div className="flex items-center gap-2 mb-2">
      <div 
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          isStandalone 
            ? 'bg-green-100 text-green-700 border border-green-200' 
            : 'bg-amber-100 text-amber-700 border border-amber-200'
        }`}
      >
        {isStandalone ? 'アプリ版 (ホーム画面)' : 'Safari版 (ブラウザ)'}
      </div>
      {!isStandalone && (
        <span className="text-[10px] text-amber-500 font-medium animate-pulse">
          ※ホーム画面への追加を推奨
        </span>
      )}
    </div>
  )
}
