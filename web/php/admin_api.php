<?php
require_once __DIR__ . '/autenticacion.php';
require_once __DIR__ . '/contador_entradas.php';
require_once __DIR__ . '/utilidades_imagen.php';

header('Content-Type: application/json; charset=utf-8');

// Todas las operaciones del panel pasan por la misma sesion restaurada desde cookie o servidor.
auth_bootstrap();

// El panel admin solo deberia responder si el usuario activo tiene permisos de admin.
$currentUser = auth_current_user();
if (!$currentUser) {
    http_response_code(401);
    echo json_encode(['error' => 'Debes iniciar sesion.'], JSON_UNESCAPED_UNICODE);
    exit;
}

if (($currentUser['rol'] ?? 'usuario') !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'No tienes permisos para acceder al panel.'], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Respuesta corta para no repetir el mismo bloque de salida.
 *
 * @param array $data Datos que se devuelven al frontend.
 * @param int $status Codigo HTTP.
 * @return void
 */
function admin_json_response(array $data, int $status = 200): void
{
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Lee el cuerpo del panel segun venga en JSON o en multipart.
 *
 * @return array
 */
function admin_read_request_body(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

    if (stripos($contentType, 'application/json') !== false) {
        return json_decode(file_get_contents('php://input'), true) ?? [];
    }

    return $_POST;
}

/**
 * Valida la subida de imagen y devuelve el binario listo para guardar.
 *
 * @param array|null $file Archivo subido desde el formulario.
 * @return string|null
 */
function admin_uploaded_image_binary(?array $file): ?string
{
    if (!$file || !isset($file['error'])) {
        return null;
    }

    if ((int) $file['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    if ((int) $file['error'] !== UPLOAD_ERR_OK) {
        admin_json_response(['error' => 'No se pudo subir la imagen del viaje.'], 400);
    }

    $tmpName = $file['tmp_name'] ?? '';
    if ($tmpName === '' || !is_uploaded_file($tmpName)) {
        admin_json_response(['error' => 'La imagen subida no es valida.'], 400);
    }

    $mime = '';
    if (function_exists('finfo_open')) {
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        if ($finfo !== false) {
            $mime = (string) finfo_file($finfo, $tmpName);
            finfo_close($finfo);
        }
    }

    if ($mime === '' && function_exists('mime_content_type')) {
        $mime = (string) mime_content_type($tmpName);
    }

    if ($mime === '' || strpos($mime, 'image/') !== 0) {
        admin_json_response(['error' => 'Solo se permiten archivos de imagen.'], 400);
    }

    $binary = file_get_contents($tmpName);
    if ($binary === false) {
        admin_json_response(['error' => 'No se pudo leer la imagen subida.'], 400);
    }

    return $binary;
}

// Conexion PDO compartida con el resto de autenticacion y carrito.
$pdo = auth_get_pdo();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $action = $_GET['accion'] ?? '';

    // Todas las lecturas del panel salen por este switch para mantener el contrato en un solo sitio.
    switch ($action) {
        case 'stats':
            $stats = [];
            $stats['usuarios'] = (int) $pdo->query('SELECT COUNT(*) FROM usuarios')->fetchColumn();
            $stats['viajes'] = (int) $pdo->query('SELECT COUNT(*) FROM viajes')->fetchColumn();
            $stats['pedidos'] = (int) $pdo->query('SELECT COUNT(*) FROM pedidos')->fetchColumn();
            $stats['provincias'] = (int) $pdo->query('SELECT COUNT(*) FROM provincia')->fetchColumn();
            $entryStats = entry_counter_register_visit($currentUser);
            $stats['entradas_totales'] = $entryStats['entradas_totales'] ?? 0;

            $stmt = $pdo->query('SELECT id, usuario_id, total, estado, fecha_pedido FROM pedidos ORDER BY fecha_pedido DESC LIMIT 5');
            $stats['ultimos_pedidos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            admin_json_response($stats);

        case 'usuarios':
            $stmt = $pdo->query(
                "SELECT
                    u.id,
                    u.nombre_completo,
                    u.correo,
                    u.genero,
                    u.fechaNacimiento,
                    u.rol,
                    COALESCE(ce.contador, 0) AS entradas_usuario
                 FROM usuarios u
                 LEFT JOIN contador_entradas ce
                    ON ce.tipo = 'usuario'
                    AND ce.usuario_id = u.id
                 ORDER BY u.id DESC"
            );
            admin_json_response($stmt->fetchAll(PDO::FETCH_ASSOC));

        case 'viajes':
            $stmt = $pdo->query('SELECT id, titulo, origen, fecha_inicio, precio, plazas, imagen FROM viajes ORDER BY id DESC');
            $trips = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($trips as &$trip) {
                $trip['imagen_preview'] = rv_resolve_image_value($trip['imagen'] ?? null);
                unset($trip['imagen']);
            }
            unset($trip);

            admin_json_response($trips);

        case 'viaje_detalle':
            $id = (int) ($_GET['id'] ?? 0);
            if ($id <= 0) {
                admin_json_response(['error' => 'Viaje no valido.'], 400);
            }

            $stmt = $pdo->prepare(
                'SELECT id, titulo, descripcion, origen, fecha_inicio, fecha_fin, precio, plazas, provincia_id, imagen
                 FROM viajes
                 WHERE id = ?
                 LIMIT 1'
            );
            $stmt->execute([$id]);
            $trip = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$trip) {
                admin_json_response(['error' => 'Viaje no encontrado.'], 404);
            }

            $trip['imagen_preview'] = rv_resolve_image_value($trip['imagen'] ?? null);
            unset($trip['imagen']);

            admin_json_response($trip);

        case 'provincias':
            $stmt = $pdo->query('SELECT id, nombre, descripcion, imagen, created_at FROM provincia ORDER BY id DESC');
            $provinces = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($provinces as &$province) {
                $province['imagen_preview'] = rv_resolve_image_value($province['imagen'] ?? null);
                unset($province['imagen']);
            }
            unset($province);

            admin_json_response($provinces);

        case 'provincia_detalle':
            $id = (int) ($_GET['id'] ?? 0);
            if ($id <= 0) {
                admin_json_response(['error' => 'Provincia no valida.'], 400);
            }

            $stmt = $pdo->prepare(
                'SELECT id, nombre, descripcion, imagen, created_at
                 FROM provincia
                 WHERE id = ?
                 LIMIT 1'
            );
            $stmt->execute([$id]);
            $province = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$province) {
                admin_json_response(['error' => 'Provincia no encontrada.'], 404);
            }

            $province['imagen_preview'] = rv_resolve_image_value($province['imagen'] ?? null);
            unset($province['imagen']);

            admin_json_response($province);

        case 'pedidos':
            $estado = $_GET['estado'] ?? '';
            if ($estado !== '') {
                $stmt = $pdo->prepare('SELECT id, usuario_id, total, estado, direccion_envio, fecha_pedido FROM pedidos WHERE estado = ? ORDER BY fecha_pedido DESC');
                $stmt->execute([$estado]);
            } else {
                $stmt = $pdo->query('SELECT id, usuario_id, total, estado, direccion_envio, fecha_pedido FROM pedidos ORDER BY fecha_pedido DESC');
            }
            admin_json_response($stmt->fetchAll(PDO::FETCH_ASSOC));

        default:
            admin_json_response(['error' => 'Accion no valida.'], 400);
    }
}

