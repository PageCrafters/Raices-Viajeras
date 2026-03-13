<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../Formulario/php/conexiones.php';

$provId = 0;
// Aceptar `provincia_id` (recomendado) o `provincia` (puede ser id o nombre)
if (isset($_GET['provincia_id'])) {
    $provId = (int)$_GET['provincia_id'];
} elseif (isset($_GET['provincia'])) {
    $p = $_GET['provincia'];
    if (is_numeric($p)) {
        $provId = (int)$p;
    } else {
        // Buscar id por nombre (case-insensitive)
        $sqlp = "SELECT id FROM provincia WHERE LOWER(nombre) = LOWER(?) LIMIT 1";
        $stmtp = mysqli_prepare($conexion, $sqlp);
        mysqli_stmt_bind_param($stmtp, 's', $p);
        mysqli_stmt_execute($stmtp);
        $resp = mysqli_stmt_get_result($stmtp);
        $prow = mysqli_fetch_assoc($resp);
        $provId = $prow ? (int)$prow['id'] : 0;
    }
}

if ($provId <= 0) {
    echo json_encode([]);
    exit;
}

$sql = "SELECT id, titulo, descripcion, imagen, precio FROM viajes WHERE provincia_id = ? ORDER BY id";
$stmt = mysqli_prepare($conexion, $sql);
mysqli_stmt_bind_param($stmt, 'i', $provId);
mysqli_stmt_execute($stmt);
 $res = mysqli_stmt_get_result($stmt);
$viajes = [];
while ($row = mysqli_fetch_assoc($res)) {
    $img = null;
    if (!is_null($row['imagen']) && $row['imagen'] !== '') {
        $val = $row['imagen'];
        $isBinary = preg_match('/[\x00-\x08\x0E-\x1F]/', $val);
        if ($isBinary) {
            $img = 'data:image/jpeg;base64,' . base64_encode($val);
        } else {
            if (preg_match('/^(https?:\/\/|\.\/|\/|img\/|[A-Za-z0-9_\-]+\/)/', $val) || preg_match('/\.[a-zA-Z0-9]{2,4}$/', $val)) {
                $img = $val;
            } else {
                $img = 'data:image/jpeg;base64,' . base64_encode($val);
            }
        }
    }

    $viajes[] = [
        'id' => (int)$row['id'],
        'titulo' => $row['titulo'],
        'descripcion' => $row['descripcion'],
        'imagen' => $img,
        'precio' => $row['precio']
    ];
}

echo json_encode($viajes);
?>