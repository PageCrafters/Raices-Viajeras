<?php
require_once __DIR__ . '/autenticacion.php';
require_once __DIR__ . '/utilidades_imagen.php';

const RV_CART_COOKIE = 'CestaIds';
const RV_CART_COOKIE_DAYS = 30;

/**
 * Centraliza las opciones de la cookie temporal de cesta.
 *
 * @param int $expiresAt Momento exacto en el que caduca la cookie.
 * @return array
 */
function cart_cookie_options(int $expiresAt): array
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
 * Borra la cookie temporal de cesta y su copia local.
 *
 * @return void
 */
function cart_clear_guest_cookie(): void
{
    setcookie(RV_CART_COOKIE, '', cart_cookie_options(time() - 3600));
    unset($_COOKIE[RV_CART_COOKIE]);
}

/**
 * Lee la cookie temporal y devuelve solo IDs de viaje válidos.
 *
 * @return array<int>
 */
function cart_guest_cookie_ids(): array
{
    $rawValue = trim((string) ($_COOKIE[RV_CART_COOKIE] ?? ''));
    if ($rawValue === '') {
        return [];
    }

    $decoded = json_decode($rawValue, true);
    if (!is_array($decoded)) {
        cart_clear_guest_cookie();
        return [];
    }

    $tripIds = [];
    foreach ($decoded as $value) {
        if (is_int($value) || (is_string($value) && ctype_digit($value))) {
            $tripId = (int) $value;
            if ($tripId > 0) {
                $tripIds[] = $tripId;
            }
        }
    }

    if (!$tripIds) {
        cart_clear_guest_cookie();
    }

    return $tripIds;
}

/**
 * Guarda la cesta temporal en cookie respetando el orden y las repeticiones.
 *
 * @param array<int|string> $tripIds Lista cruda de IDs.
 * @return void
 */
function cart_store_guest_cookie_ids(array $tripIds): void
{
    $normalized = [];
    foreach ($tripIds as $value) {
        $tripId = (int) $value;
        if ($tripId > 0) {
            $normalized[] = $tripId;
        }
    }

    if (!$normalized) {
        cart_clear_guest_cookie();
        return;
    }

    $encoded = json_encode(array_values($normalized), JSON_UNESCAPED_UNICODE);
    if (!is_string($encoded) || $encoded === '') {
        throw new RuntimeException('No se pudo guardar la cesta temporal.');
    }

    setcookie(
        RV_CART_COOKIE,
        $encoded,
        cart_cookie_options(time() + (RV_CART_COOKIE_DAYS * 86400))
    );
    $_COOKIE[RV_CART_COOKIE] = $encoded;
}

/**
 * Devuelve la estructura vacía que espera el frontend.
 *
 * @param bool $loggedIn Marca si el usuario está autenticado.
 * @return array
 */
function cart_empty_summary(bool $loggedIn): array
{
    return [
        'logueado' => $loggedIn,
        'carrito' => [
            'id' => null,
            'total' => 0,
            'count' => 0,
            'items' => []
        ]
    ];
}

/**
 * Devuelve el carrito activo más reciente del usuario.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param int $userId ID del usuario.
 * @return int|null
 */
function cart_get_active_id(PDO $pdo, int $userId): ?int
{
    $stmt = $pdo->prepare(
        "SELECT id
         FROM carritos
         WHERE usuario_id = ? AND estado = 'activo'
         ORDER BY id DESC
         LIMIT 1"
    );
    $stmt->execute([$userId]);
    $cartId = $stmt->fetchColumn();

    return $cartId ? (int) $cartId : null;
}

/**
 * Devuelve el carrito activo del usuario o lo crea si todavía no existe.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param int $userId ID del usuario.
 * @return int
 */
function cart_get_or_create_active_id(PDO $pdo, int $userId): int
{
    $cartId = cart_get_active_id($pdo, $userId);
    if ($cartId !== null) {
        return $cartId;
    }

    $stmt = $pdo->prepare("INSERT INTO carritos (usuario_id, total, estado) VALUES (?, 0.00, 'activo')");
    $stmt->execute([$userId]);

    return (int) $pdo->lastInsertId();
}

