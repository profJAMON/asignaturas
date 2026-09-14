/* Pinta la barra lateral (Temario), compartida por index.html y
   tema.html.

   Dos niveles de desplegable:
     asignatura  →  unidad  →  sesiones

   Solo se descargan los títulos de las sesiones de la asignatura
   abierta. La otra se rellena la primera vez que se despliega, para
   no pedir decenas de archivos que quizá no se van a mirar.

   idActivo:   id de la sesión que se está viendo (null en la portada).
   asigActiva: asignatura que debe salir abierta. Si es null, se abre
               la que contiene la sesión activa; si tampoco la hay, no
               se abre ninguna. */

async function cargarBarraLateral(idActivo, asigActiva) {
  const contenedor = document.getElementById('indice-temas');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  try {
    for (const asignatura of ASIGNATURAS) {
      const curso = await cargarCursoSeguro(asignatura);
      const unidades = curso.unidades || [];

      const bloque = document.createElement('details');
      bloque.className = 'asignatura';

      const resumen = document.createElement('summary');
      resumen.textContent = asignatura.nombre;
      bloque.appendChild(resumen);

      const cuerpo = document.createElement('div');
      cuerpo.className = 'asignatura__cuerpo';
      bloque.appendChild(cuerpo);

      contenedor.appendChild(bloque);

      if (unidades.length === 0) {
        cuerpo.innerHTML = '<p class="vacio">Todavía no hay unidades publicadas.</p>';
        continue;
      }

      /* ¿Tiene esta asignatura la sesión que se está viendo? */
      let esLaActiva = asigActiva ? asigActiva.id === asignatura.id : false;
      if (!asigActiva && idActivo) {
        esLaActiva = unidades.some(u => (u.sesiones || []).includes(idActivo));
      }

      let rellenada = false;
      const rellenar = async () => {
        if (rellenada) return;
        rellenada = true;
        for (const unidad of unidades) {
          const sesiones = await cargarSesionesDeUnidad(asignatura, unidad);
          const contieneActiva = sesiones.some(s => s && s.id === idActivo);

          const detalles = document.createElement('details');
          detalles.className = 'unidad';
          if (contieneActiva) detalles.open = true;

          const resumenUnidad = document.createElement('summary');
          resumenUnidad.textContent = unidad.titulo;
          detalles.appendChild(resumenUnidad);

          sesiones.forEach(sesion => {
            if (!sesion) return;
            const enlace = document.createElement('a');
            enlace.href = urlSesion(sesion.id);
            enlace.textContent = sesion.titulo;
            enlace.className = 'sesion';
            if (sesion.id === idActivo) enlace.classList.add('activa');
            detalles.appendChild(enlace);
          });

          cuerpo.appendChild(detalles);
        }
        /* El temario se ha construido por fetch: avisar al traductor. */
        if (typeof retraducir === 'function') retraducir();
      };

      if (esLaActiva) {
        bloque.open = true;
        await rellenar();
      } else {
        bloque.addEventListener('toggle', () => {
          if (bloque.open) rellenar();
        });
      }
    }

    if (typeof retraducir === 'function') retraducir();
  } catch (error) {
    contenedor.innerHTML = '<p class="vacio">No se ha podido cargar el temario.</p>';
    console.error(error);
  }
}
