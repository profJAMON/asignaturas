/* ============================================================
   Motor de actividades interactivas.
   Cada función recibe un contenedor <div> y el objeto de datos
   de la actividad (tal y como aparece en data/temas.json) y
   pinta la actividad dentro de ese contenedor.

   Para añadir un nuevo tipo de actividad en el futuro:
   1. Escribe una función renderNombreDelTipo(contenedor, datos)
   2. Regístrala en el objeto RENDERERS al final del fichero
   ============================================================ */

function crearElemento(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined) el.textContent = texto;
  return el;
}

/* Igual que crearElemento, pero para textos que pueden llevar fragmentos
   de código mezclados ('Añadir rowspan="5" a la fila <tr>'). Marca esos
   fragmentos como no traducibles para que el traductor automático no los
   convierta en código roto. Ver js/idioma.js. */
function crearElementoConCodigo(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (typeof window.textoConCodigoProtegido === 'function') {
    window.textoConCodigoProtegido(el, texto === undefined ? '' : texto);
  } else {
    el.textContent = texto === undefined ? '' : texto;
  }
  return el;
}

/* ---------- Quiz de opción múltiple ---------- */

function renderQuiz(contenedor, datos) {
  const wrapper = crearElemento('div');
  const preguntasEl = [];

  /* Lo contestado se recuerda entre recargas (ver js/progreso.js).
     Lo que se guarda es QUÉ pulsó, no si acertó: al volver se
     comprueba otra vez contra el json, así que si se corrige una
     respuesta del temario, lo guardado no se queda contradiciendo al
     material. */
  const elegidas = (window.progreso && window.progreso.leerRespuestas(window.SESION_ACTUAL, datos._clave)) || {};

  function recordar() {
    if (!window.progreso) return;
    window.progreso.guardarRespuestas(window.SESION_ACTUAL, datos._clave, elegidas);
  }

  (datos.preguntas || []).forEach((preg, i) => {
    const bloque = crearElemento('div', 'pregunta');
    bloque.appendChild(crearElementoConCodigo('p', 'pregunta__enunciado', `${i + 1}. ${preg.pregunta}`));

    const opcionesEl = crearElemento('div', 'opciones');
    const botones = [];
    const estadoPregunta = { acertada: null };

    /* Pinta una pregunta ya contestada: bloquea las opciones y marca
       la elegida y la buena. Es lo mismo que hace el clic, pero sin
       guardar (si no, recuperar una respuesta la volvería a escribir). */
    function fijar(idx) {
      botones.forEach(b => b.disabled = true);
      estadoPregunta.acertada = idx === preg.correcta;
      if (idx === preg.correcta) {
        botones[idx].classList.add('correcta');
      } else {
        botones[idx].classList.add('incorrecta');
        botones[preg.correcta].classList.add('correcta');
      }
    }

    preg.opciones.forEach((texto, idx) => {
      const boton = crearElementoConCodigo('button', 'opcion', texto);
      boton.type = 'button';
      boton.addEventListener('click', () => {
        fijar(idx);
        elegidas[i] = idx;
        recordar();
        actualizarResultado();
      });
      botones.push(boton);
      opcionesEl.appendChild(boton);
    });

    bloque.appendChild(opcionesEl);
    wrapper.appendChild(bloque);
    preguntasEl.push(estadoPregunta);

    /* Lo de la vez anterior. Se comprueba que el índice siga
       existiendo: si se quitó una opción del json, lo guardado
       apuntaría a un botón que ya no está. */
    const antes = elegidas[i];
    if (Number.isInteger(antes) && botones[antes]) fijar(antes);
  });

  const resultado = crearElemento('p', 'quiz__resultado', '');
  /* role="status" hace que el lector de pantalla lea el resultado en
     cuanto aparece. Sin esto, quien no ve la pantalla contesta y no se
     entera de si ha acertado. Igual en relacionar y en los generadores. */
  resultado.setAttribute('role', 'status');
  wrapper.appendChild(resultado);

  /* Volver a intentarlo. Solo aparece cuando hay algo contestado: en
     un test en blanco no hay nada que borrar. Sin este botón, un test
     recordado se quedaba contestado para siempre y no se podía usar
     para repasar, que es justo para lo que está. */
  const reintentar = crearElemento('button', 'quiz__reintentar', 'Volver a intentarlo');
  reintentar.type = 'button';
  reintentar.hidden = true;
  reintentar.addEventListener('click', () => {
    if (window.progreso) window.progreso.olvidarRespuestas(window.SESION_ACTUAL, datos._clave);
    /* Se vuelve a pintar de cero en el mismo sitio: más corto y más
       seguro que deshacer a mano clase por clase. */
    const padre = wrapper.parentNode;
    wrapper.remove();
    renderQuiz(padre, datos);
  });
  wrapper.appendChild(reintentar);

  function actualizarResultado() {
    const respondidas = preguntasEl.filter(p => p.acertada !== null);
    reintentar.hidden = respondidas.length === 0;
    if (respondidas.length < preguntasEl.length) return;
    const aciertos = preguntasEl.filter(p => p.acertada).length;
    resultado.textContent = `Resultado: ${aciertos} de ${preguntasEl.length} correctas.`;
  }

  /* Por si se ha recuperado algo: pone el marcador y enseña el botón. */
  actualizarResultado();

  contenedor.appendChild(wrapper);
}

