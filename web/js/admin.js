const API = '../php/admin_api.php';
let pendingDelete = null;
let tripPreviewObjectUrl = null;
let tripMobilePreviewObjectUrl = null;
let categoryPreviewObjectUrl = null;
let categoryMobilePreviewObjectUrl = null;

/**
 * Saca al usuario del panel cuando la sesión ya no vale.
 *
 * @returns {void}
 */
function redirectToLogin() {
    window.location.href = '/Raices-Viajeras/web/Formulario/form.html?modo=login';
}

/**
 * Lee la respuesta JSON del panel y corta aquí si el backend ya ha devuelto error.
 *
 * @param {Response} response Respuesta original de fetch
 * @returns {Promise<any>} JSON válido cuando la respuesta es correcta.
 */
async function parseApiResponse(response) {
    const data = await response.json();

    if (response.ok) {
        return data;
    }

    if (response.status === 401 || response.status === 403) {
        alert(data.error || 'Tu sesión ya no es válida para entrar aquí.');
        redirectToLogin();
        throw new Error(data.error || 'Sesión no válida');
    }

    throw new Error(data.error || `HTTP ${response.status}`);
}

/**
 * Cambia la seccion visible del panel y carga sus datos cuando toca
 *
 * @param {string} name Nombre interno de la seccion
 * @param {HTMLElement|null} linkElement Enlace del menu que se marca como activo
 * @returns {void}
 */
function showSection(name, linkElement) {
    document.querySelectorAll('.seccion').forEach((section) => {
        section.classList.add('d-none');
    });

    const currentSection = document.getElementById(`sec-${name}`);
    if (currentSection) {
        currentSection.classList.remove('d-none');
    }

    document.querySelectorAll('#sidebar a').forEach((link) => {
        link.classList.remove('bg-white', 'bg-opacity-25');
    });

    if (linkElement) {
        linkElement.classList.add('bg-white', 'bg-opacity-25');
    }

    const titles = {
        dashboard: 'Dashboard',
        usuarios: 'Usuarios',
        viajes: 'Productos / Viajes',
        categorias: 'Categorías',
        pedidos: 'Pedidos'
    };

    const topbarTitle = document.getElementById('topbar-title');
    if (topbarTitle) {
        topbarTitle.textContent = titles[name] || name;
    }

    if (name === 'usuarios') {
        loadUsers();
    }
    if (name === 'dashboard') {
        loadDashboard();
    }
    if (name === 'viajes') {
        loadTrips();
    }
    if (name === 'categorias') {
        loadCategories();
    }
    if (name === 'pedidos') {
        loadOrders();
    }

    closeSidebar();
}

/**
 * Abre o cierra la sidebar del panel en móvil.
 *
 * @returns {void}
 */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (!sidebar || !overlay) {
        return;
    }

    const isOpen = sidebar.style.transform === 'translateX(0px)' || sidebar.style.transform === 'translateX(0)';
    sidebar.style.transform = isOpen ? 'translateX(-100%)' : 'translateX(0px)';
    overlay.classList.toggle('d-none', isOpen);
}

/**
 * Cierra la sidebar cuando estamos en móvil.
 *
 * @returns {void}
 */
function closeSidebar() {
    if (window.innerWidth >= 992) {
        return;
    }

    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    if (sidebar) {
        sidebar.style.transform = 'translateX(-100%)';
    }

    if (overlay) {
        overlay.classList.add('d-none');
    }
}

/**
 * Ajusta sidebar y contenido cuando cambia el ancho de pantalla
 *
 * @returns {void}
 */
function initResponsive() {
    /**
     * Aplica el layout correcto del panel segun el ancho actual
     *
     * @returns {void}
     */
    const applyLayout = () => {
        const sidebar = document.getElementById('sidebar');
        const main = document.getElementById('main');
        const overlay = document.getElementById('overlay');

        if (!sidebar || !main || !overlay) {
            return;
        }

        if (window.innerWidth >= 992) {
            sidebar.style.transform = 'translateX(0)';
            main.style.marginLeft = '260px';
            overlay.classList.add('d-none');
            return;
        }

        sidebar.style.transform = 'translateX(-100%)';
        main.style.marginLeft = '0';
        overlay.classList.add('d-none');
    };

    applyLayout();
    window.addEventListener('resize', applyLayout);
}

/**
 * Hace las peticiones GET del panel desde un solo punto
 *
 * @param {Record<string, string>} params Parametros de la accion a llamar
 * @returns {Promise<any>} Respuesta JSON ya validada
 */
