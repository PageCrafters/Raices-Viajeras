let todasLasNoticias = [];

function renderNoticias(noticias) {
    const container = document.getElementById('noticias-container');
    container.innerHTML = '';
    if (noticias.length === 0) {
        container.innerHTML = '<p class="text-muted ms-3">No hay noticias en esta categoría.</p>';
        return;
    }
    noticias.forEach(n => {
        container.innerHTML += `
            <div class="col mb-3">
                <div class="card h-100 shadow-sm">
                    <img src="../img/${n.imagen}" class="card-img-top" alt="${n.nombre}" style="height: 160px; object-fit: cover;">
                    <div class="card-body d-flex flex-column">
                        <span class="badge bg-success mb-2 align-self-start" aria-label="Categoría">${n.categoria}</span>
                        <h6 class="card-title fw-bold" aria-label="Título de la noticia">${n.nombre}</h6>
                        <p class="card-text text-muted small" aria-label="Descripción de la noticia">
                            ${n.descripcion.substring(0, 100)}...
                        </p>
                        <a href="articulo.html?id=${n.id}" class="btn btn-success btn-sm mt-auto" aria-label="Leer noticia completa">
                            Leer noticia completa
                        </a>
                    </div>
                </div>
            </div>`;
    });
}

function filtrarPorCategoria(categoria, elemento) {
    document.querySelectorAll('#lista-categorias .list-group-item').forEach(li => {
        li.classList.remove('active');
    });
    if (elemento) elemento.classList.add('active');

    const filtradas = categoria === ''
        ? todasLasNoticias
        : todasLasNoticias.filter(n => n.categoria.toLowerCase() === categoria.toLowerCase());

    renderNoticias(filtradas);
}

fetch('../php/noticias_api.php')
    .then(res => res.json())
    .then(noticias => {
        todasLasNoticias = noticias;
        renderNoticias(todasLasNoticias);

        document.querySelectorAll('#lista-categorias .list-group-item').forEach(li => {
            li.addEventListener('click', () => {
                filtrarPorCategoria(li.dataset.categoria, li);
            });
        });

        document.getElementById('buscador-categoria').addEventListener('input', (e) => {
            filtrarPorCategoria(e.target.value.trim(), null);
        });

        document.getElementById('btn-buscar').addEventListener('click', () => {
            const texto = document.getElementById('buscador-categoria').value.trim();
            filtrarPorCategoria(texto, null);
        });
    })
    .catch(err => console.error('Error cargando noticias:', err));