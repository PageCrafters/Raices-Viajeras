import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import '../css/bootstrap.min.css'
import '../css/style.css'
import '../css/paga.css'
import '../css/destinos.css'
import '../css/infoAventura.css'
import App from './App.jsx'
import { APP_BASE } from './lib/routes'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={APP_BASE}>
      <App />
    </BrowserRouter>
  </StrictMode>
)
