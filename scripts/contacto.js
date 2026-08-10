/**LOGICA PARA EL APARTADO DE CONTACTO
 * CONTROLA EL ENVIO DEL FORMULARIO DE CONTACTO RECOPILA LOS DATOS LLENADOS Y ENVIE A LA API contacto.php 
*/
(function () {
    'use strict';

    async function enviarContacto(evento) {
        evento.preventDefault();

        const btn    = document.getElementById('btn-enviar-contacto');
        const error  = document.getElementById('contacto-error');
        const exito  = document.getElementById('contacto-exito');
        const form   = document.getElementById('form-contacto');

        btn.disabled    = true;
        btn.textContent = 'ENVIANDO...';
        error.style.display = 'none';

        const datos = {
            nombres_completos: document.getElementById('ct-nombres').value.trim(),
            correo:            document.getElementById('ct-correo').value.trim(),
            telefono:          document.getElementById('ct-telefono').value.trim(),
            provincia:         document.getElementById('ct-provincia').value,
            ciudad:            document.getElementById('ct-ciudad').value.trim(),
            asunto:            document.getElementById('ct-asunto').value,
            mensaje:           document.getElementById('ct-mensaje').value.trim()
        };

        try {
            const respuesta = await fetch('api/contacto.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body:    JSON.stringify(datos)
            });

            const json = await respuesta.json();

            if (json.exito) {
                form.style.display  = 'none';
                exito.style.display = 'flex';
                form.reset();
            } else {
                error.textContent   = json.mensaje;
                error.style.display = 'block';
                btn.disabled        = false;
                btn.textContent     = 'ENVIAR MENSAJE';
            }

        } catch (err) {
            error.textContent   = 'Error de conexión. Intenta nuevamente.';
            error.style.display = 'block';
            btn.disabled        = false;
            btn.textContent     = 'ENVIAR MENSAJE';
        }
    }

    const form = document.getElementById('form-contacto');
    if (form) form.addEventListener('submit', enviarContacto);

})();