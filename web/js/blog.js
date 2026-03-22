let todasLasNoticias = [];

/**
 * Pinta la rejilla del blog con las noticias que toquen en ese momento.
 *
 * @param {Array<object>} noticias Lista de noticias a mostrar.
 * @returns {void}
 */
function renderNoticias(noticias) {
    const container = document.getElementById('noticias-container');
    if (!container) {
        return;
    }

    container.replaceChildren();

    if (!noticias.length) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'text-muted ms-3';
        emptyMessage.textContent = 'No hay noticias en esta categoría.';
        container.appendChild(emptyMessage);
        return;
    }

    const fragment = document.createDocumentFragment();

    noticias.forEach((noticia) => {
        const col = document.createElement('div');
        col.className = 'col mb-3';

        const card = document.createElement('div');
        card.className = 'card h-100 shadow-sm';

        const img = document.createElement('img');
        img.src = `../img/${noticia.imagen}`;
        img.className = 'card-img-top';
        img.alt = noticia.nombre;
        img.style.height = '160px';
        img.style.objectFit = 'cover';

        const body = document.createElement('div');
        body.className = 'card-body d-flex flex-column';

        const badge = document.createElement('span');
        badge.className = 'badge bg-success mb-2 align-self-start';
        badge.textContent = noticia.categoria;

        const title = document.createElement('h6');
        title.className = 'card-title fw-bold';
        title.textContent = noticia.nombre;

        const description = document.createElement('p');
        description.className = 'card-text text-muted small';
        description.textContent = `${noticia.descripcion.substring(0, 100)}...`;

        const link = document.createElement('a');
        link.href = `articulo.html?id=${noticia.id}`;
        link.className = 'btn btn-success btn-sm mt-auto';
        link.textContent = 'Leer noticia completa';

        body.appendChild(badge);
        body.appendChild(title);
        body.appendChild(description);
        body.appendChild(link);

        card.appendChild(img);
        card.appendChild(body);
        col.appendChild(card);
        fragment.appendChild(col);
    });

    container.appendChild(fragment);
}

/**
 * Filtra las noticias ya cargadas sin pedir datos otra vez.
 *
 * @param {string} categoria Categoria o texto del filtro.
 * @param {HTMLElement|null} elemento Elemento activo del listado lateral.
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
 * Carga las noticias iniciales y conecta los filtros del blog.
 *
 * @returns {void}
 */
function initBlog() {
    fetch('../php/noticias_api.php')
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
