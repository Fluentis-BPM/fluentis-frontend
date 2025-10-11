import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

// StrictMode removed to prevent duplicate API calls
// Re-enable for debugging: import { StrictMode } from 'react' and wrap <StrictMode><App /></StrictMode>
createRoot(document.getElementById('root')!).render(
  <App />
)
