const DETAIL_FALLBACK_IMAGE = '../../img/logos/raices-viajeras-logo0.webp';
const DEFAULT_BACK_URL = 'provincias.html';
const request = typeof window.rvFetch === 'function'
    ? window.rvFetch.bind(window)
    : window.fetch.bind(window);

/**
 * Pinta mensajes simples de error o de estado vacío dentro del detalle.
 *
 * @param {HTMLElement} container Contenedor principal del detalle.
 * @param {string} message Texto que se quiere mostrar.
 * @param {string} [className='text-muted'] Clase visual del mensaje.
 * @returns {void}
 */
function renderDetailMessage(container, message, className = 'text-muted') {
    const wrapper = document.createElement('div');
    wrapper.className = 'info-trip-empty';

    const text = document.createElement('p');
    text.className = `${className} mb-3`;
    text.textContent = message;

    const backLink = document.createElement('a');
    backLink.className = 'info-trip-btn info-trip-btn-secondary';
    backLink.href = DEFAULT_BACK_URL;
    backLink.textContent = 'Volver a provincias';

    wrapper.appendChild(text);
    wrapper.appendChild(backLink);
    container.replaceChildren(wrapper);
}

/**
 * Lee el ID del viaje desde la query actual.
 *
 * @returns {string|null} ID del viaje o `null` si no viene.
 */
function getTripId() {
    const params = new URLSearchParams(window.location.search);
    return params.get('viaje');
}

/**
 * Formatea un precio con el formato local.
 *
 * @param {number|string} value Importe a mostrar.
 * @returns {string} Importe listo para pintar.
 */
function formatCurrency(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(Number(value || 0));
}

/**
 * Formatea una fecha en castellano y deja un guion si no hay valor.
 *
 * @param {string|null|undefined} value Fecha original.
 * @returns {string} Fecha formateada o el texto de respaldo.
 */
