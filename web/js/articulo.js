const request = typeof window.rvFetch === 'function'
    ? window.rvFetch.bind(window)
    : window.fetch.bind(window);

/**
 * Resuelve el src del detalle del blog sin romper rutas ya completas
 *
 * @param {string|null|undefined} imagePath Ruta o nombre de imagen recibido desde la API
 * @returns {string} Ruta lista para usar en la imagen
 */
function getArticleImageSrc(imagePath) {
    const normalizedPath = String(imagePath ?? '').trim().replace(/\\/g, '/');
    if (!normalizedPath) {
        return '';
    }

    if (/^(data:|https?:\/\/|\/\/|\/|\.\.?\/)/i.test(normalizedPath)) {
        return normalizedPath;
    }

    if (normalizedPath.startsWith('img/')) {
        return `../${normalizedPath}`;
    }

    return `../img/${normalizedPath.replace(/^\/+/, '')}`;
}

/**
 * Saca el id del articulo desde la URL actual
 *
 * @returns {string|null} Id del articulo o `null` si no viene en la query
 */
function getArticleId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

/**
 * Pinta un mensaje simple cuando falta el id o falla la carga
 *
 * @param {string} message Texto a mostrar en pantalla
 * @returns {void}
 */
function renderArticleMessage(message) {
    const container = document.getElementById('articulo-container');
    if (!container) {
        return;
    }

    container.innerHTML = `
        <p class="text-danger">${message}</p>
        <a href="blog.html" class="btn btn-outline-success btn-sm">Volver al blog</a>
    `;
}

/**
 * Pinta el articulo completo en la pagina de detalle
 *
 * @param {object} article Datos del articulo devueltos por la API
 * @returns {void}
 */
function renderArticle(article) {
    const container = document.getElementById('articulo-container');
    if (!container) {
        return;
    }

    document.title = `${article.nombre} - RV`;
    container.innerHTML = `
        <a href="blog.html" class="btn btn-outline-success btn-sm mb-4">Volver al blog</a>
        <img src="${getArticleImageSrc(article.imagen)}" class="img-fluid rounded mb-4 w-100" style="max-height: 400px; object-fit: cover;" alt="${article.nombre}">
        <span class="badge bg-success mb-3">${article.categoria}</span>
        <h1 class="fw-bold mb-3">${article.nombre}</h1>
        <p class="lead">${article.descripcion}</p>
    `;
}

/**
 * Carga el detalle del articulo y deja un estado claro si algo falla
 *
 * @returns {void}
 */
function loadArticle() {
    const id = getArticleId();

    if (!id) {
        renderArticleMessage('No se ha encontrado la noticia.');
        return;
    }

    request(`../php/noticias_api.php?id=${id}`)
        .then((response) => response.json())
        .then((article) => {
            renderArticle(article);
        })
        .catch((error) => {
            console.error('Error cargando noticia:', error);
            renderArticleMessage('No se ha podido cargar la noticia.');
        });
}

loadArticle();
