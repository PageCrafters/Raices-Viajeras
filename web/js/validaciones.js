/**
 * Función para validar que los nombres solo contengan letras y espacios.
 * Además, limita la longitud máxima a 2 palabras.
 * @param {string} nombre - El nombre a validar.
 * @return {boolean} Verdadero si el nombre es válido, falso en caso contrario.
 */
export function validarNombre(nombre) {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+( [A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)?$/;
    return regex.test(nombre);
}

/**
 * Función para validar que el correo electrónico tenga un formato correcto.
 * @param {string} correo - El correo electrónico a validar.
 * @return {boolean} Verdadero si el correo es válido, falso en caso contrario.
 */
export function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}

/**
 * Función para validar contraseñas.
 * La contraseña debe tener al menos 8 caracteres, incluyendo una letra mayúscula,
 * una letra minúscula, un número y un carácter especial.
 * @param {string} contrasena - La contraseña a validar.
 * @return {boolean} Verdadero si la contraseña es válida, falso en caso contrario.
 */
export function validarContrasena(contrasena) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(contrasena);
}

/**
 * Función para comprobar si dos contraseñas coinciden.
 * @param {string} contrasena1 - La primera contraseña.
 * @param {string} contrasena2 - La segunda contraseña.
 * @return {boolean} Verdadero si las contraseñas coinciden, falso en caso contrario.
 */
export function comprobarContrasenas(contrasena1, contrasena2) {
    return contrasena1 === contrasena2;
}

/**
 * Función para validar si ha seleccionado una opción en un campo de tipo_viaje.
 * @param {string} tipoViaje - El valor seleccionado en el campo tipo_viaje.
 * @return {boolean} Verdadero si se ha seleccionado una opción válida, falso en caso contrario.
 */
export function validarTipoViaje(tipoViaje) {
    return tipoViaje !== "";
}