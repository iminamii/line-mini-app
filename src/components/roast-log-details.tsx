import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export function RoastLogDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [log, setLog] = useState<any>(null)

  useEffect(() => {
    const logs = JSON.parse(localStorage.getItem('roastLogs') || '[]')
    const foundLog = logs.find((l: any) => l.id === id)
    setLog(foundLog)
  }, [id])

  if (!log) {
    return (
      <Card className="border-amber-200 bg-white/90 shadow-md">
        <CardContent className="py-10 text-center text-amber-800">
          記録が見つかりませんでした
        </CardContent>
      </Card>
    )
  }

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const date = new Date(log.createdAt).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const before = parseFloat(log.amount)
  const after = parseFloat(log.afterAmount)
  const weightLoss = before && after ? (((before - after) / before) * 100).toFixed(1) : null
  const roastIndex = before && after && after > 0 ? (before / after).toFixed(3) : null

  const calculateDTR = () => {
    const firstCrackEvent = log.events.find((e: any) => e.type === '1ハゼ開始')
    if (!firstCrackEvent || !log.totalTime) return null
    const devTime = log.totalTime - firstCrackEvent.time
    return ((devTime / log.totalTime) * 100).toFixed(1)
  }

  const getRoastLevel = (loss: string) => {
    const l = parseFloat(loss)
    if (l < 13) return 'ライトロースト (極浅煎り)'
    if (l < 14) return 'シナモンロースト (浅煎り)'
    if (l < 16) return 'ミディアムロースト (中浅煎り)'
    if (l < 17) return 'ハイロースト (中煎り)'
    if (l < 19) return 'シティロースト (中深煎り)'
    if (l < 21) return 'フルシティロースト (深煎り)'
    if (l < 23) return 'フレンチロースト (極深煎り)'
    return 'イタリアンロースト (極深煎り)'
  }

  const chartData = log.events
    .filter((e: any) => e.temperature || e.ror)
    .sort((a: any, b: any) => a.time - b.time)
    .map((e: any) => ({
      time: e.time,
      formattedTime: formatTime(e.time),
      temperature: e.temperature ? parseFloat(e.temperature) : null,
      ror: e.ror ? parseFloat(e.ror) : null,
      type: e.type !== '温度記録' && e.type !== '気温' ? e.type : null // イベント名を表示用に追加
    }))

  return (
    <div className="space-y-4">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/')}
        className="text-amber-700 hover:text-amber-800 hover:bg-amber-100"
      >
        ← 戻る
      </Button>

      <Card className="border-amber-300 bg-gradient-to-br from-amber-800 to-amber-900 shadow-md">
        <CardContent className="py-4 text-center">
          <div className="text-xs text-amber-100 mb-1 font-bold">焙煎日: {date}</div>
          <div className="text-xl font-bold text-white tracking-tight">{log.templateName}</div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-white/90 shadow-md">
        <CardContent className="py-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-xs text-amber-500 font-bold">焙煎時間</div>
              <div className="text-lg font-mono text-amber-900">{formatTime(log.totalTime)}</div>
            </div>
            {calculateDTR() && (
              <div className="space-y-1">
                <div className="text-xs text-amber-500 font-bold">DTR</div>
                <div className="text-lg font-mono text-amber-900">{calculateDTR()}%</div>
              </div>
            )}
            <div className="space-y-1">
              <div className="text-xs text-amber-500 font-bold">投入量</div>
              <div className="text-lg font-mono text-amber-900">{log.amount}g</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-amber-500 font-bold">終了量</div>
              <div className="text-lg font-mono text-amber-900">{log.afterAmount}g</div>
            </div>
            {weightLoss && (
              <div className="space-y-1">
                <div className="text-xs text-amber-500 font-bold">減少率</div>
                <div className="text-lg font-mono text-amber-900">{weightLoss}%</div>
              </div>
            )}
            {roastIndex && (
              <div className="space-y-1">
                <div className="text-xs text-amber-500 font-bold">焙煎指数</div>
                <div className="text-lg font-mono text-amber-900">{roastIndex}</div>
              </div>
            )}
          </div>

          {weightLoss && (
            <div className="text-sm text-center text-amber-800 bg-amber-50 py-2 rounded font-medium border border-amber-100">
              焙煎度目安: {getRoastLevel(weightLoss)}
            </div>
          )}

          {chartData.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-amber-100">
              <div className="h-[250px] w-full">
                <h4 className="text-sm font-bold text-amber-900 mb-2 text-center">温度推移 (°C)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fcd34d" vertical={false} />
                    <XAxis 
                      dataKey="formattedTime" 
                      stroke="#78350f" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis stroke="#78350f" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #fbbf24' }}
                      labelStyle={{ color: '#78350f', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#d97706" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: '#d97706' }}
                      activeDot={{ r: 5 }}
                      name="温度"
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="h-[200px] w-full">
                <h4 className="text-sm font-bold text-amber-900 mb-2 text-center">RoR 推移 (°C/min)</h4>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#fcd34d" vertical={false} />
                    <XAxis 
                      dataKey="formattedTime" 
                      stroke="#78350f" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis stroke="#78350f" domain={['auto', 'auto']} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', border: '1px solid #fbbf24' }}
                      labelStyle={{ color: '#78350f', fontWeight: 'bold' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ror" 
                      stroke="#059669" 
                      strokeWidth={2} 
                      dot={{ r: 3, fill: '#059669' }}
                      activeDot={{ r: 5 }}
                      name="RoR"
                      connectNulls
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-amber-100">
            <div className="space-y-1">
              <div className="text-xs text-amber-500 font-bold">気温</div>
              <div className="text-sm text-amber-900">{log.temperature}°C</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-amber-500 font-bold">湿度</div>
              <div className="text-sm text-amber-900">{log.humidity}%</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-amber-500 font-bold">焙煎機</div>
              <div className="text-sm text-amber-900">{log.roaster || '-'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-amber-500 font-bold">投入温度</div>
              <div className="text-sm text-amber-900">{log.inputTemp}°C</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-white/90 shadow-md">
        <CardContent className="py-4">
          <h3 className="font-bold text-amber-900 mb-3 border-b border-amber-100 pb-1">イベントログ</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-2 text-xs font-bold text-amber-500 pb-1">
              <span>イベント</span>
              <span className="text-center">時間</span>
              <span className="text-center">温度</span>
              <span className="text-center">RoR</span>
            </div>
            {log.events.map((event: any, index: number) => (
              <div key={index} className="grid grid-cols-4 gap-2 text-sm items-center border-b border-amber-50 pb-1">
                <span className="text-amber-900 font-medium truncate">{event.type}</span>
                <span className="font-mono text-center text-amber-800">{formatTime(event.time)}</span>
                <span className="font-mono text-center text-amber-800">{event.temperature ? `${event.temperature}°C` : '-'}</span>
                <span className="font-mono text-center text-amber-800">{event.ror ? `${event.ror}` : '-'}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {log.memo && (
        <Card className="border-amber-200 bg-white/90 shadow-md">
          <CardContent className="py-4">
            <h3 className="font-bold text-amber-900 mb-2 border-b border-amber-100 pb-1">メモ</h3>
            <p className="text-sm text-amber-800 whitespace-pre-wrap">{log.memo}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="pt-4">
        <Button 
          variant="outline" 
          onClick={() => {
            if (confirm('この記録を削除しますか？')) {
              const logs = JSON.parse(localStorage.getItem('roastLogs') || '[]')
              const filteredLogs = logs.filter((l: any) => l.id !== id)
              localStorage.setItem('roastLogs', JSON.stringify(filteredLogs))
              navigate('/')
            }
          }}
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          記録を削除
        </Button>
      </div>
    </div>
  )
}
