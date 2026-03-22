(function () {
    const MOBILE_MAX_WIDTH = 850;
    const nativeFetch = window.fetch.bind(window);

    /**
     * Calcula una sola vez si la carga inicial es móvil o escritorio
     *
     * @returns {'mobile'|'desktop'} Modo de viewport fijado para esta carga
     */
    function getInitialViewport() {
        if (window.__rvInitialViewport) {
            return window.__rvInitialViewport;
        }

        const isMobile = typeof window.matchMedia === 'function'
            ? window.matchMedia(`(max-width: ${MOBILE_MAX_WIDTH}px)`).matches
            : window.innerWidth <= MOBILE_MAX_WIDTH;

        window.__rvInitialViewport = isMobile ? 'mobile' : 'desktop';
        return window.__rvInitialViewport;
    }

    /**
     * Añade el header de viewport sin perder el resto de opciones del fetch
     *
     * @param {RequestInit} [init={}] Configuración original del fetch
     * @returns {RequestInit} Configuración lista para enviar
     */
    function withViewportHeaders(init = {}) {
        const headers = new Headers(init.headers || {});
        headers.set('X-RV-Viewport', getInitialViewport());

        return {
            ...init,
            headers
        };
    }

    /**
     * Wrapper común de fetch para las páginas públicas
     *
     * @param {RequestInfo | URL} input Recurso a pedir
     * @param {RequestInit} [init={}] Opciones del fetch
     * @returns {Promise<Response>} Respuesta nativa del navegador
     */
    function rvFetch(input, init = {}) {
        return nativeFetch(input, withViewportHeaders(init));
    }

    window.rvGetInitialViewport = getInitialViewport;
    window.rvWithViewportHeaders = withViewportHeaders;
    window.rvFetch = rvFetch;

    getInitialViewport();
})();
