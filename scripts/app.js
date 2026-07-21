// ORQUESTADOR QUE VA A ESCUCHAR LOS CLICS EN LOS BOTONES, INYECTAR EL HTML EN EL CONTENIDO PRINCIPAL,
// CARGAR DISEÑOS .CSS, Y ACTUALIZAR ESTADOS


//CONFIGURACION PARA LAS RUTAS
const RUTAS = {
    inicio:    { vista: 'vistas/inicio.html',    css: 'estilos/inicio.css',    js: 'scripts/inicio.js'    },
    servicios: { vista: 'vistas/servicios.html', css: 'estilos/servicios.css', js: 'scripts/servicios.js' },
    proyectos: { vista: 'vistas/proyectos.html', css: 'estilos/proyectos.css', js: 'scripts/proyectos.js' },
    contacto:  { vista: 'vistas/contacto.html',  css: 'estilos/contacto.css',  js: 'scripts/contacto.js'  },
    admin:     { vista: 'vistas/admin.html',      css: 'estilos/admin.css',     js: 'scripts/admin.js'     },
};

//REFERENCIA PARA EL AREA DEL CONTENIDO
const contenedorPrincipal = document.getElementById('contenido-principal');
const piePagina           = document.getElementById('pie-pagina');

//PAGINA ACTUAL
let paginaActual = null;

//FUNCION PARA NAVEGAR A UNA PAGINA
async function navegarA(nombrePagina) {
    if (!RUTAS[nombrePagina]) {
        console.error('Ruta no encontrada:', nombrePagina);
        return;
    }
    if (paginaActual === nombrePagina) return;

    paginaActual = nombrePagina;

    //MOSTRAR CARGA
    contenedorPrincipal.innerHTML = `
        <div class="cargando-vista">
            <div class="spinner"></div>
        </div>
    `;

    //PARA OCULTAR EL PIE DE PAGINA CUANDO SE ESTE EN EL APARTADO DE ADMIN
    if (piePagina) {
        piePagina.style.display = nombrePagina === 'admin' ? 'none' : '';
    }

    //PARA CARGAR ESTILOS .CSS DE LAS VISTAS
    cargarCSS(RUTAS[nombrePagina].css);

    try {
        //PARA CARGAR EL HTML DE LA VISTA
        const respuesta = await fetch(RUTAS[nombrePagina].vista);
        if (!respuesta.ok) {
            throw new Error(`No se pudo cargar: ${RUTAS[nombrePagina].vista} (${respuesta.status})`);
        }
        const htmlVista = await respuesta.text();

        // Inyectar el HTML en el contenedor
        contenedorPrincipal.innerHTML = htmlVista;

        // Scroll al inicio de la pagina
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Actualizar estado del menu
        actualizarMenuActivo(nombrePagina);

        // Cargar el JS de la vista
        await cargarJS(RUTAS[nombrePagina].js);

    } catch (error) {
        console.error('Error al cargar la vista:', error);
        contenedorPrincipal.innerHTML = `
            <div style="text-align:center; padding: 5rem 2rem; color: #6B7280;">
                <p style="font-size: 3rem; margin-bottom: 1rem;">⚠️</p>
                <h2 style="font-family:'Oswald',sans-serif; color:#111827; margin-bottom:0.5rem;">
                    Error al cargar la página
                </h2>
                <p>No se encontró el archivo: <code>${RUTAS[nombrePagina].vista}</code></p>
                <p style="margin-top:0.5rem; font-size:0.875rem;">
                    Esta vista se completará en el siguiente avance académico.
                </p>
            </div>
        `;
    }
}

//PARA CARGAR EL CSS DE MANERA DINAMICA
function cargarCSS(rutaCSS) {
    const idCSS = 'css-' + rutaCSS.replace(/\//g, '-').replace('.css', '');
    if (document.getElementById(idCSS)) return;

    const enlace = document.createElement('link');
    enlace.id   = idCSS;
    enlace.rel  = 'stylesheet';
    enlace.href = rutaCSS;
    document.head.appendChild(enlace);
}

// CARGAR EL JS
function cargarJS(rutaJS) {
    return new Promise((resolve) => {
        // Eliminar el script anterior de la misma vista si existe
        const idJS = 'js-' + rutaJS.replace(/\//g, '-').replace('.js', '');
        const scriptAnterior = document.getElementById(idJS);
        if (scriptAnterior) scriptAnterior.remove();

        const script = document.createElement('script');
        script.id  = idJS;
        script.src = rutaJS + '?v=' + Date.now();
        script.onload  = () => resolve();
        script.onerror = () => {
            console.warn('JS no encontrado (se cargará en el siguiente avance):', rutaJS);
            resolve(); // la app no se detiene si el js no existe
        };
        document.body.appendChild(script);
    });
}

//ACTUALIZAR EL ESTADO DEL MENU
function actualizarMenuActivo(paginaActiva) {
    document.querySelectorAll('.nav-enlace, .btn-admin').forEach(btn => {
        btn.classList.remove('activo');
        if (btn.dataset.pagina === paginaActiva) {
            btn.classList.add('activo');
        }
    });
}

//AL ESCUCHAR CLICS SE INICIA LA NAVEGACION
function inicializarNavegacion() {    
    document.addEventListener('click', function(evento) {
        const boton = evento.target.closest('[data-pagina]');
        if (!boton) return;

        const pagina = boton.dataset.pagina;
        navegarA(pagina);

        //Para cerrar el menu en caso de ser movil
        cerrarMenuMovil();
    });
}

//MENU HAMBURGUESA EN MOVIL
function inicializarMenuMovil() {
    const btnHamburguesa = document.getElementById('btn-hamburguesa');
    const menuMovil      = document.getElementById('menu-movil');

    if (!btnHamburguesa || !menuMovil) return;

    btnHamburguesa.addEventListener('click', function() {
        const estaAbierto = menuMovil.classList.toggle('visible');
        btnHamburguesa.classList.toggle('abierto', estaAbierto);
        btnHamburguesa.setAttribute('aria-expanded', estaAbierto);
    });
}

function cerrarMenuMovil() {
    const menuMovil      = document.getElementById('menu-movil');
    const btnHamburguesa = document.getElementById('btn-hamburguesa');
    if (menuMovil) menuMovil.classList.remove('visible');
    if (btnHamburguesa) {
        btnHamburguesa.classList.remove('abierto');
        btnHamburguesa.setAttribute('aria-expanded', 'false');
    }
}

//ARRANCA LA APLICACION
document.addEventListener('DOMContentLoaded', function() {
    inicializarNavegacion();
    inicializarMenuMovil();
    navegarA('inicio'); // Cargar la pantalla de inicio por defecto
});