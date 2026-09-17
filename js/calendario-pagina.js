/* Pinta calendario.html: la planificación completa de Instalaciones,
   unidad por unidad y, donde ya hay sesiones, sesión por sesión.

   Si no se ha elegido grupo todavía, se muestran las fechas de los
   dos grupos en paralelo. En cuanto se elige uno (aquí o en cualquier
   otra página: queda guardado), se ve una sola columna con la fila de
   "hoy" resaltada. */

cargarBarraLateral(null, asignaturaPorId('instalaciones'));
pintarPaginaCalendario();

function refrescarPaginaCalendario() {
  pintarPaginaCalendario();
}

function pintarPaginaCalendario() {
  const contenedor = document.getElementById('calendario-contenido');
  if (!contenedor) return;

  const cal = window.calendarioInstalaciones;
  const datos = cal ? cal.datos() : null;
  if (!datos) {
    contenedor.innerHTML = '<p class="vacio">No se ha podido cargar el calendario.</p>';
    return;
  }

  const grupo = cal.grupoElegido();
  const hoy = cal.hoyIso();
  contenedor.innerHTML = '';

  const tabla = document.createElement('table');
  tabla.className = 'calendario-tabla';

  const cabecera = document.createElement('thead');
  const filaCabecera = document.createElement('tr');
  const thUnidad = document.createElement('th');
  thUnidad.textContent = 'Unidad / sesión';
  filaCabecera.appendChild(thUnidad);

  if (grupo) {
    const th = document.createElement('th');
    th.textContent = `Fecha prevista (${grupo})`;
    filaCabecera.appendChild(th);
  } else {
    datos.grupos.forEach(g => {
      const th = document.createElement('th');
      th.textContent = `Fecha prevista (${g.nombre})`;
      filaCabecera.appendChild(th);
    });
  }
  cabecera.appendChild(filaCabecera);
  tabla.appendChild(cabecera);

  const cuerpo = document.createElement('tbody');

  function celdasFecha(fechaPorGrupo) {
    // fechaPorGrupo: función (grupoId) -> iso | null
    const celdas = [];
    if (grupo) {
      celdas.push(fechaPorGrupo(grupo));
    } else {
      datos.grupos.forEach(g => celdas.push(fechaPorGrupo(g.id)));
    }
    return celdas;
  }

  datos.unidades.forEach(unidad => {
    const filaUnidad = document.createElement('tr');
    filaUnidad.className = 'calendario-unidad-titulo';
    const tdTitulo = document.createElement('td');
    tdTitulo.textContent = `${unidad.titulo} (${unidad.horas} h)`;
    filaUnidad.appendChild(tdTitulo);

    const celdasUnidad = celdasFecha(g => {
      const f = unidad.fechas[g];
      if (!f) return null;
      if (!f.inicio) return null;
      return f.fin ? `${cal.formatearFecha(f.inicio)} – ${cal.formatearFecha(f.fin)}` : `${cal.formatearFecha(f.inicio)} – fuera de curso`;
    });
    celdasUnidad.forEach(texto => {
      const td = document.createElement('td');
      td.textContent = texto || '—';
      if (!texto) td.classList.add('vacio');
      filaUnidad.appendChild(td);
    });
    cuerpo.appendChild(filaUnidad);

    (unidad.sesiones || []).forEach(sesionId => {
      const sesion = datos.sesiones[sesionId];
      if (!sesion) return;
      const fila = document.createElement('tr');

      const iso1 = sesion['1r'];
      const iso2 = sesion['2n'];
      const isoActivo = grupo ? sesion[grupo] : null;
      if (isoActivo && isoActivo < hoy) fila.classList.add('pasada');
      if (isoActivo === hoy) fila.classList.add('hoy');

      const tdTitulo = document.createElement('td');
      tdTitulo.textContent = `　${sesion.titulo}`;
      fila.appendChild(tdTitulo);

      const celdasSesion = celdasFecha(g => sesion[g] ? cal.formatearFecha(sesion[g]) : null);
      celdasSesion.forEach(texto => {
        const td = document.createElement('td');
        td.textContent = texto || '—';
        if (!texto) td.classList.add('vacio');
        fila.appendChild(td);
      });

      cuerpo.appendChild(fila);
    });
  });

  tabla.appendChild(cuerpo);
  contenedor.appendChild(tabla);

  if (typeof retraducir === 'function') retraducir();
}
