/**
 * Valida nombres sencillos de una o dos palabras.
 *
 * @param {string} nombre Nombre que llega desde el formulario.
 * @returns {boolean} `true` si el formato encaja con la regla actual.
 */
export function validarNombre(nombre) {
    const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü]+( [A-Za-zÁÉÍÓÚáéíóúÑñÜü]+)?$/;
    return regex.test(nombre);
}

/**
 * Comprueba que el correo tenga un formato basico valido.
 *
 * @param {string} correo Correo que se quiere revisar.
 * @returns {boolean} `true` si pasa la expresion regular.
 */
export function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
}

/**
 * Revisa la complejidad minima que pedimos para la contrasena.
 *
 * @param {string} contrasena Contrasena escrita por el usuario.
 * @returns {boolean} `true` si cumple mayuscula, minuscula, numero y simbolo.
 */
export function validarContrasena(contrasena) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(contrasena);
}

/**
 * Comprueba que las dos contrasenas coincidan exactamente.
 *
 * @param {string} contrasena1 Primer valor.
 * @param {string} contrasena2 Segundo valor.
 * @returns {boolean} `true` si ambos textos son iguales.
 */
export function comprobarContrasenas(contrasena1, contrasena2) {
    return contrasena1 === contrasena2;
}

/**
 * Comprueba que se haya elegido algun pais en el selector.
 *
 * @param {string} pais Valor del select.
 * @returns {boolean} `true` si no viene vacio.
 */
export function validarPais(pais) {
    return pais !== '';
}
