import { useEffect, useMemo, useState } from 'react'
import { CatalogCard } from '../components/CatalogCard'
import { assetPath, backendPath, buildArticleUrl } from '../lib/routes'

const API_URL = backendPath('/php/noticias_api.php')

function normalizeText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function normalizeCategory(value) {
  return normalizeText(value)
}

function getNewsImageSrc(imagePath) {
  const normalizedPath = String(imagePath ?? '').trim().replace(/\\/g, '/')

  if (!normalizedPath) return ''
  if (/^(data:|https?:\/\/|\/\/)/i.test(normalizedPath)) return normalizedPath

  const withoutLeadingDots = normalizedPath.replace(/^(\.\.\/)+/, '').replace(/^\/+/, '')
  if (withoutLeadingDots.startsWith('img/')) {
    return assetPath(withoutLeadingDots)
  }

  return assetPath(`img/${withoutLeadingDots}`)
}

function NewsCard({ noticia }) {
  const description = (noticia.descripcion || '').trim()
  const excerpt = description.length > 140 ? `${description.slice(0, 140).trim()}...` : description

  return (
    <div className="col mb-3">
      <CatalogCard
        variant="blog"
        className="h-100"
        eyebrow={noticia.categoria || 'Blog'}
        title={noticia.nombre || ''}
        description={excerpt}
        imageAlt={noticia.nombre || ''}
        imageSrc={getNewsImageSrc(noticia.imagen)}
        href={buildArticleUrl(noticia.id)}
        primaryActionLabel="Leer noticia completa"
      />
    </div>
  )
}

export default function BlogPage() {
  const [todasLasNoticias, setTodasLasNoticias] = useState([])
  const [categoriaActiva, setCategoriaActiva] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    // El blog se descarga una vez y luego filtramos en cliente para que el cambio de categoría sea inmediato.
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((noticias) => {
        setTodasLasNoticias(noticias)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error cargando noticias:', err)
        setError('No se pudieron cargar las noticias.')
        setLoading(false)
      })
  }, [])

  const categoriasDisponibles = useMemo(() => {
    const seen = new Map()
    const pushCategory = (value) => {
      const label = String(value ?? '').trim()
      const normalized = normalizeCategory(label)

      if (!normalized || seen.has(normalized)) {
        return
      }

      seen.set(normalized, label)
    }

    todasLasNoticias.forEach((noticia) => pushCategory(noticia.categoria))
    ;['Turismo', 'Sostenible'].forEach(pushCategory)

    return [
      { label: 'Todas', value: '' },
      ...Array.from(seen.values()).map((label) => ({ label, value: label })),
    ]
  }, [todasLasNoticias])

  const noticiasFiltradas = useMemo(() => {
    const terminoBusqueda = normalizeText(busqueda)
    const terminoCategoria = normalizeCategory(categoriaActiva)

    if (!terminoBusqueda && !terminoCategoria) {
      return todasLasNoticias
    }

    return todasLasNoticias.filter((n) => {
      const categoria = normalizeCategory(n.categoria)
      const nombre = normalizeText(n.nombre)
      const descripcion = normalizeText(n.descripcion)
      const matchesCategory = !terminoCategoria || categoria === terminoCategoria
      const matchesText =
        !terminoBusqueda || `${nombre} ${descripcion} ${categoria}`.includes(terminoBusqueda)

      return matchesCategory && matchesText
    })
  }, [busqueda, categoriaActiva, todasLasNoticias])

  function handleCategoria(valor) {
    setCategoriaActiva(valor)
    setBusqueda('')
  }

  function handleBusquedaChange(e) {
    setBusqueda(e.target.value)
    setCategoriaActiva('')
  }

  function handleBuscar() {
    setCategoriaActiva(busqueda.trim())
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleBuscar()
  }

  return (
    <main className="container mt-4 px-4" aria-describedby="desc-buscador">
      <div className="row">
        <div className="col-12 col-xl-3 order-1 order-xl-2 mb-4">
          <div className="mb-4">
            <h6 className="fw-bold">Buscar por categoría</h6>
            <div className="input-group">
              <input
                type="text"
                id="buscador-categoria"
                className="form-control form-control-sm"
                placeholder="Escribe una categoría..."
                aria-label="Buscar por categoría"
                value={busqueda}
                onChange={handleBusquedaChange}
                onKeyDown={handleKeyDown}
              />
              <button className="btn btn-success btn-sm" id="btn-buscar" onClick={handleBuscar}>
                Buscar
              </button>
            </div>
          </div>

          <div>
            <h6 className="fw-bold" aria-describedby="desc-categorias">
              Categorías
            </h6>
            <ul className="list-group" id="lista-categorias">
              {categoriasDisponibles.map((cat) => (
                <li
                  key={cat.label}
                  className={`list-group-item list-group-item-action${
                    normalizeCategory(categoriaActiva) === normalizeCategory(cat.value) && !busqueda
                      ? ' active'
                      : ''
                  }`}
                  data-categoria={cat.value}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCategoria(cat.value)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleCategoria(cat.value)}
                  aria-pressed={normalizeCategory(categoriaActiva) === normalizeCategory(cat.value)}
                >
                  {cat.label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="col-12 col-xl-9 order-2 order-xl-1">
          <div
            className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 pt-3"
            id="noticias-container"
            aria-describedby="desc-noticias"
          >
            {loading && (
              <div className="col-12">
                <div className="text-center my-5">
                  <div className="spinner-border text-success" role="status"></div>
                </div>
              </div>
            )}

            {!loading && error && (
              <div className="col-12">
                <p className="text-danger ms-3">{error}</p>
              </div>
            )}

            {!loading && !error && noticiasFiltradas.length === 0 && (
              <div className="col-12">
                <p className="text-muted ms-3">No hay noticias en esta categoría.</p>
              </div>
            )}

            {!loading && !error && noticiasFiltradas.map((noticia) => <NewsCard key={noticia.id} noticia={noticia} />)}
          </div>
        </div>
      </div>
    </main>
  )
}
