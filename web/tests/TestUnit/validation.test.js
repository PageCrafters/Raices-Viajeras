import { validarNombre, validarCorreo } from '../../js/validaciones.js';

describe('Validaciones del formulario', () => {

    const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúñÑ ]{3,30}$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    it('valida nombres correctos', () => {
        const resultado = validarNombre("Juan Pérez", regexNombre);
        if (!resultado) throw new Error("El nombre válido fue rechazado.");
    });

    it('rechaza nombres demasiado cortos o con números', () => {
        if (validarNombre("Jo", regexNombre)) throw new Error("Nombre corto aceptado.");
        if (validarNombre("Juan123", regexNombre)) throw new Error("Nombre con números aceptado.");
    });

    it('valida emails correctos', () => {
        const resultado = validarCorreo("usuario@mail.com", regexEmail);
        if (!resultado) throw new Error("Email válido fue rechazado.");
    });

    it('rechaza emails incorrectos', () => {
        if (validarCorreo("usuario@mail", regexEmail))
            throw new Error("Email incorrecto fue aceptado.");
        if (validarCorreo("usuario@.com", regexEmail))
            throw new Error("Email incorrecto fue aceptado.");
    });
});



