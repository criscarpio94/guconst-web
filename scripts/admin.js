// LOGICA PARA CONTROLAR TODO EL PANEL DE ADMINISTRACION
(function () {
    'use strict';

    // Datos en memoria del panel
    const estado = {
        admin:     null,
        maquinas:  [],
        proformas: [],
        mensajes:  [],
        admins:    []
    };
    
    // Iniciar al cargar la vista    
    async function iniciarAdmin() {
        asignarEventosGlobales();
        await verificarSesion();
    }
    
    // Sesión admin    
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
        const login = document.getElementById('pantalla-login');
        const admin = document.getElementById('pantalla-admin');
        if (login) login.style.display = 'flex';
        if (admin) admin.style.display = 'none';
    }

    function mostrarPanel() {
        const login = document.getElementById('pantalla-login');
        const admin = document.getElementById('pantalla-admin');
        const nombreSidebar = document.getElementById('admin-nombre-sidebar');
        const rolSidebar = document.getElementById('admin-rol-sidebar');
        const navAdmins = document.getElementById('nav-admins');

        if (login) login.style.display = 'none';
        if (admin) admin.style.display = 'grid';
        if (nombreSidebar) nombreSidebar.textContent = estado.admin?.nombre || '—';
        if (rolSidebar) {
            rolSidebar.textContent = 
                estado.admin?.rol === 'superadmin' ? '⭐ Super Admin' : 'Administrador';
        }

        // Solo el superadministrador puede ver la opcion de administradores
        if (navAdmins) {
            navAdmins.style.display = estado.admin?.rol === 'superadmin' ? 'flex' : 'none';
        }
    }

    // Login inicio sesión
    async function iniciarSesion(e) {
        e.preventDefault();

        const btn     = document.getElementById('btn-login');
        const errorEl = document.getElementById('login-error');

        btn.disabled    = true;
        btn.textContent = 'VERIFICANDO...';
        errorEl.style.display = 'none';        

        try {
            const resp = await fetch('api/admin/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    correo:      document.getElementById('login-correo').value.trim(),
                    contrasenia: document.getElementById('login-contrasenia').value
                }),
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
        } catch (err) {
            errorEl.textContent   = 'Error de conexión.';
            errorEl.style.display = 'block';
            btn.disabled    = false;
            btn.textContent = 'INICIAR SESIÓN';
        }
    }

    // Función para cerrar sesión
    async function cerrarSesion() {
        await fetch('api/admin/logout.php', { credentials: 'include' });
        estado.admin = null;
        mostrarLogin();
        const inputCorreo = document.getElementById('login-correo');
        const inputPass = document.getElementById('login-contrasenia');
        if (inputCorreo) inputCorreo.value = '';
        if (inputPass) inputPass.value = '';
    }

    // Navegación entre secciones del panel de administración    
    function navegarSeccion(nombre) {
        document.querySelectorAll('.admin-nav-btn[data-seccion]').forEach(btn => {
            btn.classList.toggle('activo', btn.dataset.seccion === nombre);
        });

        document.querySelectorAll('.admin-seccion').forEach(sec => {
            sec.classList.toggle('activo', sec.id === 'seccion-' + nombre);
        });

        // Cargar datos al cambiar de sección
        if (nombre === 'maquinaria') cargarTablaMaquinaria();
        if (nombre === 'proformas')  cargarProformas();
        if (nombre === 'mensajes')   cargarMensajes();
        if (nombre === 'admins')     cargarAdmins();
    }

    // Dashboard principal    
    async function cargarDashboard() {
        try {
            // Cargar datos en paralelo
            const [resMaq, resPro, resMsg] = await Promise.all([
                fetch('api/admin/maquinaria.php', { credentials: 'include' }),
                fetch('api/admin/proformas.php',  { credentials: 'include' }),
                fetch('api/admin/mensajes.php',   { credentials: 'include' })
            ]);

            const [jMaq, jPro, jMsg] = await Promise.all([
                resMaq.json(), resPro.json(), resMsg.json()
            ]);

            if (jMaq.exito) estado.maquinas  = jMaq.datos;
            if (jPro.exito) estado.proformas = jPro.datos;
            if (jMsg.exito) {
                estado.mensajes = jMsg.datos;
                actualizarBadgeMensajes(jMsg.no_leidos);
            }

            const pendientes  = estado.proformas.filter(p => p.estado === 'pendiente').length;
            const disponibles = estado.maquinas.filter(m => m.disponible).length;
            const noLeidos    = estado.mensajes.filter(m => !m.leido).length;

            // Tarjetas de estadísticas
            const statsGrid = document.getElementById('admin-stats-grid');
            if (statsGrid) {
                statsGrid.innerHTML = [
                    { icono:'🚜', num: estado.maquinas.length, etq: 'MAQUINARIA TOTAL' },
                    { icono:'✅', num: disponibles,            etq: 'DISPONIBLES' },
                    { icono:'📋', num: pendientes,             etq: 'PROFORMAS PENDIENTES' },
                    { icono:'✉️', num: noLeidos,                etq: 'MENSAJES SIN LEER' }
                ].map(s => `
                    <div class="admin-stat-tarjeta">
                        <span class="admin-stat-icono">${s.icono}</span>
                        <p class="admin-stat-numero">${s.num}</p>
                        <p class="admin-stat-etiqueta">${s.etq}</p>
                    </div>
                `).join('');
            }

            // Mostrar proformas recientes
            const listaEl = document.getElementById('admin-recientes-lista');
            if (listaEl) {
                listaEl.innerHTML = estado.proformas.length === 0
                    ? '<p style="color:#9CA3AF;font-size:0.875rem;">No hay solicitudes aún.</p>'
                    : estado.proformas.slice(0, 5).map(p => `
                        <div class="admin-reciente-item">
                            <div>
                                <p class="admin-reciente-nombre">${p.nombres_completos}</p>
                                <p class="admin-reciente-fecha">${p.id} · ${p.fecha}</p>
                            </div>
                            <span class="badge-${p.estado}">${p.estado}</span>
                        </div>
                    `).join('');
            }
        } catch (err) {
            console.error('Error al cargar dashboard:', err);
        }
    }

    function actualizarBadgeMensajes(cantidad) {
        const badge = document.getElementById('badge-no-leidos');
        if (!badge) return;
        if (cantidad > 0) {
            badge.textContent   = cantidad;
            badge.style.display = 'inline-block';
        } else {
            badge.style.display = 'none';
        }
    }
    
    // Maquinaria CRUD    
    async function cargarTablaMaquinaria() {
        const resp = await fetch('api/admin/maquinaria.php', { credentials: 'include' });
        const json = await resp.json();
        if (json.exito) { estado.maquinas = json.datos; renderizarTablaMaquinaria(); }
    }

    function renderizarTablaMaquinaria() {
        const tbody = document.getElementById('tbody-maquinaria');
        if (!tbody) return;
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
                <td><span class="${m.disponible ? 'badge-disponible' : 'badge-no-disp'}">${m.disponible ? 'Disponible' : 'No disp.'}</span></td>
                <td>
                    <div class="admin-acciones-celda">
                        <button class="btn-editar"   onclick="abrirModalEditar(${m.id})">Editar</button>
                        <button class="btn-eliminar" onclick="eliminarMaquina(${m.id},'${m.nombre.replace(/'/g, "\\'")}')">Eliminar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Abrir modal para crear maquinaria
    window.abrirModalCrear = function () {
        const titulo = document.getElementById('modal-maquina-titulo');
        const form = document.getElementById('form-maquina');
        const idInput = document.getElementById('maquina-id');
        const dispCheck = document.getElementById('maq-disponible');
        const errorEl = document.getElementById('maquina-error');
        const modal = document.getElementById('modal-maquina');

        if (titulo) titulo.textContent = 'NUEVA MAQUINARIA';
        if (form) form.reset();
        if (idInput) idInput.value = '';
        if (dispCheck) dispCheck.checked = true;
        if (errorEl) errorEl.style.display = 'none';
        if (modal) modal.classList.add('activo');
        document.body.style.overflow = 'hidden';
    };

    // Abrir modal para editar maquinaria
    window.abrirModalEditar = function (id) {
        const m = estado.maquinas.find(x => parseInt(x.id) === parseInt(id));
        if (!m) return;
        const modal = document.getElementById('modal-maquina');

        document.getElementById('modal-maquina-titulo').textContent = 'EDITAR MAQUINARIA';
        document.getElementById('maquina-id').value         = m.id;
        document.getElementById('maq-nombre').value         = m.nombre;
        document.getElementById('maq-tipo').value           = m.tipo;
        document.getElementById('maq-marca').value          = m.marca;
        document.getElementById('maq-modelo').value         = m.modelo;
        document.getElementById('maq-potencia').value       = m.potencia;
        document.getElementById('maq-peso').value           = m.peso;
        document.getElementById('maq-categoria').value      = m.categoria;
        document.getElementById('maq-imagen').value         = m.imagen_url;
        document.getElementById('maq-descripcion').value    = m.descripcion;
        document.getElementById('maq-disponible').checked   = Boolean(m.disponible);
        document.getElementById('maquina-error').style.display = 'none';

        if (modal) modal.classList.add('activo');
        document.body.style.overflow = 'hidden';
    };

    window.cerrarModalMaquina = function () {
        const modal = document.getElementById('modal-maquina');
        if (modal) modal.classList.remove('activo');
        document.body.style.overflow = '';
    };

    // Guardar al crear o actualizar maquinaria
    async function guardarMaquina(e) {
        e.preventDefault();
        const id      = document.getElementById('maquina-id').value;
        const btn     = document.getElementById('btn-guardar-maquina');
        const errorEl = document.getElementById('maquina-error');

        btn.disabled = true; 
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

        if (id) datos.id = id;

        try {
            const resp = await fetch('api/admin/maquinaria.php', {
                method: id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos),
                credentials: 'include'
            });
            const json = await resp.json();

            if (json.exito) { 
                cerrarModalMaquina(); 
                cargarTablaMaquinaria(); 
            } else { 
                errorEl.textContent = json.mensaje; 
                errorEl.style.display = 'block'; 
            }
        } catch (err) {
            errorEl.textContent = 'Error de conexión.'; 
            errorEl.style.display = 'block';
        }

        btn.disabled = false; 
        btn.textContent = 'GUARDAR';
    }

    window.eliminarMaquina = async function (id, nombre) {
        if (!confirm(`¿Eliminar "${nombre}"?\nEsta acción no se puede deshacer.`)) return;
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

    // Proformas
    async function cargarProformas() {
        const lista = document.getElementById('lista-proformas');
        if (!lista) return;
        lista.innerHTML = '<div class="cargando-vista" style="text-align:center;padding:2rem;"><div class="spinner"></div></div>';

        const resp = await fetch('api/admin/proformas.php', { credentials: 'include' });
        const json = await resp.json();

        if (!json.exito) { lista.innerHTML = '<p style="color:#EF4444;">Error al cargar.</p>'; return; }
        estado.proformas = json.datos;

        if (json.total === 0) {
            lista.innerHTML = '<div style="text-align:center;padding:3rem;color:#9CA3AF;"><p style="font-size:2rem;">📋</p><p>Sin solicitudes aún.</p></div>';
            return;
        }

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
                        <span class="badge-${p.estado}">${p.estado}</span>
                        <select class="select-estado" onchange="cambiarEstadoProforma('${p.id}', this.value)">
                            <option value="pendiente"  ${p.estado==='pendiente' ? 'selected':''}>Pendiente</option>
                            <option value="atendida"   ${p.estado==='atendida'  ? 'selected':''}>Atendida</option>
                            <option value="rechazada"  ${p.estado==='rechazada' ? 'selected':''}>Rechazada</option>
                        </select>
                    </div>
                </div>
                ${p.maquinas_lista ? `<div class="proforma-maquinas-lista">🚜 ${p.maquinas_lista}</div>` : ''}
                ${p.mensaje        ? `<p class="proforma-mensaje-admin">"${p.mensaje}"</p>` : ''}
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
        cargarProformas();
    };

    // Mensajes de Contacto
    async function cargarMensajes() {
        const lista = document.getElementById('lista-mensajes');
        if (!lista) return;
        lista.innerHTML = '<div style="text-align:center;padding:2rem;"><div class="spinner"></div></div>';

        const resp = await fetch('api/admin/mensajes.php', { credentials: 'include' });
        const json = await resp.json();

        if (!json.exito) { lista.innerHTML = '<p style="color:#EF4444;">Error al cargar mensajes.</p>'; return; }

        estado.mensajes = json.datos;
        actualizarBadgeMensajes(json.no_leidos);

        if (json.total === 0) {
            lista.innerHTML = '<div style="text-align:center;padding:3rem;color:#9CA3AF;"><p style="font-size:2rem;">✉️</p><p>Sin mensajes aún.</p></div>';
            return;
        }

        lista.innerHTML = `
            <div class="mensajes-filtros">
                <button class="filtro-btn activo" onclick="filtrarMensajes('todos', this)">Todos (${json.total})</button>
                <button class="filtro-btn" onclick="filtrarMensajes('no-leidos', this)">Sin leer (${json.no_leidos})</button>
            </div>
            <div id="mensajes-lista-interna">
                ${renderizarMensajes(estado.mensajes)}
            </div>
        `;
    }

    function renderizarMensajes(lista) {
        return lista.map(m => `
            <div class="mensaje-admin-tarjeta ${!m.leido ? 'no-leido' : ''}" id="msg-${m.id}">
                <div class="mensaje-admin-header">
                    <div>
                        <p class="mensaje-admin-remitente">${m.nombres_completos}</p>
                        <p class="mensaje-admin-sub">${m.correo} · ${m.telefono} · ${m.ciudad}, ${m.provincia}</p>
                        <p class="mensaje-admin-sub" style="color:#9CA3AF;">${m.fecha}</p>
                    </div>
                    ${!m.leido ? '<span class="badge-pendiente">Sin leer</span>' : '<span style="font-size:0.7rem;color:#9CA3AF;">Leído</span>'}
                </div>
                <p class="mensaje-admin-asunto">📌 ${m.asunto}</p>
                <p class="mensaje-admin-cuerpo">${m.mensaje}</p>
                <div class="mensaje-admin-acciones">
                    <a href="mailto:${m.correo}" class="btn-editar">↗ Responder</a>
                    ${!m.leido
                        ? `<button class="btn-leido" onclick="marcarLeido(${m.id}, true)">✓ Marcar como leído</button>`
                        : `<button class="btn-leido" onclick="marcarLeido(${m.id}, false)">↩ Marcar sin leer</button>`}
                    <button class="btn-eliminar-msg" onclick="eliminarMensaje(${m.id})">🗑 Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    window.filtrarMensajes = function (tipo, btn) {
        document.querySelectorAll('.mensajes-filtros .filtro-btn').forEach(b => b.classList.remove('activo'));
        btn.classList.add('activo');
        const lista = tipo === 'no-leidos'
            ? estado.mensajes.filter(m => !m.leido)
            : estado.mensajes;
        const container = document.getElementById('mensajes-lista-interna');
        if (container) container.innerHTML = renderizarMensajes(lista);
    };

    window.marcarLeido = async function (id, leido) {
        await fetch('api/admin/mensajes.php', {
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, leido: leido ? 1 : 0 }), 
            credentials: 'include'
        });
        cargarMensajes();
    };

    window.eliminarMensaje = async function (id) {
        if (!confirm('¿Eliminar este mensaje permanentemente?')) return;
        await fetch('api/admin/mensajes.php', {
            method: 'DELETE', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }), 
            credentials: 'include'
        });
        cargarMensajes();
    };

    // Administradores
    async function cargarAdmins() {
        const resp = await fetch('api/admin/administradores.php', { credentials: 'include' });
        const json = await resp.json();
        if (!json.exito) return;
        estado.admins = json.datos;

        const tbody = document.getElementById('tbody-admins');
        if (!tbody) return;
        tbody.innerHTML = estado.admins.map(a => `
            <tr>
                <td style="font-weight:600;">${a.nombre}</td>
                <td style="color:#6B7280;">${a.correo}</td>
                <td><span class="${a.rol === 'superadmin' ? 'badge-disponible' : 'badge-no-disp'}">${a.rol}</span></td>
                <td style="color:#9CA3AF;font-size:0.8rem;">${a.fecha_registro}</td>
                <td>
                    ${parseInt(a.id) !== parseInt(estado.admin?.id)
                        ? `<button class="btn-eliminar" onclick="eliminarAdmin(${a.id},'${a.nombre.replace(/'/g, "\\'")}')">Eliminar</button>`
                        : '<span style="color:#9CA3AF;font-size:0.75rem;">(tu cuenta)</span>'}
                </td>
            </tr>
        `).join('');
    }

    window.abrirModalAdmin = function () {
        const form = document.getElementById('form-nuevo-admin');
        const errorEl = document.getElementById('admin-modal-error');
        const modal = document.getElementById('modal-admin');

        if (form) form.reset();
        if (errorEl) errorEl.style.display = 'none';
        if (modal) modal.classList.add('activo');
        document.body.style.overflow = 'hidden';
    };

    window.cerrarModalAdmin = function () {
        const modal = document.getElementById('modal-admin');
        if (modal) modal.classList.remove('activo');
        document.body.style.overflow = '';
    };

    async function crearAdmin(e) {
        e.preventDefault();
        const btn     = document.getElementById('btn-guardar-admin');
        const errorEl = document.getElementById('admin-modal-error');

        btn.disabled = true; 
        btn.textContent = 'CREANDO...';
        errorEl.style.display = 'none';

        const datos = {
            nombre:      document.getElementById('nuevo-admin-nombre').value.trim(),
            correo:      document.getElementById('nuevo-admin-correo').value.trim(),
            contrasenia: document.getElementById('nuevo-admin-pass').value,
            rol:         document.getElementById('nuevo-admin-rol').value
        };

        try {
            const resp = await fetch('api/admin/administradores.php', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos), 
                credentials: 'include'
            });
            const json = await resp.json();

            if (json.exito) { 
                cerrarModalAdmin(); 
                cargarAdmins(); 
            } else { 
                errorEl.textContent = json.mensaje; 
                errorEl.style.display = 'block'; 
            }
        } catch (err) {
            errorEl.textContent = 'Error de conexión.'; 
            errorEl.style.display = 'block';
        }

        btn.disabled = false; 
        btn.textContent = 'CREAR ADMIN';
    }

    window.eliminarAdmin = async function (id, nombre) {
        if (!confirm(`¿Eliminar al administrador "${nombre}"?\nPerderá el acceso al panel.`)) return;
        const resp = await fetch('api/admin/administradores.php', {
            method: 'DELETE', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }), 
            credentials: 'include'
        });
        const json = await resp.json();
        if (json.exito) cargarAdmins();
        else alert('Error: ' + json.mensaje);
    };

    // Cambiar contraseña
    async function cambiarContrasenia(e) {
        e.preventDefault();
        const btn     = document.getElementById('btn-cambiar-pass');
        const errorEl = document.getElementById('pass-error');
        const exitoEl = document.getElementById('pass-exito');

        btn.disabled = true; 
        btn.textContent = 'GUARDANDO...';
        errorEl.style.display = 'none'; 
        exitoEl.style.display = 'none';

        const datos = {
            actual:    document.getElementById('pass-actual').value,
            nueva:     document.getElementById('pass-nueva').value,
            confirmar: document.getElementById('pass-confirmar').value
        };

        try {
            const resp = await fetch('api/admin/cambiar_contrasenia.php', {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos), 
                credentials: 'include'
            });
            const json = await resp.json();

            if (json.exito) {
                exitoEl.textContent   = '✓ ' + json.mensaje;
                exitoEl.style.display = 'block';
                document.getElementById('form-cambiar-pass').reset();
            } else {
                errorEl.textContent   = json.mensaje;
                errorEl.style.display = 'block';
            }
        } catch (err) {
            errorEl.textContent = 'Error de conexión.'; 
            errorEl.style.display = 'block';
        }

        btn.disabled = false; 
        btn.textContent = 'ACTUALIZAR CONTRASEÑA';
    }
    
    // Eventos globales
    function asignarEventosGlobales() {
        document.getElementById('form-login')?.addEventListener('submit', iniciarSesion);
        document.getElementById('btn-logout')?.addEventListener('click', cerrarSesion);
        document.getElementById('btn-ver-sitio')?.addEventListener('click', () => {
            if (typeof window.navegarA === 'function') window.navegarA('inicio');
        });

        document.querySelectorAll('.admin-nav-btn[data-seccion]').forEach(btn =>
            btn.addEventListener('click', () => navegarSeccion(btn.dataset.seccion))
        );

        // Listeners directos para abrir los modales
        document.getElementById('btn-nueva-maquina')?.addEventListener('click', window.abrirModalCrear);
        document.getElementById('btn-nuevo-admin')?.addEventListener('click', window.abrirModalAdmin);

        // Forms submits
        document.getElementById('form-maquina')?.addEventListener('submit', guardarMaquina);
        document.getElementById('form-nuevo-admin')?.addEventListener('submit', crearAdmin);
        document.getElementById('form-cambiar-pass')?.addEventListener('submit', cambiarContrasenia);

        // Cerrar modales con clic al fondo (overlay)
        ['modal-maquina', 'modal-admin'].forEach(id => {
            document.getElementById(id)?.addEventListener('click', function (e) {
                if (e.target === this) {
                    id === 'modal-maquina' ? window.cerrarModalMaquina() : window.cerrarModalAdmin();
                }
            });
        });

        // Cerrar modales con tecla Escape
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                window.cerrarModalMaquina();
                window.cerrarModalAdmin();
            }
        });
    }

    // Inicializar el panel de administración al cargar el JS
    iniciarAdmin();
})();