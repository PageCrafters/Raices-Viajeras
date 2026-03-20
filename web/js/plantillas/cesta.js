(function () {
    if (window.__rvCestaBootstrapLoaded) {
        return;
    }

    window.__rvCestaBootstrapLoaded = true;

    const TEMPLATE_URL = '/Raices-Viajeras/web/html/plantillas/cesta.html';
    const API_URL = '/Raices-Viajeras/web/php/cesta_api.php';
    const LOGIN_URL = '/Raices-Viajeras/web/Formulario/form.html?modo=login';
    const TRIPS_URL = '/Raices-Viajeras/web/html/provincias.html';
    const FALLBACK_IMAGE = '/Raices-Viajeras/img/logos/raices-viajeras-logo0.webp';

    let templatePromise = null;
    let eventsBound = false;

    /**
     * Escapa texto antes de meterlo dentro del modal.
     *
     * @param {unknown} value Valor que se quiere pintar.
     * @returns {string} Texto seguro para usar en HTML.
     */
    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    /**
     * Formatea importes con el formato local de la web.
     *
     * @param {number|string} value Importe que se quiere mostrar.
     * @returns {string} Precio listo para pintar.
     */
    function formatCurrency(value) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(Number(value || 0));
    }

    /**
     * Recorta descripciones largas para que las cards de cesta no se desmadren.
     *
     * @param {string} value Texto original.
     * @param {number} [maxLength=120] Largo maximo permitido.
     * @returns {string} Texto ya recortado si hacia falta.
     */
    function truncateText(value, maxLength = 120) {
        const text = String(value ?? '').trim();
        if (text.length <= maxLength) {
            return text;
        }

        return `${text.slice(0, maxLength - 1).trimEnd()}...`;
    }

    /**
     * Devuelve la etiqueta del contador en singular o plural.
     *
     * @param {number} count Numero total de articulos.
     * @returns {string} Texto que se pinta junto al total.
     */
    function getCountLabel(count) {
        return `${count} ${count === 1 ? 'articulo' : 'articulos'}`;
    }

    /**
     * Se asegura de que exista la pila de avisos flotantes.
     *
     * @returns {HTMLElement} Contenedor donde se van apilando los avisos.
     */
    function ensureToastStack() {
        let stack = document.getElementById('rv-cart-toast-stack');

        if (!stack) {
            stack = document.createElement('div');
            stack.id = 'rv-cart-toast-stack';
            stack.className = 'rv-toast-stack';
            document.body.appendChild(stack);
        }

        return stack;
    }

    /**
     * Muestra avisos cortos de exito o error sin sacar al usuario de la pagina.
     *
     * @param {string} message Texto del aviso.
     * @param {string} [type='success'] Tipo visual del aviso.
     * @returns {void}
     */
    function showNotice(message, type = 'success') {
        const stack = ensureToastStack();
        const toast = document.createElement('div');
        toast.className = `rv-toast rv-toast--${type}`;
        toast.textContent = message;

        stack.appendChild(toast);

        requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });

        window.setTimeout(() => {
            toast.classList.remove('is-visible');
            window.setTimeout(() => {
                toast.remove();
            }, 220);
        }, 2800);
    }

    /**
     * Normaliza la respuesta del backend para trabajar siempre con la misma forma.
     *
     * @param {object} data Respuesta original del endpoint.
     * @returns {object} Resumen de cesta con estructura estable.
     */
    function normalizeSummary(data) {
        const cart = data && data.carrito ? data.carrito : {};
        const items = Array.isArray(cart.items) ? cart.items : [];

        return {
            logueado: Boolean(data && data.logueado),
            carrito: {
                id: cart.id ?? null,
                total: Number(cart.total || 0),
                count: Number(cart.count || 0),
                items: items.map((item) => {
                    const quantity = Number(item.cantidad || 0);
                    const unitPrice = Number(item.precio_unitario || 0);

                    return {
                        carrito_viaje_id: Number(item.carrito_viaje_id || 0),
                        viaje_id: Number(item.viaje_id || 0),
                        titulo: item.titulo || '',
                        descripcion: item.descripcion || '',
                        imagen: item.imagen || '',
                        provincia_nombre: item.provincia_nombre || '',
                        cantidad: quantity,
                        precio_unitario: unitPrice,
                        subtotal: Number(item.subtotal ?? quantity * unitPrice)
                    };
                })
            }
        };
    }

    /**
     * Se asegura de que exista el contenedor donde se inyecta la cesta.
     *
     * @returns {HTMLElement} Nodo contenedor de la plantilla.
     */
    function ensureCartContainer() {
        let container = document.getElementById('contenedorCesta');

        if (!container) {
            container = document.createElement('div');
            container.id = 'contenedorCesta';
            document.body.appendChild(container);
        }

        return container;
    }

    /**
     * Carga el HTML del modal compartido y lo inyecta una sola vez.
     *
     * @returns {Promise<HTMLElement|null>} Modal listo para usar.
     */
    async function ensureTemplateLoaded() {
        if (document.getElementById('cestaModal')) {
            bindModalEvents();
            return document.getElementById('cestaModal');
        }

        if (!templatePromise) {
            templatePromise = fetch(TEMPLATE_URL, {
                cache: 'no-store',
                credentials: 'same-origin'
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error(`HTTP ${response.status}`);
                    }

                    return response.text();
                })
                .then((html) => {
                    const container = ensureCartContainer();
                    container.innerHTML = html;
                    bindModalEvents();
                    return document.getElementById('cestaModal');
                })
                .catch((error) => {
                    templatePromise = null;
                    throw error;
                });
        }

        return templatePromise;
    }

    /**
     * Devuelve el bloque visual para login, vacio, error o carga.
     *
     * @param {'login'|'empty'|'error'|'loading'} type Tipo de estado.
     * @param {string} message Texto de apoyo.
     * @returns {string} HTML del estado.
     */
    function getStateHtml(type, message) {
        if (type === 'login') {
            return `
                <div class="rv-cart-state">
                    <h3 class="rv-cart-state-title">Inicia sesion para ver tu cesta</h3>
                    <p class="rv-cart-state-copy mb-3">
                        ${escapeHtml(message || 'Necesitamos saber que usuario esta activo para cargar tu cesta.')}
                    </p>
                    <a href="${LOGIN_URL}" class="btn btn-primario">Ir al acceso</a>
                </div>
            `;
        }

        if (type === 'empty') {
            return `
                <div class="rv-cart-state">
                    <h3 class="rv-cart-state-title">Tu cesta esta vacia</h3>
                    <p class="rv-cart-state-copy mb-3">
                        ${escapeHtml(message || 'Aun no hay viajes guardados en tu carrito activo.')}
                    </p>
                    <a href="${TRIPS_URL}" class="btn btn-primario">Explorar viajes</a>
                </div>
            `;
        }

        if (type === 'error') {
            return `
                <div class="rv-cart-state">
                    <h3 class="rv-cart-state-title">No se pudo cargar la cesta</h3>
                    <p class="rv-cart-state-copy mb-0">
                        ${escapeHtml(message || 'Ha ocurrido un error inesperado.')}
                    </p>
                </div>
            `;
        }

        return `
            <div class="rv-cart-state">
                <h3 class="rv-cart-state-title">Cargando cesta...</h3>
                <p class="rv-cart-state-copy mb-0">
                    ${escapeHtml(message || 'Estamos recuperando tu resumen actual.')}
                </p>
            </div>
        `;
    }

    /**
     * Genera el listado de lineas con sus importes y boton para quitar.
     *
     * @param {Array<object>} items Lineas del carrito.
     * @returns {string} HTML completo del listado.
     */
    function getItemsHtml(items) {
        return items.map((item) => `
            <article class="rv-cart-item">
                <img
                    class="rv-cart-item-image"
                    src="${escapeHtml(item.imagen || FALLBACK_IMAGE)}"
                    alt="${escapeHtml(item.titulo || 'Viaje')}"
                >
                <div class="rv-cart-item-body">
                    <div class="rv-cart-item-top">
                        <div class="rv-cart-item-copy">
                            <p class="rv-cart-item-kicker">
                                ${escapeHtml(item.provincia_nombre || 'Experiencia sostenible')}
                            </p>
                            <h3 class="rv-cart-item-title">${escapeHtml(item.titulo || 'Viaje sin titulo')}</h3>
                            <p class="rv-cart-item-description">
                                ${escapeHtml(truncateText(item.descripcion, 140) || 'Sin descripcion disponible.')}
                            </p>
                        </div>
                        <button
                            type="button"
                            class="btn btn-sm rv-cart-remove js-remove-cart-item"
                            data-item-id="${item.carrito_viaje_id}"
                            aria-label="Quitar ${escapeHtml(item.titulo || 'viaje')} de la cesta"
                        >
                            Quitar
                        </button>
                    </div>

                    <div class="rv-cart-item-meta">
                        <span>Cantidad: <strong>${item.cantidad}</strong></span>
                        <span>Precio unitario: <strong>${formatCurrency(item.precio_unitario)}</strong></span>
                        <span>Subtotal: <strong>${formatCurrency(item.subtotal)}</strong></span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    /**
     * Sincroniza el badge del header con el numero total de articulos.
     *
     * @param {number} count Numero total de items.
     * @returns {void}
     */
    function updateBadge(count) {
        const badge = document.getElementById('header-cart-badge');
        if (!badge) {
            return;
        }

        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : String(count);
            badge.classList.remove('d-none');
            return;
        }

        badge.textContent = '0';
        badge.classList.add('d-none');
    }

    /**
     * Renderiza el estado del modal rapido del header.
     *
     * @param {object} summary Resumen ya normalizado de la cesta.
     * @returns {void}
     */
    function renderModal(summary) {
        const feedback = document.getElementById('cesta-modal-feedback');
        const content = document.getElementById('cesta-modal-content');
        const itemsContainer = document.getElementById('cesta-modal-items');
        const countElement = document.getElementById('cesta-modal-count');
        const totalElement = document.getElementById('cesta-modal-total');

        if (!feedback || !content) {
            return;
        }

        if (itemsContainer) {
            itemsContainer.innerHTML = '';
        }

        if (countElement) {
            countElement.textContent = getCountLabel(summary.carrito.count);
        }

        if (totalElement) {
            totalElement.textContent = formatCurrency(summary.carrito.total);
        }

        if (!summary.logueado) {
            feedback.innerHTML = getStateHtml('login', 'Accede con tu cuenta para consultar la cesta asociada a tu usuario.');
            feedback.classList.remove('d-none');
            content.classList.add('d-none');
            return;
        }

        if (!summary.carrito.items.length) {
            feedback.innerHTML = getStateHtml('empty', 'Tu carrito activo esta listo para recibir nuevas aventuras.');
            feedback.classList.remove('d-none');
            content.classList.add('d-none');
            return;
        }

        feedback.classList.add('d-none');
        content.classList.remove('d-none');

        if (itemsContainer) {
            itemsContainer.innerHTML = getItemsHtml(summary.carrito.items);
        }
    }

    /**
     * Renderiza la vista completa de paga.html reutilizando los mismos datos.
     *
     * @param {object} summary Resumen ya normalizado de la cesta.
     * @returns {void}
     */
    function renderCartPage(summary) {
        const feedback = document.getElementById('paga-cesta-feedback');
        const content = document.getElementById('paga-cesta-content');
        const itemsContainer = document.getElementById('paga-cesta-items');
        const totalElement = document.getElementById('paga-cesta-total');
        const countElement = document.getElementById('paga-cesta-count');

        if (!feedback || !content) {
            return;
        }

        if (itemsContainer) {
            itemsContainer.innerHTML = '';
        }

        if (totalElement) {
            totalElement.textContent = formatCurrency(summary.carrito.total);
        }

        if (countElement) {
            countElement.textContent = getCountLabel(summary.carrito.count);
        }

        if (!summary.logueado) {
            feedback.innerHTML = getStateHtml('login', 'Tu cesta completa esta disponible cuando inicies sesion.');
            feedback.classList.remove('d-none');
            content.classList.add('d-none');
            return;
        }

        if (!summary.carrito.items.length) {
            feedback.innerHTML = getStateHtml('empty', 'Todavia no hay viajes en tu carrito activo.');
            feedback.classList.remove('d-none');
            content.classList.add('d-none');
            return;
        }

        feedback.classList.add('d-none');
        content.classList.remove('d-none');

        if (itemsContainer) {
            itemsContainer.innerHTML = getItemsHtml(summary.carrito.items);
        }
    }

    /**
     * Muestra un error solo en el destino que haya pedido la llamada.
     *
     * @param {string} message Texto del error.
     * @param {'both'|'modal'|'page'} [target='both'] Destino visual del error.
     * @returns {void}
     */
    function renderError(message, target = 'both') {
        const feedback = document.getElementById('cesta-modal-feedback');
        const content = document.getElementById('cesta-modal-content');

        if ((target === 'both' || target === 'modal') && feedback && content) {
            feedback.innerHTML = getStateHtml('error', message);
            feedback.classList.remove('d-none');
            content.classList.add('d-none');
        }

        const pageFeedback = document.getElementById('paga-cesta-feedback');
        const pageContent = document.getElementById('paga-cesta-content');

        if ((target === 'both' || target === 'page') && pageFeedback && pageContent) {
            pageFeedback.innerHTML = getStateHtml('error', message);
            pageFeedback.classList.remove('d-none');
            pageContent.classList.add('d-none');
        }
    }

    /**
     * Pinta el estado de carga donde toque mientras llega la respuesta del backend.
     *
     * @param {string} message Texto de apoyo.
     * @param {'both'|'modal'|'page'} [target='both'] Destino visual del estado.
     * @returns {void}
     */
    function renderLoading(message, target = 'both') {
        const feedback = document.getElementById('cesta-modal-feedback');
        const content = document.getElementById('cesta-modal-content');

        if ((target === 'both' || target === 'modal') && feedback && content) {
            feedback.innerHTML = getStateHtml('loading', message);
            feedback.classList.remove('d-none');
            content.classList.add('d-none');
        }

        const pageFeedback = document.getElementById('paga-cesta-feedback');
        const pageContent = document.getElementById('paga-cesta-content');

        if ((target === 'both' || target === 'page') && pageFeedback && pageContent) {
            pageFeedback.innerHTML = getStateHtml('loading', message);
            pageFeedback.classList.remove('d-none');
            pageContent.classList.add('d-none');
        }
    }

    /**
     * Reparte el mismo resumen entre badge, modal y pagina completa.
     *
     * @param {object} summary Resumen ya normalizado de la cesta.
     * @returns {void}
     */
    function renderAll(summary) {
        updateBadge(summary.carrito.count);
        renderModal(summary);
        renderCartPage(summary);
    }

    /**
     * Pide el resumen actual de la cesta al backend.
     *
     * @returns {Promise<object>} Resumen ya normalizado.
     */
    async function fetchSummary() {
        const response = await fetch(`${API_URL}?accion=resumen`, {
            cache: 'no-store',
            credentials: 'same-origin'
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data && data.error ? data.error : `HTTP ${response.status}`);
        }

        return normalizeSummary(data);
    }

    /**
     * Llama al backend para anadir una aventura al carrito activo.
     *
     * @param {number|string} tripId Id del viaje.
     * @returns {Promise<object>} Resumen actualizado de la cesta.
     */
    async function addItem(tripId) {
        const response = await fetch(API_URL, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accion: 'agregar_item',
                viaje_id: tripId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            const message = data && data.error ? data.error : `HTTP ${response.status}`;
            showNotice(message, response.status === 401 ? 'info' : 'error');
            throw new Error(message);
        }

        const summary = normalizeSummary(data);
        renderAll(summary);
        showNotice('Viaje anadido a la cesta.', 'success');

        return summary;
    }

    /**
     * Refresca la cesta y decide donde mostrar carga o error.
     *
     * @param {object} [options={}] Opciones de refresco.
     * @returns {Promise<object>} Resumen actualizado.
     */
    async function refreshCart(options = {}) {
        const target = options.target || 'both';

        if (options.showLoading) {
            renderLoading(options.loadingMessage || 'Cargando cesta...', target);
        }

        try {
            const summary = await fetchSummary();
            renderAll(summary);
            return summary;
        } catch (error) {
            console.error('Error cargando la cesta:', error);
            updateBadge(0);
            renderError('No hemos podido recuperar tu cesta en este momento.', target);
            throw error;
        }
    }

    /**
     * Elimina una linea concreta del carrito activo.
     *
     * @param {number|string} cartItemId Id de la linea del carrito.
     * @returns {Promise<object>} Resumen ya normalizado tras borrar.
     */
    async function removeItem(cartItemId) {
        const response = await fetch(API_URL, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accion: 'eliminar_item',
                carrito_viaje_id: cartItemId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data && data.error ? data.error : `HTTP ${response.status}`);
        }

        return normalizeSummary(data);
    }

    /**
     * Vincula la recarga del resumen al evento de apertura del modal.
     *
     * @returns {void}
     */
    function bindModalEvents() {
        const modal = document.getElementById('cestaModal');
        if (!modal || modal.dataset.rvCestaBound === '1') {
            return;
        }

        modal.dataset.rvCestaBound = '1';
        modal.addEventListener('show.bs.modal', () => {
            refreshCart({
                showLoading: true,
                target: 'modal'
            }).catch(() => {});
        });
    }

    /**
     * Escucha el boton de quitar con delegacion para no perder eventos al re-renderizar.
     *
     * @returns {void}
     */
    function bindEvents() {
        if (eventsBound) {
            return;
        }

        eventsBound = true;

        document.addEventListener('click', async (event) => {
            const removeButton = event.target.closest('.js-remove-cart-item');
            if (!removeButton) {
                return;
            }

            event.preventDefault();

            const itemId = Number(removeButton.dataset.itemId || 0);
            if (!itemId) {
                return;
            }

            const originalLabel = removeButton.textContent;
            removeButton.disabled = true;
            removeButton.textContent = 'Quitando...';

            try {
                const summary = await removeItem(itemId);
                renderAll(summary);
            } catch (error) {
                console.error('Error eliminando el item de la cesta:', error);
                renderError('No se ha podido eliminar el viaje de la cesta.', 'both');
            } finally {
                removeButton.disabled = false;
                removeButton.textContent = originalLabel;
            }
        });
    }

    /**
     * Punto de entrada comun para modal global y pagina completa.
     *
     * @returns {Promise<void>}
     */
    async function initCesta() {
        bindEvents();

        try {
            await ensureTemplateLoaded();
        } catch (error) {
            console.error('Error cargando la plantilla de la cesta:', error);
        }

        const hasCartPage = Boolean(document.getElementById('paga-cesta-feedback'));
        refreshCart({
            showLoading: hasCartPage,
            target: hasCartPage ? 'page' : 'both'
        }).catch(() => {});
    }

    window.initCesta = initCesta;
    window.rvCartAddItem = addItem;
    window.rvCartShowNotice = showNotice;
    document.dispatchEvent(new CustomEvent('rv:cesta-ready'));

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCesta);
    } else {
        initCesta();
    }
})();
