document.addEventListener('DOMContentLoaded', () => {
    /**
     * Convierte una plantilla HTML en nodos para insertarlos sin usar innerHTML.
     *
     * @param {string} html Plantilla cruda recibida por fetch.
     * @returns {Array<Node>} Nodos listos para insertar en el DOM actual.
     */
    function parseHtmlNodes(html) {
        const parser = new DOMParser();
        const parsed = parser.parseFromString(html, 'text/html');
        return Array.from(parsed.body.childNodes).map((node) => document.importNode(node, true));
    }

    /**
     * Se asegura de que la cesta global se cargue solo una vez.
     *
     * @returns {void}
     */
    function ensureCestaBootstrap() {
        if (typeof window.initCesta === 'function') {
            window.initCesta();
            return;
        }

        if (document.getElementById('rv-cesta-script')) {
            return;
        }

        const script = document.createElement('script');
        script.id = 'rv-cesta-script';
        script.src = '/Raices-Viajeras/web/js/plantillas/cesta.js';
        document.body.appendChild(script);
    }

    /**
     * Pinta el estado de acceso en el header.
     *
     * @param {object|null} sessionData Datos basicos de la sesion activa.
     * @returns {void}
     */
    function renderAuthState(sessionData) {
        const authItem = document.getElementById('header-auth-item');
        if (!authItem) {
            return;
        }

        authItem.replaceChildren();

        if (sessionData?.logueado) {
            const userName = sessionData.nombre || 'Usuario';

            const userLabel = document.createElement('span');
            userLabel.className = 'nav-link header-user-name';
            userLabel.textContent = `Hola, ${userName}`;

            const logoutLink = document.createElement('a');
            logoutLink.className = 'nav-link header-logout-link';
            logoutLink.href = '/Raices-Viajeras/web/php/cerrar_sesion.php';
            logoutLink.textContent = 'Cerrar sesión';

            authItem.appendChild(userLabel);
            authItem.appendChild(logoutLink);
            return;
        }

        const loginLink = document.createElement('a');
        loginLink.className = 'nav-link';
        loginLink.href = '/Raices-Viajeras/web/Formulario/form.html?modo=login';
        loginLink.textContent = 'Iniciar sesión';
        authItem.appendChild(loginLink);
    }

    /**
     * Ajusta las partes del header que dependen de la sesion.
     *
     * @param {object|null} sessionData Datos de la sesion actual.
     * @returns {void}
     */
    function applySessionState(sessionData) {
        renderAuthState(sessionData);

        const adminButton = document.getElementById('btn-admin-nav');
        if (adminButton && sessionData?.rol === 'admin') {
            adminButton.classList.remove('d-none');
        }
    }

    /**
     * Carga la plantilla comun del header y aplica el estado de sesion.
     *
     * @returns {Promise<void>}
     */
    async function loadHeader() {
        const headerContainer = document.getElementById('header');
        if (!headerContainer) {
            return;
        }

        const response = await fetch('/Raices-Viajeras/web/html/plantillas/header.html', {
            cache: 'no-store'
        });
        const html = await response.text();

        headerContainer.replaceChildren(...parseHtmlNodes(html));

        if (typeof window.actualizarIconos === 'function') {
            window.actualizarIconos();
        }

        ensureCestaBootstrap();

        try {
            const sessionResponse = await fetch('/Raices-Viajeras/web/php/sesion.php', {
                cache: 'no-store',
                credentials: 'same-origin'
            });
            const sessionData = await sessionResponse.json();
            applySessionState(sessionData);
        } catch (error) {
            console.error('Error comprobando sesion:', error);
            renderAuthState(null);
        }
    }

    loadHeader().catch((error) => {
        console.error('Error cargando el header:', error);
    });
});
