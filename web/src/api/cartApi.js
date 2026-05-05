const API_URL = '/Raices-Viajeras/web/php/cesta_api.php'
const SESSION_URL = '/Raices-Viajeras/web/php/sesion.php'
const FALLBACK_IMAGE = '/Raices-Viajeras/img/logos/raices-viajeras-logo0.webp'

function formatErrorMessage(errorMessage, fallbackMessage) {
  if (typeof errorMessage === 'string' && errorMessage.trim() !== '') {
    return errorMessage
  }

  return fallbackMessage
}

function normalizeItem(rawItem) {
  const quantity = Number(rawItem?.cantidad || 0)
  const unitPrice = Number(rawItem?.precio_unitario || 0)
  const subtotal = Number(rawItem?.subtotal ?? quantity * unitPrice)

  return {
    carrito_viaje_id: Number(rawItem?.carrito_viaje_id || rawItem?.viaje_id || 0),
    viaje_id: Number(rawItem?.viaje_id || 0),
    titulo: rawItem?.titulo || '',
    descripcion: rawItem?.descripcion || '',
    imagen: rawItem?.imagen || FALLBACK_IMAGE,
    provincia_nombre: rawItem?.provincia_nombre || '',
    cantidad: quantity,
    precio_unitario: unitPrice,
    subtotal,
  }
}

export function normalizeSummary(data) {
  const cart = data?.carrito ?? {}
  const items = Array.isArray(cart.items) ? cart.items : []

  return {
    logueado: Boolean(data?.logueado),
    carrito: {
      id: cart.id ?? null,
      total: Number(cart.total || 0),
      count: Number(cart.count || 0),
      items: items.map(normalizeItem),
    },
  }
}

async function parseJsonResponse(response, fallbackMessage) {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(formatErrorMessage(data?.error, fallbackMessage))
  }

  return data
}

export async function fetchSession() {
  const response = await fetch(SESSION_URL, {
    cache: 'no-store',
    credentials: 'same-origin',
  })
  const data = await parseJsonResponse(response, 'No se pudo recuperar la sesión.')

  return {
    logueado: Boolean(data?.logueado),
    id: data?.id ? Number(data.id) : null,
    nombre: data?.nombre ?? null,
    rol: data?.rol ?? null,
  }
}

export async function fetchCartSummary() {
  const response = await fetch(`${API_URL}?accion=resumen`, {
    cache: 'no-store',
    credentials: 'same-origin',
  })
  const data = await parseJsonResponse(response, 'No se pudo recuperar la cesta.')

  return normalizeSummary(data)
}

export async function addCartItem(tripId) {
  const response = await fetch(API_URL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accion: 'agregar_item',
      viaje_id: tripId,
    }),
  })
  const data = await parseJsonResponse(response, 'No se pudo añadir el viaje a la cesta.')

  return normalizeSummary(data)
}

export async function removeCartItem(cartItemId) {
  const response = await fetch(API_URL, {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      accion: 'eliminar_item',
      carrito_viaje_id: cartItemId,
    }),
  })
  const data = await parseJsonResponse(response, 'No se pudo eliminar el viaje de la cesta.')

  return normalizeSummary(data)
}
