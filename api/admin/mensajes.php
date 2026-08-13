<?php

//Para revisar mensajes en el panel de administradores utiliza metodos GET, PUT Y DELETE
session_start();

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'No autorizado.']);
    exit;
}

require_once '../../configuracion/conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'GET') {
    $resultado = $conexion->query(
        "SELECT *, DATE_FORMAT(creado_en, '%d/%m/%Y %H:%i') AS fecha
         FROM mensajes_contacto ORDER BY leido ASC, creado_en DESC"
    );
    $mensajes = [];
    while ($fila = $resultado->fetch_assoc()) {
        $fila['leido'] = (bool) $fila['leido'];
        $mensajes[] = $fila;
    }

    echo json_encode([
        'exito'     => true,
        'datos'     => $mensajes,
        'total'     => count($mensajes),
        'no_leidos' => count(array_filter($mensajes, fn($m) => !$m['leido']))
    ], JSON_UNESCAPED_UNICODE);
}

elseif ($metodo === 'PUT') {
    $datos = json_decode(file_get_contents('php://input'), true);
    if (empty($datos['id'])) {
        echo json_encode(['exito' => false, 'mensaje' => 'ID requerido.']);
        $conexion->close(); exit;
    }
    $id    = (int) $datos['id'];
    $leido = isset($datos['leido']) ? (int)(bool)$datos['leido'] : 1;
    $stmt  = $conexion->prepare('UPDATE mensajes_contacto SET leido = ? WHERE id = ?');
    $stmt->bind_param('ii', $leido, $id);
    $stmt->execute();
    $stmt->close();
    echo json_encode(['exito' => true]);
}

elseif ($metodo === 'DELETE') {
    $datos = json_decode(file_get_contents('php://input'), true);
    if (empty($datos['id'])) {
        echo json_encode(['exito' => false, 'mensaje' => 'ID requerido.']);
        $conexion->close(); exit;
    }
    $id   = (int) $datos['id'];
    $stmt = $conexion->prepare('DELETE FROM mensajes_contacto WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    echo json_encode(['exito' => true, 'mensaje' => 'Mensaje eliminado.']);
}

$conexion->close();
?>