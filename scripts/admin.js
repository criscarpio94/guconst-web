
//LOGICA PARA CONTROLAR TODO EL PANEL DE ADMINISTRACION
(function () {
    'use strict';

    // Datos en memoria del panel
    const estado = {
        admin:     null,
        maquinas:  [],
        proformas: []
    };
    
    // iniciar al cargar la vista    

    async function iniciarAdmin() {
        asignarEventosGlobales();
        await verificarSesion();
    }

    
    // Sesion admin    

    async function verificarSesion() {
        try {
            const resp = await fetch('api/admin/verificar.php', { credentials: 'include' });
            const json = await resp.json();

            if (json.autenticado) {
                estado.admin = json.admin;
                mostrarPanel();
                cargarDashboard();
            } else {
                mostrarLogin();
            }
        } catch (e) {
            mostrarLogin();
        }
    }

    function mostrarLogin() {
        document.getElementById('pantalla-login').style.display = 'flex';
        document.getElementById('pantalla-admin').style.display = 'none';
    }

    function mostrarPanel() {
        document.getElementById('pantalla-login').style.display = 'none';
        document.getElementById('pantalla-admin').style.display = 'grid';

        // Mostrar nombre y rol del administrador en la barra lateral 
        const el = document.getElementById('admin-nombre-sidebar');
        const rol = document.getElementById('admin-rol-sidebar');
        if (el)  el.textContent  = estado.admin.nombre;
        if (rol) rol.textContent = estado.admin.rol === 'superadmin' ? '⭐ Super Admin' : 'Administrador';
    }

    //Login inicio sesion
    async function iniciarSesion(evento) {
        evento.preventDefault();

        const btn    = document.getElementById('btn-login');
        const errorEl = document.getElementById('login-error');

        btn.disabled    = true;
        btn.textContent = 'VERIFICANDO...';
        errorEl.style.display = 'none';

        const datos = {
            correo:     document.getElementById('login-correo').value.trim(),
            contrasenia: document.getElementById('login-contrasenia').value
        };

        try {
            const resp = await fetch('api/admin/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
                credentials: 'include'
            });
            const json = await resp.json();

            if (json.exito) {
                estado.admin = json.admin;
                mostrarPanel();
                cargarDashboard();
            } else {
                errorEl.textContent   = json.mensaje;
                errorEl.style.display = 'block';
                btn.disabled    = false;
                btn.textContent = 'INICIAR SESIÓN';
            }
        } catch (e) {
            errorEl.textContent   = 'Error de conexión.';
            errorEl.style.display = 'block';
            btn.disabled    = false;
            btn.textContent = 'INICIAR SESIÓN';
        }
    }

    //Funcion para cerrar sesion
    async function cerrarSesion() {
        await fetch('api/admin/logout.php', { credentials: 'include' });
        estado.admin = null;
        mostrarLogin();
    }

    //Navegador entre secciones del panel de administracion    

    function navegarSeccion(nombreSeccion) {
        document.querySelectorAll('.admin-nav-btn[data-seccion]').forEach(btn => {
            btn.classList.toggle('activo', btn.dataset.seccion === nombreSeccion);
        });

        document.querySelectorAll('.admin-seccion').forEach(sec => {
            sec.classList.toggle('activo', sec.id === 'seccion-' + nombreSeccion);
        });

        // Cargar datos al cambiar de seccion
        if (nombreSeccion === 'maquinaria') cargarTablaMaquinaria();
        if (nombreSeccion === 'proformas')  cargarProformas();
    }

    //Dashboard principal    

    async function cargarDashboard() {
        // Cargar datos en paralelo
        const [resMaq, resPro] = await Promise.all([
            fetch('api/admin/maquinaria.php', { credentials: 'include' }),
            fetch('api/admin/proformas.php',  { credentials: 'include' })
        ]);

        const jsonMaq = await resMaq.json();
        const jsonPro = await resPro.json();

        if (jsonMaq.exito) estado.maquinas  = jsonMaq.datos;
        if (jsonPro.exito) estado.proformas = jsonPro.datos;

        const pendientes = estado.proformas.filter(p => p.estado === 'pendiente').length;
        const disponibles = estado.maquinas.filter(m => m.disponible).length;

        // Tarjetas de las estadisticas
        document.getElementById('admin-stats-grid').innerHTML = [
            { icono:'🚜', num: estado.maquinas.length,  etq: 'TOTAL MAQUINARIA' },
            { icono:'✅', num: disponibles,              etq: 'DISPONIBLES' },
            { icono:'📋', num: estado.proformas.length, etq: 'SOLICITUDES TOTALES' },
            { icono:'⏳', num: pendientes,              etq: 'PENDIENTES' }
        ].map(s => `
            <div class="admin-stat-tarjeta">
                <span class="admin-stat-icono">${s.icono}</span>
                <p class="admin-stat-numero">${s.num}</p>
                <p class="admin-stat-etiqueta">${s.etq}</p>
            </div>
        `).join('');

        //Mostrar ultimas 5 proformas
        const lista = document.getElementById('admin-recientes-lista');
        if (estado.proformas.length === 0) {
            lista.innerHTML = '<p style="color:#9CA3AF;font-size:0.875rem;">No hay solicitudes aún.</p>';
        } else {
            lista.innerHTML = estado.proformas.slice(0, 5).map(p => `
                <div class="admin-reciente-item">
                    <div>
                        <p class="admin-reciente-nombre">${p.nombres_completos}</p>
                        <p class="admin-reciente-fecha">${p.id} · ${p.fecha}</p>
                    </div>
                    <span class="badge-${p.estado}">${p.estado}</span>
                </div>
            `).join('');
        }
    }
    
    //Maquinaria CRUD    

    async function cargarTablaMaquinaria() {
        const resp = await fetch('api/admin/maquinaria.php', { credentials: 'include' });
        const json = await resp.json();
        if (json.exito) {
            estado.maquinas = json.datos;
            renderizarTablaMaquinaria();
        }
    }

    function renderizarTablaMaquinaria() {
        const tbody = document.getElementById('tbody-maquinaria');

        if (estado.maquinas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:2rem;color:#9CA3AF;">No hay maquinaria registrada.</td></tr>';
            return;
        }

        tbody.innerHTML = estado.maquinas.map(m => `
            <tr>
                <td style="font-weight:600;">${m.nombre}</td>
                <td style="color:#6B7280;">${m.marca} ${m.modelo}</td>
                <td>${m.categoria}</td>
                <td style="color:#6B7280;">${m.potencia}</td>
                <td>
                    <span class="${m.disponible ? 'badge-disponible' : 'badge-no-disp'}">
                        ${m.disponible ? 'Disponible' : 'No disponible'}
                    </span>
                </td>
                <td>
                    <div class="admin-acciones-celda">
                        <button class="btn-editar"   onclick="abrirModalEditar(${m.id})">Editar</button>
                        <button class="btn-eliminar" onclick="eliminarMaquina(${m.id},'${m.nombre.replace(/'/g,"\\'")}')">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    //Abrin ventana para crear maquinaria
    window.abrirModalCrear = function () {
        document.getElementById('modal-maquina-titulo').textContent = 'NUEVA MAQUINARIA';
        document.getElementById('form-maquina').reset();
        document.getElementById('maquina-id').value = '';
        document.getElementById('maq-disponible').checked = true;
        document.getElementById('maquina-error').style.display = 'none';
        document.getElementById('modal-maquina').classList.add('activo');
        document.body.style.overflow = 'hidden';
    };

    //Abrir ventana para editar maquinaria
    window.abrirModalEditar = function (id) {
        const m = estado.maquinas.find(x => parseInt(x.id) === id);
        if (!m) return;

        document.getElementById('modal-maquina-titulo').textContent = 'EDITAR MAQUINARIA';
        document.getElementById('maquina-id').value    = m.id;
        document.getElementById('maq-nombre').value    = m.nombre;
        document.getElementById('maq-tipo').value      = m.tipo;
        document.getElementById('maq-marca').value     = m.marca;
        document.getElementById('maq-modelo').value    = m.modelo;
        document.getElementById('maq-potencia').value  = m.potencia;
        document.getElementById('maq-peso').value      = m.peso;
        document.getElementById('maq-categoria').value = m.categoria;
        document.getElementById('maq-imagen').value    = m.imagen_url;
        document.getElementById('maq-descripcion').value = m.descripcion;
        document.getElementById('maq-disponible').checked = m.disponible;
        document.getElementById('maquina-error').style.display = 'none';

        document.getElementById('modal-maquina').classList.add('activo');
        document.body.style.overflow = 'hidden';
    };

    window.cerrarModalMaquina = function () {
        document.getElementById('modal-maquina').classList.remove('activo');
        document.body.style.overflow = '';
    };

    //Guardar al crear o actualizar
    async function guardarMaquina(evento) {
        evento.preventDefault();

        const id  = document.getElementById('maquina-id').value;
        const btn = document.getElementById('btn-guardar-maquina');
        const errorEl = document.getElementById('maquina-error');

        btn.disabled    = true;
        btn.textContent = 'GUARDANDO...';
        errorEl.style.display = 'none';

        const datos = {
            nombre:      document.getElementById('maq-nombre').value.trim(),
            tipo:        document.getElementById('maq-tipo').value.trim(),
            marca:       document.getElementById('maq-marca').value.trim(),
            modelo:      document.getElementById('maq-modelo').value.trim(),
            potencia:    document.getElementById('maq-potencia').value.trim(),
            peso:        document.getElementById('maq-peso').value.trim(),
            categoria:   document.getElementById('maq-categoria').value,
            imagen_url:  document.getElementById('maq-imagen').value.trim(),
            descripcion: document.getElementById('maq-descripcion').value.trim(),
            disponible:  document.getElementById('maq-disponible').checked ? 1 : 0
        };

        if (id) datos.id = id; // Si hay ID, es una actualización

        const metodo = id ? 'PUT' : 'POST';

        try {
            const resp = await fetch('api/admin/maquinaria.php', {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
                credentials: 'include'
            });
            const json = await resp.json();

            if (json.exito) {
                cerrarModalMaquina();
                cargarTablaMaquinaria();
            } else {
                errorEl.textContent   = json.mensaje;
                errorEl.style.display = 'block';
            }
        } catch (e) {
            errorEl.textContent   = 'Error de conexión.';
            errorEl.style.display = 'block';
        }

        btn.disabled    = false;
        btn.textContent = 'GUARDAR';
    }

    window.eliminarMaquina = async function (id, nombre) {
        if (!confirm(`¿Eliminar "${nombre}" del catálogo?\nEsta acción no se puede deshacer.`)) return;

        const resp = await fetch('api/admin/maquinaria.php', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
            credentials: 'include'
        });
        const json = await resp.json();
        if (json.exito) cargarTablaMaquinaria();
        else alert('Error: ' + json.mensaje);
    };

    //Proformas

    async function cargarProformas() {
        const lista = document.getElementById('lista-proformas');
        lista.innerHTML = '<div class="cargando-vista"><div class="spinner"></div></div>';

        const resp = await fetch('api/admin/proformas.php', { credentials: 'include' });
        const json = await resp.json();

        if (!json.exito) {
            lista.innerHTML = '<p style="color:#EF4444;">Error al cargar solicitudes.</p>';
            return;
        }

        estado.proformas = json.datos;

        if (estado.proformas.length === 0) {
            lista.innerHTML = '<div style="text-align:center;padding:3rem;color:#9CA3AF;"><p style="font-size:2rem;margin-bottom:1rem;">📋</p><p>No hay solicitudes de proforma todavía.</p></div>';
            return;
        }

        const badgeClase = { pendiente: 'badge-pendiente', atendida: 'badge-atendida', rechazada: 'badge-rechazada' };

        lista.innerHTML = estado.proformas.map(p => `
            <div class="proforma-admin-tarjeta">
                <div class="proforma-admin-header">
                    <div>
                        <p class="proforma-admin-cliente">${p.nombres_completos}</p>
                        <p class="proforma-admin-info">${p.correo} · ${p.telefono}</p>
                        <p class="proforma-admin-info">${p.ciudad}, ${p.provincia}</p>
                        <p class="proforma-admin-fecha">${p.id} · ${p.fecha}</p>
                    </div>
                    <div class="proforma-admin-controles">
                        <span class="${badgeClase[p.estado]}">${p.estado}</span>
                        <select class="select-estado" onchange="cambiarEstadoProforma('${p.id}', this.value)">
                            <option value="pendiente"  ${p.estado==='pendiente'  ? 'selected' : ''}>Pendiente</option>
                            <option value="atendida"   ${p.estado==='atendida'   ? 'selected' : ''}>Atendida</option>
                            <option value="rechazada"  ${p.estado==='rechazada'  ? 'selected' : ''}>Rechazada</option>
                        </select>
                    </div>
                </div>
                ${p.maquinas_lista
                    ? `<div class="proforma-maquinas-lista">🚜 ${p.maquinas_lista}</div>`
                    : ''}
                ${p.mensaje
                    ? `<p class="proforma-mensaje-admin">"${p.mensaje}"</p>`
                    : ''}
            </div>
        `).join('');
    }

    window.cambiarEstadoProforma = async function (id, nuevoEstado) {
        await fetch('api/admin/proformas.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, estado: nuevoEstado }),
            credentials: 'include'
        });
        // Recargar para actualizar
        cargarProformas();
    };

    //Enventos a nivel global

    function asignarEventosGlobales() {
        // Login
        const formLogin = document.getElementById('form-login');
        if (formLogin) formLogin.addEventListener('submit', iniciarSesion);

        // Logout
        document.getElementById('btn-logout')?.addEventListener('click', cerrarSesion);

        // Ver sitio
        document.getElementById('btn-ver-sitio')?.addEventListener('click', () => {
            if (typeof navegarA === 'function') navegarA('inicio');
        });

        //Navegacion de barra lateral
        document.querySelectorAll('.admin-nav-btn[data-seccion]').forEach(btn => {
            btn.addEventListener('click', () => navegarSeccion(btn.dataset.seccion));
        });

        // Boton para nueva máquina
        document.getElementById('btn-nueva-maquina')?.addEventListener('click', window.abrirModalCrear);

        // Formulario de maquinaria
        document.getElementById('form-maquina')?.addEventListener('submit', guardarMaquina);

        // Cerrar ventana emergente con fondo
        document.getElementById('modal-maquina')?.addEventListener('click', function (e) {
            if (e.target === this) cerrarModalMaquina();
        });

        // Cerrar con Escape
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') cerrarModalMaquina();
        });
    }

    iniciarAdmin();
})();