/* ---------- Relacionar por clics ---------- */

function renderRelacionar(contenedor, datos) {
  const wrapper = crearElemento('div', 'relacionar');
  const pares = datos.pares || [];

  const izquierda = pares.map((p, i) => ({ texto: p.izquierda, grupo: i }));
  const derecha = pares.map((p, i) => ({ texto: p.derecha, grupo: i }));
  derecha.sort(() => Math.random() - 0.5);

  const colIzq = crearElemento('div', 'relacionar__columna');
  const colDer = crearElemento('div', 'relacionar__columna');

  let seleccionActual = null;
  let aciertos = 0;

  const estado = crearElemento('p', 'relacionar__estado', `0 de ${pares.length} emparejados correctamente.`);
  estado.setAttribute('role', 'status');

  function comprobar(fichaIzq, fichaDer) {
    const acierto = fichaIzq.dataset.grupo === fichaDer.dataset.grupo;
    if (acierto) {
      fichaIzq.classList.remove('seleccionada');
      fichaIzq.classList.add('emparejada-correcta');
      fichaDer.classList.add('emparejada-correcta');
      fichaIzq.disabled = true;
      fichaDer.disabled = true;
      aciertos++;
      estado.textContent = aciertos === pares.length
        ? `¡Completado! ${aciertos} de ${pares.length} emparejados correctamente.`
        : `${aciertos} de ${pares.length} emparejados correctamente.`;
      /* Se apunta el grupo acertado para que siga emparejado si el
         alumno recarga o vuelve más tarde. Ver js/progreso.js. */
      if (window.progreso) {
        const grupo = Number(fichaIzq.dataset.grupo);
        if (!hechos.includes(grupo)) hechos.push(grupo);
        window.progreso.guardarRespuestas(window.SESION_ACTUAL, datos._clave, hechos);
      }
    } else {
      [fichaIzq, fichaDer].forEach(f => {
        f.classList.remove('seleccionada');
        f.classList.add('emparejada-error');
        setTimeout(() => f.classList.remove('emparejada-error'), 500);
      });
    }
    seleccionActual = null;
  }

  izquierda.forEach(item => {
    const ficha = crearElementoConCodigo('button', 'ficha', item.texto);
    ficha.type = 'button';
    ficha.dataset.grupo = item.grupo;
    ficha.dataset.lado = 'izq';
    ficha.addEventListener('click', () => {
      if (ficha.disabled) return;
      colIzq.querySelectorAll('.ficha').forEach(f => f.classList.remove('seleccionada'));
      ficha.classList.add('seleccionada');
      seleccionActual = ficha;
    });
    colIzq.appendChild(ficha);
  });

  derecha.forEach(item => {
    const ficha = crearElementoConCodigo('button', 'ficha', item.texto);
    ficha.type = 'button';
    ficha.dataset.grupo = item.grupo;
    ficha.dataset.lado = 'der';
    ficha.addEventListener('click', () => {
      if (ficha.disabled || !seleccionActual) return;
      comprobar(seleccionActual, ficha);
    });
    colDer.appendChild(ficha);
  });

  /* Lo ya emparejado en una visita anterior. Se guardan los grupos
     acertados, no las posiciones: la columna de la derecha se baraja
     en cada carga, así que una posición guardada no querría decir
     nada la próxima vez. */
  const hechos = (window.progreso && window.progreso.leerRespuestas(window.SESION_ACTUAL, datos._clave)) || [];
  hechos.forEach(grupo => {
    const izq = colIzq.querySelector(`.ficha[data-grupo="${CSS.escape(String(grupo))}"]`);
    const der = colDer.querySelector(`.ficha[data-grupo="${CSS.escape(String(grupo))}"]`);
    if (!izq || !der) return;
    [izq, der].forEach(f => {
      f.classList.add('emparejada-correcta');
      f.disabled = true;
    });
    aciertos++;
  });
  if (aciertos) {
    estado.textContent = aciertos === pares.length
      ? `¡Completado! ${aciertos} de ${pares.length} emparejados correctamente.`
      : `${aciertos} de ${pares.length} emparejados correctamente.`;
  }

  wrapper.appendChild(colIzq);
  wrapper.appendChild(colDer);
  wrapper.appendChild(estado);
  contenedor.appendChild(wrapper);
}

/* ---------- Ejercicios generados por código ---------- */

/* Los enunciados los fabrica js/generadores.js. Aquí solo se pintan:
   una lista de huecos, un botón para corregir y otro para pedir una
   tanda nueva. Como los números cambian cada vez, la bolsa de
   ejercicios no se agota y no sirve de nada copiarle al de al lado. */

