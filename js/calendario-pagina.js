/* Pinta calendario.html?a=<asignatura>: la planificación completa de
   una asignatura, unidad por unidad y, donde ya hay sesiones, sesión
   por sesión.

   - Asignatura sin grupos (Operaciones): una sola columna de fechas.
   - Asignatura con grupos (Instalaciones): si no se ha elegido grupo,
     se muestran los grupos en paralelo; en cuanto se elige uno (aquí o
     en cualquier otra página: queda guardado), una sola columna.

   Sin ?a= en la URL se abre Instalaciones, porque el primer enlace que
   existió (calendario.html a secas) era el suyo. */

const _cal = window.calendarioRitmo;
const _asignaturaCalendario = (() => {
  const deUrl = asignaturaDeLaUrl();
  if (deUrl && _cal && _cal.datos(deUrl.id)) return deUrl;
  if (_cal && _cal.datos('instalaciones')) return asignaturaPorId('instalaciones');
  const primera = _cal ? _cal.asignaturasConCalendario()[0] : null;
  return primera ? asignaturaPorId(primera) : null;
})();

cargarBarraLateral(null, _asignaturaCalendario);
pintarCabeceraCalendario();
/* El selector 1r/2n vive en la cabecera de la asignatura, no en la
   barra lateral: solo se pinta si ESTA asignatura tiene grupos. */
if (_asignaturaCalendario && typeof pintarSelectorGrupo === 'function') {
  pintarSelectorGrupo(_asignaturaCalendario.id);
}
pintarPaginaCalendario();
if (typeof pintarRejillaCalendario === 'function') {
  pintarRejillaCalendario(_asignaturaCalendario);
}

function refrescarPaginaCalendario() {
  pintarPaginaCalendario();
}

function pintarCabeceraCalendario() {
  const a = _asignaturaCalendario;
  if (!a) return;
  document.title = `Calendario · ${a.nombre}`;
  const volver = document.getElementById('calendario-volver');
  if (volver) {
    volver.href = urlPortadaAsignatura(a);
    volver.textContent = `← ${a.nombre}`;
  }
  const badge = document.getElementById('calendario-badge');
  if (badge) badge.textContent = _cal.nombreCorto(a.id);
  const nota = document.getElementById('calendario-nota');
  const datos = _cal.datos(a.id);
  if (nota) {
    /* El archivo de datos puede traer su propia nota ("nota"); si no,
       se usa una genérica. */
    nota.textContent = (datos && datos.nota)
      || (_cal.tieneGrupos(a.id)
        ? 'Fechas calculadas a partir de las horas por unidad y el horario real de cada grupo, con el calendario escolar 2026-2027. Pueden retrasarse; sirven para saber si vas bien de tiempo, no como fecha exacta.'
        : 'Fechas calculadas a partir de las horas por unidad y el horario real de la asignatura, con el calendario escolar 2026-2027. Pueden retrasarse; sirven para saber si vas bien de tiempo, no como fecha exacta.');
  }
}

