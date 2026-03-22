<?php
require_once __DIR__ . '/autenticacion.php';

// Estas cookies solo marcan si la visita actual ya conto.
const RV_ENTRY_GENERAL_COOKIE = 'rv_visit_general';
const RV_ENTRY_USER_COOKIE = 'rv_visit_user';

/**
 * Devuelve las opciones base de las cookies de conteo.
 *
 * @return array
 */
function entry_counter_cookie_options(): array
{
    return [
        'path' => RV_REMEMBER_PATH,
        'secure' => auth_cookie_is_secure(),
        'httponly' => true,
        'samesite' => 'Lax'
    ];
}

/**
 * Deja la cookie marcada para la visita actual y la refleja en $_COOKIE.
 *
 * @param string $name Nombre de la cookie.
 * @param string $value Valor que se quiere guardar.
 * @return void
 */
function entry_counter_set_visit_cookie(string $name, string $value): void
{
    setcookie($name, $value, entry_counter_cookie_options());
    $_COOKIE[$name] = $value;
}

/**
 * Devuelve una foto vacia para no romper la app si aun no existe la tabla.
 *
 * @param int $userId Usuario activo o 0 si no hay sesion.
 * @return array
 */
function entry_counter_empty_snapshot(int $userId): array
{
    return [
        'entradas_totales' => 0,
        'mis_entradas' => $userId > 0 ? 0 : null
    ];
}

/**
 * Suma una entrada sobre la fila general o la crea si aun no existe.
 *
 * @param PDO $pdo Conexion activa.
 * @return void
 */
function entry_counter_increment_general(PDO $pdo): void
{
    $stmt = $pdo->prepare(
        "INSERT INTO contador_entradas (tipo, usuario_id, contador)
         VALUES ('general', NULL, 1)
         ON DUPLICATE KEY UPDATE contador = contador + 1, updated_at = CURRENT_TIMESTAMP"
    );
    $stmt->execute();
}

/**
 * Suma una entrada para el usuario indicado o crea su fila si es la primera.
 *
 * @param PDO $pdo Conexion activa.
 * @param int $userId Usuario al que se le suma la entrada.
 * @return void
 */
function entry_counter_increment_user(PDO $pdo, int $userId): void
{
    if ($userId <= 0) {
        return;
    }

    $stmt = $pdo->prepare(
        "INSERT INTO contador_entradas (tipo, usuario_id, contador)
         VALUES ('usuario', ?, 1)
         ON DUPLICATE KEY UPDATE contador = contador + 1, updated_at = CURRENT_TIMESTAMP"
    );
    $stmt->execute([$userId]);
}

/**
 * Lee los acumulados actuales para el panel o para otras respuestas futuras.
 *
 * @param PDO $pdo Conexion activa.
 * @param int $userId Usuario activo o 0 si no hay sesion.
 * @return array
 */
function entry_counter_snapshot(PDO $pdo, int $userId): array
{
    $snapshot = entry_counter_empty_snapshot($userId);

    $stmt = $pdo->query("SELECT contador FROM contador_entradas WHERE tipo = 'general' LIMIT 1");
    $total = $stmt->fetchColumn();
    if ($total !== false) {
        $snapshot['entradas_totales'] = (int) $total;
    }

    if ($userId > 0) {
        $stmt = $pdo->prepare("SELECT contador FROM contador_entradas WHERE tipo = 'usuario' AND usuario_id = ? LIMIT 1");
        $stmt->execute([$userId]);
        $userTotal = $stmt->fetchColumn();
        $snapshot['mis_entradas'] = $userTotal !== false ? (int) $userTotal : 0;
    }

    return $snapshot;
}

/**
 * Cuenta la visita actual una sola vez y devuelve los acumulados ya actualizados.
 *
 * @param array|null $currentUser Usuario activo si hay sesion.
 * @return array
 */
function entry_counter_register_visit(?array $currentUser = null): array
{
    $userId = (int) ($currentUser['id'] ?? 0);

    try {
        $pdo = auth_get_pdo();

        if (($_COOKIE[RV_ENTRY_GENERAL_COOKIE] ?? '') !== '1') {
            entry_counter_increment_general($pdo);
            entry_counter_set_visit_cookie(RV_ENTRY_GENERAL_COOKIE, '1');
        }

        if ($userId > 0 && ($_COOKIE[RV_ENTRY_USER_COOKIE] ?? '') !== (string) $userId) {
            entry_counter_increment_user($pdo, $userId);
            entry_counter_set_visit_cookie(RV_ENTRY_USER_COOKIE, (string) $userId);
        }

        return entry_counter_snapshot($pdo, $userId);
    } catch (Throwable $error) {
        error_log('entry_counter_register_visit error: ' . $error->getMessage());

        return entry_counter_empty_snapshot($userId);
    }
}
?>
