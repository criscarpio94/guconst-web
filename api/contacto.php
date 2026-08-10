<?php

//Api para guardar los mensajes del formulario de contacto hacia la base de datos por medio de json y metodo POST
require_once '../configuracion/conexion.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido']);
    exit;
}

$datos = json_decode(file_get_contents('php://input'), true);

if (!$datos) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'Datos inválidos']);
    exit;
}

//Validar todos los campos requeridos
$requeridos = ['nombres_completos', 'correo', 'telefono', 'provincia', 'ciudad', 'asunto', 'mensaje'];
foreach ($requeridos as $campo) {
    if (empty(trim($datos[$campo] ?? ''))) {
        echo json_encode(['exito' => false, 'mensaje' => "El campo '$campo' es obligatorio."]);
        exit;
    }
}

if (!filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['exito' => false, 'mensaje' => 'El correo electrónico no es válido.']);
    exit;
}

try {
    //Limpiar datos antes de guardar
    $nombres   = htmlspecialchars(trim($datos['nombres_completos']), ENT_QUOTES, 'UTF-8');
    $correo    = filter_var(trim($datos['correo']),    FILTER_SANITIZE_EMAIL);
    $telefono  = htmlspecialchars(trim($datos['telefono']),   ENT_QUOTES, 'UTF-8');
    $provincia = htmlspecialchars(trim($datos['provincia']),  ENT_QUOTES, 'UTF-8');
    $ciudad    = htmlspecialchars(trim($datos['ciudad']),     ENT_QUOTES, 'UTF-8');
    $asunto    = htmlspecialchars(trim($datos['asunto']),     ENT_QUOTES, 'UTF-8');
    $mensaje   = htmlspecialchars(trim($datos['mensaje']),    ENT_QUOTES, 'UTF-8');

    $stmt = $conexion->prepare(
        'INSERT INTO mensajes_contacto
            (nombres_completos, correo, telefono, provincia, ciudad, asunto, mensaje)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('sssssss', $nombres, $correo, $telefono, $provincia, $ciudad, $asunto, $mensaje);
    $stmt->execute();
    $stmt->close();

    echo json_encode([
        'exito'   => true,
        'mensaje' => '¡Mensaje enviado! Nos contactaremos contigo pronto.'
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['exito' => false, 'mensaje' => 'Error al guardar: ' . $e->getMessage()]);
}

$conexion->close();
?>