async function apiFetch(params) {
    const url = new URL(API, window.location.href);
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
    });

    const response = await fetch(url, {
        credentials: 'same-origin'
    });

    return parseApiResponse(response);
}

/**
 * Hace las peticiones POST del panel con el mismo control de errores
 *
 * @param {object} body Cuerpo JSON de la peticion
 * @returns {Promise<any>} Respuesta JSON ya validada
 */
async function apiPost(body) {
    const response = await fetch(API, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    return parseApiResponse(response);
}

/**
 * Hace POST con FormData para los casos en los que el panel sube archivos
 *
 * @param {FormData} formData Datos del formulario listos para enviar
 * @returns {Promise<any>} Respuesta JSON ya validada
 */
async function apiPostFormData(formData) {
    const response = await fetch(API, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
    });

    return parseApiResponse(response);
}

/**
 * Devuelve la chapa HTML que representa el estado de un pedido
 *
 * @param {string} status Estado actual del pedido
 * @returns {string} HTML del badge listo para insertar
 */
function badgeStatus(status) {
    const map = {
        pendiente: 'bg-warning text-dark',
        completado: 'bg-success text-white',
        cancelado: 'bg-danger text-white',
        procesando: 'bg-primary text-white'
    };

    return `<span class="badge rounded-pill ${map[status] || 'bg-secondary text-white'}">${status || '-'}</span>`;
}

/**
 * Devuelve la chapa HTML del rol de usuario
 *
 * @param {string} role Rol actual del usuario
 * @returns {string} HTML del badge listo para insertar
 */
function badgeRole(role) {
    return role === 'admin'
        ? '<span class="badge rounded-pill bg-success">Admin</span>'
        : '<span class="badge rounded-pill bg-secondary">Usuario</span>';
}

/**
 * Filtra una tabla del panel sin volver a pedir datos al backend
 *
 * @param {string} tableId Id del tbody o tabla a filtrar
 * @param {string} text Texto que se quiere buscar
 * @returns {void}
 */
function filterTable(tableId, text) {
    const query = (text || '').toLowerCase();

    document.querySelectorAll(`#${tableId} tr`).forEach((row) => {
        row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
    });
}

/**
 * Carga las cifras del dashboard y los ultimos pedidos
 *
 * @returns {Promise<void>}
 */
async function loadDashboard() {
    try {
        const data = await apiFetch({ accion: 'stats' });

        document.getElementById('stat-usuarios').textContent = data.usuarios ?? '-';
        document.getElementById('stat-viajes').textContent = data.viajes ?? '-';
        document.getElementById('stat-pedidos').textContent = data.pedidos ?? '-';
        document.getElementById('stat-provincias').textContent = data.provincias ?? '-';
        document.getElementById('stat-entradas-totales').textContent = data.entradas_totales ?? '-';

        const tbody = document.getElementById('tabla-ultimos-pedidos');
        if (!tbody) {
            return;
        }

        if (data.ultimos_pedidos?.length) {
            tbody.innerHTML = data.ultimos_pedidos.map((order) => `
                <tr>
                    <td class="ps-3">#${order.id}</td>
                    <td>${order.usuario_id}</td>
                    <td>${parseFloat(order.total).toFixed(2)} EUR</td>
                    <td>${badgeStatus(order.estado)}</td>
                    <td>${order.fecha_pedido?.split(' ')[0] || '-'}</td>
                </tr>
            `).join('');
            return;
        }

        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Sin pedidos</td></tr>';
    } catch (error) {
        console.error(error);
    }
}

/**
 * Carga la tabla de usuarios y genera sus acciones
 *
 * @returns {Promise<void>}
 */
