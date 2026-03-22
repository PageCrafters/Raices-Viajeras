(function () {
    if (window.__rvCestaBootstrapLoaded) {
        return;
    }

    window.__rvCestaBootstrapLoaded = true;

    const TEMPLATE_URL = '/Raices-Viajeras/web/html/plantillas/cesta.html';
    const API_URL = '/Raices-Viajeras/web/php/cesta_api.php';
    const LOGIN_URL = '/Raices-Viajeras/web/Formulario/form.html?modo=login';
    const PAGA_URL = '/Raices-Viajeras/web/html/paga.html';
    const TRIPS_URL = '/Raices-Viajeras/web/html/provincias.html';
    const FALLBACK_IMAGE = '/Raices-Viajeras/img/logos/raices-viajeras-logo0.webp';
    const request = typeof window.rvFetch === 'function'
        ? window.rvFetch.bind(window)
        : window.fetch.bind(window);

    let templatePromise = null;
    let eventsBound = false;

    /**
     * Convierte una plantilla HTML en nodos para insertarlos sin usar innerHTML.
     *
     * @param {string} html Plantilla cruda descargada por fetch.
     * @returns {Array<Node>} Nodos listos para insertar en el documento actual.
     */
    function parseHtmlNodes(html) {
        const parser = new DOMParser();
        const parsed = parser.parseFromString(html, 'text/html');
        return Array.from(parsed.body.childNodes).map((node) => document.importNode(node, true));
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
     * Recorta descripciones largas para que las tarjetas de cesta no se desmadren.
     *
     * @param {string} value Texto original.
     * @param {number} [maxLength=120] Largo máximo permitido.
     * @returns {string} Texto ya recortado si hacía falta.
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
     * @param {number} count Número total de artículos.
     * @returns {string} Texto que se pinta junto al total.
     */
    function getCountLabel(count) {
        return `${count} ${count === 1 ? 'artículo' : 'artículos'}`;
    }

    /**
     * Construye la URL de acceso conservando el redirect deseado.
     *
     * @param {string} [redirectPath=PAGA_URL] Ruta interna a la que se quiere volver.
     * @returns {string} Enlace listo para usar.
     */
    function buildAuthUrl(redirectPath = PAGA_URL) {
        const url = new URL(LOGIN_URL, window.location.origin);

        if (redirectPath) {
            url.searchParams.set('redirect', redirectPath);
        }

        return `${url.pathname}${url.search}`;
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
     * Muestra avisos cortos de éxito o error sin sacar al usuario de la página.
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
                        carrito_viaje_id: Number(item.carrito_viaje_id || item.viaje_id || 0),
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
            templatePromise = request(TEMPLATE_URL, {
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
                    container.replaceChildren(...parseHtmlNodes(html));
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
     * Devuelve el bloque visual para login, vacío, error o carga.
     *
     * @param {'login'|'empty'|'error'|'loading'} type Tipo de estado.
     * @param {string} message Texto de apoyo.
     * @param {object} [options={}] Opciones visuales del estado.
     * @returns {HTMLElement} Nodo del estado.
     */
    function createStateNode(type, message, options = {}) {
        const state = document.createElement('div');
        state.className = 'rv-cart-state';

        const title = document.createElement('h3');
        title.className = 'rv-cart-state-title';

        const copy = document.createElement('p');
        copy.className = 'rv-cart-state-copy';

        if (type === 'login') {
            title.textContent = options.title || 'Inicia sesión para continuar';
            copy.classList.add('mb-3');
            copy.textContent = message || 'Necesitamos saber qué usuario está activo para cargar tu cesta.';

            const link = document.createElement('a');
            link.href = options.linkHref || buildAuthUrl(PAGA_URL);
            link.className = 'btn btn-primario';
            link.textContent = options.linkLabel || 'Iniciar sesión o registrarte';

            state.appendChild(title);
            state.appendChild(copy);
            state.appendChild(link);
            return state;
        }

        if (type === 'empty') {
            title.textContent = options.title || 'Tu cesta está vacía';
            copy.classList.add('mb-3');
            copy.textContent = message || 'Aún no hay viajes guardados en tu carrito activo.';

            const link = document.createElement('a');
            link.href = options.linkHref || TRIPS_URL;
            link.className = 'btn btn-primario';
            link.textContent = options.linkLabel || 'Explorar viajes';

            state.appendChild(title);
            state.appendChild(copy);
            state.appendChild(link);
            return state;
        }

        if (type === 'error') {
            title.textContent = 'No se pudo cargar la cesta';
            copy.classList.add('mb-0');
            copy.textContent = message || 'Ha ocurrido un error inesperado.';
            state.appendChild(title);
            state.appendChild(copy);
            return state;
        }

        title.textContent = 'Cargando cesta...';
        copy.classList.add('mb-0');
        copy.textContent = message || 'Estamos recuperando tu resumen actual.';
        state.appendChild(title);
        state.appendChild(copy);
        return state;
    }

    /**
     * Crea una tarjeta de línea de carrito para modal o página.
     *
     * @param {object} item Línea ya normalizada.
     * @returns {HTMLElement} Nodo article con la información del viaje.
     */
    function createItemNode(item) {
        const article = document.createElement('article');
        article.className = 'rv-cart-item';

        const image = document.createElement('img');
        image.className = 'rv-cart-item-image';
        image.src = item.imagen || FALLBACK_IMAGE;
        image.alt = item.titulo || 'Viaje';

        const body = document.createElement('div');
        body.className = 'rv-cart-item-body';

        const top = document.createElement('div');
        top.className = 'rv-cart-item-top';

        const copy = document.createElement('div');
        copy.className = 'rv-cart-item-copy';

        const kicker = document.createElement('p');
        kicker.className = 'rv-cart-item-kicker';
        kicker.textContent = item.provincia_nombre || 'Experiencia sostenible';

        const title = document.createElement('h3');
        title.className = 'rv-cart-item-title';
        title.textContent = item.titulo || 'Viaje sin título';

        const description = document.createElement('p');
        description.className = 'rv-cart-item-description';
        description.textContent = truncateText(item.descripcion, 140) || 'Sin descripción disponible.';

        copy.appendChild(kicker);
        copy.appendChild(title);
        copy.appendChild(description);

        const removeButton = document.createElement('button');
        removeButton.type = 'button';
        removeButton.className = 'btn btn-sm rv-cart-remove js-remove-cart-item';
        removeButton.dataset.itemId = String(item.carrito_viaje_id);
        removeButton.setAttribute('aria-label', `Quitar ${item.titulo || 'viaje'} de la cesta`);
        removeButton.textContent = 'Quitar';

        top.appendChild(copy);
        top.appendChild(removeButton);

        const meta = document.createElement('div');
        meta.className = 'rv-cart-item-meta';

        const quantity = document.createElement('span');
        quantity.append('Cantidad: ');
        const quantityStrong = document.createElement('strong');
        quantityStrong.textContent = String(item.cantidad);
        quantity.appendChild(quantityStrong);

        const unitPrice = document.createElement('span');
        unitPrice.append('Precio unitario: ');
        const unitPriceStrong = document.createElement('strong');
        unitPriceStrong.textContent = formatCurrency(item.precio_unitario);
        unitPrice.appendChild(unitPriceStrong);

        const subtotal = document.createElement('span');
        subtotal.append('Subtotal: ');
        const subtotalStrong = document.createElement('strong');
        subtotalStrong.textContent = formatCurrency(item.subtotal);
        subtotal.appendChild(subtotalStrong);

        meta.appendChild(quantity);
        meta.appendChild(unitPrice);
        meta.appendChild(subtotal);

        body.appendChild(top);
        body.appendChild(meta);

        article.appendChild(image);
        article.appendChild(body);

        return article;
    }

    /**
     * Genera el listado de líneas con sus importes y botón para quitar.
     *
     * @param {Array<object>} items Líneas del carrito.
     * @returns {DocumentFragment} Fragmento listo para insertar.
     */
    function getItemsFragment(items) {
        const fragment = document.createDocumentFragment();
        items.forEach((item) => {
            fragment.appendChild(createItemNode(item));
        });

        return fragment;
    }

    /**
     * Sincroniza el badge del header con el número total de artículos.
     *
     * @param {number} count Número total de items.
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
     * Ajusta el CTA del modal según el tipo de cesta visible.
     *
     * @param {object} summary Resumen de cesta ya normalizado.
     * @returns {void}
     */
    function updateModalCta(summary) {
        const cta = document.getElementById('cesta-modal-cta');
        const intro = document.getElementById('cesta-modal-intro');
        const summaryNote = document.getElementById('cesta-modal-summary-note');

        if (cta instanceof HTMLAnchorElement) {
            if (summary.logueado) {
                cta.href = PAGA_URL;
                cta.textContent = 'Ir a la cesta';
            } else {
                cta.href = buildAuthUrl(PAGA_URL);
                cta.textContent = 'Iniciar sesión o registrarte para comprar';
            }
        }

        if (intro) {
            intro.textContent = summary.logueado
                ? 'Resumen actual de tu selección.'
                : 'Resumen actual de tu cesta temporal.';
        }

        if (summaryNote) {
            summaryNote.textContent = summary.logueado
                ? 'Puedes revisar la cesta aquí y continuar en la página completa cuando quieras.'
                : 'Puedes seguir guardando viajes sin registrarte. Para comprar, inicia sesión o regístrate.';
        }
    }

    /**
     * Renderiza el estado del modal rápido del header.
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
            itemsContainer.replaceChildren();
        }

        if (countElement) {
            countElement.textContent = getCountLabel(summary.carrito.count);
        }

        if (totalElement) {
            totalElement.textContent = formatCurrency(summary.carrito.total);
        }

        if (!summary.carrito.items.length) {
            const emptyMessage = summary.logueado
                ? 'Tu carrito activo está listo para recibir nuevas aventuras.'
                : 'Tu cesta temporal está vacía. Puedes seguir explorando viajes antes de iniciar sesión.';

            feedback.replaceChildren(createStateNode('empty', emptyMessage));
            feedback.classList.remove('d-none');
            content.classList.add('d-none');
            return;
        }

        feedback.classList.add('d-none');
        content.classList.remove('d-none');
        updateModalCta(summary);

        if (itemsContainer) {
            itemsContainer.replaceChildren(getItemsFragment(summary.carrito.items));
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
            itemsContainer.replaceChildren();
        }

        if (!summary.logueado) {
            if (totalElement) {
                totalElement.textContent = formatCurrency(0);
            }

            if (countElement) {
                countElement.textContent = '0 artículos';
            }

            const message = summary.carrito.count > 0
                ? 'Tienes viajes guardados temporalmente. Inicia sesión o regístrate para pasarlos a tu cesta real y continuar con la compra.'
                : 'Tu cesta completa estará disponible cuando inicies sesión.';

            feedback.replaceChildren(
                createStateNode('login', message, {
                    title: 'Acceso necesario para ver la cesta',
                    linkHref: buildAuthUrl(PAGA_URL),
                    linkLabel: 'Iniciar sesión o registrarte'
                })
            );
            feedback.classList.remove('d-none');
            content.classList.add('d-none');
            return;
        }

        if (totalElement) {
            totalElement.textContent = formatCurrency(summary.carrito.total);
        }

        if (countElement) {
            countElement.textContent = getCountLabel(summary.carrito.count);
        }

        if (!summary.carrito.items.length) {
            feedback.replaceChildren(createStateNode('empty', 'Todavía no hay viajes en tu carrito activo.'));
            feedback.classList.remove('d-none');
            content.classList.add('d-none');
            return;
        }

        feedback.classList.add('d-none');
        content.classList.remove('d-none');

        if (itemsContainer) {
            itemsContainer.replaceChildren(getItemsFragment(summary.carrito.items));
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
            feedback.replaceChildren(createStateNode('error', message));
            feedback.classList.remove('d-none');
            content.classList.add('d-none');
        }

        const pageFeedback = document.getElementById('paga-cesta-feedback');
        const pageContent = document.getElementById('paga-cesta-content');

        if ((target === 'both' || target === 'page') && pageFeedback && pageContent) {
            pageFeedback.replaceChildren(createStateNode('error', message));
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
            feedback.replaceChildren(createStateNode('loading', message));
            feedback.classList.remove('d-none');
            content.classList.add('d-none');
        }

        const pageFeedback = document.getElementById('paga-cesta-feedback');
        const pageContent = document.getElementById('paga-cesta-content');

        if ((target === 'both' || target === 'page') && pageFeedback && pageContent) {
            pageFeedback.replaceChildren(createStateNode('loading', message));
            pageFeedback.classList.remove('d-none');
            pageContent.classList.add('d-none');
        }
    }

    /**
     * Reparte el mismo resumen entre badge, modal y página completa.
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
        const response = await request(`${API_URL}?accion=resumen`, {
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
     * Llama al backend para añadir una aventura al carrito activo o temporal.
     *
     * @param {number|string} tripId ID del viaje.
     * @returns {Promise<object>} Resumen actualizado de la cesta.
     */
    async function addItem(tripId) {
        const response = await request(API_URL, {
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
            showNotice(message, 'error');
            throw new Error(message);
        }

        const summary = normalizeSummary(data);
        renderAll(summary);

        showNotice(
            summary.logueado ? 'Viaje añadido a la cesta.' : 'Viaje añadido a tu cesta temporal.',
            'success'
        );

        return summary;
    }

    /**
     * Refresca la cesta y decide dónde mostrar carga o error.
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
     * Elimina una línea concreta del carrito activo o temporal.
     *
     * @param {number|string} cartItemId ID de la línea del carrito.
     * @returns {Promise<object>} Resumen ya normalizado tras borrar.
     */
    async function removeItem(cartItemId) {
        const response = await request(API_URL, {
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
     * Escucha el botón de quitar con delegación para no perder eventos al re-renderizar.
     *
     * @returns {void}
     */
    function bindEvents() {
        if (eventsBound) {
            return;
        }

        eventsBound = true;

        document.addEventListener('click', async (event) => {
            if (!(event.target instanceof Element)) {
                return;
            }

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
                showNotice('Viaje eliminado de la cesta.', 'success');
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
     * Punto de entrada común para modal global y página completa.
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
