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
     S1 · Ordena el escritorio
     ============================================================ */
  registrarSimulacion('ordena-escritorio', {
    ventana: 'Explorador de archivos',
    mision: [
      'Crea en el Escritorio una carpeta llamada practicas-u1.',
      'Mete dentro los tres archivos de clase. El juego se queda fuera.',
      'Activa ver las extensiones: uno de los archivos tiene la extensión repetida.',
      'Pon los tres nombres según la norma de clase, sin cambiar la extensión.',
    ],
    final: 'Apunta en tu cuaderno los tres nombres que estaban mal, cómo los has dejado y cuál tenía la extensión repetida (pregunta 15).',
    crear(ctx) {
      const E = crearExplorador(ctx, {
        raiz: equipo(usuario([
          archivo('Trabajo Final.docx', 48 * KB),
          archivo('foto perro.JPG', 2 * MB),
          archivo('notas.txt.txt', 3 * KB),
          archivo('juego-gratis.exe', 85 * MB),
        ])),
        inicio: ESCRITORIO,
        cambio,
      });
      const CLASE = [/trabajo/i, /perro/i, /notas/i];
      function cambio() {
        const p = E.buscar(ESCRITORIO.concat('practicas-u1'));
        if (p) ctx.cumple(0, 'Nueva carpeta en el Escritorio: practicas-u1.');
        const dentro = p ? p.hijos : [];
        const clase = CLASE.map(r => dentro.find(h => r.test(h.n)));
        const juego = dentro.some(h => /juego/i.test(h.n));
        if (juego) E.aviso('El juego no es de clase: no va en la carpeta de prácticas.', 'cuidado');
        if (clase.every(Boolean) && !juego) ctx.cumple(1, 'Mover a practicas-u1 los tres archivos de clase.');
        else if (ctx.hecho(1)) ctx.deshace(1);
        if (E.extensiones()) ctx.cumple(2, 'Con las extensiones a la vista, «notas.txt» era en realidad «notas.txt.txt».');
        const bien = clase.every(h => h && norma(h.n)) &&
          clase[0] && /\.docx$/.test(clase[0].n) && clase[1] && /\.jpg$/.test(clase[1].n) && clase[2] && /\.txt$/.test(clase[2].n);
        if (bien) ctx.cumple(3, `Nombres con la norma: ${clase.map(h => h.n).join(', ')}.`);
        else if (ctx.hecho(3)) ctx.deshace(3);
      }
    },
  });

  /* ============================================================
     S2 · Sigue la ruta
     ============================================================ */
  registrarSimulacion('sigue-ruta', {
    ventana: 'Explorador de archivos',
    mision: [
      'Abre la carpeta C:\\Users\\alumno\\Desktop\\practicas-u0\\textos.',
      'La foto perro.jpg se ha descargado en Descargas: muévela a la carpeta img de mi-web.',
      'Escribe la ruta relativa de la foto desde la carpeta mi-web.',
    ],
    final: 'Apunta en tu cuaderno la ruta completa de la foto después de moverla y su ruta relativa desde mi-web (pregunta 12).',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const E = crearExplorador(ctx, {
        raiz: equipo(usuario([
          carpeta('practicas-u0', [carpeta('textos', [archivo('notas.txt', 3 * KB)]), carpeta('imagenes')]),
          carpeta('mi-web', [archivo('index.html', 4 * KB), carpeta('img', [archivo('logo.png', 24 * KB)])]),
        ], [archivo('perro.jpg', 1.4 * MB), archivo('horario.pdf', 210 * KB)])),
        inicio: ['C:'],
        cambio,
      });
      function cambio() {
        if (E.ruta().toLowerCase() === 'c:\\users\\alumno\\desktop\\practicas-u0\\textos') ctx.cumple(0, 'Llegar a C:\\Users\\alumno\\Desktop\\practicas-u0\\textos: C: › Usuarios › alumno › Escritorio › practicas-u0 › textos.');
        const img = E.buscar(ESCRITORIO.concat('mi-web', 'img'));
        if (img && img.hijos.some(h => h.n === 'perro.jpg')) ctx.cumple(1, 'Cortar perro.jpg en Descargas y pegarla en C:\\Users\\alumno\\Desktop\\mi-web\\img.');
      }
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
      fila.appendChild(rel);
      fila.appendChild(comprueba);
      pantalla.appendChild(el('p', 'sim__etiqueta', 'La ruta relativa de la foto, desde mi-web:'));
      pantalla.appendChild(fila);
      pantalla.appendChild(msg);
    },
  });

  /* ============================================================
     S3 · ¿Cabe en el USB?
     ============================================================ */
  registrarSimulacion('cabe-usb', {
    ventana: 'Explorador de archivos',
    mision: [
      'Mira en Propiedades cuánto ocupan trabajos-clase y musica, y cuánto espacio libre tiene el USB.',
      'Copia al USB (E:) las carpetas trabajos-clase y musica.',
      'Expulsa el USB antes de quitarlo.',
    ],
    final: 'Apunta en tu cuaderno cuánto ocupa cada carpeta, cuánto espacio libre tenía el USB y por qué no cabía fotos-viaje (pregunta 15).',
    crear(ctx) {
      const usb = carpeta('E:', [archivo('presentacion.pptx', 300 * MB)], { unidad: true, usb: true, etiqueta: 'USB', capacidad: 16 * GB, libre: 2.5 * GB });
      const musica = carpeta('musica', Array.from({ length: 12 }, (_, i) => archivo(`cancion-${i + 1}.mp3`, Math.round(102.4 * MB))));
      const trabajos = carpeta('trabajos-clase', [archivo('resumen-u2.docx', 350 * MB), archivo('maqueta.pdf', 500 * MB)]);
      const fotos = carpeta('fotos-viaje', Array.from({ length: 7 }, (_, i) => archivo(`foto-${i + 1}.jpg`, 512 * MB)));
      const E = crearExplorador(ctx, {
        raiz: equipo(usuario([trabajos, musica, fotos, archivo('pelicula.mp4', 2.1 * GB)]), usb),
        inicio: ESCRITORIO,
        cambio,
      });
      function cambio() {
        if (trabajos.vistoTam && musica.vistoTam && usb.vistoTam) ctx.cumple(0, `Propiedades: trabajos-clase ${tamano(peso(trabajos))}, musica ${tamano(peso(musica))}; el USB tiene ${tamano(usb.libre)} libres.`);
        const ok = ['trabajos-clase', 'musica'].every(n => usb.hijos.some(h => h.n === n));
        if (ok) ctx.cumple(1, 'Copiar trabajos-clase y musica y pegarlas en el USB (E:).');
        if (usb.expulsado) {
          if (ok) ctx.cumple(2, 'Este equipo → USB (E:) → Expulsar. Ya se puede quitar.');
          else { E.aviso('Lo has expulsado antes de copiar. Vuelve a empezar.', 'cuidado'); ctx.falla('Expulsar el USB antes de copiar nada.'); }
        }
      }
    },
  });

  /* ============================================================
     S4 · Haz la copia de seguridad
     ============================================================ */
  registrarSimulacion('copia-drive', {
    ventana: 'Explorador de archivos',
    mision: [
      'Comprime la carpeta mi-web del Escritorio.',
      'Ponle al .zip la fecha de hoy, 3 de noviembre de 2026, como dice la norma.',
      'Sube la copia a tu Drive, a la carpeta copias-mi-web.',
    ],
    final: 'Apunta en tu cuaderno el nombre exacto de la copia y en qué carpeta de Drive la has dejado (pregunta 6).',
    crear(ctx) {
      const { el, pantalla } = ctx;
      const drive = { 'Mi unidad': [], 'copias-mi-web': [archivo('mi-web-2026-10-05.zip', 1.2 * MB)], fotos: [] };
      const DESTINOS = Object.keys(drive);
      const visor = el('div', 'exp__drive');
      const E = crearExplorador(ctx, {
        raiz: equipo(usuario([
          carpeta('mi-web', [archivo('index.html', 6 * KB), archivo('estilos.css', 3 * KB), archivo('resumenes.html', 9 * KB), carpeta('img', [archivo('logo.png', 40 * KB), archivo('foto.jpg', 1.8 * MB)])]),
          carpeta('practicas-u0', [carpeta('textos')]),
        ])),
        inicio: ESCRITORIO,
        cambio,
        acciones(n) {
          if (n.carpeta) return [];
          return [['☁️ Subir a Drive…', () => subir(n)]];
        },
      });
      function cambio() {
        const esc = E.buscar(ESCRITORIO);
        const zip = esc.hijos.find(h => h.zipDe === 'mi-web');
        if (zip) ctx.cumple(0, 'Clic derecho en mi-web → Comprimir en archivo ZIP: sale mi-web.zip.');
        if (zip && zip.n === 'mi-web-2026-11-03.zip') ctx.cumple(1, 'Cambiar el nombre a mi-web-2026-11-03.zip (año-mes-día).');
        else if (zip && /mi-web-0?3-11-2026/.test(zip.n)) E.aviso('La fecha va al revés: año-mes-día. Así las copias se ordenan solas.', 'cuidado');
      }
      function pintarDrive() {
        visor.innerHTML = '';
        visor.appendChild(el('p', 'sim__etiqueta', '☁️ Tu Drive'));
        DESTINOS.forEach(d => {
          visor.appendChild(el('p', null, (d === 'Mi unidad' ? '🏠 ' : '📁 ') + d + (drive[d].length ? ': ' + drive[d].map(a => a.n).join(', ') : ' (vacía)')));
        });
      }
      function subir(n) {
        const acciones = pantalla.querySelector('.exp__acciones');
        const vieja = acciones.querySelector('.exp__subir');
        if (vieja) vieja.remove();
        const fila = el('div', 'lab__fila exp__subir');
        fila.appendChild(el('span', 'sim__ayuda', `Subir «${n.n}» a:`));
        DESTINOS.forEach(d => {
          const b = ctx.boton(d);
          b.addEventListener('click', () => {
            fila.remove();
            drive[d].push(copia(n));
            ctx.apunta(`Subir «${n.n}» a Drive, a «${d}».`);
            pintarDrive();
            if (!n.zipDe) E.aviso('Eso no es la copia de mi-web: hay que subir el .zip.', 'cuidado');
            else if (d !== 'copias-mi-web') E.aviso('Súbela a la carpeta «copias-mi-web», donde guardas todas.', 'cuidado');
            else if (n.n !== 'mi-web-2026-11-03.zip') E.aviso('Antes de subirla, ponle la fecha de hoy al nombre.', 'cuidado');
            else { ctx.cumple(2, 'Subir mi-web-2026-11-03.zip a Drive, carpeta «copias-mi-web».'); E.aviso('Copia subida. Ya está a salvo aunque se borre tu usuario.', 'ok'); }
          });
          fila.appendChild(b);
        });
        E.aviso();
        acciones.appendChild(fila);
      }
      pintarDrive();
      pantalla.appendChild(visor);
    },
  });
})();
