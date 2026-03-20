document.addEventListener('DOMContentLoaded', () => {
    /**
     * Escapa texto antes de meterlo dentro del header.
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

        if (sessionData?.logueado) {
            const userName = escapeHtml(sessionData.nombre || 'Usuario');
            authItem.innerHTML = `
                <span class="nav-link header-user-name">Hola, ${userName}</span>
                <a class="nav-link header-logout-link" href="/Raices-Viajeras/web/php/cerrar_sesion.php">Cerrar sesión</a>
            `;
            return;
        }

        authItem.innerHTML = '<a class="nav-link" href="/Raices-Viajeras/web/Formulario/form.html?modo=login">Iniciar sesión</a>';
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

        headerContainer.innerHTML = html;

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
