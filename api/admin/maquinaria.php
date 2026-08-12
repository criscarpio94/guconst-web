<?php

//CRUD para la gestion de maquinaria por metodos GET, POST, PUT Y DELETE
session_start();

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// Verificar que el administrador tenga una sesión activa
if (empty($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode(['exito' => false, 'mensaje' => 'No autorizado. Inicia sesión.']);
    exit;
}

require_once '../../configuracion/conexion.php';

$metodo = $_SERVER['REQUEST_METHOD'];

//METODO GET: Para listar la maquinaria de la bdd
if ($metodo === 'GET') {
    $resultado = $conexion->query('SELECT * FROM maquinaria ORDER BY nombre ASC');
    $maquinas  = [];
    while ($fila = $resultado->fetch_assoc()) {
        $fila['disponible'] = (bool) $fila['disponible'];
        $maquinas[] = $fila;
    }
    echo json_encode(['exito' => true, 'datos' => $maquinas], JSON_UNESCAPED_UNICODE);
    $conexion->close();
    exit;
}

//METODO POST, PUT Y DELETE
$datos = json_decode(file_get_contents('php://input'), true);

//POST para crear una nueva maquinaria
if ($metodo === 'POST') {
    $campos = ['nombre','tipo','marca','modelo','potencia','peso','categoria','descripcion','imagen_url'];
    foreach ($campos as $c) {
        if (empty($datos[$c])) {
            echo json_encode(['exito' => false, 'mensaje' => "El campo '$c' es obligatorio."]);
            $conexion->close(); exit;
        }
    }

    $disponible = isset($datos['disponible']) ? (int)$datos['disponible'] : 1;

    $stmt = $conexion->prepare(
        'INSERT INTO maquinaria (nombre, tipo, marca, modelo, potencia, peso, categoria, descripcion, imagen_url, disponible)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $stmt->bind_param('sssssssssi',
        $datos['nombre'], $datos['tipo'], $datos['marca'], $datos['modelo'],
        $datos['potencia'], $datos['peso'], $datos['categoria'],
        $datos['descripcion'], $datos['imagen_url'], $disponible
    );
    $stmt->execute();
    $nuevo_id = $conexion->insert_id;
    $stmt->close();

    echo json_encode(['exito' => true, 'mensaje' => 'Maquinaria creada.', 'id' => $nuevo_id]);
}

//PUT para actualizar datos de la maquinaria
elseif ($metodo === 'PUT') {
    if (empty($datos['id'])) {
        echo json_encode(['exito' => false, 'mensaje' => 'Se requiere el ID.']);
        $conexion->close(); exit;
    }

    $disponible = isset($datos['disponible']) ? (int)$datos['disponible'] : 1;
    $id         = (int) $datos['id'];

    $stmt = $conexion->prepare(
        'UPDATE maquinaria SET nombre=?, tipo=?, marca=?, modelo=?, potencia=?, peso=?,
         categoria=?, descripcion=?, imagen_url=?, disponible=? WHERE id=?'
    );
    $stmt->bind_param('sssssssssii',
        $datos['nombre'], $datos['tipo'], $datos['marca'], $datos['modelo'],
        $datos['potencia'], $datos['peso'], $datos['categoria'],
        $datos['descripcion'], $datos['imagen_url'], $disponible, $id
    );
    $stmt->execute();
    $stmt->close();

    echo json_encode(['exito' => true, 'mensaje' => 'Maquinaria actualizada.']);
}

//DELETE para eliminar maquinaria de la bdd
elseif ($metodo === 'DELETE') {
    if (empty($datos['id'])) {
        echo json_encode(['exito' => false, 'mensaje' => 'Se requiere el ID.']);
        $conexion->close(); exit;
    }

    $id   = (int) $datos['id'];
    $stmt = $conexion->prepare('DELETE FROM maquinaria WHERE id = ?');
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['exito' => true, 'mensaje' => 'Maquinaria eliminada.']);
}

$conexion->close();
?>