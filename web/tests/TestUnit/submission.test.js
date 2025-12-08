import { initializeFormController } from '../../js/formController.js';

describe('Envío correcto del formulario', () => {

    it('envío exitoso cuando todos los campos son válidos', () => {
        const data = {
            nombre: "Carlos Ruiz",
            email: "carlos@mail.com",
            destino: "Perú",
            fecha: "2025-02-15",
            aceptar: true
        };

        const resultado = initializeFormController(data);

        expect(resultado.exito).toBe(true);
        expect(resultado.mensaje).toBe("Formulario enviado correctamente");
    });

    it('envío falla cuando falta un campo', () => {
        const data = {
            nombre: "",
            email: "carlos@mail.com",
            destino: "Perú",
            fecha: "2025-02-15",
            aceptar: true
        };

        const resultado = initializeFormController(data);

        expect(resultado.exito).toBe(false);
    });

});


