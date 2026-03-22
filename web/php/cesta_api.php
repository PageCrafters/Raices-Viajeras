<?php
require_once __DIR__ . '/autenticacion.php';
require_once __DIR__ . '/cesta_service.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// La cesta necesita saber la sesión real aunque venga recuperada por remember me.
auth_bootstrap();

/**
 * Devuelve una respuesta JSON y corta la ejecución del endpoint.
 *
 * @param array $data Datos que se envían al frontend.
 * @param int $status Código HTTP final.
 * @return void
 */
function cart_json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
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
        cart_json_response(['error' => 'Acción no válida.'], 400);
    }

    cart_json_response(cart_build_summary($pdo));
}

if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    $action = $body['accion'] ?? '';
    $userId = auth_user_id();

    // Las acciones POST de cesta quedan agrupadas aquí para compartir validaciones.
    if ($action === 'agregar_item') {
        $tripId = isset($body['viaje_id']) ? (int) $body['viaje_id'] : 0;
        if ($tripId <= 0) {
            cart_json_response(['error' => 'Viaje no válido.'], 400);
        }

        try {
            if ($userId > 0) {
                cart_json_response(cart_add_item($pdo, $userId, $tripId));
            }

            cart_json_response(cart_add_guest_item($pdo, $tripId));
        } catch (RuntimeException $error) {
            cart_json_response(['error' => $error->getMessage()], 404);
        } catch (Throwable $error) {
            error_log('cesta_api.php agregar_item error: ' . $error->getMessage());
            cart_json_response(['error' => 'No se pudo añadir el viaje a la cesta.'], 500);
        }
    }

    if ($action !== 'eliminar_item') {
        cart_json_response(['error' => 'Acción no válida.'], 400);
    }

    $cartItemId = isset($body['carrito_viaje_id']) ? (int) $body['carrito_viaje_id'] : 0;
    if ($cartItemId <= 0) {
        cart_json_response(['error' => 'Ítem de cesta no válido.'], 400);
    }

    if ($userId <= 0) {
        cart_json_response(cart_remove_guest_item($pdo, $cartItemId));
    }

    $activeCartId = cart_get_active_id($pdo, $userId);
    if ($activeCartId === null) {
        cart_json_response(cart_build_summary($pdo));
    }

    // Antes de borrar, compruebo que la línea pertenece al carrito activo del usuario.
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

    cart_json_response(cart_build_user_summary($pdo, $userId));
}

cart_json_response(['error' => 'Método no permitido.'], 405);
?>
