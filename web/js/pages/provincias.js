document.addEventListener('DOMContentLoaded', async () => {
    const wrap = document.getElementById('provincias-wrap');
    const searchInput = document.getElementById('buscador-input');
    const searchButton = document.getElementById('buscador-btn');
    const fallbackImage = '../../img/logos/raices-viajeras-logo0.webp';
    let provincias = [];
    let provinciasLoaded = false;

    if (!wrap) return;

    const normalizeText = (value) => (value || '').toString().trim().toLowerCase();
    const getProvinceUrl = (provinceId) => `destinos.html?provincia_id=${encodeURIComponent(provinceId)}`;

    const createMessage = (message, className) => {
        wrap.innerHTML = '';

        const col = document.createElement('div');
        col.className = 'col-12';

        const text = document.createElement('p');
        text.className = className;
        text.textContent = message;

        col.appendChild(text);
        wrap.appendChild(col);
    };

    const renderProvincias = (items) => {
        wrap.innerHTML = '';

        if (!items.length) {
            createMessage('No se han encontrado provincias para esa busqueda.', 'text-muted');
            return;
        }

        items.forEach((provincia) => {
            const hasTrips = Number(provincia.viajes_count) > 0;
            const provinceUrl = getProvinceUrl(provincia.id);

            const col = document.createElement('div');
            col.className = 'col-6 col-lg-4 mb-4';

            const card = document.createElement('div');
            card.className = 'ca-card';

            if (!hasTrips) {
                card.classList.add('card-disabled');
            }

            const img = document.createElement('img');
            img.className = 'ca-card-img';
            img.alt = provincia.nombre || '';
            img.src = provincia.imagen || fallbackImage;

            const overlay = document.createElement('div');
            overlay.className = 'ca-card-overlay';

            const body = document.createElement('div');
            body.className = 'ca-card-body';

            const name = document.createElement('span');
            name.className = 'ca-card-name';
            name.textContent = provincia.nombre || '';

            const button = document.createElement(hasTrips ? 'a' : 'span');
            button.className = 'ca-card-btn';
            button.textContent = hasTrips ? 'Ver destinos' : 'Sin viajes disponibles';

            if (hasTrips) {
                button.href = provinceUrl;
                button.addEventListener('click', (event) => {
                    event.stopPropagation();
                });

                card.addEventListener('click', () => {
                    window.location.href = provinceUrl;
                });
            }

            body.appendChild(name);
            body.appendChild(button);

            card.appendChild(img);
            card.appendChild(overlay);
            card.appendChild(body);
            col.appendChild(card);
            wrap.appendChild(col);
        });
    };

    const applySearch = () => {
        if (!provinciasLoaded) return;

        const query = normalizeText(searchInput ? searchInput.value : '');

        if (!query) {
            renderProvincias(provincias);
            return;
        }

        const filtered = provincias.filter((provincia) => {
            const haystack = `${normalizeText(provincia.nombre)} ${normalizeText(provincia.descripcion)}`;
            return haystack.includes(query);
        });

        renderProvincias(filtered);
    };

    if (searchInput) {
        searchInput.addEventListener('input', applySearch);
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                applySearch();
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', applySearch);
    }

    try {
        const res = await fetch('../php/get_provincias.php', { cache: 'no-store', credentials: 'same-origin' });
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const data = await res.json();

        if (!Array.isArray(data) || data.length === 0) {
            provinciasLoaded = true;
            createMessage('No hay provincias para mostrar.', 'text-muted');
            return;
        }

        provincias = data;
        provinciasLoaded = true;
        applySearch();
    } catch (err) {
        console.error(err);
        createMessage('Error cargando provincias.', 'text-danger');
    }
});
