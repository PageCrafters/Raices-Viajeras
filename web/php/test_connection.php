<?php
include 'dbconnect.php';
if (isset($conn) && !$conn->connect_error) {
    echo 'Conexión exitosa a la base de datos.';
    $query = "SELECT * FROM usuarios";
    $result = $conn->query($query);
    echo $result->num_rows . ' registros encontrados en la tabla usuarios.';
    //insertar usuario de prueba
    $insert_query = "INSERT INTO usuarios VALUES (NULL)";
    if ($conn->query($insert_query) === TRUE) {
        echo ' Usuario de prueba insertado correctamente.';
    } else {
        echo ' Error al insertar el usuario de prueba: ' . $conn->error;
    }
} else {
    echo 'Error de conexión: ' . $conn->connect_error;
}
?>