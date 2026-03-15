const API = '../php/admin_api.php';

// ── NAVEGACIÓN ───────────────────────────────────────────────
function mostrarSeccion(nombre, linkEl) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.add('d-none'));
    document.getElementById('sec-' + nombre).classList.remove('d-none');
    document.querySelectorAll('#sidebar a').forEach(l => l.classList.remove('bg-white', 'bg-opacity-25'));
    if (linkEl) linkEl.classList.add('bg-white', 'bg-opacity-25');
    const titulos = { dashboard: 'Dashboard', usuarios: 'Usuarios', viajes: 'Productos / Viajes', categorias: 'Categorías', pedidos: 'Pedidos' };
    document.getElementById('topbar-title').textContent = titulos[nombre] || nombre;
    if (nombre === 'usuarios')   cargarUsuarios();
    if (nombre === 'viajes')     cargarViajes();
    if (nombre === 'categorias') cargarCategorias();
    if (nombre === 'pedidos')    cargarPedidos();
    closeSidebar();
}

// SIDEBAR MÓVIL 
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    if (sidebar.style.transform === 'translateX(0px)' || sidebar.style.transform === '') {
        sidebar.style.transform = 'translateX(-100%)';
        overlay.classList.add('d-none');
    } else {
        sidebar.style.transform = 'translateX(0px)';
        overlay.classList.remove('d-none');
    }
}

function closeSidebar() {
    if (window.innerWidth < 992) {
        document.getElementById('sidebar').style.transform = 'translateX(-100%)';
        document.getElementById('overlay').classList.add('d-none');
    }
}

function initResponsive() {
    if (window.innerWidth < 992) {
        document.getElementById('sidebar').style.transform = 'translateX(-100%)';
        document.getElementById('main').style.marginLeft = '0';
    }
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992) {
            document.getElementById('sidebar').style.transform = 'translateX(0)';
            document.getElementById('main').style.marginLeft = '260px';
            document.getElementById('overlay').classList.add('d-none');
        } else {
            document.getElementById('sidebar').style.transform = 'translateX(-100%)';
            document.getElementById('main').style.marginLeft = '0';
        }
    });
}

// FETCH HELPERS 
async function apiFetch(params) {
    const url = new URL(API, window.location.href);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const res = await fetch(url);
    return res.json();
}

async function apiPost(body) {
    const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    return res.json();
}

// ESTADO
function badgeEstado(estado) {
    const map = { pendiente: 'bg-warning text-dark', completado: 'bg-success text-white', cancelado: 'bg-danger text-white', procesando: 'bg-primary text-white' };
    return `<span class="badge rounded-pill ${map[estado] || 'bg-secondary text-white'}">${estado || '—'}</span>`;
}

function badgeRol(rol) {
    return rol === 'admin'
        ? `<span class="badge rounded-pill bg-success">Admin</span>`
        : `<span class="badge rounded-pill bg-secondary">Usuario</span>`;
}

// BUSCADOR 
function buscarEnTabla(tablaId, texto) {
    document.querySelectorAll(`#${tablaId} tr`).forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(texto.toLowerCase()) ? '' : 'none';
    });
}

// DASHBOARD 
async function cargarDashboard() {
    try {
        const data = await apiFetch({ accion: 'stats' });
        document.getElementById('stat-usuarios').textContent   = data.usuarios   ?? '—';
        document.getElementById('stat-viajes').textContent     = data.viajes     ?? '—';
        document.getElementById('stat-pedidos').textContent    = data.pedidos    ?? '—';
        document.getElementById('stat-provincias').textContent = data.provincias ?? '—';
        const tbody = document.getElementById('tabla-ultimos-pedidos');
        if (data.ultimos_pedidos?.length) {
            tbody.innerHTML = data.ultimos_pedidos.map(p => `
                <tr>
                    <td class="ps-3">#${p.id}</td>
                    <td>${p.usuario_id}</td>
                    <td>${parseFloat(p.total).toFixed(2)} €</td>
                    <td>${badgeEstado(p.estado)}</td>
                    <td>${p.fecha_pedido?.split(' ')[0] || '—'}</td>
                </tr>`).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Sin pedidos</td></tr>';
        }
    } catch(e) { console.error(e); }
}

