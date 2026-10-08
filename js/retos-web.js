/* ============================================================
   Retos rápidos de HTML, CSS y JavaScript (07/10/2026)
   ============================================================
   Actividad de pantalla de 2-3 minutos, pegada a su explicación.
   Cada vez que se carga (o con «Otro reto») sale uno distinto del
   banco del tema. Tres formas:

     elige   «¿Qué código da este resultado?»: se ve el resultado y
             tres códigos; al elegir uno mal, se ve cómo quedaría.
     error   «Encuentra el error»: código + resultado roto; se pulsa
             la línea que falla y se ve arreglada.
     ordena  «Ordena las líneas»: líneas desordenadas con ▲ ▼; «Tu
             página» se actualiza a cada movimiento hasta que queda
             igual que el modelo.

   Desde el .json de la sesión:
     { "id": "reto-listas", "tipo": "reto-web",
       "titulo": "Reto rápido: listas", "banco": "listas" }
   y en el .html, el hueco <div data-actividad="reto-listas"></div>.
   Para un repaso, varios bancos juntos: "banco": "caja,flex,hover".

   Un banco es una lista de retos. Cada reto es un objeto o una
   función que devuelve uno (para que cambien las palabras):

     elige:  { tipo, pregunta, resultado: {html, css, js},
               porque: [null, "por qué la B está mal", …]  (opcional:
               en lugar de enseñar cómo quedaría la elegida),
               opciones: ["código", …], lengua: "html"|"css"|"js",
               fijo: {html|css|js}   lo que no cambia entre opciones,
               explica }                (la primera opción es la buena)
     error:  { tipo, pregunta, lengua, lineas: […], mal: n,
               bien: "línea arreglada", fijo, explica,
               envolver: t => "código de antes" + t + "de después" }
               (envolver, opcional: solo se enseñan las líneas del
               medio, pero se ejecuta el código entero)
     ordena: { tipo, pregunta, lengua, lineas: [… en su orden], fijo,
               explica }
     interpreta: { tipo, pregunta, url, opciones: ["descripción", …],
               porque, explica }   «¿de qué va esta página?»: la URL
               coloreada por partes y tres descripciones.
     consola: { tipo, pregunta, codigo (JS), opciones: ["lo que sale", …],
               porque, fijo, explica }   «¿Qué sale en la consola?»;
               al acertar, se ejecuta de verdad y se ve la consola.
   Opcional en todos: base (carpeta de las rutas, ver js/probador.js).

   Se registra en el motor de actividades (js/actividades.js) como el
   tipo «reto-web», con la etiqueta «Reto rápido». Va DESPUÉS de
   actividades.js y de probador.js en tema.html.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- utilidades ---------- */

  const azar = lista => lista[Math.floor(Math.random() * lista.length)];
  function barajar(lista) {
    const a = lista.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function varios(lista, n) { return barajar(lista).slice(0, n); }
  function el(etiqueta, clase, texto) {
    const e = document.createElement(etiqueta);
    if (clase) e.className = clase;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }
  function codigo(texto, lengua) {
    const pre = el('pre', 'reto__codigo');
    pre.setAttribute('translate', 'no');
    const c = el('code');
    c.innerHTML = window.resaltarCodigo ? window.resaltarCodigo(texto, lengua) : window.PROBADOR.esc(texto);
    pre.appendChild(c);
    return pre;
  }
  function partesCon(fijo, lengua, texto) {
    const p = Object.assign({}, fijo || {});
    p[lengua] = texto;
    return p;
  }
  function rotulo(texto) { return el('p', 'reto__rotulo', texto); }

  /* Con JavaScript, la ventana lleva consola; si no hay HTML, solo consola. */
  function opcionesVista(r, extra) {
    const conJS = r.lengua === 'js' || !!(r.fijo && r.fijo.js);
    const conHTML = r.lengua === 'html' || !!(r.fijo && r.fijo.html) || r.lengua === undefined;
    return Object.assign({ base: r.base, consola: conJS, soloConsola: conJS && !conHTML }, extra);
  }

  /* ---------- elige ---------- */

  function pintarElige(zona, r, estado) {
    const lengua = r.lengua || 'html';
    zona.appendChild(el('p', 'reto__pregunta', r.pregunta || '¿Qué código da este resultado?'));
    const modelo = window.PROBADOR.crearVista(opcionesVista(r, { rotulo: 'así tiene que verse', titulo: 'Resultado que hay que conseguir' }));
    modelo.mostrar(r.resultado || partesCon(r.fijo, lengua, r.opciones[0]));
    zona.appendChild(modelo.el);

    const orden = barajar(r.opciones.map((t, i) => i));
    const lista = el('div', 'reto__opciones');
    lista.setAttribute('role', 'group');
    lista.setAttribute('aria-label', 'Opciones');
    const tuya = window.PROBADOR.crearVista(opcionesVista(r, { rotulo: 'así quedaría la que has elegido', titulo: 'Resultado del código elegido' }));
    tuya.el.hidden = true;
    let resuelto = false;

    orden.forEach((idx, n) => {
      const b = el('button', 'reto__opcion');
      b.type = 'button';
      b.setAttribute('aria-label', `Opción ${'ABC'[n] || n + 1}`);
      const letra = el('span', 'reto__letra', 'ABCD'[n] || String(n + 1));
      letra.setAttribute('aria-hidden', 'true');
      b.appendChild(letra);
      b.appendChild(codigo(r.opciones[idx], lengua));
      b.addEventListener('click', () => {
        if (resuelto) return;
        if (idx === 0) {
          resuelto = true;
          b.classList.add('reto__opcion--bien');
          lista.querySelectorAll('button').forEach(x => { x.disabled = x !== b; });
          tuya.el.hidden = true;
          estado.textContent = '✓ ¡Esa es! ' + (r.explica || '');
          estado.className = 'reto__estado reto__estado--bien';
        } else {
          b.classList.add('reto__opcion--mal');
          b.disabled = true;
          if (r.porque && r.porque[idx]) {
            estado.textContent = '✗ ' + r.porque[idx];
          } else {
            tuya.mostrar(partesCon(r.fijo, lengua, r.opciones[idx]));
            tuya.el.hidden = false;
            estado.textContent = '✗ Esa no: mira abajo cómo quedaría y compárala con el modelo.';
          }
          estado.className = 'reto__estado reto__estado--mal';
        }
      });
      lista.appendChild(b);
    });
    zona.appendChild(lista);
    zona.appendChild(tuya.el);
  }

  /* ---------- error ---------- */

  function pintarError(zona, r, estado) {
    const lengua = r.lengua || 'html';
    zona.appendChild(el('p', 'reto__pregunta', r.pregunta || 'Esto no se ve bien. Pulsa la línea que tiene el error.'));
    const vista = window.PROBADOR.crearVista(opcionesVista(r, { rotulo: 'así se ve ahora', titulo: 'Resultado con el error' }));
    const montar = t => (r.envolver ? r.envolver(t) : t);
    vista.mostrar(partesCon(r.fijo, lengua, montar(r.lineas.join('\n'))));
    zona.appendChild(rotulo(r.lengua === 'css' ? 'CSS (pulsa la línea mala):' : r.lengua === 'js' ? 'JavaScript (pulsa la línea mala):' : 'Código (pulsa la línea mala):'));

    const caja = el('div', 'reto__lineas');
    caja.setAttribute('role', 'group');
    caja.setAttribute('aria-label', 'Líneas del código');
    caja.setAttribute('translate', 'no');
    let resuelto = false;
    r.lineas.forEach((linea, i) => {
      const b = el('button', 'reto__linea');
      b.type = 'button';
      b.setAttribute('aria-label', `Línea ${i + 1}: ${linea.trim() || '(vacía)'}`);
      const num = el('span', 'reto__num', String(i + 1));
      num.setAttribute('aria-hidden', 'true');
      const c = el('code');
      c.innerHTML = window.resaltarCodigo(linea || ' ', lengua);
      b.appendChild(num);
      b.appendChild(c);
      b.addEventListener('click', () => {
        if (resuelto) return;
        if (i === r.mal) {
          resuelto = true;
          b.classList.add('reto__linea--bien');
          c.innerHTML = window.resaltarCodigo(r.bien, lengua);
          b.setAttribute('aria-label', `Línea ${i + 1} arreglada: ${r.bien.trim()}`);
          const arregladas = r.lineas.slice();
          arregladas[i] = r.bien;
          vista.mostrar(partesCon(r.fijo, lengua, montar(arregladas.join('\n'))));
          vista.el.querySelector('.probador__navegador b').textContent = 'arreglado';
          caja.querySelectorAll('button').forEach(x => { x.disabled = true; });
          estado.textContent = '✓ ¡Encontrado! ' + (r.explica || '');
          estado.className = 'reto__estado reto__estado--bien';
        } else {
          b.classList.remove('reto__linea--mal');
          void b.offsetWidth;
          b.classList.add('reto__linea--mal');
          estado.textContent = `✗ La línea ${i + 1} está bien. Mira otra.`;
          estado.className = 'reto__estado reto__estado--mal';
        }
      });
      caja.appendChild(b);
    });
    zona.appendChild(caja);
    zona.appendChild(vista.el);
  }

  /* ---------- ordena ---------- */

  /* Forma «normal» de un CSS: reglas ordenadas y órdenes ordenadas.
     null si no son reglas bien formadas (llaves en su sitio). */
  function canonCSS(t) {
    const reglas = [];
    const resto = t.replace(/([^{}]+)\{([^{}]*)\}/g, (m, sel, cuerpo) => {
      const ord = cuerpo.split(';').map(x => x.trim().replace(/\s*:\s*/, ': ')).filter(Boolean).sort();
      const ultimo = cuerpo.trim();
      if (ultimo && !ultimo.endsWith(';')) ord.push('#sin-punto-y-coma');
      reglas.push(sel.trim() + '{' + ord.join(';') + '}');
      return '';
    });
    if (resto.trim()) return null;
    return reglas.sort().join('\n');
  }

  function pintarOrdena(zona, r, estado) {
    const lengua = r.lengua || 'html';
    zona.appendChild(el('p', 'reto__pregunta', r.pregunta || 'Ordena las líneas para que tu página quede igual que el modelo.'));
    const modelo = window.PROBADOR.crearVista(opcionesVista(r, { rotulo: 'así tiene que quedar', titulo: 'Modelo' }));
    modelo.mostrar(partesCon(r.fijo, lengua, r.lineas.join('\n')));
    zona.appendChild(modelo.el);

    const limpias = r.lineas.map(l => l.trim());
    const bien = limpias.join('\n');
    /* En CSS da igual el orden de las reglas y de las órdenes de una
       regla: se compara «lo que hace», no el orden exacto. */
    const igual = lengua === 'css'
      ? (a => canonCSS(a) !== null && canonCSS(a) === canonCSS(bien))
      : (a => a === bien);
    let orden = barajar(limpias);
    let tries = 0;
    while (igual(orden.join('\n')) && tries++ < 20) orden = barajar(limpias);

    zona.appendChild(rotulo('Mueve las líneas con ▲ y ▼:'));
    const lista = el('ol', 'reto__ordenar');
    lista.setAttribute('translate', 'no');
    const tuya = window.PROBADOR.crearVista(opcionesVista(r, { rotulo: 'tu página', titulo: 'Tu página con las líneas en este orden' }));
    let resuelto = false;

    function pintar(foco) {
      lista.innerHTML = '';
      orden.forEach((linea, i) => {
        const li = el('li', 'reto__fila');
        const c = el('code');
        c.innerHTML = window.resaltarCodigo(linea, lengua);
        const sube = el('button', 'reto__mover', '▲');
        const baja = el('button', 'reto__mover', '▼');
        sube.type = baja.type = 'button';
        sube.setAttribute('aria-label', `Subir la línea ${linea}`);
        baja.setAttribute('aria-label', `Bajar la línea ${linea}`);
        sube.disabled = resuelto || i === 0;
        baja.disabled = resuelto || i === orden.length - 1;
        sube.addEventListener('click', () => mover(i, -1, 'sube'));
        baja.addEventListener('click', () => mover(i, 1, 'baja'));
        li.appendChild(sube);
        li.appendChild(baja);
        li.appendChild(c);
        lista.appendChild(li);
        if (foco && foco.i === i) {
          const b = foco.que === 'sube' ? sube : baja;
          (b.disabled ? (foco.que === 'sube' ? baja : sube) : b).focus();
        }
      });
      tuya.mostrar(partesCon(r.fijo, lengua, orden.join('\n')));
    }
    function mover(i, d, que) {
      const j = i + d;
      if (j < 0 || j >= orden.length) return;
      [orden[i], orden[j]] = [orden[j], orden[i]];
      if (igual(orden.join('\n'))) {
        resuelto = true;
        estado.textContent = '✓ ¡Igual que el modelo! ' + (r.explica || '');
        estado.className = 'reto__estado reto__estado--bien';
        lista.classList.add('reto__ordenar--bien');
      } else {
        estado.textContent = '';
        estado.className = 'reto__estado';
      }
      pintar({ i: j, que });
    }
    zona.appendChild(lista);
    zona.appendChild(tuya.el);
    pintar();
  }

  /* ---------- interpreta: «¿de qué va esta página?» ---------- */

  /* La URL coloreada por partes (mismos colores que el laboratorio
     «Las partes de una URL», variables --lab-*). */
  function urlEnColores(url) {
    const caja = el('p', 'reto__url');
    caja.setAttribute('translate', 'no');
    const m = /^([a-z]+:\/\/)?([^\/?#]*)(\/[^?#]*)?(\?[^#]*)?(#.*)?$/i.exec(url) || [];
    [[m[1], 'protocolo'], [m[2], 'dominio'], [m[3], 'ruta'], [m[4], 'query'], [m[5], 'frag']].forEach(([t, k]) => {
      if (t) caja.appendChild(el('span', 'lab__parte lab__parte--' + k, t));
    });
    return caja;
  }

  function pintarInterpreta(zona, r, estado) {
    zona.appendChild(el('p', 'reto__pregunta', r.pregunta || 'Sin abrirla: ¿de qué va esta página?'));
    zona.appendChild(urlEnColores(r.url));
    const lista = el('div', 'reto__opciones');
    lista.setAttribute('role', 'group');
    lista.setAttribute('aria-label', 'Opciones');
    let resuelto = false;
    barajar(r.opciones.map((t, i) => i)).forEach((idx, n) => {
      const b = el('button', 'reto__opcion reto__opcion--texto');
      b.type = 'button';
      const letra = el('span', 'reto__letra', 'ABCD'[n]);
      letra.setAttribute('aria-hidden', 'true');
      b.appendChild(letra);
      b.appendChild(el('span', null, r.opciones[idx]));
      b.addEventListener('click', () => {
        if (resuelto) return;
        if (idx === 0) {
          resuelto = true;
          b.classList.add('reto__opcion--bien');
          lista.querySelectorAll('button').forEach(x => { x.disabled = x !== b; });
          estado.textContent = '✓ ¡Eso es! ' + (r.explica || '');
          estado.className = 'reto__estado reto__estado--bien';
        } else {
          b.classList.add('reto__opcion--mal');
          b.disabled = true;
          estado.textContent = '✗ ' + ((r.porque && r.porque[idx]) || 'No. Mira otra vez cada parte de la URL.');
          estado.className = 'reto__estado reto__estado--mal';
        }
      });
      lista.appendChild(b);
    });
    zona.appendChild(lista);
  }

  /* ---------- consola: «¿qué sale?» ---------- */

  function pintarConsola(zona, r, estado) {
    zona.appendChild(el('p', 'reto__pregunta', r.pregunta || '¿Qué sale en la consola?'));
    const bloque = codigo(r.codigo, 'js');
    bloque.classList.add('reto__codigo--suelto');
    zona.appendChild(bloque);
    const lista = el('div', 'reto__opciones reto__opciones--consola');
    lista.setAttribute('role', 'group');
    lista.setAttribute('aria-label', 'Opciones');
    const real = window.PROBADOR.crearVista({ consola: true, soloConsola: !(r.fijo && r.fijo.html) });
    real.el.hidden = true;
    let resuelto = false;
    barajar(r.opciones.map((t, i) => i)).forEach((idx, n) => {
      const b = el('button', 'reto__opcion');
      b.type = 'button';
      const letra = el('span', 'reto__letra', 'ABCD'[n]);
      letra.setAttribute('aria-hidden', 'true');
      const salida = el('samp', 'reto__salida', r.opciones[idx]);
      salida.setAttribute('translate', 'no');
      b.appendChild(letra);
      b.appendChild(salida);
      b.setAttribute('aria-label', `Opción ${'ABCD'[n]}: ${r.opciones[idx]}`);
      b.addEventListener('click', () => {
        if (resuelto) return;
        if (idx === 0) {
          resuelto = true;
          b.classList.add('reto__opcion--bien');
          lista.querySelectorAll('button').forEach(x => { x.disabled = x !== b; });
          estado.textContent = '✓ ¡Esa es! ' + (r.explica || '');
          estado.className = 'reto__estado reto__estado--bien';
          zona.appendChild(rotulo('Compruébalo: esto es lo que sale de verdad.'));
          real.el.hidden = false;
          real.mostrar(Object.assign({}, r.fijo || {}, { js: r.codigo }));
          zona.appendChild(real.el);
        } else {
          b.classList.add('reto__opcion--mal');
          b.disabled = true;
          estado.textContent = '✗ ' + ((r.porque && r.porque[idx]) || 'Esa no. Léelo otra vez, línea a línea.');
          estado.className = 'reto__estado reto__estado--mal';
        }
      });
      lista.appendChild(b);
    });
    zona.appendChild(lista);
  }

  const PINTORES = { elige: pintarElige, error: pintarError, ordena: pintarOrdena, consola: pintarConsola, interpreta: pintarInterpreta };

  /* ---------- la actividad ---------- */

  function renderRetoWeb(contenedor, datos) {
    /* "banco" puede juntar varios: "caja,flex,hover" (repasos). */
    const banco = String(datos.banco || '').split(',').flatMap(b => BANCOS[b.trim()] || []);
    const caja = el('div', 'reto-web');
    const zona = el('div', 'reto__zona');
    const estado = el('p', 'reto__estado');
    estado.setAttribute('role', 'status');
    const barra = el('div', 'generador__barra');
    const otro = el('button', 'boton generador__boton-otra', 'Otro reto');
    otro.type = 'button';
    barra.appendChild(otro);
    caja.appendChild(zona);
    caja.appendChild(estado);
    caja.appendChild(barra);
    contenedor.appendChild(caja);

    if (!banco || !banco.length) {
      zona.appendChild(el('p', null, `No existe el banco de retos "${datos.banco}".`));
      otro.hidden = true;
      return;
    }
    let ultimo = -1;
    function nuevo() {
      let i = Math.floor(Math.random() * banco.length);
      if (banco.length > 1) while (i === ultimo) i = Math.floor(Math.random() * banco.length);
      ultimo = i;
      const r = typeof banco[i] === 'function' ? banco[i]() : banco[i];
      zona.innerHTML = '';
      estado.textContent = '';
      estado.className = 'reto__estado';
      (PINTORES[r.tipo] || pintarElige)(zona, r, estado);
    }
    otro.addEventListener('click', nuevo);
    nuevo();
  }

  if (typeof RENDERERS !== 'undefined') RENDERERS['reto-web'] = renderRetoWeb;
  if (typeof ETIQUETAS_TIPO !== 'undefined') ETIQUETAS_TIPO['reto-web'] = 'Reto rápido';

  /* ============================================================
     BANCOS
     ============================================================ */

  const IMG_S03 = 'data/proyecto/proy-html/img/proy-s03/probador/';

  const COSAS = {
    bocadillo: ['Pan', 'Tomate', 'Queso', 'Aceite', 'Jamón', 'Lechuga'],
    mochila: ['Libreta', 'Estuche', 'Agua', 'Bocadillo', 'Cargador', 'Llaves'],
    playa: ['Toalla', 'Crema', 'Gorra', 'Agua', 'Gafas de sol', 'Pelota'],
  };
  const PASOS = [
    ['Enciende el ordenador.', 'Abre VS Code.', 'Abre tu carpeta.', 'Crea el archivo.'],
    ['Pela las patatas.', 'Córtalas en rodajas.', 'Fríelas.', 'Añade el huevo.'],
    ['Ponte el casco.', 'Arranca la moto.', 'Mira por los espejos.', 'Sal despacio.'],
    ['Lava la ropa.', 'Tiéndela.', 'Recógela.', 'Dóblala.'],
  ];

  const BANCOS = {

    /* ---------- S3 · listas ---------- */
    listas: [
      () => {
        const p = azar(PASOS).slice(0, 3);
        const li = p.map(x => `    <li>${x}</li>`).join('\n');
        return {
          tipo: 'elige',
          pregunta: '¿Qué código da este resultado?',
          opciones: [
            `<ol>\n${li}\n</ol>`,
            `<ul>\n${li}\n</ul>`,
            `<ol>\n${p.map((x, i) => `    <li>${i + 1}. ${x}</li>`).join('\n')}\n</ol>`,
          ],
          explica: 'Números = <ol>. Los números los pone el navegador: si los escribes tú, salen dos veces.',
        };
      },
      () => {
        const [k, cosas] = azar(Object.entries(COSAS));
        const c = varios(cosas, 3);
        const li = c.map(x => `    <li>${x}</li>`).join('\n');
        return {
          tipo: 'elige',
          pregunta: '¿Qué código da este resultado?',
          opciones: [
            `<ul>\n${li}\n</ul>`,
            `<ol>\n${li}\n</ol>`,
            c.map(x => `<p>${x}</p>`).join('\n'),
          ],
          explica: 'Puntos = <ul>. Con <p> no sale ningún punto.',
        };
      },
      () => {
        const [a, b] = varios(['Pilotos rápidos', 'Pilotos fuertes', 'Pilotos listos'], 2);
        const [x, y] = varios(['Turbo Rex', 'Chispa', 'Bólido', 'Nube', 'Trueno'], 2);
        return {
          tipo: 'elige',
          pregunta: '¿Qué código da este resultado? Fíjate en los círculos vacíos.',
          opciones: [
            `<ul>\n    <li>${a}\n        <ul>\n            <li>${x}</li>\n            <li>${y}</li>\n        </ul>\n    </li>\n    <li>${b}</li>\n</ul>`,
            `<ul>\n    <li>${a}</li>\n    <li>${x}</li>\n    <li>${y}</li>\n    <li>${b}</li>\n</ul>`,
            `<ul>\n    <li>${a}</li>\n</ul>\n<ol>\n    <li>${x}</li>\n    <li>${y}</li>\n</ol>\n<ul>\n    <li>${b}</li>\n</ul>`,
          ],
          explica: 'La lista pequeña va DENTRO del <li>, antes de su </li>. El navegador la mete a la derecha y le pone círculos.',
        };
      },
      () => {
        const c = varios(azar(Object.values(COSAS)), 3);
        const mal = Math.floor(Math.random() * 3);
        const lineas = ['<h2>Lo que necesitas</h2>', '<ul>'].concat(
          c.map((x, i) => i === mal ? `    <il>${x}</il>` : `    <li>${x}</li>`), ['</ul>']);
        return {
          tipo: 'error',
          pregunta: 'Un elemento ha salido sin su punto. Pulsa la línea que tiene el error.',
          lineas, mal: mal + 2, bien: `    <li>${c[mal]}</li>`,
          explica: 'Era <il> en lugar de <li>. Una etiqueta mal escrita no da error: el navegador la ignora.',
        };
      },
      () => {
        const p = azar(PASOS).slice(0, 3);
        return {
          tipo: 'ordena',
          lineas: ['<h2>Pasos</h2>', '<ol>'].concat(p.map(x => `<li>${x}</li>`), ['</ol>']),
          explica: 'Primero el título, después la lista que se abre, los <li> en orden y al final la lista que se cierra.',
        };
      },
    ],

    /* ---------- S3 · imágenes y rutas ---------- */
    imagenes: [
      () => {
        const [nombre, desc] = azar([['tierra', 'La Tierra'], ['luna', 'La Luna']]);
        const fallos = [
          [`<img src="${nombre}.png" alt="${desc}">`, 'Faltaba la carpeta: img/ delante del nombre.'],
          [`<img src="img/${nombre[0].toUpperCase() + nombre.slice(1)}.png" alt="${desc}">`, 'Había una mayúscula de más. Las rutas tienen que coincidir letra a letra con el nombre del archivo.'],
          [`<img src="img/${nombre}.jpg" alt="${desc}">`, 'La imagen es .png, no .jpg. La extensión también cuenta.'],
          [`<img src="img/${nombre}png" alt="${desc}">`, 'Faltaba el punto antes de la extensión: .png.'],
          [`<img src="img/ ${nombre}.png" alt="${desc}">`, 'Había un espacio dentro de la ruta.'],
        ];
        const [malo, explica] = azar(fallos);
        return {
          tipo: 'error', base: IMG_S03,
          pregunta: 'La imagen no sale: sale su alt. La imagen está en img/' + nombre + '.png. Pulsa la línea del error.',
          lineas: [`<h2>${desc}</h2>`, malo, '<p>Foto de la NASA.</p>'],
          mal: 1, bien: `<img src="img/${nombre}.png" alt="${desc}">`,
          explica,
        };
      },
      () => {
        const [nombre, desc] = azar([['tierra', 'La Tierra'], ['luna', 'La Luna']]);
        return {
          tipo: 'elige', base: IMG_S03,
          pregunta: `La página está en tu carpeta y la imagen en img/${nombre}.png. ¿Qué línea la enseña?`,
          opciones: [
            `<img src="img/${nombre}.png" alt="${desc}">`,
            `<img src="${nombre}.png" alt="${desc}">`,
            `<img scr="img/${nombre}.png" alt="${desc}">`,
          ],
          explica: 'src (no scr) y la ruta empieza por la carpeta: img/',
        };
      },
      () => ({
        tipo: 'elige', base: IMG_S03,
        pregunta: 'Las tres se ven igual. ¿Cuál tiene el mejor alt? (Pista: si borras una letra del src, se lee el alt.)',
        resultado: { html: '<img src="img/tierra.png" alt="">' },
        opciones: [
          '<img src="img/tierra.png" alt="La Tierra vista desde el espacio: océanos azules y nubes blancas">',
          '<img src="img/tierra.png" alt="imagen">',
          '<img src="img/tierra.png" alt="foto1">',
        ],
        porque: [null, '«imagen» no dice qué hay en la imagen. Prueba otra.', '«foto1» no dice qué hay en la imagen. Prueba otra.'],
        explica: 'Un buen alt describe lo que se ve. «imagen» o «foto1» no le dicen nada a quien no puede verla.',
      }),
      () => ({
        tipo: 'error', base: IMG_S03,
        pregunta: 'La imagen de la Luna no sale. Pulsa la línea del error.',
        lineas: ['<h2>La Tierra</h2>', '<img src="img/tierra.png" alt="La Tierra">', '<h2>La Luna</h2>', '<img src="img/luna.png" alt="La Luna"', '<p>Las dos están en la carpeta img.</p>'],
        mal: 3, bien: '<img src="img/luna.png" alt="La Luna">',
        explica: 'Faltaba el > que cierra la etiqueta.',
      }),
      () => {
        const [nombre, desc] = azar([['tierra', 'La Tierra'], ['luna', 'La Luna']]);
        return {
          tipo: 'ordena', base: IMG_S03,
          lineas: [`<h2>${desc}</h2>`, `<img src="img/${nombre}.png" alt="${desc}">`, '<hr>', '<p>Imagen: Wikimedia Commons</p>'],
          explica: 'Título, imagen, raya y la fuente de la imagen al final.',
        };
      },
    ],

    /* ---------- S4 · enlaces y menú ---------- */
    enlaces: [
      () => {
        const [texto, url, frase] = azar([['Wikipedia', 'https://es.wikipedia.org', 'a la Wikipedia'], ['El tiempo', 'https://www.aemet.es', 'a la web del tiempo'], ['Mapas', 'https://www.openstreetmap.org', 'a una web de mapas']]);
        return {
          tipo: 'elige',
          pregunta: `Quieres un enlace ${frase} que se abra en una pestaña nueva. ¿Qué código es?`,
          resultado: { html: `<p><a href="${url}">${texto}</a></p>` },
          opciones: [
            `<a href="${url}" target="_blank">${texto}</a>`,
            `<a href="${url.replace('https://', '')}" target="_blank">${texto}</a>`,
            `<a target="_blank">${url}</a>`,
          ],
          porque: [null, 'Sin https:// el navegador busca un archivo de tu carpeta con ese nombre.', 'Sin href el enlace no lleva a ningún sitio, y el texto que se ve sería la dirección.'],
          explica: 'href = adónde lleva (con https://), target="_blank" = pestaña nueva, y entre <a> y </a> el texto que se ve.',
        };
      },
      () => {
        const pag = azar([['circuitos.html', 'Circuitos'], ['personajes.html', 'Personajes'], ['torneo.html', 'Torneo']]);
        return {
          tipo: 'elige',
          pregunta: `En el menú falta el enlace a tu página ${pag[1]} (el archivo ${pag[0]}, en la misma carpeta). ¿Cuál es?`,
          resultado: { html: `<nav><a href="index.html">Inicio</a> <a href="${pag[0]}">${pag[1]}</a></nav>` },
          fijo: {},
          opciones: [
            `<a href="${pag[0]}">${pag[1]}</a>`,
            `<a href="https://${pag[0]}">${pag[1]}</a>`,
            `<a href="${pag[1]}">${pag[0]}</a>`,
          ],
          porque: [null, 'Con https:// buscaría una web de Internet que se llama así. A tus páginas se va con el nombre del archivo, sin https://.', 'Al revés: el nombre del archivo va en href y el texto que se ve, entre <a> y </a>.'],
          explica: 'Entre tus páginas, el href es el nombre del archivo tal cual.',
        };
      },
      () => {
        const fallos = [
          ['<a herf="circuitos.html">Circuitos</a>', 'Era herf: se escribe href (h-r-e-f). Pulsa Circuitos y verás que no va a ningún sitio.'],
          ['<a href="circuitos.html>Circuitos</a>', 'Faltaban las comillas de cierre del href: se come el resto de la línea.'],
          ['<a href="circuitos.html">Circuitos', 'Faltaba el </a>: todo lo de detrás se vuelve parte del enlace.'],
        ];
        const [malo, explica] = azar(fallos);
        return {
          tipo: 'error',
          pregunta: 'El menú no funciona bien. Pulsa los enlaces del resultado y busca la línea del error.',
          lineas: ['<nav>', '    <a href="index.html">Inicio</a>', '    ' + malo, '    <a href="torneo.html">Torneo</a>', '</nav>', '<p>Bienvenido a Pixel Kart.</p>'],
          mal: 2, bien: '    <a href="circuitos.html">Circuitos</a>',
          explica,
        };
      },
      () => ({
        tipo: 'ordena',
        lineas: ['<header>', '<nav>', '<a href="index.html">Inicio</a> <a href="circuitos.html">Circuitos</a>', '</nav>', '</header>', '<h1>Pixel Kart</h1>'],
        explica: 'header por fuera, nav dentro con los enlaces, y main después con el contenido.',
      }),
    ],

    /* ---------- S4 · tablas ---------- */
    tablas: [
      () => {
        const datos = azar([
          [['Equipo', 'Puntos'], ['Los Rayos', '12'], ['Los Tiburones', '9']],
          [['Película', 'Hora'], ['Robots', '21:30'], ['La isla', '23:00']],
          [['Día', 'Deporte'], ['Lunes', 'Fútbol'], ['Martes', 'Tenis']],
        ]);
        const fila = (r, t) => `    <tr>${r.map(x => `<${t}>${x}</${t}>`).join('')}</tr>`;
        const bien = ['<table border="1">', fila(datos[0], 'th'), fila(datos[1], 'td'), fila(datos[2], 'td'), '</table>'].join('\n');
        const sinTh = ['<table border="1">', fila(datos[0], 'td'), fila(datos[1], 'td'), fila(datos[2], 'td'), '</table>'].join('\n');
        const columnas = ['<table border="1">', `    <tr>${[datos[0][0], datos[1][0], datos[2][0]].map(x => `<th>${x}</th>`).join('')}</tr>`, `    <tr>${[datos[0][1], datos[1][1], datos[2][1]].map(x => `<td>${x}</td>`).join('')}</tr>`, '</table>'].join('\n');
        return {
          tipo: 'elige', pregunta: '¿Qué código da esta tabla? Fíjate en la primera fila.',
          opciones: [bien, sinTh, columnas],
          explica: 'Cada <tr> es una fila. La de los títulos lleva <th> (negrita y centrado); las de datos, <td>.',
        };
      },
      () => {
        const fallos = [
          [2, '    <tr><td>Volcán</td></tr>', '    <tr><td>Volcán</td><td>Difícil</td></tr>', 'A una fila le faltaba una celda: todas las filas tienen que tener las mismas.'],
          [0, '<table>', '<table border="1">', 'Faltaba border="1": la tabla estaba, pero sin bordes no se veía.'],
          [1, '    <tr><td>Circuito</td><td>Dificultad</td></tr>', '    <tr><th>Circuito</th><th>Dificultad</th></tr>', 'Los títulos de columna van en <th>, no en <td>: por eso no salían en negrita.'],
        ];
        const [mal, malo, bien, explica] = azar(fallos);
        const lineas = ['<table border="1">', '    <tr><th>Circuito</th><th>Dificultad</th></tr>', '    <tr><td>Volcán</td><td>Difícil</td></tr>', '    <tr><td>Playa Pixel</td><td>Fácil</td></tr>', '</table>'];
        lineas[mal] = malo;
        return { tipo: 'error', pregunta: 'Esta tabla no se ve como debería. Pulsa la línea del error.', lineas, mal, bien, explica };
      },
      () => {
        const filas = azar([[['Equipo', 'Puntos'], ['Los Rayos', '12'], ['Los Cometas', '7']], [['Comida', 'Precio'], ['Bocadillo', '2 €'], ['Zumo', '1 €']], [['Hora', 'Clase'], ['8:00', 'Redes'], ['9:00', 'Proyecto']]]);
        return {
          tipo: 'ordena',
          lineas: ['<table border="1">', `<tr><th>${filas[0][0]}</th><th>${filas[0][1]}</th></tr>`, `<tr><td>${filas[1][0]}</td><td>${filas[1][1]}</td></tr>`, `<tr><td>${filas[2][0]}</td><td>${filas[2][1]}</td></tr>`, '</table>'],
          explica: 'Se abre la tabla, cada fila con su <tr> y sus celdas dentro, y se cierra la tabla.',
        };
      },
    ],

    /* ---------- S5 · formularios ---------- */
    formularios: [
      () => {
        const [que, bien, m1, m2] = azar([
          ['el día de la reserva', 'date', 'text', 'number'],
          ['cuántas vueltas (de 1 a 10)', 'number', 'text', 'date'],
          ['si acepta las normas', 'checkbox', 'text', 'number'],
        ]);
        const linea = t => `<label for="dato">Dato:</label>\n<input type="${t}" id="dato"${t === 'number' ? ' min="1" max="10"' : ''}>`;
        return {
          tipo: 'elige', pregunta: `Quieres preguntar ${que}. ¿Qué caja usas? (Pulsa la caja del modelo para ver cómo funciona.)`,
          opciones: [linea(bien), linea(m1), linea(m2)],
          explica: `Para ${que}, type="${bien}".`,
        };
      },
      () => {
        const p = varios(['Turbo Rex', 'Chispa', 'Bólido', 'Nube'], 3);
        return {
          tipo: 'elige', pregunta: 'Quieres que elijan su piloto de una lista. ¿Qué código da este resultado?',
          opciones: [
            `<select id="piloto">\n${p.map(x => `    <option>${x}</option>`).join('\n')}\n</select>`,
            `<input type="text" id="piloto" placeholder="${p[0]}">`,
            `<ul>\n${p.map(x => `    <li>${x}</li>`).join('\n')}\n</ul>`,
          ],
          explica: 'Un desplegable es <select> y cada opción un <option>.',
        };
      },
      () => {
        const fallos = [
          [1, '<input type="text" id="alias"', 'Al <input> le faltaba el > del final: se come el botón.'],
          [2, '<button type="button">Inscribirme', 'Faltaba </button>: lo de detrás se mete dentro del botón.'],
          [1, '<input type="text" id="alias" placeholder=Por ejemplo: RayoAzul>', 'El placeholder iba sin comillas: solo sale «Por».'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = ['<label for="alias">Tu alias:</label>', '<input type="text" id="alias" placeholder="Por ejemplo: RayoAzul">', '<button type="button">Inscribirme</button>', '<p>Pulsa el botón para apuntarte.</p>'];
        const bien = lineas[mal];
        lineas[mal] = malo;
        return { tipo: 'error', pregunta: 'Este formulario se ve raro. Pulsa la línea del error.', lineas, mal, bien, explica };
      },
      () => ({
        tipo: 'ordena',
        lineas: ['<form>', '<label for="alias">Tu alias:</label>', '<input type="text" id="alias">', '<button type="button">Enviar</button>', '</form>'],
        explica: 'Dentro del <form>: primero el texto (label), luego la caja y al final el botón.',
      }),
    ],

    /* ---------- S8 · CSS: colores y letra ---------- */
    'css-colores': [
      () => {
        const [fondo, letra] = azar([['darkblue', 'yellow'], ['black', 'lime'], ['white', 'red'], ['purple', 'white']]);
        return {
          tipo: 'elige', lengua: 'css', fijo: { html: '<h1>Concierto</h1>\n<p>Sábado a las 20:00.</p>' },
          pregunta: '¿Qué CSS da este resultado?',
          opciones: [
            `body {\n    background-color: ${fondo};\n    color: ${letra};\n}`,
            `body {\n    background-color: ${letra};\n    color: ${fondo};\n}`,
            `body {\n    color: ${fondo};\n}\nh1 {\n    color: ${letra};\n}`,
          ],
          explica: 'background-color pinta el fondo y color, la letra. En body vale para toda la página.',
        };
      },
      () => {
        const [al, tam] = [azar(['center', 'right']), azar([20, 40, 60])];
        return {
          tipo: 'elige', lengua: 'css', fijo: { html: '<h1>Pixel Kart</h1>\n<p>Carreras de karts.</p>' },
          pregunta: '¿Qué CSS da este resultado? Fíjate en el tamaño y en dónde está el título.',
          opciones: [
            `h1 {\n    font-size: ${tam}px;\n    text-align: ${al};\n}`,
            `h1 {\n    font-size: ${tam === 60 ? 20 : 60}px;\n    text-align: ${al};\n}`,
            `p {\n    font-size: ${tam}px;\n    text-align: ${al};\n}`,
          ],
          explica: 'font-size cambia el tamaño y text-align, dónde se coloca el texto. El selector h1 dice a quién se aplica.',
        };
      },
      () => {
        const fallos = [
          [2, '    colr: white;', '    color: white;', 'Era colr: una propiedad mal escrita no da error, simplemente no hace nada.'],
          [1, '    background-color: #1b1b3a', '    background-color: #1b1b3a;', 'Faltaba el ; del final: la línea siguiente deja de funcionar.'],
          [3, '    font-size: 40 px;', '    font-size: 40px;', 'El número y px van pegados: 40px.'],
          [3, '    font-size: 40;', '    font-size: 40px;', 'Faltaba la unidad: 40px.'],
        ];
        const [mal, malo, bien, explica] = azar(fallos);
        const lineas = ['body {', '    background-color: #1b1b3a;', '    color: white;', '    font-size: 40px;', '}'];
        lineas[mal] = malo;
        return { tipo: 'error', lengua: 'css', fijo: { html: '<p>Pixel Kart</p>' }, pregunta: 'Algo del CSS no funciona. Pulsa la línea del error.', lineas, mal, bien, explica };
      },
      () => ({
        tipo: 'ordena', lengua: 'css', fijo: { html: '<h1>Pixel Kart</h1>' },
        lineas: ['h1 {', 'color: orange;', 'text-align: center;', '}'],
        explica: 'Selector, llave que abre, las órdenes y la llave que cierra.',
      }),
    ],

    /* ---------- S8 · selectores y clases ---------- */
    'css-clases': [
      () => {
        const [clase, color] = azar([['oferta', 'red'], ['aviso', 'orange'], ['nuevo', 'green']]);
        const html = `<p class="${clase}">Primero</p>\n<p>Segundo</p>\n<p class="${clase}">Tercero</p>`;
        return {
          tipo: 'elige', lengua: 'css', fijo: { html },
          pregunta: `El HTML es este: ${html.replace(/\n/g, ' ')} — ¿Qué CSS da el resultado?`,
          opciones: [
            `.${clase} {\n    color: ${color};\n}`,
            `p {\n    color: ${color};\n}`,
            `${clase} {\n    color: ${color};\n}`,
          ],
          explica: `Con .${clase} (con punto) solo cambian los que tienen class="${clase}". Con p cambian todos, y sin punto busca una etiqueta <${clase}> que no existe.`,
        };
      },
      () => {
        const fallos = [
          [0, '<p class=".aviso">Hoy no hay clase.</p>', 'En el HTML la clase va sin punto: class="aviso".', 'html'],
          [0, '<p clas="aviso">Hoy no hay clase.</p>', 'Era clas: se escribe class.', 'html'],
          [0, '<p class="Aviso">Hoy no hay clase.</p>', 'Aviso con mayúscula no es lo mismo que aviso.', 'html'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = ['<p class="aviso">Hoy no hay clase.</p>', '<p>Mañana, normal.</p>'];
        lineas[mal] = malo;
        return {
          tipo: 'error', lengua: 'html', fijo: { css: '.aviso {\n    color: red;\n    font-size: 22px;\n}' },
          pregunta: 'El CSS es .aviso { color: red; font-size: 22px; }, pero el aviso no sale rojo. Pulsa la línea del HTML que falla.',
          lineas, mal, bien: '<p class="aviso">Hoy no hay clase.</p>', explica,
        };
      },
      () => ({
        tipo: 'error', lengua: 'css', fijo: { html: '<h1>Pixel Kart</h1>\n<p class="destacado">¡Circuito nuevo!</p>\n<p>Normal.</p>' },
        pregunta: 'El h1 sale naranja, pero el párrafo destacado no cambia. Pulsa la línea del error.',
        lineas: ['h1 {', '    color: orange;', '', '.destacado {', '    color: red;', '}'],
        mal: 2, bien: '}',
        explica: 'Faltaba la } que cierra la regla del h1. Sin ella, la regla de debajo no funciona.',
      }),
      () => ({
        tipo: 'error', lengua: 'css', fijo: { html: '<p class="destacado">¡Circuito nuevo!</p>\n<p>Normal.</p>' },
        pregunta: 'El párrafo destacado no sale rojo. Pulsa la línea del error.',
        lineas: ['body {', '    font-family: Arial, sans-serif;', '}', '', 'destacado {', '    color: red;', '}'],
        mal: 4, bien: '.destacado {',
        explica: 'En el CSS la clase va con punto delante: .destacado',
      }),
    ],

    /* ---------- S9 · la caja ---------- */
    caja: [
      () => {
        const [p, m] = azar([[30, 0], [0, 30], [5, 5]]);
        const html = '<style>body { background-color: #dfe7f5; font-family: Arial, sans-serif; }</style>\n<p class="caja">Caja 1</p>\n<p class="caja">Caja 2</p>';
        const css = (pp, mm) => `.caja {\n    background-color: #fff3bf;\n    border: 3px solid orange;\n    padding: ${pp}px;\n    margin: ${mm}px;\n}`;
        const otras = [[30, 0], [0, 30], [5, 5]].filter(([a, b]) => a !== p || b !== m);
        return {
          tipo: 'elige', lengua: 'css', fijo: { html },
          pregunta: '¿Qué CSS da estas dos cajas? Mira el relleno amarillo y la separación.',
          opciones: [css(p, m), css(...otras[0]), css(...otras[1])],
          explica: 'padding = relleno, dentro del borde (amarillo). margin = separación, fuera del borde (color de la página).',
        };
      },
      () => {
        const fallos = [
          [2, '    border: 2px orange;', 'Al border le faltaba el tipo de línea: 2px solid orange.'],
          [3, '    border-radius: 10;', 'Faltaba la unidad: 10px.'],
          [1, '    padding 15px;', 'Faltaban los dos puntos: padding: 15px;'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = ['.aviso {', '    padding: 15px;', '    border: 2px solid orange;', '    border-radius: 10px;', '    background-color: #fff3bf;', '}'];
        const bien = lineas[mal];
        lineas[mal] = malo;
        return { tipo: 'error', lengua: 'css', fijo: { html: '<p class="aviso">Hoy el circuito del volcán está cerrado.</p>' }, pregunta: 'El aviso tendría que tener borde naranja, esquinas redondas y relleno. Pulsa la línea del error.', lineas, mal, bien, explica };
      },
      () => ({
        tipo: 'elige', lengua: 'css',
        fijo: { html: '<div class="tarjeta"><h2>Turbo Rex</h2><p>El más rápido.</p></div>' },
        pregunta: '¿Qué CSS deja la tarjeta así, estrecha y centrada?',
        opciones: [
          '.tarjeta {\n    width: 200px;\n    margin: 20px auto;\n    border: 2px solid blue;\n}',
          '.tarjeta {\n    margin: 20px auto;\n    border: 2px solid blue;\n}',
          '.tarjeta {\n    width: 200px;\n    margin: 20px;\n    border: 2px solid blue;\n}',
        ],
        explica: 'Para centrar una caja hacen falta las dos cosas: un width y margin con auto a los lados.',
      }),
      () => ({
        tipo: 'ordena', lengua: 'html', fijo: { css: '.tarjeta { border: 2px solid orange; padding: 10px; width: 200px; }' },
        lineas: ['<div class="tarjeta">', '<h2>Chispa</h2>', '<p>La más ágil en las curvas.</p>', '</div>'],
        explica: 'El <div> envuelve todo lo que va dentro de la tarjeta.',
      }),
    ],

    /* ---------- S9 · hover y tablas ---------- */
    hover: [
      () => {
        const fallos = [
          [7, '.boton :hover {', 'Con espacio, :hover no se pega al botón. Va junto: .boton:hover'],
          [7, '.boton-hover {', 'Se escribe con dos puntos: .boton:hover'],
          [7, 'boton:hover {', 'Faltaba el punto de la clase: .boton:hover'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = ['.boton {', '    background-color: #2a2a55;', '    color: white;', '    padding: 10px 20px;', '    text-decoration: none;', '}', '', '.boton:hover {', '    background-color: #ffcc00;', '}'];
        lineas[mal] = malo;
        return {
          tipo: 'error', lengua: 'css', fijo: { html: '<p><a class="boton" href="juego.html">Jugar</a></p>' },
          pregunta: 'Al pasar el ratón por encima de Jugar no cambia nada. Pruébalo y pulsa la línea del error.',
          lineas, mal, bien: '.boton:hover {', explica,
        };
      },
      () => ({
        tipo: 'elige', lengua: 'css',
        fijo: { html: '<table><tr><th>Piloto</th><th>Puntos</th></tr><tr><td>Turbo Rex</td><td>25</td></tr><tr><td>Chispa</td><td>18</td></tr></table>' },
        pregunta: '¿Qué CSS da esta tabla, con una sola línea entre celdas?',
        opciones: [
          'table {\n    border-collapse: collapse;\n}\nth, td {\n    border: 1px solid black;\n    padding: 8px;\n}',
          'th, td {\n    border: 1px solid black;\n    padding: 8px;\n}',
          'table {\n    border: 1px solid black;\n    padding: 8px;\n}',
        ],
        explica: 'El borde se pone a th y td (con coma, a los dos), y border-collapse: collapse junta las líneas dobles en una.',
      }),
      () => ({
        tipo: 'elige', lengua: 'css', fijo: { html: '<p><a class="boton" href="juego.html">Jugar</a></p>' },
        pregunta: 'Así se ve el botón SIN el ratón encima. ¿Qué CSS es? (Pasa el ratón por el modelo para ver cómo cambia.)',
        resultado: { html: '<p><a class="boton" href="juego.html">Jugar</a></p>', css: '.boton { background-color: navy; color: white; padding: 10px 20px; text-decoration: none; }\n.boton:hover { background-color: orange; }' },
        opciones: [
          '.boton {\n    background-color: navy;\n    color: white;\n    padding: 10px 20px;\n    text-decoration: none;\n}\n.boton:hover {\n    background-color: orange;\n}',
          '.boton {\n    background-color: orange;\n    color: white;\n    padding: 10px 20px;\n    text-decoration: none;\n}\n.boton:hover {\n    background-color: navy;\n}',
          '.boton {\n    background-color: navy;\n    color: white;\n    padding: 10px 20px;\n}\n.boton:hover {\n    background-color: orange;\n}',
        ],
        explica: 'En .boton va cómo se ve normal; en .boton:hover, solo lo que cambia con el ratón encima.',
      }),
    ],

    /* ---------- S10 · Flexbox ---------- */
    flex: [
      () => {
        const jc = azar(['center', 'flex-end', 'space-between', 'space-around']);
        const otros = varios(['flex-start', 'center', 'flex-end', 'space-between', 'space-around'].filter(x => x !== jc), 2);
        const css = v => `.fila {\n    display: flex;\n    justify-content: ${v};\n}`;
        return {
          tipo: 'elige', lengua: 'css',
          fijo: { html: '<style>body{font-family:Arial,sans-serif} .fila{border:1px dashed gray;gap:8px} .fila div{padding:8px 14px;background:#ffcc00}</style>\n<div class="fila"><div>A</div><div>B</div><div>C</div></div>' },
          pregunta: '¿Qué justify-content reparte así las cajas?',
          opciones: [css(jc), css(otros[0]), css(otros[1])],
          explica: 'center = juntas en el centro; flex-end = al final; space-between = una en cada punta; space-around = con espacio alrededor de cada una.',
        };
      },
      () => ({
        tipo: 'elige', lengua: 'css',
        fijo: { html: '<style>body{font-family:Arial,sans-serif} .item{padding:8px 14px;border:2px solid orange}</style>\n<ul class="lista">\n    <li class="item">Inicio</li>\n    <li class="item">Jugar</li>\n    <li class="item">Ayuda</li>\n</ul>' },
        pregunta: 'Quieres los <li> en fila. HTML: <ul class="lista"> con tres <li class="item">. ¿Qué CSS?',
        opciones: [
          '.lista {\n    display: flex;\n    gap: 10px;\n}',
          '.item {\n    display: flex;\n    gap: 10px;\n}',
          'li {\n    display: flex;\n    gap: 10px;\n}',
        ],
        explica: 'display: flex va en el CONTENEDOR (la ul), no en las cajas que quieres mover.',
      }),
      () => {
        const fallos = [
          [1, '    display: flexbox;', 'Se escribe display: flex; (flexbox no existe como valor).'],
          [2, '    justify-content: space between;', 'Es space-between, con guion.'],
          [0, '.tarjeta {', 'El display: flex va en el contenedor, .tarjetas (con s), no en cada tarjeta.'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = ['.tarjetas {', '    display: flex;', '    justify-content: space-between;', '}'];
        const bien = lineas[mal];
        lineas[mal] = malo;
        return {
          tipo: 'error', lengua: 'css',
          fijo: { html: '<style>body{font-family:Arial,sans-serif} .tarjeta{width:90px;border:2px solid orange;padding:6px}</style>\n<div class="tarjetas">\n<div class="tarjeta"><b>Rex</b><p>Rápido</p></div>\n<div class="tarjeta"><b>Chispa</b><p>Ágil</p></div>\n</div>' },
          pregunta: 'Las tarjetas tendrían que estar en fila, una en cada punta. Pulsa la línea del error.',
          lineas, mal, bien, explica,
        };
      },
      () => ({
        tipo: 'ordena', lengua: 'css',
        fijo: { html: '<style>body{font-family:Arial,sans-serif} nav a{padding:6px 10px;background:#2a2a55;color:white;text-decoration:none}</style>\n<nav><a href="index.html">Inicio</a><a href="zoo.html">Zoo</a><a href="mapa.html">Mapa</a></nav>' },
        lineas: ['nav {', 'display: flex;', 'justify-content: center;', 'gap: 10px;', '}'],
        explica: 'Todo va dentro de la regla del contenedor, nav.',
      }),
    ],

    /* ---------- S12 · variables y consola ---------- */
    'js-variables': [
      () => {
        const a = azar([2, 3, 4, 5]); const b = azar([6, 7, 8, 9]);
        return {
          tipo: 'consola',
          codigo: `let vueltas = ${a};\nlet tiempoPorVuelta = ${b};\nconsole.log(vueltas * tiempoPorVuelta);`,
          opciones: [String(a * b), `${a}${b}`, 'vueltas * tiempoPorVuelta'],
          porque: [null, 'Eso sería juntar textos. Aquí son números sin comillas: se multiplican.', 'Sin comillas, console.log enseña el VALOR de las variables, no su nombre.'],
          explica: `${a} × ${b} = ${a * b}.`,
        };
      },
      () => {
        const a = azar([3, 4, 5]); const b = azar([1, 2, 6]);
        return {
          tipo: 'consola',
          codigo: `console.log("${a}" + ${b});`,
          opciones: [`${a}${b}`, String(a + b), `"${a}" + ${b}`],
          porque: [null, 'Uno de los dos va entre comillas: es un texto, y el + junta en lugar de sumar.', 'console.log enseña el resultado, no el código.'],
          explica: 'Con un texto de por medio, el + junta.',
        };
      },
      () => {
        const p = azar(['Chispa', 'Turbo Rex', 'Bólido']);
        return {
          tipo: 'consola',
          codigo: `let piloto = "${p}";\nconsole.log("piloto");`,
          opciones: ['piloto', p, `"${p}"`],
          porque: [null, 'Ojo a las comillas del console.log: "piloto" es un texto, no la variable.', 'Las comillas no salen en la consola.'],
          explica: 'Con comillas es el texto «piloto». Para ver lo que guarda la variable, sin comillas: console.log(piloto);',
        };
      },
      () => {
        const p = azar(['Chispa', 'Nube']); const t = azar([98, 120, 75]);
        return {
          tipo: 'consola',
          codigo: `let piloto = "${p}";\nlet tiempo = ${t};\nconsole.log(piloto + "tarda" + tiempo);`,
          opciones: [`${p}tarda${t}`, `${p} tarda ${t}`, `piloto tarda tiempo`],
          porque: [null, 'Los espacios no se ponen solos: tienen que ir dentro de las comillas, " tarda ".', 'Sin comillas, piloto y tiempo se cambian por lo que guardan.'],
          explica: 'Sin espacios dentro de las comillas, todo sale pegado.',
        };
      },
      () => {
        const fallos = [
          [2, 'console.log(pilto);', 'Era pilto: el nombre tiene que ser exactamente el de la variable.'],
          [0, 'let piloto = Turbo Rex;', 'Los textos van entre comillas: "Turbo Rex".'],
          [2, 'console.log(piloto;', 'Faltaba cerrar el paréntesis.'],
          [1, 'let vueltas = "3;', 'Faltaban las comillas de cierre. (Y un número no las necesita: let vueltas = 3;)'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = ['let piloto = "Turbo Rex";', 'let vueltas = 3;', 'console.log(piloto);', 'console.log(vueltas);'];
        const bien = lineas[mal];
        lineas[mal] = malo;
        return { tipo: 'error', lengua: 'js', pregunta: 'La consola enseña un error en rojo. Pulsa la línea que lo tiene.', lineas, mal, bien, explica };
      },
    ],

    /* ---------- S13 · querySelector, clic y textContent ---------- */
    'js-eventos': [
      () => ({
        tipo: 'consola',
        fijo: { html: '<button id="boton">Pulsar</button>' },
        pregunta: '¿Cuándo sale «¡Pulsado!» en la consola?',
        codigo: 'let boton = document.querySelector("#boton");\n\nboton.addEventListener("click", function () {\n    console.log("¡Pulsado!");\n});',
        opciones: ['Cada vez que pulsas el botón', 'Una vez, al cargar la página', 'Nunca'],
        porque: [null, 'Lo de dentro de las llaves no se ejecuta al cargar: espera al clic.', 'Sí sale: el id es el mismo en el HTML y en el JavaScript.'],
        explica: 'Lo de dentro de las llaves se ejecuta en cada clic. Compruébalo pulsando el botón de abajo.',
      }),
      () => {
        const [txt, id] = azar([['Abrir el regalo', 'regalo'], ['Ver el chiste', 'chiste'], ['Ver el tiempo', 'tiempo']]);
        const fallos = [
          [0, `let boton = document.querySelector("boton-${id}");`, 'Faltaba la # delante del id.'],
          [0, `let boton = document.querySelector("#boton${id}");`, 'El id del HTML es boton-' + id + ', con guion: tienen que coincidir letra a letra.'],
          [3, '    texto.textcontent = "¡Sorpresa!";', 'Es textContent, con la C mayúscula. Escrito mal no da error: simplemente no hace nada.'],
          [2, 'boton.addEventListener(click, function () {', 'Faltaban las comillas: "click".'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = [`let boton = document.querySelector("#boton-${id}");`, `let texto = document.querySelector("#${id}");`, 'boton.addEventListener("click", function () {', '    texto.textContent = "¡Sorpresa!";', '});'];
        const bien = lineas[mal];
        lineas[mal] = malo;
        return {
          tipo: 'error', lengua: 'js',
          fijo: { html: `<button id="boton-${id}">${txt}</button>\n<p id="${id}"></p>` },
          pregunta: `Al pulsar «${txt}» no sale nada. Pulsa el botón, mira la consola y busca la línea del error.`,
          lineas, mal, bien, explica,
        };
      },
      () => ({
        tipo: 'elige', lengua: 'js',
        fijo: { html: '<button id="boton">Ver el dato</button>\n<p id="dato">Pulsa el botón.</p>' },
        resultado: { html: '<button id="boton">Ver el dato</button>\n<p id="dato">Pulsa el botón.</p>', js: 'let boton = document.querySelector("#boton");\nlet dato = document.querySelector("#dato");\nboton.addEventListener("click", function () {\n    dato.textContent = "Pixel Kart tiene 8 circuitos.";\n});' },
        pregunta: 'En el modelo, el texto cambia SOLO al pulsar el botón (pruébalo). ¿Qué JavaScript lo hace?',
        opciones: [
          'let boton = document.querySelector("#boton");\nlet dato = document.querySelector("#dato");\nboton.addEventListener("click", function () {\n    dato.textContent = "Pixel Kart tiene 8 circuitos.";\n});',
          'let boton = document.querySelector("#boton");\nlet dato = document.querySelector("#dato");\ndato.textContent = "Pixel Kart tiene 8 circuitos.";',
          'let boton = document.querySelector("#boton");\nlet dato = document.querySelector("#dato");\nboton.addEventListener("click", function () {\n    dato = "Pixel Kart tiene 8 circuitos.";\n});',
        ],
        porque: [null, 'Sin addEventListener, el texto cambia nada más cargar, sin pulsar.', 'Falta .textContent: así solo cambia la variable, no lo que se ve en la página.'],
        explica: 'El cambio va DENTRO de las llaves del addEventListener y con .textContent.',
      }),
      () => ({
        tipo: 'ordena', lengua: 'js',
        fijo: { html: '<button id="boton">Pulsa</button>' },
        lineas: ['let boton = document.querySelector("#boton");', 'boton.addEventListener("click", function () {', 'boton.textContent = "¡Pulsado!";', '});'],
        pregunta: 'Ordena las líneas para que el botón cambie su texto al pulsarlo. Prueba tu página pulsando el botón.',
        explica: 'Primero se busca el botón, después se espera al clic y, dentro de las llaves, lo que hay que hacer.',
      }),
    ],

    /* ---------- S14 · value y Number ---------- */
    'js-value': [
      () => {
        const a = azar([2, 3, 4, 10]); const b = azar([1, 5, 6]);
        return {
          tipo: 'consola',
          fijo: { html: `<input type="number" id="a" value="${a}"> <input type="number" id="b" value="${b}">` },
          pregunta: `En las cajas hay ${a} y ${b}. ¿Qué sale en la consola?`,
          codigo: 'let cajaA = document.querySelector("#a");\nlet cajaB = document.querySelector("#b");\nconsole.log(cajaA.value + cajaB.value);',
          opciones: [`${a}${b}`, String(a + b), 'cajaA.value + cajaB.value'],
          porque: [null, 'value siempre da texto, aunque la caja sea type="number": el + los junta.', 'console.log enseña el resultado, no el código.'],
          explica: 'Para sumar, Number(cajaA.value) + Number(cajaB.value).',
        };
      },
      () => {
        const a = azar([2, 3, 4, 10]); const b = azar([1, 5, 6]);
        return {
          tipo: 'consola',
          fijo: { html: `<input type="number" id="a" value="${a}"> <input type="number" id="b" value="${b}">` },
          pregunta: `En las cajas hay ${a} y ${b}. ¿Qué sale en la consola?`,
          codigo: 'let cajaA = document.querySelector("#a");\nlet cajaB = document.querySelector("#b");\nconsole.log(Number(cajaA.value) + Number(cajaB.value));',
          opciones: [String(a + b), `${a}${b}`, 'NaN'],
          porque: [null, 'Con Number() ya son números: se suman.', 'NaN sale si dentro de Number() hay algo que no es un número. Aquí hay números.'],
          explica: 'Number() convierte el texto en número y el + suma.',
        };
      },
      () => {
        const fallos = [
          [4, '    let alias = cajaAlias.Value;', 'Es .value, en minúsculas. Con .Value sale «undefined».'],
          [4, '    let alias = cajaAlias.textContent;', 'De una caja se lee con .value; textContent es para párrafos.'],
          [2, 'let mensaje = document.querySelector("mensaje");', 'Faltaba la # del id.'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = ['let cajaAlias = document.querySelector("#alias");', 'let boton = document.querySelector("#boton");', 'let mensaje = document.querySelector("#mensaje");', 'boton.addEventListener("click", function () {', '    let alias = cajaAlias.value;', '    mensaje.textContent = "¡Hola, " + alias + "!";', '});'];
        const bien = lineas[mal];
        lineas[mal] = malo;
        return {
          tipo: 'error', lengua: 'js',
          fijo: { html: '<input type="text" id="alias" value="RayoAzul">\n<button type="button" id="boton">Saludar</button>\n<p id="mensaje"></p>' },
          pregunta: 'Pulsa Saludar: no saluda bien. Mira el resultado y la consola, y pulsa la línea del error.',
          lineas, mal, bien, explica,
        };
      },
      () => ({
        tipo: 'elige', lengua: 'js',
        fijo: { html: '<input type="text" id="alias">\n<button type="button" id="boton">Saludar</button>\n<p id="mensaje"></p>' },
        pregunta: 'Escribe tu alias en el modelo y pulsa Saludar. ¿Qué JavaScript saluda con lo que has escrito?',
        opciones: [
          'let cajaAlias = document.querySelector("#alias");\nlet boton = document.querySelector("#boton");\nlet mensaje = document.querySelector("#mensaje");\nboton.addEventListener("click", function () {\n    let alias = cajaAlias.value;\n    mensaje.textContent = "¡Hola, " + alias + "!";\n});',
          'let cajaAlias = document.querySelector("#alias");\nlet boton = document.querySelector("#boton");\nlet mensaje = document.querySelector("#mensaje");\nlet alias = cajaAlias.value;\nboton.addEventListener("click", function () {\n    mensaje.textContent = "¡Hola, " + alias + "!";\n});',
          'let cajaAlias = document.querySelector("#alias");\nlet boton = document.querySelector("#boton");\nlet mensaje = document.querySelector("#mensaje");\nboton.addEventListener("click", function () {\n    mensaje.textContent = "¡Hola, alias!";\n});',
        ],
        porque: [null, 'El value se lee FUERA de las llaves, al cargar, cuando la caja aún está vacía.', 'Con comillas, «alias» es un texto fijo, no lo que hay escrito en la caja.'],
        explica: 'El value se lee dentro de las llaves, en el momento del clic.',
      }),
    ],

    /* ---------- S15 · if / else if / else ---------- */
    'js-if': [
      () => {
        const p = azar([2, 5, 7, 9, 10]);
        const sale = p >= 9 ? '¡Campeón!' : p >= 5 ? 'Buena carrera.' : 'Sigue practicando.';
        return {
          tipo: 'consola',
          codigo: `let puntos = ${p};\n\nif (puntos >= 9) {\n    console.log("¡Campeón!");\n} else if (puntos >= 5) {\n    console.log("Buena carrera.");\n} else {\n    console.log("Sigue practicando.");\n}`,
          opciones: [sale].concat(['¡Campeón!', 'Buena carrera.', 'Sigue practicando.'].filter(x => x !== sale)),
          explica: `Con ${p}, ${p >= 9 ? 'la primera condición ya es verdadera' : p >= 5 ? 'la primera es falsa y la segunda verdadera' : 'las dos son falsas: va al else'}.`,
        };
      },
      () => {
        const e = azar([10, 11, 12, 13]);
        const sale = e >= 12 ? 'Puedes subir.' : 'Todavía no.';
        return {
          tipo: 'consola',
          codigo: `let edad = ${e};\n\nif (edad >= 12) {\n    console.log("Puedes subir.");\n} else {\n    console.log("Todavía no.");\n}`,
          opciones: [sale, sale === 'Puedes subir.' ? 'Todavía no.' : 'Puedes subir.', 'Puedes subir.\nTodavía no.'],
          porque: [null, `Mira bien: ${e} ${e >= 12 ? 'sí' : 'no'} es mayor o igual que 12.`, 'Solo se ejecuta UN camino: o el del if o el del else.'],
          explica: '>= es «mayor o igual»: 12 también cuenta.',
        };
      },
      () => {
        const fallos = [
          [1, '    if (edad = 12) {', 'Con un solo = no comparas, guardas. Para comparar: === (o >= aquí).'],
          [1, '    if edad >= 12 {', 'La condición va entre paréntesis: if (edad >= 12) {'],
          [1, '    if (edad <= 12) {', 'El signo estaba al revés: <= es «menor o igual». Para «12 o más»: >=.'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = ['    let edad = Number(cajaEdad.value);', '    if (edad >= 12) {', '        mensaje.textContent = "Puedes subir.";', '    } else {', '        mensaje.textContent = "Todavía no.";', '    }'];
        const bien = lineas[mal];
        lineas[mal] = malo;
        const todo = l => 'let cajaEdad = document.querySelector("#edad");\nlet boton = document.querySelector("#boton");\nlet mensaje = document.querySelector("#mensaje");\nboton.addEventListener("click", function () {\n' + l + '\n});';
        return {
          tipo: 'error', lengua: 'js',
          fijo: { html: '<input type="number" id="edad" value="9">\n<button type="button" id="boton">¿Puedo subir?</button>\n<p id="mensaje"></p>' },
          pregunta: 'Con 9 años tendría que decir «Todavía no.». Pulsa el botón, mira la consola y busca la línea del error (es la parte de dentro del botón).',
          lineas, mal, bien, explica,
          envolver: todo,
        };
      },
    ],

    /* ---------- S16 · classList ---------- */
    'js-classlist': [
      () => {
        const fallos = [
          [4, '    caja.classList.remove(".oculto");', 'En classList la clase va sin punto: remove("oculto").'],
          [4, '    caja.classList.add("oculto");', 'Para MOSTRAR hay que QUITAR la clase oculto: remove.'],
          [4, '    caja.classlist.remove("oculto");', 'Es classList, con la L mayúscula.'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = ['let caja = document.querySelector("#solucion");', 'let boton = document.querySelector("#boton");', '', 'boton.addEventListener("click", function () {', '    caja.classList.remove("oculto");', '});'];
        const bien = lineas[mal];
        lineas[mal] = malo;
        return {
          tipo: 'error', lengua: 'js',
          fijo: { html: '<style>.oculto { display: none; }</style>\n<p>¿Qué tiene dientes y no come?</p>\n<button id="boton">Ver solución</button>\n<p id="solucion" class="oculto">El peine.</p>' },
          pregunta: 'Al pulsar «Ver solución» tendría que aparecer. Pulsa el botón y busca la línea del error.',
          lineas, mal, bien, explica,
        };
      },
      () => ({
        tipo: 'elige', lengua: 'js',
        fijo: { html: '<style>.encendida { background-color: yellow; }</style>\n<button id="boton">Luz</button>\n<p id="bombilla">💡 Bombilla</p>' },
        pregunta: 'En el modelo, cada clic enciende o apaga la bombilla (pruébalo). ¿Qué JavaScript es?',
        opciones: [
          'let boton = document.querySelector("#boton");\nlet bombilla = document.querySelector("#bombilla");\nboton.addEventListener("click", function () {\n    bombilla.classList.toggle("encendida");\n});',
          'let boton = document.querySelector("#boton");\nlet bombilla = document.querySelector("#bombilla");\nboton.addEventListener("click", function () {\n    bombilla.classList.add("encendida");\n});',
          'let boton = document.querySelector("#boton");\nlet bombilla = document.querySelector("#bombilla");\nboton.addEventListener("click", function () {\n    bombilla.classList.remove("encendida");\n});',
        ],
        porque: [null, 'Con add se enciende, pero ya no se apaga nunca.', 'Con remove nunca se enciende: empieza sin la clase.'],
        explica: 'toggle es un interruptor: pone la clase si no está y la quita si está.',
      }),
      () => ({
        tipo: 'consola',
        fijo: { html: '<p id="caja" class="grande">Hola</p>' },
        pregunta: 'El párrafo empieza con class="grande". ¿Qué sale en la consola?',
        codigo: 'let caja = document.querySelector("#caja");\ncaja.classList.toggle("grande");\ncaja.classList.toggle("grande");\ncaja.classList.toggle("grande");\nconsole.log("Clases: [" + caja.className + "]");',
        opciones: ['Clases: []', 'Clases: [grande]', 'Clases: [grande grande grande]'],
        porque: [null, 'Cuéntalos: la tenía, toggle la quita, toggle la pone, toggle la quita.', 'toggle no repite la clase: o la pone o la quita.'],
        explica: 'Tres toggle: quita, pone, quita. Al final no tiene ninguna clase.',
      }),
      () => ({
        tipo: 'ordena', lengua: 'css',
        fijo: { html: '<button id="b">Modo oscuro</button>\n<p>Pixel Kart</p>', js: 'document.querySelector("#b").addEventListener("click", function () {\n    document.body.classList.toggle("modo-oscuro");\n});' },
        pregunta: 'Ordena el CSS del modo oscuro. Pulsa el botón de tu página para probarlo.',
        lineas: ['body.modo-oscuro {', 'background-color: black;', 'color: white;', '}'],
        explica: 'La regla es para el body cuando tiene la clase modo-oscuro.',
      }),
    ],

    /* ---------- S1 · estructura de la página ---------- */
    estructura: [
      () => {
        const [pest, tit] = azar([['Pixel Kart', 'Bienvenidos'], ['Mi web', 'Hola, mundo'], ['Recetas', 'Tortilla de patatas']]);
        const doc = (t, b) => `<head>\n    <title>${t}</title>\n</head>\n<body>\n    <h1>${b}</h1>\n</body>`;
        return {
          tipo: 'elige',
          pregunta: `Quieres que la pestaña diga «${pest}» y la página, «${tit}». ¿Qué código es? (Mira la barra de arriba de cada resultado.)`,
          opciones: [doc(pest, tit), doc(tit, pest), `<head>\n</head>\n<body>\n    <title>${pest}</title>\n    <h1>${tit}</h1>\n</body>`],
          porque: [null, 'Al revés: lo del <title> sale en la pestaña y lo del <h1>, en la página.', 'El <title> va en el <head>, no en el <body>.'],
          explica: '<title> va en el <head> y es el texto de la pestaña; lo que se ve en la página va en el <body>.',
        };
      },
      () => {
        const fallos = [
          [1, '    <titel>Pixel Kart</titel>', 'Era titel: se escribe title. Una etiqueta mal escrita no da error, pero no funciona.'],
          [4, '    <h1>Pixel Kart<h1>', 'Al </h1> le faltaba la barra: el título no se cierra y todo lo de debajo sale gigante.'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = ['<head>', '    <title>Pixel Kart</title>', '</head>', '<body>', '    <h1>Pixel Kart</h1>', '    <p>El juego de karts más rápido.</p>', '    <p>Hecho en el instituto.</p>', '</body>'];
        const bien = lineas[mal];
        lineas[mal] = malo;
        return { tipo: 'error', pregunta: 'Esta página no sale bien. Mira el resultado (y la barra de la pestaña) y pulsa la línea del error.', lineas, mal, bien, explica };
      },
      () => ({
        tipo: 'ordena',
        lineas: ['<head>', '<title>Mi web</title>', '</head>', '<body>', '<h1>Hola</h1>', '</body>'],
        explica: 'Primero el <head> con el título de la pestaña, después el <body> con lo que se ve.',
      }),
    ],

    /* ---------- S2 · títulos ---------- */
    titulos: [
      () => {
        const [a, b, c] = azar([['El sistema solar', 'Planetas rocosos', 'Marte'], ['Mi barrio', 'Sitios para comer', 'La pizzería'], ['Pixel Kart', 'Circuitos', 'El volcán']]);
        return {
          tipo: 'elige', pregunta: '¿Qué código da este resultado? Fíjate en el tamaño de cada título.',
          opciones: [
            `<h1>${a}</h1>\n<h2>${b}</h2>\n<h3>${c}</h3>`,
            `<h1>${a}</h1>\n<h1>${b}</h1>\n<h1>${c}</h1>`,
            `<h3>${a}</h3>\n<h2>${b}</h2>\n<h1>${c}</h1>`,
          ],
          explica: 'h1 es el más grande e importante; h2, un apartado; h3, un apartado dentro del h2.',
        };
      },
      () => ({
        tipo: 'elige', pregunta: '¿Qué código da dos párrafos separados?',
        opciones: [
          '<p>Primera frase.</p>\n<p>Segunda frase.</p>',
          '<p>Primera frase.\nSegunda frase.</p>',
          '<p>Primera frase. Segunda frase.</p>',
        ],
        porque: [null, 'El navegador ignora el Intro del código: sale todo en una línea.', 'Eso es un solo párrafo.'],
        explica: 'Cada párrafo va en su propio <p>.',
      }),
      () => ({
        tipo: 'ordena',
        lineas: ['<h1>Pixel Kart</h1>', '<p>Carreras de karts.</p>', '<h2>Modos de juego</h2>', '<p>Carrera rápida y campeonato.</p>'],
        explica: 'Se escribe en el mismo orden en que se ve, de arriba abajo.',
      }),
    ],

    /* ---------- S2 · strong, em, br, hr y comentarios ---------- */
    textos: [
      () => ({
        tipo: 'elige', pregunta: '¿Qué código da este resultado?',
        opciones: [
          '<p>Turbo Rex es <strong>muy rápido</strong>.</p>',
          '<p>Turbo Rex es <em>muy rápido</em>.</p>',
          '<p><strong>Turbo Rex es muy rápido.</strong></p>',
        ],
        explica: 'strong = negrita, solo en lo que va entre <strong> y </strong>. em = cursiva.',
      }),
      () => ({
        tipo: 'elige', pregunta: '¿Qué código da este resultado: tres líneas en un mismo párrafo?',
        opciones: [
          '<p>Pabellón<br>Jueves<br>17:00</p>',
          '<p>Pabellón</p>\n<p>Jueves</p>\n<p>17:00</p>',
          '<p>Pabellón<hr>Jueves<hr>17:00</p>',
        ],
        explica: '<br> salta de línea dentro del mismo párrafo. Con tres <p> hay más espacio entre líneas; <hr> dibuja rayas.',
      }),
      () => {
        const fallos = [
          [1, '<p>El kart más rápido es <strong>Turbo Rex, pero es difícil.</p>', 'Faltaba </strong>: la negrita sigue hasta el final.'],
          [0, '<!-- Modos de juego', 'Al comentario le faltaba el --> del final: todo lo de debajo se convierte en comentario y no se ve.'],
          [2, '<p>Circuito del volcán 3 vueltas</p>', 'Faltaba el <br> para que «3 vueltas» salga en otra línea.'],
        ];
        const [mal, malo, explica] = azar(fallos);
        const lineas = ['<!-- Modos de juego -->', '<p>El kart más rápido es <strong>Turbo Rex</strong>, pero es difícil.</p>', '<p>Circuito del volcán<br>3 vueltas</p>', '<hr>', '<p>Fin.</p>'];
        const bien = lineas[mal];
        lineas[mal] = malo;
        return { tipo: 'error', pregunta: 'Algo sale mal en la página. Pulsa la línea del error.', lineas, mal, bien, explica };
      },
    ],

    /* ---------- Operaciones U2 S4 · ¿de qué va esta página? ---------- */
    urls: [
      () => {
        const [tienda, cosa, tipo, nombre] = azar([
          ['tienda-deportes.es', 'zapatillas', 'running', 'zapatillas de running'],
          ['moda-joven.es', 'camisetas', 'futbol', 'camisetas de fútbol'],
          ['mochilas.com', 'mochilas', 'escolares', 'mochilas escolares'],
        ]);
        const color = azar(['azul', 'rojo', 'negro', 'verde']);
        const talla = azar(['38', '40', '42', 'M', 'L']);
        const [frag, queFrag] = azar([['#opiniones', 'las opiniones'], ['#envio', 'cómo se envían'], ['', '']]);
        const sobre = queFrag ? `${queFrag[0].toUpperCase() + queFrag.slice(1)} de ${nombre}` : `${nombre[0].toUpperCase() + nombre.slice(1)}`;
        return {
          tipo: 'interpreta',
          url: `https://www.${tienda}/${cosa}/${tipo}?color=${color}&talla=${talla}${frag}`,
          opciones: [
            `${sobre} de color ${color} y de la talla ${talla}, en una tienda online.`,
            `${sobre} de todos los colores y todas las tallas.`,
            `La página principal de la tienda ${tienda}.`,
          ],
          porque: [null, 'Fíjate en los parámetros, después del ?: color y talla filtran lo que ves.', 'Hay una ruta después del dominio: no es la portada, es una sección concreta.'],
          explica: `La ruta (/${cosa}/${tipo}) dice qué producto; los parámetros, el color y la talla${frag ? '; y el fragmento ' + frag + ', a qué parte de la página salta' : ''}.`,
        };
      },
      () => {
        const [busca, texto] = azar([['recetas+de+tortilla', 'recetas de tortilla'], ['horario+autobus+palma', 'horario autobús palma'], ['como+hacer+un+nudo', 'como hacer un nudo']]);
        return {
          tipo: 'interpreta',
          url: `https://www.google.com/search?q=${busca}`,
          opciones: [
            `Los resultados de Google al buscar «${texto}».`,
            `Una web sobre «${texto}» hecha por Google.`,
            'La página de inicio de Google, vacía.',
          ],
          porque: [null, 'Google no ha hecho esa web: /search es su buscador, y lo que hay detrás de q= es lo que alguien ha buscado.', 'Tiene ruta (/search) y un parámetro q: es una búsqueda hecha, no la portada.'],
          explica: 'q= (de query, «consulta») guarda lo que has escrito en el buscador. El + es un espacio.',
        };
      },
      () => {
        const id = Math.random().toString(36).slice(2, 13);
        const s = azar([90, 120, 300]);
        const min = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
        return {
          tipo: 'interpreta',
          url: `https://www.youtube.com/watch?v=${id}&t=${s}`,
          opciones: [
            `Un vídeo concreto de YouTube que empieza en el minuto ${min}.`,
            `Un vídeo de YouTube que dura ${s} segundos.`,
            'La lista de todos los vídeos de YouTube.',
          ],
          porque: [null, `t=${s} no es lo que dura: es desde dónde empieza a reproducirse (${s} segundos = ${min}).`, 'v= es el código de UN vídeo concreto.'],
          explica: `/watch es «ver»; v= dice qué vídeo y t=${s}, en qué segundo empieza.`,
        };
      },
      () => {
        const [tema, apartado, que] = azar([['Mallorca', 'Clima', 'el clima'], ['Internet', 'Historia', 'la historia'], ['Pizza', 'Ingredientes', 'los ingredientes']]);
        return {
          tipo: 'interpreta',
          url: `https://es.wikipedia.org/wiki/${tema}#${apartado}`,
          opciones: [
            `El artículo de la Wikipedia en español sobre ${tema}, justo en el apartado de ${que}.`,
            `Un artículo de la Wikipedia en inglés sobre ${tema}.`,
            `Una web de ${tema} que se llama Wikipedia.`,
          ],
          porque: [null, 'El subdominio es es.: la Wikipedia en español.', 'wikipedia.org es el dominio: es la Wikipedia. Lo que va en la ruta es el artículo.'],
          explica: `es. = en español; /wiki/${tema} = el artículo; #${apartado} = salta a ese apartado.`,
        };
      },
      () => {
        const [sec, sub, nom] = azar([['deportes', 'futbol', 'de fútbol'], ['cultura', 'cine', 'de cine'], ['tecnologia', 'moviles', 'de móviles']]);
        const dia = String(azar([3, 8, 15, 21])).padStart(2, '0');
        const mes = azar([['10', 'octubre'], ['11', 'noviembre']]);
        return {
          tipo: 'interpreta',
          url: `https://www.diariodelasislas.es/${sec}/${sub}/2026/${mes[0]}/${dia}/el-partido-del-ano.html`,
          opciones: [
            `Una noticia ${nom}, de la sección de ${sec}, publicada el ${Number(dia)} de ${mes[1]} de 2026.`,
            `La portada de un periódico con todas las noticias de hoy.`,
            `Una noticia ${nom} publicada en el año ${dia}.`,
          ],
          porque: [null, 'Tiene una ruta larga hasta un .html: es una página concreta, no la portada.', 'Lee la ruta en orden: año / mes / día.'],
          explica: 'Muchas webs ordenan las rutas como carpetas: sección / tema / año / mes / día / noticia.',
        };
      },
      () => {
        const [curso, grupo] = [azar(['1', '2']), azar(['A', 'B'])];
        return {
          tipo: 'interpreta',
          url: `https://iesramonllull.net/horarios?curso=${curso}&grupo=${grupo}`,
          opciones: [
            `El horario de ${curso}.º ${grupo} en la web del instituto.`,
            `Los horarios de todos los cursos del instituto.`,
            `La lista de alumnos de ${curso}.º ${grupo}.`,
          ],
          porque: [null, 'Los parámetros curso y grupo filtran: solo uno.', 'La ruta es /horarios: va de horarios, no de alumnos.'],
          explica: 'La ruta dice el tema (horarios) y los parámetros, cuál en concreto.',
        };
      },
    ],
  };

  window.RETOS_WEB = { BANCOS, renderRetoWeb };
})();
