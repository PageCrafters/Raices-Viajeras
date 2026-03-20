// Activo la clase de transiciones al arrancar para que el cambio de tema no pegue saltos raros.
document.body.classList.add('theme-loaded');

/**
 * Sincroniza los iconos del tema con el modo que este activo ahora.
 *
 * @returns {void}
 */
function actualizarIconos() {
    const isDark = document.documentElement.classList.contains('dark-mode');
    const iconos = document.querySelectorAll('.theme-icon');

    iconos.forEach((icono) => {
        icono.classList.remove('bi-moon-fill', 'bi-sun-fill');
        icono.classList.add(isDark ? 'bi-sun-fill' : 'bi-moon-fill');
    });
}

// Lo dejo global porque el header cargado por fetch usa onclick en los botones del tema.
window.actualizarIconos = actualizarIconos;

/**
 * Alterna entre modo claro y oscuro y guarda la preferencia.
 *
 * @returns {void}
 */
window.cambiaModoColor = () => {
    const isDark = document.documentElement.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    window.actualizarIconos();
};

/**
 * Deja el icono del tema listo cuando la pagina ya ha cargado.
 *
 * @returns {void}
 */
function initThemeUi() {
    window.actualizarIconos();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeUi);
} else {
    initThemeUi();
}
