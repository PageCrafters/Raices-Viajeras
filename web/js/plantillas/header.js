document.addEventListener('DOMContentLoaded', () => {
    const ensureCestaBootstrap = () => {
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
    };

    fetch('/Raices-Viajeras/web/html/plantillas/header.html')
        .then((response) => response.text())
        .then((html) => {
            const headerContainer = document.getElementById('header');
            if (!headerContainer) {
                return;
            }

            headerContainer.innerHTML = html;

            if (typeof window.actualizarIconos === 'function') {
                window.actualizarIconos();
            }

            ensureCestaBootstrap();

            fetch('/Raices-Viajeras/web/php/sesion.php')
                .then((response) => response.json())
                .then((data) => {
                    if (data.rol === 'admin') {
                        const adminButton = document.getElementById('btn-admin-nav');
                        if (adminButton) {
                            adminButton.classList.remove('d-none');
                        }
                    }
                })
                .catch((error) => console.error('Error comprobando sesion:', error));
        })
        .catch((error) => console.error('Error cargando el header:', error));
});
