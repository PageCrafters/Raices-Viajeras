/**
 * Función para obtener datos de un formulario y devolverlos como un objeto
 * @return {Object} Un objeto con los datos del formulario.
 */

export function obtenerDatosFormulario() {
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const contrasena = document.getElementById('contrasenia').value;
    const confirmarContrasena = document.getElementById('confirmar_contrasenia').value;
    const tipoViaje = document.getElementById('tipo_viaje').value;
    const notis = document.getElementById('notificaciones').checked;
    const privacidad = document.getElementById('politica_privacidad').checked;

    return {
        nombre,
        correo,
        contrasena,
        confirmarContrasena,
        pais: tipoViaje,
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
