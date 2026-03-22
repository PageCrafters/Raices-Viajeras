<?php
require_once __DIR__ . '/autenticacion.php';
require_once __DIR__ . '/utilidades_imagen.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// La cesta necesita saber la sesion real aunque venga recuperada por remember me
auth_bootstrap();

/**
 * Devuelve una respuesta JSON y corta la ejecucion del endpoint
 *
 * @param array $data Datos que se envian al frontend
 * @param int $status Codigo HTTP
 * @return void
 */
function cart_json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Devuelve la estructura vacia que espera el modal cuando no hay carrito o no hay login
 *
 * @param bool $loggedIn Marca si el usuario esta autenticado
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
 * Devuelve el carrito activo mas reciente del usuario
 *
 * @param PDO $pdo Conexion PDO compartida
 * @param int $userId Id del usuario
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
 * Devuelve el carrito activo del usuario o lo crea si todavia no existe
 *
 * @param PDO $pdo Conexion PDO compartida
 * @param int $userId Id del usuario
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
 * Mantiene el total del carrito sincronizado con sus lineas reales
 *
 * @param PDO $pdo Conexion PDO compartida
 * @param int $cartId Id del carrito
 * @param float $total Total recalculado
 * @return void
 */
function cart_sync_total(PDO $pdo, int $cartId, float $total): void
{
    $stmt = $pdo->prepare('UPDATE carritos SET total = ? WHERE id = ?');
    $stmt->execute([number_format($total, 2, '.', ''), $cartId]);
}

/**
 * Busca el viaje antes de tocar el carrito para asegurar que existe y usar su precio actual
 *
 * @param PDO $pdo Conexion PDO compartida
 * @param int $tripId Id del viaje
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
 * Monta la respuesta completa que usa el modal y la pagina de cesta
 *
 * @param PDO $pdo Conexion PDO compartida
 * @return array
 */
function cart_build_summary(PDO $pdo): array
{
    $userId = auth_user_id();

    if ($userId <= 0) {
        return cart_empty_summary(false);
    }

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
            'titulo' => $row['titulo'],
            'descripcion' => $row['descripcion'],
            'imagen' => rv_resolve_responsive_image_value($row['imagen'] ?? null, $row['imagen_movil'] ?? null),
            'provincia_nombre' => $row['provincia_nombre'],
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
 * Anade el viaje al carrito activo o suma cantidad si ya estaba
 *
 * @param PDO $pdo Conexion PDO compartida
 * @param int $userId Id del usuario activo
 * @param int $tripId Id del viaje
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

        $checkStmt = $pdo->prepare(
            'SELECT id, cantidad FROM carrito_viajes WHERE carrito_id = ? AND viaje_id = ? LIMIT 1'
        );
        $checkStmt->execute([$cartId, $tripId]);
        $line = $checkStmt->fetch(PDO::FETCH_ASSOC);

        if ($line) {
            $updateStmt = $pdo->prepare('UPDATE carrito_viajes SET cantidad = ? WHERE id = ?');
            $updateStmt->execute([(int) $line['cantidad'] + 1, (int) $line['id']]);
        } else {
            $insertStmt = $pdo->prepare(
                'INSERT INTO carrito_viajes (carrito_id, viaje_id, cantidad, precio_unitario) VALUES (?, ?, 1, ?)'
            );
            $insertStmt->execute([$cartId, $tripId, $trip['precio']]);
        }

        $pdo->commit();
    } catch (Throwable $error) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }

        throw $error;
    }

    return cart_build_summary($pdo);
}

try {
    $pdo = auth_get_pdo();
} catch (Throwable $error) {
    cart_json_response(['error' => 'No se pudo conectar con la base de datos.'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['accion'] ?? '';

    if ($action !== 'resumen') {
        cart_json_response(['error' => 'Accion no valida.'], 400);
    }

    cart_json_response(cart_build_summary($pdo));
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $body['accion'] ?? '';
    $userId = auth_user_id();

    // Las acciones POST de cesta quedan agrupadas aqui para compartir validaciones de sesion
    if ($action === 'agregar_item') {
        if ($userId <= 0) {
            cart_json_response(['error' => 'Debes iniciar sesión para guardar viajes en la cesta.'], 401);
        }

        $tripId = isset($body['viaje_id']) ? (int) $body['viaje_id'] : 0;
        if ($tripId <= 0) {
            cart_json_response(['error' => 'Viaje no valido.'], 400);
        }

        try {
            cart_json_response(cart_add_item($pdo, $userId, $tripId));
        } catch (RuntimeException $error) {
            cart_json_response(['error' => $error->getMessage()], 404);
        } catch (Throwable $error) {
            error_log('cesta_api.php agregar_item error: ' . $error->getMessage());
            cart_json_response(['error' => 'No se pudo añadir el viaje a la cesta.'], 500);
        }
    }

    if ($action !== 'eliminar_item') {
        cart_json_response(['error' => 'Accion no valida.'], 400);
    }

    if ($userId <= 0) {
        cart_json_response(['error' => 'Debes iniciar sesión para modificar la cesta.'], 401);
    }

    $cartItemId = isset($body['carrito_viaje_id']) ? (int) $body['carrito_viaje_id'] : 0;
    if ($cartItemId <= 0) {
        cart_json_response(['error' => 'Ítem de cesta no válido.'], 400);
    }

    $activeCartId = cart_get_active_id($pdo, $userId);
    if ($activeCartId === null) {
        cart_json_response(cart_build_summary($pdo));
    }

    // Antes de borrar, compruebo que la linea pertenece al carrito activo del usuario
    $checkStmt = $pdo->prepare(
        "SELECT id
         FROM carrito_viajes
         WHERE id = ? AND carrito_id = ?
         LIMIT 1"
    );
    $checkStmt->execute([$cartItemId, $activeCartId]);

    if (!$checkStmt->fetchColumn()) {
        cart_json_response(['error' => 'El viaje no pertenece a la cesta activa del usuario.'], 404);
    }

    $deleteStmt = $pdo->prepare('DELETE FROM carrito_viajes WHERE id = ?');
    $deleteStmt->execute([$cartItemId]);

    cart_json_response(cart_build_summary($pdo));
}

cart_json_response(['error' => 'Metodo no permitido.'], 405);
?>
