// LOGICA PARA LA CONEXION DE LA PANTALLA PROYECTOS CON LA BDD

(function () {
    'use strict';

    const estado = {
        proyectos: [],
        categoriaActual: 'Todos'
    };

    //INICIAR LA PANTALLA
    async function iniciarProyectos() {
        asignarEventosFiltros();
        await cargarProyectos();
    }

    //CARGAR PROYECTOS DESDE LA API
    async function cargarProyectos() {
        const grilla = document.getElementById('grilla-proyectos');
        grilla.innerHTML = `<div class="cargando-proyectos"><div class="spinner"></div><p>Cargando...</p></div>`;

        try {
            const respuesta = await fetch('api/proyectos.php');
            const json      = await respuesta.json();

            if (!json.exito) throw new Error(json.mensaje);

            estado.proyectos = json.datos;
            renderizarProyectos(estado.proyectos);

        } catch (error) {
            grilla.innerHTML = `<p class="cargando-proyectos">⚠️ No se pudieron cargar los proyectos: ${error.message}</p>`;
        }
    }

    //CONECTAR CON LAS TARJETAS DE PROYECTOS
    function renderizarProyectos(lista) {
        const grilla    = document.getElementById('grilla-proyectos');
        const contador  = document.getElementById('proyectos-contador');

        contador.textContent = `${lista.length} proyecto(s) encontrado(s)`;

        if (lista.length === 0) {
            grilla.innerHTML = '<p class="cargando-proyectos">No hay proyectos en esta categoría.</p>';
            return;
        }

        grilla.innerHTML = lista.map(p => `
            <article class="proyecto-tarjeta" onclick="abrirModalProyecto(${p.id})">
                <div class="proyecto-imagen-wrap">
                    <img class="proyecto-imagen" src="${p.imagen_url}" alt="${p.nombre}"
                         loading="lazy" onerror="this.style.background='#E5E7EB'">
                    <div class="proyecto-badges">
                        <span class="proy-badge-anio">${p.anio}</span>
                        <span class="proy-badge-cat">${p.categoria}</span>
                    </div>
                </div>
                <div class="proyecto-cuerpo">
                    <h3 class="proyecto-nombre">${p.nombre}</h3>
                    <p class="proyecto-ubicacion">
                        <svg width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                        </svg>
                        ${p.ubicacion}
                    </p>
                    <p class="proyecto-descripcion">${p.descripcion}</p>
                    <div class="proyecto-footer">
                        <span class="proyecto-cliente-txt">Cliente: ${p.cliente}</span>
                        <span class="proyecto-ver-mas">Ver detalle →</span>
                    </div>
                </div>
            </article>
        `).join('');
    }

    //FILTROS DE BUSQUEDA
    function asignarEventosFiltros() {
        document.querySelectorAll('.filtro-btn[data-filtro-tipo]').forEach(btn => {
            btn.addEventListener('click', function () {
                const tipo  = this.dataset.filtroTipo;
                const valor = this.dataset.filtroValor;

                //Para quitar "activo" de los botones del mismo grupo
                document.querySelectorAll(`.filtro-btn[data-filtro-tipo="${tipo}"]`)
                    .forEach(b => b.classList.remove('activo'));
                this.classList.add('activo');

                estado.categoriaActual = valor;

                const filtrados = valor === 'Todos'
                    ? estado.proyectos
                    : estado.proyectos.filter(p => p.categoria === valor);

                renderizarProyectos(filtrados);
            });
        });
    }

    //MODAL O VENTANA EMERGENTE PARA EL DETALLE
    window.abrirModalProyecto = function (id) {
        const proyecto = estado.proyectos.find(p => parseInt(p.id) === id);
        if (!proyecto) return;

        document.getElementById('modal-proy-imagen').src        = proyecto.imagen_url;
        document.getElementById('modal-proy-imagen').alt        = proyecto.nombre;
        document.getElementById('modal-proy-anio').textContent  = proyecto.anio;
        document.getElementById('modal-proy-categoria').textContent = proyecto.categoria;
        document.getElementById('modal-proy-nombre').textContent     = proyecto.nombre;
        document.getElementById('modal-proy-ubicacion').querySelector('span').textContent = proyecto.ubicacion;
        document.getElementById('modal-proy-descripcion').textContent = proyecto.descripcion;
        document.getElementById('modal-proy-cliente').textContent     = proyecto.cliente;

        const modal = document.getElementById('modal-proyecto');
        modal.classList.add('visible');
        document.body.style.overflow = 'hidden';
    };

    window.cerrarModalProyecto = function () {
        document.getElementById('modal-proyecto').classList.remove('visible');
        document.body.style.overflow = '';
    };

    //Funcion para cerrar con tecla Escape
    document.getElementById('modal-proyecto')?.addEventListener('click', function (e) {
        if (e.target === this) cerrarModalProyecto();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarModalProyecto(); });

    iniciarProyectos();
})();