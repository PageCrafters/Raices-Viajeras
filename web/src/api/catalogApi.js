const FALLBACK_IMAGE = '/Raices-Viajeras/img/logos/raices-viajeras-logo0.webp'
const PROVINCES_API_URL = '/Raices-Viajeras/web/php/obtener_provincias.php'
const TRIPS_BY_PROVINCE_API_URL = '/Raices-Viajeras/web/php/obtener_viajes_por_provincia.php'
const TRIP_DETAIL_API_URL = '/Raices-Viajeras/web/php/obtener_viaje.php'

/**
 * @typedef {Object} Province
 * @property {number} id
 * @property {string} nombre
 * @property {string} descripcion
 * @property {string} imagen
 * @property {number} viajes_count
 */

/**
 * @typedef {Object} TripCard
 * @property {number} id
 * @property {string} titulo
 * @property {string} descripcion
 * @property {string} imagen
 * @property {number} precio
 */

/**
 * @typedef {Object} TripDetail
 * @property {number} id
 * @property {string} titulo
 * @property {string} descripcion
 * @property {string} imagen
 * @property {number} precio
 * @property {string|null} origen
 * @property {string|null} fecha_inicio
 * @property {string|null} fecha_fin
 * @property {number|null} plazas
 * @property {number|null} provincia_id
 * @property {string|null} provincia_nombre
 * @property {string|null} provincia_descripcion
 */

async function safeJson(response) {
  const raw = await response.text()

  if (!raw || raw.trim() === '') {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function normalizeProvince(row) {
  return {
    id: Number(row?.id || 0),
    nombre: row?.nombre || '',
    descripcion: row?.descripcion || '',
    imagen: row?.imagen || FALLBACK_IMAGE,
    viajes_count: Number(row?.viajes_count || 0),
  }
}

function normalizeTripCard(row) {
  return {
    id: Number(row?.id || 0),
    titulo: row?.titulo || '',
    descripcion: row?.descripcion || '',
    imagen: row?.imagen || FALLBACK_IMAGE,
    precio: Number(row?.precio || 0),
  }
}

function normalizeTripDetail(row) {
  if (!row) {
    return null
  }

  return {
    id: Number(row?.id || 0),
    titulo: row?.titulo || '',
    descripcion: row?.descripcion || '',
    imagen: row?.imagen || FALLBACK_IMAGE,
    precio: Number(row?.precio || 0),
    origen: row?.origen ?? null,
    fecha_inicio: row?.fecha_inicio ?? null,
    fecha_fin: row?.fecha_fin ?? null,
    plazas: typeof row?.plazas === 'number' ? row.plazas : row?.plazas ? Number(row.plazas) : null,
    provincia_id: typeof row?.provincia_id === 'number'
      ? row.provincia_id
      : row?.provincia_id
        ? Number(row.provincia_id)
        : null,
    provincia_nombre: row?.provincia_nombre ?? null,
    provincia_descripcion: row?.provincia_descripcion ?? null,
  }
}

/**
 * @returns {Promise<Province[]>}
 */
export async function fetchProvinces() {
  const response = await fetch(PROVINCES_API_URL, {
    cache: 'no-store',
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await safeJson(response)
  if (!Array.isArray(data)) {
    return []
  }

  return data.map(normalizeProvince).filter((province) => province.id > 0)
}

/**
 * @param {string|number} provinceId
 * @returns {Promise<TripCard[]>}
 */
export async function fetchTripsByProvince(provinceId) {
  const response = await fetch(
    `${TRIPS_BY_PROVINCE_API_URL}?provincia_id=${encodeURIComponent(provinceId)}`,
    {
      cache: 'no-store',
      credentials: 'same-origin',
    }
  )

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await safeJson(response)
  if (!Array.isArray(data)) {
    return []
  }

  return data.map(normalizeTripCard).filter((trip) => trip.id > 0)
}

/**
 * @param {string|number} tripId
 * @returns {Promise<TripDetail|null>}
 */
export async function fetchTripDetail(tripId) {
  const response = await fetch(`${TRIP_DETAIL_API_URL}?viaje=${encodeURIComponent(tripId)}`, {
    cache: 'no-store',
    credentials: 'same-origin',
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const data = await safeJson(response)
  return normalizeTripDetail(data)
}
