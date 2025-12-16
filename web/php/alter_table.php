<?php
/* Script para crear o alterar la tabla usuarios */

require_once 'dbconnect.php';

try {
    // Intentar crear la tabla usuarios
    $sql_create = "CREATE TABLE usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        contrasenia VARCHAR(255) NOT NULL,
        tipo_viaje VARCHAR(50) NOT NULL,
        notificaciones BOOLEAN DEFAULT FALSE
    )";

    if ($conn->query($sql_create) === TRUE) {
        echo "Tabla usuarios creada exitosamente.";
    } else {
        // Si falla, intentar alterar
        $alter_queries = [
            "ALTER TABLE usuarios ADD nombre VARCHAR(255) NOT NULL",
            "ALTER TABLE usuarios ADD email VARCHAR(255) NOT NULL",
            "ALTER TABLE usuarios ADD contrasenia VARCHAR(255) NOT NULL",
            "ALTER TABLE usuarios ADD tipo_viaje VARCHAR(50) NOT NULL",
            "ALTER TABLE usuarios ADD notificaciones BOOLEAN DEFAULT FALSE"
        ];

        foreach ($alter_queries as $sql) {
            try {
                $conn->query($sql);
            } catch (mysqli_sql_exception $e) {
                // Ignorar si la columna ya existe
                if (strpos($e->getMessage(), 'Duplicate column name') === false) {
                    throw $e;
                }
            }
        }

        // Agregar UNIQUE a email si no lo tiene
        try {
            $conn->query("ALTER TABLE usuarios ADD UNIQUE (email)");
        } catch (mysqli_sql_exception $e) {
            // Ignorar si ya es único
        }

        echo "Columnas agregadas a la tabla usuarios exitosamente.";
    }
} catch (mysqli_sql_exception $e) {
    echo "Error: " . $e->getMessage();
}

$conn->close();
?></content>
<parameter name="filePath">d:\2 DAW\CLIENTE\Raices-Viajeras\web\php\alter_table.php