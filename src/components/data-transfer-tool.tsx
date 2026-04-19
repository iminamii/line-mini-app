import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ClipboardCopy, ClipboardPaste, RefreshCw, AlertTriangle } from 'lucide-react'

export function DataTransferTool() {
  const [transferCode, setTransferCode] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const keysToTransfer = ['dataVersion', 'roastTemplates', 'roastLogs', 'currentRoastSession']

  const generateCode = () => {
    try {
      const data: Record<string, string | null> = {}
      keysToTransfer.forEach(key => {
        data[key] = localStorage.getItem(key)
      })
      
      const jsonString = JSON.stringify(data)
      const base64Code = btoa(unescape(encodeURIComponent(jsonString)))
      setTransferCode(base64Code)
      
      navigator.clipboard.writeText(base64Code)
      setStatus({ type: 'success', message: '引き継ぎコードをコピーしました。もう一方の版で貼り付けてください。' })
    } catch (e) {
      console.error(e)
      setStatus({ type: 'error', message: 'コードの生成に失敗しました。' })
    }
  }

  const importCode = () => {
    if (!transferCode.trim()) {
      setStatus({ type: 'error', message: '引き継ぎコードを入力してください。' })
      return
    }

    try {
      const jsonString = decodeURIComponent(escape(atob(transferCode.trim())))
      const data = JSON.parse(jsonString)

      if (!data.dataVersion) {
        throw new Error('Invalid data format')
      }

      // Save to localStorage
      Object.keys(data).forEach(key => {
        if (data[key] !== null) {
          localStorage.setItem(key, data[key])
        }
      })

      setStatus({ type: 'success', message: 'データの取り込みが完了しました。ページを再読み込みします...' })
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (e) {
      console.error(e)
      setStatus({ type: 'error', message: '無効なコードです。正しくコピーされているか確認してください。' })
    }
  }

  return (
    <Card className="mt-8 border-dashed border-amber-300 bg-amber-50/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-bold text-amber-900 flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          データの引き継ぎ (移行)
        </CardTitle>
        <CardDescription className="text-xs text-amber-700">
          Safari版とホーム画面版の間でデータを移動できます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-amber-100/50 p-2 rounded text-[10px] text-amber-800 flex items-start gap-2">
          <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
          <span>iOSの仕様により、Safariとホーム画面版のデータは同期されません。このツールを使ってデータを移してください。</span>
        </div>

        <Textarea
          value={transferCode}
          onChange={(e) => setTransferCode(e.target.value)}
          placeholder="ここに引き継ぎコードを貼り付けるか、下のボタンで発行してください"
          className="text-[10px] font-mono bg-white border-amber-200 h-20 resize-none"
        />

        <div className="grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generateCode}
            className="text-xs border-amber-300 text-amber-800 hover:bg-amber-100"
          >
            <ClipboardCopy className="w-3 h-3 mr-1" />
            コードを発行
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={importCode}
            className="text-xs bg-amber-700 hover:bg-amber-800"
          >
            <ClipboardPaste className="w-3 h-3 mr-1" />
            コードを読込
          </Button>
        </div>

        {status && (
          <p className={`text-[10px] font-medium ${status.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {status.message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
