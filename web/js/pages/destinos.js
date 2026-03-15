(async function(){
    // Carga los viajes de una provincia concreta y genera las tarjetas que se muestran en destinos.html
    const wrap = document.getElementById('viajes-wrap');
    const params = new URLSearchParams(window.location.search);
    const provId = params.get('provincia_id')
    if (!provId) { wrap.innerHTML = '<p class="text-muted">Provincia no especificada.</p>'; return; }
    try{
        const res = await fetch('../php/get_viajes_by_provincia.php?provincia_id=' + encodeURIComponent(provId));
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
            wrap.innerHTML = '<p class="text-muted">No hay viajes en esta provincia.</p>';
            return;
        }
        data.forEach(v => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.width = '18rem';

            const img = document.createElement('img'); img.className = 'card-img-top'; img.alt = v.titulo || ''; img.src = v.imagen || '../../img/logos/raices-viajeras-logo0.webp';
            card.appendChild(img);

            const body = document.createElement('div'); body.className = 'card-body';
            const h5 = document.createElement('h5'); h5.className = 'card-title'; h5.textContent = v.titulo || '';
            const ptext = document.createElement('p'); ptext.className = 'card-text'; ptext.textContent = v.descripcion || '';
            const a = document.createElement('a'); a.className = 'btn btn-primary'; a.href = 'infoAventura.html?viaje=' + v.id; a.textContent = 'Ver aventura';
            const precio = document.createElement('div'); precio.className = 'mt-2 fw-bold'; precio.textContent = v.precio ? ('€' + v.precio) : '';

            body.appendChild(h5); body.appendChild(ptext); body.appendChild(precio); body.appendChild(a);
            card.appendChild(body);

            card.style.cursor = 'pointer';
            card.addEventListener('click', () => { window.location.href = 'infoAventura.html?viaje=' + v.id; });

            wrap.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        wrap.innerHTML = '<p class="text-danger">Error cargando viajes.</p>';
    }
})();