async function loadUsers() {
    const tbody = document.getElementById('tabla-usuarios');
    if (!tbody) {
        return;
    }

    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-success"></div></td></tr>';

    try {
        const data = await apiFetch({ accion: 'usuarios' });

        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Sin usuarios</td></tr>';
            return;
        }

        tbody.innerHTML = data.map((user) => `
            <tr>
                <td class="ps-3">${user.id}</td>
                <td>${user.nombre_completo}</td>
                <td>${user.correo}</td>
                <td>${user.genero || '-'}</td>
                <td>${badgeRole(user.rol)}</td>
                <td>${user.entradas_usuario ?? 0}</td>
                <td class="admin-actions-cell">
                    <div class="admin-table-actions">
                        <button class="btn btn-warning btn-sm" onclick="abrirModalUsuario(${JSON.stringify(user).replace(/"/g, '&quot;')})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="confirmarEliminar('usuario', ${user.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-3">Error al cargar</td></tr>';
    }
}

/**
 * Rellena el modal de usuario para alta o edicion
 *
 * @param {object|null} [user=null] Usuario a editar. Si no viene, se prepara alta
 * @returns {void}
 */
function openUserModal(user = null) {
    document.getElementById('u-id').value = user?.id || '';
    document.getElementById('u-nombre').value = user?.nombre_completo || '';
    document.getElementById('u-correo').value = user?.correo || '';
    document.getElementById('u-pwd').value = '';
    document.getElementById('u-genero').value = user?.genero || 'o';
    document.getElementById('u-rol').value = user?.rol || 'usuario';
    document.getElementById('modalUsuarioTitulo').textContent = user ? 'Editar usuario' : 'Nuevo usuario';

    new bootstrap.Modal(document.getElementById('modalUsuario')).show();
}

/**
 * Guarda el usuario desde el mismo modal segun sea alta o edicion
 *
 * @returns {Promise<void>}
 */
async function saveUser() {
    const id = document.getElementById('u-id').value;
    const body = {
        accion: id ? 'editar_usuario' : 'crear_usuario',
        id,
        nombre_completo: document.getElementById('u-nombre').value,
        correo: document.getElementById('u-correo').value,
        pwd: document.getElementById('u-pwd').value,
        genero: document.getElementById('u-genero').value || 'o',
        rol: document.getElementById('u-rol').value
    };

    try {
        await apiPost(body);
        bootstrap.Modal.getInstance(document.getElementById('modalUsuario')).hide();
        loadUsers();
    } catch (error) {
        console.error(error);
        alert('Error al guardar el usuario');
    }
}

/**
 * Carga la tabla de viajes del panel
 *
 * @returns {Promise<void>}
 */
async function loadTrips() {
    const tbody = document.getElementById('tabla-viajes');
    if (!tbody) {
        return;
    }

    tbody.innerHTML = '<tr><td colspan="8" class="text-center py-4"><div class="spinner-border spinner-border-sm text-success"></div></td></tr>';

    try {
        const data = await apiFetch({ accion: 'viajes' });

        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-3">Sin viajes</td></tr>';
            return;
        }

        tbody.innerHTML = data.map((trip) => `
            <tr>
                <td class="ps-3">${trip.id}</td>
                <td>${trip.titulo}</td>
                <td>
                    ${trip.imagen_preview
                        ? `<img src="${trip.imagen_preview}" alt="Imagen de ${trip.titulo}" class="rounded border" style="width:56px;height:56px;object-fit:cover;">`
                        : '<span class="badge rounded-pill bg-light text-muted border">Sin imagen</span>'}
                </td>
                <td>${trip.origen || '-'}</td>
                <td>${trip.fecha_inicio || '-'}</td>
                <td>${parseFloat(trip.precio).toFixed(2)} EUR</td>
                <td>${trip.plazas}</td>
                <td class="admin-actions-cell">
                    <div class="admin-table-actions">
                        <button class="btn btn-warning btn-sm" onclick="abrirModalViaje({ id: ${trip.id} })">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="confirmarEliminar('viaje', ${trip.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-danger py-3">Error al cargar</td></tr>';
    }
}

/**
 * Limpia la URL temporal de la miniatura si estaba creada desde un archivo local
 *
 * @returns {void}
 */
function clearTripPreviewObjectUrl() {
    if (tripPreviewObjectUrl) {
        URL.revokeObjectURL(tripPreviewObjectUrl);
        tripPreviewObjectUrl = null;
    }
}

/**
 * Limpia la URL temporal de la miniatura móvil del viaje si venía de un archivo local
 *
 * @returns {void}
 */
function clearTripMobilePreviewObjectUrl() {
    if (tripMobilePreviewObjectUrl) {
        URL.revokeObjectURL(tripMobilePreviewObjectUrl);
        tripMobilePreviewObjectUrl = null;
    }
}

/**
 * Enseña u oculta la miniatura actual del viaje dentro del modal
 *
 * @param {string|null} imageUrl Ruta o data URL de la imagen
 * @returns {void}
 */
function updateTripImagePreview(imageUrl) {
    const previewWrap = document.getElementById('v-imagen-preview-wrap');
    const preview = document.getElementById('v-imagen-preview');

    if (!previewWrap || !preview) {
        return;
    }

    if (!imageUrl) {
        previewWrap.classList.add('d-none');
        preview.src = '';
        return;
    }

    preview.src = imageUrl;
    previewWrap.classList.remove('d-none');
}

