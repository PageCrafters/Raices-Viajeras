(async function(){
    // Carga los detalles de un viaje concreto y los muestra en la página
    const container = document.getElementById('viaje-detail');
    const params = new URLSearchParams(window.location.search);
    const vid = params.get('viaje');
    if (!vid) { container.innerHTML = '<p class="text-muted">Viaje no especificado.</p>'; return; }
    try{
        const res = await fetch('../php/get_viaje.php?viaje=' + encodeURIComponent(vid));
        console.debug('get_viaje HTTP status:', res.status);
        console.debug('get_viaje Content-Type:', res.headers.get('content-type'));
        const raw = await res.text();
        let v;
        try {
            v = JSON.parse(raw);
        } catch (e) {
            console.error('get_viaje: respuesta no JSON', raw);
            container.innerHTML = '<p class="text-danger">Error cargando información del viaje (respuesta inválida).</p>';
            return;
        }
        if (!v) { container.innerHTML = '<p class="text-muted">Viaje no encontrado.</p>'; return; }
        const html = `
            <div class="card mb-3">
                <div class="row g-0">
                    <div class="col-md-4">
                        <img src="${v.imagen || '../../img/logos/raices-viajeras-logo0.webp'}" class="img-fluid rounded-start" alt="${v.titulo}">
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${v.titulo}</h5>
                            <p class="card-text">${v.descripcion || ''}</p>
                            <p class="card-text"><small class="text-muted">${v.detalles || ''}</small></p>
                            ${v.provincia_nombre ? `<p class="card-text"><small class="text-muted">Provincia: ${v.provincia_nombre}</small></p>` : ''}
                            <p class="fw-bold">${v.precio ? ('€' + v.precio) : ''}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML = html;
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="text-danger">Error cargando información del viaje.</p>';
    }
})();
