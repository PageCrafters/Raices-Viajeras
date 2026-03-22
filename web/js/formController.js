import * as ui from './ui.js';
import * as v from './validaciones.js';

/**
 * Inicializa el formulario antiguo de registro y sus validaciones en caliente.
 *
 * Si el DOM de ese formulario ya no existe, esta función sale sin tocar nada.
 *
 * @returns {void}
 */
export function initializeFormController() {
    const form = document.getElementById('form-registro');
    const nombreInput = document.getElementById('nombre');
    const correoInput = document.getElementById('correo');
    const contrasenaInput = document.getElementById('contrasenia');
    const confirmarContrasenaInput = document.getElementById('confirmar_contrasenia');
    const paisSelect = document.getElementById('pais');
    const privacidadCheckbox = document.getElementById('politica_privacidad');

    if (
        !form ||
        !nombreInput ||
        !correoInput ||
        !contrasenaInput ||
        !confirmarContrasenaInput ||
        !paisSelect ||
        !privacidadCheckbox
    ) {
        return;
    }

    // Valido el nombre mientras el usuario escribe para que vea el error al momento.
    nombreInput.addEventListener('input', () => {
        const datos = ui.obtenerDatosFormulario();
        const nombre = datos.nombre.trim();

        if (!v.validarNombre(nombre)) {
            ui.mostrarError('error-nombre', 'El nombre debe contener solo letras y un máximo de 2 palabras.');
            return;
        }

        ui.mostrarError('error-nombre', '');
    });

    // Valido el correo en caliente para no esperar al submit final.
    correoInput.addEventListener('input', () => {
        const datos = ui.obtenerDatosFormulario();
        const correo = datos.correo.trim();

        if (!v.validarCorreo(correo)) {
            ui.mostrarError('error-correo', 'El correo electrónico no tiene un formato válido.');
            return;
        }

        ui.mostrarError('error-correo', '');
    });

    // Reviso formato y coincidencia de contraseñas en el mismo bloque.
    contrasenaInput.addEventListener('input', () => {
        const datos = ui.obtenerDatosFormulario();
        const contrasena = datos.contrasena;
        const confirmarContrasena = datos.confirmarContrasena;
        const boton = document.getElementById('b1');
        const icono = boton?.querySelector('.fa-regular');
        const boton2 = document.getElementById('b2');
        const icono2 = boton2?.querySelector('.fa-regular');

        if (!v.validarContrasena(contrasena)) {
            ui.mostrarError('error-contrasena', 'La contraseña debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.');
            if (icono?.classList.contains('verde')) {
                icono.classList.replace('verde', 'rojo');
            } else if (icono && !icono.classList.contains('rojo')) {
                icono.classList.add('rojo');
            }
        } else {
            ui.mostrarError('error-contrasena', '');
            if (icono?.classList.contains('rojo')) {
                icono.classList.replace('rojo', 'verde');
            } else if (icono && !icono.classList.contains('verde')) {
                icono.classList.add('verde');
            }
        }

        if (!v.comprobarContrasenas(contrasena, confirmarContrasena)) {
            ui.mostrarError('error-confirmar-contrasena', 'Las contraseñas no coinciden.');
            if (icono2?.classList.contains('verde')) {
                icono2.classList.replace('verde', 'rojo');
            } else if (icono2 && !icono2.classList.contains('rojo')) {
                icono2.classList.add('rojo');
            }
            return;
        }

        ui.mostrarError('error-confirmar-contrasena', '');
        if (icono2?.classList.contains('rojo')) {
            icono2.classList.replace('rojo', 'verde');
        } else if (icono2 && !icono2.classList.contains('verde')) {
            icono2.classList.add('verde');
        }
    });

    // Compruebo la segunda contraseña cada vez que se toca ese campo.
    confirmarContrasenaInput.addEventListener('input', () => {
        const datos = ui.obtenerDatosFormulario();
        const boton = document.getElementById('b2');
        const icono = boton?.querySelector('.fa-regular');

        if (!v.comprobarContrasenas(datos.contrasena, datos.confirmarContrasena)) {
            ui.mostrarError('error-confirmar-contrasena', 'Las contraseñas no coinciden.');
            if (icono?.classList.contains('verde')) {
                icono.classList.replace('verde', 'rojo');
            } else if (icono && !icono.classList.contains('rojo')) {
                icono.classList.add('rojo');
            }
            return;
        }

        ui.mostrarError('error-confirmar-contrasena', '');
        if (icono?.classList.contains('rojo')) {
            icono.classList.replace('rojo', 'verde');
        } else if (icono && !icono.classList.contains('verde')) {
            icono.classList.add('verde');
        }
    });

    // Reviso que el selector de país no se quede vacío.
    paisSelect.addEventListener('change', () => {
        const datos = ui.obtenerDatosFormulario();

        if (!v.validarPais(datos.pais)) {
            ui.mostrarError('error-pais', 'Debes seleccionar un país.');
            return;
        }

        ui.mostrarError('error-pais', '');
    });

    // Marco el error del checkbox solo cuando de verdad no está aceptado.
    privacidadCheckbox.addEventListener('change', () => {
        const datos = ui.obtenerDatosFormulario();

        if (!datos.privacidad) {
            ui.mostrarError('error-privacidad', 'Debes aceptar la política de privacidad.');
            return;
        }

        ui.mostrarError('error-privacidad', '');
    });

    // Si todo está bien, envío el formulario antiguo al endpoint que ya usaba este módulo.
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        ui.ocultarErrores();

        const datos = ui.obtenerDatosFormulario();
        const isValid =
            v.validarNombre(datos.nombre) &&
            v.validarCorreo(datos.correo) &&
            v.validarContrasena(datos.contrasena) &&
            v.comprobarContrasenas(datos.contrasena, datos.confirmarContrasena) &&
            v.validarPais(datos.pais) &&
            datos.privacidad;

        if (!isValid) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('nombre', datos.nombre);
            formData.append('email', datos.correo);
            formData.append('contrasenia', datos.contrasena);
            formData.append('pais', datos.pais);

            if (datos.notificaciones) {
                formData.append('notificaciones', '1');
            }

            const response = await fetch('web/php/register.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                ui.mostrarMensajeExito(result.message);
                ui.limpiarFormulario();
                return;
            }

            ui.mostrarMensajeError(result.message);
        } catch (error) {
            ui.mostrarMensajeError('Error al conectar con el servidor.');
        }
    });
}