/**
 * Enseña u oculta la miniatura móvil actual del viaje dentro del modal
 *
 * @param {string|null} imageUrl Ruta o data URL de la imagen móvil
 * @returns {void}
 */
function updateTripMobileImagePreview(imageUrl) {
    const previewWrap = document.getElementById('v-imagen-movil-preview-wrap');
    const preview = document.getElementById('v-imagen-movil-preview');

    if (!previewWrap || !preview) {
        return;
    }

    if (!imageUrl) {
        previewWrap.classList.add('d-none');
        preview.src = '';
        return;
    }

    preview.src = imageUrl;
    previewWrap.classList.remove('d-none');
}

/**
 * Ajusta el texto de ayuda de las imágenes según estemos creando o editando
 *
 * @param {boolean} isEditing Marca si el modal esta editando un viaje existente
 * @returns {void}
 */
function updateTripImageHelp(isEditing) {
    const help = document.getElementById('v-imagen-help');
    const mobileHelp = document.getElementById('v-imagen-movil-help');
    if (!help || !mobileHelp) {
        return;
    }

    help.textContent = isEditing
        ? 'Si no subes una imagen nueva, se mantiene la que ya tiene el viaje.'
        : 'La imagen es opcional. Si no subes nada, el viaje se guarda sin imagen.';

    mobileHelp.textContent = isEditing
        ? 'Si no subes una imagen móvil nueva, se mantiene la que ya tiene el viaje en móvil.'
        : 'La imagen móvil es opcional. Si no subes nada, el viaje se guarda sin imagen móvil.';
}

/**
 * Prepara la miniatura local cuando el admin elige un archivo nuevo
 *
 * @returns {void}
 */
function handleTripImageInputChange() {
    const input = document.getElementById('v-imagen');
    const previewWrap = document.getElementById('v-imagen-preview-wrap');
    if (!(input instanceof HTMLInputElement)) {
        return;
    }

    clearTripPreviewObjectUrl();

    const file = input.files?.[0];
    if (!file) {
        updateTripImagePreview(previewWrap?.dataset.currentSrc || null);
        return;
    }

    tripPreviewObjectUrl = URL.createObjectURL(file);
    updateTripImagePreview(tripPreviewObjectUrl);
}

/**
 * Prepara la miniatura local cuando el admin elige una imagen móvil nueva para el viaje
 *
 * @returns {void}
 */
function handleTripMobileImageInputChange() {
    const input = document.getElementById('v-imagen-movil');
    const previewWrap = document.getElementById('v-imagen-movil-preview-wrap');
    if (!(input instanceof HTMLInputElement)) {
        return;
    }

    clearTripMobilePreviewObjectUrl();

    const file = input.files?.[0];
    if (!file) {
        updateTripMobileImagePreview(previewWrap?.dataset.currentSrc || null);
        return;
    }

    tripMobilePreviewObjectUrl = URL.createObjectURL(file);
    updateTripMobileImagePreview(tripMobilePreviewObjectUrl);
}

/**
 * Limpia la URL temporal de la miniatura de provincia si venía de un archivo local
 *
 * @returns {void}
 */
function clearCategoryPreviewObjectUrl() {
    if (categoryPreviewObjectUrl) {
        URL.revokeObjectURL(categoryPreviewObjectUrl);
        categoryPreviewObjectUrl = null;
    }
}

/**
 * Limpia la URL temporal de la miniatura móvil de provincia si venía de un archivo local
 *
 * @returns {void}
 */
function clearCategoryMobilePreviewObjectUrl() {
    if (categoryMobilePreviewObjectUrl) {
        URL.revokeObjectURL(categoryMobilePreviewObjectUrl);
        categoryMobilePreviewObjectUrl = null;
    }
}

/**
 * Enseña u oculta la miniatura actual de la provincia en el modal
 *
 * @param {string|null} imageUrl Ruta o data URL de la imagen
 * @returns {void}
 */
function updateCategoryImagePreview(imageUrl) {
    const previewWrap = document.getElementById('c-imagen-preview-wrap');
    const preview = document.getElementById('c-imagen-preview');

    if (!previewWrap || !preview) {
        return;
    }

    if (!imageUrl) {
        previewWrap.classList.add('d-none');
        preview.src = '';
        return;
    }

    preview.src = imageUrl;
    previewWrap.classList.remove('d-none');
}

