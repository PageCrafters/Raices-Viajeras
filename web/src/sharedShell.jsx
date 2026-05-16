import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { APP_BASE } from './lib/routes'
import '../css/bootstrap.min.css'
import '../css/style.css'
import '../css/paga.css'
import { AppShell } from './components/AppShell'

function installBackendFetchBridge() {
  window.rvFetch = (input, init) => {
    if (typeof input !== 'string') {
      return window.fetch(input, init)
    }

    const url = new URL(input, window.location.href)

    if (url.origin !== window.location.origin) {
      return window.fetch(input, init)
    }

    if (url.pathname.startsWith('/php/')) {
      return window.fetch(`/Raices-Viajeras/web${url.pathname}${url.search}`, init)
    }

    if (url.pathname.startsWith('/Formulario/php/')) {
      return window.fetch(`/Raices-Viajeras/web${url.pathname}${url.search}`, init)
    }

    return window.fetch(input, init)
  }
}

function ensureShellRoot() {
  let shellRoot = document.getElementById('rv-shell-root')

  if (!shellRoot) {
    shellRoot = document.createElement('div')
    shellRoot.id = 'rv-shell-root'
    document.body.appendChild(shellRoot)
  }

  return shellRoot
}

function ensureTarget(id, fallbackPosition = 'append') {
  let target = document.getElementById(id)

  if (!target) {
    target = document.createElement('div')
    target.id = id

    if (fallbackPosition === 'prepend') {
      document.body.prepend(target)
    } else {
      document.body.appendChild(target)
    }
  }

  return target
}

installBackendFetchBridge()

createRoot(ensureShellRoot()).render(
  <StrictMode>
    <BrowserRouter basename={APP_BASE}>
      <AppShell
        headerTarget={ensureTarget('rv-header-root', 'prepend')}
        footerTarget={ensureTarget('rv-footer-root')}
      />
    </BrowserRouter>
  </StrictMode>
)