/**
 * Mantiene el total del carrito sincronizado con sus líneas reales.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param int $cartId ID del carrito.
 * @param float $total Total recalculado.
 * @return void
 */
function cart_sync_total(PDO $pdo, int $cartId, float $total): void
{
    $stmt = $pdo->prepare('UPDATE carritos SET total = ? WHERE id = ?');
    $stmt->execute([number_format($total, 2, '.', ''), $cartId]);
}

/**
 * Busca el viaje antes de tocar la cesta para asegurar que existe.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param int $tripId ID del viaje.
 * @return array|null
 */
function cart_find_trip(PDO $pdo, int $tripId): ?array
{
    $stmt = $pdo->prepare('SELECT id, precio FROM viajes WHERE id = ? LIMIT 1');
    $stmt->execute([$tripId]);
    $trip = $stmt->fetch(PDO::FETCH_ASSOC);

    return $trip ?: null;
}

/**
 * Recupera los datos de viaje que necesita la cesta para pintar cada línea.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param array<int> $tripIds IDs únicos de viaje.
 * @return array<int, array>
 */
function cart_fetch_trip_rows(PDO $pdo, array $tripIds): array
{
    $uniqueTripIds = array_values(array_unique(array_map('intval', $tripIds)));
    $uniqueTripIds = array_values(array_filter($uniqueTripIds, static fn (int $tripId): bool => $tripId > 0));

    if (!$uniqueTripIds) {
        return [];
    }

    $placeholders = implode(', ', array_fill(0, count($uniqueTripIds), '?'));
    $stmt = $pdo->prepare(
        "SELECT
            v.id,
            v.titulo,
            v.descripcion,
            v.imagen,
            v.imagen_movil,
            v.precio,
            p.nombre AS provincia_nombre
         FROM viajes v
         LEFT JOIN provincia p ON p.id = v.provincia_id
         WHERE v.id IN ($placeholders)"
    );
    $stmt->execute($uniqueTripIds);

    $rows = [];
    foreach ($stmt->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $tripId = (int) $row['id'];
        $rows[$tripId] = [
            'id' => $tripId,
            'titulo' => $row['titulo'] ?? '',
            'descripcion' => $row['descripcion'] ?? '',
            'imagen' => rv_resolve_responsive_image_value($row['imagen'] ?? null, $row['imagen_movil'] ?? null),
            'provincia_nombre' => $row['provincia_nombre'] ?? '',
            'precio' => (float) ($row['precio'] ?? 0)
        ];
    }

    return $rows;
}

/**
 * Agrupa la cesta temporal por viaje y conserva el orden de la última vez añadida.
 *
 * @param array<int> $tripIds IDs guardados en la cookie.
 * @return array{order: array<int>, counts: array<int, int>}
 */
function cart_group_guest_trip_ids(array $tripIds): array
{
    $order = [];
    $counts = [];
    $seen = [];

    foreach (array_reverse($tripIds) as $value) {
        $tripId = (int) $value;
        if ($tripId <= 0) {
            continue;
        }

        $counts[$tripId] = ($counts[$tripId] ?? 0) + 1;

        if (!isset($seen[$tripId])) {
            $order[] = $tripId;
            $seen[$tripId] = true;
        }
    }

    return [
        'order' => $order,
        'counts' => $counts
    ];
}

/**
 * Monta el resumen de cesta temporal para usuarios invitados.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param array<int>|null $tripIds IDs ya leídos de la cookie si se tienen.
 * @return array
 */
