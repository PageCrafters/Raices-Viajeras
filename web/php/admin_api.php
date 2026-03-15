<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST");
header("Access-Control-Allow-Headers: Content-Type");

require_once '../Formulario/php/conexiones.php';

try {
    $pdo = new PDO("mysql:host=localhost;dbname=raices_viajeras;charset=utf8", "root", "");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["error" => "Conexión fallida"]);
    exit;
}

$metodo = $_SERVER['REQUEST_METHOD'];

// ── GET ──────────────────────────────────────────────────────
if ($metodo === 'GET') {
    $accion = $_GET['accion'] ?? '';

    switch ($accion) {

        case 'stats':
            $stats = [];
            $stats['usuarios']   = $pdo->query("SELECT COUNT(*) FROM usuarios")->fetchColumn();
            $stats['viajes']     = $pdo->query("SELECT COUNT(*) FROM viajes")->fetchColumn();
            $stats['pedidos']    = $pdo->query("SELECT COUNT(*) FROM pedidos")->fetchColumn();
            $stats['provincias'] = $pdo->query("SELECT COUNT(*) FROM provincia")->fetchColumn();
            $stmt = $pdo->query("SELECT id, usuario_id, total, estado, fecha_pedido FROM pedidos ORDER BY fecha_pedido DESC LIMIT 5");
            $stats['ultimos_pedidos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($stats);
            break;

        case 'usuarios':
            $stmt = $pdo->query("SELECT id, nombre_completo, correo, genero, fechaNacimiento, rol FROM usuarios ORDER BY id DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        case 'viajes':
            $stmt = $pdo->query("SELECT id, titulo, descripcion, origen, fecha_inicio, fecha_fin, precio, plazas, provincia_id, imagen FROM viajes ORDER BY id DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        case 'provincias':
            $stmt = $pdo->query("SELECT id, nombre, descripcion, imagen, created_at FROM provincia ORDER BY id DESC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        case 'pedidos':
            $estado = $_GET['estado'] ?? '';
            if ($estado) {
                $stmt = $pdo->prepare("SELECT id, usuario_id, total, estado, direccion_envio, fecha_pedido FROM pedidos WHERE estado = ? ORDER BY fecha_pedido DESC");
                $stmt->execute([$estado]);
            } else {
                $stmt = $pdo->query("SELECT id, usuario_id, total, estado, direccion_envio, fecha_pedido FROM pedidos ORDER BY fecha_pedido DESC");
            }
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        default:
            http_response_code(400);
            echo json_encode(["error" => "Acción no válida"]);
    }
}

// ── POST ─────────────────────────────────────────────────────
if ($metodo === 'POST') {
    $body   = json_decode(file_get_contents('php://input'), true);
    $accion = $body['accion'] ?? '';

    switch ($accion) {

        // USUARIOS
        case 'editar_usuario':
            $id = intval($body['id']);
            if (!empty($body['pwd'])) {
                $pwd = password_hash($body['pwd'], PASSWORD_BCRYPT);
                $stmt = $pdo->prepare("UPDATE usuarios SET nombre_completo=?, correo=?, pwd=?, genero=?, rol=? WHERE id=?");
                $stmt->execute([$body['nombre_completo'], $body['correo'], $pwd, $body['genero'], $body['rol'], $id]);
            } else {
                $stmt = $pdo->prepare("UPDATE usuarios SET nombre_completo=?, correo=?, genero=?, rol=? WHERE id=?");
                $stmt->execute([$body['nombre_completo'], $body['correo'], $body['genero'], $body['rol'], $id]);
            }
            echo json_encode(["ok" => true]);
            break;

        // VIAJES
        case 'crear_viaje':
            $stmt = $pdo->prepare("INSERT INTO viajes (titulo, descripcion, origen, provincia_id, fecha_inicio, fecha_fin, precio, plazas, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$body['titulo'], $body['descripcion'], $body['origen'], $body['provincia_id'], $body['fecha_inicio'], $body['fecha_fin'], $body['precio'], $body['plazas'], $body['imagen']]);
            echo json_encode(["ok" => true, "id" => $pdo->lastInsertId()]);
            break;

        case 'editar_viaje':
            $id = intval($body['id']);
            $stmt = $pdo->prepare("UPDATE viajes SET titulo=?, descripcion=?, origen=?, provincia_id=?, fecha_inicio=?, fecha_fin=?, precio=?, plazas=?, imagen=? WHERE id=?");
            $stmt->execute([$body['titulo'], $body['descripcion'], $body['origen'], $body['provincia_id'], $body['fecha_inicio'], $body['fecha_fin'], $body['precio'], $body['plazas'], $body['imagen'], $id]);
            echo json_encode(["ok" => true]);
            break;

        // PROVINCIAS / CATEGORÍAS
        case 'crear_provincia':
            $stmt = $pdo->prepare("INSERT INTO provincia (nombre, descripcion, imagen) VALUES (?, ?, ?)");
            $stmt->execute([$body['nombre'], $body['descripcion'], $body['imagen']]);
            echo json_encode(["ok" => true, "id" => $pdo->lastInsertId()]);
            break;

        case 'editar_provincia':
            $id = intval($body['id']);
            $stmt = $pdo->prepare("UPDATE provincia SET nombre=?, descripcion=?, imagen=? WHERE id=?");
            $stmt->execute([$body['nombre'], $body['descripcion'], $body['imagen'], $id]);
            echo json_encode(["ok" => true]);
            break;

        // PEDIDOS
        case 'actualizar_estado_pedido':
            $id = intval($body['id']);
            $stmt = $pdo->prepare("UPDATE pedidos SET estado=? WHERE id=?");
            $stmt->execute([$body['estado'], $id]);
            echo json_encode(["ok" => true]);
            break;

        // ELIMINAR
        case 'eliminar':
            $tipo = $body['tipo'] ?? '';
            $id   = intval($body['id']);
            $tablas = ['usuario' => 'usuarios', 'viaje' => 'viajes', 'provincia' => 'provincia', 'pedido' => 'pedidos'];
            if (!isset($tablas[$tipo])) {
                http_response_code(400);
                echo json_encode(["error" => "Tipo no válido"]);
                break;
            }
            $stmt = $pdo->prepare("DELETE FROM {$tablas[$tipo]} WHERE id=?");
            $stmt->execute([$id]);
            echo json_encode(["ok" => true]);
            break;

        default:
            http_response_code(400);
            echo json_encode(["error" => "Acción no válida"]);
    }
}
?>