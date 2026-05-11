const API = '../php/admin_api.php';

/**
 * Redirige al login cuando la sesión ya no es válida.
 */
function redirectToLogin() {
    window.location.href = '/Raices-Viajeras/web/Formulario/form.html?modo=login';
}

/**
 * Valida la respuesta del backend y lanza error si algo falla.
 * @param {Response} response
 * @returns {Promise<any>}
 */
async function parseApiResponse(response) {
    const data = await response.json();

    if (response.ok) return data;

    if (response.status === 401 || response.status === 403) {
        alert(data.error || 'Tu sesión ya no es válida.');
        redirectToLogin();
        throw new Error(data.error || 'Sesión no válida');
    }

    throw new Error(data.error || `HTTP ${response.status}`);
}

/**
 * GET con parámetros de query.
 * @param {Record<string, string>} params
 * @returns {Promise<any>}
 */
export async function apiFetch(params) {
    const url = new URL(API, window.location.href);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    const response = await fetch(url, { credentials: 'same-origin' });
    return parseApiResponse(response);
}

/**
 * POST con cuerpo JSON.
 * @param {object} body
 * @returns {Promise<any>}
 */
export async function apiPost(body) {
    const response = await fetch(API, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    return parseApiResponse(response);
}

/**
 * POST con FormData (para subida de imágenes).
 * @param {FormData} formData
 * @returns {Promise<any>}
 */
export async function apiPostFormData(formData) {
    const response = await fetch(API, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData,
    });
    return parseApiResponse(response);
}