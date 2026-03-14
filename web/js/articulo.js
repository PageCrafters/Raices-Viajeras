const params = new URLSearchParams(window.location.search);
const id = params.get('id');

if (id) {
    fetch(`../php/noticias_api.php?id=${id}`)
        .then(res => res.json())
        .then(noticia => {
            document.title = noticia.nombre + ' - RV';
            document.getElementById('articulo-container').innerHTML = `
                <a href="blog.html" class="btn btn-outline-success btn-sm mb-4">← Volver al blog</a>
                <img src="../img/${noticia.imagen}" class="img-fluid rounded mb-4 w-100" style="max-height: 400px; object-fit: cover;" alt="${noticia.nombre}">
                <span class="badge bg-success mb-3">${noticia.categoria}</span>
                <h1 class="fw-bold mb-3">${noticia.nombre}</h1>
                <p class="lead">${noticia.descripcion}</p>
            `;
        })
        .catch(err => console.error('Error cargando noticia:', err));
} else {
    document.getElementById('articulo-container').innerHTML = `
        <p class="text-danger">No se ha encontrado la noticia.</p>
        <a href="blog.html" class="btn btn-outline-success btn-sm">← Volver al blog</a>
    `;
}