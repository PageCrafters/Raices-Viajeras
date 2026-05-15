import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { APP_PATHS, assetPath, backendPath } from '../lib/routes'

const API_URL = backendPath('/php/noticias_api.php')

function getArticleImageSrc(imagePath) {
  const normalizedPath = String(imagePath ?? '').trim().replace(/\\/g, '/')

  if (!normalizedPath) return ''
  if (/^(data:|https?:\/\/|\/\/)/i.test(normalizedPath)) return normalizedPath

  const withoutLeadingDots = normalizedPath.replace(/^(\.\.\/)+/, '').replace(/^\/+/, '')
  if (withoutLeadingDots.startsWith('img/')) {
    return assetPath(withoutLeadingDots)
  }

  return assetPath(`img/${withoutLeadingDots}`)
}

export default function ArticuloPage() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const [articulo, setArticulo] = useState(null)
  const [fetched, setFetched] = useState(false)
  const [error, setError] = useState(null)

  // Mientras no llega el id, el componente decide si mostrar carga o un aviso de enlace roto.
  const loading = Boolean(id) && !fetched

  useEffect(() => {
    if (!id) return

    fetch(`${API_URL}?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (!data) throw new Error('Noticia no encontrada')
        document.title = `${data.nombre} - RV`
        setArticulo(data)
        setFetched(true)
      })
      .catch((err) => {
        console.error('Error cargando noticia:', err)
        setError('No se ha podido cargar la noticia.')
        setFetched(true)
      })
  }, [id])

  if (!id) {
    return (
      <article className="container mt-5 px-4">
        <p className="text-danger">No se ha encontrado la noticia.</p>
        <Link to={APP_PATHS.blog} className="btn btn-outline-success btn-sm">
          Volver al blog
        </Link>
      </article>
    )
  }

  return (
    <article className="container mt-5 px-4" id="articulo-container">
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      )}

      {!loading && error && (
        <>
          <p className="text-danger">{error}</p>
          <Link to={APP_PATHS.blog} className="btn btn-outline-success btn-sm">
            Volver al blog
          </Link>
        </>
      )}

      {!loading && !error && articulo && (
        <>
          <Link to={APP_PATHS.blog} className="btn btn-outline-success btn-sm mb-4">
            Volver al blog
          </Link>
          <img
            src={getArticleImageSrc(articulo.imagen)}
            className="img-fluid rounded mb-4 w-100"
            style={{ maxHeight: '400px', objectFit: 'cover' }}
            alt={articulo.nombre}
          />
          <span className="badge bg-success mb-3">{articulo.categoria}</span>
          <h1 className="fw-bold mb-3">{articulo.nombre}</h1>
          <p className="lead">{articulo.descripcion}</p>
        </>
      )}
    </article>
  )
}