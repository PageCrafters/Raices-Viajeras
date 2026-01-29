// Cargamos el HTML
document.addEventListener('DOMContentLoaded', () => {
    fetch('/Raices-Viajeras/web/html/plantillas/header.html')
        .then(resServer => resServer.text())
        .then(htmlDevuelto => {
            // Seleccionamos el contenedor donde irá el header
            const headerContainer = document.getElementById('header');
            headerContainer.innerHTML = htmlDevuelto;
            // Después de cargar el header, actualizamos los iconos según el tema actual
            window.actualizarIconos();
        })
        .catch(err => console.error('Error cargando el header:', err));
});
