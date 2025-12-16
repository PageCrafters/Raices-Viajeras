<?php
require_once 'dbconnect.php';

try {
    $result = $conn->query("SHOW TABLES");
    echo "Tablas en la base de datos:\n";
    while ($row = $result->fetch_array()) {
        echo $row[0] . "\n";
    }
} catch (mysqli_sql_exception $e) {
    echo "Error: " . $e->getMessage();
}

$conn->close();
?>