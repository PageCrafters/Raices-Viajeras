import { useEffect, useMemo, useState } from 'react'
import { CatalogCard } from '../components/CatalogCard'
import { fetchTripsByProvince } from '../api/catalogApi'
import { buildInfoAventuraUrl } from '../lib/routes'

function normalizeText(value) {
  return (value || '').toString().trim().toLowerCase()
}

function getProvinceId(search) {
  const params = new URLSearchParams(search)
  return params.get('provincia_id')
}

export function DestinosView({ search, onAddToCart }) {
  const provinceId = useMemo(() => getProvinceId(search), [search])
  const [trips, setTrips] = useState([])
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [buttonStateByTripId, setButtonStateByTripId] = useState({})

  useEffect(() => {
    let cancelled = false

    if (!provinceId) {
      setTrips([])
      setError('')
      setIsLoading(false)
      return () => {
        cancelled = true
      }
    }

    const loadTrips = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await fetchTripsByProvince(provinceId)
        if (!cancelled) {
          setTrips(data)
        }
      } catch {
        if (!cancelled) {
          setError('Error cargando viajes.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadTrips()
    return () => {
      cancelled = true
    }
  }, [provinceId])

  const visibleTrips = useMemo(() => {
    const normalizedQuery = normalizeText(appliedQuery)
    if (!normalizedQuery) {
      return trips
    }

    return trips.filter((trip) => {
      const haystack = `${normalizeText(trip.titulo)} ${normalizeText(trip.descripcion)}`
      return haystack.includes(normalizedQuery)
    })
  }, [appliedQuery, trips])

  const getButtonLabel = (tripId) => {
    const currentState = buttonStateByTripId[tripId]
    if (currentState === 'loading') {
      return 'Añadiendo...'
    }

    if (currentState === 'added') {
      return 'Añadido'
    }

    return 'Añadir a la cesta'
  }

  const handleAddToCart = async (tripId) => {
    setButtonStateByTripId((current) => ({
      ...current,
      [tripId]: 'loading',
    }))

    try {
      await onAddToCart(tripId)
      setButtonStateByTripId((current) => ({
        ...current,
        [tripId]: 'added',
      }))

      window.setTimeout(() => {
        setButtonStateByTripId((current) => ({
          ...current,
          [tripId]: 'idle',
        }))
      }, 1400)
    } catch {
      setButtonStateByTripId((current) => ({
        ...current,
        [tripId]: 'idle',
      }))
    }
  }

  return (
    <>
      <section className="buscador-hero">
        <div className="buscador-bg-blob"></div>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12 col-lg-8 text-center">
              <p className="buscador-eyebrow">Tu próxima aventura sostenible</p>
              <h1 className="buscador-title">
                ¿A dónde te llaman
                <br />
                <em>tus raíces</em> hoy?
              </h1>
              <p className="buscador-subtitle">
                Filtra los viajes de esta provincia y elige la experiencia que mejor encaja
                contigo.
              </p>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-12 col-lg-8" style={{ marginBottom: '1%' }}>
              <div className="buscador-box">
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  className="buscador-input"
                  placeholder="Título o descripción del viaje..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                    }
                  }}
                />
                <button
                  className="buscador-btn"
                  type="button"
                  onClick={() => setAppliedQuery(query)}
                >
                  Buscar viaje
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="destinos-section">
        <div className="container">
          <div className="row g-4" id="viajes-wrap">
            {!provinceId ? (
              <div className="col-12">
                <p className="text-muted">Provincia no especificada.</p>
              </div>
            ) : null}

            {provinceId && isLoading ? (
              <div className="col-12">
                <p className="text-muted">Cargando viajes...</p>
              </div>
            ) : null}

            {provinceId && !isLoading && error ? (
              <div className="col-12">
                <p className="text-danger">{error}</p>
              </div>
            ) : null}

            {provinceId && !isLoading && !error && trips.length === 0 ? (
              <div className="col-12">
                <p className="text-muted">No hay viajes en esta provincia.</p>
              </div>
            ) : null}

            {provinceId && !isLoading && !error && trips.length > 0 && visibleTrips.length === 0 ? (
              <div className="col-12">
                <p className="text-muted">No se han encontrado viajes para esa búsqueda.</p>
              </div>
            ) : null}

            {provinceId && !isLoading && !error
              ? visibleTrips.map((trip) => {
                  const tripUrl = buildInfoAventuraUrl(trip.id)

                  return (
                    <div key={trip.id} className="col-12 col-md-6 col-xl-4">
                      <CatalogCard
                        variant="trip"
                        imageAlt={trip.titulo || ''}
                        imageSrc={trip.imagen}
                        title={trip.titulo || ''}
                        href={tripUrl}
                        price={trip.precio}
                        primaryActionLabel="Ver aventura"
                        secondaryActionLabel={getButtonLabel(trip.id)}
                        secondaryActionOnClick={() => handleAddToCart(trip.id)}
                        secondaryActionDisabled={buttonStateByTripId[trip.id] === 'loading'}
                      />
                    </div>
                  )
                })
              : null}
          </div>
        </div>
      </section>
    </>
  )
}
