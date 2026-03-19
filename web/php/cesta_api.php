<?php
session_start();

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

function json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function get_logged_user_id(): int
{
    return isset($_SESSION['usuario']['id']) ? (int) $_SESSION['usuario']['id'] : 0;
}

function resolve_image(?string $value): ?string
{
    if ($value === null || $value === '') {
        return null;
    }

    $isBinary = preg_match('/[\x00-\x08\x0E-\x1F]/', $value);
    if ($isBinary) {
        return 'data:image/jpeg;base64,' . base64_encode($value);
    }

    if (
        preg_match('/^(https?:\/\/|\.\/|\/|img\/|[A-Za-z0-9_\-]+\/)/', $value) ||
        preg_match('/\.[a-zA-Z0-9]{2,4}$/', $value)
    ) {
        return $value;
    }

    return 'data:image/jpeg;base64,' . base64_encode($value);
}

function empty_cart_summary(bool $loggedIn): array
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

function get_active_cart_id(PDO $pdo, int $userId): ?int
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

function sync_cart_total(PDO $pdo, int $cartId, float $total): void
{
    $stmt = $pdo->prepare('UPDATE carritos SET total = ? WHERE id = ?');
    $stmt->execute([number_format($total, 2, '.', ''), $cartId]);
}

function build_cart_summary(PDO $pdo): array
{
    $userId = get_logged_user_id();

    if ($userId <= 0) {
        return empty_cart_summary(false);
    }

    $cartId = get_active_cart_id($pdo, $userId);
    if ($cartId === null) {
        return empty_cart_summary(true);
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
            'imagen' => resolve_image($row['imagen']),
            'provincia_nombre' => $row['provincia_nombre'],
            'cantidad' => $quantity,
            'precio_unitario' => $unitPrice,
            'subtotal' => $subtotal
        ];

        $total += $subtotal;
        $count += $quantity;
    }

    sync_cart_total($pdo, $cartId, $total);

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

try {
    $pdo = new PDO('mysql:host=localhost;dbname=raices_viajeras;charset=utf8mb4', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $error) {
    json_response(['error' => 'No se pudo conectar con la base de datos.'], 500);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['accion'] ?? '';

    if ($action !== 'resumen') {
        json_response(['error' => 'Accion no valida.'], 400);
    }

    json_response(build_cart_summary($pdo));
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);
    $action = $body['accion'] ?? '';

    if ($action !== 'eliminar_item') {
        json_response(['error' => 'Accion no valida.'], 400);
    }

    $userId = get_logged_user_id();
    if ($userId <= 0) {
        json_response(['error' => 'Debes iniciar sesion para modificar la cesta.'], 401);
    }

    $cartItemId = isset($body['carrito_viaje_id']) ? (int) $body['carrito_viaje_id'] : 0;
    if ($cartItemId <= 0) {
        json_response(['error' => 'Item de cesta no valido.'], 400);
    }

    $activeCartId = get_active_cart_id($pdo, $userId);
    if ($activeCartId === null) {
        json_response(build_cart_summary($pdo));
    }

    $checkStmt = $pdo->prepare(
        "SELECT id
         FROM carrito_viajes
         WHERE id = ? AND carrito_id = ?
         LIMIT 1"
    );
    $checkStmt->execute([$cartItemId, $activeCartId]);

    if (!$checkStmt->fetchColumn()) {
        json_response(['error' => 'El viaje no pertenece a la cesta activa del usuario.'], 404);
    }

    $deleteStmt = $pdo->prepare('DELETE FROM carrito_viajes WHERE id = ?');
    $deleteStmt->execute([$cartItemId]);

    json_response(build_cart_summary($pdo));
}

json_response(['error' => 'Metodo no permitido.'], 405);
?>
