import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { AppLogo } from '@/components/app-logo'

function RoastPage() {
  const navigate = useNavigate()
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const [isFinished, setIsFinished] = useState(false)
  const intervalRef = useRef(null)

  // Phase states
  const [dryEndDone, setDryEndDone] = useState(false)
  const [goldPointDone, setGoldPointDone] = useState(false)
  const [firstCrackStartDone, setFirstCrackStartDone] = useState(false)
  const [firstCrackEndDone, setFirstCrackEndDone] = useState(false)
  const [secondCrackStartDone, setSecondCrackStartDone] = useState(false)
  const [secondCrackEndDone, setSecondCrackEndDone] = useState(false)

  const [roastData, setRoastData] = useState({
    events: [],
    currentTemp: '',
    gasPressure: '',
    damper: '',
    memo: '',
    middlePoint: '',
    afterAmount: '',
  })

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const addEvent = useCallback(
    (type) => {
      setRoastData((prev) => ({
        ...prev,
        events: [
          ...prev.events,
          {
            type,
            time: seconds,
            temperature: prev.currentTemp,
          },
        ],
      }))
    },
    [seconds],
  )

  const handleFinish = () => {
    setIsRunning(false)
    setIsFinished(true)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    addEvent('焙煎終了')
  }

  const handleSave = () => {
    const session = JSON.parse(localStorage.getItem('currentRoastSession') || '{}')
    const roastLog = {
      id: Date.now().toString(),
      ...session,
      ...roastData,
      totalTime: seconds,
      createdAt: new Date().toISOString(),
    }

    const logs = JSON.parse(localStorage.getItem('roastLogs') || '[]')
    localStorage.setItem('roastLogs', JSON.stringify([...logs, roastLog]))
    localStorage.removeItem('currentRoastSession')

    navigate('/')
  }

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          // Max 99:59 (5999 seconds)
          if (prev >= 5999) {
            setIsRunning(false)
            setIsFinished(true)
            return prev
          }
          return prev + 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-4 flex justify-center">
          <AppLogo />
        </div>

        {/* Timer Display */}
        <Card className="mb-4 border-amber-300 bg-gradient-to-br from-amber-800 to-amber-900 shadow-xl">
          <CardContent className="py-6 text-center">
            <div className="font-mono text-6xl font-bold tracking-wider text-amber-100">{formatTime(seconds)}</div>
            <p className="mt-2 text-sm text-amber-300">{isFinished ? '焙煎完了' : '焙煎中...'}</p>
          </CardContent>
        </Card>

        {/* Current Temperature - Always Visible */}
        <Card className="mb-4 border-amber-200 bg-white/90 shadow-md">
          <CardContent className="py-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="currentTemp" className="w-24 text-amber-900 font-medium">
                現在温度
              </Label>
              <Input
                id="currentTemp"
                type="number"
                inputMode="numeric"
                value={roastData.currentTemp}
                onChange={(e) => setRoastData((prev) => ({ ...prev, currentTemp: e.target.value }))}
                placeholder="°C"
                className="border-amber-200 text-center text-lg font-bold"
                disabled={isFinished}
              />
            </div>
          </CardContent>
        </Card>

        {!isFinished && (
          <>
            {/* Phase Buttons */}
            <Card className="mb-4 border-amber-200 bg-white/90 shadow-md">
              <CardContent className="space-y-3 py-4">
                {/* Dry End / Gold Point */}
                <div className="grid grid-cols-2 gap-3">
                  {!dryEndDone ? (
                    <Button
                      onClick={() => {
                        setDryEndDone(true)
                        addEvent('ドライエンド')
                      }}
                      className="bg-amber-600 text-white hover:bg-amber-700"
                    >
                      ドライエンド
                    </Button>
                  ) : (
                    <Button disabled className="bg-amber-200 text-amber-600">
                      ドライエンド済
                    </Button>
                  )}

                  {dryEndDone && !goldPointDone ? (
                    <Button
                      onClick={() => {
                        setGoldPointDone(true)
                        addEvent('ゴールドポイント')
                      }}
                      className="bg-yellow-600 text-white hover:bg-yellow-700"
                    >
                      ゴールドポイント
                    </Button>
                  ) : goldPointDone ? (
                    <Button disabled className="bg-yellow-200 text-yellow-700">
                      ゴールドポイント済
                    </Button>
                  ) : (
                    <div />
                  )}
                </div>

                {/* First Crack */}
                <div className="grid grid-cols-2 gap-3">
                  {!firstCrackStartDone ? (
                    <Button
                      onClick={() => {
                        setFirstCrackStartDone(true)
                        addEvent('1ハゼ開始')
                      }}
                      className="bg-orange-600 text-white hover:bg-orange-700"
                    >
                      1ハゼ開始
                    </Button>
                  ) : (
                    <Button disabled className="bg-orange-200 text-orange-700">
                      1ハゼ開始済
                    </Button>
                  )}

                  {firstCrackStartDone && !firstCrackEndDone ? (
                    <Button
                      onClick={() => {
                        setFirstCrackEndDone(true)
                        addEvent('1ハゼ終了')
                      }}
                      className="bg-orange-700 text-white hover:bg-orange-800"
                    >
                      1ハゼ終了
                    </Button>
                  ) : firstCrackEndDone ? (
                    <Button disabled className="bg-orange-200 text-orange-700">
                      1ハゼ終了済
                    </Button>
                  ) : (
                    <div />
                  )}
                </div>

                {/* Second Crack */}
                {firstCrackStartDone && (
                  <div className="grid grid-cols-2 gap-3">
                    {!secondCrackStartDone ? (
                      <Button
                        onClick={() => {
                          setSecondCrackStartDone(true)
                          addEvent('2ハゼ開始')
                        }}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        2ハゼ開始
                      </Button>
                    ) : (
                      <Button disabled className="bg-red-200 text-red-700">
                        2ハゼ開始済
                      </Button>
                    )}

                    {secondCrackStartDone && !secondCrackEndDone ? (
                      <Button
                        onClick={() => {
                          setSecondCrackEndDone(true)
                          addEvent('2ハゼ終了')
                        }}
                        className="bg-red-700 text-white hover:bg-red-800"
                      >
                        2ハゼ終了
                      </Button>
                    ) : secondCrackEndDone ? (
                      <Button disabled className="bg-red-200 text-red-700">
                        2ハゼ終了済
                      </Button>
                    ) : (
                      <div />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Additional Inputs During Roast */}
            <Card className="mb-4 border-amber-200 bg-white/90 shadow-md">
              <CardContent className="space-y-3 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="gasPressure" className="text-sm text-amber-900">
                      ガス圧
                    </Label>
                    <Input
                      id="gasPressure"
                      type="text"
                      value={roastData.gasPressure}
                      onChange={(e) => setRoastData((prev) => ({ ...prev, gasPressure: e.target.value }))}
                      className="border-amber-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="damper" className="text-sm text-amber-900">
                      ダンパー
                    </Label>
                    <Input
                      id="damper"
                      type="text"
                      value={roastData.damper}
                      onChange={(e) => setRoastData((prev) => ({ ...prev, damper: e.target.value }))}
                      className="border-amber-200"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="middlePoint" className="text-sm text-amber-900">
                    中点
                  </Label>
                  <Input
                    id="middlePoint"
                    type="text"
                    value={roastData.middlePoint}
                    onChange={(e) => setRoastData((prev) => ({ ...prev, middlePoint: e.target.value }))}
                    className="border-amber-200"
                    placeholder="中点温度"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="roastMemo" className="text-sm text-amber-900">
                    メモ
                  </Label>
                  <Textarea
                    id="roastMemo"
                    value={roastData.memo}
                    onChange={(e) => setRoastData((prev) => ({ ...prev, memo: e.target.value }))}
                    className="border-amber-200 resize-none"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Finish Button */}
            <Button
              onClick={handleFinish}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 py-6 text-lg font-bold text-white shadow-lg hover:from-red-700 hover:to-red-800"
            >
              焙煎終了
            </Button>
          </>
        )}

        {/* After Roast - Only visible after finish */}
        {isFinished && (
          <Card className="mb-4 border-green-200 bg-green-50 shadow-md">
            <CardContent className="space-y-4 py-6">
              <h3 className="font-bold text-green-800">焙煎完了</h3>

              {/* Event Log */}
              <div className="space-y-1 rounded bg-white p-3 text-sm">
                {roastData.events.map((event, index) => (
                  <div key={index} className="flex justify-between text-amber-900">
                    <span>{event.type}</span>
                    <span className="font-mono">
                      {formatTime(event.time)}
                      {event.temperature && ` / ${event.temperature}°C`}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="afterAmount" className="text-green-800">
                  焙煎後の量 (g)
                </Label>
                <Input
                  id="afterAmount"
                  type="number"
                  inputMode="numeric"
                  value={roastData.afterAmount}
                  onChange={(e) => setRoastData((prev) => ({ ...prev, afterAmount: e.target.value }))}
                  placeholder="焙煎後の重量"
                  className="border-green-200"
                />
              </div>

              <Button
                onClick={handleSave}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 py-6 text-lg font-bold text-white shadow-md hover:from-green-700 hover:to-green-800"
              >
                保存してホームへ
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}

export { RoastPage }
