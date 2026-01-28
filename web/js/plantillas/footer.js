// Cargamos el HTML
document.addEventListener('DOMContentLoaded', () => {
    fetch('/Raices-Viajeras/web/html/plantillas/footer.html')
        .then(resServer => resServer.text())
        .then(htmlDevuelto => {
            // Seleccionamos el contenedor donde irá el footer
            const headerContainer = document.getElementById('body');
            headerContainer.innerHTML = headerContainer.innerHTML + htmlDevuelto;
        })
        .catch(err => console.error('Error cargando el footer:', err));
});