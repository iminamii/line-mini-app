import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

function RoastTemplateForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    origin: '',
    supplier: '',
    purchaseDate: '',
    processingMethod: '',
  })
  const [errors, setErrors] = useState({ name: '' })

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === 'name' && errors.name) {
      setErrors((prev) => ({ ...prev, name: '' }))
    }
  }

  const handleSave = () => {
    // Validate required field
    if (!formData.name.trim()) {
      setErrors({ name: '名称は必須です' })
      return
    }

    // Get existing templates from localStorage
    const existingTemplates = JSON.parse(localStorage.getItem('roastTemplates') || '[]')

    // Add new template with ID
    const newTemplate = {
      id: Date.now().toString(),
      ...formData,
      createdAt: new Date().toISOString(),
    }

    localStorage.setItem('roastTemplates', JSON.stringify([...existingTemplates, newTemplate]))

    // Navigate back to top page
    navigate('/')
  }

  return (
    <Card className="border-amber-200 bg-amber-50/50">
      <CardContent className="space-y-4 pt-6">
        {/* 名称 (必須) */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">
            名称 <span className="text-destructive">*</span>
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="例: エチオピア イルガチェフェ"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* 品種 */}
        <div className="space-y-2">
          <Label htmlFor="variety" className="text-foreground">
            品種
          </Label>
          <Input
            id="variety"
            type="text"
            value={formData.variety}
            onChange={(e) => handleChange('variety', e.target.value)}
            placeholder="例: ティピカ"
          />
        </div>

        {/* 産地 */}
        <div className="space-y-2">
          <Label htmlFor="origin" className="text-foreground">
            産地
          </Label>
          <Input
            id="origin"
            type="text"
            value={formData.origin}
            onChange={(e) => handleChange('origin', e.target.value)}
            placeholder="例: エチオピア"
          />
        </div>

        {/* 購入先 */}
        <div className="space-y-2">
          <Label htmlFor="supplier" className="text-foreground">
            購入先
          </Label>
          <Input
            id="supplier"
            type="text"
            value={formData.supplier}
            onChange={(e) => handleChange('supplier', e.target.value)}
            placeholder="例: ○○珈琲商店"
          />
        </div>

        {/* 購入日 */}
        <div className="space-y-2">
          <Label htmlFor="purchaseDate" className="text-foreground">
            購入日
          </Label>
          <Input
            id="purchaseDate"
            type="date"
            value={formData.purchaseDate}
            onChange={(e) => handleChange('purchaseDate', e.target.value)}
          />
        </div>

        {/* 精製方法 */}
        <div className="space-y-2">
          <Label htmlFor="processingMethod" className="text-foreground">
            精製方法
          </Label>
          <Input
            id="processingMethod"
            type="text"
            value={formData.processingMethod}
            onChange={(e) => handleChange('processingMethod', e.target.value)}
            placeholder="例: ウォッシュド"
          />
        </div>

        {/* 保存ボタン */}
        <Button onClick={handleSave} className="w-full bg-amber-700 text-white hover:bg-amber-800">
          保存
        </Button>
      </CardContent>
    </Card>
  )
}

export { RoastTemplateForm }
