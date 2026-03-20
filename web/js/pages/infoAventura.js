const DETAIL_FALLBACK_IMAGE = '../../img/logos/raices-viajeras-logo0.webp';
const DEFAULT_BACK_URL = 'provincias.html';

/**
 * Pinta mensajes simples de error o de estado vacio dentro del detalle.
 *
 * @param {HTMLElement} container Contenedor principal del detalle.
 * @param {string} message Texto que se quiere mostrar.
 * @param {string} [className='text-muted'] Clase visual del mensaje.
 * @returns {void}
 */
function renderDetailMessage(container, message, className = 'text-muted') {
    container.innerHTML = `
        <div class="info-trip-empty">
            <p class="${className} mb-3">${message}</p>
            <a class="info-trip-btn info-trip-btn-secondary" href="${DEFAULT_BACK_URL}">
                Volver a provincias
            </a>
        </div>
    `;
}

/**
 * Lee el id del viaje desde la query actual.
 *
 * @returns {string|null} Id del viaje o `null` si no viene.
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
 * Devuelve la descripcion que mejor encaja para la ficha.
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

    return 'Sin descripcion disponible.';
}

/**
 * Espera a que la API global de la cesta este lista.
 *
 * @returns {Promise<Function>} Funcion global para anadir items al carrito.
 */
function waitForCartApi() {
    if (typeof window.rvCartAddItem === 'function') {
        return Promise.resolve(window.rvCartAddItem);
    }

    return new Promise((resolve, reject) => {
        const timeoutId = window.setTimeout(() => {
            reject(new Error('La cesta todavia no esta lista.'));
        }, 2500);

        document.addEventListener('rv:cesta-ready', () => {
            window.clearTimeout(timeoutId);
            resolve(window.rvCartAddItem);
        }, { once: true });
    });
}

/**
 * Devuelve el enlace de vuelta mas util para el viaje actual.
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
 * Anade el viaje al carrito y actualiza el texto del boton un momento.
 *
 * @param {number|string} tripId Id del viaje.
 * @param {HTMLButtonElement} button Boton que lanza la accion.
 * @returns {Promise<void>}
 */
async function handleAddToCart(tripId, button) {
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Anadiendo...';

    try {
        const addToCart = await waitForCartApi();
        await addToCart(tripId);
        button.textContent = 'Anadido';

        window.setTimeout(() => {
            button.textContent = originalText;
        }, 1400);
    } catch (error) {
        console.error('No se pudo anadir el viaje:', error);
        button.textContent = originalText;
    } finally {
        button.disabled = false;
    }
}

/**
 * Pinta la ficha del viaje cuando la API devuelve un resultado valido.
 *
 * @param {HTMLElement} container Contenedor principal del detalle.
 * @param {object} trip Datos del viaje.
 * @returns {void}
 */
function renderTrip(container, trip) {
    const image = trip.imagen || DETAIL_FALLBACK_IMAGE;
    const backUrl = getBackUrl(trip);
    const description = getTripDescription(trip);

    container.innerHTML = `
        <article class="info-trip-card">
            <div class="row g-0">
                <div class="col-12 col-lg-5">
                    <div class="info-trip-media">
                        <img src="${image}" alt="${trip.titulo}">
                    </div>
                </div>

                <div class="col-12 col-lg-7">
                    <div class="info-trip-body">
                        <p class="info-trip-kicker">${trip.provincia_nombre || 'Experiencia sostenible'}</p>
                        <h1 class="info-trip-title">${trip.titulo}</h1>
                        <p class="info-trip-description">${description}</p>

                        <div class="info-trip-meta">
                            <div class="info-trip-meta-card">
                                <span class="info-trip-meta-label">Provincia</span>
                                <span class="info-trip-meta-value">${trip.provincia_nombre || '-'}</span>
                            </div>
                            <div class="info-trip-meta-card">
                                <span class="info-trip-meta-label">Origen</span>
                                <span class="info-trip-meta-value">${trip.origen || '-'}</span>
                            </div>
                            <div class="info-trip-meta-card">
                                <span class="info-trip-meta-label">Fecha de inicio</span>
                                <span class="info-trip-meta-value">${formatDate(trip.fecha_inicio)}</span>
                            </div>
                            <div class="info-trip-meta-card">
                                <span class="info-trip-meta-label">Fecha de fin</span>
                                <span class="info-trip-meta-value">${formatDate(trip.fecha_fin)}</span>
                            </div>
                            <div class="info-trip-meta-card">
                                <span class="info-trip-meta-label">Plazas</span>
                                <span class="info-trip-meta-value">${trip.plazas ?? '-'}</span>
                            </div>
                            <div class="info-trip-meta-card">
                                <span class="info-trip-meta-label">Tipo</span>
                                <span class="info-trip-meta-value">Aventura sostenible</span>
                            </div>
                        </div>

                        <div class="info-trip-footer">
                            <div class="info-trip-price-box">
                                <span class="info-trip-price-label">Precio actual</span>
                                <span class="info-trip-price">${formatCurrency(trip.precio)}</span>
                            </div>

                            <div class="info-trip-actions">
                                <button type="button" class="info-trip-btn info-trip-btn-primary js-trip-add">
                                    <i class="bi bi-basket-fill" aria-hidden="true"></i>
                                    Anadir a la cesta
                                </button>
                                <a href="${backUrl}" class="info-trip-btn info-trip-btn-secondary">
                                    Volver a destinos
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    `;

    const addButton = container.querySelector('.js-trip-add');
    if (addButton) {
        addButton.addEventListener('click', () => {
            handleAddToCart(trip.id, addButton);
        });
    }
}

/**
 * Pide el viaje al backend y valida que la respuesta venga en JSON.
 *
 * @param {HTMLElement} container Contenedor principal del detalle.
 * @param {string|number} tripId Id del viaje a cargar.
 * @returns {Promise<void>}
 */
async function loadTripDetail(container, tripId) {
    const response = await fetch(`../php/obtener_viaje.php?viaje=${encodeURIComponent(tripId)}`, {
        cache: 'no-store'
    });
    const raw = await response.text();

    let trip;
    try {
        trip = JSON.parse(raw);
    } catch (error) {
        console.error('get_viaje: respuesta no JSON', raw);
        renderDetailMessage(container, 'Error cargando informacion del viaje.', 'text-danger');
        return;
    }

    if (!trip) {
        renderDetailMessage(container, 'Viaje no encontrado.');
        return;
    }

    renderTrip(container, trip);
}

/**
 * Arranca la pagina de detalle y deja todos los estados controlados aqui.
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
        renderDetailMessage(container, 'Error cargando informacion del viaje.', 'text-danger');
    }
}

initTripDetail();