function cart_build_guest_summary(PDO $pdo, ?array $tripIds = null): array
{
    $tripIds = $tripIds ?? cart_guest_cookie_ids();
    if (!$tripIds) {
        return cart_empty_summary(false);
    }

    $grouped = cart_group_guest_trip_ids($tripIds);
    if (!$grouped['order']) {
        cart_clear_guest_cookie();
        return cart_empty_summary(false);
    }

    $tripRows = cart_fetch_trip_rows($pdo, $grouped['order']);
    if (!$tripRows) {
        cart_clear_guest_cookie();
        return cart_empty_summary(false);
    }

    $items = [];
    $total = 0.0;
    $count = 0;
    $sanitizedTripIds = [];

    foreach ($tripIds as $rawTripId) {
        $tripId = (int) $rawTripId;
        if ($tripId > 0 && isset($tripRows[$tripId])) {
            $sanitizedTripIds[] = $tripId;
        }
    }

    foreach ($grouped['order'] as $tripId) {
        if (!isset($tripRows[$tripId])) {
            continue;
        }

        $quantity = (int) ($grouped['counts'][$tripId] ?? 0);
        if ($quantity <= 0) {
            continue;
        }

        $trip = $tripRows[$tripId];
        $subtotal = $quantity * $trip['precio'];

        $items[] = [
            'carrito_viaje_id' => $tripId,
            'viaje_id' => $tripId,
            'titulo' => $trip['titulo'],
            'descripcion' => $trip['descripcion'],
            'imagen' => $trip['imagen'],
            'provincia_nombre' => $trip['provincia_nombre'],
            'cantidad' => $quantity,
            'precio_unitario' => $trip['precio'],
            'subtotal' => $subtotal
        ];

        $count += $quantity;
        $total += $subtotal;
    }

    if (!$items) {
        cart_clear_guest_cookie();
        return cart_empty_summary(false);
    }

    if ($sanitizedTripIds !== array_values($tripIds)) {
        cart_store_guest_cookie_ids($sanitizedTripIds);
    }

    return [
        'logueado' => false,
        'carrito' => [
            'id' => null,
            'total' => $total,
            'count' => $count,
            'items' => $items
        ]
    ];
}

/**
 * Monta la respuesta completa de la cesta real del usuario autenticado.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param int $userId ID del usuario.
 * @return array
 */
function cart_build_user_summary(PDO $pdo, int $userId): array
{
    $cartId = cart_get_active_id($pdo, $userId);
    if ($cartId === null) {
        return cart_empty_summary(true);
    }

    $stmt = $pdo->prepare(
        "SELECT
            cv.id AS carrito_viaje_id,
            cv.viaje_id,
            cv.cantidad,
            cv.precio_unitario,
            v.titulo,
            v.descripcion,
            v.imagen,
            v.imagen_movil,
            p.nombre AS provincia_nombre
         FROM carrito_viajes cv
         INNER JOIN viajes v ON v.id = cv.viaje_id
         LEFT JOIN provincia p ON p.id = v.provincia_id
         WHERE cv.carrito_id = ?
         ORDER BY cv.id DESC"
    );
    $stmt->execute([$cartId]);
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $items = [];
    $total = 0.0;
    $count = 0;

    foreach ($rows as $row) {
        $quantity = (int) $row['cantidad'];
        $unitPrice = (float) $row['precio_unitario'];
        $subtotal = $quantity * $unitPrice;

        $items[] = [
            'carrito_viaje_id' => (int) $row['carrito_viaje_id'],
            'viaje_id' => (int) $row['viaje_id'],
            'titulo' => $row['titulo'] ?? '',
            'descripcion' => $row['descripcion'] ?? '',
            'imagen' => rv_resolve_responsive_image_value($row['imagen'] ?? null, $row['imagen_movil'] ?? null),
            'provincia_nombre' => $row['provincia_nombre'] ?? '',
            'cantidad' => $quantity,
            'precio_unitario' => $unitPrice,
            'subtotal' => $subtotal
        ];

        $total += $subtotal;
        $count += $quantity;
    }

    cart_sync_total($pdo, $cartId, $total);

    return [
        'logueado' => true,
        'carrito' => [
            'id' => $cartId,
            'total' => $total,
            'count' => $count,
            'items' => $items
        ]
    ];
}

/**
 * Devuelve el resumen adecuado según haya sesión o solo cookie temporal.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @return array
 */
function cart_build_summary(PDO $pdo): array
{
    $userId = auth_user_id();

    if ($userId <= 0) {
        return cart_build_guest_summary($pdo);
    }

    return cart_build_user_summary($pdo, $userId);
}

/**
 * Suma una cantidad concreta de un viaje dentro del carrito real.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param int $cartId ID del carrito activo.
 * @param int $tripId ID del viaje.
 * @param int $quantity Cantidad que se quiere sumar.
 * @param float $unitPrice Precio vigente del viaje.
 * @return void
 */
