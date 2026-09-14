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

  (datos.preguntas || []).forEach((preg, i) => {
    const bloque = crearElemento('div', 'pregunta');
    bloque.appendChild(crearElementoConCodigo('p', 'pregunta__enunciado', `${i + 1}. ${preg.pregunta}`));

    const opcionesEl = crearElemento('div', 'opciones');
    const botones = [];
    const estadoPregunta = { acertada: null };

    preg.opciones.forEach((texto, idx) => {
      const boton = crearElementoConCodigo('button', 'opcion', texto);
      boton.type = 'button';
      boton.addEventListener('click', () => {
        botones.forEach(b => b.disabled = true);
        estadoPregunta.acertada = idx === preg.correcta;
        if (idx === preg.correcta) {
          boton.classList.add('correcta');
        } else {
          boton.classList.add('incorrecta');
          botones[preg.correcta].classList.add('correcta');
        }
        actualizarResultado();
      });
      botones.push(boton);
      opcionesEl.appendChild(boton);
    });

    bloque.appendChild(opcionesEl);
    wrapper.appendChild(bloque);
    preguntasEl.push(estadoPregunta);
  });

  const resultado = crearElemento('p', 'quiz__resultado', '');
  wrapper.appendChild(resultado);

  function actualizarResultado() {
    const respondidas = preguntasEl.filter(p => p.acertada !== null);
    if (respondidas.length < preguntasEl.length) return;
    const aciertos = preguntasEl.filter(p => p.acertada).length;
    resultado.textContent = `Resultado: ${aciertos} de ${preguntasEl.length} correctas.`;
  }

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

function renderActividad(contenedor, actividad) {
  const render = RENDERERS[actividad.tipo];
  const caja = crearElemento('div', 'actividad');
  caja.appendChild(crearElemento('h3', 'actividad__titulo', actividad.titulo || ''));
  if (render) {
    render(caja, actividad);
  } else {
    caja.appendChild(crearElemento('p', null, `Tipo de actividad desconocido: "${actividad.tipo}".`));
  }
  contenedor.appendChild(caja);
}
