import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import './index.css'
import App from './App.jsx'

// Amplify設定の読み込み（デプロイ時に自動生成されます）
// 開発中は空のconfigでも問題ありません
try {
  const config = await import('../amplify_outputs.json')
  Amplify.configure(config.default)
} catch (error) {
  console.log('Amplify config not found, using defaults')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
