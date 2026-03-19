// Cargamos el footer sin reescribir el body para no destruir el DOM ya montado.
document.addEventListener('DOMContentLoaded', () => {
    fetch('/Raices-Viajeras/web/html/plantillas/footer.html')
        .then(resServer => {
            if (!resServer.ok) {
                throw new Error(`HTTP ${resServer.status}`);
            }
            return resServer.text();
        })
        .then(htmlDevuelto => {
            let footerContainer = document.getElementById('footer');

            if (!footerContainer) {
                footerContainer = document.createElement('div');
                footerContainer.id = 'footer';
                document.body.appendChild(footerContainer);
            }

            footerContainer.innerHTML = htmlDevuelto;
        })
        .catch(err => console.error('Error cargando el footer:', err));
});
