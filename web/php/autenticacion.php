<?php
// Este archivo concentra la sesión y el remember me para no repetir la misma lógica en varios endpoints.
// Lo dejo como punto común de autenticación para toda la carpeta PHP.

const RV_AUTH_DSN = 'mysql:host=localhost;dbname=raices_viajeras;charset=utf8mb4';
const RV_AUTH_DB_USER = 'root';
const RV_AUTH_DB_PASS = '';
const RV_REMEMBER_COOKIE = 'rv_remember';
const RV_REMEMBER_DAYS = 30;
const RV_REMEMBER_PATH = '/Raices-Viajeras/';

/**
 * Devuelve una conexión PDO compartida para toda la capa de autenticación.
 *
 * @return PDO
 */
function auth_get_pdo(): PDO
{
    static $pdo = null;

    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $pdo = new PDO(RV_AUTH_DSN, RV_AUTH_DB_USER, RV_AUTH_DB_PASS);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    return $pdo;
}

/**
 * Abre la sesión solo una vez.
 *
 * @return void
 */
function auth_start_session(): void
{
    if (session_status() !== PHP_SESSION_ACTIVE) {
        session_start();
    }
}

/**
 * Revisa si la petición va por HTTPS para marcar la cookie persistente cuando toque.
 *
 * @return bool
 */
function auth_cookie_is_secure(): bool
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }

    return isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443;
}

/**
 * Centraliza las opciones de cookie para no tener valores distintos según el archivo.
 *
 * @param int $expiresAt Momento exacto en el que debe caducar la cookie.
 * @return array
 */
function auth_cookie_options(int $expiresAt): array
{
    return [
        'expires' => $expiresAt,
        'path' => RV_REMEMBER_PATH,
        'secure' => auth_cookie_is_secure(),
        'httponly' => true,
        'samesite' => 'Lax'
    ];
}

/**
 * Acepta solo redirecciones internas de la aplicación.
 *
 * @param string|null $target Ruta candidata recibida por query o POST.
 * @return string|null
 */
function auth_sanitize_internal_redirect(?string $target): ?string
{
    $target = trim((string) $target);
    if ($target === '') {
        return null;
    }

    if (preg_match('/^[a-z][a-z0-9+\-.]*:/i', $target)) {
        return null;
    }

    if (strpos($target, '//') === 0 || $target[0] !== '/') {
        return null;
    }

    return strpos($target, '/Raices-Viajeras/') === 0 ? $target : null;
}

/**
 * Construye la URL del formulario de acceso conservando el redirect si es válido.
 *
 * @param string $mode Cara del formulario que se quiere mostrar.
 * @param string|null $redirect Ruta interna a conservar.
 * @return string
 */
function auth_build_form_url(string $mode = 'login', ?string $redirect = null): string
{
    $url = '/Raices-Viajeras/web/Formulario/form.html?modo=' . $mode;
    $safeRedirect = auth_sanitize_internal_redirect($redirect);

    if ($safeRedirect !== null) {
        $url .= '&redirect=' . rawurlencode($safeRedirect);
    }

    return $url;
}

/**
 * Convierte el usuario de base de datos en el formato que usamos dentro de la sesión.
 *
 * @param array $user Fila completa del usuario.
 * @return array
 */
function auth_session_payload(array $user): array
{
    return [
        'id' => (int) ($user['id'] ?? 0),
        'nombre_completo' => $user['nombre_completo'] ?? '',
        'rol' => $user['rol'] ?? 'usuario'
    ];
}

/**
 * Deja el usuario activo en la sesión actual.
 *
 * @param array $user Usuario ya validado.
 * @return void
 */
function auth_set_session_user(array $user): void
{
    $_SESSION['usuario'] = auth_session_payload($user);
}

/**
 * Convierte el token bruto en el hash que guardamos en base de datos.
 *
 * @param string $token Token en claro.
 * @return string
 */
function auth_remember_hash(string $token): string
{
    return hash('sha256', $token);
}

/**
 * Genera el token persistente con 32 caracteres hexadecimales.
 *
 * @return string
 */
function auth_generate_remember_token(): string
{
    return bin2hex(random_bytes(16));
}

/**
 * Busca un usuario por correo para login o comprobaciones de registro.
 *
 * @param string $correo Correo del usuario.
 * @return array|null
 */