/**
 * Enseña u oculta la miniatura móvil actual de la provincia en el modal
 *
 * @param {string|null} imageUrl Ruta o data URL de la imagen móvil
 * @returns {void}
 */
function updateCategoryMobileImagePreview(imageUrl) {
    const previewWrap = document.getElementById('c-imagen-movil-preview-wrap');
    const preview = document.getElementById('c-imagen-movil-preview');

    if (!previewWrap || !preview) {
        return;
    }

    if (!imageUrl) {
        previewWrap.classList.add('d-none');
        preview.src = '';
        return;
    }

    preview.src = imageUrl;
    previewWrap.classList.remove('d-none');
}

/**
 * Ajusta la ayuda de las imágenes de provincia según estemos creando o editando
 *
 * @param {boolean} isEditing Marca si el modal esta editando una provincia existente
 * @returns {void}
 */
function updateCategoryImageHelp(isEditing) {
    const help = document.getElementById('c-imagen-help');
    const mobileHelp = document.getElementById('c-imagen-movil-help');
    if (!help || !mobileHelp) {
        return;
    }

    help.textContent = isEditing
        ? 'Si no subes una imagen nueva, se mantiene la que ya tiene la provincia.'
        : 'La imagen es opcional. Si no subes nada, la provincia se guarda sin imagen propia.';

    mobileHelp.textContent = isEditing
        ? 'Si no subes una imagen móvil nueva, se mantiene la que ya tiene la provincia en móvil.'
        : 'La imagen móvil es opcional. Si no subes nada, la provincia se guarda sin imagen móvil.';
}

/**
 * Prepara la miniatura local cuando el admin elige una imagen nueva para la provincia
 *
 * @returns {void}
 */
function handleCategoryImageInputChange() {
    const input = document.getElementById('c-imagen');
    const previewWrap = document.getElementById('c-imagen-preview-wrap');
    if (!(input instanceof HTMLInputElement)) {
        return;
    }

    clearCategoryPreviewObjectUrl();

    const file = input.files?.[0];
    if (!file) {
        updateCategoryImagePreview(previewWrap?.dataset.currentSrc || null);
        return;
    }

    categoryPreviewObjectUrl = URL.createObjectURL(file);
    updateCategoryImagePreview(categoryPreviewObjectUrl);
}

/**
 * Prepara la miniatura local cuando el admin elige una imagen móvil nueva para la provincia
 *
 * @returns {void}
 */
function handleCategoryMobileImageInputChange() {
    const input = document.getElementById('c-imagen-movil');
    const previewWrap = document.getElementById('c-imagen-movil-preview-wrap');
    if (!(input instanceof HTMLInputElement)) {
        return;
    }

    clearCategoryMobilePreviewObjectUrl();

    const file = input.files?.[0];
    if (!file) {
        updateCategoryMobileImagePreview(previewWrap?.dataset.currentSrc || null);
        return;
    }

    categoryMobilePreviewObjectUrl = URL.createObjectURL(file);
    updateCategoryMobileImagePreview(categoryMobilePreviewObjectUrl);
}

/**
 * Carga provincias y luego rellena el modal del viaje
 *
 * @param {object|null} [trip=null] Viaje a editar. Si no viene, se prepara alta
 * @returns {Promise<void>}
 */
async function openTripModal(trip = null) {
    try {
        const isEditing = Boolean(trip?.id);
        const requests = [apiFetch({ accion: 'provincias' })];

        if (isEditing) {
            requests.push(apiFetch({ accion: 'viaje_detalle', id: String(trip.id) }));
        }

        const [provinces, tripDetail] = await Promise.all(requests);
        const currentTrip = tripDetail || trip || null;
        const select = document.getElementById('v-provincia');
        const imageInput = document.getElementById('v-imagen');
        const mobileImageInput = document.getElementById('v-imagen-movil');

        if (select) {
            select.innerHTML = provinces.map((province) => `
                <option value="${province.id}" ${currentTrip?.provincia_id == province.id ? 'selected' : ''}>${province.nombre}</option>
            `).join('');
        }

        document.getElementById('v-id').value = currentTrip?.id || '';
        document.getElementById('v-titulo').value = currentTrip?.titulo || '';
        document.getElementById('v-descripcion').value = currentTrip?.descripcion || '';
        document.getElementById('v-origen').value = currentTrip?.origen || '';
        document.getElementById('v-fecha-inicio').value = currentTrip?.fecha_inicio || '';
        document.getElementById('v-fecha-fin').value = currentTrip?.fecha_fin || '';
        document.getElementById('v-precio').value = currentTrip?.precio || '';
        document.getElementById('v-plazas').value = currentTrip?.plazas || '';
        document.getElementById('modalViajeTitulo').textContent = isEditing ? 'Editar viaje' : 'Nuevo viaje';

        if (imageInput instanceof HTMLInputElement) {
            imageInput.value = '';
        }
        if (mobileImageInput instanceof HTMLInputElement) {
            mobileImageInput.value = '';
        }

        clearTripPreviewObjectUrl();
        clearTripMobilePreviewObjectUrl();
        updateTripImageHelp(isEditing);
        const previewWrap = document.getElementById('v-imagen-preview-wrap');
        const mobilePreviewWrap = document.getElementById('v-imagen-movil-preview-wrap');
        if (previewWrap) {
            previewWrap.dataset.currentSrc = currentTrip?.imagen_preview || '';
        }
        if (mobilePreviewWrap) {
            mobilePreviewWrap.dataset.currentSrc = currentTrip?.imagen_movil_preview || '';
        }
        updateTripImagePreview(currentTrip?.imagen_preview || null);
        updateTripMobileImagePreview(currentTrip?.imagen_movil_preview || null);

        new bootstrap.Modal(document.getElementById('modalViaje')).show();
    } catch (error) {
        console.error(error);
        alert('Error al preparar el formulario del viaje');
    }
}

