document.addEventListener('DOMContentLoaded', () => {
    /**
     * Se asegura de que exista el contenedor del footer compartido.
     *
     * @returns {HTMLElement} Nodo donde se inyecta la plantilla.
     */
    function ensureFooterContainer() {
        let footerContainer = document.getElementById('footer');

        if (!footerContainer) {
            footerContainer = document.createElement('div');
            footerContainer.id = 'footer';
            document.body.appendChild(footerContainer);
        }

        return footerContainer;
    }

    /**
     * Convierte una plantilla HTML en nodos listos para inyectar.
     *
     * @param {string} html Plantilla cruda del footer.
     * @returns {Array<Node>} Nodos clonado/importados al documento actual.
     */
    function parseHtmlNodes(html) {
        const parser = new DOMParser();
        const parsed = parser.parseFromString(html, 'text/html');
        return Array.from(parsed.body.childNodes).map((node) => document.importNode(node, true));
    }

    /**
     * Carga el footer comun sin tocar el resto del DOM ya renderizado.
     *
     * @returns {Promise<void>}
     */
    async function loadFooter() {
        const response = await fetch('/Raices-Viajeras/web/html/plantillas/footer.html', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const html = await response.text();
        ensureFooterContainer().replaceChildren(...parseHtmlNodes(html));
    }

    loadFooter().catch((error) => {
        console.error('Error cargando el footer:', error);
    });
});
