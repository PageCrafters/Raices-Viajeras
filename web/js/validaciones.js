/**
 * Comprueba que el campo tenga contenido real y no solo espacios.
 *
 * @param {string} valor Texto que llega desde el formulario.
 * @returns {boolean} `true` si hay algo escrito.
 */
export function validarCampoObligatorio(valor) {
    return String(valor ?? '').trim() !== '';
}

/**
 * Valida el nombre con la misma idea que usa el backend del registro.
 *
 * @param {string} nombre Nombre que llega desde el formulario.
 * @returns {boolean} `true` si el formato encaja con la regla actual.
 */
export function validarNombre(nombre) {
    const texto = String(nombre ?? '').trim();
    const regex = /^[\p{L}]+(?:[ '\-][\p{L}]+){0,2}$/u;
    return regex.test(texto);
}

/**
 * Comprueba que el correo tenga un formato básico válido.
 *
 * @param {string} correo Correo que se quiere revisar.
 * @returns {boolean} `true` si pasa la expresión regular.
 */
export function validarCorreo(correo) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(String(correo ?? '').trim());
}

/**
 * Revisa la complejidad mínima que pedimos para la contraseña.
 *
 * @param {string} contrasena Contraseña escrita por el usuario.
 * @returns {boolean} `true` si cumple mayúscula, minúscula, número y símbolo.
 */
export function validarContrasena(contrasena) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    return regex.test(String(contrasena ?? ''));
}

/**
 * Comprueba que las dos contraseñas coincidan exactamente.
 *
 * @param {string} contrasena1 Primer valor.
 * @param {string} contrasena2 Segundo valor.
 * @returns {boolean} `true` si ambos textos son iguales.
 */
export function comprobarContrasenas(contrasena1, contrasena2) {
    return contrasena1 === contrasena2;
}

/**
 * Comprueba que el género elegido sea uno de los valores cortos permitidos.
 *
 * @param {string} genero Valor elegido en el formulario.
 * @returns {boolean} `true` si coincide con uno de los códigos válidos.
 */
export function validarGenero(genero) {
    return ['m', 'f', 'o'].includes(String(genero ?? '').trim().toLowerCase());
}

/**
 * Valida una fecha real y evita aceptar fechas futuras.
 *
 * @param {string} fecha Fecha en formato `YYYY-MM-DD`.
 * @returns {boolean} `true` si la fecha existe y no es futura.
 */
export function validarFechaNacimiento(fecha) {
    const texto = String(fecha ?? '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        return false;
    }

    const [year, month, day] = texto.split('-').map(Number);
    const candidate = new Date(year, month - 1, day);

    if (
        candidate.getFullYear() !== year ||
        candidate.getMonth() !== month - 1 ||
        candidate.getDate() !== day
    ) {
        return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    candidate.setHours(0, 0, 0, 0);

    return candidate <= today;
}

/**
 * Comprueba el caso de los checks obligatorios.
 *
 * @param {boolean} checked Estado real del checkbox.
 * @returns {boolean} `true` si está marcado.
 */
export function validarCheckboxObligatorio(checked) {
    return checked === true;
}

/**
 * Deja pasar checks opcionales siempre que vengan como booleano normal.
 *
 * @param {boolean} checked Estado del checkbox opcional.
 * @returns {boolean} `true` si el valor es utilizable.
 */
export function validarCheckboxOpcional(checked) {
    return typeof checked === 'boolean';
}

/**
 * Comprueba que se haya elegido algún país en el selector.
 *
 * @param {string} pais Valor del select.
 * @returns {boolean} `true` si no viene vacío.
 */
export function validarPais(pais) {
    return String(pais ?? '').trim() !== '';
}
