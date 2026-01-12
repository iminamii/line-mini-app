import { useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'

// Time-based auto-focus lookup table (seconds -> base temp)
const TIME_BASED_TEMP_MAP = [
  { seconds: 0, baseTemp: 20 },
  { seconds: 60, baseTemp: 40 },      // 01:00
  { seconds: 100, baseTemp: 60 },     // 01:40
  { seconds: 130, baseTemp: 80 },     // 02:10
  { seconds: 170, baseTemp: 100 },    // 02:50
  { seconds: 210, baseTemp: 120 },    // 03:30
  { seconds: 250, baseTemp: 130 },    // 04:10
  { seconds: 290, baseTemp: 150 },    // 04:50
  { seconds: 340, baseTemp: 160 },    // 05:40
  { seconds: 390, baseTemp: 170 },    // 06:30
  { seconds: 430, baseTemp: 180 },    // 07:10
  { seconds: 480, baseTemp: 190 },    // 08:00
  { seconds: 540, baseTemp: 200 },    // 09:00
  { seconds: 600, baseTemp: 210 },    // 10:00
  { seconds: 660, baseTemp: 220 },    // 11:00
  { seconds: 720, baseTemp: 230 },    // 12:00
  { seconds: 780, baseTemp: 240 },    // 13:00
  { seconds: 840, baseTemp: 250 },    // 14:00
  { seconds: 900, baseTemp: 260 },    // 15:00
  { seconds: 960, baseTemp: 270 },    // 16:00
  { seconds: 1020, baseTemp: 280 },   // 17:00
  { seconds: 1080, baseTemp: 290 },   // 18:00
]

// DEBUG: Set to true to disable automatic temperature selection based on time
const DEBUG_DISABLE_AUTO_SELECT = true

function QuickTemperatureInput({
  selectedBaseTemp,
  onBaseTempChange,
  onRecordTemperature,
  elapsedSeconds,
  isFinished,
  ambientTemp,
  onStartRoast
}) {
  const scrollContainerRef = useRef(null)
  const lastAutoUpdateRef = useRef(null)

  // Helper function to scroll a value to center
  const scrollToValue = (value) => {
    setTimeout(() => {
      if (scrollContainerRef.current) {
        const buttonIndex = Math.floor(value / 10)
        const button = scrollContainerRef.current.children[buttonIndex]
        if (button) {
          button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
        }
      }
    }, 50)
  }

  // Time-based auto-update logic
  useEffect(() => {
    if (isFinished || DEBUG_DISABLE_AUTO_SELECT) return

    // Find the appropriate base temperature based on elapsed time
    let newBaseTemp = 20 // Default
    for (let i = TIME_BASED_TEMP_MAP.length - 1; i >= 0; i--) {
      if (elapsedSeconds >= TIME_BASED_TEMP_MAP[i].seconds) {
        newBaseTemp = TIME_BASED_TEMP_MAP[i].baseTemp
        break
      }
    }

    // Start sequence: auto-record ambient temperature at 00:00
    if (elapsedSeconds === 0 && !lastAutoUpdateRef.current) {
      // First start - record ambient temperature
      if (ambientTemp && ambientTemp > 0 && onStartRoast) {
        onStartRoast()
      }
    }

    // Auto-update: only update when moving to a higher temperature range
    if (newBaseTemp !== lastAutoUpdateRef.current) {
      lastAutoUpdateRef.current = newBaseTemp
      onBaseTempChange(newBaseTemp)
      scrollToValue(newBaseTemp)
    }
  }, [elapsedSeconds, isFinished, onBaseTempChange, ambientTemp, onStartRoast])

  const handleUpperTierSelect = (value) => {
    lastAutoUpdateRef.current = value
    onBaseTempChange(value)
    scrollToValue(value)
  }

  const handleLowerTierSelect = (value) => {
    if (selectedBaseTemp === null) {
      selectedBaseTemp = 0
    }
    const finalTemp = selectedBaseTemp + value
    onRecordTemperature(finalTemp)
  }

  return (
    <div id="quick-temp-panel" className="mb-4">
      {/* Upper Tier - Scrollable 10°C Selector - ID: quick-temp-upper */}
      <div id="quick-temp-upper" className="mb-2">
        <div
          ref={scrollContainerRef}
          className="flex gap-1 overflow-x-auto py-2 px-1 scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {Array.from({ length: 31 }, (_, i) => i * 10).map((value) => (
            <Button
              key={value}
              variant={selectedBaseTemp === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleUpperTierSelect(value)}
              className={`flex-shrink-0 min-w-[40px] h-10 text-sm transition-all duration-200 ${
                selectedBaseTemp === value
                  ? 'bg-amber-600 text-white shadow-md scale-105'
                  : 'bg-white border-amber-200 text-amber-800 hover:bg-amber-50'
              }`}
              style={{ scrollSnapAlign: 'center' }}
              disabled={isFinished}
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      {/* Lower Tier - Fixed Units Selector - ID: quick-temp-lower */}
      <div id="quick-temp-lower" className="grid grid-cols-10 gap-1">
        {Array.from({ length: 10 }, (_, i) => i).map((value) => (
          <Button
            key={value}
            variant="outline"
            size="sm"
            onClick={() => handleLowerTierSelect(value)}
            className={`h-12 text-lg font-bold transition-all duration-200 ${
              selectedBaseTemp !== null
                ? 'bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 active:scale-95'
                : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={isFinished || selectedBaseTemp === null}
          >
            {value}
          </Button>
        ))}
      </div>
    </div>
  )
}

export { QuickTemperatureInput }