function cart_add_trip_quantity(PDO $pdo, int $cartId, int $tripId, int $quantity, float $unitPrice): void
{
    if ($quantity <= 0) {
        return;
    }

    $checkStmt = $pdo->prepare(
        'SELECT id, cantidad FROM carrito_viajes WHERE carrito_id = ? AND viaje_id = ? LIMIT 1'
    );
    $checkStmt->execute([$cartId, $tripId]);
    $line = $checkStmt->fetch(PDO::FETCH_ASSOC);

    if ($line) {
        $updateStmt = $pdo->prepare('UPDATE carrito_viajes SET cantidad = ? WHERE id = ?');
        $updateStmt->execute([(int) $line['cantidad'] + $quantity, (int) $line['id']]);
        return;
    }

    $insertStmt = $pdo->prepare(
        'INSERT INTO carrito_viajes (carrito_id, viaje_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)'
    );
    $insertStmt->execute([$cartId, $tripId, $quantity, $unitPrice]);
}

/**
 * Añade una unidad del viaje al carrito real del usuario.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param int $userId ID del usuario activo.
 * @param int $tripId ID del viaje.
 * @return array
 */
function cart_add_item(PDO $pdo, int $userId, int $tripId): array
{
    $trip = cart_find_trip($pdo, $tripId);
    if (!$trip) {
        throw new RuntimeException('El viaje indicado no existe.');
    }

    $pdo->beginTransaction();

    try {
        $cartId = cart_get_or_create_active_id($pdo, $userId);
        cart_add_trip_quantity($pdo, $cartId, $tripId, 1, (float) $trip['precio']);
        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $error;
    }

    return cart_build_user_summary($pdo, $userId);
}

/**
 * Añade un viaje a la cesta temporal del invitado.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param int $tripId ID del viaje.
 * @return array
 */
function cart_add_guest_item(PDO $pdo, int $tripId): array
{
    if (!cart_find_trip($pdo, $tripId)) {
        throw new RuntimeException('El viaje indicado no existe.');
    }

    $tripIds = cart_guest_cookie_ids();
    $tripIds[] = $tripId;
    cart_store_guest_cookie_ids($tripIds);

    return cart_build_guest_summary($pdo, $tripIds);
}

/**
 * Elimina de la cesta temporal todas las unidades de un viaje concreto.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param int $tripId ID del viaje.
 * @return array
 */
function cart_remove_guest_item(PDO $pdo, int $tripId): array
{
    $remainingTripIds = array_values(
        array_filter(
            cart_guest_cookie_ids(),
            static fn (int $value): bool => $value !== $tripId
        )
    );

    if ($remainingTripIds) {
        cart_store_guest_cookie_ids($remainingTripIds);
    } else {
        cart_clear_guest_cookie();
    }

    return cart_build_guest_summary($pdo, $remainingTripIds);
}

/**
 * Fusiona la cesta temporal del invitado dentro de la cesta real del usuario.
 *
 * @param PDO $pdo Conexión PDO compartida.
 * @param int $userId ID del usuario autenticado.
 * @return int Cantidad total de unidades que se han movido.
 */
function cart_merge_guest_cookie_into_user(PDO $pdo, int $userId): int
{
    if ($userId <= 0) {
        return 0;
    }

    $tripIds = cart_guest_cookie_ids();
    if (!$tripIds) {
        return 0;
    }

    $grouped = cart_group_guest_trip_ids($tripIds);
    $tripRows = cart_fetch_trip_rows($pdo, array_keys($grouped['counts']));

    if (!$tripRows) {
        cart_clear_guest_cookie();
        return 0;
    }

    $mergedCount = 0;
    $pdo->beginTransaction();

    try {
        $cartId = cart_get_or_create_active_id($pdo, $userId);

        foreach ($grouped['counts'] as $tripId => $quantity) {
            $tripId = (int) $tripId;
            $quantity = (int) $quantity;

            if ($quantity <= 0 || !isset($tripRows[$tripId])) {
                continue;
            }

            cart_add_trip_quantity($pdo, $cartId, $tripId, $quantity, (float) $tripRows[$tripId]['precio']);
            $mergedCount += $quantity;
        }

        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $error;
    }

    cart_clear_guest_cookie();

    return $mergedCount;
}
?>
