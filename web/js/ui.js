/**
 * Función para obtener datos de un formulario y devolverlos como un objeto
 * @return {Object} Un objeto con los datos del formulario.
 */

export function obtenerDatosFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasenia').value;
    const confirmarContrasena = document.getElementById('confirmar_contrasenia').value;
    const pais = document.getElementById('pais').value;
    const notis = document.getElementById('notificaciones').checked;
    const privacidad = document.getElementById('politica_privacidad').checked;

    return {
        nombre,
        correo,
        contrasena,
        confirmarContrasena,
        pais: pais,
        notis,
        privacidad
    };
}

/**
 * Función para mostrar un mensaje de error en un elemento HTML.
 * @param {string} elementoId - El ID del elemento donde se mostrará el mensaje.
 * @param {string} mensaje - El mensaje de error a mostrar.
 */
export function mostrarError(elementoId, mensaje) {
    const elemento = document.getElementById(elementoId);
    elemento.textContent = mensaje;
}

/**
 * Función para limpiar formulario
 */
export function limpiarFormulario() {
    document.getElementById('form-registro').reset();
}

/**
 * Función para ocultar todos los mensajes de error
 */
export function ocultarErrores() {
    const errores = document.querySelectorAll('.error');
    errores.forEach(error => {
        error.textContent = "";
    });
}

/**
 * Función para mostrar un mensaje (alert) de éxito
 * @param {string} mensaje - El mensaje de éxito a mostrar.
 */
export function mostrarMensajeExito(mensaje) {
    alert(mensaje);
}

/**
 * Función para mostrar un mensaje (alert) de error
 * @param {string} mensaje - El mensaje de error a mostrar.
 */
export function mostrarMensajeError(mensaje) {
    alert('Error: ' + mensaje);
}

/**
 * Función para comprobar si el modo oscuro está activado
 * @return {boolean} true si el modo oscuro está activado, false en caso contrario.
 */
export function esModoOscuro() {
    // Primero, verifica si hay una preferencia guardada en localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        return savedTheme === 'dark';
    }
    // Si no hay guardado, usa la preferencia del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    return prefersDark.matches;
}
