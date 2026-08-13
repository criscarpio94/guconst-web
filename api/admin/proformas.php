<?php

//Api para que el administrador pueda ver las solicitudes de proformas y cambiar el estado pendiente, atendida, rechazada
session_start();

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, OPTIONS');
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

//METODO GET para listar las solicitud de profromas
if ($metodo === 'GET') {
   
    //Se conbina 3 tablas, solicitudes_proforma, proforma_maquinaria y maquinaria y agrupa toda la maquinaria en una proforma
    $sql = "
        SELECT
            sp.id, sp.nombres_completos, sp.correo, sp.telefono,
            sp.provincia, sp.ciudad, sp.mensaje, sp.estado,
            DATE_FORMAT(sp.creado_en, '%d/%m/%Y %H:%i') AS fecha,
            GROUP_CONCAT(
                CONCAT(m.nombre, ' (', m.marca, ' ', m.modelo, ')')
                SEPARATOR ' | '
            ) AS maquinas_lista
        FROM solicitudes_proforma sp
        LEFT JOIN proforma_maquinaria pm ON sp.id  = pm.proforma_id
        LEFT JOIN maquinaria m           ON pm.maquinaria_id = m.id
        GROUP BY sp.id
        ORDER BY sp.creado_en DESC
    ";

    $resultado = $conexion->query($sql);
    $proformas = [];
    while ($fila = $resultado->fetch_assoc()) {
        $proformas[] = $fila;
    }

    echo json_encode(['exito' => true, 'datos' => $proformas, 'total' => count($proformas)],
                     JSON_UNESCAPED_UNICODE);
}

//METODO PUT, para cambiar de estado a la solicitud de proforma
elseif ($metodo === 'PUT') {
    $datos = json_decode(file_get_contents('php://input'), true);

    if (empty($datos['id']) || empty($datos['estado'])) {
        echo json_encode(['exito' => false, 'mensaje' => 'Se requiere id y estado.']);
        $conexion->close(); exit;
    }

    $estados_validos = ['pendiente', 'atendida', 'rechazada'];
    if (!in_array($datos['estado'], $estados_validos)) {
        echo json_encode(['exito' => false, 'mensaje' => 'Estado no válido.']);
        $conexion->close(); exit;
    }

    $id     = $datos['id'];
    $estado = $datos['estado'];

    $stmt = $conexion->prepare('UPDATE solicitudes_proforma SET estado = ? WHERE id = ?');
    $stmt->bind_param('ss', $estado, $id);
    $stmt->execute();
    $stmt->close();

    echo json_encode(['exito' => true, 'mensaje' => 'Estado actualizado.']);
}

$conexion->close();
?>