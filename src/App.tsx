import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AppLogo } from '@/components/app-logo'
import { RoastTemplateForm } from '@/components/roast-template-form'
import { RoastPage } from '@/components/roast-page'

interface RoastTemplate {
  id: string
  name: string
  variety: string
  origin: string
  supplier: string
  purchaseDate: string
  processingMethod: string
}

interface RoastSession {
  templateId: string
  templateName: string
  amount: string
  temperature: string
  humidity: string
  roaster: string
  inputTemp: string
  memo: string
}

function HomePage() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<RoastTemplate[]>([])
  const [formData, setFormData] = useState<RoastSession>({
    templateId: '',
    templateName: '',
    amount: '',
    temperature: '',
    humidity: '',
    roaster: '',
    inputTemp: '',
    memo: '',
  })
  const [errors, setErrors] = useState<{ templateId?: string; amount?: string }>({})

  useEffect(() => {
    const savedTemplates = JSON.parse(localStorage.getItem('roastTemplates') || '[]')
    setTemplates(savedTemplates)
  }, [])

  const handleChange = (field: keyof RoastSession, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleTemplateChange = (value: string) => {
    if (value === 'new') {
      navigate('/template')
      return
    }
    const template = templates.find((t) => t.id === value)
    setFormData((prev) => ({
      ...prev,
      templateId: value,
      templateName: template?.name || '',
    }))
    if (errors.templateId) {
      setErrors((prev) => ({ ...prev, templateId: undefined }))
    }
  }

  const handleStart = () => {
    const newErrors: { templateId?: string; amount?: string } = {}

    if (!formData.templateId) {
      newErrors.templateId = '豆の種類を選択してください'
    }
    if (!formData.amount.trim()) {
      newErrors.amount = '焙煎量は必須です'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Save session data and navigate to roast page
    localStorage.setItem('currentRoastSession', JSON.stringify(formData))
    navigate('/roast')
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center">
          <AppLogo />
        </div>

        <Card className="border-amber-200 bg-white/80 shadow-lg backdrop-blur">
          <CardContent className="space-y-4 pt-6">
            {/* 豆の種類 (必須) */}
            <div className="space-y-2">
              <Label className="text-amber-900">
                豆の種類 <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.templateId} onValueChange={handleTemplateChange}>
                <SelectTrigger className={errors.templateId ? 'border-red-500' : 'border-amber-200'}>
                  <SelectValue placeholder="選択してください" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="new" className="text-amber-700 font-medium">
                    + 新規登録
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.templateId && <p className="text-sm text-red-500">{errors.templateId}</p>}
            </div>

            {/* 焙煎量 (必須) */}
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-amber-900">
                焙煎量 (g) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                inputMode="numeric"
                value={formData.amount}
                onChange={(e) => handleChange('amount', e.target.value)}
                placeholder="例: 200"
                className={errors.amount ? 'border-red-500' : 'border-amber-200'}
              />
              {errors.amount && <p className="text-sm text-red-500">{errors.amount}</p>}
            </div>

            {/* 気温 */}
            <div className="space-y-2">
              <Label htmlFor="temperature" className="text-amber-900">
                気温 (°C)
              </Label>
              <Input
                id="temperature"
                type="number"
                inputMode="numeric"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                placeholder="例: 25"
                className="border-amber-200"
              />
            </div>

            {/* 湿度 */}
            <div className="space-y-2">
              <Label htmlFor="humidity" className="text-amber-900">
                湿度 (%)
              </Label>
              <Input
                id="humidity"
                type="number"
                inputMode="numeric"
                value={formData.humidity}
                onChange={(e) => handleChange('humidity', e.target.value)}
                placeholder="例: 60"
                className="border-amber-200"
              />
            </div>

            {/* 使用する焙煎機 */}
            <div className="space-y-2">
              <Label htmlFor="roaster" className="text-amber-900">
                使用する焙煎機
              </Label>
              <Input
                id="roaster"
                type="text"
                value={formData.roaster}
                onChange={(e) => handleChange('roaster', e.target.value)}
                placeholder="例: 手網, サンプルロースター"
                className="border-amber-200"
              />
            </div>

            {/* 投入温度 */}
            <div className="space-y-2">
              <Label htmlFor="inputTemp" className="text-amber-900">
                投入温度 (°C)
              </Label>
              <Input
                id="inputTemp"
                type="number"
                inputMode="numeric"
                value={formData.inputTemp}
                onChange={(e) => handleChange('inputTemp', e.target.value)}
                placeholder="例: 180"
                className="border-amber-200"
              />
            </div>

            {/* メモ */}
            <div className="space-y-2">
              <Label htmlFor="memo" className="text-amber-900">
                メモ
              </Label>
              <Textarea
                id="memo"
                value={formData.memo}
                onChange={(e) => handleChange('memo', e.target.value)}
                placeholder="焙煎前のメモ"
                className="border-amber-200 resize-none"
                rows={2}
              />
            </div>

            {/* 焙煎スタートボタン */}
            <Button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-amber-700 to-amber-800 py-6 text-lg font-bold text-white shadow-md hover:from-amber-800 hover:to-amber-900"
            >
              焙煎スタート
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

function TemplatePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 p-4">
      <div className="mx-auto max-w-md">
        <div className="mb-6 flex justify-center">
          <AppLogo />
        </div>
        <h2 className="mb-4 text-center text-lg font-semibold text-amber-800">焙煎テンプレート作成</h2>
        <RoastTemplateForm />
      </div>
    </main>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/template" element={<TemplatePage />} />
        <Route path="/roast" element={<RoastPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
