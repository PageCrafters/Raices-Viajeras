let todasLasNoticias = [];
const request = typeof window.rvFetch === 'function'
    ? window.rvFetch.bind(window)
    : window.fetch.bind(window);

/**
 * Resuelve el src final del blog sin duplicar prefijos cuando la API ya trae una ruta usable
 *
 * @param {string|null|undefined} imagePath Ruta o nombre de imagen recibido desde la API
 * @returns {string} Ruta lista para usar en el atributo src
 */
function getNewsImageSrc(imagePath) {
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
 * Pinta la rejilla del blog con las noticias que toquen en ese momento
 *
 * @param {Array<object>} noticias Lista de noticias a mostrar
 * @returns {void}
 */
function renderNoticias(noticias) {
    const container = document.getElementById('noticias-container');
    if (!container) {
        return;
    }

    container.innerHTML = '';

    if (!noticias.length) {
        container.innerHTML = '<p class="text-muted ms-3">No hay noticias en esta categoría.</p>';
        return;
    }

    noticias.forEach((noticia) => {
        container.innerHTML += `
            <div class="col mb-3">
                <div class="card h-100 shadow-sm">
                    <img src="${getNewsImageSrc(noticia.imagen)}" class="card-img-top" alt="${noticia.nombre}" style="height: 160px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-success mb-2 align-self-start">${noticia.categoria}</span>
                        <h6 class="card-title fw-bold">${noticia.nombre}</h6>
                        <p class="card-text text-muted small">${noticia.descripcion.substring(0, 100)}...</p>
                        <a href="articulo.html?id=${noticia.id}" class="btn btn-success btn-sm mt-auto">Leer noticia completa</a>
                    </div>
                </div>
            </div>
        `;
    });
}

/**
 * Filtra las noticias ya cargadas sin pedir datos otra vez
 *
 * @param {string} categoria Categoria o texto del filtro
 * @param {HTMLElement|null} elemento Elemento activo del listado lateral
 * @returns {void}
 */
function filtrarPorCategoria(categoria, elemento) {
    document.querySelectorAll('#lista-categorias .list-group-item').forEach((item) => {
        item.classList.remove('active');
    });

    if (elemento) {
        elemento.classList.add('active');
    }

    const filtradas = categoria === ''
        ? todasLasNoticias
        : todasLasNoticias.filter((noticia) => noticia.categoria.toLowerCase() === categoria.toLowerCase());

    renderNoticias(filtradas);
}

/**
 * Carga las noticias iniciales y conecta los filtros del blog
 *
 * @returns {void}
 */
function initBlog() {
    request('../php/noticias_api.php')
        .then((response) => response.json())
        .then((noticias) => {
            todasLasNoticias = noticias;
            renderNoticias(todasLasNoticias);

            document.querySelectorAll('#lista-categorias .list-group-item').forEach((item) => {
                item.addEventListener('click', () => {
                    filtrarPorCategoria(item.dataset.categoria, item);
                });
            });

            document.getElementById('buscador-categoria')?.addEventListener('input', (event) => {
                filtrarPorCategoria(event.target.value.trim(), null);
            });

            document.getElementById('btn-buscar')?.addEventListener('click', () => {
                const texto = document.getElementById('buscador-categoria')?.value.trim() || '';
                filtrarPorCategoria(texto, null);
            });
        })
        .catch((error) => console.error('Error cargando noticias:', error));
}

initBlog();
