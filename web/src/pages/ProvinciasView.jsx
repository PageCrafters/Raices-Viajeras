import { useEffect, useMemo, useState } from 'react'
import { CatalogCard } from '../components/CatalogCard'
import { fetchProvinces } from '../api/catalogApi'
import { buildDestinosUrl } from '../lib/routes'

function normalizeText(value) {
  return (value || '').toString().trim().toLowerCase()
}

export function ProvinciasView() {
  const [provinces, setProvinces] = useState([])
  const [query, setQuery] = useState('')
  const [appliedQuery, setAppliedQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    const loadProvinces = async () => {
      setIsLoading(true)
      setError('')

      try {
        const data = await fetchProvinces()
        if (!cancelled) {
          setProvinces(data)
        }
      } catch {
        if (!cancelled) {
          setError('Error cargando provincias.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadProvinces()
    return () => {
      cancelled = true
    }
  }, [])

  const visibleProvinces = useMemo(() => {
    const normalizedQuery = normalizeText(appliedQuery)
    if (!normalizedQuery) {
      return provinces
    }

    return provinces.filter((province) => {
      const haystack = `${normalizeText(province.nombre)} ${normalizeText(province.descripcion)}`
      return haystack.includes(normalizedQuery)
    })
  }, [appliedQuery, provinces])

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
                Más de 20 destinos verificados. Filtra por comunidad, tipo de experiencia o estilo
                de viaje y encuentra el que late al ritmo de la naturaleza.
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
                  placeholder="Destino, actividad o comunidad autónoma..."
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
                  Buscar provincia
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="destinos-section">
        <div className="container">
          <div className="row" id="provincias-wrap">
            {isLoading ? (
              <div className="col-12">
                <p className="text-muted">Cargando provincias...</p>
              </div>
            ) : null}

            {!isLoading && error ? (
              <div className="col-12">
                <p className="text-danger">{error}</p>
              </div>
            ) : null}

            {!isLoading && !error && provinces.length === 0 ? (
              <div className="col-12">
                <p className="text-muted">No hay provincias para mostrar.</p>
              </div>
            ) : null}

            {!isLoading && !error && provinces.length > 0 && visibleProvinces.length === 0 ? (
              <div className="col-12">
                <p className="text-muted">No se han encontrado provincias para esa búsqueda.</p>
              </div>
            ) : null}

            {!isLoading && !error
              ? visibleProvinces.map((province) => {
                  const hasTrips = Number(province.viajes_count) > 0
                  const provinceUrl = buildDestinosUrl(province.id)

                  return (
                    <div key={province.id} className="col-6 col-lg-4 mb-4">
                      <CatalogCard
                        imageAlt={province.nombre || ''}
                        imageSrc={province.imagen}
                        title={province.nombre || ''}
                        href={hasTrips ? provinceUrl : undefined}
                        disabled={!hasTrips}
                        primaryActionLabel={hasTrips ? 'Ver destinos' : 'Sin viajes disponibles'}
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
