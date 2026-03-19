(function () {
    if (window.__rvCestaBootstrapLoaded) {
        return;
    }

    window.__rvCestaBootstrapLoaded = true;

    const TEMPLATE_URL = '/Raices-Viajeras/web/html/plantillas/cesta.html';
    const API_URL = '/Raices-Viajeras/web/php/cesta_api.php';
    const LOGIN_URL = '/Raices-Viajeras/web/Formulario/form.html';
    const TRIPS_URL = '/Raices-Viajeras/web/html/provincias.html';
    const FALLBACK_IMAGE = '/Raices-Viajeras/img/logos/raices-viajeras-logo0.webp';

    let templatePromise = null;
    let eventsBound = false;

    function escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (char) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[char]));
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR'
        }).format(Number(value || 0));
    }

    function truncateText(value, maxLength = 120) {
        const text = String(value ?? '').trim();
        if (text.length <= maxLength) {
            return text;
        }

        return `${text.slice(0, maxLength - 1).trimEnd()}...`;
    }

    function getCountLabel(count) {
        return `${count} ${count === 1 ? 'articulo' : 'articulos'}`;
    }

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

    function ensureCartContainer() {
        let container = document.getElementById('contenedorCesta');

        if (!container) {
            container = document.createElement('div');
            container.id = 'contenedorCesta';
            document.body.appendChild(container);
        }

        return container;
    }

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

    function renderAll(summary) {
        updateBadge(summary.carrito.count);
        renderModal(summary);
        renderCartPage(summary);
    }

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

    async function removeItem(carritoViajeId) {
        const response = await fetch(API_URL, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                accion: 'eliminar_item',
                carrito_viaje_id: carritoViajeId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data && data.error ? data.error : `HTTP ${response.status}`);
        }

        return normalizeSummary(data);
    }

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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCesta);
    } else {
        initCesta();
    }
})();
