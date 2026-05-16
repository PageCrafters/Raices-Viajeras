import { useEffect, useMemo, useState } from 'react'
import { fetchTripDetail } from '../api/catalogApi'
import { formatCurrency } from '../lib/cartUi'
import { APP_PATHS, buildDestinosUrl } from '../lib/routes'

const DEFAULT_BACK_URL = APP_PATHS.provincias

function getTripId(search) {
  const params = new URLSearchParams(search)
  return params.get('viaje')
}

function formatDate(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function getTripDescription(trip) {
  const tripDescription = (trip?.descripcion || '').toString().trim()
  if (tripDescription) {
    return tripDescription
  }

  const provinceDescription = (trip?.provincia_descripcion || '').toString().trim()
  if (provinceDescription) {
    return provinceDescription
  }

  return 'Sin descripciÃ³n disponible.'
}

export function InfoAventuraView({ search, onAddToCart }) {
  const tripId = useMemo(() => getTripId(search), [search])
  const [trip, setTrip] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [addButtonState, setAddButtonState] = useState('idle')

  useEffect(() => {
    let cancelled = false

    if (!tripId) {
      return () => {
        cancelled = true
      }
    }

    const loadDetail = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await fetchTripDetail(tripId)
        if (!cancelled) {
          setTrip(data)
        }
      } catch {
        if (!cancelled) {
          setError('Error cargando informaciÃ³n del viaje.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadDetail()
    return () => {
      cancelled = true
    }
  }, [tripId])

  const backUrl = useMemo(() => {
    if (trip?.provincia_id) {
      return buildDestinosUrl(trip.provincia_id)
    }

    return DEFAULT_BACK_URL
  }, [trip])

  const handleAddToCart = async () => {
    if (!trip?.id) {
      return
    }

    setAddButtonState('loading')

    try {
      await onAddToCart(trip.id)
      setAddButtonState('added')

      window.setTimeout(() => {
        setAddButtonState('idle')
      }, 1400)
    } catch {
      setAddButtonState('idle')
    }
  }

  const addButtonLabel =
    addButtonState === 'loading'
      ? 'AÃ±adiendo...'
      : addButtonState === 'added'
        ? 'AÃ±adido'
        : 'AÃ±adir a la cesta'

  return (
    <main className="info-trip-shell">
      <div className="container">
        <div id="viaje-detail">
          {!tripId ? (
            <div className="info-trip-empty">
              <p className="text-muted mb-3">Viaje no especificado.</p>
              <a className="info-trip-btn info-trip-btn-secondary" href={DEFAULT_BACK_URL}>
                Volver a provincias
              </a>
            </div>
          ) : null}

          {tripId && isLoading ? (
            <div className="info-trip-empty">
              <p className="text-muted mb-0">Cargando informaciÃ³n del viaje...</p>
            </div>
          ) : null}

          {tripId && !isLoading && error ? (
            <div className="info-trip-empty">
              <p className="text-danger mb-3">{error}</p>
              <a className="info-trip-btn info-trip-btn-secondary" href={DEFAULT_BACK_URL}>
                Volver a provincias
              </a>
            </div>
          ) : null}

          {tripId && !isLoading && !error && !trip ? (
            <div className="info-trip-empty">
              <p className="text-muted mb-3">Viaje no encontrado.</p>
              <a className="info-trip-btn info-trip-btn-secondary" href={DEFAULT_BACK_URL}>
                Volver a provincias
              </a>
            </div>
          ) : null}

          {tripId && !isLoading && !error && trip ? (
            <article className="info-trip-card">
              <div className="row g-0">
                <div className="col-12 col-lg-5">
                  <div className="info-trip-media">
                    <img src={trip.imagen} alt={trip.titulo || 'Viaje'} />
                  </div>
                </div>

                <div className="col-12 col-lg-7">
                  <div className="info-trip-body">
                    <p className="info-trip-kicker">{trip.provincia_nombre || 'Experiencia sostenible'}</p>
                    <h1 className="info-trip-title">{trip.titulo || 'Viaje'}</h1>
                    <p className="info-trip-description">{getTripDescription(trip)}</p>

                    <div className="info-trip-meta">
                      {[
                        ['Provincia', trip.provincia_nombre || '-'],
                        ['Origen', trip.origen || '-'],
                        ['Fecha de inicio', formatDate(trip.fecha_inicio)],
                        ['Fecha de fin', formatDate(trip.fecha_fin)],
                        ['Plazas', trip.plazas ?? '-'],
                        ['Tipo', 'Aventura sostenible'],
                      ].map(([label, value]) => (
                        <div key={label} className="info-trip-meta-card">
                          <span className="info-trip-meta-label">{label}</span>
                          <span className="info-trip-meta-value">{String(value)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="info-trip-footer">
                      <div className="info-trip-price-box">
                        <span className="info-trip-price-label">Precio actual</span>
                        <span className="info-trip-price">{formatCurrency(trip.precio)}</span>
                      </div>

                      <div className="info-trip-actions">
                        <button
                          type="button"
                          className="info-trip-btn info-trip-btn-primary"
                          onClick={handleAddToCart}
                          disabled={addButtonState === 'loading'}
                        >
                          <i className="bi bi-basket-fill" aria-hidden="true"></i>
                          {addButtonLabel}
                        </button>

                        <a href={backUrl} className="info-trip-btn info-trip-btn-secondary">
                          Volver a destinos
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </div>
    </main>
  )
}