// USUARIOS 
async function cargarUsuarios() {
    const tbody = document.getElementById('tabla-usuarios');
    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border spinner-border-sm text-success"></div></td></tr>';
    try {
        const data = await apiFetch({ accion: 'usuarios' });
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">Sin usuarios</td></tr>'; return; }
        tbody.innerHTML = data.map(u => `
            <tr>
                <td class="ps-3">${u.id}</td>
                <td>${u.nombre_completo}</td>
                <td>${u.correo}</td>
                <td>${u.genero || '—'}</td>
                <td>${badgeRol(u.rol)}</td>
                <td class="d-flex gap-1">
                    <button class="btn btn-warning btn-sm" onclick="abrirModalUsuario(${JSON.stringify(u).replace(/"/g, '&quot;')})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmarEliminar('usuario', ${u.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-3">Error al cargar</td></tr>'; }
}

function abrirModalUsuario(u = null) {
    document.getElementById('u-id').value      = u?.id || '';
    document.getElementById('u-nombre').value  = u?.nombre_completo || '';
    document.getElementById('u-correo').value  = u?.correo || '';
    document.getElementById('u-pwd').value     = '';
    document.getElementById('u-genero').value  = u?.genero || '';
    document.getElementById('u-rol').value     = u?.rol || 'usuario';
    document.getElementById('modalUsuarioTitulo').textContent = u ? 'Editar usuario' : 'Nuevo usuario';
    new bootstrap.Modal(document.getElementById('modalUsuario')).show();
}

async function guardarUsuario() {
    const id = document.getElementById('u-id').value;
    const body = {
        accion:          id ? 'editar_usuario' : 'crear_usuario',
        id,
        nombre_completo: document.getElementById('u-nombre').value,
        correo:          document.getElementById('u-correo').value,
        pwd:             document.getElementById('u-pwd').value,
        genero:          document.getElementById('u-genero').value,
        rol:             document.getElementById('u-rol').value
    };
    try {
        await apiPost(body);
        bootstrap.Modal.getInstance(document.getElementById('modalUsuario')).hide();
        cargarUsuarios();
    } catch(e) { alert('Error al guardar el usuario'); }
}

// VIAJES 
async function cargarViajes() {
    const tbody = document.getElementById('tabla-viajes');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-success"></div></td></tr>';
    try {
        const data = await apiFetch({ accion: 'viajes' });
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Sin viajes</td></tr>'; return; }
        tbody.innerHTML = data.map(v => `
            <tr>
                <td class="ps-3">${v.id}</td>
                <td>${v.titulo}</td>
                <td>${v.origen || '—'}</td>
                <td>${v.fecha_inicio || '—'}</td>
                <td>${parseFloat(v.precio).toFixed(2)} €</td>
                <td>${v.plazas}</td>
                <td class="d-flex gap-1">
                    <button class="btn btn-warning btn-sm" onclick="abrirModalViaje(${JSON.stringify(v).replace(/"/g, '&quot;')})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmarEliminar('viaje', ${v.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-3">Error al cargar</td></tr>'; }
}

async function abrirModalViaje(v = null) {
    // Cargar provincias en el select
    const provincias = await apiFetch({ accion: 'provincias' });
    const select = document.getElementById('v-provincia');
    select.innerHTML = provincias.map(p => `<option value="${p.id}" ${v?.provincia_id == p.id ? 'selected' : ''}>${p.nombre}</option>`).join('');

    document.getElementById('v-id').value           = v?.id || '';
    document.getElementById('v-titulo').value       = v?.titulo || '';
    document.getElementById('v-descripcion').value  = v?.descripcion || '';
    document.getElementById('v-origen').value       = v?.origen || '';
    document.getElementById('v-fecha-inicio').value = v?.fecha_inicio || '';
    document.getElementById('v-fecha-fin').value    = v?.fecha_fin || '';
    document.getElementById('v-precio').value       = v?.precio || '';
    document.getElementById('v-plazas').value       = v?.plazas || '';
    document.getElementById('v-imagen').value       = v?.imagen || '';
    document.getElementById('modalViajeTitulo').textContent = v ? 'Editar viaje' : 'Nuevo viaje';
    new bootstrap.Modal(document.getElementById('modalViaje')).show();
}

async function guardarViaje() {
    const id = document.getElementById('v-id').value;
    const body = {
        accion:      id ? 'editar_viaje' : 'crear_viaje',
        id,
        titulo:      document.getElementById('v-titulo').value,
        descripcion: document.getElementById('v-descripcion').value,
        origen:      document.getElementById('v-origen').value,
        provincia_id:document.getElementById('v-provincia').value,
        fecha_inicio:document.getElementById('v-fecha-inicio').value,
        fecha_fin:   document.getElementById('v-fecha-fin').value,
        precio:      document.getElementById('v-precio').value,
        plazas:      document.getElementById('v-plazas').value,
        imagen:      document.getElementById('v-imagen').value
    };
    try {
        await apiPost(body);
        bootstrap.Modal.getInstance(document.getElementById('modalViaje')).hide();
        cargarViajes();
    } catch(e) { alert('Error al guardar el viaje'); }
}

// CATEGORÍAS 
async function cargarCategorias() {
    const tbody = document.getElementById('tabla-categorias');
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4"><div class="spinner-border spinner-border-sm text-success"></div></td></tr>';
    try {
        const data = await apiFetch({ accion: 'provincias' });
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Sin categorías</td></tr>'; return; }
        tbody.innerHTML = data.map(p => `
            <tr>
                <td class="ps-3">${p.id}</td>
                <td>${p.nombre}</td>
                <td class="text-muted small">${p.descripcion ? p.descripcion.substring(0, 60) + '...' : '—'}</td>
                <td>${p.created_at?.split(' ')[0] || '—'}</td>
                <td class="d-flex gap-1">
                    <button class="btn btn-warning btn-sm" onclick="abrirModalCategoria(${JSON.stringify(p).replace(/"/g, '&quot;')})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmarEliminar('provincia', ${p.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-3">Error al cargar</td></tr>'; }
}

function abrirModalCategoria(c = null) {
    document.getElementById('c-id').value          = c?.id || '';
    document.getElementById('c-nombre').value      = c?.nombre || '';
    document.getElementById('c-descripcion').value = c?.descripcion || '';
    document.getElementById('c-imagen').value      = c?.imagen || '';
    document.getElementById('modalCategoriaTitulo').textContent = c ? 'Editar categoría' : 'Nueva categoría';
    new bootstrap.Modal(document.getElementById('modalCategoria')).show();
}

async function guardarCategoria() {
    const id = document.getElementById('c-id').value;
    const body = {
        accion:      id ? 'editar_provincia' : 'crear_provincia',
        id,
        nombre:      document.getElementById('c-nombre').value,
        descripcion: document.getElementById('c-descripcion').value,
        imagen:      document.getElementById('c-imagen').value
    };
    try {
        await apiPost(body);
        bootstrap.Modal.getInstance(document.getElementById('modalCategoria')).hide();
        cargarCategorias();
    } catch(e) { alert('Error al guardar la categoría'); }
}

// PEDIDOS 
async function cargarPedidos() {
    const tbody = document.getElementById('tabla-pedidos');
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-success"></div></td></tr>';
    const estado = document.getElementById('filtro-estado-pedido')?.value || '';
    try {
        const params = { accion: 'pedidos' };
        if (estado) params.estado = estado;
        const data = await apiFetch(params);
        if (!data.length) { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Sin pedidos</td></tr>'; return; }
        tbody.innerHTML = data.map(p => `
            <tr>
                <td class="ps-3">#${p.id}</td>
                <td>${p.usuario_id}</td>
                <td>${parseFloat(p.total).toFixed(2)} €</td>
                <td>${badgeEstado(p.estado)}</td>
                <td class="text-muted small">${p.direccion_envio ? p.direccion_envio.substring(0, 30) + '...' : '—'}</td>
                <td>${p.fecha_pedido?.split(' ')[0] || '—'}</td>
                <td class="d-flex gap-1">
                    <button class="btn btn-warning btn-sm" onclick="abrirModalEstado(${p.id}, '${p.estado}')">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="confirmarEliminar('pedido', ${p.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>`).join('');
    } catch(e) { tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-3">Error al cargar</td></tr>'; }
}

function abrirModalEstado(id, estadoActual) {
    document.getElementById('estado-pedido-id').value = id;
    document.getElementById('nuevo-estado-pedido').value = estadoActual;
    new bootstrap.Modal(document.getElementById('modalEstado')).show();
}

async function guardarEstadoPedido() {
    const id     = document.getElementById('estado-pedido-id').value;
    const estado = document.getElementById('nuevo-estado-pedido').value;
    try {
        await apiPost({ accion: 'actualizar_estado_pedido', id, estado });
        bootstrap.Modal.getInstance(document.getElementById('modalEstado')).hide();
        cargarPedidos();
    } catch(e) { alert('Error al actualizar el estado'); }
}

// ELIMINAR 
let pendienteEliminar = null;

function confirmarEliminar(tipo, id) {
    pendienteEliminar = { tipo, id };
    new bootstrap.Modal(document.getElementById('modalEliminar')).show();
}

document.getElementById('btn-confirmar-eliminar').addEventListener('click', async () => {
    if (!pendienteEliminar) return;
    try {
        await apiPost({ accion: 'eliminar', tipo: pendienteEliminar.tipo, id: pendienteEliminar.id });
        bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();
        if (pendienteEliminar.tipo === 'usuario')   cargarUsuarios();
        if (pendienteEliminar.tipo === 'viaje')     cargarViajes();
        if (pendienteEliminar.tipo === 'provincia') cargarCategorias();
        if (pendienteEliminar.tipo === 'pedido')    cargarPedidos();
        pendienteEliminar = null;
    } catch(e) { alert('Error al eliminar'); }
});

// INIT
document.addEventListener('DOMContentLoaded', () => {
    initResponsive();
    mostrarSeccion('dashboard', document.getElementById('nav-dashboard'));
    cargarDashboard();
});