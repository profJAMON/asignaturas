/* ============================================================
   Simulaciones de Proyecto Intermodular (27/10/2026). Usan el
   marco de js/simulador.js y el explorador de archivos de
   js/sim-archivos.js (window.SIM_EXPLORADOR): van en tema.html
   después de los dos.

   En Proyecto NO van enlazadas a una pregunta (decisión de Carles,
   27/10/2026): son para entender cómo funciona algo antes de
   hacerlo de verdad. Van justo antes de la parte práctica.
   La web de ejemplo es BloqueCraft (web de fans de Minecraft
   inventada), de la pareja PixelRojo y CreeperVerde.

   taller-zip   S6 y talleres: bajar el ZIP del repositorio,
                extraerlo sin quedarse con la carpeta de dentro de
                otra, quitar la copia vieja, abrir la buena en VS Code,
                guardar el cambio y subir lo de dentro con el alias.

   Nada se guarda ni toca archivos de verdad.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function' || typeof window.SIM_EXPLORADOR !== 'function') return;

  const KB = 1024;
  const carpeta = (n, hijos, extra) => Object.assign({ n, carpeta: true, hijos: hijos || [] }, extra || {});
  const archivo = (n, t, extra) => Object.assign({ n, t }, extra || {});
  const copia = x => JSON.parse(JSON.stringify(x));
  const directo = (c, n) => c && c.carpeta && c.hijos.find(h => h.n === n);

  /* ============================================================
     S6 · Baja la última versión, trabaja y súbela
     ============================================================ */
  // La web tal como está en GitHub: CreeperVerde subió sobre.html y
  // la foto del bosque el jueves pasado desde su ordenador.
  const repoNuevo = () => [
    archivo('index.html', 5 * KB, { v: 'nueva' }),
    archivo('mobs.html', 4 * KB, { v: 'nueva' }),
    archivo('biomas.html', 4 * KB, { v: 'nueva' }),
    archivo('sobre.html', 2 * KB, { v: 'nueva' }),
    carpeta('img', [archivo('logo.png', 24 * KB), archivo('creeper.jpg', 180 * KB), archivo('bosque.jpg', 210 * KB)]),
  ];
  // La copia que se quedó en este ordenador el jueves pasado.
  const copiaVieja = () => carpeta('bloquecraft', [
    archivo('index.html', 4 * KB, { v: 'vieja' }),
    archivo('mobs.html', 4 * KB, { v: 'vieja' }),
    archivo('biomas.html', 3 * KB, { v: 'vieja' }),
    carpeta('img', [archivo('logo.png', 24 * KB), archivo('creeper.jpg', 180 * KB)]),
  ]);
  const MENSAJE_GITHUB = 'Add files via upload';

  registrarSimulacion('taller-zip', {
    ventana: 'GitHub · pareja-3/bloquecraft',
    mision: [
      'En GitHub, baja la última versión de la web: Download ZIP.',
      'Extrae el ZIP y deja en Documentos una sola carpeta de la web: la nueva, con el index.html justo dentro.',
      'Abre esa carpeta en VS Code, escribe el cambio de hoy y guárdalo.',
      'Sube a GitHub lo que hay dentro de la carpeta, con la sesión y quién ha escrito en el mensaje.',
    ],
    final: 'Así empieza y acaba cada taller: bajar el ZIP, extraerlo, quedarse solo con la carpeta nueva, abrirla en VS Code y, al acabar, subir lo de dentro con vuestro alias.',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const s = {
        app: 'github',
        repo: repoNuevo().map(x => Object.assign(x, { desde: 'CreeperVerde' })),
        ultimo: 'Sesión 5 · escribió CreeperVerde (sobre.html y bosque.jpg)',
        menuCode: false,
        subiendo: false,
        abierta: null,       // carpeta abierta en VS Code
        descargado: false,
      };

      const marco = el('div', 'sim__nav');
      const tiras = el('div', 'sim__pestanas');
      tiras.setAttribute('role', 'tablist');
      const dir = el('div', 'sim__direccion');
      dir.setAttribute('translate', 'no');
      const vistaGit = el('div', 'sim__web');
      const vistaExp = el('div', 'sim__web');
      const vistaCode = el('div', 'sim__web');
      marco.appendChild(tiras);
      marco.appendChild(dir);
      marco.appendChild(vistaGit);
      marco.appendChild(vistaExp);
      marco.appendChild(vistaCode);
      pantalla.appendChild(marco);
      const msg = el('div');
      msg.setAttribute('aria-live', 'polite');
      pantalla.appendChild(msg);
      function aviso(t, tipo) { msg.innerHTML = ''; if (t) msg.appendChild(ctx.aviso(t, tipo)); }

      // El explorador, dentro de su pestaña
      const raiz = carpeta('Este equipo', [carpeta('C:', [
        carpeta('Users', [carpeta('alumno', [
          carpeta('Desktop', []),
          carpeta('Documents', [copiaVieja(), carpeta('ejercicios-pixelrojo', [archivo('s05-ej1.html', 3 * KB)])]),
          carpeta('Downloads', [archivo('horario.pdf', 210 * KB)]),
        ])]),
      ], { unidad: true, etiqueta: 'Disco local', capacidad: 237 * 1024 * 1024 * KB, libre: 112 * 1024 * 1024 * KB })], { raiz: true });
      const E = window.SIM_EXPLORADOR(Object.assign({}, ctx, { pantalla: vistaExp }), {
        raiz,
        inicio: ['C:', 'Users', 'alumno', 'Downloads'],
        extensiones: true,
        cambio: comprobar,
        acciones(n) {
          const A = [];
          if (n.repoZip) A.push(['📂 Extraer todo…', () => extraer(n)]);
          if (n.carpeta && !n.unidad) A.push(['🧩 Abrir con Code', () => abrirEnCode(n, E.ruta() + '\\' + n.n)]);
          return A;
        },
      });
      const DOCS = ['C:', 'Users', 'alumno', 'Documents'];
      const DESC = ['C:', 'Users', 'alumno', 'Downloads'];

      function extraer(z) {
        const desc = E.buscar(DESC);
        const nom = z.n.replace(/\.zip$/i, '');
        if (desc.hijos.some(h => h.n === nom)) { E.aviso(`Ya hay una carpeta «${nom}» en Descargas: ya lo extrajiste.`, 'cuidado'); return; }
        // Windows hace una carpeta con el nombre del zip, y el zip de
        // GitHub lleva dentro otra con el mismo nombre.
        desc.hijos.push(carpeta(nom, [carpeta(nom, repoNuevo())]));
        ctx.apunta(`Extraer todo «${z.n}»: sale la carpeta «${nom}» en Descargas.`);
        E.aviso(`Ha salido la carpeta «${nom}». Ábrela: ¿está el index.html justo dentro o hay otra carpeta?`, 'ok');
        E.pintar();
        comprobar();
      }

      /* ---------- Pestañas ---------- */
      const APPS = [['github', '🌐 GitHub'], ['exp', '📁 Explorador'], ['code', '🧩 VS Code']];
      function pintarTiras() {
        tiras.innerHTML = '';
        APPS.forEach(([k, t]) => {
          const b = boton(t, 'sim__pestana' + (s.app === k ? ' sim__pestana--activa' : ''));
          b.setAttribute('role', 'tab');
          b.setAttribute('aria-selected', String(s.app === k));
          b.addEventListener('click', () => { s.app = k; aviso(); pintar(); });
          tiras.appendChild(b);
        });
      }
      function pintar() {
        pintarTiras();
        // .sim__web lleva display: flex, que le gana a hidden
        vistaGit.style.display = s.app === 'github' ? '' : 'none';
        vistaExp.style.display = s.app === 'exp' ? '' : 'none';
        vistaCode.style.display = s.app === 'code' ? '' : 'none';
        if (s.app === 'github') { ctx.barra('GitHub · pareja-3/bloquecraft'); dir.textContent = 'https://github.com/pareja-3/bloquecraft'; pintarGit(); }
        if (s.app === 'exp') { ctx.barra('Explorador de archivos'); dir.textContent = 'Explorador de archivos'; E.pintar(); }
        if (s.app === 'code') { ctx.barra('Visual Studio Code'); dir.textContent = s.abierta ? s.abierta.ruta : 'Visual Studio Code: ninguna carpeta abierta'; pintarCode(); }
      }

      /* ---------- GitHub ---------- */
      function pintarGit() {
        vistaGit.innerHTML = '';
        vistaGit.appendChild(el('p', 'sim__h', '📦 pareja-3 / bloquecraft'));
        const ult = el('p', 'sim__ayuda', 'Última subida: ');
        const m = el('strong', null, s.ultimo);
        m.setAttribute('translate', 'no');
        ult.appendChild(m);
        vistaGit.appendChild(ult);

        const fila = el('div', 'lab__fila');
        const bCode = boton('<> Code ▾', 'lab__boton lab__boton--activo');
        bCode.setAttribute('aria-expanded', String(s.menuCode));
        bCode.addEventListener('click', () => { s.menuCode = !s.menuCode; s.subiendo = false; pintarGit(); });
        const bAdd = boton('Add file ▾');
        bAdd.setAttribute('aria-expanded', String(s.subiendo));
        bAdd.addEventListener('click', () => { s.subiendo = !s.subiendo; s.menuCode = false; pintarGit(); });
        fila.appendChild(bAdd);
        fila.appendChild(bCode);
        vistaGit.appendChild(fila);

        if (s.menuCode) {
          const menu = el('div', 'sim__carpeta');
          menu.appendChild(el('p', 'sim__ayuda', 'Clone · HTTPS'));
          const dl = boton('🗜️ Download ZIP');
          dl.addEventListener('click', descargar);
          menu.appendChild(dl);
          vistaGit.appendChild(menu);
        }
        if (s.subiendo) { pintarSubida(); return; }

        const lista = el('ul', 'sim__arbol');
        lista.setAttribute('translate', 'no');
        s.repo.slice().sort((a, b) => (b.carpeta ? 1 : 0) - (a.carpeta ? 1 : 0) || a.n.localeCompare(b.n)).forEach(x => {
          const li = el('li', 'sim__tema' + (x.roto ? ' sim__peligro' : ''), `${x.carpeta ? '📁' : '📄'} ${x.n}`);
          li.appendChild(el('span', 'sim__ayuda', `  · ${x.desde || ''}`));
          lista.appendChild(li);
        });
        vistaGit.appendChild(lista);
      }
      function descargar() {
        const desc = E.buscar(DESC);
        s.menuCode = false;
        if (desc.hijos.some(h => h.n === 'bloquecraft-main.zip')) {
          aviso('Ya está descargado: lo tienes en Descargas. Ve al Explorador.', 'cuidado');
        } else {
          desc.hijos.push(archivo('bloquecraft-main.zip', 290 * KB, { repoZip: true }));
          s.descargado = true;
          ctx.cumple(0, 'GitHub → <> Code → Download ZIP: se descarga «bloquecraft-main.zip» en Descargas.');
          aviso('Descargado «bloquecraft-main.zip» en Descargas. Ahora ve al Explorador.', 'ok');
        }
        pintarGit();
      }

      // Lo que se puede arrastrar a GitHub: las carpetas de la web que
      // hay en Documentos y Descargas.
      function candidatas() {
        const out = [];
        [['Documentos', DOCS], ['Descargas', DESC]].forEach(([nom, r]) => {
          const c = E.buscar(r);
          c.hijos.filter(h => h.carpeta).forEach(h => {
            if (h.n.indexOf('ejercicios') === 0) return;
            out.push({ c: h, donde: nom });
            h.hijos.filter(x => x.carpeta && x.n !== 'img').forEach(x => out.push({ c: x, donde: `${nom}\\${h.n}` }));
          });
        });
        return out;
      }
      function pintarSubida() {
        const caja = el('div', 'sim__carpeta');
        caja.appendChild(el('p', 'sim__etiqueta', 'Upload files: arrastra aquí lo que quieres subir'));
        const ops = candidatas();
        if (!ops.length) caja.appendChild(el('p', 'sim__ayuda', 'No hay ninguna carpeta de la web en Documentos ni en Descargas.'));
        let eleccion = null;
        const grupo = el('div', 'sim__fav');
        ops.forEach(({ c, donde }) => {
          [['dentro', `Todo lo de dentro de ${donde}\\${c.n}`], ['entera', `La carpeta ${donde}\\${c.n} entera`]].forEach(([modo, t]) => {
            const b = boton(t, 'exp__item');
            b.setAttribute('aria-pressed', 'false');
            b.setAttribute('translate', 'no');
            b.addEventListener('click', () => {
              eleccion = { c, modo, donde };
              grupo.querySelectorAll('button').forEach(x => { x.classList.remove('exp__item--elegido'); x.setAttribute('aria-pressed', 'false'); });
              b.classList.add('exp__item--elegido');
              b.setAttribute('aria-pressed', 'true');
            });
            grupo.appendChild(b);
          });
        });
        caja.appendChild(grupo);
        caja.appendChild(el('p', 'sim__etiqueta', 'Commit changes: el mensaje'));
        const entrada = document.createElement('input');
        entrada.type = 'text';
        entrada.className = 'lab__entrada';
        entrada.placeholder = MENSAJE_GITHUB;
        entrada.spellcheck = false;
        entrada.setAttribute('aria-label', 'Mensaje de la subida');
        caja.appendChild(entrada);
        const ok = boton('Commit changes', 'lab__boton lab__boton--activo');
        ok.addEventListener('click', () => subir(eleccion, entrada.value.trim()));
        caja.appendChild(ok);
        vistaGit.appendChild(caja);
      }
      function subir(e, texto) {
        if (!e) { aviso('Primero elige qué arrastras.', 'cuidado'); return; }
        const mensaje = texto || MENSAJE_GITHUB;
        const idx = directo(e.c, 'index.html');
        const lo = e.modo === 'entera' ? [copia(e.c)] : e.c.hijos.map(copia);
        // GitHub cambia lo que se llama igual y deja lo demás
        lo.forEach(x => {
          x.desde = 'tú';
          const i = s.repo.findIndex(r => r.n === x.n);
          if (i >= 0) s.repo[i] = x; else s.repo.push(x);
        });
        s.ultimo = mensaje;
        s.subiendo = false;
        const quien = `Subir ${e.modo === 'entera' ? 'la carpeta entera' : 'lo de dentro de'} ${e.donde}\\${e.c.n} con el mensaje «${mensaje}».`;
        const errores = [];
        if (e.modo === 'entera' || !idx) {
          lo.forEach(x => { if (x.carpeta && x.n !== 'img') x.roto = true; });
          errores.push(`Ahora en GitHub hay una carpeta «${e.modo === 'entera' ? e.c.n : lo.find(x => x.carpeta && x.n !== 'img').n}» con la web dentro. Cloudflare busca el index.html fuera, así que la web publicada no cambia. Se sube lo de dentro de la carpeta que tiene el index.html.`);
        } else if (idx.v === 'vieja') {
          errores.push('Has subido la copia de la semana pasada: el index.html de GitHub es ahora el viejo y se ha perdido lo que había hecho CreeperVerde. Por eso se baja la última versión al empezar y se borra la vieja.');
        } else if (idx.sucio) {
          errores.push('El index.html tenía cambios sin guardar (el punto ● de VS Code). A GitHub sube lo guardado: el cambio de hoy no ha llegado. Guarda con Ctrl + S antes de subir.');
        } else if (idx.v !== 'hoy') {
          errores.push('Lo que has subido es igual que lo que ya había: falta el cambio de hoy. Escríbelo en VS Code, guárdalo y vuelve a subir.');
        }
        const alias = /sesi[oó]n\s*6/i.test(mensaje) && /escribi[oó]\s+\S+/i.test(mensaje);
        if (!alias) errores.push(`El mensaje es «${mensaje}». Tiene que decir la sesión y quién ha escrito, por ejemplo: Sesión 6 · escribió PixelRojo, CreeperVerde.`);
        if (errores.length) {
          ctx.falla(quien);
          aviso(errores.join(' '));
        } else {
          ctx.cumple(3, quien);
          aviso('Subido. En GitHub está el cambio de hoy, con el index.html donde tiene que estar y vuestro alias en el mensaje.', 'ok');
        }
        pintarGit();
      }

      /* ---------- VS Code ---------- */
      function abrirEnCode(c, ruta) {
        s.abierta = { c, ruta };
        s.app = 'code';
        ctx.apunta(`Abrir con Code la carpeta ${ruta}.`);
        aviso();
        pintar();
        comprobar();
      }
      function pintarCode() {
        vistaCode.innerHTML = '';
        if (!s.abierta) {
          vistaCode.appendChild(el('p', 'sim__ayuda', 'File → Open Folder… Elige la carpeta de la web:'));
          const fila = el('div', 'sim__fav');
          candidatas().forEach(({ c, donde }) => {
            const b = boton(`📁 ${donde}\\${c.n}`, 'exp__item');
            b.setAttribute('translate', 'no');
            b.addEventListener('click', () => abrirEnCode(c, `C:\\Users\\alumno\\${donde.replace('Documentos', 'Documents').replace('Descargas', 'Downloads')}\\${c.n}`));
            fila.appendChild(b);
          });
          if (!fila.children.length) fila.appendChild(el('p', 'sim__ayuda', 'Todavía no hay ninguna carpeta de la web. Primero bájala de GitHub.'));
          vistaCode.appendChild(fila);
          return;
        }
        const c = s.abierta.c;
        const cab = el('div', 'lab__fila');
        cab.appendChild(el('span', 'sim__etiqueta', 'EXPLORER · ' + c.n.toUpperCase()));
        const cerrar = boton('Cerrar carpeta');
        cerrar.addEventListener('click', () => { s.abierta = null; ctx.apunta('Cerrar la carpeta en VS Code.'); pintar(); comprobar(); });
        cab.appendChild(cerrar);
        vistaCode.appendChild(cab);
        const arbol = el('ul', 'sim__arbol');
        arbol.setAttribute('translate', 'no');
        (function pinta(n, ul) {
          n.hijos.slice().sort((a, b) => (b.carpeta ? 1 : 0) - (a.carpeta ? 1 : 0) || a.n.localeCompare(b.n)).forEach(h => {
            const li = el('li', 'sim__tema', `${h.carpeta ? '📁' : '📄'} ${h.n}${h.sucio ? ' ●' : ''}`);
            ul.appendChild(li);
            if (h.carpeta) { const sub = el('ul', 'sim__arbol-sub'); li.appendChild(sub); pinta(h, sub); }
          });
        })(c, arbol);
        vistaCode.appendChild(arbol);

        const idx = directo(c, 'index.html');
        if (!idx) {
          vistaCode.appendChild(ctx.aviso('Aquí no está el index.html: solo hay otra carpeta dentro. Si abres esta, Go Live no encuentra la web. Cierra y abre la carpeta de dentro.', 'cuidado'));
          return;
        }
        if (idx.v === 'vieja') {
          vistaCode.appendChild(ctx.aviso('¿Y sobre.html? Esta es la copia de la semana pasada que se quedó en el ordenador. Lo que subió CreeperVerde no está. Trabaja con la que acabas de bajar.', 'cuidado'));
          return;
        }
        const fila = el('div', 'lab__fila');
        const escribir = boton('✍️ Escribir la tabla de biomas en index.html');
        escribir.addEventListener('click', () => {
          idx.v = 'hoy'; idx.sucio = true; idx.t = 6 * KB;
          ctx.apunta('Escribir en index.html la tabla de biomas (sale ● al lado del nombre: sin guardar).');
          pintarCode(); comprobar();
        });
        const guardar = boton('💾 Guardar (Ctrl + S)');
        guardar.addEventListener('click', () => {
          if (!idx.sucio) { aviso('No hay nada sin guardar.', 'cuidado'); return; }
          idx.sucio = false;
          ctx.apunta('Ctrl + S: index.html guardado (el ● desaparece).');
          aviso();
          pintarCode(); comprobar();
        });
        fila.appendChild(escribir);
        fila.appendChild(guardar);
        vistaCode.appendChild(fila);
      }

      /* ---------- Comprobar la misión ---------- */
      function comprobar() {
        const docs = E.buscar(DOCS);
        const webs = docs.hijos.filter(h => h.carpeta && h.n.indexOf('ejercicios') !== 0);
        const buena = webs.length === 1 && directo(webs[0], 'index.html') && directo(webs[0], 'index.html').v !== 'vieja';
        if (buena) ctx.cumple(1, `En Documentos queda solo «${webs[0].n}», la nueva, con el index.html justo dentro.`);
        else if (ctx.hecho(1)) ctx.deshace(1);
        const a = s.abierta && s.abierta.c;
        const idx = directo(a, 'index.html');
        if (idx && idx.v === 'hoy' && !idx.sucio) ctx.cumple(2, 'En VS Code, con la carpeta nueva abierta: cambio de hoy escrito y guardado.');
        else if (ctx.hecho(2)) ctx.deshace(2);
        if (s.app === 'exp') {
          const anid = webs.find(w => !directo(w, 'index.html') && w.hijos.some(x => x.carpeta && directo(x, 'index.html')));
          if (anid) E.aviso(`Ojo: «${anid.n}» tiene otra carpeta dentro y el index.html está en la de dentro. Lo que va en Documentos es la de dentro.`, 'cuidado');
          else if (webs.length > 1 && webs.some(w => directo(w, 'index.html') && directo(w, 'index.html').v === 'vieja')) E.aviso('En Documentos sigue la copia vieja. Si se quedan las dos, es fácil abrir o subir la que no es.', 'cuidado');
        }
      }

      pintar();
    },
  });
})();
