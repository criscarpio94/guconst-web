<?php
//Para recibir y guardar solicitudes de proforma

require_once '../configuracion/conexion.php';

// Solo se permitira metodos POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['exito' => false, 'mensaje' => 'Método no permitido. Use POST.']);
    exit;
}

//Js envia datos en formato json al cuerpo de la peticion

$cuerpo = file_get_contents('php://input');
$datos  = json_decode($cuerpo, true);

if (!$datos) {
    http_response_code(400);
    echo json_encode(['exito' => false, 'mensaje' => 'No se recibieron datos válidos.']);
    exit;
}

//Validacion para cambos obligatorios

$campos_requeridos = ['nombres_completos', 'correo', 'telefono', 'provincia', 'ciudad', 'maquinas'];
foreach ($campos_requeridos as $campo) {
    if (empty($datos[$campo])) {
        echo json_encode(['exito' => false, 'mensaje' => "El campo '$campo' es obligatorio."]);
        exit;
    }
}

//Validador para que las maquinas sean de tipo array o arreglo y que tenga un elemento minimo
if (!is_array($datos['maquinas']) || count($datos['maquinas']) === 0) {
    echo json_encode(['exito' => false, 'mensaje' => 'Selecciona al menos una maquinaria.']);
    exit;
}

//Para validar el formato del correo
if (!filter_var($datos['correo'], FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['exito' => false, 'mensaje' => 'El correo electrónico no tiene un formato válido.']);
    exit;
}

try {
    //Generar un id para la profora para que no se repita en otras solicitudes

    $id_proforma = 'PF-' . date('Ymd') . '-' . date('His') . rand(10, 99);

    //Lipiador de datos 
    
    $nombres   = htmlspecialchars(trim($datos['nombres_completos']), ENT_QUOTES, 'UTF-8');
    $correo    = filter_var(trim($datos['correo']), FILTER_SANITIZE_EMAIL);
    $telefono  = htmlspecialchars(trim($datos['telefono']),   ENT_QUOTES, 'UTF-8');
    $provincia = htmlspecialchars(trim($datos['provincia']),  ENT_QUOTES, 'UTF-8');
    $ciudad    = htmlspecialchars(trim($datos['ciudad']),     ENT_QUOTES, 'UTF-8');
    $mensaje   = htmlspecialchars(trim($datos['mensaje'] ?? ''), ENT_QUOTES, 'UTF-8');

    //Primer paso, guardar los datos del solicitante
    $stmt = $conexion->prepare(
        'INSERT INTO solicitudes_proforma
            (id, nombres_completos, correo, telefono, provincia, ciudad, mensaje)
         VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    
    
    $stmt->bind_param('sssssss', $id_proforma, $nombres, $correo, $telefono, $provincia, $ciudad, $mensaje);
    $stmt->execute();
    $stmt->close();

    //Segundo paso, guardar cada maquina seleccionada
    //Se crea las filas de acuerdo a las maquinas seleccionadas
  
    $stmt_maq = $conexion->prepare(
        'INSERT INTO proforma_maquinaria (proforma_id, maquinaria_id) VALUES (?, ?)'
    );

    foreach ($datos['maquinas'] as $id_maquina) {
        $id_maq = (int) $id_maquina;
        $stmt_maq->bind_param('si', $id_proforma, $id_maq);
        $stmt_maq->execute();
    }
    $stmt_maq->close();

    echo json_encode([
        'exito'       => true,
        'mensaje'     => '¡Solicitud enviada! Nos contactaremos contigo pronto.',
        'id_proforma' => $id_proforma
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'exito'   => false,
        'mensaje' => 'Error al guardar la solicitud: ' . $e->getMessage()
    ]);
}

$conexion->close();
?>