if ($method === 'POST') {
    $body = admin_read_request_body();
    $action = $body['accion'] ?? '';

    // Aqui agrupamos altas, ediciones y borrados del panel para no repartir logica por varios archivos.
    switch ($action) {
        case 'crear_usuario':
            if (empty($body['pwd'])) {
                admin_json_response(['error' => 'La contrasena es obligatoria al crear un usuario.'], 400);
            }

            $stmt = $pdo->prepare(
                'INSERT INTO usuarios (nombre_completo, correo, pwd, genero, fechaNacimiento, politica_privacidad, revista, rol, rememberMe)
                 VALUES (?, ?, ?, ?, ?, 1, 0, ?, NULL)'
            );
            $stmt->execute([
                $body['nombre_completo'] ?? '',
                $body['correo'] ?? '',
                password_hash((string) $body['pwd'], PASSWORD_BCRYPT),
                $body['genero'] ?? 'o',
                $body['fechaNacimiento'] ?? '2000-01-01',
                $body['rol'] ?? 'usuario'
            ]);
            admin_json_response(['ok' => true, 'id' => (int) $pdo->lastInsertId()]);

        case 'editar_usuario':
            $id = (int) ($body['id'] ?? 0);
            if ($id <= 0) {
                admin_json_response(['error' => 'Usuario no valido.'], 400);
            }

            if (!empty($body['pwd'])) {
                $stmt = $pdo->prepare('UPDATE usuarios SET nombre_completo = ?, correo = ?, pwd = ?, genero = ?, rol = ? WHERE id = ?');
                $stmt->execute([
                    $body['nombre_completo'] ?? '',
                    $body['correo'] ?? '',
                    password_hash((string) $body['pwd'], PASSWORD_BCRYPT),
                    $body['genero'] ?? 'o',
                    $body['rol'] ?? 'usuario',
                    $id
                ]);
            } else {
                $stmt = $pdo->prepare('UPDATE usuarios SET nombre_completo = ?, correo = ?, genero = ?, rol = ? WHERE id = ?');
                $stmt->execute([
                    $body['nombre_completo'] ?? '',
                    $body['correo'] ?? '',
                    $body['genero'] ?? 'o',
                    $body['rol'] ?? 'usuario',
                    $id
                ]);
            }
            admin_json_response(['ok' => true]);

        case 'crear_viaje':
            $imageBinary = admin_uploaded_image_binary($_FILES['imagen'] ?? null);
            $stmt = $pdo->prepare('INSERT INTO viajes (titulo, descripcion, origen, provincia_id, fecha_inicio, fecha_fin, precio, plazas, imagen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
            $stmt->execute([
                $body['titulo'] ?? '',
                $body['descripcion'] ?? '',
                $body['origen'] ?? '',
                $body['provincia_id'] ?? null,
                $body['fecha_inicio'] ?? null,
                $body['fecha_fin'] ?? null,
                $body['precio'] ?? 0,
                $body['plazas'] ?? 0,
                $imageBinary
            ]);
            admin_json_response(['ok' => true, 'id' => (int) $pdo->lastInsertId()]);

        case 'editar_viaje':
            $id = (int) ($body['id'] ?? 0);
            if ($id <= 0) {
                admin_json_response(['error' => 'Viaje no valido.'], 400);
            }

            $imageBinary = admin_uploaded_image_binary($_FILES['imagen'] ?? null);

            if ($imageBinary !== null) {
                $stmt = $pdo->prepare('UPDATE viajes SET titulo = ?, descripcion = ?, origen = ?, provincia_id = ?, fecha_inicio = ?, fecha_fin = ?, precio = ?, plazas = ?, imagen = ? WHERE id = ?');
                $stmt->execute([
                    $body['titulo'] ?? '',
                    $body['descripcion'] ?? '',
                    $body['origen'] ?? '',
                    $body['provincia_id'] ?? null,
                    $body['fecha_inicio'] ?? null,
                    $body['fecha_fin'] ?? null,
                    $body['precio'] ?? 0,
                    $body['plazas'] ?? 0,
                    $imageBinary,
                    $id
                ]);
            } else {
                $stmt = $pdo->prepare('UPDATE viajes SET titulo = ?, descripcion = ?, origen = ?, provincia_id = ?, fecha_inicio = ?, fecha_fin = ?, precio = ?, plazas = ? WHERE id = ?');
                $stmt->execute([
                    $body['titulo'] ?? '',
                    $body['descripcion'] ?? '',
                    $body['origen'] ?? '',
                    $body['provincia_id'] ?? null,
                    $body['fecha_inicio'] ?? null,
                    $body['fecha_fin'] ?? null,
                    $body['precio'] ?? 0,
                    $body['plazas'] ?? 0,
                    $id
                ]);
            }
            admin_json_response(['ok' => true]);

        case 'crear_provincia':
            $imageBinary = admin_uploaded_image_binary($_FILES['imagen'] ?? null);
            $stmt = $pdo->prepare('INSERT INTO provincia (nombre, descripcion, imagen) VALUES (?, ?, ?)');
            $stmt->execute([
                $body['nombre'] ?? '',
                $body['descripcion'] ?? '',
                $imageBinary
            ]);
            admin_json_response(['ok' => true, 'id' => (int) $pdo->lastInsertId()]);

        case 'editar_provincia':
            $id = (int) ($body['id'] ?? 0);
            if ($id <= 0) {
                admin_json_response(['error' => 'Provincia no valida.'], 400);
            }

            $imageBinary = admin_uploaded_image_binary($_FILES['imagen'] ?? null);

            if ($imageBinary !== null) {
                $stmt = $pdo->prepare('UPDATE provincia SET nombre = ?, descripcion = ?, imagen = ? WHERE id = ?');
                $stmt->execute([
                    $body['nombre'] ?? '',
                    $body['descripcion'] ?? '',
                    $imageBinary,
                    $id
                ]);
            } else {
                $stmt = $pdo->prepare('UPDATE provincia SET nombre = ?, descripcion = ? WHERE id = ?');
                $stmt->execute([
                    $body['nombre'] ?? '',
                    $body['descripcion'] ?? '',
                    $id
                ]);
            }
            admin_json_response(['ok' => true]);

        case 'actualizar_estado_pedido':
            $id = (int) ($body['id'] ?? 0);
            $stmt = $pdo->prepare('UPDATE pedidos SET estado = ? WHERE id = ?');
            $stmt->execute([
                $body['estado'] ?? 'pendiente',
                $id
            ]);
            admin_json_response(['ok' => true]);

        case 'eliminar':
            $type = $body['tipo'] ?? '';
            $id = (int) ($body['id'] ?? 0);
            $tables = [
                'usuario' => 'usuarios',
                'viaje' => 'viajes',
                'provincia' => 'provincia',
                'pedido' => 'pedidos'
            ];

            if (!isset($tables[$type])) {
                admin_json_response(['error' => 'Tipo no valido.'], 400);
            }

            $stmt = $pdo->prepare('DELETE FROM ' . $tables[$type] . ' WHERE id = ?');
            $stmt->execute([$id]);
            admin_json_response(['ok' => true]);

        default:
            admin_json_response(['error' => 'Accion no valida.'], 400);
    }
}

admin_json_response(['error' => 'Metodo no permitido.'], 405);
?>