/**
 * Guarda el viaje desde el modal de productos
 *
 * @returns {Promise<void>}
 */
async function saveTrip() {
    const id = document.getElementById('v-id').value;
    const imageInput = document.getElementById('v-imagen');
    const mobileImageInput = document.getElementById('v-imagen-movil');
    const formData = new FormData();

    formData.append('accion', id ? 'editar_viaje' : 'crear_viaje');
    formData.append('id', id);
    formData.append('titulo', document.getElementById('v-titulo').value);
    formData.append('descripcion', document.getElementById('v-descripcion').value);
    formData.append('origen', document.getElementById('v-origen').value);
    formData.append('provincia_id', document.getElementById('v-provincia').value);
    formData.append('fecha_inicio', document.getElementById('v-fecha-inicio').value);
    formData.append('fecha_fin', document.getElementById('v-fecha-fin').value);
    formData.append('precio', document.getElementById('v-precio').value);
    formData.append('plazas', document.getElementById('v-plazas').value);

    if (imageInput instanceof HTMLInputElement && imageInput.files?.[0]) {
        formData.append('imagen', imageInput.files[0]);
    }
    if (mobileImageInput instanceof HTMLInputElement && mobileImageInput.files?.[0]) {
        formData.append('imagen_movil', mobileImageInput.files[0]);
    }

    try {
        await apiPostFormData(formData);
        bootstrap.Modal.getInstance(document.getElementById('modalViaje')).hide();
        loadTrips();
    } catch (error) {
        console.error(error);
        alert('Error al guardar el viaje');
    }
}

/**
 * Carga la tabla de provincias del panel
 *
 * @returns {Promise<void>}
 */
