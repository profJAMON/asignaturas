/* ============================================================
   Diapositivas (carrusel paso a paso)
   ============================================================
   Para explicar un concepto en varios pasos, uno detrás de otro, como
   en un PowerPoint: el alumno pasa de diapositiva con las flechas, el
   teclado o deslizando el dedo. El texto de la sesión se queda donde
   está: el carrusel va además, no en lugar del texto.

   Hay dos formas de usarlo en el .html de una sesión.

   1) Diapositivas escritas a mano:

        <div class="diapos" aria-label="Bit y byte, paso a paso">
          <div class="diapo">
            <svg ...>...</svg>
            <p class="diapo__texto">Explicación corta del paso.</p>
          </div>
          <div class="diapo"> ... </div>
        </div>

      Dentro de los SVG, usar las clases d-… (ver css, "Diapositivas"):
      cambian de color con el tema y no se pisan entre dibujos.
      Nunca h2/h3 dentro de una diapositiva (el índice los cogería).

   2) Diapositivas generadas por código (cálculos paso a paso):

        <div class="diapos" data-diapos="decimal-a-binario" data-valor="183"
             aria-label="183 a binario, paso a paso"></div>

      Se crean con el número de data-valor y debajo sale un recuadro
      "Prueba con otro número" para verlo con el que quiera el alumno.
      Generadores disponibles: los de GENERADORES_DIAPOS, más abajo, y
      los que añaden otros archivos (js/diapos-redes.js…) con
      registrarDiapos(). Con data-sin-prueba no sale el recuadro.

   Al imprimir, las escritas a mano salen todas una debajo de otra; las
   generadas, solo la última (que es el resumen completo).
   ============================================================ */

