
(function () {
    'use strict';
   
    const estado = {
        maquinas:         [],     // Todas las máquinas recibidas del servidor
        seleccionadas:    [],     // IDs (números) de las máquinas que el usuario eligió
        categoriaActual:  'Todas' // Filtro de categoría activo
    };

    // Inicio
    async function iniciarServicios() {
        iniciarTabs();
        asignarEventosBotones();
        await cargarMaquinaria();
    }

    
    //Funcion para cambiar entre servicios de ingenieria civil y Maquinaria
    function iniciarTabs() {
        document.querySelectorAll('.tab-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                const tabDestino = this.dataset.tab;

                //Para quitar "activo" de todos los botones y paneles
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('activo'));
                document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('activo'));

                //Activar el botón clickeado y su panel correspondiente
                this.classList.add('activo');
                document.getElementById('panel-' + tabDestino).classList.add('activo');
            });
        });

        //Boton para "Ver catálogo de maquinaria" del panel civil
        const btnCatalogo = document.getElementById('btn-ir-catalogo');
        if (btnCatalogo) {
            btnCatalogo.addEventListener('click', function () {                
                document.querySelector('[data-tab="maquinaria"]').click();
            });
        }
    }

    
    //Para sincronizar o cargar la maquinaria desde la api
    async function cargarMaquinaria() {
        const contenedor = document.getElementById('grilla-maquinaria');

        // Mostrar grafico de  carga
        contenedor.innerHTML = `
            <div class="cargando-maquinas">
                <div class="spinner"></div>
                <p>Cargando catálogo desde la base de datos...</p>
            </div>
        `;

        try {
            
            // Fetch para hacer una peticion al servidor
            const respuesta = await fetch('api/maquinaria.php');

            if (!respuesta.ok) {
                throw new Error('El servidor respondió con error ' + respuesta.status);
            }

            
            //Convertir el texto en json
            const json = await respuesta.json();

            if (!json.exito) {
                throw new Error(json.mensaje || 'Error desconocido en la API');
            }

            //Guardar las máquinas en el estado de manera global
            estado.maquinas = json.datos;

            //Para actualizar el contador de equipos disponibles
            const disponibles = estado.maquinas.filter(m => m.disponible).length;
            const textoTotal  = document.getElementById('texto-total-maquinas');
            if (textoTotal) {
                textoTotal.textContent =
                    `${estado.maquinas.length} equipos en catálogo · ${disponibles} disponibles`;
            }

            //Mostrar las tarjetas
            renderizarMaquinas(estado.maquinas);

        } catch (error) {
            console.error('Error al cargar maquinaria:', error);
            contenedor.innerHTML = `
                <div class="sin-resultados">
                    <p>⚠️ No se pudo cargar el catálogo.</p>
                    <p style="font-size:0.8rem; margin-top:0.5rem; color:#9CA3AF">
                        Verifica que MySQL esté activo y la base de datos creada.
                    </p>
                </div>
            `;
        }
    }

    
    //Funcion para renderizar las tarjetas
    function renderizarMaquinas(maquinas) {
        const contenedor = document.getElementById('grilla-maquinaria');

        if (!maquinas || maquinas.length === 0) {
            contenedor.innerHTML = '<p class="sin-resultados">No hay equipos en esta categoría.</p>';
            return;
        }

        
        //Recorrer los arreglos de cada maquina y convertirlos a html
        contenedor.innerHTML = maquinas.map(m => construirTarjetaMaquina(m)).join('');
    }

    function construirTarjetaMaquina(maquina) {
        const id           = parseInt(maquina.id);
        const seleccionada = estado.seleccionadas.includes(id);
        const claseBase    = seleccionada ? 'maquina-tarjeta seleccionada' : 'maquina-tarjeta';

        return `
            <article class="${claseBase}" id="maquina-${id}">

                <div class="maquina-imagen-wrap">
                    <img
                        src="${maquina.imagen_url}"
                        alt="${maquina.nombre}"
                        loading="lazy"
                        onerror="this.src=''; this.style.background='#E5E7EB'; this.alt='Sin imagen';"
                    >
                    ${!maquina.disponible
                        ? '<div class="maquina-no-disponible">NO DISPONIBLE</div>'
                        : ''}
                    ${seleccionada
                        ? '<div class="maquina-check">✓</div>'
                        : ''}
                </div>

                <div class="maquina-cuerpo">
                    <div class="maquina-cabecera">
                        <h3 class="maquina-nombre">${maquina.nombre}</h3>
                        <span class="maquina-categoria-badge">${maquina.categoria}</span>
                    </div>

                    <p class="maquina-descripcion">${maquina.descripcion}</p>

                    <dl class="maquina-specs">
                        <div class="spec"><dt>Marca</dt><dd>${maquina.marca}</dd></div>
                        <div class="spec"><dt>Modelo</dt><dd>${maquina.modelo}</dd></div>
                        <div class="spec"><dt>Tipo</dt><dd>${maquina.tipo}</dd></div>
                        <div class="spec"><dt>Potencia</dt><dd>${maquina.potencia}</dd></div>
                    </dl>

                    <button
                        class="btn-agregar-proforma ${seleccionada ? 'seleccionado' : ''} ${!maquina.disponible ? 'no-disponible-btn' : ''}"
                        onclick="toggleSeleccion(${id})"
                        ${!maquina.disponible ? 'disabled' : ''}
                    >
                        ${seleccionada ? '✓ SELECCIONADO' : 'AGREGAR A PROFORMA'}
                    </button>
                </div>

            </article>
        `;
    }

    
    //Para seleccionar la maquinaria para la proforma
    window.toggleSeleccion = function (idMaquina) {
        const id     = parseInt(idMaquina);
        const indice = estado.seleccionadas.indexOf(id);

        if (indice === -1) {
            estado.seleccionadas.push(id);      
        } else {
            estado.seleccionadas.splice(indice, 1);
        }

      
        const maquina = estado.maquinas.find(m => parseInt(m.id) === id);
        if (maquina) {
            const tarjetaAntigua = document.getElementById('maquina-' + id);
            if (tarjetaAntigua) {
                tarjetaAntigua.outerHTML = construirTarjetaMaquina(maquina);
            }
        }

        actualizarBarraProforma();
    };

    window.limpiarSeleccion = function () {
        estado.seleccionadas = [];
        renderizarMaquinas(
            estado.categoriaActual === 'Todas'
                ? estado.maquinas
                : estado.maquinas.filter(m => m.categoria === estado.categoriaActual)
        );
        actualizarBarraProforma();
    };

    function actualizarBarraProforma() {
        const barra    = document.getElementById('barra-proforma');
        const contador = document.getElementById('contador-seleccion');

        if (!barra) return;

        contador.textContent = estado.seleccionadas.length;

        // Mostrar y ocultar la barra con clase CSS
        if (estado.seleccionadas.length > 0) {
            barra.classList.add('visible');
        } else {
            barra.classList.remove('visible');
        }
    }

  
    //Para filtrar por categoria
    window.filtrarCategoria = function (categoria) {
        estado.categoriaActual = categoria;

        //Aactualizador de estado visual para los botones de filtro
        document.querySelectorAll('.filtro-btn').forEach(function (btn) {
            btn.classList.toggle('activo', btn.dataset.categoria === categoria);
        });


        const filtradas = categoria === 'Todas'
            ? estado.maquinas
            : estado.maquinas.filter(m => m.categoria === categoria);

        renderizarMaquinas(filtradas);
    };

    
    //Modal de la proforma
    window.cerrarModal = function () {
        document.getElementById('modal-proforma').classList.remove('visible');
        document.body.style.overflow = '';
    };

    function abrirModal() {
        const modal          = document.getElementById('modal-proforma');
        const listaMaquinas  = document.getElementById('lista-maquinas-modal');
        const numMaquinas    = document.getElementById('modal-num-maquinas');

        //Para Obtener los datos de las máquinas seleccionadas
        const seleccionadas = estado.maquinas.filter(
            m => estado.seleccionadas.includes(parseInt(m.id))
        );

        //Para Mostrar lista de máquina
        listaMaquinas.innerHTML = seleccionadas
            .map(m => `<li>• ${m.nombre} — ${m.marca} ${m.modelo}</li>`)
            .join('');

        if (numMaquinas) numMaquinas.textContent = seleccionadas.length;

        
        document.getElementById('estado-formulario').style.display = 'block';
        document.getElementById('estado-exito').style.display = 'none';

        modal.classList.add('visible');
        document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
    }

    //Para el envio de la proforma

    async function enviarProforma(evento) {
        evento.preventDefault();

        const btnEnviar  = document.getElementById('btn-enviar-proforma');
        const divError   = document.getElementById('proforma-error');

        //Deshabilitar botón mientras se procesa el envio
        btnEnviar.disabled    = true;
        btnEnviar.textContent = 'ENVIANDO...';
        divError.style.display = 'none';

        //Capturar datos del formulario
        const datos = {
            nombres_completos: document.getElementById('pf-nombres').value.trim(),
            correo:            document.getElementById('pf-correo').value.trim(),
            telefono:          document.getElementById('pf-telefono').value.trim(),
            provincia:         document.getElementById('pf-provincia').value,
            ciudad:            document.getElementById('pf-ciudad').value.trim(),
            mensaje:           document.getElementById('pf-mensaje').value.trim(),
            maquinas:          estado.seleccionadas
        };

        try {
          
            //Se envia los datos en formato json hacia el servidor con POST
            const respuesta = await fetch('api/proforma.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body:    JSON.stringify(datos)
            });

            const json = await respuesta.json();

            if (json.exito) {
                //Para Mostrar pantalla de éxito
                document.getElementById('estado-formulario').style.display = 'none';
                document.getElementById('estado-exito').style.display = 'block';

                estado.seleccionadas = [];
                actualizarBarraProforma();
                document.getElementById('form-proforma').reset();
                renderizarMaquinas(estado.maquinas);

                console.log('✅ Proforma guardada con ID:', json.id_proforma);

            } else {
                // Mostrar el error que devuelve la API
                divError.textContent   = json.mensaje;
                divError.style.display = 'block';
                btnEnviar.disabled     = false;
                btnEnviar.textContent  = 'ENVIAR SOLICITUD DE PROFORMA';
            }

        } catch (error) {
            console.error('Error al enviar proforma:', error);
            divError.textContent   = 'Error de conexión. Verifica tu internet e intenta nuevamente.';
            divError.style.display = 'block';
            btnEnviar.disabled     = false;
            btnEnviar.textContent  = 'ENVIAR SOLICITUD DE PROFORMA';
        }
    }

  
    //Para eventos de los botones
    function asignarEventosBotones() {
        // Botón "Solicitar Proforma
        const btnAbrir = document.getElementById('btn-abrir-proforma');
        if (btnAbrir) {
            btnAbrir.addEventListener('click', abrirModal);
        }

    
        const modalOverlay = document.getElementById('modal-proforma');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', function (e) {
                if (e.target === this) cerrarModal();
            });
        }

    
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') cerrarModal();
        });

        //Formulario de proforma
        const formProforma = document.getElementById('form-proforma');
        if (formProforma) {
            formProforma.addEventListener('submit', enviarProforma);
        }
    }

    
    // Iniciar cuando todo este listo
    iniciarServicios();

})();