async function loadCategories() {
    const tbody = document.getElementById('tabla-categorias');
    if (!tbody) {
        return;
    }

    tbody.innerHTML = '<tr><td colspan="6" class="text-center py-4"><div class="spinner-border spinner-border-sm text-success"></div></td></tr>';

    try {
        const data = await apiFetch({ accion: 'provincias' });

        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-3">Sin categorías</td></tr>';
            return;
        }

        tbody.innerHTML = data.map((category) => `
            <tr>
                <td class="ps-3">${category.id}</td>
                <td>${category.nombre}</td>
                <td class="text-muted small">${category.descripcion ? `${category.descripcion.substring(0, 60)}...` : '-'}</td>
                <td>
                    ${category.imagen_preview
                        ? `<img src="${category.imagen_preview}" alt="Imagen de ${category.nombre}" class="rounded border" style="width:56px;height:56px;object-fit:cover;">`
                        : '<span class="badge rounded-pill bg-light text-muted border">Sin imagen</span>'}
                </td>
                <td>${category.created_at?.split(' ')[0] || '-'}</td>
                <td class="admin-actions-cell">
                    <div class="admin-table-actions">
                        <button class="btn btn-warning btn-sm" onclick="abrirModalCategoria({ id: ${category.id} })">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="confirmarEliminar('provincia', ${category.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger py-3">Error al cargar</td></tr>';
    }
}

/**
 * Rellena el modal de provincias para crear o editar
 *
 * @param {object|null} [category=null] Provincia a editar o `null` para alta
 * @returns {void}
 */
async function openCategoryModal(category = null) {
    try {
        const isEditing = Boolean(category?.id);
        const currentCategory = isEditing
            ? await apiFetch({ accion: 'provincia_detalle', id: String(category.id) })
            : category;

        const imageInput = document.getElementById('c-imagen');
        const mobileImageInput = document.getElementById('c-imagen-movil');
        const previewWrap = document.getElementById('c-imagen-preview-wrap');
        const mobilePreviewWrap = document.getElementById('c-imagen-movil-preview-wrap');

        document.getElementById('c-id').value = currentCategory?.id || '';
        document.getElementById('c-nombre').value = currentCategory?.nombre || '';
        document.getElementById('c-descripcion').value = currentCategory?.descripcion || '';
        document.getElementById('modalCategoriaTitulo').textContent = isEditing ? 'Editar categoría' : 'Nueva categoría';

        if (imageInput instanceof HTMLInputElement) {
            imageInput.value = '';
        }
        if (mobileImageInput instanceof HTMLInputElement) {
            mobileImageInput.value = '';
        }

        clearCategoryPreviewObjectUrl();
        clearCategoryMobilePreviewObjectUrl();
        updateCategoryImageHelp(isEditing);
        if (previewWrap) {
            previewWrap.dataset.currentSrc = currentCategory?.imagen_preview || '';
        }
        if (mobilePreviewWrap) {
            mobilePreviewWrap.dataset.currentSrc = currentCategory?.imagen_movil_preview || '';
        }
        updateCategoryImagePreview(currentCategory?.imagen_preview || null);
        updateCategoryMobileImagePreview(currentCategory?.imagen_movil_preview || null);

        new bootstrap.Modal(document.getElementById('modalCategoria')).show();
    } catch (error) {
        console.error(error);
        alert('Error al preparar el formulario de la provincia');
    }
}

/**
 * Guarda la provincia desde su modal
 *
 * @returns {Promise<void>}
 */
async function saveCategory() {
    const id = document.getElementById('c-id').value;
    const imageInput = document.getElementById('c-imagen');
    const mobileImageInput = document.getElementById('c-imagen-movil');
    const formData = new FormData();

    formData.append('accion', id ? 'editar_provincia' : 'crear_provincia');
    formData.append('id', id);
    formData.append('nombre', document.getElementById('c-nombre').value);
    formData.append('descripcion', document.getElementById('c-descripcion').value);

    if (imageInput instanceof HTMLInputElement && imageInput.files?.[0]) {
        formData.append('imagen', imageInput.files[0]);
    }
    if (mobileImageInput instanceof HTMLInputElement && mobileImageInput.files?.[0]) {
        formData.append('imagen_movil', mobileImageInput.files[0]);
    }

    try {
        await apiPostFormData(formData);
        bootstrap.Modal.getInstance(document.getElementById('modalCategoria')).hide();
        loadCategories();
    } catch (error) {
        console.error(error);
        alert('Error al guardar la categoría');
    }
}

/**
 * Carga la tabla de pedidos y aplica el filtro de estado si existe
 *
 * @returns {Promise<void>}
 */
async function loadOrders() {
    const tbody = document.getElementById('tabla-pedidos');
    if (!tbody) {
        return;
    }

    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-4"><div class="spinner-border spinner-border-sm text-success"></div></td></tr>';

    const status = document.getElementById('filtro-estado-pedido')?.value || '';

    try {
        const params = { accion: 'pedidos' };
        if (status) {
            params.estado = status;
        }

        const data = await apiFetch(params);

        if (!data.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Sin pedidos</td></tr>';
            return;
        }

        tbody.innerHTML = data.map((order) => `
            <tr>
                <td class="ps-3">#${order.id}</td>
                <td>${order.usuario_id}</td>
                <td>${parseFloat(order.total).toFixed(2)} EUR</td>
                <td>${badgeStatus(order.estado)}</td>
                <td class="text-muted small">${order.direccion_envio ? `${order.direccion_envio.substring(0, 30)}...` : '-'}</td>
                <td>${order.fecha_pedido?.split(' ')[0] || '-'}</td>
                <td class="admin-actions-cell">
                    <div class="admin-table-actions">
                        <button class="btn btn-warning btn-sm" onclick="abrirModalEstado(${order.id}, '${order.estado}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="confirmarEliminar('pedido', ${order.id})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="7" class="text-center text-danger py-3">Error al cargar</td></tr>';
    }
}