function formatDate(value) {
    if (!value) {
        return '-';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat('es-ES', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

/**
 * Devuelve la descripción que mejor encaja para la ficha.
 *
 * Primero intento usar la del propio viaje y, si no viene, tiro de la provincia.
 *
 * @param {object} trip Datos del viaje.
 * @returns {string} Texto descriptivo listo para pintar.
 */
function getTripDescription(trip) {
    const tripDescription = (trip.descripcion || '').toString().trim();
    if (tripDescription) {
        return tripDescription;
    }

    const provinceDescription = (trip.provincia_descripcion || '').toString().trim();
    if (provinceDescription) {
        return provinceDescription;
    }

    return 'Sin descripción disponible.';
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
 * Devuelve el enlace de vuelta más útil para el viaje actual.
 *
 * @param {object} trip Datos del viaje.
 * @returns {string} Ruta de vuelta a destinos o a provincias.
 */
function getBackUrl(trip) {
    if (trip.provincia_id) {
        return `destinos.html?provincia_id=${encodeURIComponent(trip.provincia_id)}`;
    }

    return DEFAULT_BACK_URL;
}

/**
 * Añade el viaje al carrito y actualiza el texto del botón un momento.
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
        button.textContent = 'Añadido';

        window.setTimeout(() => {
            button.textContent = originalText;
        }, 1400);
    } catch (error) {
        console.error('No se pudo añadir el viaje:', error);
        button.textContent = originalText;
    } finally {
        button.disabled = false;
    }
}

/**
 * Pinta la ficha del viaje cuando la API devuelve un resultado válido.
 *
 * @param {HTMLElement} container Contenedor principal del detalle.
 * @param {object} trip Datos del viaje.
 * @returns {void}
 */
function renderTrip(container, trip) {
    const image = trip.imagen || DETAIL_FALLBACK_IMAGE;
    const backUrl = getBackUrl(trip);
    const description = getTripDescription(trip);

    const article = document.createElement('article');
    article.className = 'info-trip-card';

    const row = document.createElement('div');
    row.className = 'row g-0';

    const mediaCol = document.createElement('div');
    mediaCol.className = 'col-12 col-lg-5';

    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'info-trip-media';

    const imageNode = document.createElement('img');
    imageNode.src = image;
    imageNode.alt = trip.titulo || 'Viaje';
    mediaWrap.appendChild(imageNode);
    mediaCol.appendChild(mediaWrap);

    const bodyCol = document.createElement('div');
    bodyCol.className = 'col-12 col-lg-7';

    const body = document.createElement('div');
    body.className = 'info-trip-body';

    const kicker = document.createElement('p');
    kicker.className = 'info-trip-kicker';
    kicker.textContent = trip.provincia_nombre || 'Experiencia sostenible';

    const title = document.createElement('h1');
    title.className = 'info-trip-title';
    title.textContent = trip.titulo || 'Viaje';

    const desc = document.createElement('p');
    desc.className = 'info-trip-description';
    desc.textContent = description;

    const meta = document.createElement('div');
    meta.className = 'info-trip-meta';

    const metaItems = [
        ['Provincia', trip.provincia_nombre || '-'],
        ['Origen', trip.origen || '-'],
        ['Fecha de inicio', formatDate(trip.fecha_inicio)],
        ['Fecha de fin', formatDate(trip.fecha_fin)],
        ['Plazas', trip.plazas ?? '-'],
        ['Tipo', 'Aventura sostenible']
    ];

    metaItems.forEach(([label, value]) => {
        const card = document.createElement('div');
        card.className = 'info-trip-meta-card';

        const labelNode = document.createElement('span');
        labelNode.className = 'info-trip-meta-label';
        labelNode.textContent = label;

        const valueNode = document.createElement('span');
        valueNode.className = 'info-trip-meta-value';
        valueNode.textContent = String(value);

        card.appendChild(labelNode);
        card.appendChild(valueNode);
        meta.appendChild(card);
    });

    const footer = document.createElement('div');
    footer.className = 'info-trip-footer';

    const priceBox = document.createElement('div');
    priceBox.className = 'info-trip-price-box';

    const priceLabel = document.createElement('span');
    priceLabel.className = 'info-trip-price-label';
    priceLabel.textContent = 'Precio actual';

    const price = document.createElement('span');
    price.className = 'info-trip-price';
    price.textContent = formatCurrency(trip.precio);

    priceBox.appendChild(priceLabel);
    priceBox.appendChild(price);

    const actions = document.createElement('div');
    actions.className = 'info-trip-actions';

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'info-trip-btn info-trip-btn-primary js-trip-add';

    const addIcon = document.createElement('i');
    addIcon.className = 'bi bi-basket-fill';
    addIcon.setAttribute('aria-hidden', 'true');

    addButton.appendChild(addIcon);
    addButton.appendChild(document.createTextNode(' Añadir a la cesta'));

    const backLink = document.createElement('a');
    backLink.href = backUrl;
    backLink.className = 'info-trip-btn info-trip-btn-secondary';
    backLink.textContent = 'Volver a destinos';

    actions.appendChild(addButton);
    actions.appendChild(backLink);

    footer.appendChild(priceBox);
    footer.appendChild(actions);

    body.appendChild(kicker);
    body.appendChild(title);
    body.appendChild(desc);
    body.appendChild(meta);
    body.appendChild(footer);
    bodyCol.appendChild(body);

    row.appendChild(mediaCol);
    row.appendChild(bodyCol);
    article.appendChild(row);

    container.replaceChildren(article);

    addButton.addEventListener('click', () => {
        handleAddToCart(trip.id, addButton);
    });
}

/**
 * Pide el viaje al backend y valida que la respuesta venga en JSON.
 *
 * @param {HTMLElement} container Contenedor principal del detalle.
 * @param {string|number} tripId ID del viaje a cargar.
 * @returns {Promise<void>}
 */
async function loadTripDetail(container, tripId) {
    const response = await request(`../php/obtener_viaje.php?viaje=${encodeURIComponent(tripId)}`, {
        cache: 'no-store'
    });
    const raw = await response.text();

    let trip;
    try {
        trip = JSON.parse(raw);
    } catch (error) {
        console.error('get_viaje: respuesta no JSON', raw);
        renderDetailMessage(container, 'Error cargando información del viaje.', 'text-danger');
        return;
    }

    if (!trip) {
        renderDetailMessage(container, 'Viaje no encontrado.');
        return;
    }

    renderTrip(container, trip);
}

/**
 * Arranca la página de detalle y deja todos los estados controlados aquí.
 *
 * @returns {Promise<void>}
 */
async function initTripDetail() {
    const container = document.getElementById('viaje-detail');
    if (!container) {
        return;
    }

    const tripId = getTripId();
    if (!tripId) {
        renderDetailMessage(container, 'Viaje no especificado.');
        return;
    }

    try {
        await loadTripDetail(container, tripId);
    } catch (error) {
        console.error(error);
        renderDetailMessage(container, 'Error cargando información del viaje.', 'text-danger');
    }
}

initTripDetail();
