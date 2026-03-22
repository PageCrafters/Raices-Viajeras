<?php
require_once __DIR__ . '/../../php/autenticacion.php';

/**
 * Muestra un aviso corto y mantiene al usuario en la cara correcta del formulario.
 *
 * @param string $message Mensaje que se quiere mostrar.
 * @param string $mode Cara del formulario a la que se vuelve.
 * @return void
 */
function registro_redirect(string $message, string $mode): void
{
    $url = '/Raices-Viajeras/web/Formulario/form.html?modo=' . $mode;
    echo '<script>alert(' . json_encode($message, JSON_UNESCAPED_UNICODE) . '); window.location = ' . json_encode($url) . ';</script>';
    exit;
}

/**
 * Valida el nombre con una regla simple para evitar basura y seguir siendo flexible.
 *
 * @param string $nombre Nombre completo recibido.
 * @return bool
 */
function registro_nombre_valido(string $nombre): bool
{
    return (bool) preg_match("/^[\\p{L}]+(?:[ '\\-][\\p{L}]+){0,2}$/u", $nombre);
}

/**
 * Comprueba que la contrasena tenga la complejidad que ya se espera en el front.
 *
 * @param string $password Contrasena escrita por el usuario.
 * @return bool
 */
function registro_password_valido(string $password): bool
{
    return (bool) preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/', $password);
}

/**
 * Acepta solo los valores cortos que ya quedan bien guardados en la tabla.
 *
 * @param string $genero Valor del genero elegido.
 * @return bool
 */
function registro_genero_valido(string $genero): bool
{
    return in_array($genero, ['m', 'f', 'o'], true);
}

/**
 * Evita fechas imposibles y bloquea fechas futuras.
 *
 * @param string $fecha Fecha en formato Y-m-d.
 * @return bool
 */
function registro_fecha_valida(string $fecha): bool
{
    if ($fecha === '') {
        return false;
    }

    $date = DateTime::createFromFormat('Y-m-d', $fecha);
    if (!$date || $date->format('Y-m-d') !== $fecha) {
        return false;
    }

    $today = new DateTime('today');
    return $date <= $today;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /Raices-Viajeras/web/Formulario/form.html?modo=registro');
    exit;
}

try {
    // Aqui dejo todos los datos limpios antes de arrancar la validacion en servidor.
    $nombreCompleto = trim($_POST['nombre_completo'] ?? '');
    $correo = trim($_POST['correo'] ?? '');
    $pwd = (string) ($_POST['pwd'] ?? '');
    $passwordConfirm = (string) ($_POST['passwordConfirm'] ?? '');
    $genero = strtolower(trim($_POST['genero'] ?? ''));
    $fechaNacimiento = trim($_POST['fechaNacimiento'] ?? '');
    $politicaPrivacidad = isset($_POST['politica_privacidad']) ? 1 : 0;
    $revista = isset($_POST['revista']) ? 1 : 0;

    if (
        $nombreCompleto === '' ||
        $correo === '' ||
        $pwd === '' ||
        $passwordConfirm === '' ||
        $genero === '' ||
        $fechaNacimiento === ''
    ) {
        registro_redirect('Debes rellenar todos los campos obligatorios.', 'registro');
    }

    if (!registro_nombre_valido($nombreCompleto)) {
        registro_redirect('El nombre no tiene un formato valido.', 'registro');
    }

    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        registro_redirect('El correo electrónico no es válido.', 'registro');
    }

    if (!registro_password_valido($pwd)) {
        registro_redirect('La contraseña debe tener al menos 8 caracteres con mayúscula, minúscula, número y símbolo.', 'registro');
    }

    if (!hash_equals($pwd, $passwordConfirm)) {
        registro_redirect('Las contraseñas no coinciden.', 'registro');
    }

    if (!registro_genero_valido($genero)) {
        registro_redirect('El género seleccionado no es válido.', 'registro');
    }

    if (!registro_fecha_valida($fechaNacimiento)) {
        registro_redirect('La fecha de nacimiento no es válida.', 'registro');
    }

    if ($politicaPrivacidad !== 1) {
        registro_redirect('Debes aceptar la política de privacidad.', 'registro');
    }

    if (auth_find_user_by_email($correo)) {
        registro_redirect('Este correo ya está registrado.', 'registro');
    }

    // El alta siempre crea usuarios normales; el rol de admin se gestiona fuera de este formulario.
    $stmt = auth_get_pdo()->prepare(
        'INSERT INTO usuarios (nombre_completo, correo, pwd, genero, fechaNacimiento, politica_privacidad, revista, rol, rememberMe)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)'
    );
    $stmt->execute([
        $nombreCompleto,
        $correo,
        password_hash($pwd, PASSWORD_BCRYPT),
        $genero,
        $fechaNacimiento,
        $politicaPrivacidad,
        $revista,
        'usuario'
    ]);

    registro_redirect('Usuario registrado correctamente. Ya puedes iniciar sesión.', 'login');
} catch (Throwable $error) {
    error_log('registros_usuarios.php error: ' . $error->getMessage());
    registro_redirect('Error al registrar el usuario.', 'registro');
}
?>
