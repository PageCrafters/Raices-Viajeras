import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '../css/bootstrap.min.css'
import '../css/style.css'
import '../css/paga.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
