function isApacheProjectPath() {
  return window.location.pathname.startsWith('/Raices-Viajeras/')
}

// En local la app vive en la raiz; en Apache cuelga de /Raices-Viajeras/web.
const FRONTEND_BASE = isApacheProjectPath() ? '/Raices-Viajeras/web' : ''

export const APP_BASE = FRONTEND_BASE || undefined

function withFrontendBase(pathname) {
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`

  if (!FRONTEND_BASE) {
    return cleanPath
  }

  return `${FRONTEND_BASE}${cleanPath}`
}

export function assetPath(relativePath) {
  return withFrontendBase(relativePath)
}

export function publicPath(relativePath) {
  return withFrontendBase(relativePath)
}

export function backendPath(relativePath) {
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`
  return `/Raices-Viajeras/web${cleanPath}`
}

function stripFrontendBase(pathname) {
  if (!FRONTEND_BASE || !pathname.startsWith(FRONTEND_BASE)) {
    return pathname
  }

  const stripped = pathname.slice(FRONTEND_BASE.length)
  return stripped === '' ? '/' : stripped
}

export const APP_PATHS = {
  home: '/',
  provincias: '/provincias',
  destinos: '/destinos',
  infoAventura: '/info-aventura',
  paga: '/paga',
  blog: '/blog',
  conocenos: '/conocenos',
  articulo: '/articulo',
  admin: '/admin',
  login: withFrontendBase('/Formulario/form.html'),
}

export function resolveRoute(pathname) {
  const routePath = stripFrontendBase(pathname)

  if (routePath === '/' || routePath.endsWith('/index.html')) {
    return 'home'
  }

  if (routePath === '/provincias' || routePath.endsWith('/html/provincias.html')) {
    return 'provincias'
  }

  if (routePath === '/destinos' || routePath.endsWith('/html/destinos.html')) {
    return 'destinos'
  }

  if (routePath === '/info-aventura' || routePath.endsWith('/html/infoAventura.html')) {
    return 'infoAventura'
  }

  if (routePath === '/paga' || routePath.endsWith('/html/paga.html')) {
    return 'paga'
  }

  if (routePath === '/blog' || routePath.endsWith('/html/blog.html')) {
    return 'blog'
  }

  if (routePath === '/conocenos' || routePath.endsWith('/html/conocenos.html')) {
    return 'conocenos'
  }

  if (routePath === '/articulo' || routePath.endsWith('/html/articulo.html')) {
    return 'articulo'
  }

  if (routePath === '/admin' || routePath.endsWith('/html/admin.html')) {
    return 'admin'
  }

  return 'home'
}

export function buildDestinosUrl(provinceId) {
  return `${APP_PATHS.destinos}?provincia_id=${encodeURIComponent(provinceId)}`
}

export function buildInfoAventuraUrl(tripId) {
  return `${APP_PATHS.infoAventura}?viaje=${encodeURIComponent(tripId)}`
}

export function buildArticleUrl(articleId) {
  return `${APP_PATHS.articulo}?id=${encodeURIComponent(articleId)}`
}

export function buildAuthUrl(mode = 'login', redirectPath = APP_PATHS.paga) {
  const url = new URL(APP_PATHS.login, window.location.origin)
  url.searchParams.set('modo', mode)

  if (redirectPath) {
    url.searchParams.set('redirect', redirectPath)
  }

  return `${url.pathname}${url.search}`
}

export function buildLoginUrl(redirectPath = APP_PATHS.paga) {
  return buildAuthUrl('login', redirectPath)
}

export function buildRegisterUrl(redirectPath = APP_PATHS.home) {
  return buildAuthUrl('registro', redirectPath)
}
