function isApacheProjectPath() {
  return window.location.pathname.startsWith('/Raices-Viajeras/')
}

const FRONTEND_BASE = isApacheProjectPath() ? '/Raices-Viajeras/web' : ''

export const APP_PATHS = {
  home: isApacheProjectPath() ? '/Raices-Viajeras/index.html' : '/',
  provincias: `${FRONTEND_BASE}/html/provincias.html`,
  destinos: `${FRONTEND_BASE}/html/destinos.html`,
  infoAventura: `${FRONTEND_BASE}/html/infoAventura.html`,
  paga: `${FRONTEND_BASE}/html/paga.html`,
  blog: `${FRONTEND_BASE}/html/blog.html`,
  conocenos: `${FRONTEND_BASE}/html/conocenos.html`,
  admin: `${FRONTEND_BASE}/html/admin.html`,
  login: `${FRONTEND_BASE}/Formulario/form.html`,
}

export function resolveRoute(pathname) {
  if (pathname === '/' || pathname.endsWith('/Raices-Viajeras/index.html')) {
    return 'home'
  }

  if (pathname.endsWith('/html/provincias.html')) {
    return 'provincias'
  }

  if (pathname.endsWith('/html/destinos.html')) {
    return 'destinos'
  }

  if (pathname.endsWith('/html/infoAventura.html')) {
    return 'infoAventura'
  }

  if (pathname.endsWith('/html/paga.html')) {
    return 'paga'
  }

  return 'home'
}

export function buildDestinosUrl(provinceId) {
  return `${APP_PATHS.destinos}?provincia_id=${encodeURIComponent(provinceId)}`
}

export function buildInfoAventuraUrl(tripId) {
  return `${APP_PATHS.infoAventura}?viaje=${encodeURIComponent(tripId)}`
}

export function buildLoginUrl(redirectPath = APP_PATHS.paga) {
  const url = new URL(`${APP_PATHS.login}?modo=login`, window.location.origin)
  url.searchParams.set('redirect', redirectPath)

  return `${url.pathname}${url.search}`
}
