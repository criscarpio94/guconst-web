<?php

// Archivo conexion.php para conectar a la base de datos, conectandose con los archivos de la carpeta api


// Cabeceras: se indica que las respuestas seran en formato JSON
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Condicional para verificar si es una peticion
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$servidor = $_SERVER['SERVER_NAME'] ?? '';


//Ajuste para detectar automaticamente el entorno 
if (strpos($servidor, 'localhost') !== false || $servidor == '127.0.0.1') {
   
    //Si la condicion se cumple se define los parametros de conexion para XAMMP de manera local
    define('BD_HOST', 'localhost');
    define('BD_USUARIO', 'root');
    define('BD_CONTRASENIA', '');
    define('BD_NOMBRE', 'guconst_db');
} else {
    
    //caso contrario se crean los parametros para conexion a hosting, hostinger    
    define('BD_HOST', 'localhost');
    define('BD_USUARIO', 'u613566817_admin_guconst');
    define('BD_CONTRASENIA', 'Guconstweb2026');
    define('BD_NOMBRE', 'u613566817_guconst_db');    
}

define('BD_CHARSET', 'utf8mb4');

//Creacion de la conexion con MySqli
$conexion = new mysqli(BD_HOST, BD_USUARIO, BD_CONTRASENIA, BD_NOMBRE);

//Condicion para comprobar si hubo algun error al momento de conectar
if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode([
        'exito'   => false,
        'mensaje' => 'Error de conexión a la base de datos: ' . $conexion->connect_error,
        'codigo'  => $conexion->connect_error
    ]);
    exit; // Si no hay conexion se detiene la ejecucion
}

//Caracteres para que se pueda utilizar la ñ
$conexion->set_charset(BD_CHARSET);
?>