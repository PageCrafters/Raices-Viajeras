<?php
/* Conexión con la base de datos Railway (MySQL) */

$host = "trolley.proxy.rlwy.net";
$user = "root";
$pass = "RNFiYiZdYGKjqLpOFuSphIcSiHOcmiiz";
$db   = "railway";
$port = 21188;

mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = new mysqli($host, $user, $pass, $db, $port);
    $conn->set_charset("utf8mb4");
} catch (mysqli_sql_exception $e) {
    die("Error de conexión: " . $e->getMessage());
}
?>
