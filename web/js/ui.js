/**
 * Recoge los valores del formulario antiguo y los devuelve juntos.
 *
 * @returns {object} Objeto simple con todos los campos que usa el flujo viejo.
 */
export function obtenerDatosFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasenia').value;
    const confirmarContrasena = document.getElementById('confirmar_contrasenia').value;
    const pais = document.getElementById('pais').value;
    const notificaciones = document.getElementById('notificaciones').checked;
    const privacidad = document.getElementById('politica_privacidad').checked;

    return {
        nombre,
        correo,
        contrasena,
        confirmarContrasena,
        pais,
        notificaciones,
        privacidad
    };
}

/**
 * Pinta un mensaje de error en el nodo asociado a un campo.
 *
 * @param {string} elementoId Id del elemento donde va el texto.
 * @param {string} mensaje Mensaje que se quiere mostrar.
 * @returns {void}
 */
export function mostrarError(elementoId, mensaje) {
    const elemento = document.getElementById(elementoId);
    if (elemento) {
        elemento.textContent = mensaje;
    }
}

/**
 * Limpia el formulario antiguo si sigue presente en el DOM.
 *
 * @returns {void}
 */
export function limpiarFormulario() {
    document.getElementById('form-registro')?.reset();
}

/**
 * Borra todos los mensajes de error visibles del formulario antiguo.
 *
 * @returns {void}
 */
export function ocultarErrores() {
    document.querySelectorAll('.error').forEach((error) => {
        error.textContent = '';
    });
}

/**
 * Muestra un aviso de exito usando el mecanismo mas simple del flujo viejo.
 *
 * @param {string} mensaje Texto a mostrar.
 * @returns {void}
 */
export function mostrarMensajeExito(mensaje) {
    alert(mensaje);
}

/**
 * Muestra un error general del formulario.
 *
 * @param {string} mensaje Texto del error.
 * @returns {void}
 */
export function mostrarMensajeError(mensaje) {
    alert(`Error: ${mensaje}`);
}

/**
 * Comprueba si el modo oscuro deberia estar activo.
 *
 * @returns {boolean} `true` si lo marca localStorage o la preferencia del sistema.
 */
export function esModoOscuro() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme === 'dark';
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
