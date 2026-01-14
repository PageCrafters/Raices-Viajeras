import * as ui from './ui.js';
import * as v from "./validaciones.js";

/**
 * Función para inicializar el controlador del formulario de registro.
 */
export function initializeFormController() {
    const form = document.getElementById('form-registro');
    const nombreInput = document.getElementById('nombre');
    const correoInput = document.getElementById('correo');
    const contrasenaInput = document.getElementById('contrasenia');
    const confirmarContrasenaInput = document.getElementById('confirmar_contrasenia');
    const paisSelect = document.getElementById('pais');
    const privacidadCheckbox = document.getElementById('politica_privacidad');

/*
    // Comprobación de elementos críticos
    if (!form) {
        console.error('initializeFormController: elemento #form-registro no encontrado. Abortando inicialización.');
        return;
    }

    if (!nombreInput || !correoInput || !contrasenaInput || !confirmarContrasenaInput || !tipoViajeSelect || !privacidadCheckbox) {
        console.error('initializeFormController: uno o más campos del formulario no se encontraron. Revise los IDs en el HTML.');
        // Mostrar cuáles faltan para facilitar la depuración
        const missing = [];
        if (!nombreInput) missing.push('nombre');
        if (!correoInput) missing.push('correo');
        if (!contrasenaInput) missing.push('contrasenia');
        if (!confirmarContrasenaInput) missing.push('confirmar_contrasenia');
        if (!tipoViajeSelect) missing.push('tipo_viaje');
        if (!privacidadCheckbox) missing.push('politica_privacidad');
        console.warn('IDs faltantes:', missing.join(', '));
        return;
    }
*/

    // Validación en tiempo real para el campo nombre
    nombreInput.addEventListener('input', () => {
        const df = ui.obtenerDatosFormulario();
        const nombre = df.nombre.trim();
        if (!v.validarNombre(nombre)) {
            ui.mostrarError('error-nombre', 'El nombre debe contener solo letras y un máximo de 2 palabras.');
        } else {
            ui.mostrarError('error-nombre', '');
        }
    });

    // Validación en tiempo real para el campo correo
    correoInput.addEventListener('input', () => {
        const df = ui.obtenerDatosFormulario();

        const correo = df.correo.trim();
        if (!v.validarCorreo(correo)) {
            ui.mostrarError('error-correo', 'El correo electrónico no tiene un formato válido.');
        } else {
            ui.mostrarError('error-correo', '');
        }
    });

    // Validación en tiempo real para el campo contraseña
    contrasenaInput.addEventListener('input', () => {
        const df = ui.obtenerDatosFormulario();

        const contrasena = df.contrasena;
        const confirmarContrasena = df.confirmarContrasena;
        const boton = document.getElementById('b1');
        const emoji= boton.querySelector('.fa-regular');

        const boton2 = document.getElementById('b2');
        const emoji2= boton2.querySelector('.fa-regular');


        if (!v.validarContrasena(contrasena)) {
            ui.mostrarError('error-contrasena', 'La contraseña debe tener al menos 8 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.');
            if (emoji.classList.contains('verde')) {
                emoji.classList.replace('verde', 'rojo');
            }else if (!emoji.classList.contains('rojo')) {
                emoji.classList.add('rojo');
            }
        } else {
            ui.mostrarError('error-contrasena', '');
            if (emoji.classList.contains('rojo')) {
                emoji.classList.replace('rojo', 'verde');
            }else if (!emoji.classList.contains('verde')) {
                emoji.classList.add('verde');
            }
        }
        if (!v.comprobarContrasenas(contrasena, confirmarContrasena)) {
            ui.mostrarError('error-confirmar-contrasena', 'Las contraseñas no coinciden.');
            if (emoji2.classList.contains('verde')) {
                emoji2.classList.replace('verde', 'rojo');
            }else if (!emoji2.classList.contains('rojo')) {
                emoji2.classList.add('rojo');
            }
        } else {
            ui.mostrarError('error-confirmar-contrasena', '');
            if (emoji2.classList.contains('rojo')) {
                emoji2.classList.replace('rojo', 'verde');
            }else if (!emoji2.classList.contains('verde')) {
                emoji2.classList.add('verde');
            }
        }
    });


    // Validación en tiempo real para el campo confirmar contraseña
    confirmarContrasenaInput.addEventListener('input', () => {
        const df = ui.obtenerDatosFormulario();

        const contrasena = df.contrasena;
        const confirmarContrasena = df.confirmarContrasena;
        const boton = document.getElementById('b2');
        const emoji= boton.querySelector('.fa-regular');

        if (!v.comprobarContrasenas(contrasena, confirmarContrasena)) {
            ui.mostrarError('error-confirmar-contrasena', 'Las contraseñas no coinciden.');
            if (emoji.classList.contains('verde')) {
                emoji.classList.replace('verde', 'rojo');
            }else if (!emoji.classList.contains('rojo')) {
                emoji.classList.add('rojo');
            }
        } else {
            ui.mostrarError('error-confirmar-contrasena', '');
            if (emoji.classList.contains('rojo')) {
                emoji.classList.replace('rojo', 'verde');
            }else if (!emoji.classList.contains('verde')) {
                emoji.classList.add('verde');
            }
        }
    });

    // Validación en tiempo real para el campo tipo de viaje
    paisSelect.addEventListener('change', () => {
        const df = ui.obtenerDatosFormulario();

        const pais = df.pais;
        if (!v.validarPais(pais)) {
            ui.mostrarError('error-pais', 'Debe seleccionar un pais.');
        } else {
            ui.mostrarError('error-pais', '');
        }
    });

    // Validación en tiempo real para el checkbox de política de privacidad
    privacidadCheckbox.addEventListener('change', () => {
        const df = ui.obtenerDatosFormulario();

        if (!df.privacidad) {
            ui.mostrarError('error-privacidad', 'Debe aceptar la política de privacidad.');
        } else {
            ui.mostrarError('error-privacidad', '');
        }
    });

    // Manejo del evento submit del formulario
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        ui.ocultarErrores();

        const datos = ui.obtenerDatosFormulario();
        if (v.validarNombre(datos.nombre) && v.validarCorreo(datos.correo) && v.validarContrasena(datos.contrasena) && v.comprobarContrasenas(datos.contrasena, datos.confirmarContrasena) && v.validarPais(datos.pais) && datos.privacidad) {
            // Enviar datos al servidor
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
                } else {
                    ui.mostrarMensajeError(result.message);
                }
            } catch (error) {
                ui.mostrarMensajeError('Error al conectar con el servidor.');
            }
        }
    });
}