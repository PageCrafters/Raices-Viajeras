document.addEventListener('DOMContentLoaded', async () => {
    // Cargamos la lista de provincias desde el backend y generamos fichas (cards)
    const wrap = document.getElementById('provincias-wrap');
    if (!wrap) return;
    try{
        const res = await fetch('../php/get_provincias.php', { cache: 'no-store', credentials: 'same-origin' });
        if (!res.ok) throw new Error('HTTP error ' + res.status);
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
            wrap.innerHTML = '<p class="text-muted">No hay provincias para mostrar.</p>';
            return;
        }
        wrap.innerHTML = '';
        data.forEach(p => {
            const card = document.createElement('div');
            card.className = 'card';
            card.style.width = '18rem';

            const img = document.createElement('img');
            img.className = 'card-img-top';
            img.alt = p.nombre || '';
            img.src = p.imagen || '../../img/logos/raices-viajeras-logo0.webp';
            card.appendChild(img);

            const body = document.createElement('div');
            body.className = 'card-body';
            const h5 = document.createElement('h5'); h5.className = 'card-title'; h5.textContent = p.nombre || '';
            const pill = document.createElement('span'); pill.className = 'badge bg-secondary ms-2'; pill.textContent = p.viajes_count;
            h5.appendChild(pill);
            const ptext = document.createElement('p'); ptext.className = 'card-text'; ptext.textContent = p.descripcion || '';
            const a = document.createElement('a'); a.className = 'btn btn-primary'; a.href = 'destinos.html?provincia_id=' + p.id; a.textContent = 'Ver destinos';

            body.appendChild(h5);
            body.appendChild(ptext);
            body.appendChild(a);
            card.appendChild(body);

            if (p.viajes_count === 0) {
                card.classList.add('card-disabled');
            } else {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => { window.location.href = 'destinos.html?provincia_id=' + p.id; });
            }

            wrap.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        wrap.innerHTML = '<p class="text-danger">Error cargando provincias.</p>';
    }
});
