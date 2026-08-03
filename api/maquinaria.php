<?php
// Devuelve el catálogo de maquinaria desde MySQL en formato JSON.
 
require_once '../configuracion/conexion.php';

$respuesta = ['exito' => true, 'datos' => [], 'total' => 0];

try {
    //Construccion de consulta SQL de forma dinamica. 
    
    $condiciones = ['1=1'];
    $parametros  = [];
    $tipos       = '';

    // Si viene ?categoria=NombreCategoria y nulo y no es "Todas"
    
    if (!empty($_GET['categoria']) && $_GET['categoria'] !== 'Todas') {
        $condiciones[] = 'categoria = ?'; 
        $parametros[]  = $_GET['categoria'];
        $tipos        .= 's';
    }

    $sql = 'SELECT * FROM maquinaria WHERE '
         . implode(' AND ', $condiciones)
         . ' ORDER BY nombre ASC';

    $stmt = $conexion->prepare($sql);

    // Solo si hay filtros, se realiza el enalce
    if (!empty($parametros)) {
        $stmt->bind_param($tipos, ...$parametros);
    }

    $stmt->execute();
    $resultado = $stmt->get_result();

    $maquinas = [];
    while ($fila = $resultado->fetch_assoc()) {
        // Convertimos 0/1 de MySQL a true/false de JavaScript
        $fila['disponible'] = (bool) $fila['disponible'];
        $maquinas[] = $fila;
    }

    $respuesta['datos'] = $maquinas;
    $respuesta['total'] = count($maquinas);
    $stmt->close();

} catch (Exception $e) {
    $respuesta['exito']   = false;
    $respuesta['mensaje'] = 'Error al obtener maquinaria: ' . $e->getMessage();
    http_response_code(500);
}

$conexion->close();

// json conserva tildes
echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);
?>