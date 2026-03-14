<?php
header('Content-Type: application/json; charset=utf-8');
require_once __DIR__ . '/../Formulario/php/conexiones.php';

$sql = "SELECT p.id, p.nombre, p.descripcion, p.imagen, COUNT(v.id) AS viajes_count
    FROM provincia p
    LEFT JOIN viajes v ON v.provincia_id = p.id
    GROUP BY p.id, p.nombre, p.descripcion, p.imagen
    ORDER BY p.nombre";

$result = mysqli_query($conexion, $sql);
if (!$result) {
    error_log('get_provincias.php SQL error: ' . mysqli_error($conexion));
    echo json_encode([]);
    exit;
}
$provincias = [];

while ($row = mysqli_fetch_assoc($result)) {
    $img = null;
    if (!is_null($row['imagen']) && $row['imagen'] !== '') {
        $val = $row['imagen'];
        // Detectar contenido binario (longblob) vs texto (ruta)
        $isBinary = preg_match('/[\x00-\x08\x0E-\x1F]/', $val);
        if ($isBinary) {
            $img = 'data:image/jpeg;base64,' . base64_encode($val);
        } else {
            // Si parece una ruta (contiene '/' o empieza por 'img/' o por protocolo), usarla tal cual
            if (preg_match('/^(https?:\/\/|\.\/|\/|img\/|[A-Za-z0-9_\-]+\/)/', $val) || preg_match('/\.[a-zA-Z0-9]{2,4}$/', $val)) {
                $img = $val;
            } else {
                // Fallback: tratar como blob
                $img = 'data:image/jpeg;base64,' . base64_encode($val);
            }
        }
    }

    $provincias[] = [
        'id' => (int)$row['id'],
        'nombre' => $row['nombre'],
        'descripcion' => $row['descripcion'],
        'imagen' => $img,
        'viajes_count' => (int)$row['viajes_count']
    ];
}

echo json_encode($provincias);
?>