function pintarPaginaCalendario() {
  const contenedor = document.getElementById('calendario-contenido');
  if (!contenedor) return;

  const a = _asignaturaCalendario;
  const datos = a ? _cal.datos(a.id) : null;
  if (!datos) {
    contenedor.innerHTML = '<p class="vacio">No se ha podido cargar el calendario.</p>';
    return;
  }

  const conGrupos = _cal.tieneGrupos(a.id);
  const grupo = _cal.grupoElegido(a.id);
  const hoy = _cal.hoyIso();

  /* Columnas de fecha: [{ etiqueta, grupo }] — grupo null = sin grupos. */
  let columnas;
  if (!conGrupos) columnas = [{ etiqueta: 'Fecha prevista', grupo: null }];
  else if (grupo) columnas = [{ etiqueta: `Fecha prevista (${grupo})`, grupo }];
  else columnas = datos.grupos.map(g => ({ etiqueta: `Fecha prevista (${g.nombre})`, grupo: g.id }));

  /* Con grupos pero sin elegir, no hay una fecha "activa" para marcar
     filas pasadas/hoy. */
  const columnaActiva = columnas.length === 1 ? columnas[0] : null;

  contenedor.innerHTML = '';
  const tabla = document.createElement('table');
  tabla.className = 'calendario-tabla';

  const cabecera = document.createElement('thead');
  const filaCabecera = document.createElement('tr');
  const thUnidad = document.createElement('th');
  thUnidad.textContent = 'Unidad / sesión';
  filaCabecera.appendChild(thUnidad);
  columnas.forEach(c => {
    const th = document.createElement('th');
    th.textContent = c.etiqueta;
    filaCabecera.appendChild(th);
  });
  cabecera.appendChild(filaCabecera);
  tabla.appendChild(cabecera);

  const cuerpo = document.createElement('tbody');

  function anadirCeldas(fila, textos) {
    textos.forEach(texto => {
      const td = document.createElement('td');
      td.textContent = texto || '—';
      if (!texto) td.classList.add('vacio');
      fila.appendChild(td);
    });
  }

  datos.unidades.forEach(unidad => {
    const filaUnidad = document.createElement('tr');
    filaUnidad.className = 'calendario-unidad-titulo';
    const tdTitulo = document.createElement('td');
    tdTitulo.textContent = `${unidad.titulo} (${unidad.horas} h)`;
    filaUnidad.appendChild(tdTitulo);

    anadirCeldas(filaUnidad, columnas.map(c => {
      const f = _cal.fechasUnidad(a.id, unidad.id, c.grupo);
      if (!f || !f.inicio) return null;
      return f.fin
        ? `${_cal.formatearFecha(f.inicio)} – ${_cal.formatearFecha(f.fin)}`
        : `${_cal.formatearFecha(f.inicio)} – fuera de curso`;
    }));
    cuerpo.appendChild(filaUnidad);

    (unidad.sesiones || []).forEach(sesionId => {
      const sesion = datos.sesiones[sesionId];
      if (!sesion) return;
      const fila = document.createElement('tr');

      if (columnaActiva) {
        const iso = _cal.fechaSesion(a.id, sesionId, columnaActiva.grupo);
        if (iso && iso < hoy) fila.classList.add('pasada');
        if (iso === hoy) fila.classList.add('hoy');
      }

      const td = document.createElement('td');
      td.textContent = `　${sesion.titulo}`;
      fila.appendChild(td);

      anadirCeldas(fila, columnas.map(c => {
        const iso = _cal.fechaSesion(a.id, sesionId, c.grupo);
        return iso ? _cal.formatearFecha(iso) : null;
      }));
      cuerpo.appendChild(fila);
    });

    /* Fila del examen de la unidad, si la unidad tiene examen. */
    if (columnas.some(c => _cal.fechaExamen(a.id, unidad.id, c.grupo))) {
      const filaExamen = document.createElement('tr');
      filaExamen.className = 'calendario-examen';

      if (columnaActiva) {
        const iso = _cal.fechaExamen(a.id, unidad.id, columnaActiva.grupo);
        if (iso && iso < hoy) filaExamen.classList.add('pasada');
        if (iso === hoy) filaExamen.classList.add('hoy');
      }

      const tdExamen = document.createElement('td');
      tdExamen.textContent = '　📝 Examen de la unidad';
      filaExamen.appendChild(tdExamen);

      anadirCeldas(filaExamen, columnas.map(c => {
        const iso = _cal.fechaExamen(a.id, unidad.id, c.grupo);
        return iso ? _cal.formatearFecha(iso) : null;
      }));
      cuerpo.appendChild(filaExamen);
    }
  });

  tabla.appendChild(cuerpo);
  contenedor.appendChild(tabla);

  if (typeof retraducir === 'function') retraducir();
}