function renderGenerador(contenedor, datos) {
  if (typeof generarTanda !== 'function') {
    contenedor.appendChild(crearElemento('p', null, 'No se han podido cargar los ejercicios.'));
    return;
  }

  const wrapper = crearElemento('div', 'generador');
  const lista = crearElemento('div', 'generador__lista');
  const estado = crearElemento('p', 'generador__estado', '');
  estado.setAttribute('role', 'status');

  const barra = crearElemento('div', 'generador__barra');
  const btnComprobar = crearElemento('button', 'boton', 'Comprobar');
  const btnOtra = crearElemento('button', 'boton generador__boton-otra', 'Otra tanda');
  btnComprobar.type = 'button';
  btnOtra.type = 'button';
  barra.appendChild(btnComprobar);
  barra.appendChild(btnOtra);

  const cuantas = datos.n || 8;
  let preguntas = [];
  let campos = [];

  function nuevaTanda() {
    preguntas = generarTanda(datos.generador, cuantas);
    campos = [];
    lista.innerHTML = '';
    estado.textContent = '';

    if (preguntas.length === 0) {
      lista.appendChild(crearElemento('p', null, `No existe el generador "${datos.generador}".`));
      return;
    }

    preguntas.forEach((preg, i) => {
      const fila = crearElemento('div', 'generador__fila');
      fila.appendChild(crearElemento('span', 'generador__numero', `${i + 1}.`));

      const enunciado = crearElemento('span', 'generador__enunciado', preg.enunciado);
      enunciado.setAttribute('translate', 'no');
      fila.appendChild(enunciado);

      const campo = crearElemento('input', 'generador__campo');
      campo.type = 'text';
      campo.autocomplete = 'off';
      campo.spellcheck = false;
      campo.setAttribute('aria-label', `Respuesta del ejercicio ${i + 1}`);
      campo.addEventListener('keydown', e => {
        if (e.key === 'Enter') comprobar();
      });
      fila.appendChild(campo);

      const marca = crearElemento('span', 'generador__marca', '');
      fila.appendChild(marca);

      lista.appendChild(fila);

      const explicacion = crearElemento('p', 'generador__pista', '');
      explicacion.hidden = true;
      lista.appendChild(explicacion);

      campos.push({ campo, marca, explicacion });
    });
  }

  function comprobar() {
    let aciertos = 0;
    let contestadas = 0;

    preguntas.forEach((preg, i) => {
      const { campo, marca, explicacion } = campos[i];
      const valor = campo.value.trim();
      marca.classList.remove('generador__marca--bien', 'generador__marca--mal');

      if (valor === '') {
        marca.textContent = '';
        explicacion.hidden = true;
        return;
      }
      contestadas++;

      if (respuestaCorrecta(preg, valor)) {
        aciertos++;
        marca.textContent = '✓';
        marca.classList.add('generador__marca--bien');
        explicacion.hidden = true;
      } else {
        marca.textContent = '✗';
        marca.classList.add('generador__marca--mal');
        explicacion.textContent = `Era ${preg.respuesta}. ${preg.pista || ''}`.trim();
        explicacion.hidden = false;
      }
    });

    if (contestadas === 0) {
      estado.textContent = 'Escribe alguna respuesta y vuelve a pulsar Comprobar.';
      return;
    }
    estado.textContent = contestadas < preguntas.length
      ? `${aciertos} de ${contestadas} contestadas están bien (te faltan ${preguntas.length - contestadas}).`
      : `${aciertos} de ${preguntas.length} correctas.`;
  }

  btnComprobar.addEventListener('click', comprobar);
  btnOtra.addEventListener('click', nuevaTanda);

  wrapper.appendChild(lista);
  wrapper.appendChild(barra);
  wrapper.appendChild(estado);
  contenedor.appendChild(wrapper);

  nuevaTanda();
}

const RENDERERS = {
  quiz: renderQuiz,
  relacionar: renderRelacionar,
  generador: renderGenerador,
};

/* Cómo se llama cada tipo a la vista del alumno. "generador" no dice
   nada por sí solo: lo que ve es un ejercicio distinto en cada carga. */
const ETIQUETAS_TIPO = {
  quiz: 'Test',
  relacionar: 'Relacionar',
  generador: 'Ejercicio',
};

function renderActividad(contenedor, actividad) {
  const render = RENDERERS[actividad.tipo];
  const caja = crearElemento('div', 'actividad');
  /* El tipo va como atributo porque de él cuelga el color del filo de
     la tarjeta (ver .actividad[data-tipo] en css/estilos.css). */
  if (actividad.tipo) caja.dataset.tipo = actividad.tipo;

  const etiqueta = ETIQUETAS_TIPO[actividad.tipo];
  if (etiqueta) caja.appendChild(crearElemento('p', 'actividad__tipo', etiqueta));

  caja.appendChild(crearElemento('h3', 'actividad__titulo', actividad.titulo || ''));
  if (render) {
    render(caja, actividad);
  } else {
    caja.appendChild(crearElemento('p', null, `Tipo de actividad desconocido: "${actividad.tipo}".`));
  }
  contenedor.appendChild(caja);
}