/**
 * Abre el modal para cambiar el estado de un pedido
 *
 * @param {number|string} id Id del pedido
 * @param {string} currentStatus Estado actual
 * @returns {void}
 */
function openOrderStatusModal(id, currentStatus) {
    document.getElementById('estado-pedido-id').value = id;
    document.getElementById('nuevo-estado-pedido').value = currentStatus;

    new bootstrap.Modal(document.getElementById('modalEstado')).show();
}

/**
 * Guarda el estado nuevo del pedido
 *
 * @returns {Promise<void>}
 */
async function saveOrderStatus() {
    const id = document.getElementById('estado-pedido-id').value;
    const status = document.getElementById('nuevo-estado-pedido').value;

    try {
        await apiPost({ accion: 'actualizar_estado_pedido', id, estado: status });
        bootstrap.Modal.getInstance(document.getElementById('modalEstado')).hide();
        loadOrders();
    } catch (error) {
        console.error(error);
        alert('Error al actualizar el estado');
    }
}

/**
 * Guarda el registro pendiente de borrar y abre el modal común.
 *
 * @param {string} type Tipo de registro
 * @param {number|string} id Id del registro
 * @returns {void}
 */
function confirmDelete(type, id) {
    pendingDelete = { type, id };
    new bootstrap.Modal(document.getElementById('modalEliminar')).show();
}

/**
 * Ejecuta el borrado confirmado y refresca solo la tabla afectada
 *
 * @returns {Promise<void>}
 */
async function executeDelete() {
    if (!pendingDelete) {
        return;
    }

    try {
        await apiPost({ accion: 'eliminar', tipo: pendingDelete.type, id: pendingDelete.id });
        bootstrap.Modal.getInstance(document.getElementById('modalEliminar')).hide();

        if (pendingDelete.type === 'usuario') {
            loadUsers();
        }
        if (pendingDelete.type === 'viaje') {
            loadTrips();
        }
        if (pendingDelete.type === 'provincia') {
            loadCategories();
        }
        if (pendingDelete.type === 'pedido') {
            loadOrders();
        }

        pendingDelete = null;
    } catch (error) {
        console.error(error);
        alert('Error al eliminar');
    }
}

// Las dejo globales porque el HTML del panel las llama desde onclick
window.mostrarSeccion = showSection;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.buscarEnTabla = filterTable;
window.cargarDashboard = loadDashboard;
window.cargarUsuarios = loadUsers;
window.cargarViajes = loadTrips;
window.cargarCategorias = loadCategories;
window.cargarPedidos = loadOrders;
window.abrirModalUsuario = openUserModal;
window.guardarUsuario = saveUser;
window.abrirModalViaje = openTripModal;
window.guardarViaje = saveTrip;
window.abrirModalCategoria = openCategoryModal;
window.guardarCategoria = saveCategory;
window.abrirModalEstado = openOrderStatusModal;
window.guardarEstadoPedido = saveOrderStatus;
window.confirmarEliminar = confirmDelete;

// Dejo tambien alias en ingles por si queda algun render viejo suelto
window.openUserModal = openUserModal;
window.saveUser = saveUser;
window.openTripModal = openTripModal;
window.saveTrip = saveTrip;
window.openCategoryModal = openCategoryModal;
window.saveCategory = saveCategory;
window.openOrderStatusModal = openOrderStatusModal;
window.saveOrderStatus = saveOrderStatus;
window.confirmDelete = confirmDelete;

// Arranco el panel una vez el DOM ya esta listo
document.addEventListener('DOMContentLoaded', () => {
    initResponsive();
    showSection('dashboard', document.getElementById('nav-dashboard'));

    const deleteButton = document.getElementById('btn-confirmar-eliminar');
    if (deleteButton) {
        deleteButton.addEventListener('click', executeDelete);
    }

    const tripImageInput = document.getElementById('v-imagen');
    if (tripImageInput) {
        tripImageInput.addEventListener('change', handleTripImageInputChange);
    }
    const tripMobileImageInput = document.getElementById('v-imagen-movil');
    if (tripMobileImageInput) {
        tripMobileImageInput.addEventListener('change', handleTripMobileImageInputChange);
    }

    const categoryImageInput = document.getElementById('c-imagen');
    if (categoryImageInput) {
        categoryImageInput.addEventListener('change', handleCategoryImageInputChange);
    }
    const categoryMobileImageInput = document.getElementById('c-imagen-movil');
    if (categoryMobileImageInput) {
        categoryMobileImageInput.addEventListener('change', handleCategoryMobileImageInputChange);
    }
});


