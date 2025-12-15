/* Conexión con la base de datos */
<?php
    $host = "localhost";
    $user = "root";
    $pass = "";
    $dbname = "raices_viajeras";

    $conn = new mysqli($host, $user, $pass, $dbname);

    /*Conexión usando try catch*/
    try {
        if ($conn->connect_error) {
            throw new Exception("Error de conexión: " . $conn->connect_error);
        }
    } catch (Exception $e) {
        echo $e->getMessage();
    }
    
?>