(function () {
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- Ayudas para dibujar SVG ---------- */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function tx(x, y, s, cls, anchor) {
    return `<text x="${x}" y="${y}" class="${cls || 'd-t'}"${anchor ? ` text-anchor="${anchor}"` : ''}>${esc(s)}</text>`;
  }
  function caja(x, y, w, h, cls) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" class="${cls}"/>`;
  }
  function svg(ancho, alto, etiqueta, cuerpo) {
    return `<svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="${esc(etiqueta)}" class="no-traducir" translate="no">${cuerpo}</svg>`;
  }
  function grupos4(bits) {
    return bits.replace(/(.{4})(?=.)/g, '$1 ');
  }

  /* ---------- Generador: decimal a binario ---------- */

  function diaposDecimalABinario(n) {
    const pasos = [];
    let a = n;
    while (a > 0) {
      pasos.push({ a, q: Math.floor(a / 2), r: a % 2 });
      a = Math.floor(a / 2);
    }
    const bits = pasos.map(p => p.r).reverse().join('');
    const bits8 = bits.padStart(8, '0');
    const ALTO_FILA = 24;
    const Y0 = 34;
    const ancho = 340;
    const altoTabla = Y0 + pasos.length * ALTO_FILA + 6;
    /* Todas las diapositivas de la serie miden lo mismo (la tabla más
       el resultado), para que el recuadro no deje huecos ni salte. */
    const alto = altoTabla + 64;

    /* Dibuja las divisiones de 0 a "hasta". Opciones:
       actual: índice de la fila nueva (se resalta)
       restos: true para resaltar todos los restos y la flecha de lectura */
    function tabla(hasta, opc) {
      let s = tx(14, 18, `${n} a binario`, 'd-d');
      for (let i = 0; i <= hasta; i++) {
        const p = pasos[i];
        const y = Y0 + i * ALTO_FILA + 14;
        const esActual = i === opc.actual;
        if (esActual) s += caja(8, y - 16, 236, 22, 'd-caja-act');
        const clsNum = esActual ? 'd-t' : (opc.restos ? 'd-d' : 'd-t');
        /* El dividendo de la fila nueva es el cociente de la de antes:
           los dos en el mismo color para que se vea de dónde sale. */
        const clsA = esActual && i > 0 ? 'd-c' : clsNum;
        s += tx(52, y, String(p.a), clsA, 'end');
        s += tx(60, y, ': 2 =', clsNum);
        const clsQ = (opc.actual === i + 1) ? 'd-c' : clsNum;
        s += tx(132, y, String(p.q), clsQ, 'end');
        s += tx(150, y, 'resto', 'd-d');
        const clsR = (esActual || opc.restos) ? 'd-a d-grande' : 'd-t';
        s += tx(222, y, String(p.r), clsR, 'middle');
      }
      return s;
    }

    const lista = [];

    lista.push({
      svg: svg(ancho, alto, `Vamos a pasar ${n} a binario`,
        tx(170, alto / 2 - 4, String(n), 'd-t d-enorme', 'middle') +
        tx(170, alto / 2 + 28, '÷ 2  ÷ 2  ÷ 2 …', 'd-d', 'middle')),
      texto: `Vamos a pasar el <strong>${n}</strong> a binario. El método: <strong>dividir entre 2</strong> una y otra vez y apuntar lo que sobra (el <strong>resto</strong>).`
    });

    pasos.forEach((p, i) => {
      const porQue = p.r === 0
        ? `${p.a} es par: al dividir entre 2 no sobra nada, el resto es <strong>0</strong>.`
        : `${p.a} es impar: al dividir entre 2 sobra 1, el resto es <strong>1</strong>.`;
      let texto;
      if (i === 0) {
        texto = `${p.a} entre 2 da <strong>${p.q}</strong>. ${porQue}`;
      } else {
        texto = `El cociente de antes, ${p.a}, baja a la línea siguiente y se vuelve a dividir: da <strong>${p.q}</strong>. ${porQue}`;
      }
      if (p.q === 0) {
        texto += ' El cociente ya es <strong>0</strong>: se acabó, no se divide más.';
      }
      lista.push({
        svg: svg(ancho, alto, `División ${i + 1}: ${p.a} entre 2 da ${p.q}, resto ${p.r}`,
          tabla(i, { actual: i })),
        texto
      });
    });

    /* Flecha de lectura, de abajo arriba, al lado de los restos. */
    const yArriba = Y0 + 2;
    const yAbajo = Y0 + (pasos.length - 1) * ALTO_FILA + 14;
    const flecha =
      `<path d="M 252 ${yAbajo} L 252 ${yArriba + 8}" class="d-linea-c"/>` +
      `<path d="M 252 ${yArriba} L 256 ${yArriba + 9} L 248 ${yArriba + 9} z" class="d-relleno-c"/>` +
      tx(264, (yArriba + yAbajo) / 2 - 4, 'se lee', 'd-c') +
      tx(264, (yArriba + yAbajo) / 2 + 10, 'hacia', 'd-c') +
      tx(264, (yArriba + yAbajo) / 2 + 24, 'arriba', 'd-c');
    lista.push({
      svg: svg(ancho, alto, 'Los restos se leen de abajo arriba',
        tabla(pasos.length - 1, { restos: true }) + flecha),
      texto: 'Ahora mira solo la columna de los restos y <strong>léelos de abajo arriba</strong>, siguiendo la flecha. El último resto que apuntaste es la primera cifra.'
    });

    /* La última es el resumen completo: tabla, flecha y resultado. Es
       la que sale al imprimir. */
    let cuerpoFinal = tabla(pasos.length - 1, { restos: true }) + flecha +
      caja(8, altoTabla + 8, 324, 46, 'd-caja-on') +
      tx(20, altoTabla + 37, `${n} =`, 'd-d') +
      tx(205, altoTabla + 39, grupos4(bits), 'd-a d-grande', 'middle');
    let textoFinal = `<strong>${n}</strong> en binario es <strong>${grupos4(bits)}</strong>.`;
    if (bits.length < 8) {
      textoFinal += ` Han salido ${bits.length} cifras. Para tener 8 bits se añaden <strong>ceros a la izquierda</strong>: <strong>${grupos4(bits8)}</strong>. El valor no cambia, igual que 007 es 7.`;
    } else {
      textoFinal += ' Se escribe en grupos de cuatro solo para leerlo mejor.';
    }
    lista.push({ svg: svg(ancho, alto, `${n} en binario es ${grupos4(bits)}`, cuerpoFinal), texto: textoFinal });

    return lista;
  }

  /* ---------- Generador: binario a decimal ---------- */

  const PESOS = [128, 64, 32, 16, 8, 4, 2, 1];

  function diaposBinarioADecimal(bits) {
    const b = bits.split('').map(Number);
    const ancho = 360;
    const X0 = 10;
    const PASO = 43;
    const AN = 37;

    /* estado[i]: 'nada' | 'cero' (ya pasado, no cuenta) | 'uno' (sumado)
       | 'act' (el uno que se suma ahora) */
    function fila(estado, conPesos, suma) {
      let s = '';
      b.forEach((bit, i) => {
        const x = X0 + i * PASO;
        const e = estado[i];
        const clsCaja = e === 'act' ? 'd-caja-act' : (e === 'uno' ? 'd-caja-on' : 'd-caja');
        s += caja(x, 14, AN, 34, clsCaja);
        const clsBit = e === 'cero' ? 'd-d' : (e === 'act' ? 'd-c' : (e === 'uno' ? 'd-a' : 'd-t'));
        s += tx(x + AN / 2, 38, String(bit), clsBit + ' d-grande', 'middle');
        if (conPesos) {
          let clsPeso = 'd-d';
          if (e === 'uno') clsPeso = 'd-t';
          if (e === 'act') clsPeso = 'd-c';
          s += tx(x + AN / 2, 70, String(PESOS[i]), clsPeso, 'middle');
          if (e === 'cero') {
            s += `<path d="M ${x + 6} 66 L ${x + AN - 6} 66" class="d-linea-d"/>`;
          }
          if (e === 'uno' || e === 'act') {
            s += `<path d="M ${x + AN / 2} 51 L ${x + AN / 2} 57" class="${e === 'act' ? 'd-linea-c' : 'd-linea-a'}"/>`;
          }
        }
      });
      if (suma) s += tx(ancho / 2, 104, suma, 'd-t d-grande', 'middle');
      return s;
    }

    const lista = [];
    const vacio = b.map(() => 'nada');
    lista.push({
      svg: svg(ancho, 116, `El número ${grupos4(bits)}`, fila(vacio, false)),
      texto: `Vamos a pasar <strong>${grupos4(bits)}</strong> a decimal. Son 8 cifras: 8 bits.`
    });
    lista.push({
      svg: svg(ancho, 116, 'Debajo de cada cifra, su valor: 128 64 32 16 8 4 2 1', fila(vacio, true)),
      texto: 'Debajo de cada cifra escribe su valor: <strong>128 64 32 16 8 4 2 1</strong>. Se empieza por el 1 a la derecha y cada vez se dobla.'
    });

    const unos = [];
    b.forEach((bit, i) => { if (bit === 1) unos.push(i); });

    if (unos.length === 0) {
      lista.push({
        svg: svg(ancho, 116, 'No hay ningún uno: vale 0', fila(b.map(() => 'cero'), true, '= 0')),
        texto: 'No hay ningún 1: no se suma nada. Vale <strong>0</strong>.'
      });
      return lista;
    }

    const sumados = [];
    let anterior = -1;
    unos.forEach((pos, k) => {
      const estado = b.map((bit, i) => {
        if (i === pos) return 'act';
        if (i < pos) return bit === 1 ? 'uno' : 'cero';
        return 'nada';
      });
      sumados.push(PESOS[pos]);
      const total = sumados.reduce((x, y) => x + y, 0);
      const suma = sumados.length === 1 ? String(total) : `${sumados.join(' + ')} = ${total}`;
      const ceros = [];
      for (let i = anterior + 1; i < pos; i++) ceros.push(PESOS[i]);
      let texto = '';
      if (ceros.length === 1) texto += `Debajo del ${ceros[0]} hay un 0: <strong>no cuenta</strong>. `;
      if (ceros.length > 1) texto += `Debajo del ${ceros.join(', del ')} hay ceros: <strong>no cuentan</strong>. `;
      texto += k === 0
        ? `Aquí hay un 1: su valor, <strong>${PESOS[pos]}</strong>, cuenta.`
        : `Aquí hay un 1: sumo <strong>${PESOS[pos]}</strong>. Llevo <strong>${total}</strong>.`;
      lista.push({
        svg: svg(ancho, 116, `Se suma ${PESOS[pos]}; llevo ${total}`, fila(estado, true, suma)),
        texto
      });
      anterior = pos;
    });

    const total = sumados.reduce((x, y) => x + y, 0);
    const estadoFinal = b.map(bit => (bit === 1 ? 'uno' : 'cero'));
    let textoFinal = `Ya no quedan más unos. <strong>${grupos4(bits)}</strong> en decimal es <strong>${total}</strong>.`;
    if (anterior < 7) textoFinal = 'Los ceros del final tampoco cuentan. ' + textoFinal;
    lista.push({
      svg: svg(ancho, 116, `${grupos4(bits)} en decimal es ${total}`,
        fila(estadoFinal, true, `${sumados.join(' + ')} = ${total}`)),
      texto: textoFinal
    });
    return lista;
  }

  /* ---------- Registro de generadores ----------
     leer(texto) devuelve el valor normalizado o null si no vale. */
  const GENERADORES_DIAPOS = {
    'decimal-a-binario': {
      crear: v => diaposDecimalABinario(Number(v)),
      leer: s => {
        const t = String(s).trim();
        if (!/^\d{1,3}$/.test(t)) return null;
        const n = Number(t);
        return n >= 1 && n <= 255 ? String(n) : null;
      },
      etiqueta: 'Escribe un número del 1 al 255',
      error: 'Tiene que ser un número entero del 1 al 255.',
      modo: 'numeric',
      ejemplo: '200',
      titulo: v => `${v} a binario, paso a paso`
    },
    'binario-a-decimal': {
      crear: v => diaposBinarioADecimal(v),
      leer: s => {
        const t = String(s).replace(/\s+/g, '');
        if (!/^[01]{1,8}$/.test(t)) return null;
        return t.padStart(8, '0');
      },
      etiqueta: 'Escribe un número binario de hasta 8 cifras',
      error: 'Solo ceros y unos, como mucho 8 cifras.',
      modo: 'text',
      ejemplo: '1100 0000',
      titulo: v => `${grupos4(v)} a decimal, paso a paso`
    }
  };

  /* ---------- El carrusel ---------- */

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }

  function diapoDesdeDatos(d) {
    const div = el('div', 'diapo');
    div.innerHTML = d.svg + `<p class="diapo__texto">${d.texto}</p>`;
    return div;
  }

  function montar(raiz) {
    if (raiz.dataset.montado) return;
    raiz.dataset.montado = '1';

    const nombreGen = raiz.dataset.diapos;
    const gen = nombreGen ? GENERADORES_DIAPOS[nombreGen] : null;
    if (nombreGen && !gen) {
      console.warn('[diapos] Generador desconocido:', nombreGen);
      return;
    }

    const pista = el('div', 'diapos__pista');
    if (gen) {
      raiz.classList.add('diapos--imprime-ultima');
    } else {
      Array.from(raiz.querySelectorAll(':scope > .diapo')).forEach(d => {
        d.querySelectorAll('svg').forEach(s => {
          s.classList.add('no-traducir');
          s.setAttribute('translate', 'no');
        });
        pista.appendChild(d);
      });
    }

    raiz.setAttribute('role', 'region');
    raiz.setAttribute('aria-roledescription', 'carrusel');
    raiz.tabIndex = -1;

    const mandos = el('div', 'diapos__mandos');
    const btnAnt = el('button', 'diapos__boton', '‹ Anterior');
    btnAnt.type = 'button';
    const contador = el('p', 'diapos__contador');
    contador.setAttribute('aria-live', 'polite');
    const btnSig = el('button', 'diapos__boton diapos__boton--sig', 'Siguiente ›');
    btnSig.type = 'button';
    mandos.append(btnAnt, contador, btnSig);

    const puntos = el('div', 'diapos__puntos');
    const btnTodas = el('button', 'diapos__todas', 'Ver todas');
    btnTodas.type = 'button';
    btnTodas.setAttribute('aria-pressed', 'false');

    /* Cinta «Paso a paso · N diapositivas» (27/10/2026): que se vea de
       un vistazo que hay más de una. Decorativa para el lector de
       pantalla, que ya oye «carrusel» y «diapositiva N de M». */
    const cabecera = cabeceraCinta('Paso a paso');
    const cuantas = cabecera.querySelector('.diapos__cuantas');

    raiz.innerHTML = '';
    raiz.append(cabecera, pista, mandos, puntos, btnTodas);

    let actual = 0;
    let diapos = [];

    function mostrar(i) {
      actual = Math.max(0, Math.min(i, diapos.length - 1));
      diapos.forEach((d, k) => {
        d.classList.toggle('es-actual', k === actual);
        d.setAttribute('aria-hidden', k === actual || raiz.classList.contains('diapos--todas') ? 'false' : 'true');
      });
      puntos.querySelectorAll('button').forEach((p, k) => {
        p.classList.toggle('es-actual', k === actual);
        if (k === actual) p.setAttribute('aria-current', 'step');
        else p.removeAttribute('aria-current');
      });
      contador.textContent = `${actual + 1} / ${diapos.length}`;
      contador.setAttribute('aria-label', `Diapositiva ${actual + 1} de ${diapos.length}`);
      btnAnt.disabled = actual === 0;
      btnSig.disabled = actual === diapos.length - 1;
      revisarCerca();
    }

    function preparar() {
      diapos = Array.from(pista.children);
      diapos.forEach((d, k) => {
        d.setAttribute('role', 'group');
        d.setAttribute('aria-roledescription', 'diapositiva');
        d.setAttribute('aria-label', `${k + 1} de ${diapos.length}`);
        d.dataset.numero = k + 1;
      });
      cuantas.textContent = diapos.length === 1 ? '1 diapositiva' : `${diapos.length} diapositivas`;
      ponerPasos(diapos, mostrar);
      puntos.innerHTML = '';
      puntos.hidden = diapos.length > 14;
      diapos.forEach((_, k) => {
        const p = el('button', 'diapos__punto');
        p.type = 'button';
        p.setAttribute('aria-label', `Ir a la diapositiva ${k + 1}`);
        p.addEventListener('click', () => mostrar(k));
        puntos.appendChild(p);
      });
      mostrar(0);
    }

    function cargarGenerado(valor) {
      pista.innerHTML = '';
      gen.crear(valor).forEach(d => pista.appendChild(diapoDesdeDatos(d)));
      raiz.setAttribute('aria-label', gen.titulo(valor));
      preparar();
    }

    btnAnt.addEventListener('click', () => mostrar(actual - 1));
    btnSig.addEventListener('click', () => mostrar(actual + 1));

    btnTodas.addEventListener('click', () => {
      const todas = raiz.classList.toggle('diapos--todas');
      btnTodas.textContent = todas ? 'Ver de una en una' : 'Ver todas';
      btnTodas.setAttribute('aria-pressed', String(todas));
      mostrar(actual);
    });

    raiz.addEventListener('keydown', e => {
      if (e.target.closest('input, textarea')) return;
      if (raiz.classList.contains('diapos--todas')) return;
      if (e.key === 'ArrowRight') { mostrar(actual + 1); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { mostrar(actual - 1); e.preventDefault(); }
    });

    /* Deslizar con el dedo: solo cuenta el gesto claramente horizontal. */
    let x0 = null;
    let y0 = null;
    pista.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; });
    pista.addEventListener('pointerup', e => {
      if (x0 === null || raiz.classList.contains('diapos--todas')) return;
      const dx = e.clientX - x0;
      const dy = e.clientY - y0;
      x0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        mostrar(actual + (dx < 0 ? 1 : -1));
      }
    });
    pista.addEventListener('pointercancel', () => { x0 = null; });

    if (gen && 'sinPrueba' in raiz.dataset) {
      cargarGenerado(gen.leer(raiz.dataset.valor || ''));
    } else if (gen) {
      const inicial = gen.leer(raiz.dataset.valor || '');
      if (inicial === null) {
        console.warn('[diapos] data-valor no válido:', raiz.dataset.valor);
        return;
      }
      cargarGenerado(inicial);

      const prueba = el('form', 'diapos__prueba');
      const idCampo = 'diapos-campo-' + Math.random().toString(36).slice(2, 8);
      prueba.innerHTML =
        `<label class="diapos__etiqueta" for="${idCampo}">Prueba con otro número. ${esc(gen.etiqueta)}:</label>` +
        `<div class="diapos__fila">` +
        `<input class="diapos__campo" id="${idCampo}" type="text" inputmode="${gen.modo || 'text'}" autocomplete="off" spellcheck="false" translate="no"${gen.ejemplo ? ` placeholder="${esc(gen.ejemplo)}"` : ''}>` +
        `<button class="boton diapos__ver" type="submit">Ver paso a paso</button>` +
        `</div>` +
        `<p class="diapos__error" role="alert"></p>`;
      raiz.appendChild(prueba);
      const campo = prueba.querySelector('input');
      const error = prueba.querySelector('.diapos__error');
      prueba.addEventListener('submit', e => {
        e.preventDefault();
        const v = gen.leer(campo.value);
        if (v === null) {
          error.textContent = gen.error;
          campo.setAttribute('aria-invalid', 'true');
          return;
        }
        error.textContent = '';
        campo.removeAttribute('aria-invalid');
        cargarGenerado(v);
        raiz.focus({ preventScroll: true });
        pista.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    } else {
      preparar();
    }
  }

  /* Fila de pasos de tiza (28/10/2026): en cada diapositiva, un círculo
     por paso; el actual en amarillo, los vistos en azul y los que faltan
     casi borrados, para que se vea que hay más. Cada círculo lleva a su
     paso (hace lo que hacían los puntos, que ya no se ven). Con más de
     14 pasos no se pone, como los puntos. */
  function ponerPasos(diapos, ir) {
    const n = diapos.length;
    diapos.forEach((d, k) => {
      const vieja = d.querySelector(':scope > .diapo__pasos');
      if (vieja) vieja.remove();
      if (n < 2 || n > 14) return;
      const fila = el('div', 'diapo__pasos');
      fila.setAttribute('role', 'group');
      fila.setAttribute('aria-label', 'Pasos');
      fila.setAttribute('translate', 'no');
      for (let j = 0; j < n; j++) {
        const b = el('button', 'diapo__paso' + (j === k ? ' es-actual' : j < k ? ' es-visto' : ''));
        b.type = 'button';
        b.textContent = j + 1;
        b.setAttribute('aria-label', `Ir a la diapositiva ${j + 1}`);
        if (j === k) b.setAttribute('aria-current', 'step');
        b.addEventListener('click', () => ir(j));
        fila.appendChild(b);
      }
      d.prepend(fila);
    });
  }

  /* Filtro «tiza» para los dibujos (28/10/2026): el trazo tiembla un poco
     y le faltan granitos, como la tiza. Se pone una sola vez en la página. */
  function ponerFiltroTiza() {
    if (document.getElementById('tiza')) return;
    const caja = document.createElement('div');
    caja.setAttribute('aria-hidden', 'true');
    caja.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden';
    caja.innerHTML =
      '<svg width="0" height="0" focusable="false"><filter id="tiza" x="-5%" y="-5%" width="110%" height="110%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="2" result="r"/>' +
      '<feDisplacementMap in="SourceGraphic" in2="r" scale="1.3" result="d"/>' +
      '<feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves="1" result="g"/>' +
      '<feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.35" result="m"/>' +
      '<feComposite in="d" in2="m" operator="in"/></filter></svg>';
    (document.querySelector('main') || document.body).appendChild(caja);
  }

  function cabeceraCinta(texto) {
    const c = el('div', 'diapos__cabecera');
    c.setAttribute('aria-hidden', 'true');
    c.append(el('span', 'diapos__cinta'), el('span', 'diapos__cuantas'));
    c.firstChild.textContent = texto;
    return c;
  }

  /* ---------- Latido al acercar el ratón (27/10/2026) ----------
     ‹ Anterior y Siguiente › laten cuando el ratón está a menos de
     RADIO px, y la luz de detrás de ese botón sube. Solo con ratón (en
     el móvil no hay «cerca»). Vale para los carruseles y para las
     animaciones (js/animaciones.js), que usan los mismos mandos. Con
     movimiento reducido, el CSS quita el latido y deja la luz. */
  const RADIO = 90;
  let ratonX = null;
  let ratonY = null;
  let pendiente = false;

  function distancia(r) {
    const dx = Math.max(r.left - ratonX, 0, ratonX - r.right);
    const dy = Math.max(r.top - ratonY, 0, ratonY - r.bottom);
    return Math.hypot(dx, dy);
  }

  function revisarCerca() {
    pendiente = false;
    document.querySelectorAll('.diapos__mandos').forEach(m => {
      let mejor = null;
      let dMejor = Infinity;
      const botones = m.querySelectorAll(':scope > .diapos__boton');
      if (ratonX !== null) {
        const rm = m.getBoundingClientRect();
        const aLaVista = rm.width > 0 && rm.bottom > -RADIO && rm.top < window.innerHeight + RADIO;
        if (aLaVista) {
          botones.forEach(b => {
            if (b.disabled) return;
            const d = distancia(b.getBoundingClientRect());
            if (d < RADIO && d < dMejor) { mejor = b; dMejor = d; }
          });
        }
      }
      botones.forEach(b => b.classList.toggle('esta-cerca', b === mejor));
      const sig = !!mejor && mejor.classList.contains('diapos__boton--sig');
      m.classList.toggle('cerca-sig', sig);
      m.classList.toggle('cerca-ant', !!mejor && !sig);
    });
  }

  function pedirRevision() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(revisarCerca);
  }

  document.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    ratonX = e.clientX;
    ratonY = e.clientY;
    pedirRevision();
  }, { passive: true });
  document.documentElement.addEventListener('mouseleave', () => { ratonX = null; pedirRevision(); });
  window.addEventListener('blur', () => { ratonX = null; pedirRevision(); });
  window.addEventListener('scroll', () => { if (ratonX !== null) pedirRevision(); }, { passive: true });

  function iniciarDiapos(zona) {
    ponerFiltroTiza();
    (zona || document).querySelectorAll('.diapos').forEach(montar);
  }

  /* Para que otros archivos añadan generadores sin tocar este. */
  function registrarDiapos(nombre, def) {
    GENERADORES_DIAPOS[nombre] = def;
  }

  window.iniciarDiapos = iniciarDiapos;
  window.registrarDiapos = registrarDiapos;
  window.GENERADORES_DIAPOS = GENERADORES_DIAPOS;
  /* Ayudas de dibujo, para los generadores de otros archivos. */
  window.DIAPOS = { tx, caja, svg, esc, grupos4, cabeceraCinta, ponerFiltroTiza };
})();
