// LOGICA PARA LA PANTALLA DE INCIO, SE EJECUTA LUEGO DEL HTML
// LLAMA A API Y MUESTRA ESTADISTICAS REALES CONECTANDOSE A LA BDD 
// ASIGNA EVENTOS A LOS BOTONES


(function () {
    'use strict';

    //LLAMADA A LA API DE INICIO
    async function cargarDatosInicio() {
        try {
            const respuesta = await fetch('api/inicio.php');

            if (!respuesta.ok) {
                throw new Error('HTTP ' + respuesta.status);
            }

            const datos = await respuesta.json();

            if (!datos.exito) {
                throw new Error(datos.mensaje || 'Error desconocido');
            }

            //ACTUALIZAR ESTADISTICAS
            actualizarEstadisticas(datos.estadisticas);

            //INDICADOR DE LA CONEXION A LA BASE DE DATOS
            actualizarIndicadorBD(true, 'BD Conectada');

            console.log('✅ API inicio.php respondió correctamente:', datos);

        } catch (error) {
            console.error('❌ Error al llamar a api/inicio.php:', error.message);
            actualizarIndicadorBD(false, 'Error BD');

            //RESPALDO SI LA API FALLA
            actualizarEstadisticas({
                anios_experiencia:    7,
                total_maquinaria:     8,
                maquinaria_disponible: 7,
                total_proyectos:      6
            });
        }
    }

    //ACTUALIZAR NUMEROS EN PANTALLA
    function actualizarEstadisticas(estadisticas) {
        const mapa = {
            'stat-anios':      estadisticas.anios_experiencia    || 7,
            'stat-maquinaria': estadisticas.total_maquinaria     || 8,
            'stat-proyectos':  estadisticas.total_proyectos      || 50,
            'stat-clientes':   100, 
        };

        Object.entries(mapa).forEach(([id, objetivo]) => {
            const elemento = document.getElementById(id);
            if (elemento) {
                animarContador(elemento, 0, objetivo, 2000);
            }
        });
    }

    //ANIMACION PARA EL CONTADOR NUMERICO
    function animarContador(elemento, inicio, fin, duracionMs) {
        const inicioTiempo = performance.now();
        const sufijo = elemento.dataset.sufijo || '';

        function paso(tiempoActual) {
            const transcurrido = tiempoActual - inicioTiempo;
            const progreso     = Math.min(transcurrido / duracionMs, 1);

            // Función de easing (desaceleraciOn suave)
            const eased  = 1 - Math.pow(1 - progreso, 3);
            const valor  = Math.floor(eased * (fin - inicio) + inicio);

            elemento.textContent = valor + sufijo;

            if (progreso < 1) {
                requestAnimationFrame(paso);
            } else {
                elemento.textContent = fin + sufijo;
            }
        }

        requestAnimationFrame(paso);
    }

    //PARA ACTIVAR LA ANIMACION CUANDO LA SECCION SE MUESTRE
    function observarEstadisticas() {
        const seccion = document.getElementById('seccion-estadisticas');
        if (!seccion) return;

        let animado = false;

        const observador = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (entrada) {
                if (entrada.isIntersecting && !animado) {
                    animado = true;
                    cargarDatosInicio();
                    observador.disconnect();
                }
            });
        }, { threshold: 0.3 });

        observador.observe(seccion);
    }

    //ACTUALIZADOR DEL INDICADOR VISUAL DE LA BASE DE DATOS
    function actualizarIndicadorBD(conectado, texto) {
        const indicador = document.getElementById('indicador-bd');
        if (!indicador) return;

        indicador.className = 'indicador-bd ' + (conectado ? 'conectado' : 'error');
        indicador.innerHTML = `
            <span class="indicador-bd-punto"></span>
            <span>${texto}</span>
        `;
    }

    //EVENTOS PARA LOS BOTONES DE LA VISTA
    function asignarEventos() {
        //BOTON SERVICIOS
        const btnServicios = document.getElementById('btn-ir-servicios');
        if (btnServicios) {
            btnServicios.addEventListener('click', function () {
                if (typeof navegarA === 'function') navegarA('servicios');
            });
        }

        //BOTON SOLICITAR PROFORMA
        const btnProforma = document.getElementById('btn-ir-proforma');
        if (btnProforma) {
            btnProforma.addEventListener('click', function () {
                if (typeof navegarA === 'function') navegarA('servicios');
            });
        }

        //BOTON CONTACTENOS
        const btnContacto = document.getElementById('btn-ir-contacto');
        if (btnContacto) {
            btnContacto.addEventListener('click', function () {
                if (typeof navegarA === 'function') navegarA('contacto');
            });
        }
    }

    //FUNCION PARA INICIAR O PUNTO DE ENTRADA
    function iniciar() {
        asignarEventos();
        observarEstadisticas();
    }

    //EJECUCION
    iniciar();

})();