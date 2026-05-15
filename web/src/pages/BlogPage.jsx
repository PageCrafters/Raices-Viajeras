import { useState, useEffect } from "react";
import { CatalogCard } from "../components/CatalogCard";

const API_URL = "/php/noticias_api.php";

const CATEGORIAS = [
  { label: "Turismo",    value: "Turismo"    },
  { label: "Sostenible", value: "Sostenible" },
  { label: "Todas",      value: ""           },
];

function getNewsImageSrc(imagePath) {
  const normalizedPath = String(imagePath ?? "").trim().replace(/\\/g, "/");
  if (!normalizedPath) return "";
  if (/^(data:|https?:\/\/|\/\/|\/|\.\.?\/)/i.test(normalizedPath)) return normalizedPath;
  if (normalizedPath.startsWith("img/")) return `../${normalizedPath}`;
  return `../img/${normalizedPath.replace(/^\/+/, "")}`;
}

export default function Blog() {
  const [todasLasNoticias, setTodasLasNoticias]   = useState([]);
  const [noticiasFiltradas, setNoticiasFiltradas] = useState([]);
  const [categoriaActiva, setCategoriaActiva]     = useState("");
  const [busqueda, setBusqueda]                   = useState("");
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState(null);

  useEffect(() => {
    // El blog se descarga una vez y luego filtramos en cliente para que el cambio de categoría sea inmediato.
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((noticias) => {
        setTodasLasNoticias(noticias);
        setNoticiasFiltradas(noticias);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error cargando noticias:", err);
        setError("No se pudieron cargar las noticias.");
        setLoading(false);
      });
  }, []);

  function aplicarFiltro(termino) {
    const t = (termino ?? "").toLowerCase().trim();
    if (!t) {
      setNoticiasFiltradas(todasLasNoticias);
      return;
    }
    setNoticiasFiltradas(
      todasLasNoticias.filter((n) =>
        n.categoria?.toLowerCase().includes(t)
      )
    );
  }

  function handleCategoria(valor) {
    setCategoriaActiva(valor);
    setBusqueda("");
    aplicarFiltro(valor);
  }

  function handleBusquedaChange(e) {
    const texto = e.target.value;
    setBusqueda(texto);
    setCategoriaActiva("");
    aplicarFiltro(texto);
  }

  function handleBuscar() {
    aplicarFiltro(busqueda);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleBuscar()
  }

  return (
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
                    categoriaActiva === cat.value ? " active" : ""
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
            className="row row-cols-1 row-cols-sm-2 row-cols-xl-3 g-3"
            id="noticias-container"
            aria-describedby="desc-noticias"
          >
            {loading && (
              <div className="col-12">
                <p className="text-muted ms-3">Cargando noticias...</p>
              </div>
            )}

            {error && (
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
              <div className="col" key={noticia.id}>
                <CatalogCard
                  variant="trip"
                  title={noticia.nombre}
                  imageSrc={getNewsImageSrc(noticia.imagen)}
                  imageAlt={noticia.nombre}
                  href={`/articulo?id=${noticia.id}`}
                  primaryActionLabel="Leer noticia"
                  primaryActionHref={`/articulo?id=${noticia.id}`}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
