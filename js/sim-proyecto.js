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

   primera-pagina   S1: carpeta con nombre limpio, img, index.html al
                    lado de img, <title> y <h1>, guardar y Go Live.
   entrega-zip      S2: comprimir la carpeta de ejercicios y entregarla
                    en Classroom (no un .html suelto ni la web).
   sin-imagen       S3: ruta sin img/, archivo con mayúsculas y espacio,
                    alt que no dice nada.
   menu-roto        S4: href con mayúscula o sin .html, menú distinto,
                    enlace externo sin https:// ni target.
   formulario-roto  S5: for distinto del id, edad sin type number,
                    opciones en <li>.
   taller-zip   S6 y talleres: bajar el ZIP del repositorio,
                extraerlo sin quedarse con la carpeta de dentro de
                otra, quitar la copia vieja, abrir la buena en VS Code,
                guardar el cambio y subir lo de dentro con el alias.
   publica      S7: subir es publicar (Cloudflare tarda un poco),
                un logo que sale en Live Server pero no publicado
                (Logo.png), F12 → Red con el 404 y nslookup: la IP
                de la web es de Cloudflare.
   conecta-css      S8: href con el nombre exacto, clase con punto.
   arregla-caja     S9: 15 px, border sin solid, .boton :hover.
   en-fila          S10: display: flex en la caja de fuera y gap.
   revisa-web       S11 (y revisa-web-final, S18): revisión cruzada
                    de una web inventada con Ctrl + U y F12.
   consola-js       S12: src mal escrito, variable que no existe, "20" + 5.
   boton-muerto     S13: <script> en el head, id distinto, textcontent.
   suma-bien        S14: .value y Number().
   prueba-casos     S15: probar el límite de un if (> en vez de >=).
   modo-noche       S16: body.modo-oscuro y toggle.
   pasa-a-tu-web    S17: un JS por página y los id de tu web.
   web-ejemplo      «Web de ejemplo» (29/10/2026): la web de BloqueCraft
                    de verdad para ver qué tiene que tener la vuestra
                    (ver el bloque del final).
   Las de S8-S17 usan simCodigo: un VS Code de mentira con Live
   Server (se ve lo GUARDADO; lo que no existe da 404 en F12 → Red).

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
  /* ============================================================
     S7 · Publica y sigue el viaje
     ============================================================ */
  registrarSimulacion('publica', {
    ventana: 'Visual Studio Code',
    mision: [
      'Sube a GitHub el cambio de hoy y comprueba en la web publicada que ya sale.',
      'En la web publicada no sale el logo. Busca con F12 → Red qué archivo falla y arréglalo.',
      'Pregunta al DNS con nslookup la IP de vuestra web y elige cuál es la respuesta.',
      'Haz nslookup de la web de clase y descubre de quién son esas IP.',
    ],
    final: 'Subir a GitHub ya es publicar: Cloudflare copia los archivos a sus servidores. Quien visita la web pregunta al DNS su IP, que es de Cloudflare, y le pide los archivos a ese servidor.',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const WEB = 'bloquecraft.pages.dev';
      const IP4 = '172.66.44.10', IP6 = '2606:4700:3036::ac43:a0e';
      const CLASE = 'asignaturas.profesorjamon.workers.dev';
      const s = {
        app: 'code',
        local: { cambio: false, sucio: false, logo: 'Logo.png' },
        repo: { cambio: false, logo: 'Logo.png' },
        deploys: [{ msg: 'Sesión 6 · escribió PixelRojo, CreeperVerde', ok: true, snap: { cambio: false, logo: 'Logo.png' } }],
        visto: { cambio: false, logo: 'Logo.png' },   // lo que enseña Chrome
        f12: false,
        renombrando: false,
        preg: null,           // pregunta de nslookup que toca
      };
      const publicado = () => { const d = s.deploys.filter(x => x.ok); return d[d.length - 1].snap; };
      const logoBien = snap => snap.logo === 'logo.png';

      const marco = el('div', 'sim__nav');
      const tiras = el('div', 'sim__pestanas');
      tiras.setAttribute('role', 'tablist');
      const dir = el('div', 'sim__direccion');
      dir.setAttribute('translate', 'no');
      const vista = el('div', 'sim__web');
      marco.appendChild(tiras);
      marco.appendChild(dir);
      marco.appendChild(vista);
      pantalla.appendChild(marco);
      const msg = el('div');
      msg.setAttribute('aria-live', 'polite');
      pantalla.appendChild(msg);
      function aviso(t, tipo) { msg.innerHTML = ''; if (t) msg.appendChild(ctx.aviso(t, tipo)); }

      // La terminal de VS Code se queda montada entre pestañas
      const term = el('div', 'lab__terminal');
      term.setAttribute('translate', 'no');
      const salida = el('div', 'lab__terminal-salida');
      salida.setAttribute('role', 'log');
      salida.setAttribute('aria-live', 'polite');
      salida.setAttribute('aria-label', 'Lo que responde la terminal');
      const linea = el('form', 'lab__terminal-linea');
      const prompt = el('span', 'lab__terminal-prompt', 'PS bloquecraft>');
      prompt.setAttribute('aria-hidden', 'true');
      const entrada = el('input', 'lab__terminal-entrada');
      entrada.type = 'text';
      entrada.autocomplete = 'off';
      entrada.spellcheck = false;
      entrada.setAttribute('autocapitalize', 'off');
      entrada.setAttribute('aria-label', 'Escribe un comando y pulsa Intro');
      entrada.placeholder = '(escribe aquí y pulsa Intro)';
      linea.appendChild(prompt);
      linea.appendChild(entrada);
      term.appendChild(salida);
      term.appendChild(linea);
      const preguntas = el('div');
      linea.addEventListener('submit', e => { e.preventDefault(); ejecutar(entrada.value); entrada.value = ''; });
      function escribe(lineas) {
        lineas.forEach(([t, c]) => salida.appendChild(el('div', 'lab__terminal-texto' + (c ? ' lab__t-' + c : ''), t)));
        salida.scrollTop = salida.scrollHeight;
      }
      function ejecutar(cmd) {
        cmd = cmd.trim();
        if (!cmd) return;
        escribe([['PS bloquecraft> ' + cmd, 'cmd']]);
        const m = /^nslookup\s+(\S+)$/i.exec(cmd);
        if (/^(cls|clear)$/i.test(cmd)) { salida.innerHTML = ''; return; }
        if (!m) { escribe([[`${cmd.split(' ')[0]}: no se reconoce como un comando. Aquí solo funciona: nslookup dirección`, 'mal']]); return; }
        const host = m[1].toLowerCase();
        const A = [['Servidor:  UnKnown'], ['Address:  192.168.1.1'], ['']];
        if (/^https?:/.test(host) || host.indexOf('/') >= 0) {
          escribe(A.concat([[`*** UnKnown no encuentra ${m[1]}: Non-existent domain`, 'mal']]));
          aviso('nslookup pregunta por un nombre, no por una URL: escribe la dirección sin https:// ni nada detrás de la barra.', 'cuidado');
          ctx.falla(`nslookup ${m[1]}: no existe (lleva https:// o /).`);
          return;
        }
        const ips = host === WEB ? [IP6, IP4] : host === CLASE ? ['2606:4700:3031::6815:230c', '104.21.35.12', '172.67.180.4'] : host === 'pixel-kart.pages.dev' ? null : ['142.250.184.' + (host.length * 7 % 200 + 10)];
        if (!ips) { escribe(A.concat([[`*** UnKnown no encuentra ${host}: Non-existent domain`, 'mal']])); return; }
        escribe(A.concat([['Respuesta no autoritativa:'], ['Nombre:  ' + host], ['Addresses:  ' + ips[0], 'dato']], ips.slice(1).map(x => ['            ' + x, 'dato'])));
        ctx.apunta(`nslookup ${host}`);
        aviso();
        if (host === WEB) { s.preg = 'ip'; pintarPregunta(); }
        else if (host === CLASE && ctx.hecho(2)) { s.preg = 'quien'; pintarPregunta(); }
        else if (host === CLASE) aviso('Primero pregunta por vuestra web: nslookup ' + WEB, 'cuidado');
      }
      function pintarPregunta() {
        preguntas.innerHTML = '';
        if (!s.preg) return;
        const P = s.preg === 'ip'
          ? ['¿Cuál de estos números es la IP de vuestra web?', [['192.168.1.1', 'No: esa es la de arriba, a quién le has preguntado (el DNS del instituto, en el router).'], [IP4, null]], 2, `La IP de ${WEB} es ${IP4} (y la larga, ${IP6}, en IPv6). 192.168.1.1 es a quién se lo has preguntado.`]
          : ['Las dos webs tienen IP que se parecen. ¿De quién son?', [['De vuestro ordenador', 'No: vuestro ordenador puede estar apagado y la web se sigue viendo.'], ['Del instituto', 'No: el instituto solo te contesta (la línea de arriba, 192.168.1.1).'], ['De Cloudflare, que guarda muchas webs a la vez', null]], 3, 'Las IP son de Cloudflare: en sus servidores están vuestra web, la de clase y miles más.'];
        preguntas.appendChild(el('p', 'sim__etiqueta', P[0]));
        const fila = el('div', 'lab__fila');
        P[1].forEach(([t, mal]) => {
          const b = boton(t);
          b.setAttribute('translate', 'no');
          b.addEventListener('click', () => {
            if (mal) { ctx.falla(`${P[0]} → ${t}`); aviso(mal, 'cuidado'); return; }
            ctx.cumple(P[2], P[3]);
            s.preg = null;
            preguntas.innerHTML = '';
            aviso(s.preg === null && P[2] === 3 ? 'Eso es.' : `Bien. Ahora prueba: nslookup ${CLASE}`, 'ok');
          });
          fila.appendChild(b);
        });
        preguntas.appendChild(fila);
      }

      const APPS = [['code', '🧩 VS Code'], ['github', '🌐 GitHub'], ['cf', '☁️ Cloudflare'], ['chrome', '🌍 Chrome']];
      function pintar() {
        tiras.innerHTML = '';
        APPS.forEach(([k, t]) => {
          const b = boton(t, 'sim__pestana' + (s.app === k ? ' sim__pestana--activa' : ''));
          b.setAttribute('role', 'tab');
          b.setAttribute('aria-selected', String(s.app === k));
          b.addEventListener('click', () => { s.app = k; aviso(); pintar(); });
          tiras.appendChild(b);
        });
        vista.innerHTML = '';
        if (s.app === 'code') { ctx.barra('Visual Studio Code'); dir.textContent = 'C:\\Users\\alumno\\Documents\\bloquecraft'; pintarCode(); }
        if (s.app === 'github') { ctx.barra('GitHub · pareja-3/bloquecraft'); dir.textContent = 'https://github.com/pareja-3/bloquecraft'; pintarGit(); }
        if (s.app === 'cf') { ctx.barra('Cloudflare · Workers y Pages'); dir.textContent = 'https://dash.cloudflare.com · bloquecraft'; pintarCf(); }
        if (s.app === 'chrome') { ctx.barra('Google Chrome'); dir.textContent = 'https://' + WEB; pintarChrome(); }
      }

      function pintarCode() {
        const L = s.local;
        const arbol = el('ul', 'sim__arbol');
        arbol.setAttribute('translate', 'no');
        [`📄 index.html${L.sucio ? ' ●' : ''}`, '📄 mobs.html', '📄 biomas.html', '📄 sobre.html'].forEach(t => arbol.appendChild(el('li', 'sim__tema', t)));
        const img = el('li', 'sim__tema', '📁 img');
        const sub = el('ul', 'sim__arbol-sub');
        [L.logo, 'creeper.jpg', 'bosque.jpg'].forEach(t => sub.appendChild(el('li', null, '🖼️ ' + t)));
        img.appendChild(sub);
        arbol.appendChild(img);
        vista.appendChild(el('p', 'sim__etiqueta', 'EXPLORER · BLOQUECRAFT'));
        vista.appendChild(arbol);
        const cod = el('p', 'sim__ayuda');
        cod.setAttribute('translate', 'no');
        cod.textContent = 'index.html, línea 9:  <img src="img/logo.png" alt="Logo de BloqueCraft">';
        vista.appendChild(cod);
        const fila = el('div', 'lab__fila');
        const esc = boton('✍️ Escribir el cambio de hoy');
        esc.addEventListener('click', () => { L.cambio = true; L.sucio = true; ctx.apunta('Escribir en index.html el cambio de hoy (● sin guardar).'); pintar(); });
        const guar = boton('💾 Guardar (Ctrl + S)');
        guar.addEventListener('click', () => { if (!L.sucio) { aviso('No hay nada sin guardar.', 'cuidado'); return; } L.sucio = false; ctx.apunta('Ctrl + S: index.html guardado.'); pintar(); });
        const ren = boton(`✏️ Cambiar el nombre de ${L.logo}`);
        ren.setAttribute('translate', 'no');
        ren.addEventListener('click', () => { s.renombrando = true; pintar(); });
        fila.appendChild(esc); fila.appendChild(guar); fila.appendChild(ren);
        vista.appendChild(fila);
        if (s.renombrando) {
          const f = el('div', 'lab__fila');
          const i = document.createElement('input');
          i.type = 'text'; i.className = 'lab__entrada'; i.value = L.logo; i.spellcheck = false;
          i.setAttribute('translate', 'no');
          i.setAttribute('aria-label', 'Nombre nuevo del logo');
          const ok = boton('Aceptar', 'lab__boton lab__boton--activo');
          const hacer = () => {
            const n = i.value.trim();
            if (!/\.png$/i.test(n)) { aviso('No le cambies la extensión: tiene que seguir acabando en .png.', 'cuidado'); return; }
            ctx.apunta(`Cambiar el nombre: ${L.logo} → ${n}.`);
            L.logo = n; s.renombrando = false;
            if (n !== 'logo.png') aviso(`Ahora se llama «${n}», pero el src pide «logo.png». Tienen que ser iguales letra a letra, también mayúsculas.`, 'cuidado');
            pintar();
          };
          ok.addEventListener('click', hacer);
          i.addEventListener('keydown', e => { if (e.key === 'Enter') hacer(); });
          f.appendChild(i); f.appendChild(ok);
          vista.appendChild(f);
          i.focus();
        }
        vista.appendChild(el('p', 'sim__etiqueta', 'TERMINAL'));
        vista.appendChild(term);
        vista.appendChild(preguntas);
        vista.appendChild(el('p', 'sim__ayuda', 'Ojo: en Live Server el logo sí sale, porque Windows no distingue Logo.png de logo.png. El servidor de Cloudflare sí los distingue.'));
      }

      function pintarGit() {
        const ult = el('p', 'sim__ayuda', 'Última subida: ' + s.deploys[s.deploys.length - 1].msg);
        ult.setAttribute('translate', 'no');
        vista.appendChild(ult);
        vista.appendChild(el('p', 'sim__etiqueta', 'Add file → Upload files: todo lo de dentro de Documents\\bloquecraft'));
        const i = document.createElement('input');
        i.type = 'text'; i.className = 'lab__entrada'; i.placeholder = 'Add files via upload'; i.spellcheck = false;
        i.setAttribute('aria-label', 'Mensaje de la subida');
        const ok = boton('Commit changes', 'lab__boton lab__boton--activo');
        ok.addEventListener('click', () => {
          const m = i.value.trim() || 'Add files via upload';
          if (!(/sesi[oó]n\s*7/i.test(m) && /escribi[oó]\s+\S+/i.test(m))) { aviso('El mensaje tiene que decir la sesión y quién ha escrito: Sesión 7 · escribió PixelRojo, CreeperVerde.', 'cuidado'); return; }
          if (!s.local.cambio) { aviso('Todavía no has escrito el cambio de hoy en VS Code.', 'cuidado'); return; }
          if (s.local.sucio) { ctx.falla('Subir con index.html sin guardar.'); aviso('index.html tiene el ● de sin guardar: a GitHub sube lo guardado. Guarda primero.', 'cuidado'); }
          s.repo = { cambio: s.local.cambio && !s.local.sucio, logo: s.local.logo };
          s.deploys.push({ msg: m, ok: false, snap: Object.assign({}, s.repo) });
          ctx.apunta(`Subir a GitHub con el mensaje «${m}». Cloudflare empieza a publicar.`);
          aviso('Subido a GitHub. Mira en Cloudflare cómo se publica.', 'ok');
          pintar();
        });
        vista.appendChild(i);
        vista.appendChild(ok);
      }

      function pintarCf() {
        vista.appendChild(el('p', 'sim__h', '☁️ bloquecraft · ' + WEB));
        vista.appendChild(el('p', 'sim__ayuda', 'Cada subida a GitHub es una publicación nueva (Deployment). La de arriba es la última.'));
        const ul = el('ul', 'sim__arbol');
        s.deploys.slice().reverse().forEach(d => {
          const li = el('li', 'sim__tema', `${d.ok ? '✅ Success' : '⏳ Building…'} · ${d.msg}`);
          li.setAttribute('translate', 'no');
          ul.appendChild(li);
        });
        vista.appendChild(ul);
        if (s.deploys.some(d => !d.ok)) {
          const b = boton('⏱ Esperar un minuto');
          b.addEventListener('click', () => {
            s.deploys.forEach(d => { d.ok = true; });
            ctx.apunta('Esperar: Cloudflare acaba de publicar (Success).');
            pintar();
          });
          vista.appendChild(b);
        }
      }

      function pintarChrome() {
        const v = s.visto;
        const pag = el('div', 'sim__carpeta');
        pag.appendChild(el('p', 'sim__h', 'BloqueCraft'));
        pag.appendChild(el('p', null, logoBien(v) ? '🟩 [el logo de BloqueCraft]' : '🖼️❌ Logo de BloqueCraft'));
        pag.appendChild(el('p', null, 'Guías de Minecraft hechas por fans.'));
        if (v.cambio) pag.appendChild(el('p', null, '🆕 Tabla de biomas: llanura, bosque, desierto…'));
        vista.appendChild(pag);
        const fila = el('div', 'lab__fila');
        const rec = boton('⟳ Recargar (Ctrl + F5)');
        rec.addEventListener('click', () => {
          const antes = s.visto;
          s.visto = Object.assign({}, publicado());
          ctx.apunta('Ctrl + F5 en la web publicada.');
          if (s.deploys.some(d => !d.ok)) aviso('Sale lo mismo que antes: Cloudflare todavía está publicando (mira su pestaña).', 'cuidado');
          else aviso();
          if (s.visto.cambio) ctx.cumple(0, 'La web publicada ya tiene el cambio de hoy.');
          if (logoBien(s.visto)) ctx.cumple(1, 'Logo.png → logo.png, subido y publicado: el logo ya sale.');
          else if (antes.logo !== s.visto.logo) aviso('El logo sigue sin salir. Mira en F12 → Red qué nombre pide la página.', 'cuidado');
          pintar();
        });
        const f12 = boton(s.f12 ? 'Cerrar F12' : 'F12');
        f12.addEventListener('click', () => { s.f12 = !s.f12; if (s.f12) ctx.apunta('F12 → Red.'); pintar(); });
        fila.appendChild(rec); fila.appendChild(f12);
        vista.appendChild(fila);
        if (s.f12) {
          vista.appendChild(el('p', 'sim__etiqueta', 'Red (Network): lo que ha llegado al recargar'));
          const t = el('table', 'exp__prop');
          t.setAttribute('translate', 'no');
          const tr0 = el('tr'); ['Nombre', 'Estado'].forEach(x => tr0.appendChild(el('th', null, x))); t.appendChild(tr0);
          [['index.html', '200'], ['logo.png', logoBien(v) ? '200' : '404'], ['creeper.jpg', '200'], ['bosque.jpg', '200']].forEach(([n, e]) => {
            const tr = el('tr');
            tr.appendChild(el('td', null, n));
            tr.appendChild(el('td', e === '404' ? 'sim__mal' : null, e));
            t.appendChild(tr);
          });
          vista.appendChild(t);
          if (!logoBien(v)) vista.appendChild(el('p', 'sim__ayuda', '404 = el servidor no tiene ningún archivo que se llame exactamente así. La página pide img/logo.png. ¿Cómo se llama el archivo en VS Code?'));
        }
      }
      pintar();
    },
  });
  /* ============================================================
     Mini VS Code + Live Server (S8-S17)
     ------------------------------------------------------------
     simCodigo(nombre, {
       ventana, carpeta, archivos: { ruta: texto | null (imagen) },
       abrir: 'index.html', consola: true|false,
       mision: [{ t, ok(guardado, red) → bool, hecho, pista }],
       final,
     })
     El alumno edita, guarda (● = sin guardar) y pulsa Go Live o
     Recargar: se monta la página con lo GUARDADO, como un servidor
     de verdad (distingue mayúsculas; lo que no existe da 404 en
     F12 → Red). Al recargar se comprueba cada punto de la misión
     sobre lo guardado.
     ============================================================ */
  const LENGUA = r => /\.css$/.test(r) ? 'css' : /\.js$/.test(r) ? 'js' : 'html';
  const PIXEL = n => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="120" height="70"><rect width="120" height="70" fill="#7cb342"/><rect y="46" width="120" height="24" fill="#795548"/><text x="60" y="40" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#fff">${n}</text></svg>`);
  function resolver(base, ref) {
    const partes = (base ? base.split('/') : []).concat(ref.split('/'));
    const out = [];
    partes.forEach(x => { if (x === '..') out.pop(); else if (x && x !== '.') out.push(x); });
    return out.join('/');
  }

  function simCodigo(nombre, def) {
    registrarSimulacion(nombre, {
      ventana: def.ventana || 'Visual Studio Code',
      mision: def.mision.map(m => m.t),
      final: def.final,
      crear(ctx) {
        const { el, boton, pantalla } = ctx;
        const guardado = Object.assign({}, def.archivos);
        const texto = Object.assign({}, def.archivos);
        let abierto = def.abrir || 'index.html';
        let pagina = /\.html$/.test(abierto) ? abierto : 'index.html';
        let red = [];
        let live = false, f12 = false;

        const arbol = el('ul', 'sim__arbol');
        arbol.setAttribute('translate', 'no');
        const cab = el('p', 'sim__etiqueta');
        const editor = el('div', 'probador__editor');
        const pre = el('pre', 'probador__resaltado');
        pre.setAttribute('aria-hidden', 'true');
        const code = el('code');
        pre.appendChild(code);
        const area = el('textarea', 'probador__area');
        area.spellcheck = false;
        area.setAttribute('autocapitalize', 'off');
        area.setAttribute('autocomplete', 'off');
        area.setAttribute('wrap', 'off');
        area.setAttribute('translate', 'no');
        editor.appendChild(pre);
        editor.appendChild(area);
        const mandos = el('div', 'lab__fila');
        const bGuardar = boton('💾 Guardar (Ctrl + S)');
        const bLive = boton('▶ Go Live', 'lab__boton lab__boton--activo');
        const bF12 = boton('F12 → Red');
        mandos.appendChild(bGuardar); mandos.appendChild(bLive); mandos.appendChild(bF12);
        const msg = el('div');
        msg.setAttribute('aria-live', 'polite');
        const direccion = el('div', 'sim__direccion');
        direccion.setAttribute('translate', 'no');
        const vista = window.PROBADOR.crearVista({ rotulo: 'Chrome', titulo: 'La página en Chrome', consola: !!def.consola, alto: 90 });
        const panelRed = el('div');
        const zonaChrome = el('div');
        zonaChrome.appendChild(direccion);
        zonaChrome.appendChild(vista.el);
        zonaChrome.appendChild(panelRed);
        zonaChrome.style.display = 'none';

        pantalla.appendChild(el('p', 'sim__etiqueta', 'EXPLORER · ' + (def.carpeta || 'mi-web').toUpperCase()));
        pantalla.appendChild(arbol);
        pantalla.appendChild(cab);
        pantalla.appendChild(editor);
        pantalla.appendChild(mandos);
        pantalla.appendChild(msg);
        pantalla.appendChild(zonaChrome);
        function aviso(t, tipo) { msg.innerHTML = ''; if (t) msg.appendChild(ctx.aviso(t, tipo)); }

        const sucio = r => texto[r] !== guardado[r];
        function pintarArbol() {
          arbol.innerHTML = '';
          const rutas = Object.keys(texto).sort((a, b) => (a.split('/').length - b.split('/').length) || a.localeCompare(b));
          const carpetas = {};
          rutas.forEach(r => {
            const i = r.lastIndexOf('/');
            const c = i < 0 ? '' : r.slice(0, i);
            (carpetas[c] = carpetas[c] || []).push(r);
          });
          const hoja = (r, ul) => {
            const li = el('li');
            const nom = r.slice(r.lastIndexOf('/') + 1);
            if (texto[r] === null) {
              const sp = el('span', 'sim__ayuda', '🖼️ ' + nom);
              sp.setAttribute('translate', 'no');
              li.appendChild(sp);
              if (def.renombrar) {
                const rb = boton('✏️ Cambiar nombre');
                rb.addEventListener('click', () => renombrar(r, li));
                li.appendChild(rb);
              }
              ul.appendChild(li);
              return;
            }
            const b = boton(`📄 ${nom}${sucio(r) ? ' ●' : ''}`, 'exp__item' + (r === abierto ? ' exp__item--elegido' : ''));
            b.setAttribute('aria-pressed', String(r === abierto));
            b.addEventListener('click', () => { abierto = r; if (/\.html$/.test(r)) pagina = r; pintarEditor(); pintarArbol(); });
            li.appendChild(b);
            ul.appendChild(li);
          };
          Object.keys(carpetas).sort().forEach(c => {
            if (!c) { carpetas[c].forEach(r => hoja(r, arbol)); return; }
            const li = el('li', 'sim__tema', '📁 ' + c);
            const sub = el('ul', 'sim__arbol-sub');
            carpetas[c].forEach(r => hoja(r, sub));
            li.appendChild(sub);
            arbol.appendChild(li);
          });
        }
        // Cambiar el nombre de una imagen (como en el panel de VS Code)
        function renombrar(r, li) {
          li.innerHTML = '';
          const dirR = r.indexOf('/') >= 0 ? r.slice(0, r.lastIndexOf('/') + 1) : '';
          const i = el('input', 'lab__entrada');
          i.type = 'text'; i.value = r.slice(dirR.length); i.spellcheck = false;
          i.setAttribute('translate', 'no');
          i.setAttribute('aria-label', 'Nombre nuevo');
          const ok = boton('Aceptar', 'lab__boton lab__boton--activo');
          const hacer = () => {
            const n = i.value.trim();
            const viejaExt = (/\.([^.]+)$/.exec(r) || [])[1] || '';
            const nuevaExt = (/\.([^.]+)$/.exec(n) || [])[1] || '';
            if (!n || /[\\/:*?"<>|]/.test(n)) { aviso('Ese nombre no vale.', 'cuidado'); return; }
            if (nuevaExt.toLowerCase() !== viejaExt.toLowerCase()) { aviso(`No cambies la extensión: tiene que seguir siendo .${viejaExt.toLowerCase()}.`, 'cuidado'); return; }
            const nr = dirR + n;
            if (nr !== r && Object.prototype.hasOwnProperty.call(texto, nr)) { aviso('Ya hay un archivo con ese nombre.', 'cuidado'); return; }
            const t = {}, g = {};
            Object.keys(texto).forEach(k => { t[k === r ? nr : k] = texto[k]; });
            Object.keys(guardado).forEach(k => { g[k === r ? nr : k] = guardado[k]; });
            Object.keys(texto).forEach(k => delete texto[k]); Object.assign(texto, t);
            Object.keys(guardado).forEach(k => delete guardado[k]); Object.assign(guardado, g);
            ctx.apunta(`Cambiar el nombre: ${r} → ${nr}.`);
            aviso();
            pintarArbol();
            if (live) recargar();
          };
          ok.addEventListener('click', hacer);
          i.addEventListener('keydown', e => { if (e.key === 'Enter') hacer(); });
          li.appendChild(i); li.appendChild(ok);
          i.focus();
        }
        function resaltar() {
          code.innerHTML = window.resaltarCodigo ? window.resaltarCodigo(area.value, LENGUA(abierto)) : '';
          area.rows = Math.max(4, area.value.split('\n').length + 1);
        }
        function pintarEditor() {
          cab.textContent = abierto + (sucio(abierto) ? ' ●  (sin guardar)' : '');
          area.value = texto[abierto];
          area.setAttribute('aria-label', 'Código de ' + abierto);
          resaltar();
        }
        area.addEventListener('input', () => {
          const antes = sucio(abierto);
          texto[abierto] = area.value;
          resaltar();
          if (antes !== sucio(abierto)) { pintarArbol(); cab.textContent = abierto + (sucio(abierto) ? ' ●  (sin guardar)' : ''); }
        });
        area.addEventListener('scroll', () => { pre.scrollLeft = area.scrollLeft; });
        area.addEventListener('keydown', e => {
          if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); guardar(); }
          if (e.key === 'Tab') { e.preventDefault(); const i = area.selectionStart; area.setRangeText('    ', i, area.selectionEnd, 'end'); area.dispatchEvent(new Event('input')); }
        });
        function guardar() {
          if (!sucio(abierto)) { aviso('No hay nada sin guardar en ' + abierto + '.', 'cuidado'); return; }
          guardado[abierto] = texto[abierto];
          ctx.apunta(`Ctrl + S: ${abierto} guardado.`);
          aviso();
          pintarArbol(); pintarEditor();
          if (live) recargar(true);
        }
        bGuardar.addEventListener('click', guardar);

        // Monta la página con lo guardado, como un servidor
        function recargar(solo) {
          red = [[pagina, guardado[pagina] !== undefined ? 200 : 404]];
          const dirPag = pagina.indexOf('/') >= 0 ? pagina.slice(0, pagina.lastIndexOf('/')) : '';
          let html = guardado[pagina] || '<h1>Cannot GET /' + pagina + '</h1>';
          let css = '';
          html = html.replace(/<link\b[^>]*>/gi, tag => {
            if (!/stylesheet/i.test(tag)) return tag;
            const m = /href\s*=\s*["']([^"']*)["']/i.exec(tag);
            if (!m) return '';
            const r = resolver(dirPag, m[1]);
            if (typeof guardado[r] === 'string' && LENGUA(r) === 'css') { css += '\n' + guardado[r]; red.push([m[1], 200]); }
            else red.push([m[1], 404]);
            return '';
          });
          html = html.replace(/<script\b([^>]*)\bsrc\s*=\s*["']([^"']*)["']([^>]*)>\s*<\/script>/gi, (t, a, src) => {
            const r = resolver(dirPag, src);
            if (typeof guardado[r] === 'string') { red.push([src, 200]); return '<script>\n' + guardado[r].replace(/<\/script/gi, '<\\/script') + '\n<\/script>'; }
            red.push([src, 404]);
            return '';
          });
          html = html.replace(/(<img\b[^>]*\bsrc\s*=\s*["'])([^"']*)(["'])/gi, (t, a, src, b) => {
            if (/^(https?:|data:)/.test(src)) return t;
            const r = resolver(dirPag, src);
            if (Object.prototype.hasOwnProperty.call(guardado, r)) { red.push([src, 200]); return a + PIXEL(src.split('/').pop()) + b; }
            red.push([src, 404]);
            return a + 'no-existe.png' + b;
          });
          vista.mostrar({ html, css });
          direccion.textContent = 'http://127.0.0.1:5500/' + pagina;
          pintarRed();
          if (solo) return;
          comprobar();
        }
        function pintarRed() {
          panelRed.innerHTML = '';
          if (!f12) return;
          panelRed.appendChild(el('p', 'sim__etiqueta', 'F12 → Red: lo que ha pedido la página'));
          const t = el('table', 'exp__prop');
          t.setAttribute('translate', 'no');
          const tr0 = el('tr'); ['Archivo', 'Estado'].forEach(x => tr0.appendChild(el('th', null, x))); t.appendChild(tr0);
          red.forEach(([n, e]) => { const tr = el('tr'); tr.appendChild(el('td', null, n)); tr.appendChild(el('td', e === 404 ? 'sim__mal' : null, String(e))); t.appendChild(tr); });
          panelRed.appendChild(t);
          if (red.some(x => x[1] === 404)) panelRed.appendChild(el('p', 'sim__ayuda', '404 = no hay ningún archivo con ese nombre exacto en esa carpeta. Compara la ruta con el EXPLORER.'));
        }
        function comprobar() {
          const sinGuardar = Object.keys(texto).filter(sucio);
          let primera = null;
          def.mision.forEach((m, i) => {
            if (m.ok(guardado, red)) ctx.cumple(i, m.hecho);
            else { if (ctx.hecho(i)) ctx.deshace(i); if (primera === null) primera = m.pista; }
          });
          if (sinGuardar.length) aviso(`${sinGuardar.join(', ')} tiene cambios sin guardar (●). Chrome enseña lo GUARDADO: Ctrl + S.`, 'cuidado');
          else if (primera) aviso(primera, 'cuidado');
          else aviso();
        }
        bLive.addEventListener('click', () => {
          if (!live) { live = true; zonaChrome.style.display = ''; bLive.textContent = '⟳ Recargar en Chrome'; ctx.apunta('Go Live: se abre la página en Chrome.'); }
          else ctx.apunta('Recargar Chrome.');
          recargar();
        });
        bF12.addEventListener('click', () => {
          f12 = !f12;
          bF12.textContent = f12 ? 'Cerrar F12' : 'F12 → Red';
          if (f12) ctx.apunta('F12 → Red.');
          if (!live) aviso('Primero abre la página con Go Live.', 'cuidado');
          pintarRed();
        });
        pintarArbol();
        pintarEditor();
      },
    });
  }
  /* ---------- Ayudas para comprobar el código guardado ---------- */
  const regla = (css, sel) => {
    const re = new RegExp('(^|[}\\s])' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}', 'm');
    const m = re.exec(css || '');
    return m ? m[2] : null;
  };
  const tiene = (txt, re) => re.test(txt || '');
  const carga = (red, archivo) => red.some(([n, e]) => n === archivo && e === 200);
  const idsHtml = html => (String(html || '').match(/\bid\s*=\s*["']([^"']+)["']/g) || []).map(x => /["']([^"']+)["']/.exec(x)[1]);
  const idsJs = js => (String(js || '').match(/querySelector\(\s*["']#([^"']+)["']\s*\)/g) || []).map(x => /#([^"']+)/.exec(x)[1]);

  /* ============================================================
     S8 · Conecta el CSS
     ============================================================ */
  simCodigo('conecta-css', {
    carpeta: 'ejercicios-pixelrojo',
    abrir: 's08-mobs.html',
    archivos: {
      's08-mobs.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>Mobs</title>\n    <link rel="stylesheet" href="s08-mob.css">\n</head>\n<body>\n    <h1>Mobs de Minecraft</h1>\n    <p class="peligro">El creeper explota si te acercas.</p>\n    <p>El aldeano te cambia cosas por esmeraldas.</p>\n</body>\n</html>\n',
      's08-mobs.css': 'body {\n    background-color: #1b1b3a;\n    color: white;\n    font-family: Arial, sans-serif;\n}\n\nh1 {\n    color: #7cb342;\n}\n\npeligro {\n    color: red;\n    font-weight: bold;\n}\n',
    },
    mision: [
      { t: 'Haz que la página coja su CSS: el fondo tiene que salir oscuro.', ok: (g, r) => carga(r, 's08-mobs.css'), hecho: 'El link apunta a s08-mobs.css: la página ya coge su CSS.', pista: 'El fondo sigue blanco: la página no encuentra su CSS. Abre F12 → Red: ¿qué archivo da 404? Compáralo letra a letra con el EXPLORER.' },
      { t: 'La frase del creeper tiene que salir en rojo.', ok: (g, r) => carga(r, 's08-mobs.css') && tiene(regla(g['s08-mobs.css'], '.peligro'), /color\s*:\s*red/), hecho: 'En el CSS, la clase lleva punto: .peligro.', pista: 'La frase del creeper no sale roja. El HTML tiene class="peligro". En el CSS, ¿cómo empieza el selector de una clase?' },
      { t: 'Cambia el color del título por otro tuyo y que se vea en Chrome.', ok: (g, r) => { const h = regla(g['s08-mobs.css'], 'h1'); return carga(r, 's08-mobs.css') && !!h && /color\s*:/.test(h) && !/#7cb342/i.test(h); }, hecho: 'Color del h1 cambiado, guardado y visto en Chrome.', pista: 'Cambia el color del h1 en el CSS, guarda (Ctrl + S) y recarga.' },
    ],
    final: 'Para que una página coja su CSS, el href tiene que ser el nombre exacto del archivo. En el CSS, las clases llevan punto delante. Y antes de mirar en Chrome, siempre Ctrl + S.',
  });

  /* ============================================================
     S9 · Arregla la caja
     ============================================================ */
  simCodigo('arregla-caja', {
    carpeta: 'ejercicios-pixelrojo',
    abrir: 's09-mobs.css',
    archivos: {
      's09-mobs.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>Mobs</title>\n    <link rel="stylesheet" href="s09-mobs.css">\n</head>\n<body>\n    <div class="tarjeta">\n        <h2>Creeper</h2>\n        <p>Explota si te acercas.</p>\n    </div>\n    <p>\n        <a class="boton" href="#">Jugar</a>\n        <a class="boton" href="#">Opciones</a>\n    </p>\n</body>\n</html>\n',
      's09-mobs.css': 'body {\n    font-family: Arial, sans-serif;\n}\n\n.tarjeta {\n    width: 200px;\n    padding: 15 px;\n    border: 3px #7cb342;\n    border-radius: 10px;\n}\n\n.boton {\n    background-color: #7cb342;\n    color: white;\n    padding: 10px 20px;\n    text-decoration: none;\n}\n\n.boton :hover {\n    background-color: #33691e;\n}\n',
    },
    mision: [
      { t: 'El texto de la tarjeta no puede tocar el borde: tiene que tener relleno.', ok: g => tiene(regla(g['s09-mobs.css'], '.tarjeta'), /padding\s*:\s*\d+px\s*;/), hecho: 'padding: 15px, con el número y px juntos.', pista: 'El texto de la tarjeta está pegado al borde: el padding no hace nada. Mira cómo están escritos el número y px.' },
      { t: 'La tarjeta tiene que tener un borde verde.', ok: g => tiene(regla(g['s09-mobs.css'], '.tarjeta'), /border\s*:[^;]*\b(solid|dashed|dotted|double)\b/), hecho: 'border con grosor, tipo de línea y color: 3px solid #7cb342.', pista: 'No sale ningún borde. Un border necesita tres cosas: grosor, tipo de línea y color. ¿Cuál falta?' },
      { t: 'Los botones tienen que cambiar de color al pasar el ratón.', ok: g => regla(g['s09-mobs.css'], '.boton:hover') !== null, hecho: '.boton:hover, todo junto y sin espacio.', pista: 'Los botones no cambian al pasar el ratón. El :hover va pegado al nombre de la clase, sin espacio.' },
    ],
    final: 'Cuando una regla no hace nada, casi siempre es un detalle: un espacio de más (15 px, .boton :hover) o algo que falta (solid). El navegador no avisa: simplemente no la aplica.',
  });

  /* ============================================================
     S10 · Ponlo en fila
     ============================================================ */
  simCodigo('en-fila', {
    carpeta: 'ejercicios-pixelrojo',
    abrir: 's10-menu.css',
    archivos: {
      's10-menu.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>BloqueCraft</title>\n    <link rel="stylesheet" href="s10-menu.css">\n</head>\n<body>\n    <nav>\n        <a href="#">Inicio</a>\n        <a href="#">Mobs</a>\n        <a href="#">Biomas</a>\n    </nav>\n    <div class="tarjetas">\n        <div class="tarjeta">Creeper</div>\n        <div class="tarjeta">Zombi</div>\n        <div class="tarjeta">Enderman</div>\n    </div>\n</body>\n</html>\n',
      's10-menu.css': 'body {\n    font-family: Arial, sans-serif;\n}\n\nnav a {\n    display: flex;\n    padding: 8px;\n    background-color: #7cb342;\n    color: white;\n}\n\n.tarjeta {\n    display: flex;\n    border: 2px solid #795548;\n    padding: 10px;\n}\n',
    },
    mision: [
      { t: 'El menú tiene que salir en fila.', ok: g => tiene(regla(g['s10-menu.css'], 'nav'), /display\s*:\s*flex/), hecho: 'display: flex en nav, la caja que envuelve los enlaces.', pista: 'El menú sigue en columna. display: flex se pone en la caja de FUERA, la que tiene dentro los enlaces, no en cada enlace.' },
      { t: 'Las tarjetas también tienen que salir en fila.', ok: g => tiene(regla(g['s10-menu.css'], '.tarjetas'), /display\s*:\s*flex/), hecho: 'display: flex en .tarjetas.', pista: 'Las tarjetas siguen una debajo de otra. ¿Cuál es la caja que las envuelve a las tres? Esa es la que necesita una regla con display: flex.' },
      { t: 'Separa las tarjetas: que no estén pegadas.', ok: g => tiene(regla(g['s10-menu.css'], '.tarjetas'), /(gap\s*:\s*\d+px|justify-content\s*:\s*space-(between|around|evenly))/), hecho: 'Espacio entre tarjetas con gap o justify-content en .tarjetas.', pista: 'Las tarjetas están pegadas. Para separarlas: gap o justify-content, también en .tarjetas.' },
    ],
    final: 'display: flex se pone siempre en la caja de fuera, y lo que hay dentro se coloca en fila. Para separar, gap o justify-content, también en la de fuera.',
  });

  /* ============================================================
     S12 · La consola
     ============================================================ */
  simCodigo('consola-js', {
    carpeta: 'ejercicios-pixelrojo',
    abrir: 's12-mobs.js',
    consola: true,
    archivos: {
      's12-mobs.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>Mobs</title>\n</head>\n<body>\n    <h1>Mira la consola (F12)</h1>\n\n    <script src="s12-mob.js"></script>\n</body>\n</html>\n',
      's12-mobs.js': '// El mob y sus vidas\nlet mob = "Creeper";\nlet vidas = 20;\nconsole.log(mob);\nconsole.log("Vidas: " + vida);\n\n// Esmeraldas del cofre y del inventario\nlet total = "20" + 5;\nconsole.log(total);\n',
    },
    mision: [
      { t: 'Conecta el JS: en la consola tiene que salir Creeper.', ok: (g, r) => carga(r, 's12-mobs.js'), hecho: 'El src apunta a s12-mobs.js: la consola ya enseña Creeper.', pista: 'La consola está vacía: la página no encuentra su JS. Mira en F12 → Red qué archivo da 404.' },
      { t: 'Arregla el error rojo de la consola.', ok: (g, r) => carga(r, 's12-mobs.js') && !/\bvida\b/.test(g['s12-mobs.js']), hecho: 'console.log("Vidas: " + vidas): la variable se llama vidas.', pista: 'Hay un error en rojo. Léelo: dice el nombre que no existe y la línea. Compáralo con el nombre de la variable.' },
      { t: 'El total de esmeraldas tiene que salir 25, no 205.', ok: (g, r) => carga(r, 's12-mobs.js') && /let\s+total\s*=\s*20\s*\+\s*5\s*;/.test(g['s12-mobs.js']), hecho: 'let total = 20 + 5: sin comillas, los números se suman.', pista: 'Sale 205. "20" lleva comillas: es un texto, y el + junta en vez de sumar.' },
    ],
    final: 'La consola es tu chivato: si está vacía, el JS no está conectado; si hay algo en rojo, te dice qué y en qué línea. Y "20" con comillas es un texto, no un número.',
  });

  /* ============================================================
     S13 · El botón no hace nada
     ============================================================ */
  simCodigo('boton-muerto', {
    carpeta: 'ejercicios-pixelrojo',
    abrir: 's13-chiste.html',
    consola: true,
    archivos: {
      's13-chiste.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>Chiste</title>\n    <script src="s13-chiste.js"></script>\n</head>\n<body>\n    <h1>El chiste del día</h1>\n    <button id="boton-chiste">Cuéntame uno</button>\n    <p id="chiste">Pulsa el botón.</p>\n</body>\n</html>\n',
      's13-chiste.js': 'let boton = document.querySelector("#boton");\nlet chiste = document.querySelector("#chiste");\n\nboton.addEventListener("click", function () {\n    chiste.textcontent = "¿Por qué el creeper no tiene amigos? Porque explota con todos.";\n});\n',
    },
    mision: [
      { t: 'El <script> tiene que ir donde toca, para que el JS encuentre lo que hay en la página.', ok: g => { const h = g['s13-chiste.html']; const i = h.search(/<script\b/i); return i > h.search(/<button\b/i) && i > -1 && i < h.search(/<\/body>/i); }, hecho: 'El <script> va al final del <body>, después del botón.', pista: 'Error rojo «Cannot read properties of null»: el JS busca el botón antes de que exista. ¿Dónde está el <script>? ¿Dónde tendría que ir?' },
      { t: 'Que el JS encuentre el botón: ningún error rojo.', ok: g => { const ids = idsHtml(g['s13-chiste.html']); return idsJs(g['s13-chiste.js']).every(x => ids.indexOf(x) >= 0); }, hecho: 'El id del querySelector y el del HTML son iguales.', pista: 'Sigue saliendo «Cannot read properties of null»: querySelector no encuentra el botón. Compara el id que busca el JS con el id del botón en el HTML.' },
      { t: 'Al pulsar, tiene que salir el chiste.', ok: g => /chiste\.textContent\s*=/.test(g['s13-chiste.js']), hecho: 'textContent, con la C mayúscula.', pista: 'Ya no hay error, pero al pulsar no sale el chiste. Algo está mal escrito y JavaScript no avisa: mayúsculas y minúsculas cuentan.' },
    ],
    final: 'Si un botón no hace nada: mira la consola. «null» = el JS no encuentra el elemento (script antes de tiempo o id distinto). Sin error y sin efecto = algo mal escrito, como textcontent.',
  });

  /* ============================================================
     S14 · Suma bien
     ============================================================ */
  simCodigo('suma-bien', {
    carpeta: 'ejercicios-pixelrojo',
    abrir: 's14-esmeraldas.js',
    consola: true,
    archivos: {
      's14-esmeraldas.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>Esmeraldas</title>\n</head>\n<body>\n    <h1>¿Cuántas esmeraldas tienes?</h1>\n    <label for="cofre">En el cofre:</label>\n    <input type="text" id="cofre">\n    <label for="inventario">En el inventario:</label>\n    <input type="text" id="inventario">\n    <button id="sumar">Sumar</button>\n    <p id="resultado"></p>\n\n    <script src="s14-esmeraldas.js"></script>\n</body>\n</html>\n',
      's14-esmeraldas.js': 'let boton = document.querySelector("#sumar");\nlet cofre = document.querySelector("#cofre");\nlet inventario = document.querySelector("#inventario");\nlet resultado = document.querySelector("#resultado");\n\nboton.addEventListener("click", function () {\n    let total = cofre + inventario.value;\n    resultado.textContent = "Tienes " + total + " esmeraldas.";\n});\n',
    },
    mision: [
      { t: 'Prueba con 2 y 3: tiene que leer lo escrito en las dos cajas (no puede salir [object HTMLInputElement]).', ok: g => /cofre\.value/.test(g['s14-esmeraldas.js']) && /inventario\.value/.test(g['s14-esmeraldas.js']), hecho: 'cofre.value e inventario.value: lo escrito en cada caja.', pista: 'Sale «[object HTMLInputElement]»: eso es la caja entera, no lo que hay escrito dentro. ¿Qué le falta a cofre?' },
      { t: 'Con 2 y 3 tiene que salir 5, no 23.', ok: g => /Number\(\s*cofre\.value\s*\)/.test(g['s14-esmeraldas.js']) && /Number\(\s*inventario\.value\s*\)/.test(g['s14-esmeraldas.js']), hecho: 'Number(cofre.value) + Number(inventario.value): números, que se suman.', pista: 'Sale 23: lo que viene de una caja siempre es texto, y el + junta. ¿Qué convierte un texto en número?' },
    ],
    final: 'Lo que escribe el usuario se lee con .value y siempre llega como texto. Para sumar, primero Number().',
  });

  /* ============================================================
     S16 · Modo noche
     ============================================================ */
  simCodigo('modo-noche', {
    carpeta: 'ejercicios-pixelrojo',
    abrir: 's16-noche.css',
    consola: true,
    archivos: {
      's16-noche.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>Modo noche</title>\n    <link rel="stylesheet" href="s16-noche.css">\n</head>\n<body>\n    <button id="modo">🌙 Modo noche</button>\n    <h1>BloqueCraft</h1>\n    <p>Cuando se hace de noche, salen los mobs.</p>\n\n    <script src="s16-noche.js"></script>\n</body>\n</html>\n',
      's16-noche.css': 'body {\n    background-color: white;\n    color: black;\n    font-family: Arial, sans-serif;\n}\n\n.modo-oscuro body {\n    background-color: #1b1b3a;\n    color: white;\n}\n',
      's16-noche.js': 'let boton = document.querySelector("#modo");\n\nboton.addEventListener("click", function () {\n    document.body.classList.add("modo-oscuro");\n});\n',
    },
    mision: [
      { t: 'Al pulsar el botón, la página tiene que ponerse oscura.', ok: g => regla(g['s16-noche.css'], 'body.modo-oscuro') !== null || regla(g['s16-noche.css'], '.modo-oscuro') !== null, hecho: 'En el CSS, body.modo-oscuro: el body cuando tiene esa clase.', pista: 'Al pulsar, el JS pone la clase modo-oscuro en el body, pero no cambia nada. «El body que tiene la clase modo-oscuro» se escribe todo junto: body.modo-oscuro.' },
      { t: 'Al volver a pulsar, tiene que volver a ser clara.', ok: g => /classList\.toggle\(\s*["']modo-oscuro["']\s*\)/.test(g['s16-noche.js']), hecho: 'classList.toggle: pone la clase si no está y la quita si está.', pista: 'Se pone oscura, pero no vuelve. add pone la clase y ya está. ¿Qué método la pone y la quita, como un interruptor?' },
    ],
    final: 'El JS solo pone y quita clases; lo que cambia el aspecto es el CSS de esa clase. Si la clase está pero no cambia nada, el fallo está en el selector del CSS.',
  });

  /* ============================================================
     S17 · Pásalo a tu web
     ============================================================ */
  simCodigo('pasa-a-tu-web', {
    carpeta: 'bloquecraft',
    abrir: 'servidor.js',
    consola: true,
    archivos: {
      'index.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>BloqueCraft</title>\n    <link rel="stylesheet" href="estilos.css">\n</head>\n<body>\n    <h1>BloqueCraft</h1>\n    <p>Guías de Minecraft hechas por fans.</p>\n\n    <script src="servidor.js"></script>\n</body>\n</html>\n',
      'servidor.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>Servidor</title>\n    <link rel="stylesheet" href="estilos.css">\n</head>\n<body>\n    <h1>Únete al servidor de clase</h1>\n    <label for="alias">Tu alias:</label>\n    <input type="text" id="alias">\n    <label for="modo">Modo de juego:</label>\n    <select id="modo">\n        <option>Supervivencia</option>\n        <option>Creativo</option>\n    </select>\n    <button id="boton-unirme">Unirme</button>\n    <p id="respuesta"></p>\n</body>\n</html>\n',
      'servidor.js': '// Copiado de mi ejercicio s14-ej1\nlet boton = document.querySelector("#boton");\nlet nombre = document.querySelector("#nombre");\nlet modo = document.querySelector("#modo");\nlet mensaje = document.querySelector("#mensaje");\n\nboton.addEventListener("click", function () {\n    mensaje.textContent = "¡Hola, " + nombre.value + "! Te esperamos en " + modo.value + ".";\n});\n',
      'estilos.css': 'body {\n    font-family: Arial, sans-serif;\n}\n',
      'img/logo.png': null,
    },
    mision: [
      { t: 'Conecta servidor.js en servidor.html.', ok: (g, r) => /<script\s+src=["']servidor\.js["']\s*>\s*<\/script>/.test(g['servidor.html']), hecho: 'servidor.html carga su servidor.js, al final del body.', pista: 'En servidor.html no pasa nada al pulsar: no hay ningún <script>. Ábrelo y ponlo antes de </body>.' },
      { t: 'Haz que el formulario funcione: los id del JS tienen que ser los de servidor.html.', ok: g => { const ids = idsHtml(g['servidor.html']); const q = idsJs(g['servidor.js']); return q.length >= 4 && q.every(x => ids.indexOf(x) >= 0); }, hecho: 'Los querySelector buscan #boton-unirme, #alias, #modo y #respuesta, los id de la web.', pista: 'Sale «Cannot read properties of null». El JS es del ejercicio y busca sus id (#boton, #nombre, #mensaje). Míralos en servidor.html y cámbialos en el JS.' },
      { t: 'La portada no puede tener errores rojos: cada página carga solo su JS.', ok: g => !/servidor\.js/.test(g['index.html']), hecho: 'index.html ya no carga servidor.js.', pista: 'Abre index.html con Go Live: sale un error rojo. La portada carga el JS del formulario, pero en la portada no hay formulario.' },
    ],
    final: 'Al pasar código de un ejercicio a vuestra web: cada página, su JS; y los id del JS, los de vuestra página. La consola de cada página, sin rojo.',
  });

  /* ============================================================
     S15 · Prueba los casos (sin VS Code: una mesa de encantamientos)
     ============================================================ */
  registrarSimulacion('prueba-casos', {
    ventana: 'Mesa de encantamientos · s15-encantar.js',
    mision: [
      'Prueba con 29, 30 y 31 niveles y encuentra el que da un resultado equivocado.',
      'Arregla la condición del if: con 30 niveles sí se puede encantar.',
      'Vuelve a probar 29, 30 y 31 con la condición arreglada.',
    ],
    final: 'Un if se prueba siempre con el número justo del límite y con los de al lado. El fallo más típico es > donde iba >=.',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      let cond = 'niveles > 30';
      let probados = {}, probadosArreglado = {};
      const evalua = (c, n) => {
        const m = /^\s*niveles\s*(>=|<=|===|==|>|<)\s*(\d+)\s*$/.exec(c);
        if (!m) return null;
        const v = Number(m[2]);
        return { '>=': n >= v, '<=': n <= v, '===': n === v, '==': n === v, '>': n > v, '<': n < v }[m[1]];
      };
      const bien = c => [0, 29, 30, 31, 100].every(n => evalua(c, n) === (n >= 30));
      pantalla.appendChild(el('p', 'sim__h', 'Regla: con 30 niveles o más, puedes encantar.'));
      const codigo = el('div', 'probador__editor');
      const pre = el('pre', 'probador__resaltado');
      pre.setAttribute('translate', 'no');
      pre.style.position = 'static';
      pre.style.overflowX = 'auto';
      const fila = el('div', 'lab__fila');
      fila.appendChild(el('span', 'sim__ayuda', 'if ('));
      const ent = el('input', 'lab__entrada');
      ent.type = 'text'; ent.value = cond; ent.spellcheck = false;
      ent.setAttribute('translate', 'no');
      ent.setAttribute('aria-label', 'Condición del if');
      fila.appendChild(ent);
      fila.appendChild(el('span', 'sim__ayuda', ') {'));
      const okCond = boton('Guardar');
      fila.appendChild(okCond);
      function pintarCodigo() {
        pre.textContent = `let niveles = Number(caja.value);\n\nif (${cond}) {\n    mensaje.textContent = "✨ ¡Encantado!";\n} else {\n    mensaje.textContent = "Te faltan niveles.";\n}`;
      }
      codigo.appendChild(pre);
      pantalla.appendChild(codigo);
      pantalla.appendChild(el('p', 'sim__etiqueta', 'Cambia la condición:'));
      pantalla.appendChild(fila);
      const msg = el('div'); msg.setAttribute('aria-live', 'polite');
      pantalla.appendChild(el('p', 'sim__etiqueta', 'Pruébalo:'));
      const prueba = el('div', 'lab__fila');
      const num = el('input', 'lab__entrada');
      num.type = 'number'; num.placeholder = 'niveles'; num.setAttribute('aria-label', 'Niveles');
      const bProbar = boton('Encantar', 'lab__boton lab__boton--activo');
      prueba.appendChild(num); prueba.appendChild(bProbar);
      pantalla.appendChild(prueba);
      const tabla = el('table', 'exp__prop');
      pantalla.appendChild(tabla);
      pantalla.appendChild(msg);
      const filas = [];
      function pintarTabla() {
        tabla.innerHTML = '';
        if (!filas.length) return;
        const tr0 = el('tr'); ['Niveles', 'Sale', '¿Bien?'].forEach(x => tr0.appendChild(el('th', null, x))); tabla.appendChild(tr0);
        filas.slice(-6).forEach(f => { const tr = el('tr'); [f[0], f[2], f[3]].forEach((x, i) => tr.appendChild(el('td', i === 2 && x === '✗' ? 'sim__mal' : null, x))); tabla.appendChild(tr); });
      }
      bProbar.addEventListener('click', () => {
        const n = Number(num.value);
        if (num.value === '' || isNaN(n)) { msg.innerHTML = ''; msg.appendChild(ctx.aviso('Escribe un número de niveles.', 'cuidado')); return; }
        const r = evalua(cond, n);
        const sale = r ? '✨ ¡Encantado!' : 'Te faltan niveles.';
        const ok = r === (n >= 30);
        filas.push([String(n), cond, sale, ok ? '✓' : '✗']);
        pintarTabla();
        (ok ? ctx.apunta : ctx.falla)(`Probar con ${n}: ${sale}${ok ? '' : ' (mal: la regla dice ' + (n >= 30 ? 'que sí' : 'que no') + ')'}`);
        msg.innerHTML = '';
        if (bien(cond)) { probadosArreglado[n] = true; if ([29, 30, 31].every(x => probadosArreglado[x])) ctx.cumple(2, 'Con la condición arreglada, 29, 30 y 31 salen bien.'); }
        else { probados[n] = true; if ([29, 30, 31].every(x => probados[x])) { ctx.cumple(0, 'Probados 29, 30 y 31: con 30 sale «Te faltan niveles», y la regla dice que sí.'); msg.appendChild(ctx.aviso('Con 30 falla: justo el número del límite. Mira el signo de la condición.', 'cuidado')); } }
        num.value = '';
        num.focus();
      });
      num.addEventListener('keydown', e => { if (e.key === 'Enter') bProbar.click(); });
      okCond.addEventListener('click', () => {
        const c = ent.value.trim();
        if (evalua(c, 1) === null) { msg.innerHTML = ''; msg.appendChild(ctx.aviso('Escribe una comparación como: niveles > 30 (con niveles, un signo y un número).', 'cuidado')); return; }
        cond = c; probadosArreglado = {};
        ctx.apunta(`Cambiar la condición: if (${c})`);
        msg.innerHTML = '';
        if (bien(c)) ctx.cumple(1, `if (${c}): con 30 ya se puede.`);
        else { if (ctx.hecho(1)) ctx.deshace(1); msg.appendChild(ctx.aviso('Guardada. Pruébala con 29, 30 y 31 para ver si ya cumple la regla.', 'cuidado')); }
        if (ctx.hecho(2) && !bien(c)) ctx.deshace(2);
        pintarCodigo();
      });
      pintarCodigo();
    },
  });

  /* ============================================================
     S11 y S18 · Revisión cruzada de la web de otra pareja
     ============================================================ */
  const WEB_REVISAR = {
    'index.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>RedstoneFácil</title>\n    <link rel="stylesheet" href="estilos.css">\n</head>\n<body>\n    <header>\n        <nav>\n            <a href="index.html">Inicio</a>\n            <a href="circuitos.html">Circuitos</a>\n            <a href="trucos.html">Trucos</a>\n        </nav>\n    </header>\n    <main>\n        <h1>RedstoneFácil</h1>\n        <img src="img/antorcha.png" alt="Una antorcha de redstone encendida">\n        <p>Aprende a hacer circuitos de redstone sin liarte.</p>\n        <h2>Lo que necesitas</h2>\n        <ul>\n            <li>Polvo de redstone</li>\n            <li>Antorchas</li>\n            <li>Palancas</li>\n            <li>Pistones</li>\n        </ul>\n    </main>\n</body>\n</html>\n',
    'circuitos.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>Circuitos</title>\n    <link rel="stylesheet" href="estilos.css">\n</head>\n<body>\n    <header>\n        <nav>\n            <a href="index.html">Inicio</a>\n            <a href="circuitos.html">Circuitos</a>\n            <a href="trucos.html">Trucos</a>\n        </nav>\n    </header>\n    <main>\n        <h1>Circuitos</h1>\n        <img src="img/puerta.png">\n        <p>Una puerta que se abre sola con una palanca.</p>\n        <p>Una lámpara que se enciende de noche.</p>\n    </main>\n</body>\n</html>\n',
    'trucos.html': '<!DOCTYPE html>\n<html>\n<head>\n    <meta charset="UTF-8">\n    <title>Trucos</title>\n    <link rel="stylesheet" href="estilos.css">\n</head>\n<body>\n    <header>\n        <nav>\n            <a href="index.html">Inicio</a>\n            <a href="circuitos.html">Circuitos</a>\n            <a href="trucos.html">Trucos</a>\n        </nav>\n    </header>\n    <main>\n        <h1>Trucos</h1>\n        <form>\n            <label for="bloques">¿Cuántos bloques mide tu circuito?</label>\n            <input type="text" id="bloques">\n            <button type="button" id="calcular">Calcular</button>\n            <p id="resultado"></p>\n        </form>\n    </main>\n\n    <script src="trucos.js"></script>\n</body>\n</html>\n',
    'trucos.js': 'let boton = document.querySelector("#calcula");\nlet bloques = document.querySelector("#bloques");\nlet resultado = document.querySelector("#resultado");\n\nboton.addEventListener("click", function () {\n    resultado.textContent = "Necesitas " + Number(bloques.value) + " de polvo de redstone.";\n});\n',
    'estilos.css': 'body {\n    font-family: Arial, sans-serif;\n}\n\nnav {\n    display: flex;\n    gap: 10px;\n}\n',
  };
  function simRevisa(nombre, def) {
    registrarSimulacion(nombre, {
      ventana: 'Chrome · la web de la pareja 2',
      mision: def.puntos.map(p => 'Marca bien: ' + p.t),
      final: def.final,
      crear(ctx) {
        const { el, boton, pantalla } = ctx;
        let pag = 'index.html', modo = 'web';
        pantalla.appendChild(el('p', 'sim__ayuda', 'La web de otra pareja, abierta con Go Live. No se toca el código: solo se mira.'));
        const nav = el('div', 'lab__fila');
        const modos = el('div', 'lab__fila');
        const zona = el('div');
        const vista = window.PROBADOR.crearVista({ rotulo: 'Chrome', titulo: 'La web de la pareja 2', consola: true, alto: 120 });
        pantalla.appendChild(el('p', 'sim__etiqueta', 'Páginas (el menú de la web):'));
        pantalla.appendChild(nav);
        pantalla.appendChild(modos);
        pantalla.appendChild(zona);
        const hoja = el('div', 'sim__carpeta');
        pantalla.appendChild(el('p', 'sim__etiqueta', '📝 La hoja de revisión'));
        pantalla.appendChild(hoja);
        const msg = el('div'); msg.setAttribute('aria-live', 'polite');
        pantalla.appendChild(msg);
        function montar() {
          let html = WEB_REVISAR[pag];
          html = html.replace(/<link\b[^>]*>/gi, '');
          html = html.replace(/<script\s+src=["']([^"']+)["']\s*>\s*<\/script>/gi, (t, s) => WEB_REVISAR[s] ? '<script>\n' + WEB_REVISAR[s] + '\n<\/script>' : '');
          html = html.replace(/(<img\b[^>]*\bsrc\s*=\s*["'])([^"']*)(["'])/gi, (t, a, src, b) => a + PIXEL(src.split('/').pop()) + b);
          vista.mostrar({ html, css: WEB_REVISAR['estilos.css'] });
        }
        function pintar() {
          nav.innerHTML = '';
          ['index.html', 'circuitos.html', 'trucos.html'].forEach(p => {
            const b = boton(p, 'exp__item' + (p === pag ? ' exp__item--elegido' : ''));
            b.setAttribute('translate', 'no');
            b.setAttribute('aria-pressed', String(p === pag));
            b.addEventListener('click', () => { pag = p; ctx.apunta('Ir a ' + p + '.'); pintar(); });
            nav.appendChild(b);
          });
          modos.innerHTML = '';
          [['web', 'La página'], ['u', 'Ctrl + U (código)'], ['f12', 'F12 → Elementos, sobre el menú']].forEach(([k, t]) => {
            const b = boton(t, 'sim__pestana' + (modo === k ? ' sim__pestana--activa' : ''));
            b.setAttribute('aria-pressed', String(modo === k));
            b.addEventListener('click', () => { modo = k; if (k !== 'web') ctx.apunta(t + ' en ' + pag + '.'); pintar(); });
            modos.appendChild(b);
          });
          zona.innerHTML = '';
          if (modo === 'web') { zona.appendChild(vista.el); montar(); }
          if (modo === 'u') {
            const p = el('pre', 'probador__resaltado');
            p.setAttribute('translate', 'no');
            p.style.position = 'static';
            p.style.maxHeight = '18rem';
            p.style.overflow = 'auto';
            const c = el('code');
            c.innerHTML = window.resaltarCodigo ? window.resaltarCodigo(WEB_REVISAR[pag], 'html') : '';
            p.appendChild(c);
            const caja = el('div', 'probador__editor');
            caja.appendChild(p);
            zona.appendChild(caja);
          }
          if (modo === 'f12') {
            const t = el('table', 'exp__prop');
            t.setAttribute('translate', 'no');
            [['Elemento', '<nav>'], ['Estilos', 'nav { display: flex; gap: 10px; }'], ['Archivo', 'estilos.css']].forEach(([a, b]) => { const tr = el('tr'); tr.appendChild(el('th', null, a)); tr.appendChild(el('td', null, b)); t.appendChild(tr); });
            zona.appendChild(t);
          }
        }
        def.puntos.forEach((p, i) => {
          const f = el('div', 'sim__fav');
          f.appendChild(el('span', null, `${i + 1}. ${p.t}`));
          ['sí', 'no'].forEach(r => {
            const b = boton(r);
            b.addEventListener('click', () => {
              if ((r === 'sí') === p.si) { ctx.cumple(i, `${p.t}: ${r}. ${p.porque}`); msg.innerHTML = ''; msg.appendChild(ctx.aviso(p.porque, 'ok')); }
              else { ctx.falla(`${p.t}: ${r}.`); msg.innerHTML = ''; msg.appendChild(ctx.aviso(p.pista, 'cuidado')); if (ctx.hecho(i)) ctx.deshace(i); }
            });
            f.appendChild(b);
          });
          hoja.appendChild(f);
        });
        pintar();
      },
    });
  }
  const P_MENU = { t: '3 páginas o más, con el mismo menú', si: true, porque: 'Las tres páginas tienen el mismo menú dentro de <header> y <nav>.', pista: 'Pasa por las tres páginas con los botones: ¿el menú es el mismo en todas?' };
  const P_LISTA = { t: 'Una lista ol, una ul y una tabla', si: false, porque: 'Hay una lista en la portada, pero no hay ninguna tabla en ninguna página.', pista: 'Mira las tres páginas: hay lista, pero ¿hay tabla? Si dudas, Ctrl + U y busca <table>.' };
  const P_ALT = { t: 'Imágenes con alt, en la carpeta img', si: false, porque: 'En circuitos.html, la imagen img/puerta.png no tiene alt.', pista: 'En pantalla no se ve el alt. Haz Ctrl + U en cada página y mira cada <img>: ¿todas llevan alt="…"?' };
  const P_CSS = { t: 'Un solo estilos.css y el menú con Flexbox', si: true, porque: 'Cada página tiene una sola línea con estilos.css, y el nav tiene display: flex.', pista: 'Ctrl + U: ¿cuántas líneas <link> hay? Y F12 → Elementos sobre el menú: ¿sale display: flex?' };
  simRevisa('revisa-web', {
    puntos: [P_MENU, P_LISTA, P_ALT, P_CSS],
    final: 'Lo que no se ve en pantalla (el alt, cuántos CSS hay) se mira con Ctrl + U o F12. Así revisaréis la web de la otra pareja, y la otra, la vuestra.',
  });
  simRevisa('revisa-web-final', {
    puntos: [P_MENU, P_ALT, { t: 'El formulario funciona con JavaScript', si: false, porque: 'En trucos.html, al pulsar Calcular no pasa nada y la consola enseña un error rojo: el JS busca #calcula y el botón es #calcular.', pista: 'Ve a trucos.html, escribe un número y pulsa Calcular. ¿Cambia algo? Mira la consola de debajo.' }, P_CSS],
    final: 'Para el formulario y el JavaScript no basta con mirar: hay que rellenar, pulsar y tener la consola abierta.',
  });
  /* ============================================================
     S1 · Tu primera página (Explorador + VS Code + Live Server)
     ============================================================ */
  const ESQUELETO = '<!DOCTYPE html>\n<html lang="es">\n<head>\n    <meta charset="UTF-8">\n    <title>Document</title>\n</head>\n<body>\n    \n</body>\n</html>\n';
  registrarSimulacion('primera-pagina', {
    ventana: 'Explorador de archivos',
    mision: [
      'En Documentos, crea la carpeta de la web: nombre en minúsculas, sin espacios ni tildes.',
      'Dentro, crea la carpeta img.',
      'Abre la carpeta de la web en VS Code y crea index.html al lado de img, no dentro.',
      'Escribe la estructura con el nombre de la web en el <title> y en un <h1>, guarda y ábrela con Go Live.',
    ],
    final: 'Así empieza cualquier web: una carpeta con nombre limpio, img dentro, index.html al lado de img y Go Live para verla. Y siempre Ctrl + S antes de mirar.',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const s = { app: 'exp', abierta: null, archivo: null, live: false };
      const raiz = carpeta('Este equipo', [carpeta('C:', [carpeta('Users', [carpeta('alumno', [
        carpeta('Desktop', []), carpeta('Documents', []), carpeta('Downloads', []),
      ])])], { unidad: true, etiqueta: 'Disco local', capacidad: 237 * 1024 * 1024 * KB, libre: 112 * 1024 * 1024 * KB })], { raiz: true });
      const DOCS = ['C:', 'Users', 'alumno', 'Documents'];
      const norma = n => /^[a-z0-9]+(-[a-z0-9]+)*$/.test(n);

      const marco = el('div', 'sim__nav');
      const tiras = el('div', 'sim__pestanas');
      tiras.setAttribute('role', 'tablist');
      const vistaExp = el('div', 'sim__web');
      const vistaCode = el('div', 'sim__web');
      marco.appendChild(tiras); marco.appendChild(vistaExp); marco.appendChild(vistaCode);
      pantalla.appendChild(marco);
      const msg = el('div'); msg.setAttribute('aria-live', 'polite');
      pantalla.appendChild(msg);
      function aviso(t, tipo) { msg.innerHTML = ''; if (t) msg.appendChild(ctx.aviso(t, tipo)); }
      const vista = window.PROBADOR.crearVista({ rotulo: 'Chrome', titulo: 'Tu página en Chrome', alto: 90 });

      const E = window.SIM_EXPLORADOR(Object.assign({}, ctx, { pantalla: vistaExp }), { raiz, inicio: DOCS, extensiones: true, cambio: comprobar });
      const web = () => E.buscar(DOCS).hijos.find(h => h.carpeta);

      function pintar() {
        tiras.innerHTML = '';
        [['exp', '📁 Explorador'], ['code', '🧩 VS Code']].forEach(([k, t]) => {
          const b = boton(t, 'sim__pestana' + (s.app === k ? ' sim__pestana--activa' : ''));
          b.setAttribute('role', 'tab');
          b.setAttribute('aria-selected', String(s.app === k));
          b.addEventListener('click', () => { s.app = k; aviso(); pintar(); });
          tiras.appendChild(b);
        });
        vistaExp.style.display = s.app === 'exp' ? '' : 'none';
        vistaCode.style.display = s.app === 'code' ? '' : 'none';
        ctx.barra(s.app === 'exp' ? 'Explorador de archivos' : 'Visual Studio Code');
        if (s.app === 'exp') E.pintar(); else pintarCode();
      }

      function pintarCode() {
        vistaCode.innerHTML = '';
        if (!s.abierta) {
          vistaCode.appendChild(el('p', 'sim__ayuda', 'File → Open Folder… Elige una carpeta:'));
          const fila = el('div', 'sim__fav');
          const docs = E.buscar(DOCS);
          const ops = [[docs, 'Documentos']];
          docs.hijos.filter(h => h.carpeta).forEach(h => { ops.push([h, 'Documentos\\' + h.n]); h.hijos.filter(x => x.carpeta).forEach(x => ops.push([x, `Documentos\\${h.n}\\${x.n}`])); });
          ops.forEach(([c, t]) => {
            const b = boton('📁 ' + t, 'exp__item');
            b.setAttribute('translate', 'no');
            b.addEventListener('click', () => {
              s.abierta = c; s.archivo = null;
              ctx.apunta(`VS Code: Open Folder → ${t}.`);
              if (c === docs) aviso('Has abierto Documentos entero. Abre solo la carpeta de la web.', 'cuidado');
              else if (c.n === 'img') aviso('Esa es la carpeta img, la de las imágenes. Abre la de la web, la que tiene img dentro.', 'cuidado');
              else aviso();
              pintarCode(); comprobar();
            });
            fila.appendChild(b);
          });
          vistaCode.appendChild(fila);
          return;
        }
        const c = s.abierta;
        const cab = el('div', 'lab__fila');
        cab.appendChild(el('span', 'sim__etiqueta', 'EXPLORER · ' + c.n.toUpperCase()));
        const cerrar = boton('Cerrar carpeta');
        cerrar.addEventListener('click', () => { s.abierta = null; s.archivo = null; pintarCode(); });
        cab.appendChild(cerrar);
        vistaCode.appendChild(cab);
        const arbol = el('ul', 'sim__arbol');
        arbol.setAttribute('translate', 'no');
        (function pinta(n, ul) {
          n.hijos.forEach(h => {
            const li = el('li');
            if (h.carpeta) { li.className = 'sim__tema'; li.textContent = '📁 ' + h.n; const sub = el('ul', 'sim__arbol-sub'); li.appendChild(sub); pinta(h, sub); }
            else {
              const b = boton(`📄 ${h.n}${h.texto !== h.guardado ? ' ●' : ''}`, 'exp__item' + (h === s.archivo ? ' exp__item--elegido' : ''));
              b.addEventListener('click', () => { s.archivo = h; pintarCode(); });
              li.appendChild(b);
            }
            ul.appendChild(li);
          });
        })(c, arbol);
        vistaCode.appendChild(arbol);

        // New File…
        const nf = el('div', 'lab__fila');
        const nombre = el('input', 'lab__entrada');
        nombre.type = 'text'; nombre.placeholder = 'nombre del archivo'; nombre.spellcheck = false;
        nombre.setAttribute('translate', 'no');
        nombre.setAttribute('aria-label', 'Nombre del archivo nuevo');
        nf.appendChild(nombre);
        const destinos = [[c, 'New File… aquí']].concat(c.hijos.filter(h => h.carpeta).map(h => [h, `New File… dentro de ${h.n}`]));
        destinos.forEach(([d, t]) => {
          const b = boton(t);
          b.setAttribute('translate', 'no');
          b.addEventListener('click', () => {
            const n = nombre.value.trim();
            if (!n) { aviso('Escribe primero el nombre del archivo.', 'cuidado'); return; }
            if (d.hijos.some(h => h.n === n)) { aviso('Ya hay un archivo con ese nombre ahí.', 'cuidado'); return; }
            const f = archivo(n, 0, { texto: '', guardado: '' });
            d.hijos.push(f);
            s.archivo = f;
            ctx.apunta(`New File: ${d === c ? '' : d.n + '/'}${n}.`);
            if (n !== 'index.html' && /index/i.test(n)) aviso(`Se llama «${n}». La página de inicio tiene que llamarse exactamente index.html.`, 'cuidado');
            else if (d !== c) aviso(`Lo has creado dentro de ${d.n}. index.html va al lado de img, en la carpeta principal.`, 'cuidado');
            else aviso();
            pintarCode(); comprobar();
          });
          nf.appendChild(b);
        });
        vistaCode.appendChild(el('p', 'sim__etiqueta', 'Crear un archivo nuevo:'));
        vistaCode.appendChild(nf);

        if (!s.archivo) return;
        const f = s.archivo;
        vistaCode.appendChild(el('p', 'sim__etiqueta', f.n + (f.texto !== f.guardado ? ' ●  (sin guardar)' : '')));
        const ed = el('div', 'probador__editor');
        const pre = el('pre', 'probador__resaltado');
        pre.setAttribute('aria-hidden', 'true');
        const code = el('code'); pre.appendChild(code);
        const area = el('textarea', 'probador__area');
        area.spellcheck = false; area.setAttribute('wrap', 'off'); area.setAttribute('translate', 'no');
        area.setAttribute('aria-label', 'Código de ' + f.n);
        area.value = f.texto;
        const res = () => { code.innerHTML = window.resaltarCodigo ? window.resaltarCodigo(area.value, 'html') : ''; area.rows = Math.max(5, area.value.split('\n').length + 1); };
        area.addEventListener('input', () => { const antes = f.texto !== f.guardado; f.texto = area.value; res(); if (antes !== (f.texto !== f.guardado)) { const p = vistaCode.querySelectorAll('.sim__etiqueta'); p[p.length - 1].textContent = f.n + (f.texto !== f.guardado ? ' ●  (sin guardar)' : ''); } });
        area.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) { e.preventDefault(); guardar(); } });
        ed.appendChild(pre); ed.appendChild(area);
        res();
        vistaCode.appendChild(ed);
        const fila = el('div', 'lab__fila');
        const emmet = boton('! + Tab (la estructura)');
        emmet.addEventListener('click', () => { f.texto = ESQUELETO; ctx.apunta('Escribir ! y pulsar Tab: VS Code escribe la estructura.'); pintarCode(); });
        const bg = boton('💾 Guardar (Ctrl + S)');
        bg.addEventListener('click', guardar);
        const live = boton(s.live ? '⟳ Recargar en Chrome' : '▶ Go Live', 'lab__boton lab__boton--activo');
        live.addEventListener('click', goLive);
        fila.appendChild(emmet); fila.appendChild(bg); fila.appendChild(live);
        vistaCode.appendChild(fila);
        if (s.live) vistaCode.appendChild(vista.el);
        function guardar() {
          if (f.texto === f.guardado) { aviso('No hay nada sin guardar.', 'cuidado'); return; }
          f.guardado = f.texto;
          ctx.apunta(`Ctrl + S: ${f.n} guardado.`);
          aviso();
          pintarCode();
          if (s.live) goLive(true);
        }
      }
      function goLive(solo) {
        const w = web();
        const idx = s.abierta && s.abierta.hijos.find(h => h.n === 'index.html');
        if (!s.live) ctx.apunta('Go Live: se abre Chrome en 127.0.0.1:5500.');
        s.live = true;
        if (!idx) { vista.mostrar({ html: '<h1>Cannot GET /</h1><p>No hay ningún index.html en la carpeta abierta.</p>' }); pintarCode(); aviso('Live Server busca index.html en la carpeta que tienes abierta, y no lo encuentra.', 'cuidado'); return; }
        vista.mostrar({ html: idx.guardado || '' });
        if (solo !== true) pintarCode();
        const g = idx.guardado || '';
        const tit = (/<title>([^<]*)<\/title>/i.exec(g) || [])[1];
        const enHead = /<head[\s\S]*<title>[\s\S]*<\/head>/i.test(g);
        const h1 = /<body[\s\S]*<h1>\s*[^<\s][^<]*<\/h1>[\s\S]*<\/body>/i.test(g);
        if (idx.texto !== idx.guardado) aviso('index.html tiene el ● de sin guardar: Chrome enseña lo guardado. Ctrl + S.', 'cuidado');
        else if (!g.trim()) aviso('La página está vacía. Escribe la estructura (! + Tab) y guarda.', 'cuidado');
        else if (!tit || tit.trim() === 'Document' || !enHead) aviso('Mira la pestaña de Chrome, arriba del resultado: pone «Document» o nada. Escribe el nombre de la web dentro de <title>, en el <head>.', 'cuidado');
        else if (!h1) aviso('Falta el título que se ve: un <h1> con el nombre de la web, dentro del <body>.', 'cuidado');
        else if (w && s.abierta === w) { ctx.cumple(3, `index.html con <title>${tit.trim()}</title> y su <h1>, guardado y abierto con Go Live.`); aviso(); }
        comprobar();
      }
      function comprobar() {
        const docs = E.buscar(DOCS);
        const cs = docs.hijos.filter(h => h.carpeta);
        const w = cs.find(h => norma(h.n) && h.n !== 'img');
        if (w) ctx.cumple(0, `Carpeta Documentos\\${w.n}, con un nombre limpio.`);
        else { if (ctx.hecho(0)) ctx.deshace(0); if (cs.length && s.app === 'exp') E.aviso(`«${cs[0].n}» no vale: solo minúsculas, números y guiones, sin espacios ni tildes. Botón «Cambiar nombre».`, 'cuidado'); }
        const img = w && w.hijos.find(h => h.carpeta && h.n === 'img');
        if (img) ctx.cumple(1, `Carpeta img dentro de ${w.n}.`); else if (ctx.hecho(1)) ctx.deshace(1);
        if (w && s.abierta === w && w.hijos.some(h => h.n === 'index.html' && !h.carpeta)) ctx.cumple(2, `VS Code con ${w.n} abierta e index.html al lado de img.`);
        else if (ctx.hecho(2)) ctx.deshace(2);
      }
      pintar();
    },
  });

  /* ============================================================
     S2 · Entrega tus ejercicios
     ============================================================ */
  registrarSimulacion('entrega-zip', {
    ventana: 'Explorador de archivos',
    mision: [
      'Comprime tu carpeta de ejercicios (la tuya, no la de la web de la pareja).',
      'En Classroom, adjunta a la tarea el .zip de tus ejercicios.',
      'Pulsa Entregar.',
    ],
    final: 'Cada sesión de ejercicios acaba igual: comprimir la carpeta de ejercicios entera, adjuntar el .zip a la tarea y pulsar Entregar.',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const s = { app: 'exp', adjuntos: [], entregado: false, eligiendo: false };
      const raiz = carpeta('Este equipo', [carpeta('C:', [carpeta('Users', [carpeta('alumno', [
        carpeta('Desktop', []),
        carpeta('Documents', [
          carpeta('bloquecraft', [archivo('index.html', 2 * KB), carpeta('img', [])]),
          carpeta('ejercicios-pixelrojo', [archivo('s02-ej1.html', 1 * KB), archivo('s02-ej2.html', 2 * KB), archivo('s02-ej3.html', 2 * KB)]),
        ]),
        carpeta('Downloads', []),
      ])])], { unidad: true, etiqueta: 'Disco local', capacidad: 237 * 1024 * 1024 * KB, libre: 112 * 1024 * 1024 * KB })], { raiz: true });
      const DOCS = ['C:', 'Users', 'alumno', 'Documents'];
      const marco = el('div', 'sim__nav');
      const tiras = el('div', 'sim__pestanas');
      tiras.setAttribute('role', 'tablist');
      const vistaExp = el('div', 'sim__web');
      const vistaCr = el('div', 'sim__web');
      marco.appendChild(tiras); marco.appendChild(vistaExp); marco.appendChild(vistaCr);
      pantalla.appendChild(marco);
      const msg = el('div'); msg.setAttribute('aria-live', 'polite');
      pantalla.appendChild(msg);
      function aviso(t, tipo) { msg.innerHTML = ''; if (t) msg.appendChild(ctx.aviso(t, tipo)); }
      const E = window.SIM_EXPLORADOR(Object.assign({}, ctx, { pantalla: vistaExp }), { raiz, inicio: DOCS, extensiones: true, cambio: comprobar });
      function comprobar() {
        const z = E.buscar(DOCS).hijos.find(h => h.zipDe === 'ejercicios-pixelrojo');
        if (z) ctx.cumple(0, 'Comprimir ejercicios-pixelrojo: sale ejercicios-pixelrojo.zip al lado.');
        if (E.buscar(DOCS).hijos.some(h => h.zipDe === 'bloquecraft') && s.app === 'exp') E.aviso('Esa es la web de la pareja. Lo que se entrega en Classroom es tu carpeta de ejercicios.', 'cuidado');
      }
      function pintar() {
        tiras.innerHTML = '';
        [['exp', '📁 Explorador'], ['cr', '🎓 Classroom']].forEach(([k, t]) => {
          const b = boton(t, 'sim__pestana' + (s.app === k ? ' sim__pestana--activa' : ''));
          b.setAttribute('role', 'tab');
          b.setAttribute('aria-selected', String(s.app === k));
          b.addEventListener('click', () => { s.app = k; aviso(); pintar(); });
          tiras.appendChild(b);
        });
        vistaExp.style.display = s.app === 'exp' ? '' : 'none';
        vistaCr.style.display = s.app === 'cr' ? '' : 'none';
        ctx.barra(s.app === 'exp' ? 'Explorador de archivos' : 'Classroom · Proyecto Intermodular');
        if (s.app === 'exp') E.pintar(); else pintarCr();
      }
      function pintarCr() {
        vistaCr.innerHTML = '';
        vistaCr.appendChild(el('p', 'sim__h', '📝 Ejercicios de la sesión 2'));
        vistaCr.appendChild(el('p', 'sim__ayuda', 'Entrega tu carpeta de ejercicios comprimida en .zip.'));
        const caja = el('div', 'sim__carpeta');
        caja.appendChild(el('p', 'sim__etiqueta', 'Tu trabajo ' + (s.entregado ? '· ✅ Entregado' : '· Asignado')));
        if (!s.adjuntos.length) caja.appendChild(el('p', 'sim__ayuda', 'Sin archivos adjuntos.'));
        s.adjuntos.forEach((a, i) => {
          const f = el('div', 'lab__fila');
          const t = el('span', null, (/\.zip$/.test(a.n) ? '🗜️ ' : '📄 ') + a.n);
          t.setAttribute('translate', 'no');
          f.appendChild(t);
          if (!s.entregado) { const q = boton('✕ Quitar'); q.addEventListener('click', () => { s.adjuntos.splice(i, 1); ctx.apunta(`Quitar ${a.n}.`); pintarCr(); }); f.appendChild(q); }
          caja.appendChild(f);
        });
        const fila = el('div', 'lab__fila');
        if (!s.entregado) {
          const add = boton('+ Añadir o crear → Archivo');
          add.addEventListener('click', () => { s.eligiendo = !s.eligiendo; pintarCr(); });
          fila.appendChild(add);
          const ent = boton('Entregar', 'lab__boton lab__boton--activo');
          ent.addEventListener('click', entregar);
          fila.appendChild(ent);
        } else {
          const an = boton('Anular entrega');
          an.addEventListener('click', () => { s.entregado = false; ctx.apunta('Anular la entrega.'); if (ctx.hecho(2)) ctx.deshace(2); pintarCr(); });
          fila.appendChild(an);
        }
        caja.appendChild(fila);
        vistaCr.appendChild(caja);
        if (s.eligiendo && !s.entregado) {
          const ex = el('div', 'sim__carpeta');
          ex.appendChild(el('p', 'sim__etiqueta', 'Examinar → Documentos (Classroom solo sube archivos, no carpetas)'));
          const docs = E.buscar(DOCS);
          const lista = [];
          docs.hijos.forEach(h => { if (!h.carpeta) lista.push([h, h.n]); else h.hijos.filter(x => !x.carpeta).forEach(x => lista.push([x, h.n + '\\' + x.n])); });
          lista.forEach(([a, t]) => {
            const b = boton((/\.zip$/.test(a.n) ? '🗜️ ' : '📄 ') + t, 'exp__item');
            b.setAttribute('translate', 'no');
            b.addEventListener('click', () => {
              s.eligiendo = false;
              s.adjuntos.push(a);
              ctx.apunta(`Adjuntar ${t}.`);
              if (a.zipDe === 'ejercicios-pixelrojo') { ctx.cumple(1, 'Adjuntar ejercicios-pixelrojo.zip a la tarea.'); aviso(); }
              else if (a.zipDe) aviso('Ese .zip es el de la web de la pareja, no el de tus ejercicios.', 'cuidado');
              else aviso(`«${a.n}» es un solo ejercicio. Se entrega la carpeta entera, comprimida en .zip.`, 'cuidado');
              pintarCr();
            });
            ex.appendChild(b);
          });
          if (!lista.length) ex.appendChild(el('p', 'sim__ayuda', 'No hay archivos.'));
          vistaCr.appendChild(ex);
        }
      }
      function entregar() {
        if (!s.adjuntos.length) { aviso('Si entregas sin adjuntar nada, no me llega ningún ejercicio. Primero añade el .zip.', 'cuidado'); ctx.falla('Intentar entregar sin nada adjunto.'); return; }
        s.entregado = true;
        const bien = s.adjuntos.some(a => a.zipDe === 'ejercicios-pixelrojo');
        const sobran = s.adjuntos.some(a => a.zipDe !== 'ejercicios-pixelrojo');
        if (bien && !sobran) { ctx.cumple(2, 'Entregar: la tarea pasa a «Entregado».'); aviso('Entregado. Si la semana que viene acabas algo más, anulas la entrega, adjuntas el zip nuevo y vuelves a entregar.', 'ok'); }
        else { ctx.falla('Entregar con ' + s.adjuntos.map(a => a.n).join(', ') + '.'); aviso('Entregado, pero lo adjunto no es el .zip de tus ejercicios (o sobra algo). Pulsa «Anular entrega», quita lo que no va y adjunta el zip.', 'cuidado'); }
        pintarCr();
      }
      pintar();
    },
  });

  /* ============================================================
     S3 · ¿Por qué no sale la imagen?
     ============================================================ */
  const ALT = (html, re) => { const m = new RegExp('<img\\b[^>]*src=["\'][^"\']*' + re + '[^"\']*["\'][^>]*>', 'i').exec(html || ''); return m ? ((/alt\s*=\s*["']([^"']*)["']/i.exec(m[0]) || [])[1] || '') : null; };
  simCodigo('sin-imagen', {
    carpeta: 'ejercicios-pixelrojo',
    abrir: 's03-mobs.html',
    renombrar: true,
    archivos: {
      's03-mobs.html': '<!DOCTYPE html>\n<html lang="es">\n<head>\n    <meta charset="UTF-8">\n    <title>Mobs</title>\n</head>\n<body>\n    <h1>Dos mobs de Minecraft</h1>\n    <img src="creeper.png" alt="Un creeper verde, de pie, mirando de frente">\n    <img src="img/enderman.png" alt="imagen">\n</body>\n</html>\n',
      'img/creeper.png': null,
      'img/Enderman Negro.PNG': null,
    },
    mision: [
      { t: 'Que salga la imagen del creeper.', ok: (g, r) => carga(r, 'img/creeper.png'), hecho: 'src="img/creeper.png": primero la carpeta, una barra y el nombre.', pista: 'El creeper no sale. Mira F12 → Red: creeper.png da 404. La imagen está dentro de img: ¿qué le falta a la ruta?' },
      { t: 'Que salga la del enderman: archivo con nombre en minúsculas y sin espacios, y el mismo nombre en el src.', ok: (g, r) => Object.keys(g).some(k => /^img\/[a-z0-9-]*enderman[a-z0-9-]*\.png$/.test(k) && carga(r, k)), hecho: 'Archivo renombrado sin mayúsculas ni espacios, y el src igual, letra a letra.', pista: 'El enderman no sale: el archivo se llama «Enderman Negro.PNG» (mayúsculas y un espacio) y el src pide otro nombre. Cámbiale el nombre al archivo (minúsculas, guion en vez de espacio, .png en minúsculas) y pon el mismo en el src.' },
      { t: 'El alt del enderman tiene que decir lo que se ve.', ok: g => { const a = ALT(g['s03-mobs.html'], 'enderman'); return a !== null && a.trim().split(/\s+/).length >= 3 && !/^imagen$/i.test(a.trim()); }, hecho: 'Un alt que describe lo que se ve.', pista: 'alt="imagen" no le dice nada a quien no puede ver la foto. Describe lo que se ve, como en el del creeper.' },
    ],
    final: 'Si una imagen no sale: F12 → Red. La ruta tiene que coincidir letra a letra con la carpeta y el nombre del archivo, y los nombres, en minúsculas y sin espacios.',
  });

  /* ============================================================
     S4 · Arregla el menú
     ============================================================ */
  const menuDe = html => { const m = /<nav>([\s\S]*?)<\/nav>/i.exec(html || ''); return m ? (m[1].match(/href\s*=\s*["']([^"']*)["']/gi) || []).map(x => /["']([^"']*)["']/.exec(x)[1]) : []; };
  const PAGS = ['index.html', 'mobs.html', 'biomas.html'];
  const pagina = (t, nav, extra) => `<!DOCTYPE html>\n<html lang="es">\n<head>\n    <meta charset="UTF-8">\n    <title>${t}</title>\n</head>\n<body>\n    <header>\n        <nav>\n${nav}\n        </nav>\n    </header>\n    <main>\n        <h1>${t}</h1>\n${extra || ''}    </main>\n</body>\n</html>\n`;
  simCodigo('menu-roto', {
    carpeta: 'bloquecraft',
    abrir: 'index.html',
    archivos: {
      'index.html': pagina('BloqueCraft', '            <a href="index.html">Inicio</a>\n            <a href="Mobs.html">Mobs</a>\n            <a href="biomas">Biomas</a>', '        <p>Más trucos en <a href="minecraft.wiki">la wiki de Minecraft</a>.</p>\n'),
      'mobs.html': pagina('Mobs', '            <a href="index.html">Inicio</a>\n            <a href="mobs.html">Mobs</a>\n            <a href="biomas.html">Biomas</a>'),
      'biomas.html': pagina('Biomas', '            <a href="index.html">Inicio</a>\n            <a href="biomas.html">Biomas</a>'),
    },
    mision: [
      { t: 'En index.html, los tres enlaces del menú tienen que llevar a una página que existe.', ok: g => { const h = menuDe(g['index.html']); return h.length === 3 && h.every(x => PAGS.indexOf(x) >= 0); }, hecho: 'href="mobs.html" y href="biomas.html": el nombre del archivo exacto, con .html.', pista: 'En index.html, pulsa los enlaces del menú: dos no llevan a ninguna página que exista (en Live Server saldría «Cannot GET»). Compara cada href con los nombres del EXPLORER: mayúsculas y .html cuentan.' },
      { t: 'El menú tiene que ser el mismo en las tres páginas.', ok: g => PAGS.every(p => { const h = menuDe(g[p]); return PAGS.every(x => h.indexOf(x) >= 0); }), hecho: 'Las tres páginas llevan el mismo menú: Inicio, Mobs y Biomas.', pista: 'Abre las tres páginas: en una el menú no lleva a todas. Lo más rápido es copiar el <nav> de una página buena y pegarlo encima.' },
      { t: 'El enlace a la wiki tiene que ir a Internet y abrirse en una pestaña nueva.', ok: g => /<a\s[^>]*href\s*=\s*["']https:\/\/minecraft\.wiki[^"']*["'][^>]*target\s*=\s*["']_blank["']|<a\s[^>]*target\s*=\s*["']_blank["'][^>]*href\s*=\s*["']https:\/\/minecraft\.wiki/i.test(g['index.html']), hecho: 'href="https://minecraft.wiki" con target="_blank".', pista: 'El enlace a la wiki no lleva https://, así que buscaría un archivo de tu carpeta. Y le falta target="_blank" para abrirse en otra pestaña.' },
    ],
    final: 'Entre tus páginas, el href es el nombre del archivo tal cual. A otra web, con https:// y target="_blank". Y el menú, copiado igual en todas.',
  });

  /* ============================================================
     S5 · Arregla el formulario
     ============================================================ */
  simCodigo('formulario-roto', {
    carpeta: 'ejercicios-pixelrojo',
    abrir: 's05-servidor.html',
    archivos: {
      's05-servidor.html': '<!DOCTYPE html>\n<html lang="es">\n<head>\n    <meta charset="UTF-8">\n    <title>Servidor</title>\n</head>\n<body>\n    <h1>Únete al servidor de BloqueCraft</h1>\n    <form>\n        <label for="alias">Tu alias:</label>\n        <input type="text" id="nombre">\n\n        <label for="edad">Edad:</label>\n        <input type="text" id="edad">\n\n        <label for="modo">Modo de juego:</label>\n        <select id="modo">\n            <li>Supervivencia</li>\n            <li>Creativo</li>\n        </select>\n\n        <button type="button">Unirme</button>\n    </form>\n</body>\n</html>\n',
    },
    mision: [
      { t: 'Al pulsar cada texto (label), el cursor tiene que saltar a su caja.', ok: g => { const h = g['s05-servidor.html']; const ids = idsHtml(h); const fors = (h.match(/for\s*=\s*["']([^"']+)["']/g) || []).map(x => /["']([^"']+)["']/.exec(x)[1]); return fors.length >= 3 && fors.every(f => ids.indexOf(f) >= 0); }, hecho: 'Cada for es igual que el id de su caja.', pista: 'Pulsa «Tu alias:» en el resultado: el cursor no va a su caja. El for del label tiene que ser igual que el id de la caja.' },
      { t: 'En la edad solo se tienen que poder escribir números.', ok: g => /<input\b[^>]*type\s*=\s*["']number["'][^>]*id\s*=\s*["']edad["']|<input\b[^>]*id\s*=\s*["']edad["'][^>]*type\s*=\s*["']number["']/i.test(g['s05-servidor.html']), hecho: 'type="number" en la caja de la edad.', pista: 'En la edad se pueden escribir letras. ¿Qué type tiene una caja de números?' },
      { t: 'El desplegable tiene que tener sus dos modos para elegir.', ok: g => { const m = /<select\b[^>]*>([\s\S]*?)<\/select>/i.exec(g['s05-servidor.html']); return !!m && (m[1].match(/<option\b/gi) || []).length >= 2; }, hecho: 'Cada opción del desplegable en su <option>.', pista: 'El desplegable sale vacío. Dentro de un <select>, cada opción va en un <option>, no en un <li>.' },
    ],
    final: 'Un formulario bien hecho: cada label con su for igual al id de la caja, el type que toca (number, email…) y las opciones del select en <option>.',
  });
})();

/* ============================================================
   web-ejemplo (29/10/2026): la web de ejemplo de BloqueCraft, de
   verdad. Son cuatro páginas en HTML sin CSS ni JS, hechas solo con
   lo que se ve hasta la S5, en
   data/proyecto/proy-antes-de-empezar/ejemplo-bloquecraft/. Se
   cargan en un iframe del mismo origen: el menú navega de verdad.
   La misión: pasar por las 4 páginas y tocar cada cosa obligatoria
   (imagen, ol, ul, tabla, formulario, enlace a otra web).
   «Ver etiquetas» las marca dentro de la página con su etiqueta;
   «¿Dónde está…?» lleva a cada una (el camino con teclado);
   «Ver el código» enseña el HTML de la página con las líneas de lo
   último que ha tocado resaltadas. Sin pregunta ni entrega.
   Los colores de las marcas salen de las variables --sim-*.
   ============================================================ */
(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function') return;

  const CARPETA = 'data/proyecto/proy-antes-de-empezar/ejemplo-bloquecraft/';
  const COSAS = [
    { sel: 'img', etq: '<img>', corto: 'Imagen', pagina: 'index.html', abre: '<img', cierra: '',
      texto: 'Imagen: <img> con src (img/ y el nombre del archivo) y alt (lo que se ve). No se cierra.' },
    { sel: 'ol', etq: '<ol>', corto: 'Lista ordenada', pagina: 'index.html', abre: '<ol', cierra: '</ol>',
      texto: 'Lista ordenada: <ol> con un <li> por cosa. Sale con números: úsala cuando el orden importa, como unos pasos.' },
    { sel: 'ul', etq: '<ul>', corto: 'Lista no ordenada', pagina: 'mobs.html', abre: '<ul', cierra: '</ul>',
      texto: 'Lista no ordenada: <ul> con un <li> por cosa. Sale con puntos: el orden da igual.' },
    { sel: 'table', etq: '<table>', corto: 'Tabla', pagina: 'mobs.html', abre: '<table', cierra: '</table>',
      texto: 'Tabla: <table>. Cada fila es un <tr>; en la primera, <th> (el encabezado, en negrita); en las demás, <td>.' },
    { sel: 'form', etq: '<form>', corto: 'Formulario', pagina: 'biomas.html', abre: '<form', cierra: '</form>',
      texto: 'Formulario: <form> con cada caja (<input>) y el desplegable (<select>) con su <label>, y un <button type="button">. Aún no hace nada: lo haréis funcionar con JavaScript.' },
    { sel: 'a[href^="http"]', etq: '<a href="https://…">', corto: 'Enlace a otra web', pagina: 'mobs.html', abre: 'href="http', cierra: '',
      texto: 'Enlace a otra web: <a> con href="https://…" (la dirección entera) y target="_blank" (se abre en otra pestaña).' },
  ];

  registrarSimulacion('web-ejemplo', {
    etiqueta: 'Web de ejemplo',
    ventana: '127.0.0.1:5500/index.html',
    mision: [
      'Pasa por las 4 páginas con el menú de arriba.',
      'Toca una imagen.',
      'Toca una lista ordenada (la de números).',
      'Toca una lista no ordenada (la de puntos).',
      'Toca una tabla.',
      'Toca el formulario.',
      'Toca un enlace a otra web.',
    ],
    final: 'Todo esto tiene que estar también en vuestra web: 4 páginas con el mismo menú, al menos 3 imágenes, una lista ordenada, una no ordenada, una tabla, un formulario y un enlace a otra web. Con vuestro tema y vuestras palabras.',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const lento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let actual = 'index.html';
      let etiquetas = false;
      let foco = null;          /* { i, n (cuál de la página), pagina } */
      let pendiente = -1;       /* cosa que enseñar al acabar de cargar */
      let turnoCodigo = 0;
      const vistas = new Set();

      pantalla.appendChild(el('p', 'sim__ayuda', 'Navega con el menú y toca en la página cada cosa de la misión. Si no la encuentras, pulsa «Ver etiquetas».'));

      const fila = el('div', 'lab__fila');
      const bEtq = boton('🏷️ Ver etiquetas');
      bEtq.setAttribute('aria-pressed', 'false');
      const bCod = boton('</> Ver el código');
      bCod.setAttribute('aria-pressed', 'false');
      const abrir = el('a', 'lab__boton', '↗ Abrir en otra pestaña');
      abrir.target = '_blank';
      abrir.rel = 'noopener';
      abrir.style.cssText = 'display:inline-flex;align-items:center;text-decoration:none';
      fila.appendChild(bEtq);
      fila.appendChild(bCod);
      fila.appendChild(abrir);
      pantalla.appendChild(fila);

      const dondeFila = el('div', 'lab__fila');
      dondeFila.appendChild(el('span', 'sim__etiqueta', '¿Dónde está…?'));
      COSAS.forEach((c, i) => {
        const b = boton(c.corto);
        b.addEventListener('click', () => ensenar(i));
        dondeFila.appendChild(b);
      });
      pantalla.appendChild(dondeFila);

      const avisos = el('div');
      pantalla.appendChild(avisos);

      const marco = el('iframe');
      marco.title = 'Web de ejemplo BloqueCraft';
      marco.style.cssText = 'display:block;width:100%;height:320px;border:1px solid var(--border);border-radius:6px;background:var(--sim-blanco)';
      pantalla.appendChild(marco);

      const pre = el('pre');
      pre.setAttribute('translate', 'no');
      pre.className = 'notranslate';
      pre.style.cssText = 'margin:0;max-height:24rem;overflow:auto;position:relative';
      pre.setAttribute('aria-label', 'Código de la página');
      pre.tabIndex = 0;
      pre.hidden = true;
      const code = el('code');
      pre.appendChild(code);
      pantalla.appendChild(pre);

      function avisar(t, tipo) {
        avisos.innerHTML = '';
        avisos.appendChild(ctx.aviso(t, tipo));
      }
      function nombreDe(ruta) {
        let n = decodeURIComponent(ruta.split('/').pop() || '');
        if (!n) n = 'index.html';
        if (!/\.html$/i.test(n)) n += '.html';
        return n;
      }
      function doc() {
        try { return marco.contentDocument && marco.contentDocument.body ? marco.contentDocument : null; } catch (e) { return null; }
      }
      function color(v) { return getComputedStyle(pantalla).getPropertyValue(v).trim(); }

      function ajustarAlto() {
        const d = doc();
        if (!d) return;
        marco.style.height = '0px';
        const h = d.documentElement.scrollHeight;
        marco.style.height = Math.min(Math.max(h + 4, 200), 520) + 'px';
      }

      function pintarMarcas() {
        const d = doc();
        if (!d) return;
        d.querySelectorAll('.ej-etq').forEach(n => n.remove());
        d.querySelectorAll('.ej-marca').forEach(n => n.classList.remove('ej-marca', 'ej-marca--vista'));
        d.body.classList.toggle('ej-con', etiquetas);
        d.body.style.paddingTop = etiquetas ? '4px' : '';
        const w = d.defaultView;
        const poner = (nodo, texto, visto) => {
          nodo.classList.add('ej-marca');
          if (visto) nodo.classList.add('ej-marca--vista');
          const r = nodo.getBoundingClientRect();
          const t = d.createElement('span');
          t.className = 'ej-etq' + (visto ? ' ej-etq--vista' : '');
          t.textContent = texto;
          t.style.left = Math.max(0, r.left + w.scrollX - 3) + 'px';
          t.style.top = Math.max(0, r.top + w.scrollY - 20) + 'px';
          d.body.appendChild(t);
        };
        if (etiquetas) {
          const nav = d.querySelector('nav');
          if (nav) poner(nav, '<nav> menú', ctx.hecho(0));
          COSAS.forEach((c, i) => d.querySelectorAll(c.sel).forEach(n => poner(n, c.etq, ctx.hecho(i + 1))));
        } else if (foco && foco.pagina === actual) {
          const n = d.querySelectorAll(COSAS[foco.i].sel)[foco.n];
          if (n) poner(n, COSAS[foco.i].etq, true);
        }
      }

      function pintarCodigo() {
        if (pre.hidden) return;
        const turno = ++turnoCodigo;
        const pagina = actual;
        fetch(CARPETA + pagina).then(r => r.text()).then(t => {
          if (turno !== turnoCodigo) return;
          const lineas = t.replace(/\r/g, '').replace(/\n$/, '').split('\n');
          let desde = -1, hasta = -1;
          if (foco && foco.pagina === pagina) {
            const c = COSAS[foco.i];
            let vistas2 = -1;
            for (let k = 0; k < lineas.length; k++) {
              if (lineas[k].indexOf(c.abre) >= 0 && ++vistas2 === foco.n) { desde = k; break; }
            }
            hasta = desde;
            if (desde >= 0 && c.cierra) {
              for (let k = desde; k < lineas.length; k++) if (lineas[k].indexOf(c.cierra) >= 0) { hasta = k; break; }
            }
          }
          const ancho = String(lineas.length).length;
          const resaltar = window.resaltarCodigo || (x => x.replace(/&/g, '&amp;').replace(/</g, '&lt;'));
          code.innerHTML = lineas.map((l, k) => {
            const marca = k >= desde && k <= hasta && desde >= 0;
            const num = '<span aria-hidden="true" style="color:var(--text-faint);user-select:none">' + String(k + 1).padStart(ancho, ' ') + '  </span>';
            return '<span style="display:block' + (marca ? ';background:var(--sim-nota)' : '') + '"' + (marca ? ' data-marca' : '') + '>' + num + (resaltar(l, 'html') || ' ') + '</span>';
          }).join('');
          const m = code.querySelector('[data-marca]');
          if (m) pre.scrollTop = Math.max(0, m.offsetTop - 40);
          else pre.scrollTop = 0;
        }).catch(() => { code.textContent = 'No he podido leer el código de ' + pagina + '. Ábrela en otra pestaña y pulsa Ctrl + U.'; });
      }

      function encontrado(i, nodo) {
        const d = doc();
        const n = Array.prototype.indexOf.call(d.querySelectorAll(COSAS[i].sel), nodo);
        foco = { i, n: Math.max(0, n), pagina: actual };
        ctx.cumple(i + 1, COSAS[i].corto + ': ' + COSAS[i].etq + ' en ' + actual + '.');
        avisar(COSAS[i].texto + (pre.hidden ? ' Pulsa «Ver el código» para ver cómo está escrito.' : ''), 'ok');
        pintarMarcas();
        pintarCodigo();
        const r = nodo.getBoundingClientRect();
        const w = d.defaultView;
        if (r.top < 0 || r.bottom > w.innerHeight) w.scrollTo({ top: Math.max(0, r.top + w.scrollY - 40), behavior: lento ? 'auto' : 'smooth' });
      }

      function ensenar(i) {
        const c = COSAS[i];
        const d = doc();
        if (!d || actual !== c.pagina) {
          pendiente = i;
          marco.src = CARPETA + c.pagina;
          return;
        }
        const nodo = d.querySelector(c.sel);
        if (nodo) encontrado(i, nodo);
      }

      function preparar(d) {
        const st = d.createElement('style');
        const acento = color('--sim-acento'), bien = color('--sim-bien'), blanco = color('--sim-blanco');
        st.textContent =
          '.ej-marca{outline:3px solid ' + acento + ';outline-offset:2px}' +
          '.ej-marca--vista{outline-color:' + bien + '}' +
          '.ej-etq{position:absolute;z-index:5;background:' + acento + ';color:' + blanco + ';font:bold 12px/18px ui-monospace,Consolas,monospace;padding:0 6px;border-radius:4px;pointer-events:none;white-space:nowrap}' +
          '.ej-etq--vista{background:' + bien + '}' +
          /* con etiquetas, sitio encima de cada pieza para que no tape el texto */
          '.ej-con nav,.ej-con img,.ej-con ol,.ej-con ul,.ej-con table,.ej-con form,.ej-con p:has(> a[href^="http"]){margin-top:24px}';
        d.head.appendChild(st);
        d.addEventListener('click', e => {
          const a = e.target.closest('a');
          if (a) {
            if (/^https?:/i.test(a.getAttribute('href') || '')) {
              e.preventDefault();
              encontrado(5, a);
              avisar(COSAS[5].texto + ' Este llevaría a ' + a.href + ' en otra pestaña: aquí no lo abro para que no salgas de la web de ejemplo.', 'ok');
            }
            return;
          }
          for (let i = 0; i < COSAS.length - 1; i++) {
            const n = e.target.closest(COSAS[i].sel);
            if (n) { encontrado(i, n); return; }
          }
        });
        d.addEventListener('submit', e => {
          e.preventDefault();
          avisar('El formulario aún no hace nada: lo haréis funcionar con JavaScript.', 'cuidado');
        });
        d.defaultView.addEventListener('resize', () => { ajustarAlto(); pintarMarcas(); });
      }

      marco.addEventListener('load', () => {
        const d = doc();
        if (!d) return;
        let ruta = '';
        try { ruta = marco.contentWindow.location.pathname; } catch (e) { return; }
        actual = nombreDe(ruta);
        ctx.barra('127.0.0.1:5500/' + actual);
        abrir.href = CARPETA + actual;
        if (!vistas.has(actual)) {
          vistas.add(actual);
          ctx.apunta('Página ' + vistas.size + ' de 4: ' + actual);
          if (vistas.size === 4) ctx.cumple(0, 'Has pasado por las 4 páginas con el menú.');
        }
        preparar(d);
        ajustarAlto();
        pintarMarcas();
        pintarCodigo();
        if (pendiente >= 0) {
          const i = pendiente;
          pendiente = -1;
          ensenar(i);
        }
      });

      bEtq.addEventListener('click', () => {
        etiquetas = !etiquetas;
        bEtq.setAttribute('aria-pressed', String(etiquetas));
        bEtq.classList.toggle('lab__boton--activo', etiquetas);
        bEtq.textContent = etiquetas ? '🏷️ Quitar etiquetas' : '🏷️ Ver etiquetas';
        pintarMarcas();
        ajustarAlto();
      });
      bCod.addEventListener('click', () => {
        pre.hidden = !pre.hidden;
        bCod.setAttribute('aria-pressed', String(!pre.hidden));
        bCod.classList.toggle('lab__boton--activo', !pre.hidden);
        bCod.textContent = pre.hidden ? '</> Ver el código' : '</> Quitar el código';
        pintarCodigo();
      });

      /* dentro de un desplegable (S6) no se puede medir hasta que se abre */
      const plegable = pantalla.closest('details');
      if (plegable) plegable.addEventListener('toggle', () => { if (plegable.open) { ajustarAlto(); pintarMarcas(); } });

      abrir.href = CARPETA + 'index.html';
      marco.src = CARPETA + 'index.html';
    },
  });
})();
