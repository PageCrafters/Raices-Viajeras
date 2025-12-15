<?php
include 'dbconnect.php';
if (isset($conn) && !$conn->connect_error) {
    echo 'Conexión exitosa a la base de datos.';
} else {
    echo 'Error de conexión: ' . $conn->connect_error;
}
?>