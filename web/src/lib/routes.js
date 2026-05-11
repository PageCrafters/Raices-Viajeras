export const APP_PATHS = {
  provincias: '/web/html/provincias.html',
  destinos: '/web/html/destinos.html',
  infoAventura: '/web/html/infoAventura.html',
  paga: '/web/html/paga.html',
}

export function resolveRoute(pathname) {
  if (pathname.endsWith('/web/html/provincias.html')) {
    return 'provincias'
  }

  if (pathname.endsWith('/web/html/destinos.html')) {
    return 'destinos'
  }

  if (pathname.endsWith('/web/html/infoAventura.html')) {
    return 'infoAventura'
  }

  if (pathname.endsWith('/web/html/paga.html')) {
    return 'paga'
  }

  return 'paga'
}

export function buildDestinosUrl(provinceId) {
  return `${APP_PATHS.destinos}?provincia_id=${encodeURIComponent(provinceId)}`
}

export function buildInfoAventuraUrl(tripId) {
  return `${APP_PATHS.infoAventura}?viaje=${encodeURIComponent(tripId)}`
}

export function buildLoginUrl(redirectPath = APP_PATHS.paga) {
  const url = new URL('/Raices-Viajeras/web/Formulario/form.html?modo=login', window.location.origin)
  url.searchParams.set('redirect', redirectPath)

  return `${url.pathname}${url.search}`
}
