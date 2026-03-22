document.addEventListener('DOMContentLoaded', async () => {
    const request = typeof window.rvFetch === 'function'
        ? window.rvFetch.bind(window)
        : window.fetch.bind(window);
    const wrap = document.getElementById('viajes-wrap');
    const searchInput = document.getElementById('buscador-input');
    const searchButton = document.getElementById('buscador-btn');
    const fallbackImage = '../../img/logos/raices-viajeras-logo0.webp';
    const params = new URLSearchParams(window.location.search);
    const provinceId = params.get('provincia_id');
    let trips = [];
    let tripsLoaded = false;

    if (!wrap) {
        return;
    }

    /**
     * Normaliza un texto para comparar sin depender de mayúsculas ni espacios.
     *
     * @param {unknown} value Texto original.
     * @returns {string} Texto listo para comparar.
     */
    function normalizeText(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    /**
     * Devuelve la ruta del detalle para un viaje concreto.
     *
     * @param {string|number} tripId ID del viaje.
     * @returns {string} URL del detalle.
     */
    function getTripUrl(tripId) {
        return `infoAventura.html?viaje=${encodeURIComponent(tripId)}`;
    }

    /**
     * Formatea el precio con estilo local.
     *
     * @param {number|string} value Importe que se quiere mostrar.
     * @returns {string} Importe listo para pintar.
     */
    function formatCurrency(value) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(Number(value || 0));
    }

    /**
     * Pinta un mensaje simple en la zona del listado.
     *
     * @param {string} message Texto a mostrar.
     * @param {string} className Clase visual para ese mensaje.
     * @returns {void}
     */
    function createMessage(message, className) {
        wrap.innerHTML = '';

        const col = document.createElement('div');
        col.className = 'col-12';

        const text = document.createElement('p');
        text.className = className;
        text.textContent = message;

        col.appendChild(text);
        wrap.appendChild(col);
    }

    /**
     * Espera a que la API global de la cesta esté lista.
     *
     * @returns {Promise<Function>} Función global para añadir items al carrito.
     */
    function waitForCartApi() {
        if (typeof window.rvCartAddItem === 'function') {
            return Promise.resolve(window.rvCartAddItem);
        }

        return new Promise((resolve, reject) => {
            const timeoutId = window.setTimeout(() => {
                reject(new Error('La cesta todavía no está lista.'));
            }, 2500);

            document.addEventListener('rv:cesta-ready', () => {
                window.clearTimeout(timeoutId);
                resolve(window.rvCartAddItem);
            }, { once: true });
        });
    }

    /**
     * Cambia el texto de un botón un momento para dar feedback rápido.
     *
     * @param {HTMLButtonElement} button Botón que se quiere actualizar.
     * @param {string} text Texto temporal.
     * @param {string} originalText Texto al que debe volver.
     * @returns {void}
     */
    function pulseButtonState(button, text, originalText) {
        button.textContent = text;

        window.setTimeout(() => {
            button.textContent = originalText;
        }, 1400);
    }

    /**
     * Añade un viaje al carrito compartido.
     *
     * @param {number|string} tripId ID del viaje.
     * @param {HTMLButtonElement} button Botón que lanza la acción.
     * @returns {Promise<void>}
     */
    async function handleAddToCart(tripId, button) {
        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Añadiendo...';

        try {
            const addToCart = await waitForCartApi();
            await addToCart(tripId);
            pulseButtonState(button, 'Añadido', originalText);
        } catch (error) {
            console.error('No se pudo añadir el viaje:', error);
            button.textContent = originalText;
        } finally {
            button.disabled = false;
        }
    }

    /**
     * Pinta las tarjetas de viajes usando el mismo patrón visual que provincias.
     *
     * @param {Array<object>} items Viajes que se van a pintar.
     * @returns {void}
     */
    function renderTrips(items) {
        wrap.innerHTML = '';

        if (!items.length) {
            createMessage('No se han encontrado viajes para esa búsqueda.', 'text-muted');
            return;
        }

        items.forEach((trip) => {
            const tripUrl = getTripUrl(trip.id);

            const col = document.createElement('div');
            col.className = 'col-12 col-md-6 col-xl-4';

            const card = document.createElement('div');
            card.className = 'ca-card ca-card--trip';

            const img = document.createElement('img');
            img.className = 'ca-card-img';
            img.alt = trip.titulo || '';
            img.src = trip.imagen || fallbackImage;

            const overlay = document.createElement('div');
            overlay.className = 'ca-card-overlay';

            const body = document.createElement('div');
            body.className = 'ca-card-body ca-card-body--trip';

            const copy = document.createElement('div');
            copy.className = 'ca-card-copy';

            const name = document.createElement('span');
            name.className = 'ca-card-name';
            name.textContent = trip.titulo || '';

            const buttonRow = document.createElement('div');
            buttonRow.className = 'ca-card-btn-row ca-card-btn-row--actions';

            const price = document.createElement('span');
            price.className = 'ca-card-price';
            price.textContent = formatCurrency(trip.precio);

            const actions = document.createElement('div');
            actions.className = 'ca-card-actions';

            const detailButton = document.createElement('a');
            detailButton.className = 'ca-card-btn';
            detailButton.href = tripUrl;
            detailButton.textContent = 'Ver aventura';
            detailButton.addEventListener('click', (event) => {
                event.stopPropagation();
            });

            const cartButton = document.createElement('button');
            cartButton.type = 'button';
            cartButton.className = 'ca-card-btn ca-card-btn-secondary';
            cartButton.textContent = 'Añadir a la cesta';
            cartButton.addEventListener('click', (event) => {
                event.stopPropagation();
                event.preventDefault();
                handleAddToCart(trip.id, cartButton);
            });

            copy.appendChild(name);
            actions.appendChild(detailButton);
            actions.appendChild(cartButton);
            buttonRow.appendChild(price);
            buttonRow.appendChild(actions);
            body.appendChild(copy);
            body.appendChild(buttonRow);

            card.appendChild(img);
            card.appendChild(overlay);
            card.appendChild(body);
            col.appendChild(card);
            wrap.appendChild(col);

            card.addEventListener('click', () => {
                window.location.href = tripUrl;
            });
        });
    }

    /**
     * Aplica el filtro del buscador solo cuando se pulsa el botón.
     *
     * @returns {void}
     */
    function applySearch() {
        if (!tripsLoaded) {
            return;
        }

        const query = normalizeText(searchInput ? searchInput.value : '');
        if (!query) {
            renderTrips(trips);
            return;
        }

        const filtered = trips.filter((trip) => {
            const haystack = `${normalizeText(trip.titulo)} ${normalizeText(trip.descripcion)}`;
            return haystack.includes(query);
        });

        renderTrips(filtered);
    }

    if (!provinceId) {
        createMessage('Provincia no especificada.', 'text-muted');
        return;
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
            }
        });
    }

    if (searchButton) {
        searchButton.addEventListener('click', applySearch);
    }

    try {
        const response = await request(`../php/obtener_viajes_por_provincia.php?provincia_id=${encodeURIComponent(provinceId)}`, {
            cache: 'no-store',
            credentials: 'same-origin'
        });

        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
        }

        const data = await response.json();
        tripsLoaded = true;

        if (!Array.isArray(data) || data.length === 0) {
            createMessage('No hay viajes en esta provincia.', 'text-muted');
            return;
        }

        trips = data;
        renderTrips(trips);
    } catch (error) {
        console.error(error);
        createMessage('Error cargando viajes.', 'text-danger');
    }
});
