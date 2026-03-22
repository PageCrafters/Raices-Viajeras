<?php
require_once __DIR__ . '/../../php/autenticacion.php';
require_once __DIR__ . '/../../php/cesta_service.php';

/**
 * Muestra un aviso corto y devuelve al usuario a la ruta correcta.
 *
 * @param string $message Mensaje que se quiere mostrar.
 * @param string $mode Cara del formulario a la que se vuelve.
 * @param string|null $target Destino final si se quiere salir del formulario.
 * @param string|null $redirect Redirect interno que se conserva en el formulario.
 * @return void
 */
function login_redirect(
    string $message,
    string $mode = 'login',
    ?string $target = null,
    ?string $redirect = null
): void {
    $url = $target ?? auth_build_form_url($mode, $redirect);
    echo '<script>alert(' . json_encode($message, JSON_UNESCAPED_UNICODE) . '); window.location = ' . json_encode($url) . ';</script>';
    exit;
}

/**
 * Comprueba tanto hashes actuales como contraseñas antiguas guardadas en claro.
 *
 * Si el usuario venía de un esquema viejo, deja marcado que hace falta rehash.
 *
 * @param string $plainPassword Contraseña escrita por el usuario.
 * @param string $storedPassword Valor guardado en base de datos.
 * @param bool $needsRehash Bandera que nos dice si hay que actualizar el hash.
 * @return bool
 */
// Esta comprobación nos deja convivir con passwords nuevas hasheadas y usuarios antiguos.
function login_password_is_valid(string $plainPassword, string $storedPassword, bool &$needsRehash): bool
{
    $needsRehash = false;

    if ($storedPassword === '') {
        return false;
    }

    if (password_get_info($storedPassword)['algo'] !== 0) {
        if (!password_verify($plainPassword, $storedPassword)) {
            return false;
        }

        $needsRehash = password_needs_rehash($storedPassword, PASSWORD_BCRYPT);
        return true;
    }

    if (!hash_equals($storedPassword, $plainPassword)) {
        return false;
    }

    $needsRehash = true;
    return true;
}

$redirect = auth_sanitize_internal_redirect($_POST['redirect'] ?? $_GET['redirect'] ?? null);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . auth_build_form_url('login', $redirect));
    exit;
}

try {
    // Aquí normalizo la entrada antes de tocar base de datos o sesión.
    $correo = trim($_POST['correo_login'] ?? '');
    $pwd = (string) ($_POST['pwd_login'] ?? '');
    $rememberMe = isset($_POST['remember_me']) && $_POST['remember_me'] === '1';

    if ($correo === '' || $pwd === '') {
        login_redirect('Debes rellenar correo y contraseña.', 'login', null, $redirect);
    }

    $usuario = auth_find_user_by_email($correo);
    if (!$usuario) {
        login_redirect('Correo o contraseña incorrectos.', 'login', null, $redirect);
    }

    $needsRehash = false;
    if (!login_password_is_valid($pwd, (string) ($usuario['pwd'] ?? ''), $needsRehash)) {
        login_redirect('Correo o contraseña incorrectos.', 'login', null, $redirect);
    }

    // Si el usuario estaba guardado con password antigua en claro, la actualizo al vuelo.
    if ($needsRehash) {
        $stmt = auth_get_pdo()->prepare('UPDATE usuarios SET pwd = ? WHERE id = ?');
        $stmt->execute([password_hash($pwd, PASSWORD_BCRYPT), (int) $usuario['id']]);
    }

    auth_login_user($usuario, $rememberMe);

    $loginMessage = 'Bienvenido, ' . ($usuario['nombre_completo'] ?? 'viajero') . '.';

    try {
        cart_merge_guest_cookie_into_user(auth_get_pdo(), (int) $usuario['id']);
    } catch (Throwable $mergeError) {
        error_log('login_usuarios.php merge cart error: ' . $mergeError->getMessage());
        $loginMessage .= ' No hemos podido recuperar tu cesta temporal todavía.';
    }

    $target = $redirect ?? '/Raices-Viajeras/index.html';
    login_redirect($loginMessage, 'login', $target, $redirect);
} catch (Throwable $error) {
    error_log('login_usuarios.php error: ' . $error->getMessage());
    login_redirect('Error al iniciar sesión.', 'login', null, $redirect);
}
?>
