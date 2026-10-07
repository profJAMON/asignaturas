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

   Un banco es una lista de retos. Cada reto es un objeto o una
   función que devuelve uno (para que cambien las palabras):

     elige:  { tipo, pregunta, resultado: {html, css, js},
               porque: [null, "por qué la B está mal", …]  (opcional:
               en lugar de enseñar cómo quedaría la elegida),
               opciones: ["código", …], lengua: "html"|"css"|"js",
               fijo: {html|css|js}   lo que no cambia entre opciones,
               explica }                (la primera opción es la buena)
     error:  { tipo, pregunta, lengua, lineas: […], mal: n,
               bien: "línea arreglada", fijo, explica }
     ordena: { tipo, pregunta, lengua, lineas: [… en su orden], fijo,
               explica }
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

  /* ---------- elige ---------- */

  function pintarElige(zona, r, estado) {
    const lengua = r.lengua || 'html';
    zona.appendChild(el('p', 'reto__pregunta', r.pregunta || '¿Qué código da este resultado?'));
    const modelo = window.PROBADOR.crearVista({ base: r.base, rotulo: 'así tiene que verse', titulo: 'Resultado que hay que conseguir' });
    modelo.mostrar(r.resultado || partesCon(r.fijo, lengua, r.opciones[0]));
    zona.appendChild(modelo.el);

    const orden = barajar(r.opciones.map((t, i) => i));
    const lista = el('div', 'reto__opciones');
    lista.setAttribute('role', 'group');
    lista.setAttribute('aria-label', 'Opciones');
    const tuya = window.PROBADOR.crearVista({ base: r.base, rotulo: 'así quedaría la que has elegido', titulo: 'Resultado del código elegido' });
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
    const vista = window.PROBADOR.crearVista({ base: r.base, rotulo: 'así se ve ahora', titulo: 'Resultado con el error' });
    vista.mostrar(partesCon(r.fijo, lengua, r.lineas.join('\n')));
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
          vista.mostrar(partesCon(r.fijo, lengua, arregladas.join('\n')));
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

  function pintarOrdena(zona, r, estado) {
    const lengua = r.lengua || 'html';
    zona.appendChild(el('p', 'reto__pregunta', r.pregunta || 'Ordena las líneas para que tu página quede igual que el modelo.'));
    const modelo = window.PROBADOR.crearVista({ base: r.base, rotulo: 'así tiene que quedar', titulo: 'Modelo' });
    modelo.mostrar(partesCon(r.fijo, lengua, r.lineas.join('\n')));
    zona.appendChild(modelo.el);

    const limpias = r.lineas.map(l => l.trim());
    const bien = limpias.join('\n');
    let orden = barajar(limpias);
    let tries = 0;
    while (orden.join('\n') === bien && tries++ < 20) orden = barajar(limpias);

    zona.appendChild(rotulo('Mueve las líneas con ▲ y ▼:'));
    const lista = el('ol', 'reto__ordenar');
    lista.setAttribute('translate', 'no');
    const tuya = window.PROBADOR.crearVista({ base: r.base, rotulo: 'tu página', titulo: 'Tu página con las líneas en este orden' });
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
      if (orden.join('\n') === bien) {
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

  const PINTORES = { elige: pintarElige, error: pintarError, ordena: pintarOrdena };

  /* ---------- la actividad ---------- */

  function renderRetoWeb(contenedor, datos) {
    const banco = BANCOS[datos.banco];
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
  };

  window.RETOS_WEB = { BANCOS, renderRetoWeb };
})();
