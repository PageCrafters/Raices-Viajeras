// Cargamos el HTML
document.addEventListener('DOMContentLoaded', () => {
    fetch('/Raices-Viajeras/web/html/plantillas/cesta.html')
        .then(resServer => resServer.text())
        .then(htmlDevuelto => {
            // Seleccionamos el contenedor donde irá la cesta
            const headerContainer = document.getElementById('contenedorCesta');
            headerContainer.innerHTML = htmlDevuelto;
        })
        .catch(err => console.error('Error cargando la cesta:', err));
});