function auth_find_user_by_email(string $correo): ?array
{
    $stmt = auth_get_pdo()->prepare('SELECT * FROM usuarios WHERE correo = ? LIMIT 1');
    $stmt->execute([$correo]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    return $user ?: null;
}

/**
 * Busca el usuario que corresponde al token persistente.
 *
 * @param string $token Token en claro guardado en cookie.
 * @return array|null
 */
function auth_find_user_by_remember_token(string $token): ?array
{
    if ($token === '') {
        return null;
    }

    $stmt = auth_get_pdo()->prepare('SELECT * FROM usuarios WHERE rememberMe = ? LIMIT 1');
    $stmt->execute([auth_remember_hash($token)]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    return $user ?: null;
}

/**
 * Borra solo la cookie local cuando ya no sirve.
 *
 * @return void
 */
function auth_clear_remember_cookie(): void
{
    setcookie(RV_REMEMBER_COOKIE, '', auth_cookie_options(time() - 3600));
    unset($_COOKIE[RV_REMEMBER_COOKIE]);
}

/**
 * Borra el hash persistente del usuario o del token que venga en la cookie.
 *
 * @param int|null $userId Id del usuario si ya lo tenemos resuelto.
 * @return void
 */
function auth_clear_remember_token(?int $userId = null): void
{
    $pdo = auth_get_pdo();

    if ($userId !== null && $userId > 0) {
        $stmt = $pdo->prepare('UPDATE usuarios SET rememberMe = NULL WHERE id = ?');
        $stmt->execute([$userId]);
        return;
    }

    $token = $_COOKIE[RV_REMEMBER_COOKIE] ?? '';
    if ($token === '') {
        return;
    }

    $stmt = $pdo->prepare('UPDATE usuarios SET rememberMe = NULL WHERE rememberMe = ?');
    $stmt->execute([auth_remember_hash($token)]);
}

/**
 * Emite la cookie persistente y guarda su hash en la base de datos.
 *
 * @param int $userId Id del usuario al que pertenece el token.
 * @return void
 */
function auth_issue_remember_token(int $userId): void
{
    $token = auth_generate_remember_token();
    $stmt = auth_get_pdo()->prepare('UPDATE usuarios SET rememberMe = ? WHERE id = ?');
    $stmt->execute([auth_remember_hash($token), $userId]);

    setcookie(
        RV_REMEMBER_COOKIE,
        $token,
        auth_cookie_options(time() + (RV_REMEMBER_DAYS * 86400))
    );
    $_COOKIE[RV_REMEMBER_COOKIE] = $token;
}

/**
 * Resuelve el usuario actual usando sesión o remember me.
 *
 * @return void
 */
function auth_bootstrap(): void
{
    auth_start_session();

    if (!empty($_SESSION['usuario']['id'])) {
        return;
    }

    $token = $_COOKIE[RV_REMEMBER_COOKIE] ?? '';
    if ($token === '') {
        return;
    }

    try {
        $user = auth_find_user_by_remember_token($token);
    } catch (Throwable $error) {
        error_log('auth_bootstrap error: ' . $error->getMessage());
        return;
    }

    if (!$user) {
        auth_clear_remember_cookie();
        return;
    }

    session_regenerate_id(true);
    auth_set_session_user($user);
}

/**
 * Crea la sesión tras un login correcto y decide si se deja la cookie persistente.
 *
 * @param array $user Usuario ya validado.
 * @param bool $rememberMe Marca del checkbox recordarme.
 * @return void
 */
function auth_login_user(array $user, bool $rememberMe): void
{
    auth_start_session();
    session_regenerate_id(true);
    auth_set_session_user($user);

    if ($rememberMe) {
        auth_issue_remember_token((int) $user['id']);
        return;
    }

    auth_clear_remember_token((int) $user['id']);
    auth_clear_remember_cookie();
}

/**
 * Cierra la sesión actual y limpia cualquier remember me pendiente.
 *
 * @return void
 */
function auth_logout_user(): void
{
    auth_start_session();

    $userId = isset($_SESSION['usuario']['id']) ? (int) $_SESSION['usuario']['id'] : 0;
    if ($userId > 0) {
        auth_clear_remember_token($userId);
    } else {
        auth_clear_remember_token();
    }

    auth_clear_remember_cookie();
    $_SESSION = [];

    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', [
            'expires' => time() - 3600,
            'path' => $params['path'] ?: '/',
            'domain' => $params['domain'] ?? '',
            'secure' => !empty($params['secure']),
            'httponly' => !empty($params['httponly']),
            'samesite' => $params['samesite'] ?? 'Lax'
        ]);
    }

    session_destroy();
}

/**
 * Devuelve el usuario activo o `null` si no hay sesión resuelta.
 *
 * @return array|null
 */
function auth_current_user(): ?array
{
    auth_bootstrap();

    return $_SESSION['usuario'] ?? null;
}

/**
 * Devuelve el ID del usuario activo sin repetir la lectura en cada endpoint.
 *
 * @return int
 */
function auth_user_id(): int
{
    $user = auth_current_user();

    return $user ? (int) $user['id'] : 0;
}
?>
