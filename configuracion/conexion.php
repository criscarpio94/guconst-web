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

//Definicion deparametros de conexion con xamp
define('BD_HOST',       'localhost');
define('BD_USUARIO',    'root');
define('BD_CONTRASENIA', '');          // ojo xamp no requiere contraseña
define('BD_NOMBRE',     'guconst_db');
define('BD_CHARSET',    'utf8mb4');


//Creacion de la conexion con MySqli
$conexion = new mysqli(BD_HOST, BD_USUARIO, BD_CONTRASENIA, BD_NOMBRE);

//Condicion para compromar si hubo algun error al momento de conectar
if ($conexion->connect_error) {
    http_response_code(500);
    echo json_encode([
        'exito'   => false,
        'mensaje' => 'Error de conexión a la base de datos: ' . $conexion->connect_error,
        'codigo'  => $conexion->connect_errno
    ]);
    exit; // Si no hay conexion se detiene la ejecucion
}

//Caracteres para que se pueda utilizar la ñ
$conexion->set_charset(BD_CHARSET);
?>