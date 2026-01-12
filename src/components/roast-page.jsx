import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AppLogo } from '@/components/app-logo'
import { QuickTemperatureInput } from '@/components/quick-temperature-input.jsx'

const DEBUG_SPEED_UP = true
const DEBUG_SPEED_MULTIPLIER = 5

function RoastPage() {
  const navigate = useNavigate()
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [isFinished, setIsFinished] = useState(false)
  const intervalRef = useRef(null)
  const startRecordedRef = useRef(false)
  const [lastRecordedTemp, setLastRecordedTemp] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [selectedBaseTemp, setSelectedBaseTemp] = useState(null)
  const [dryEndDone, setDryEndDone] = useState(false)
  const [goldPointDone, setGoldPointDone] = useState(false)
  const [firstCrackStartDone, setFirstCrackStartDone] = useState(false)
  const [firstCrackEndDone, setFirstCrackEndDone] = useState(false)
  const [secondCrackStartDone, setSecondCrackStartDone] = useState(false)
  const [secondCrackEndDone, setSecondCrackEndDone] = useState(false)
  const [lastTempRecord, setLastTempRecord] = useState({ temp: null, time: null })
  const [preRorTempRecord, setPreRorTempRecord] = useState({ temp: null, time: null })
  const [currentRor, setCurrentRor] = useState(null)
  const [preRor, setPreRor] = useState(null)

  const [roastData, setRoastData] = useState({
    events: [],
    currentTemp: '',
    gasPressure: '',
    damper: '',
    memo: '',
    middlePoint: '',
    afterAmount: '',
    ror: null,
    preror: null,
  })

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const calculateRor = (currentTemp, currentTime) => {
    if (lastTempRecord.temp === null || lastTempRecord.time === null) return null
    const tempDiff = currentTemp - lastTempRecord.temp
    const timeDiffSeconds = currentTime - lastTempRecord.time
    if (timeDiffSeconds <= 0) return null
    return (tempDiff / (timeDiffSeconds / 60)).toFixed(1)
  }

  const addEvent = useCallback((type, temp = null) => {
    setRoastData((prev) => ({
      ...prev,
      events: [...prev.events, { type, time: seconds, temperature: temp !== null ? temp.toString() : prev.currentTemp }],
    }))
  }, [seconds])

  const handleFinish = () => {
    setIsRunning(false)
    setIsFinished(true)
    if (intervalRef.current) clearInterval(intervalRef.current)
    addEvent('焙煎終了')
    setRoastData((prev) => ({ ...prev, ror: currentRor, preror: preRor }))
  }

  const handleSave = () => {
    const session = JSON.parse(localStorage.getItem('currentRoastSession') || '{}')
    const roastLog = { id: Date.now().toString(), ...session, ...roastData, ror: currentRor, preror: preRor, totalTime: seconds, createdAt: new Date().toISOString() }
    const logs = JSON.parse(localStorage.getItem('roastLogs') || '[]')
    localStorage.setItem('roastLogs', JSON.stringify([...logs, roastLog]))
    localStorage.removeItem('currentRoastSession')
    navigate('/')
  }

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => { setShowToast(false); setLastRecordedTemp(null) }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('currentRoastSession') || '{}')
    if (session.temperature && parseInt(session.temperature) > 0 && !startRecordedRef.current) {
      setRoastData((prev) => ({ ...prev, currentTemp: session.temperature }))
      addEvent(`気温: \${session.temperature}°C`, parseInt(session.temperature))
      setLastTempRecord({ temp: parseInt(session.temperature), time: 0 })
      startRecordedRef.current = true
    }
  }, [])

  useEffect(() => {
    if (isRunning) {
      const intervalMs = DEBUG_SPEED_UP ? (1000 / DEBUG_SPEED_MULTIPLIER) : 1000
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev >= 5999) { setIsRunning(false); setIsFinished(true); return prev }
          return prev + 1
        })
      }, intervalMs)
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [isRunning])

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 px-4 pb-20 flex flex-col overflow-x-hidden">
      <div className="mx-auto max-w-md w-full flex-1 overflow-y-auto">
        <div className="mb-4 flex justify-center"><AppLogo /></div>
        <Card id="timer-card" className="mb-3 border-amber-300 bg-gradient-to-br from-amber-800 to-amber-900 shadow-md">
          <CardContent className="py-3 flex items-center justify-center gap-3">
            <div className="font-mono text-2xl font-bold tracking-wider text-amber-100">{formatTime(seconds)}</div>
            <p className="text-xs text-amber-300">{isFinished ? '焙煎完了' : '焙煎中...'}</p>
          </CardContent>
        </Card>
        {!isFinished && (
          <div id="quick-temp-input">
            <QuickTemperatureInput
              selectedBaseTemp={selectedBaseTemp}
              onBaseTempChange={setSelectedBaseTemp}
              onRecordTemperature={(temp) => {
                const ror = calculateRor(temp, seconds)
                setCurrentRor(ror)
                setLastTempRecord({ temp, time: seconds })
                addEvent(`温度記録: \${temp}°C`, temp)
                setRoastData((prev) => ({ ...prev, currentTemp: temp.toString() }))
                setLastRecordedTemp(temp)
                setShowToast(true)
              }}
              elapsedSeconds={seconds}
              isFinished={isFinished}
              ambientTemp={roastData.temperature}
              onStartRoast={() => {
                if (roastData.temperature && parseInt(roastData.temperature) > 0) {
                  addEvent(`気温: \${roastData.temperature}°C`, parseInt(roastData.temperature))
                  setLastTempRecord({ temp: parseInt(roastData.temperature), time: 0 })
                }
              }}
            />
          </div>
        )}
        <Card id="current-temp-input" className="mb-4 border-amber-200 bg-white/90 shadow-md relative">
          <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 pointer-events-none \${showToast ? 'opacity-100 transform -translate-y-1' : 'opacity-0 transform translate-y-0'}`}>
            <div className="bg-amber-600 text-white px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
              <span className="font-bold">{lastRecordedTemp}°C</span> を記録
            </div>
          </div>
          <CardContent className="py-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2 relative">
                <Input id="currentTemp" type="number" inputMode="numeric" value={roastData.currentTemp} onChange={(e) => setRoastData((prev) => ({ ...prev, currentTemp: e.target.value }))} placeholder="" className="border-amber-200 text-center text-lg font-bold pr-12" disabled={isFinished} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 font-bold pointer-events-none">°C</span>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-xs text-amber-600 font-bold">RoR</div>
                <div className="text-sm font-mono text-amber-800">{currentRor ? `\${currentRor}°C/min` : '--'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        {!isFinished && (
          <>
            <Card id="phase-buttons" className="mb-4 border-amber-200 bg-white/90 shadow-md">
              <CardContent className="space-y-3 py-4">
                <div className="grid grid-cols-2 gap-3">
                  {!dryEndDone ? <Button onClick={() => { setDryEndDone(true); addEvent('ドライエンド'); if (lastTempRecord.temp !== null) setPreRorTempRecord({ temp: lastTempRecord.temp, time: seconds }) }} className="bg-amber-600 text-white hover:bg-amber-700">ドライエンド</Button> : <Button disabled className="bg-amber-200 text-amber-600">ドライエンド済</Button>}
                  {dryEndDone && !goldPointDone ? <Button onClick={() => { setGoldPointDone(true); addEvent('ゴールドポイント') }} className="bg-yellow-600 text-white hover:bg-yellow-700">ゴールドポイント</Button> : goldPointDone ? <Button disabled className="bg-yellow-200 text-yellow-700">ゴールドポイント済</Button> : <div />}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {!firstCrackStartDone ? <Button onClick={() => { setFirstCrackStartDone(true); addEvent('1ハゼ開始') }} className="bg-orange-600 text-white hover:bg-orange-700">1ハゼ開始</Button> : <Button disabled className="bg-orange-200 text-orange-700">1ハゼ開始済</Button>}
                  {firstCrackStartDone && !firstCrackEndDone ? <Button onClick={() => { setFirstCrackEndDone(true); addEvent('1ハゼ終了') }} className="bg-orange-700 text-white hover:bg-orange-800">1ハゼ終了</Button> : firstCrackEndDone ? <Button disabled className="bg-orange-200 text-orange-700">1ハゼ終了済</Button> : <div />}
                </div>
                {firstCrackStartDone && (
                  <div className="grid grid-cols-2 gap-3">
                    {!secondCrackStartDone ? <Button onClick={() => { setSecondCrackStartDone(true); addEvent('2ハゼ開始') }} className="bg-red-600 text-white hover:bg-red-700">2ハゼ開始</Button> : <Button disabled className="bg-red-200 text-red-700">2ハゼ開始済</Button>}
                    {secondCrackStartDone && !secondCrackEndDone ? <Button onClick={() => { setSecondCrackEndDone(true); addEvent('2ハゼ終了') }} className="bg-red-700 text-white hover:bg-red-800">2ハゼ終了</Button> : secondCrackEndDone ? <Button disabled className="bg-red-200 text-red-700">2ハゼ終了済</Button> : <div />}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="mb-4 border-amber-200 bg-white/90 shadow-md">
              <CardContent className="space-y-3 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label htmlFor="gasPressure" className="text-sm text-amber-900">ガス圧</Label><Input id="gasPressure" type="text" value={roastData.gasPressure} onChange={(e) => setRoastData((prev) => ({ ...prev, gasPressure: e.target.value }))} className="border-amber-200" /></div>
                  <div className="space-y-1"><Label htmlFor="damper" className="text-sm text-amber-900">ダンパー</Label><Input id="damper" type="text" value={roastData.damper} onChange={(e) => setRoastData((prev) => ({ ...prev, damper: e.target.value }))} className="border-amber-200" /></div>
                </div>
                <div className="space-y-1"><Label htmlFor="middlePoint" className="text-sm text-amber-900">中点</Label><Input id="middlePoint" type="text" value={roastData.middlePoint} onChange={(e) => setRoastData((prev) => ({ ...prev, middlePoint: e.target.value }))} className="border-amber-200" placeholder="中点温度" /></div>
                <div className="space-y-1"><Label htmlFor="roastMemo" className="text-sm text-amber-900">メモ</Label><Textarea id="roastMemo" value={roastData.memo} onChange={(e) => setRoastData((prev) => ({ ...prev, memo: e.target.value }))} className="border-amber-200 resize-none" rows={2} /></div>
              </CardContent>
            </Card>
          </>
        )}
        {isFinished && (
          <Card className="mb-4 border-green-200 bg-green-50 shadow-md">
            <CardContent className="space-y-4 py-6">
              <h3 className="font-bold text-green-800">焙煎完了</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white rounded p-3"><div className="text-xs text-amber-600 font-bold">RoR</div><div className="text-lg font-mono text-amber-800">{currentRor ? `\${currentRor}°C/min` : '--'}</div></div>
                <div className="bg-white rounded p-3"><div className="text-xs text-amber-600 font-bold">PreRoR</div><div className="text-lg font-mono text-amber-800">{preRor ? `\${preRor}°C/min` : '--'}</div></div>
              </div>
              <div className="space-y-1 rounded bg-white p-3 text-sm">
                {roastData.events.map((event, index) => (
                  <div key={index} className="flex justify-between text-amber-900">
                    <span>{event.type}</span>
                    <span className="font-mono">{formatTime(event.time)}{event.temperature && ` / \${event.temperature}°C`}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2"><Label htmlFor="afterAmount" className="text-green-800">焙煎後の量 (g)</Label><Input id="afterAmount" type="number" inputMode="numeric" value={roastData.afterAmount} onChange={(e) => setRoastData((prev) => ({ ...prev, afterAmount: e.target.value }))} placeholder="焙煎後の重量" className="border-green-200" /></div>
              <Button onClick={handleSave} className="w-full bg-gradient-to-r from-green-600 to-green-700 py-6 text-lg font-bold text-white shadow-md hover:from-green-700 hover:to-green-800">保存してホームへ</Button>
            </CardContent>
          </Card>
        )}
      </div>
      {!isFinished && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-amber-50 to-transparent">
          <Button onClick={handleFinish} className="mx-auto max-w-md w-full bg-gradient-to-r from-red-600 to-red-700 text-lg font-bold text-white shadow-lg hover:from-red-700 hover:to-red-800 block h-14 leading-tight">焙煎終了</Button>
        </div>
      )}
    </main>
  )
}

export { RoastPage }
