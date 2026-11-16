/* ============================================================
   Simulaciones de la Unidad 1 de Operaciones (el ordenador y tus
   archivos), 27/10/2026. Usan el marco de js/simulador.js y van
   en tema.html después de él.

   Llevan un EXPLORADOR DE ARCHIVOS de mentira (window.SIM_EXPLORADOR)
   que sirve también para Windows y Linux (U6, U7): carpetas, ruta,
   abrir, cambiar nombre, cortar, copiar, pegar, eliminar a la
   papelera, propiedades (con el tamaño en KB, MB o GB, ×1024),
   comprimir en ZIP, mostrar extensiones y expulsar un USB.

   ordena-escritorio  S1: carpeta nueva, mover, nombres con la norma
                      y la extensión repetida.
   sigue-ruta         S2: llegar a una ruta, mover una descarga a su
                      sitio y escribir la ruta relativa.
   cabe-usb           S3: mirar el tamaño en Propiedades, copiar al
                      USB lo que cabe y expulsarlo.
   copia-drive        S4: comprimir, ponerle la fecha y subirla a Drive.

   Nada se guarda ni toca archivos de verdad.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function') return;

  const KB = 1024, MB = KB * 1024, GB = MB * 1024;
  function tamano(b) {
    if (b >= GB) return (b / GB).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' GB';
    if (b >= MB) return Math.round(b / MB) + ' MB';
    if (b >= KB) return Math.round(b / KB) + ' KB';
    return b + ' bytes';
  }
  const carpeta = (n, hijos, extra) => Object.assign({ n, carpeta: true, hijos: hijos || [] }, extra || {});
  const archivo = (n, t, extra) => Object.assign({ n, t }, extra || {});
  function peso(nodo) { return nodo.carpeta ? nodo.hijos.reduce((a, h) => a + peso(h), 0) : nodo.t; }
  function copia(nodo) { return JSON.parse(JSON.stringify(nodo)); }
  const ext = n => (/\.([^.]+)$/.exec(n) || [])[1] || '';
  const ICONO = { zip: '🗜️', jpg: '🖼️', jpeg: '🖼️', png: '🖼️', webp: '🖼️', txt: '📄', docx: '📝', html: '🌐', css: '🎨', mp3: '🎵', mp4: '🎬', exe: '⚙️', pdf: '📕' };
  const TIPO = { zip: 'Carpeta comprimida (ZIP)', jpg: 'Imagen JPG', png: 'Imagen PNG', webp: 'Imagen WEBP', txt: 'Documento de texto', docx: 'Documento de Word', html: 'Documento HTML', css: 'Hoja de estilos CSS', mp3: 'Audio MP3', mp4: 'Vídeo MP4', exe: 'Aplicación', pdf: 'Documento PDF' };
  // nombres de Windows: la ruta va en inglés y el explorador los enseña en castellano
  const VISTA = { Users: 'Usuarios', Desktop: 'Escritorio', Downloads: 'Descargas', Documents: 'Documentos' };

  /* ------------------------------------------------------------
     Explorador. opciones:
       raiz        nodo «Este equipo» con las unidades (C:, E:…)
       inicio      lista de nombres desde la raíz (['C:', 'Users', …])
       extensiones si se ven al empezar (como Windows: no)
       acciones    acciones extra para el elemento elegido:
                   (nodo, ruta) => [[texto, función], …]
       cambio()    se llama después de cada cambio
     Devuelve { raiz, ruta(), buscar(lista), extensiones(), pintar() }
     ------------------------------------------------------------ */
  function crearExplorador(ctx, op) {
    const { el, boton, pantalla } = ctx;
    const raiz = op.raiz;
    let actual = [raiz];
    (op.inicio || []).forEach(n => { const h = actual[actual.length - 1].hijos.find(x => x.n === n); if (h) actual.push(h); });
    let elegido = null, portapapeles = null, verExt = !!op.extensiones;
    const papelera = [];

    const caja = el('div', 'exp');
    const barra = el('div', 'exp__barra');
    const dir = el('div', 'exp__ruta');
    dir.setAttribute('translate', 'no');
    const lista = el('ul', 'exp__lista');
    const acciones = el('div', 'exp__acciones');
    const msg = el('div');
    msg.setAttribute('aria-live', 'polite');
    caja.appendChild(barra);
    caja.appendChild(dir);
    caja.appendChild(lista);
    caja.appendChild(acciones);
    caja.appendChild(msg);
    pantalla.appendChild(caja);

    const ruta = (lst) => {
      const r = (lst || actual).slice(1).map(x => x.n);
      return r.length ? r[0] + (r.length > 1 ? '\\' + r.slice(1).join('\\') : '\\') : 'Este equipo';
    };
    const aqui = () => actual[actual.length - 1];
    const nombreVisto = n => (n.carpeta || verExt || !/\./.test(n.n)) ? n.n : n.n.replace(/\.[^.]+$/, '');
    const vista = n => VISTA[n.n] || (n.unidad ? `${n.etiqueta} (${n.n})` : nombreVisto(n));
    function aviso(t, tipo) { msg.innerHTML = ''; if (t) msg.appendChild(ctx.aviso(t, tipo)); }
    function buscar(nombres) {
      let n = raiz;
      for (const x of nombres) { n = n.hijos && n.hijos.find(h => h.n.toLowerCase() === x.toLowerCase()); if (!n) return null; }
      return n;
    }
    function hecho() { if (op.cambio) op.cambio(); }

    function pintar() {
      barra.innerHTML = '';
      const atras = boton('↑ Subir');
      atras.disabled = actual.length === 1;
      atras.addEventListener('click', () => { actual.pop(); elegido = null; aviso(); pintar(); });
      barra.appendChild(atras);
      if (!aqui().raiz) {
        const nueva = boton('📁 Nueva carpeta');
        nueva.addEventListener('click', () => {
          let nom = 'Nueva carpeta', k = 2;
          while (aqui().hijos.some(h => h.n === nom)) nom = `Nueva carpeta (${k++})`;
          const c = carpeta(nom);
          aqui().hijos.push(c);
          elegido = c;
          ctx.apunta(`Nueva carpeta en ${ruta()}.`);
          pintar();
          renombrar(c);
        });
        barra.appendChild(nueva);
        if (portapapeles) {
          const pegar = boton('📋 Pegar');
          pegar.addEventListener('click', pegarAqui);
          barra.appendChild(pegar);
        }
      }
      const ve = el('label', 'sim__interruptor exp__ext');
      const c = document.createElement('input');
      c.type = 'checkbox';
      c.checked = verExt;
      c.addEventListener('change', () => {
        verExt = c.checked;
        ctx.apunta(verExt ? 'Vista → Mostrar extensiones de archivo.' : 'Vista → ocultar las extensiones.');
        pintar();
        hecho();
      });
      ve.appendChild(c);
      ve.appendChild(document.createTextNode(' Extensiones'));
      barra.appendChild(ve);

      dir.innerHTML = '';
      actual.forEach((n, i) => {
        const b = boton(i === 0 ? 'Este equipo' : vista(n), 'exp__miga');
        b.addEventListener('click', () => { actual = actual.slice(0, i + 1); elegido = null; aviso(); pintar(); });
        dir.appendChild(b);
        if (i < actual.length - 1) dir.appendChild(el('span', 'exp__sep', '›'));
      });
      const real = el('span', 'exp__ruta-real', ruta());
      dir.appendChild(real);

      lista.innerHTML = '';
      const hijos = aqui().hijos.slice().sort((a, b) => (b.carpeta ? 1 : 0) - (a.carpeta ? 1 : 0) || a.n.localeCompare(b.n));
      if (!hijos.length) lista.appendChild(el('li', 'sim__ayuda', 'Esta carpeta está vacía.'));
      hijos.forEach(h => {
        const li = el('li');
        const icono = h.unidad ? (h.usb ? '🔌' : '💽') : h.carpeta ? '📁' : (ICONO[ext(h.n).toLowerCase()] || '📄');
        const b = boton(`${icono} ${vista(h)}`, 'exp__item' + (h === elegido ? ' exp__item--elegido' : ''));
        b.setAttribute('aria-pressed', String(h === elegido));
        b.setAttribute('translate', 'no');
        b.addEventListener('click', () => { elegido = h === elegido ? null : h; aviso(); pintar(); });
        b.addEventListener('dblclick', () => abrir(h));
        li.appendChild(b);
        const info = h.unidad ? `${tamano(h.libre)} libres de ${tamano(h.capacidad)}` : h.carpeta ? 'Carpeta' : tamano(h.t);
        li.appendChild(el('span', 'sim__ayuda', info));
        lista.appendChild(li);
      });

      acciones.innerHTML = '';
      if (!elegido) { acciones.appendChild(el('p', 'sim__ayuda', 'Toca un elemento para ver qué puedes hacer con él. Doble clic, o «Abrir», para entrar en una carpeta.')); return; }
      const A = [];
      if (elegido.carpeta) A.push(['Abrir', () => abrir(elegido)]);
      if (elegido.unidad) {
        if (elegido.usb) A.push(['⏏ Expulsar', () => expulsar(elegido)]);
        A.push(['Propiedades', () => propiedades(elegido)]);
      } else {
        A.push(['✏️ Cambiar nombre', () => renombrar(elegido)]);
        A.push(['✂️ Cortar', () => { portapapeles = { nodo: elegido, desde: aqui(), cortar: true }; ctx.apunta(`Cortar «${elegido.n}».`); pintar(); }]);
        A.push(['📄 Copiar', () => { portapapeles = { nodo: elegido, desde: aqui(), cortar: false }; ctx.apunta(`Copiar «${elegido.n}».`); pintar(); }]);
        A.push(['🗑 Eliminar', () => eliminar(elegido)]);
        A.push(['Propiedades', () => propiedades(elegido)]);
        if (elegido.carpeta) A.push(['🗜️ Comprimir en ZIP', () => comprimir(elegido)]);
      }
      if (op.acciones) op.acciones(elegido, ruta()).forEach(a => A.push(a));
      A.forEach(([t, f]) => { const b = boton(t); b.addEventListener('click', f); acciones.appendChild(b); });
    }

    function abrir(h) {
      if (!h.carpeta) { aviso(`Se abriría «${h.n}» con su programa. En esta simulación no hace falta abrir archivos.`, 'cuidado'); return; }
      if (h.expulsado) { aviso('El USB ya está expulsado: puedes quitarlo.', 'cuidado'); return; }
      actual.push(h);
      elegido = null;
      aviso();
      pintar();
      hecho();
    }
    function renombrar(h) {
      acciones.innerHTML = '';
      const i = document.createElement('input');
      i.type = 'text';
      i.className = 'lab__entrada';
      i.value = h.n;
      i.spellcheck = false;
      i.setAttribute('translate', 'no');
      i.setAttribute('aria-label', 'Nombre nuevo');
      const ok = boton('Aceptar', 'lab__boton lab__boton--activo');
      const hacer = () => {
        const nuevo = i.value.trim();
        if (!nuevo) { aviso('El nombre no puede estar vacío.'); return; }
        if (/[\\/:*?"<>|]/.test(nuevo)) { aviso('Windows no deja usar estos símbolos en un nombre: \\ / : * ? " < > |'); return; }
        if (aqui().hijos.some(x => x !== h && x.n.toLowerCase() === nuevo.toLowerCase())) { aviso('Ya hay algo con ese nombre en esta carpeta.'); return; }
        if (!h.carpeta && ext(h.n) && ext(nuevo).toLowerCase() !== ext(h.n).toLowerCase()) aviso(`Ojo: has cambiado la extensión (.${ext(h.n)} → ${ext(nuevo) ? '.' + ext(nuevo) : 'ninguna'}). El archivo puede dejar de abrirse bien.`, 'cuidado');
        else aviso();
        ctx.apunta(`Cambiar el nombre: «${h.n}» → «${nuevo}».`);
        h.n = nuevo;
        pintar();
        hecho();
      };
      ok.addEventListener('click', hacer);
      i.addEventListener('keydown', e => { if (e.key === 'Enter') hacer(); });
      acciones.appendChild(i);
      acciones.appendChild(ok);
      i.focus();
      if (!h.carpeta && !verExt && /\./.test(h.n)) i.setSelectionRange(0, h.n.lastIndexOf('.'));
    }
    function pegarAqui() {
      const p = portapapeles, dest = aqui();
      if (!p) return;
      if (p.cortar && p.desde === dest) { aviso('Ya está en esta carpeta.', 'cuidado'); return; }
      const nuevo = p.cortar ? p.nodo : copia(p.nodo);
      const u = actual[1] && actual[1].usb ? actual[1] : null;
      if (u) {
        const t = peso(nuevo);
        if (t > u.libre) {
          ctx.falla(`Pegar «${p.nodo.n}» (${tamano(t)}) en ${ruta()}: no hay espacio (quedan ${tamano(u.libre)}).`);
          aviso(`No hay espacio suficiente. «${p.nodo.n}» ocupa ${tamano(t)} y en el USB quedan ${tamano(u.libre)}.`);
          return;
        }
      }
      if (dest.hijos.some(x => x.n.toLowerCase() === nuevo.n.toLowerCase())) { aviso(`Ya hay algo llamado «${nuevo.n}» en esta carpeta.`); return; }
      if (p.cortar) p.desde.hijos.splice(p.desde.hijos.indexOf(p.nodo), 1);
      dest.hijos.push(nuevo);
      if (u) u.libre -= peso(nuevo);
      ctx.apunta(`${p.cortar ? 'Mover' : 'Copiar'} «${nuevo.n}» a ${ruta()}.`);
      if (p.cortar) portapapeles = null;
      elegido = nuevo;
      aviso();
      pintar();
      hecho();
    }
    function eliminar(h) {
      aqui().hijos.splice(aqui().hijos.indexOf(h), 1);
      papelera.push(h);
      ctx.apunta(`Eliminar «${h.n}»: va a la Papelera de reciclaje.`);
      elegido = null;
      aviso(`«${h.n}» está en la Papelera. Si ha sido sin querer: Ctrl + Z o restáuralo desde la Papelera.`, 'cuidado');
      const des = boton('↶ Deshacer (Ctrl + Z)');
      des.addEventListener('click', () => {
        papelera.splice(papelera.indexOf(h), 1);
        aqui().hijos.push(h);
        ctx.apunta(`Deshacer: «${h.n}» vuelve a su sitio.`);
        aviso();
        pintar();
        hecho();
      });
      msg.appendChild(des);
      pintar();
      hecho();
    }
    function propiedades(h) {
      acciones.innerHTML = '';
      const t = el('table', 'exp__prop');
      const filas = h.unidad
        ? [['Tipo', h.usb ? 'Unidad USB' : 'Disco local'], ['Capacidad', tamano(h.capacidad)], ['Espacio usado', tamano(h.capacidad - h.libre)], ['Espacio libre', tamano(h.libre)]]
        : [['Tipo', h.carpeta ? 'Carpeta de archivos' : (TIPO[ext(h.n).toLowerCase()] || 'Archivo')], ['Ubicación', ruta()], ['Tamaño', tamano(peso(h))]];
      if (h.carpeta) filas.push(['Contiene', `${contar(h).a} archivos, ${contar(h).c} carpetas`]);
      filas.forEach(([a, b]) => { const tr = el('tr'); tr.appendChild(el('th', null, a)); const td = el('td', null, b); td.setAttribute('translate', 'no'); tr.appendChild(td); t.appendChild(tr); });
      acciones.appendChild(el('p', 'sim__etiqueta', `Propiedades de «${vista(h)}»`));
      acciones.appendChild(t);
      const cerrar = boton('Cerrar');
      cerrar.addEventListener('click', pintar);
      acciones.appendChild(cerrar);
      ctx.apunta(`Propiedades de «${h.n}»: ${h.unidad ? tamano(h.libre) + ' libres' : tamano(peso(h))}.`);
      h.vistoTam = true;
      hecho();
    }
    function contar(h) { let a = 0, c = 0; (function r(n) { n.hijos.forEach(x => { if (x.carpeta) { c++; r(x); } else a++; }); })(h); return { a, c }; }
    function comprimir(h) {
      const nom = h.n + '.zip';
      if (aqui().hijos.some(x => x.n === nom)) { aviso(`Ya hay un «${nom}» aquí.`, 'cuidado'); return; }
      const z = archivo(nom, Math.max(KB, Math.round(peso(h) * 0.6)), { zipDe: h.n });
      aqui().hijos.push(z);
      elegido = z;
      ctx.apunta(`Comprimir la carpeta «${h.n}»: sale «${nom}» al lado.`);
      aviso(`Ha aparecido «${nom}» al lado de la carpeta. La carpeta sigue igual.`, 'ok');
      pintar();
      hecho();
    }
    function expulsar(u) {
      u.expulsado = true;
      ctx.apunta(`Expulsar el USB (${u.n}).`);
      aviso('«Es seguro quitar el hardware»: ya puedes sacar el USB.', 'ok');
      elegido = null;
      pintar();
      hecho();
    }
    pintar();
    return { raiz, ruta, buscar, extensiones: () => verExt, pintar, aviso, actual: () => actual, papelera };
  }
  window.SIM_EXPLORADOR = crearExplorador;

  const norma = n => /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)?$/.test(n);
  const usuario = (escritorio, descargas) => carpeta('C:', [
    carpeta('Program Files', [carpeta('Google'), carpeta('Microsoft Office')]),
    carpeta('Users', [carpeta('alumno', [
      carpeta('Desktop', escritorio || []),
      carpeta('Documents', []),
      carpeta('Downloads', descargas || []),
    ])]),
    carpeta('Windows', [carpeta('System32')]),
  ], { unidad: true, etiqueta: 'Disco local', capacidad: 237 * GB, libre: 112 * GB });
  const equipo = (...unidades) => carpeta('Este equipo', unidades, { raiz: true });
  const ESCRITORIO = ['C:', 'Users', 'alumno', 'Desktop'];

  /* ============================================================
     Desde el 15/11/2026 las cuatro simulaciones de la U1 van en el
     Windows 11 de mentira (js/win11.js y js/win11-archivos.js), con
     su Explorador de verdad: clic derecho, arrastrar, F2, Ctrl + C /
     Ctrl + V, Ver → Mostrar → Extensiones… El explorador de antes
     (SIM_EXPLORADOR, arriba) se queda para las simulaciones de
     Proyecto.
     ============================================================ */
  const W11 = window.WIN11 && window.WIN11.fs ? window.WIN11.fs : null;
  const ESC = ['C:', 'Users', 'alumno', 'Desktop'];
  const pc = (o, ...mas) => W11.equipo(W11.usuario(o), ...mas);

  /* S1 · Ordena el escritorio */
  registrarSimulacion('ordena-escritorio', {
    ventana: 'Windows 11',
    mision: [
      'Crea en el Escritorio una carpeta llamada practicas-u1.',
      'Mete dentro los tres archivos de clase. El juego se queda fuera.',
      'Activa ver las extensiones: uno de los archivos tiene la extensión repetida.',
      'Pon los tres nombres según la norma de clase, sin cambiar la extensión.',
    ],
    final: 'Apunta en tu cuaderno los tres nombres que estaban mal, cómo los has dejado y cuál tenía la extensión repetida (pregunta 15).',
    crear(ctx) {
      const W = WIN11.escritorio(ctx, { fs: pc({ escritorio: [
        W11.archivo('Trabajo Final.docx', 48 * KB), W11.archivo('foto perro.JPG', 2 * MB),
        W11.archivo('notas.txt.txt', 3 * KB, { contenido: 'Notas de clase' }), W11.archivo('juego-gratis.exe', 85 * MB),
      ] }), barra: ['explorador', 'navegador'] });
      W.abrirExplorador(ESC);
      const CLASE = [/trabajo/i, /perro/i, /notas/i];
      W.on('cambio', () => {
        const p = W.buscar(ESC.concat('practicas-u1'));
        if (p) ctx.cumple(0, 'Nuevo → Carpeta en el Escritorio: practicas-u1.');
        else if (ctx.hecho(0)) ctx.deshace(0);
        const dentro = p ? p.hijos : [];
        const clase = CLASE.map(r => dentro.find(h => r.test(h.n)));
        const juego = dentro.some(h => /juego/i.test(h.n));
        if (juego) W.aviso('El juego no es de clase: no va en la carpeta de prácticas.', 'cuidado');
        if (clase.every(Boolean) && !juego) ctx.cumple(1, 'Mover a practicas-u1 los tres archivos de clase.');
        else if (ctx.hecho(1)) ctx.deshace(1);
        if (W.est.verExt) ctx.cumple(2, 'Ver → Mostrar → Extensiones de nombre de archivo: «notas.txt» era en realidad «notas.txt.txt».');
        const bien = clase.every(h => h && norma(h.n)) && /\.docx$/.test(clase[0].n) && /\.jpg$/.test(clase[1].n) && /\.txt$/.test(clase[2].n);
        if (bien) ctx.cumple(3, `Nombres con la norma: ${clase.map(h => h.n).join(', ')}.`);
        else if (ctx.hecho(3)) ctx.deshace(3);
      });
    },
  });

  /* S2 · Sigue la ruta */
  registrarSimulacion('sigue-ruta', {
    ventana: 'Windows 11',
    mision: [
      'Abre la carpeta C:\\Users\\alumno\\Desktop\\practicas-u0\\textos.',
      'La foto perro.jpg se ha descargado en Descargas: muévela a la carpeta img de mi-web.',
      'Escribe la ruta relativa de la foto desde la carpeta mi-web.',
    ],
    final: 'Apunta en tu cuaderno la ruta completa de la foto después de moverla y su ruta relativa desde mi-web (pregunta 12).',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const W = WIN11.escritorio(ctx, { fs: pc({
        escritorio: [
          W11.carpeta('practicas-u0', [W11.carpeta('textos', [W11.archivo('notas.txt', 3 * KB)]), W11.carpeta('imagenes')]),
          W11.carpeta('mi-web', [W11.archivo('index.html', 4 * KB), W11.carpeta('img', [W11.archivo('logo.png', 24 * KB)])]),
        ],
        descargas: [W11.archivo('perro.jpg', 1.4 * MB), W11.archivo('horario.pdf', 210 * KB)],
      }), barra: ['explorador', 'navegador'] });
      W.abrirExplorador(['C:']);
      const revisa = () => {
        if (W.exploradores().some(E => E.ruta().toLowerCase() === 'c:\\users\\alumno\\desktop\\practicas-u0\\textos')) ctx.cumple(0, 'Llegar a C:\\Users\\alumno\\Desktop\\practicas-u0\\textos (en el Explorador, «Usuarios» y «Escritorio»; en la ruta, Users y Desktop).');
        const img = W.buscar(ESC.concat('mi-web', 'img'));
        const des = W.buscar(['C:', 'Users', 'alumno', 'Downloads']);
        if (img && img.hijos.some(h => h.n === 'perro.jpg')) {
          if (des.hijos.some(h => h.n === 'perro.jpg')) W.aviso('La foto está en img, pero sigue también en Descargas: la has copiado. La misión pide moverla (cortar y pegar, o arrastrar).', 'cuidado');
          else ctx.cumple(1, 'Mover perro.jpg de Descargas a C:\\Users\\alumno\\Desktop\\mi-web\\img.');
        }
      };
      W.on('cambio', revisa);
      W.on('navegar', revisa);
      const fila = el('div', 'lab__fila');
      const rel = document.createElement('input');
      rel.type = 'text';
      rel.className = 'lab__entrada';
      rel.placeholder = 'ruta relativa desde mi-web';
      rel.setAttribute('aria-label', 'Ruta relativa de la foto desde mi-web');
      rel.setAttribute('translate', 'no');
      rel.spellcheck = false;
      const comprueba = boton('Comprobar');
      const msg = el('div');
      msg.setAttribute('aria-live', 'polite');
      comprueba.addEventListener('click', () => {
        msg.innerHTML = '';
        const v = rel.value.trim().replace(/^\.\//, '');
        if (v === 'img/perro.jpg') { ctx.cumple(2, 'Ruta relativa desde mi-web: img/perro.jpg'); msg.appendChild(ctx.aviso('Eso es: desde mi-web, entras en img y allí está perro.jpg.', 'ok')); }
        else if (/\\/.test(v)) { ctx.falla(`Ruta relativa: ${v}`); msg.appendChild(ctx.aviso('En las rutas relativas de las webs se usa /, no \\.')); }
        else if (/^c:/i.test(v)) { ctx.falla(`Ruta relativa: ${v}`); msg.appendChild(ctx.aviso('Esa es la ruta absoluta (empieza por el disco). La relativa empieza desde mi-web.')); }
        else { ctx.falla(`Ruta relativa: ${v}`); msg.appendChild(ctx.aviso('Todavía no. Desde mi-web: ¿en qué carpeta entras? ¿Cómo se llama el archivo? Sepáralos con /.')); }
      });
      fila.append(rel, comprueba);
      pantalla.insertBefore(msg, pantalla.querySelector('.w11__teclado'));
      pantalla.insertBefore(fila, msg);
      pantalla.insertBefore(el('p', 'sim__etiqueta', 'La ruta relativa de la foto, desde mi-web:'), fila);
    },
  });

  /* S3 · ¿Cabe en el USB? */
  registrarSimulacion('cabe-usb', {
    ventana: 'Windows 11',
    mision: [
      'Mira en Propiedades cuánto ocupan trabajos-clase y musica, y cuánto espacio libre tiene el USB.',
      'Copia al USB (E:) las carpetas trabajos-clase y musica.',
      'Expulsa el USB antes de quitarlo.',
    ],
    final: 'Apunta en tu cuaderno cuánto ocupa cada carpeta, cuánto espacio libre tenía el USB y por qué no cabía fotos-viaje (pregunta 15).',
    crear(ctx) {
      const usb = W11.unidad('E:', 'USB', 14.6 * GB, 2.5 * GB, [W11.archivo('presentacion.pptx', 300 * MB)], { usb: true, fs: 'FAT32' });
      const musica = W11.carpeta('musica', Array.from({ length: 12 }, (_, i) => W11.archivo(`cancion-${i + 1}.mp3`, 102.4 * MB)));
      const trabajos = W11.carpeta('trabajos-clase', [W11.archivo('resumen-u2.docx', 350 * MB), W11.archivo('maqueta.pdf', 500 * MB)]);
      const fotos = W11.carpeta('fotos-viaje', Array.from({ length: 7 }, (_, i) => W11.archivo(`foto-${i + 1}.jpg`, 512 * MB)));
      const W = WIN11.escritorio(ctx, { fs: pc({ escritorio: [trabajos, musica, fotos, W11.archivo('pelicula.mp4', 2.1 * GB)] }, usb), barra: ['explorador', 'navegador'] });
      W.abrirExplorador(ESC);
      W.notificacion('USB (E:)', 'Se ha conectado un dispositivo USB.', 'usb');
      W.on('cambio', () => {
        if (trabajos._vistoTam && musica._vistoTam && usb._vistoTam) ctx.cumple(0, `Propiedades: trabajos-clase ${tamano(peso(trabajos))}, musica ${tamano(peso(musica))}; el USB tiene ${tamano(usb.libre)} libres.`);
        const ok = ['trabajos-clase', 'musica'].every(n => usb.hijos.some(h => h.n === n));
        if (ok) ctx.cumple(1, 'Copiar trabajos-clase y musica al USB (E:).');
        if (usb.expulsado) {
          if (ok) ctx.cumple(2, 'Clic derecho en USB (E:) → Expulsar: «Es seguro quitar el hardware».');
          else { W.aviso('Lo has expulsado antes de copiar. Pulsa «Empezar otra vez».', 'cuidado'); ctx.falla('Expulsar el USB antes de copiar nada.'); }
        }
      });
      W.on('fs', d => { if (d.tipo === 'propiedades') setTimeout(() => W.emit('cambio'), 0); });
    },
  });

  /* S4 · Haz la copia de seguridad */
  registrarSimulacion('copia-drive', {
    ventana: 'Windows 11',
    mision: [
      'Comprime la carpeta mi-web del Escritorio.',
      'Ponle al .zip la fecha de hoy, 3 de noviembre de 2026, como dice la norma.',
      'Sube la copia a tu Drive, a la carpeta copias-mi-web.',
    ],
    final: 'Apunta en tu cuaderno el nombre exacto de la copia y en qué carpeta de Drive la has dejado (pregunta 6).',
    crear(ctx) {
      const { el, boton } = ctx;
      const W = WIN11.escritorio(ctx, { fs: pc({ escritorio: [
        W11.carpeta('mi-web', [W11.archivo('index.html', 6 * KB), W11.archivo('estilos.css', 3 * KB), W11.archivo('resumenes.html', 9 * KB), W11.carpeta('img', [W11.archivo('logo.png', 40 * KB), W11.archivo('foto.jpg', 1.8 * MB)])]),
        W11.carpeta('practicas-u0', [W11.carpeta('textos')]),
      ] }), barra: ['explorador', 'navegador'] });
      W.abrirExplorador(ESC);
      const drive = { 'Mi unidad': [], 'copias-mi-web': [W11.archivo('mi-web-2026-10-05.zip', 1.2 * MB)], fotos: [] };
      let dCarpeta = 'Mi unidad';
      const zipDe = h => h.zipDe && h.zipDe.join() === 'mi-web';
      W.on('cambio', () => {
        const zip = W.buscar(ESC).hijos.find(zipDe);
        if (zip) ctx.cumple(0, 'Clic derecho en mi-web → Comprimir en archivo ZIP: sale mi-web.zip.');
        if (zip && zip.n === 'mi-web-2026-11-03.zip') ctx.cumple(1, 'Cambiar el nombre (F2) a mi-web-2026-11-03.zip (año-mes-día).');
        else if (zip && /mi-web-0?3-11-2026/.test(zip.n)) W.aviso('La fecha va al revés: año-mes-día. Así las copias se ordenan solas.', 'cuidado');
      });
      const C = WIN11.chrome(W, {
        pestanas: [{ t: 'Mi unidad - Google Drive', url: 'drive.google.com/drive/my-drive' }],
        marcadores: null,
        pagina(t, cont, C2) {
          cont.classList.add('w11-drive');
          const bar = el('div', 'w11-drive__bar');
          const nuevo = boton('+ Nuevo', 'w11-mail__redactar');
          nuevo.addEventListener('click', () => {
            const r = nuevo.getBoundingClientRect();
            W.menu(r.left, r.bottom, [{ t: 'Carpeta nueva', off: true }, { sep: true }, { t: 'Subir archivo', icono: 'documento', f: () => elegir(C2) }, { t: 'Subir carpeta', icono: 'carpeta', f: () => W.aviso('Sube el .zip, no la carpeta: una copia es un solo archivo comprimido.', 'cuidado') }]);
          });
          bar.appendChild(nuevo);
          const migas = el('p', 'w11-drive__migas');
          const mi = boton('Mi unidad', 'w11-cfg__hm'); mi.addEventListener('click', () => { dCarpeta = 'Mi unidad'; C2.pintar(); });
          migas.appendChild(mi);
          if (dCarpeta !== 'Mi unidad') migas.append(document.createTextNode(' › '), el('span', null, dCarpeta));
          bar.appendChild(migas);
          cont.appendChild(bar);
          const lista = el('div', 'w11-drive__lista');
          if (dCarpeta === 'Mi unidad') ['copias-mi-web', 'fotos'].forEach(d => {
            const f = boton('', 'w11-drive__item');
            f.append(WIN11.icono('carpeta'), el('span', null, d));
            f.lastChild.setAttribute('translate', 'no');
            let u = 0;
            f.addEventListener('click', () => { if (Date.now() - u < 450) { dCarpeta = d; C2.pintar(); } u = Date.now(); });
            f.addEventListener('keydown', e => { if (e.key === 'Enter') { dCarpeta = d; C2.pintar(); } });
            lista.appendChild(f);
          });
          drive[dCarpeta].forEach(a => { const f = el('div', 'w11-drive__item'); f.append(WIN11.icono('zip'), el('span', null, a.n)); f.lastChild.setAttribute('translate', 'no'); lista.appendChild(f); });
          if (!lista.childNodes.length) lista.appendChild(el('p', 'w11-nota', 'Esta carpeta está vacía. Usa «+ Nuevo».'));
          cont.appendChild(lista);
        },
      });
      function elegir(C2) {
        let aqui = ESC, sel = null;
        const d = W.dialogo({ titulo: 'Abrir', crear: t => {
          const pinta = () => {
            t.innerHTML = '';
            const atajos = el('div', 'lab__fila');
            [['Escritorio', ESC], ['Documentos', ['C:', 'Users', 'alumno', 'Documents']], ['Descargas', ['C:', 'Users', 'alumno', 'Downloads']]].forEach(([n, r]) => { const b = boton(n, 'w11-btn'); b.addEventListener('click', () => { aqui = r; sel = null; pinta(); }); atajos.appendChild(b); });
            t.appendChild(atajos);
            const ruta = el('p', 'w11-nota', aqui.join('\\').replace('C:', 'C:')); ruta.setAttribute('translate', 'no'); t.appendChild(ruta);
            const lista = el('div', 'w11-perm__lista');
            (W.buscar(aqui).hijos || []).forEach(h => {
              const b = boton('', 'w11-perm__g' + (h === sel ? ' w11-perm__g--sel' : ''));
              b.append(WIN11.icono(h.carpeta ? 'carpeta' : /\.zip$/i.test(h.n) ? 'zip' : 'documento'), el('span', null, h.n));
              b.lastChild.setAttribute('translate', 'no');
              let u = 0;
              b.addEventListener('click', () => { if (h.carpeta && Date.now() - u < 450) { aqui = aqui.concat(h.n); sel = null; pinta(); return; } u = Date.now(); sel = h; pinta(); });
              lista.appendChild(b);
            });
            t.appendChild(lista);
          };
          pinta();
        }, botones: [{ t: 'Abrir', primario: true, f: () => {
          if (!sel) { W.aviso('Elige primero el archivo que quieres subir.', 'cuidado'); return false; }
          if (sel.carpeta) { W.aviso('Es una carpeta: entra con doble clic o sube el .zip.', 'cuidado'); return false; }
          drive[dCarpeta].push(Object.assign({}, sel, { _p: null }));
          ctx.apunta(`Drive → + Nuevo → Subir archivo: «${sel.n}» a «${dCarpeta}».`);
          if (!zipDe(sel)) W.aviso('Eso no es la copia de mi-web: hay que subir el .zip.', 'cuidado');
          else if (dCarpeta !== 'copias-mi-web') W.aviso('Súbela a la carpeta «copias-mi-web», donde guardas todas: entra en ella antes de subir.', 'cuidado');
          else if (sel.n !== 'mi-web-2026-11-03.zip') W.aviso('Antes de subirla, ponle la fecha de hoy al nombre.', 'cuidado');
          else { ctx.cumple(2, 'Subir mi-web-2026-11-03.zip a Drive, a la carpeta «copias-mi-web».'); W.aviso('Copia subida. Ya está a salvo aunque se borre tu usuario.', 'ok'); }
          C2.pintar();
        } }, { t: 'Cancelar' }] });
        void d;
      }
      C.ventana().minimizar();
    },
  });
})();
