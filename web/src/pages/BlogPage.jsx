import { useState, useEffect } from "react";

const API_URL = "./php/noticias_api.php";

const CATEGORIAS = [
  { label: "Turismo",     value: "Turismo"    },
  { label: "Sostenible",  value: "Sostenible" },
  { label: "Todas",       value: ""           },
];


function getNewsImageSrc(imagePath) {
  const normalizedPath = String(imagePath ?? "").trim().replace(/\\/g, "/");
  if (!normalizedPath) return "";
  if (/^(data:|https?:\/\/|\/\/|\/|\.\.?\/)/i.test(normalizedPath)) return normalizedPath;
  if (normalizedPath.startsWith("img/")) return `../${normalizedPath}`;
  return `../img/${normalizedPath.replace(/^\/+/, "")}`;
}

function NoticiaCard({ noticia }) {
  return (
    <div className="col mb-3">
      <div className="card h-100 shadow-sm noticia-card">
        <img
          src={getNewsImageSrc(noticia.imagen)}
          className="card-img-top"
          alt={noticia.nombre}
          style={{ height: "160px", objectFit: "cover" }}
        />
        <div className="card-body d-flex flex-column">
          <span className="badge bg-success mb-2 align-self-start">
            {noticia.categoria}
          </span>
          <h6 className="card-title fw-bold">{noticia.nombre}</h6>
          <p className="card-text text-muted small">
            {noticia.descripcion?.substring(0, 100)}...
          </p>
          <a
            href={`/articulo?id=${noticia.id}`}
            className="btn btn-success btn-sm mt-auto btn-leer"
          >
            Leer noticia completa
            <span className="flecha">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function Blog() {
  const [todasLasNoticias, setTodasLasNoticias] = useState([]);
  const [categoriaActiva, setCategoriaActiva] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((noticias) => {
        setTodasLasNoticias(noticias);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando noticias:", err);
        setError("No se pudieron cargar las noticias.");
        setLoading(false);
      });
  }, []);

  const noticiasFiltradas = (() => {
    const termino = (categoriaActiva || busqueda).toLowerCase().trim();
    if (!termino) return todasLasNoticias;
    return todasLasNoticias.filter((n) =>
      n.categoria?.toLowerCase().includes(termino)
    );
  })();

  function handleCategoria(valor) {
    setCategoriaActiva(valor);
    setBusqueda("");
  }

  function handleBusquedaChange(e) {
    setBusqueda(e.target.value);
    setCategoriaActiva("");
  }

  function handleBuscar() {
    setCategoriaActiva(busqueda.trim());
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleBuscar();
  }

  return (
    <>
      {/* Estilos de animación inyectados una sola vez */}
      <div className="container mt-4 px-4" aria-describedby="desc-buscador">
        <div className="row">

          {/* Sidebar */}
          <div className="col-12 col-xl-3 order-1 order-xl-2 mb-4">

            {/* Buscador */}
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
                <button
                  className="btn btn-success btn-sm"
                  id="btn-buscar"
                  onClick={handleBuscar}
                >
                  Buscar
                </button>
              </div>
            </div>

            {/* Categorías */}
            <div>
              <h6 className="fw-bold" aria-describedby="desc-categorias">
                Categorías
              </h6>
              <ul className="list-group" id="lista-categorias">
                {CATEGORIAS.map((cat) => (
                  <li
                    key={cat.label}
                    className={`list-group-item list-group-item-action${
                      categoriaActiva === cat.value && !busqueda ? " active" : ""
                    }`}
                    data-categoria={cat.value}
                    style={{ cursor: "pointer" }}
                    onClick={() => handleCategoria(cat.value)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleCategoria(cat.value)}
                    aria-pressed={categoriaActiva === cat.value}
                  >
                    {cat.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Grid de noticias */}
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

              {!loading && !error && noticiasFiltradas.map((noticia) => (
                <NoticiaCard key={noticia.id} noticia={noticia} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}