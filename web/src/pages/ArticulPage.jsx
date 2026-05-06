import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const API_URL = "/php/noticias_api.php";

function getArticleImageSrc(imagePath) {
  const normalizedPath = String(imagePath ?? "").trim().replace(/\\/g, "/");
  if (!normalizedPath) return "";
  if (/^(data:|https?:\/\/|\/\/|\/|\.\.?\/)/i.test(normalizedPath)) return normalizedPath;
  if (normalizedPath.startsWith("img/")) return `../${normalizedPath}`;
  return `../img/${normalizedPath.replace(/^\/+/, "")}`;
}


export default function ArticuloPages() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [articulo, setArticulo] = useState(null);
  const [fetched, setFetched] = useState(false);  
  const [error, setError] = useState(null);

  const loading = id && !fetched;

  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}?id=${id}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data) throw new Error("Noticia no encontrada");
        document.title = `${data.nombre} - RV`;
        setArticulo(data);
        setFetched(true);
      })
      .catch((err) => {
        console.error("Error cargando noticia:", err);
        setError("No se ha podido cargar la noticia.");
        setFetched(true);
      });
  }, [id]);

  if (!id) {
    return (
      <article className="container mt-5 px-4">
        <p className="text-danger">No se ha encontrado la noticia.</p>
        <a href="/blog" className="btn btn-outline-success btn-sm">Volver al blog</a>
      </article>
    );
  }

  return (
    <article
      className="container mt-5 px-4"
      id="articulo-container"
      aria-describedby="desc-articulo"
    >
      {loading && (
        <div className="text-center my-5">
          <div className="spinner-border text-success" role="status"></div>
        </div>
      )}

      {!loading && error && (
        <>
          <p className="text-danger">{error}</p>
          <a href="/blog" className="btn btn-outline-success btn-sm">
            Volver al blog
          </a>
        </>
      )}

      {!loading && !error && articulo && (
        <>
          <a href="/blog" className="btn btn-outline-success btn-sm mb-4">
            Volver al blog
          </a>
          <img
            src={getArticleImageSrc(articulo.imagen)}
            className="img-fluid rounded mb-4 w-100"
            style={{ maxHeight: "400px", objectFit: "cover" }}
            alt={articulo.nombre}
          />
          <span className="badge bg-success mb-3">{articulo.categoria}</span>
          <h1 className="fw-bold mb-3">{articulo.nombre}</h1>
          <p className="lead">{articulo.descripcion}</p>
        </>
      )}
    </article>
  );
}