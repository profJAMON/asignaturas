/* ============================================================
   Linux Mint (Xfce) de mentira para las simulaciones (16/11/2026)
   ============================================================
   Para la Unidad 7 de Operaciones (Linux). Los PCs del aula son
   Windows y no se usan máquinas virtuales (se llenan de archivos),
   así que Linux se practica aquí, con la misma idea que el Windows
   11 de mentira (js/win11.js): que se maneje como el de verdad.

   Lo que hay:
     - escritorio con iconos (Sistema de archivos, Carpeta personal,
       Papelera, el USB montado y lo que haya en ~/Escritorio);
     - panel de abajo: menú, mostrar el escritorio, lanzadores,
       botones de las ventanas, áreas de trabajo (4), bandeja y reloj;
     - menú de aplicaciones tipo Whisker: buscar escribiendo,
       categorías, clic derecho → Añadir al panel / al escritorio /
       a favoritos; cerrar sesión, reiniciar y apagar;
     - ventanas tipo Xfce (título en el centro, botones a la derecha),
       con su menú de ventana (Mover a otro área de trabajo);
     - Gestor de archivos (Thunar): ruta, panel lateral, iconos,
       ocultos (Ctrl + H), crear, renombrar (F2), cortar, copiar,
       pegar, papelera, eliminar, crear archivador, propiedades con
       la pestaña Permisos, abrir terminal aquí y el USB con ⏏;
     - Terminal (bash) con un sistema de archivos de verdad: pwd,
       ls (-a -l), cd, mkdir (-p), touch, cp (-r), mv, rm (-r),
       rmdir, cat, echo, clear, history, whoami, sudo (con su
       contraseña), apt, adduser, groups, chmod, chown, ./programa,
       df -h, lsblk, ps, kill, killall, top, | grep, Tab y ↑ ↓;
     - Gestor de tareas (Ctrl + Shift + Esc): procesos, CPU y
       memoria; Terminar y Matar;
     - pantalla de bloqueo con contraseña, ventana de contraseña
       («Autenticación») y diálogo de cerrar sesión / apagar.

   Reutiliza del Windows 11 de mentira el teclado en pantalla
   (WIN11.teclado) y las clases de ventanas, menús, diálogos y
   avisos (w11-v, w11-menu, w11-dlg, w11-btn, w11-toast…): la raíz
   lleva «w11 mint» y el CSS de «Linux Mint de mentira» cambia los
   colores y lo que es distinto en Xfce. Va en tema.html DESPUÉS de
   js/win11.js y ANTES de js/sim-linux.js.

   Uso, dentro del crear(ctx) de una simulación:
     const { dir, arch, KB, MB, GB } = MINT.fs;
     const L = MINT.escritorio(ctx, {
       casa: [dir('Documentos', [arch('notas.txt', 2 * KB)])],
       usb: { etiqueta: 'KINGSTON', capacidad: 16 * GB, formato: 'ext4', hijos: […] },
       apps: { id: { n, icono, cat, buscar: [...], abrir(L, o) } },
       procesos: [{ n, pid, cpu, mem, terco }],
       clave: 'alumno',
     });
     L.on('cmd', d => …)   // cada orden de la terminal: { linea, cmd, args, ok, sudo, cwd, salida }
     L.on('fs', d => …)    // { tipo, nodo, … } cambios en los archivos
     L.on('app', d => …), L.on('area', d => …), L.on('atajo', d => …)…
     L.abrirApp('terminal', { cwd: '/home/alumno' })
     L.aviso(texto, 'ok'|'cuidado'|error)

   Todo inventado; nada se guarda ni toca el ordenador de verdad.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.LAB || !window.WIN11) return;
  const { el, boton } = window.LAB;
  const { teclado, comboDeEvento } = window.WIN11;

  /* ---------- Iconos: los de Windows sirven para casi todo; los de Linux, aquí ---------- */
  const S = c => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${c}</svg>`;
  const IC = {
    mint: S('<circle class="mnti-verde" cx="12" cy="12" r="10.5"/><path class="mnti-blanco-trazo" d="M6.5 7.5v6.2a3 3 0 0 0 3 3h5a3 3 0 0 0 3-3V9.6M9.6 8v5.4M12.8 9.6a1.6 1.6 0 0 1 3.2 0v3.8M9.6 9.6a1.6 1.6 0 0 1 3.2 0v3.8"/>'),
    thunar: S('<path class="w11i-carpeta-2" d="M2 6a1.5 1.5 0 0 1 1.5-1.5h5.4l2 2h9.6A1.5 1.5 0 0 1 22 8v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19z"/><path class="w11i-carpeta" d="M2 9.5A1.5 1.5 0 0 1 3.5 8h17A1.5 1.5 0 0 1 22 9.5V19a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19z"/><circle class="mnti-blanco" cx="12" cy="14" r="3.2"/><path class="mnti-gris-trazo" d="M10.5 14h3M12 12.5v3"/>'),
    casa: S('<path class="w11i-carpeta-2" d="M2 6a1.5 1.5 0 0 1 1.5-1.5h5.4l2 2h9.6A1.5 1.5 0 0 1 22 8v11a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19z"/><path class="w11i-carpeta" d="M2 9.5A1.5 1.5 0 0 1 3.5 8h17A1.5 1.5 0 0 1 22 9.5V19a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 19z"/><path class="mnti-blanco" d="M12 10.5l4.5 3.6h-1.3V18h-2.3v-2.6h-1.8V18H8.8v-3.9H7.5z"/>'),
    raiz: S('<rect class="w11i-gris" x="2.5" y="7" width="19" height="10" rx="2"/><path class="w11i-trazo" d="M5 14h8"/><circle class="mnti-verde" cx="18" cy="14" r="1.2"/>'),
    terminal: S('<rect class="mnti-oscuro" x="2.5" y="4" width="19" height="16" rx="2"/><path class="mnti-verde-trazo" d="M6 9l3 3-3 3"/><path class="mnti-blanco-trazo" d="M11 15h5"/>'),
    firefox: S('<circle class="mnti-naranja" cx="12" cy="12" r="9.5"/><circle class="mnti-morado" cx="12.5" cy="12.5" r="5.5"/><path class="mnti-ambar" d="M4 8.5c1.5-3 4-4.5 7-4.5-1.5 1.2-2 2.6-1.6 3.6C7.6 7.8 5.6 8 4 8.5z"/>'),
    editor: S('<rect class="w11i-hoja" x="4.5" y="3" width="15" height="18.5" rx="1.6"/><path class="w11i-raya" d="M7.5 8h9M7.5 11h9M7.5 14h6"/><path class="mnti-verde" d="M14 19.5l1-3.2 5.5-5.5 2.2 2.2-5.5 5.5z"/>'),
    tareas: S('<rect class="w11i-hoja" x="3" y="4" width="18" height="16" rx="2"/><path class="mnti-verde-trazo" d="M5.5 15l3-3.5 2.5 2 3.5-5 2.5 3 1.5-1.5"/><path class="w11i-raya" d="M5.5 17.5h13"/>'),
    software: S('<path class="mnti-verde" d="M5 8h14l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z"/><path class="w11i-trazo" d="M9 8V6.5a3 3 0 0 1 6 0V8"/><path class="mnti-blanco-trazo" d="M12 11v6M9.5 14.5L12 17l2.5-2.5"/>'),
    discos: S('<rect class="w11i-gris" x="3" y="5" width="18" height="14" rx="2"/><circle class="w11i-pantalla" cx="12" cy="12" r="5"/><circle class="w11i-gris-osc" cx="12" cy="12" r="1.3"/><path class="w11i-trazo" d="M15.5 16.5l2 2"/>'),
    usuarios: S('<circle class="w11i-gris" cx="9" cy="9" r="3.5"/><path class="w11i-gris" d="M2.5 20a6.5 6.5 0 0 1 13 0z"/><circle class="mnti-verde" cx="17" cy="9.5" r="2.8"/><path class="mnti-verde" d="M13.8 20a5.5 5.5 0 0 1 8.2-4.7V20z"/>'),
    config: S('<path class="w11i-gris-osc" d="M12 2l1.8 2.4 2.9-.7.4 3 2.7 1.2-1.1 2.8 1.6 2.6-2.6 1.4-.1 3-3-.2-1.6 2.6-2.2-2L9.8 20l-1.5-2.6-3-.1.1-3-2.6-1.5 1.6-2.6-1.1-2.8L6 6.2l.4-3 2.9.7z"/><circle class="mnti-verde" cx="12" cy="12" r="3.2"/>'),
    writer: S('<path class="w11i-hoja" d="M6 2.5h8.5L19 7v14a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 21z"/><rect class="w11i-azul" x="3" y="10" width="9" height="8" rx="1.5"/><path class="mnti-blanco-trazo" d="M5 12l1 4 1.5-3 1.5 3 1-4"/>'),
    juego: S('<rect class="w11i-verde" x="3" y="3" width="18" height="18" rx="2.5"/><path class="w11i-verde-osc" d="M3 9h18v3H3z"/><path class="w11i-negro" d="M7.5 13.5h3v3h-3zM13.5 13.5h3v3h-3zM10.5 16.5h3v3h-3z"/>'),
    script: S('<path class="w11i-hoja" d="M6 2.5h8.5L19 7v14a.5.5 0 0 1-.5.5h-12A.5.5 0 0 1 6 21z"/><path class="mnti-verde-trazo" d="M8.5 12l2.5 2-2.5 2M12.5 17h3"/>'),
    bloquear: S('<rect class="w11i-trazo" x="5" y="10.5" width="14" height="10.5" rx="2"/><path class="w11i-trazo" d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>'),
    salir: S('<path class="w11i-trazo" d="M14 4h4.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H14M10 8l-4 4 4 4M6 12h10"/>'),
    escritorio: S('<rect class="w11i-trazo" x="3" y="4" width="18" height="13" rx="1.5"/><path class="w11i-trazo" d="M9 20h6M12 17v3"/>'),
    red: S('<path class="w11i-trazo" d="M3 9.5a13 13 0 0 1 18 0M6 12.8a8.5 8.5 0 0 1 12 0M9 16a4 4 0 0 1 6 0"/><circle class="w11i-relleno" cx="12" cy="19" r="1.3"/>'),
    lista: S('<path class="w11i-trazo" d="M4 6h16M4 12h16M4 18h16"/>'),
    iconos: S('<path class="w11i-trazo" d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>'),
    oculto: S('<path class="w11i-trazo" d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z"/><circle class="w11i-trazo" cx="12" cy="12" r="2.6"/>'),
  };
  const ALIAS = { carpeta: 'carpeta', documento: 'documento', texto: 'texto' };
  function icono(nombre, clase) {
    const s = el('span', 'w11-ico' + (clase ? ' ' + clase : ''));
    s.innerHTML = IC[nombre] || window.WIN11.ICONOS[ALIAS[nombre] || nombre] || window.WIN11.ICONOS.app;
    return s;
  }

  /* ---------- Sistema de archivos (rutas de Linux, con /) ---------- */
  const KB = 1024, MB = KB * 1024, GB = MB * 1024;
  const num = (x, d) => x.toLocaleString('es-ES', { maximumFractionDigits: d });
  function tamano(b) {
    if (b >= GB) return num(b / GB, 1) + ' GB';
    if (b >= MB) return num(b / MB, b >= 100 * MB ? 0 : 1) + ' MB';
    if (b >= KB) return num(b / KB, 1) + ' kB';
    return b + ' bytes';
  }
  // tamaño corto como el de «df -h» y «ls -lh»
  function corto(b) {
    if (b >= GB) return num(b / GB, b >= 10 * GB ? 0 : 1).replace('.', ',') + 'G';
    if (b >= MB) return num(b / MB, b >= 10 * MB ? 0 : 1) + 'M';
    if (b >= KB) return Math.round(b / KB) + 'K';
    return String(b);
  }
  const dir = (n, hijos, o) => Object.assign({ n, dir: true, hijos: hijos || [], perm: 'rwxr-xr-x', dueno: 'alumno', grupo: 'alumno' }, o || {});
  const arch = (n, tam, o) => Object.assign({ n, dir: false, tam: Math.round(tam || 0), perm: 'rw-r--r--', dueno: 'alumno', grupo: 'alumno' }, o || {});
  const deRoot = (nodo) => { nodo.dueno = 'root'; nodo.grupo = 'root'; (nodo.hijos || []).forEach(deRoot); return nodo; };
  function enlazar(n, p) { n._p = p || null; (n.hijos || []).forEach(h => enlazar(h, n)); return n; }
  function peso(n) { return n.dir ? n.hijos.reduce((a, h) => a + peso(h), 0) : n.tam || 0; }
  function clonar(n) {
    const c = Object.assign({}, n);
    delete c._p;
    if (n.dir) c.hijos = n.hijos.map(clonar);
    return c;
  }
  const ext = n => ((/\.([^./]+)$/.exec(n) || [])[1] || '').toLowerCase();
  const ICONO_EXT = { txt: 'texto', md: 'texto', odt: 'writer', docx: 'writer', pdf: 'pdf', jpg: 'imagen', jpeg: 'imagen', png: 'imagen', webp: 'imagen', mp4: 'video', mkv: 'video', mp3: 'musica', ogg: 'musica', zip: 'zip', gz: 'zip', tgz: 'zip', sh: 'script', deb: 'software', iso: 'disco', html: 'firefox' };
  const TIPO_EXT = { txt: 'documento de texto sencillo', md: 'documento Markdown', odt: 'documento de texto ODF', docx: 'documento de Word', pdf: 'documento PDF', jpg: 'imagen JPEG', jpeg: 'imagen JPEG', png: 'imagen PNG', webp: 'imagen WebP', mp4: 'vídeo MPEG-4', mkv: 'vídeo Matroska', mp3: 'audio MP3', ogg: 'audio Ogg', zip: 'archivador Zip', gz: 'archivador Tar comprimido con gzip', sh: 'guion del intérprete de órdenes', deb: 'paquete Debian', iso: 'imagen de disco', html: 'documento HTML' };
  const iconoDe = n => n.icono || (n.dir ? (n.usb ? 'usb' : 'carpeta') : ICONO_EXT[ext(n.n)] || (n.perm[2] === 'x' ? 'script' : 'documento'));
  const tipoDe = n => n.dir ? 'carpeta' : TIPO_EXT[ext(n.n)] || (n.perm[2] === 'x' ? 'programa' : 'archivo');

  function sistema(op) {
    const u = op.usuario || 'alumno';
    const casa = dir(u, [
      dir('Escritorio', op.escritorio || []),
      dir('Descargas', op.descargas || []),
      dir('Documentos', op.documentos || []),
      dir('Imágenes', op.imagenes || []),
      dir('Música', op.musica || []),
      dir('Vídeos', op.videos || []),
      dir('.config', [dir('xfce4'), dir('mozilla')]),
      dir('.cache', []),
      arch('.bashrc', 3771, { contenido: '# ~/.bashrc: lo lee bash al abrir cada terminal\nalias ll=\'ls -l\'' }),
      arch('.profile', 807),
    ].concat(op.casa || []), { dueno: u, grupo: u });
    const raiz = dir('/', [
      dir('bin', [arch('bash', 1396520, { perm: 'rwxr-xr-x' }), arch('ls', 142312, { perm: 'rwxr-xr-x' })]),
      dir('boot', [arch('vmlinuz', 14 * MB)]),
      dir('dev', []),
      dir('etc', [arch('hostname', 8, { contenido: op.equipo || 'aula-pc' }), arch('passwd', 2960, { contenido: 'root:x:0:0:root:/root:/bin/bash\n' + u + ':x:1000:1000:' + u + ',,,:/home/' + u + ':/bin/bash' }), dir('apt', [])]),
      dir('home', [casa].concat(op.otrasCasas || [])),
      dir('media', [dir(u, [], { dueno: 'root', grupo: 'root', perm: 'rwxr-x---' })]),
      dir('mnt', []),
      dir('opt', []),
      dir('root', [arch('.bashrc', 3106)], { perm: 'rwx------' }),
      dir('tmp', [], { perm: 'rwxrwxrwt' }),
      dir('usr', [dir('bin', []), dir('share', [])]),
      dir('var', [dir('log', [])]),
    ]);
    raiz.hijos.forEach(h => { if (h.n !== 'home' && h.n !== 'tmp') deRoot(h); });
    raiz.dueno = 'root'; raiz.grupo = 'root';
    const home = raiz.hijos.find(h => h.n === 'home');
    home.dueno = 'root'; home.grupo = 'root';
    const tmp = raiz.hijos.find(h => h.n === 'tmp');
    tmp.dueno = 'root'; tmp.grupo = 'root';
    enlazar(raiz, null);
    return { raiz, casa };
  }
  function ruta(n) {
    if (!n || !n._p) return '/';
    const p = [];
    for (let x = n; x && x._p; x = x._p) p.unshift(x.n);
    return '/' + p.join('/');
  }
  function hijo(n, nombre) { return n && n.dir ? n.hijos.find(h => h.n === nombre) || null : null; }
  // Devuelve { nodo, padre, nombre, error }. El error es el de bash.
  function resolver(W, txt, cwd) {
    let partes, n;
    txt = String(txt == null ? '' : txt);
    if (txt === '~' || txt.indexOf('~/') === 0) txt = ruta(W.casa) + txt.slice(1);
    if (txt[0] === '/') { n = W.raiz; partes = txt.split('/'); }
    else { n = cwd || W.casa; partes = txt.split('/'); }
    partes = partes.filter(p => p !== '' && p !== '.');
    let padre = null, nombre = null;
    for (let i = 0; i < partes.length; i++) {
      const p = partes[i];
      if (!n) return { error: 'noexiste', padre, nombre: p };
      if (!n.dir) return { error: 'nodir', padre, nombre: p };
      if (p === '..') { n = n._p || n; continue; }
      padre = n; nombre = p;
      n = hijo(n, p);
      if (!n && i < partes.length - 1) return { error: 'noexiste', padre, nombre: p };
    }
    if (!n) return { nodo: null, padre, nombre, error: 'noexiste' };
    return { nodo: n, padre: n._p, nombre: n.n };
  }
  function puede(W, n, que, quien) {
    quien = quien || W.usuario;
    if (quien === 'root') return que !== 'x' || n.dir || /x/.test(n.perm);
    let trio;
    if (n.dueno === quien) trio = n.perm.slice(0, 3);
    else if (W.grupos.indexOf(n.grupo) !== -1) trio = n.perm.slice(3, 6);
    else trio = n.perm.slice(6, 9);
    return trio.indexOf(que === 'r' ? 'r' : que === 'w' ? 'w' : 'x') !== -1 || (que === 'x' && trio.indexOf('t') !== -1);
  }
  function permDeOctal(o) {
    const t = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
    return String(o).split('').map(d => t[+d]).join('');
  }
  function octalDe(p) {
    let s = '';
    for (let i = 0; i < 9; i += 3) s += (p[i] === 'r' ? 4 : 0) + (p[i + 1] === 'w' ? 2 : 0) + (/[xt]/.test(p[i + 2]) ? 1 : 0);
    return s;
  }
  const libreDe = (cap, n) => Math.max(0, cap - peso(n));

  /* ---------- Escritorio ---------- */
  const APPS_BASE = {
    archivos: { n: 'Gestor de archivos', icono: 'thunar', cat: 'Sistema', buscar: ['thunar', 'archivos', 'carpetas', 'explorador', 'carpeta personal'] },
    terminal: { n: 'Terminal', icono: 'terminal', cat: 'Sistema', buscar: ['terminal', 'consola', 'bash', 'cmd', 'linea de ordenes', 'comandos'] },
    firefox: { n: 'Navegador web Firefox', icono: 'firefox', cat: 'Internet', buscar: ['firefox', 'navegador', 'internet', 'web', 'chrome'] },
    editor: { n: 'Editor de textos', icono: 'editor', cat: 'Accesorios', buscar: ['mousepad', 'editor', 'texto', 'bloc de notas', 'notas'] },
    calculadora: { n: 'Calculadora', icono: 'calculadora', cat: 'Accesorios', buscar: ['calculadora', 'galculator'], unica: true },
    writer: { n: 'LibreOffice Writer', icono: 'writer', cat: 'Oficina', buscar: ['writer', 'word', 'libreoffice', 'procesador'] },
    tareas: { n: 'Gestor de tareas', icono: 'tareas', cat: 'Sistema', buscar: ['tareas', 'procesos', 'administrador de tareas', 'task manager', 'monitor'], unica: true },
    software: { n: 'Gestor de software', icono: 'software', cat: 'Administración', buscar: ['software', 'programas', 'instalar', 'tienda', 'aplicaciones', 'mintinstall'], unica: true },
    discos: { n: 'Discos', icono: 'discos', cat: 'Accesorios', buscar: ['discos', 'usb', 'formatear', 'particiones', 'gnome-disks'], unica: true },
    usuarios: { n: 'Usuarios y grupos', icono: 'usuarios', cat: 'Administración', buscar: ['usuarios', 'grupos', 'cuentas'], unica: true },
    configuracion: { n: 'Gestor de configuración', icono: 'config', cat: 'Configuración', buscar: ['configuracion', 'ajustes', 'panel de control', 'preferencias'], unica: true },
  };
  const CATEGORIAS = ['Favoritos', 'Todo', 'Accesorios', 'Administración', 'Configuración', 'Internet', 'Oficina', 'Sistema'];
  const sinTildes = t => String(t).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  function escritorio(ctx, op) {
    op = op || {};
    const pantalla = ctx.pantalla;
    pantalla.classList.add('sim__pantalla--w11');
    const { raiz: FS, casa } = sistema(op);
    const L = {
      ctx, op, icono, ventanas: [], apps: {}, area: 0, areas: 4, raiz: FS, casa,
      usuario: op.usuario || 'alumno', equipo: op.equipo || 'aula-pc', clave: op.clave || 'alumno',
      grupos: (op.grupos || [op.usuario || 'alumno', 'adm', 'cdrom', 'sudo', 'dip', 'plugdev', 'lpadmin', 'sambashare']).slice(),
      est: { verOcultos: false }, papelera: [], procesos: [], sudoHasta: 0, paquetes: Object.assign({}, PAQUETES_BASE, op.paquetes || {}),
      instalados: (op.instalados || ['firefox', 'thunar', 'mousepad', 'libreoffice-writer', 'xfce4-terminal', 'bash', 'nano']).slice(),
      usuarios: [op.usuario || 'alumno'],
    };
    L.ruta = ruta;
    L.resolver = (t, cwd) => resolver(L, t, cwd);
    L.puede = (n, q, quien) => puede(L, n, q, quien);
    const eventos = {};
    L.on = (n, f) => { (eventos[n] = eventos[n] || []).push(f); };
    L.emit = (n, d) => { (eventos[n] || []).forEach(f => f(d || {})); };
    Object.keys(APPS_BASE).forEach(k => { L.apps[k] = Object.assign({ id: k }, APPS_BASE[k]); });
    Object.keys(op.apps || {}).forEach(k => { L.apps[k] = Object.assign({ id: k }, L.apps[k] || {}, op.apps[k]); });
    let lanzadores = (op.lanzadores || ['archivos', 'firefox', 'terminal']).slice();
    let favoritos = (op.favoritos || ['firefox', 'archivos', 'terminal', 'editor', 'writer', 'software']).slice();
    let enEscritorio = [];
    const procesos = (op.procesos || []).map(p => Object.assign({ usuario: L.usuario, cpu: 0, mem: 20, estado: 'S' }, p));
    L.procesos = [
      { pid: 1, n: 'systemd', usuario: 'root', cpu: 0, mem: 11, sistema: true },
      { pid: 412, n: 'Xorg', usuario: 'root', cpu: 1.2, mem: 96, sistema: true },
      { pid: 905, n: 'xfwm4', usuario: L.usuario, cpu: 0.4, mem: 38, sistema: true },
      { pid: 911, n: 'xfce4-panel', usuario: L.usuario, cpu: 0.2, mem: 41, sistema: true },
      { pid: 918, n: 'xfdesktop', usuario: L.usuario, cpu: 0.1, mem: 35, sistema: true },
      { pid: 1188, n: 'thunar', usuario: L.usuario, cpu: 0, mem: 52 },
    ].concat(procesos);

    /* ---- USB ---- */
    L.usb = op.usb ? Object.assign({ etiqueta: 'USB', capacidad: 16 * GB, formato: 'ext4', conectado: true, montado: false, hijos: [] }, op.usb) : null;
    const media = () => resolver(L, '/media/' + L.usuario).nodo;
    L.montar = (origen) => {
      const u = L.usb;
      if (!u || !u.conectado || u.montado) return;
      const n = dir(u.etiqueta, u.hijos, { usb: true, perm: u.formato === 'ext4' ? 'rwxr-xr-x' : 'rwxr-xr-x' });
      u.nodo = n;
      media().hijos.push(n);
      enlazar(n, media());
      u.montado = true;
      L.emit('usb', { tipo: 'montar', origen });
      L.refrescar();
    };
    L.desmontar = (origen) => {
      const u = L.usb;
      if (!u || !u.montado) return false;
      const ocupado = L.terminales().some(t => esDentro(t.cwd, u.nodo));
      if (ocupado) { L.notificacion('Fallo al desmontar «' + u.etiqueta + '»', 'El dispositivo está ocupado: hay una terminal dentro. Sal de la carpeta (cd ~) y vuelve a probar.', 'error'); L.emit('usb', { tipo: 'ocupado', origen }); return false; }
      const m = media();
      m.hijos.splice(m.hijos.indexOf(u.nodo), 1);
      u.hijos = u.nodo.hijos;
      u.montado = false;
      L.ventanas.forEach(v => { if (v.thunar && esDentro(v.thunar.cwd, u.nodo)) v.thunar.ir(L.casa); });
      L.terminales().forEach(t => { if (esDentro(t.cwd, u.nodo)) t.cwd = L.casa; });
      u.nodo = null;
      L.emit('usb', { tipo: 'desmontar', origen });
      L.refrescar();
      return true;
    };
    L.expulsar = (origen) => {
      const u = L.usb;
      if (!u) return;
      if (u.montado && !L.desmontar(origen)) return;
      u.expulsado = true;
      L.notificacion('Ya puedes quitar «' + u.etiqueta + '»', 'El dispositivo se ha desmontado: se puede quitar con seguridad.', 'usb');
      L.emit('usb', { tipo: 'expulsar', origen });
      L.refrescar();
    };
    const esDentro = (n, d) => { for (let x = n; x; x = x._p) if (x === d) return true; return false; };
    L.esDentro = esDentro;

    /* ---- pantalla ---- */
    const raiz = el('div', 'w11 mint');
    raiz.tabIndex = 0;
    raiz.setAttribute('role', 'region');
    raiz.setAttribute('aria-label', op.etiqueta || 'Pantalla de Linux Mint de mentira. Toca aquí para usar el teclado de verdad.');
    const escena = el('div', 'w11__escena mint__escena');
    const fondo = el('div', 'w11__fondo mint__fondo');
    const iconos = el('div', 'w11__iconos mint__iconos');
    const capaVentanas = el('div', 'w11__ventanas mint__ventanas');
    const capaMenus = el('div', 'w11__capa');
    const toasts = el('div', 'w11__toasts mint__toasts');
    toasts.setAttribute('aria-live', 'polite');
    const panel = el('div', 'mint__panel');
    escena.append(fondo, iconos, capaVentanas, toasts, panel, capaMenus);
    raiz.appendChild(escena);
    const avisos = el('div', 'w11__avisos');
    avisos.setAttribute('aria-live', 'polite');
    const ayudaTeclado = el('div', 'w11__teclado');
    pantalla.append(raiz, avisos, ayudaTeclado);
    L.dom = raiz; L.escena = escena;
    L.aviso = (t, tipo) => { avisos.innerHTML = ''; if (t) avisos.appendChild(ctx.aviso(t, tipo)); };
    // al cumplir un punto de la misión, se quita el aviso que hubiera (ya no hace falta)
    if (ctx.cumple && ctx.hecho) { const c0 = ctx.cumple; ctx.cumple = (i, t) => { if (!ctx.hecho(i)) L.aviso(''); return c0(i, t); }; }

    /* ---- panel de abajo ---- */
    const bMenu = boton('', 'mint__pb mint__pb--menu');
    bMenu.append(icono('mint'), el('span', 'mint__pb-t', 'Menú'));
    bMenu.setAttribute('aria-label', 'Menú de aplicaciones');
    bMenu.addEventListener('click', () => toggleMenu('raton'));
    const bEsc = boton('', 'mint__pb');
    bEsc.appendChild(icono('escritorio'));
    bEsc.setAttribute('aria-label', 'Mostrar el escritorio');
    bEsc.title = 'Mostrar el escritorio';
    bEsc.addEventListener('click', () => mostrarEscritorio('raton'));
    const zLanz = el('div', 'mint__lanz');
    const zTareas = el('div', 'mint__tareas');
    const zAreas = el('div', 'mint__areas');
    zAreas.setAttribute('role', 'group');
    zAreas.setAttribute('aria-label', 'Áreas de trabajo');
    const zBandeja = el('div', 'mint__bandeja');
    const reloj = el('span', 'mint__reloj', op.hora || '16:05');
    reloj.setAttribute('translate', 'no');
    zBandeja.append(icono('red', 'mint__bico'), icono('volumen', 'mint__bico'), reloj);
    panel.append(bMenu, bEsc, zLanz, el('span', 'mint__psep'), zTareas, zAreas, zBandeja);

    function pintarPanel() {
      zLanz.innerHTML = '';
      lanzadores.forEach(id => {
        const a = L.apps[id];
        if (!a) return;
        const b = boton('', 'mint__pb');
        b.appendChild(icono(a.icono));
        b.setAttribute('aria-label', a.n);
        b.title = a.n;
        b.addEventListener('click', () => L.abrirApp(id, { origen: 'lanzador' }));
        b.addEventListener('contextmenu', e => {
          e.preventDefault(); e.stopPropagation();
          L.menu(e.clientX, e.clientY, [{ t: 'Quitar del panel', icono: 'eliminar', f: () => L.lanzador(id, false, 'panel') }], { encima: true });
        });
        zLanz.appendChild(b);
      });
      zTareas.innerHTML = '';
      L.ventanas.filter(v => v.area === L.area || v.fija).forEach(v => {
        const b = boton('', 'mint__tarea' + (v === L.activa && v.estado !== 'min' ? ' mint__tarea--activa' : '') + (v.estado === 'min' ? ' mint__tarea--min' : ''));
        b.append(icono(v.def.icono || 'app'), el('span', 'mint__tarea-t', v.def.titulo));
        b.setAttribute('aria-label', v.def.titulo + (v.estado === 'min' ? ' (minimizada)' : ''));
        b.addEventListener('click', () => { cerrarCapas(); if (v === L.activa && v.estado !== 'min') v.minimizar(); else v.enfocar(); });
        b.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); menuVentana(v, e.clientX, e.clientY, true); });
        zTareas.appendChild(b);
      });
      zAreas.innerHTML = '';
      for (let i = 0; i < L.areas; i++) {
        const b = boton('', 'mint__area' + (i === L.area ? ' mint__area--actual' : ''));
        b.setAttribute('aria-label', 'Área de trabajo ' + (i + 1) + (i === L.area ? ' (la que ves)' : ''));
        b.setAttribute('aria-pressed', String(i === L.area));
        L.ventanas.filter(v => v.area === i && v.estado !== 'min').forEach(v => {
          const m = el('span', 'mint__area-v');
          const r = v.estado === 'max' ? { x: 0, y: 0, w: 100, h: 100 } : v.estado === 'izq' ? { x: 0, y: 0, w: 50, h: 100 } : v.estado === 'der' ? { x: 50, y: 0, w: 50, h: 100 } : v.rect;
          Object.assign(m.style, { left: Math.max(0, r.x) + '%', top: r.y + '%', width: Math.min(100, r.w) + '%', height: r.h + '%' });
          b.appendChild(m);
        });
        b.appendChild(el('span', 'mint__area-n', String(i + 1)));
        b.addEventListener('click', () => L.irArea(i, 'raton'));
        zAreas.appendChild(b);
      }
    }
    L.pintarPanel = pintarPanel;
    L.lanzador = (id, si, donde) => {
      const i = lanzadores.indexOf(id);
      if (si && i === -1) lanzadores.push(id);
      if (!si && i !== -1) lanzadores.splice(i, 1);
      pintarPanel();
      L.emit('anclar', { id, si, donde });
    };
    L.lanzadores = () => lanzadores.slice();
    L.irArea = (i, origen) => {
      i = (i + L.areas) % L.areas;
      if (i === L.area) return;
      L.area = i;
      L.ventanas.forEach(v => v.colocar());
      const vis = L.ventanas.filter(v => (v.area === i || v.fija) && v.estado !== 'min').sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
      L.activa = vis || null;
      L.ventanas.forEach(x => x.el.classList.toggle('w11-v--activa', x === L.activa));
      pintarPanel();
      L.emit('area', { area: i, origen });
    };
    L.moverArea = (v, i, origen) => {
      i = (i + L.areas) % L.areas;
      v.area = i;
      v.colocar();
      if (L.activa === v && i !== L.area) L.activa = null;
      pintarPanel();
      L.emit('moverArea', { v, area: i, origen });
    };

    /* ---- ventanas (tipo Xfce) ---- */
    let z = 10;
    const estrecho = () => escena.clientWidth < 560;
    L.abrir = def => {
      const v = { def, app: def.app || def.id || 'app', estado: 'normal', area: L.area };
      const n = L.ventanas.length;
      v.rect = def.rect || { x: 5 + n * 4, y: 4 + n * 4, w: def.ancho || 66, h: def.alto || 74 };
      const nodo = el('div', 'w11-v mint-v');
      nodo.setAttribute('role', 'group');
      const cab = el('div', 'w11-v__barra mint-v__barra');
      const bIco = boton('', 'mint-v__menu');
      bIco.appendChild(icono(def.icono || 'app', 'w11-v__ico'));
      bIco.setAttribute('aria-label', 'Menú de la ventana');
      const tit = el('span', 'w11-v__titulo', def.titulo || '');
      if (def.tituloNoTraducir) tit.setAttribute('translate', 'no');
      const btns = el('div', 'w11-v__botones mint-v__botones');
      const bMin = boton('', 'w11-v__b'); bMin.setAttribute('aria-label', 'Minimizar'); bMin.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 7h6"/></svg>';
      const bMax = boton('', 'w11-v__b'); bMax.setAttribute('aria-label', 'Maximizar'); bMax.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 6.5L5 3.5l3 3"/></svg>';
      const bCer = boton('', 'w11-v__b w11-v__b--cerrar'); bCer.setAttribute('aria-label', 'Cerrar'); bCer.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.2 2.2l5.6 5.6M7.8 2.2L2.2 7.8"/></svg>';
      btns.append(bMin, bMax, bCer);
      cab.append(bIco, tit, btns);
      const cuerpo = el('div', 'w11-v__cuerpo');
      nodo.append(cab, cuerpo);
      capaVentanas.appendChild(nodo);
      Object.assign(v, { el: nodo, cuerpo, cab });
      v.titulo = t => { tit.textContent = t; nodo.setAttribute('aria-label', t); def.titulo = t; pintarPanel(); };
      v.titulo(def.titulo || '');
      v.colocar = () => {
        nodo.hidden = v.estado === 'min' || (v.area !== L.area && !v.fija);
        nodo.dataset.estado = v.estado;
        const r = v.estado === 'max' ? { x: 0, y: 0, w: 100, h: 100 } : v.estado === 'izq' ? { x: 0, y: 0, w: 50, h: 100 }
          : v.estado === 'der' ? { x: 50, y: 0, w: 50, h: 100 } : v.rect;
        Object.assign(nodo.style, { left: r.x + '%', top: r.y + '%', width: r.w + '%', height: r.h + '%' });
        bMax.setAttribute('aria-label', v.estado === 'max' ? 'Restaurar' : 'Maximizar');
        bMax.innerHTML = v.estado === 'max' ? '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 3.5L5 6.5l3-3"/></svg>' : '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2 6.5L5 3.5l3 3"/></svg>';
      };
      v.enfocar = () => {
        if (v.estado === 'min') v.estado = v.antesMin || 'normal';
        if (v.area !== L.area && !v.fija) { L.area = v.area; L.ventanas.forEach(x => x.colocar()); L.emit('area', { area: v.area, origen: 'ventana' }); }
        nodo.style.zIndex = ++z;
        L.activa = v;
        L.ventanas.forEach(x => x.el.classList.toggle('w11-v--activa', x === v));
        v.colocar();
        pintarPanel();
        if (def.alEnfocar) def.alEnfocar(v);
        L.emit('foco', { v });
      };
      v.minimizar = () => {
        if (v.estado !== 'min') v.antesMin = v.estado;
        v.estado = 'min';
        v.colocar();
        if (L.activa === v) L.activa = L.ventanas.filter(x => x.estado !== 'min' && x.area === L.area).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0] || null;
        pintarPanel();
        L.emit('min', { v });
      };
      v.maximizar = (origen) => { v.estado = v.estado === 'max' ? 'normal' : 'max'; v.enfocar(); L.emit('max', { v, origen }); };
      v.ajustar = (lado, origen) => { v.estado = lado; v.enfocar(); L.emit('ajustar', { v, lado, origen }); };
      v.cerrar = (origen) => {
        if (def.alCerrar && def.alCerrar(v) === false) return;
        nodo.remove();
        L.ventanas.splice(L.ventanas.indexOf(v), 1);
        if (L.activa === v) {
          L.activa = null;
          const otra = L.ventanas.filter(x => x.estado !== 'min' && x.area === L.area).sort((a, b) => b.el.style.zIndex - a.el.style.zIndex)[0];
          if (otra) otra.enfocar();
        }
        pintarPanel();
        L.emit('cerrar', { v, app: v.app, origen });
      };
      bMin.addEventListener('click', e => { e.stopPropagation(); v.minimizar(); });
      bMax.addEventListener('click', e => { e.stopPropagation(); v.maximizar('raton'); });
      bCer.addEventListener('click', e => { e.stopPropagation(); v.cerrar('raton'); });
      bIco.addEventListener('click', e => { e.stopPropagation(); const r = bIco.getBoundingClientRect(); menuVentana(v, r.left, r.bottom); });
      cab.addEventListener('dblclick', e => { if (!e.target.closest('.w11-v__b, .mint-v__menu')) v.maximizar('raton'); });
      cab.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); menuVentana(v, e.clientX, e.clientY); });
      nodo.addEventListener('pointerdown', () => { if (L.activa !== v) v.enfocar(); }, true);
      arrastrable(v, cab);
      L.ventanas.push(v);
      if (def.estado) v.estado = def.estado;
      else if (estrecho()) v.estado = 'max';
      if (def.crear) def.crear(cuerpo, v);
      v.enfocar();
      return v;
    };
    function menuVentana(v, x, y, desdePanel) {
      const areas = [];
      for (let i = 0; i < L.areas; i++) areas.push({ t: 'Área de trabajo ' + (i + 1), marca: v.area === i, off: v.area === i, f: () => L.moverArea(v, i, 'menu') });
      L.menu(x, y, [
        { t: v.estado === 'min' ? 'Restaurar' : 'Minimizar', atajo: 'Alt + F9', f: () => (v.estado === 'min' ? v.enfocar() : v.minimizar()) },
        { t: v.estado === 'max' ? 'Desmaximizar' : 'Maximizar', atajo: 'Alt + F10', f: () => v.maximizar('menu') },
        { t: 'Mover', off: true },
        { t: 'Redimensionar', off: true },
        { sep: true },
        { t: 'Siempre encima', off: true },
        { t: 'Siempre en el área de trabajo visible', marca: !!v.fija, f: () => { v.fija = !v.fija; v.colocar(); pintarPanel(); } },
        { t: 'Mover a otro área de trabajo', sub: areas },
        { sep: true },
        { t: 'Cerrar', icono: 'eliminar', atajo: 'Alt + F4', f: () => v.cerrar('menu') },
      ], { encima: !!desdePanel });
    }
    function arrastrable(v, cab) {
      let ini = null;
      cab.addEventListener('pointerdown', e => {
        if (e.button !== 0 || e.target.closest('.w11-v__b, .mint-v__menu')) return;
        const r = capaVentanas.getBoundingClientRect();
        ini = { x: e.clientX, y: e.clientY, r, rect: Object.assign({}, v.rect), movido: false, estado: v.estado };
        cab.setPointerCapture(e.pointerId);
      });
      cab.addEventListener('pointermove', e => {
        if (!ini) return;
        const dx = e.clientX - ini.x, dy = e.clientY - ini.y;
        if (!ini.movido && Math.abs(dx) + Math.abs(dy) < 6) return;
        if (!ini.movido && ini.estado !== 'normal') {
          v.estado = 'normal';
          const px = (e.clientX - ini.r.left) / ini.r.width * 100;
          ini.rect.x = Math.max(0, Math.min(100 - v.rect.w, px - v.rect.w / 2));
          ini.rect.y = 0;
        }
        ini.movido = true;
        v.rect.x = Math.max(-v.rect.w + 12, Math.min(96, ini.rect.x + dx / ini.r.width * 100));
        v.rect.y = Math.max(0, Math.min(92, ini.rect.y + dy / ini.r.height * 100));
        v.colocar();
        escena.dataset.ajuste = e.clientX - ini.r.left < 8 ? 'izq' : ini.r.right - e.clientX < 8 ? 'der' : e.clientY - ini.r.top < 4 ? 'max' : '';
      });
      const fin = e => {
        if (!ini) return;
        const lado = escena.dataset.ajuste;
        escena.dataset.ajuste = '';
        if (ini.movido && lado) v.ajustar(lado, 'arrastrar');
        else if (ini.movido) pintarPanel();
        ini = null;
        try { cab.releasePointerCapture(e.pointerId); } catch (_) { /* nada */ }
      };
      cab.addEventListener('pointerup', fin);
      cab.addEventListener('pointercancel', fin);
    }
    L.ventana = app => L.ventanas.filter(v => v.app === app).pop() || null;
    L.abrirApp = (id, o) => {
      o = o || {};
      cerrarCapas();
      const a = L.apps[id];
      if (!a) return null;
      const ya = L.ventana(id);
      let v;
      if (ya && a.unica) { ya.enfocar(); v = ya; if (a.irA) a.irA(L, ya, o); }
      else if (a.abrir) v = a.abrir(L, o);
      else if (id === 'archivos') v = thunar(L, o);
      else if (id === 'terminal') v = ventanaTerminal(L, o);
      else if (id === 'tareas') v = gestorTareas(L, o);
      else if (id === 'editor') v = editor(L, o);
      else if (id === 'calculadora') v = L.abrir({ app: id, titulo: 'Calculadora', icono: 'calculadora', ancho: 34, alto: 62, crear: c => calculadora(c) });
      else v = L.abrir({ app: id, titulo: a.n, icono: a.icono, ancho: 50, alto: 45, crear: c => c.appendChild(el('div', 'w11-vacia', 'En esta simulación no hace falta esta aplicación.')) });
      L.emit('app', { id, origen: o.origen || 'raton', v });
      return v;
    };
    function calculadora(c) {
      c.classList.add('w11-calc');
      const pant = el('div', 'w11-calc__pantalla', '0');
      pant.setAttribute('translate', 'no');
      const teclas = el('div', 'w11-calc__teclas');
      let a = null, opr = null, cur = '0', nuevo = true;
      const calc = () => { const x = parseFloat(a), y = parseFloat(cur); return opr === '+' ? x + y : opr === '−' ? x - y : opr === '×' ? x * y : y === 0 ? NaN : x / y; };
      ['C', '÷', '×', '−', '7', '8', '9', '+', '4', '5', '6', '=', '1', '2', '3', '0'].forEach(k => {
        const b = boton(k, 'w11-calc__t' + (/\d/.test(k) ? '' : ' w11-calc__t--op'));
        b.addEventListener('click', () => {
          if (/\d/.test(k)) { cur = nuevo ? k : (cur === '0' ? k : cur + k); nuevo = false; }
          else if (k === 'C') { a = null; opr = null; cur = '0'; nuevo = true; }
          else if (k === '=') { if (opr) { cur = String(+calc().toFixed(6)); a = null; opr = null; nuevo = true; } }
          else { if (opr && !nuevo) cur = String(+calc().toFixed(6)); a = cur; opr = k; nuevo = true; }
          pant.textContent = cur === 'NaN' ? 'Error' : cur.replace('.', ',');
        });
        teclas.appendChild(b);
      });
      c.append(pant, teclas);
    }

    /* ---- menú de aplicaciones (Whisker) ---- */
    let capaMenu = null;
    function cerrarCapas() {
      capaMenus.innerHTML = '';
      capaMenu = null;
      bMenu.classList.remove('mint__pb--activo');
    }
    L.cerrarCapas = cerrarCapas;
    function toggleMenu(origen) { if (capaMenu) cerrarCapas(); else abrirMenu(origen); }
    function abrirMenu(origen) {
      cerrarCapas();
      L.emit('menu', { origen });
      bMenu.classList.add('mint__pb--activo');
      const m = el('div', 'mint-wm');
      m.setAttribute('role', 'dialog');
      m.setAttribute('aria-label', 'Menú de aplicaciones');
      const cab = el('div', 'mint-wm__cab');
      const usu = el('span', 'mint-wm__usu');
      usu.append(icono('usuario'), el('span', null, L.usuario));
      usu.lastChild.setAttribute('translate', 'no');
      const acc = el('div', 'mint-wm__acc');
      [['config', 'Gestor de configuración', () => L.abrirApp('configuracion', { origen: 'menu' })],
        ['bloquear', 'Bloquear la pantalla', () => { cerrarCapas(); bloquear('menu'); }],
        ['apagar', 'Cerrar la sesión', () => { cerrarCapas(); cerrarSesion('menu'); }]].forEach(([ic, t, f]) => {
        const b = boton('', 'mint-wm__b');
        b.appendChild(icono(ic));
        b.setAttribute('aria-label', t);
        b.title = t;
        b.addEventListener('click', f);
        acc.appendChild(b);
      });
      cab.append(usu, acc);
      const cuerpo = el('div', 'mint-wm__cuerpo');
      const lista = el('div', 'mint-wm__lista');
      const cats = el('div', 'mint-wm__cats');
      cuerpo.append(lista, cats);
      const busca = document.createElement('input');
      busca.type = 'search';
      busca.className = 'mint-wm__buscar';
      busca.placeholder = 'Buscar…';
      busca.setAttribute('aria-label', 'Buscar aplicaciones');
      let cat = 'Favoritos';
      function pintar() {
        lista.innerHTML = '';
        const q = sinTildes(busca.value.trim());
        let res;
        if (q) res = Object.values(L.apps).filter(a => sinTildes(a.n).indexOf(q) !== -1 || (a.buscar || []).some(x => sinTildes(x).indexOf(q) !== -1));
        else if (cat === 'Favoritos') res = favoritos.map(id => L.apps[id]).filter(Boolean);
        else if (cat === 'Todo') res = Object.values(L.apps).sort((a, b) => a.n.localeCompare(b.n));
        else res = Object.values(L.apps).filter(a => a.cat === cat).sort((a, b) => a.n.localeCompare(b.n));
        if (!res.length) lista.appendChild(el('p', 'mint-wm__nada', q ? 'No se ha encontrado nada para «' + busca.value + '».' : 'No hay aplicaciones.'));
        res.forEach(a => {
          const b = boton('', 'mint-wm__app');
          b.append(icono(a.icono), el('span', null, a.n));
          b.addEventListener('click', () => L.abrirApp(a.id, { origen: q ? 'buscar' : 'menu' }));
          b.addEventListener('contextmenu', e => menuApp(e, a));
          lista.appendChild(b);
        });
        cats.innerHTML = '';
        CATEGORIAS.forEach(c => {
          const b = boton(c, 'mint-wm__cat' + (c === cat && !q ? ' mint-wm__cat--actual' : ''));
          b.addEventListener('click', () => { cat = c; busca.value = ''; pintar(); });
          b.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse' && !busca.value) { cat = c; pintar(); } });
          cats.appendChild(b);
        });
      }
      function menuApp(e, a) {
        e.preventDefault(); e.stopPropagation();
        const fav = favoritos.indexOf(a.id) !== -1;
        const pan = lanzadores.indexOf(a.id) !== -1;
        L.menu(e.clientX, e.clientY, [
          fav ? { t: 'Quitar de favoritos', f: () => { favoritos.splice(favoritos.indexOf(a.id), 1); pintar(); L.emit('favorito', { id: a.id, si: false }); } }
            : { t: 'Añadir a favoritos', f: () => { favoritos.push(a.id); pintar(); L.emit('favorito', { id: a.id, si: true }); } },
          { t: 'Añadir al escritorio', f: () => { if (enEscritorio.indexOf(a.id) === -1) enEscritorio.push(a.id); L.pintarIconos(); L.emit('anclar', { id: a.id, si: true, donde: 'escritorio' }); } },
          pan ? { t: 'Quitar del panel', f: () => L.lanzador(a.id, false, 'menu') } : { t: 'Añadir al panel', f: () => L.lanzador(a.id, true, 'menu') },
          { sep: true },
          { t: 'Editar aplicación', off: true },
        ], { encima: true });
      }
      busca.addEventListener('input', pintar);
      busca.addEventListener('keydown', e => {
        if (e.key === 'Enter') { const b = lista.querySelector('button.mint-wm__app'); if (b) b.click(); }
        if (e.key === 'Escape') { e.stopPropagation(); cerrarCapas(); raiz.focus(); }
      });
      m.append(cab, cuerpo, busca);
      capaMenus.appendChild(m);
      capaMenu = m;
      pintar();
      busca.focus();
    }
    L.abrirMenu = abrirMenu;

    /* ---- menú contextual (mismas clases que el de Windows) ---- */
    L.menu = (x, y, items, o) => {
      o = o || {};
      if (!o.sub) { capaMenus.querySelectorAll('.w11-menu').forEach(m => m.remove()); if (!o.encima && capaMenu) cerrarCapas(); }
      const m = el('div', 'w11-menu mint-menu');
      m.setAttribute('role', 'menu');
      items.forEach(it => {
        if (!it) return;
        if (it.sep) { m.appendChild(el('div', 'w11-menu__sep')); return; }
        const b = boton('', 'w11-menu__item');
        b.setAttribute('role', 'menuitem');
        const ic = el('span', 'w11-menu__icono');
        if (it.icono) ic.appendChild(icono(it.icono));
        if (it.marca) ic.textContent = '✓';
        b.append(ic, el('span', 'w11-menu__texto', it.t));
        if (it.noTraducir) b.children[1].setAttribute('translate', 'no');
        if (it.atajo) { const a = el('span', 'w11-menu__atajo', it.atajo); a.setAttribute('translate', 'no'); b.appendChild(a); }
        if (it.sub) { b.appendChild(el('span', 'w11-menu__flecha', '›')); b.setAttribute('aria-haspopup', 'true'); }
        if (it.off) b.disabled = true;
        b.addEventListener('click', ev => {
          ev.stopPropagation();
          if (it.sub) { abrirSub(b, it.sub); return; }
          cerrarMenus();
          if (it.f) it.f();
        });
        if (it.sub) b.addEventListener('pointerenter', ev => { if (ev.pointerType === 'mouse') abrirSub(b, it.sub); });
        m.appendChild(b);
      });
      m.dataset.n = String(Math.random()).slice(2, 8);
      if (o.sub) m.classList.add('w11-menu--sub');
      capaMenus.appendChild(m);
      const caja = escena.getBoundingClientRect();
      const ancho = m.offsetWidth, alto = m.offsetHeight;
      let left = x - caja.left, top = y - caja.top;
      if (o.sub) { left = x; top = y; }
      if (left + ancho > caja.width - 4) left = o.sub ? o.izq - ancho : Math.max(4, caja.width - ancho - 4);
      if (top + alto > caja.height - 4) top = Math.max(4, (o.encima && !o.sub ? top - alto : caja.height - alto - 4));
      m.style.left = Math.max(4, left) + 'px';
      m.style.top = Math.max(4, top) + 'px';
      const primero = m.querySelector('button:not(:disabled)');
      if (primero && !o.sinFoco) primero.focus({ preventScroll: true });
      function abrirSub(b, sub) {
        capaMenus.querySelectorAll('.w11-menu--sub').forEach(s => { if (s.dataset.de === m.dataset.n) s.remove(); });
        const r = b.getBoundingClientRect();
        const sm = L.menu(r.right - caja.left - 2, r.top - caja.top - 4, sub, { sub: true, izq: r.left - caja.left + 2 });
        sm.dataset.de = m.dataset.n;
      }
      m.addEventListener('keydown', ev => {
        const bs = Array.from(m.querySelectorAll('button:not(:disabled)'));
        const i = bs.indexOf(document.activeElement);
        if (ev.key === 'ArrowDown') { ev.preventDefault(); ev.stopPropagation(); (bs[i + 1] || bs[0]).focus(); }
        else if (ev.key === 'ArrowUp') { ev.preventDefault(); ev.stopPropagation(); (bs[i - 1] || bs[bs.length - 1]).focus(); }
        else if (ev.key === 'ArrowRight' && document.activeElement.getAttribute('aria-haspopup')) { ev.preventDefault(); ev.stopPropagation(); document.activeElement.click(); }
        else if (ev.key === 'ArrowLeft' && o.sub) { ev.preventDefault(); ev.stopPropagation(); m.remove(); }
        else if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); cerrarMenus(); raiz.focus(); }
      });
      return m;
    };
    function cerrarMenus() { capaMenus.querySelectorAll('.w11-menu').forEach(m => m.remove()); }
    L.cerrarMenus = cerrarMenus;
    escena.addEventListener('pointerdown', e => {
      if (!e.target.closest('.w11-menu')) cerrarMenus();
      if (capaMenu && !e.target.closest('.mint-wm') && !e.target.closest('.mint__pb--menu') && !e.target.closest('.w11-menu')) cerrarCapas();
    });

    /* ---- diálogos, contraseña y notificaciones ---- */
    L.dialogo = d => {
      const velo = el('div', 'w11-dlg__velo');
      const caja = el('div', 'w11-dlg mint-dlg');
      caja.setAttribute('role', 'alertdialog');
      caja.setAttribute('aria-modal', 'true');
      const cab = el('div', 'w11-dlg__cab mint-dlg__cab');
      cab.appendChild(el('span', null, d.titulo || ''));
      const cerrarX = boton('', 'w11-v__b w11-v__b--cerrar');
      cerrarX.setAttribute('aria-label', 'Cerrar');
      cerrarX.innerHTML = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.2 2.2l5.6 5.6M7.8 2.2L2.2 7.8"/></svg>';
      cab.appendChild(cerrarX);
      const cuerpo = el('div', 'w11-dlg__cuerpo');
      if (d.icono) cuerpo.appendChild(icono(d.icono, 'w11-dlg__icono'));
      const txt = el('div', 'w11-dlg__texto');
      if (d.texto) (Array.isArray(d.texto) ? d.texto : [d.texto]).forEach(t => txt.appendChild(el('p', null, t)));
      cuerpo.appendChild(txt);
      if (d.crear) d.crear(txt);
      const pie = el('div', 'w11-dlg__pie');
      const cerrar = () => { velo.remove(); raiz.focus(); };
      const bots = (d.botones || [{ t: 'Aceptar', primario: true }]).map(b => {
        const x = boton(b.t, 'w11-btn' + (b.primario ? ' w11-btn--primario' : ''));
        x.addEventListener('click', () => { if (b.f && b.f(txt) === false) return; cerrar(); });
        pie.appendChild(x);
        return x;
      });
      cerrarX.addEventListener('click', () => { if (d.alCerrar) d.alCerrar(); cerrar(); });
      caja.append(cab, cuerpo, pie);
      velo.appendChild(caja);
      velo.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); cerrarX.click(); } });
      escena.appendChild(velo);
      const campo = caja.querySelector('input:not([type=checkbox]):not([type=radio]), select');
      const pf = bots.find((b, i) => (d.botones || [])[i] && d.botones[i].primario) || bots[0];
      if (campo) { campo.focus({ preventScroll: true }); if (campo.select) campo.select(); }
      else if (pf) pf.focus({ preventScroll: true });
      return { cerrar, caja: txt, botones: bots };
    };
    // Ventana de «Autenticación» (polkit): pide la contraseña para algo de administrador
    L.pedirClave = (que, siOk, siNo) => {
      let intentos = 0;
      const d = L.dialogo({
        titulo: 'Autenticación',
        icono: 'candado',
        texto: ['Se necesita autenticación', que],
        crear(t) {
          const l = el('label', 'mint-campo');
          l.append(el('span', null, 'Contraseña para ' + L.usuario + ':'));
          const i = document.createElement('input');
          i.type = 'password';
          i.className = 'mint-input';
          i.autocomplete = 'off';
          l.appendChild(i);
          t.appendChild(l);
          t._i = i;
          t._err = el('p', 'mint-dlg__error');
          t._err.setAttribute('role', 'alert');
          t.appendChild(t._err);
          i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); d.botones[1].click(); } });
        },
        botones: [
          { t: 'Cancelar', f: () => { L.emit('clave', { ok: false, cancelada: true, que }); if (siNo) siNo(); } },
          { t: 'Autenticar', primario: true, f: t => {
            if (t._i.value !== L.clave) {
              intentos++;
              t._err.textContent = 'Lo siento, eso no ha funcionado. Vuelve a probar.';
              t._i.value = '';
              t._i.focus();
              L.emit('clave', { ok: false, que });
              if (intentos >= 3) { L.notificacion('Autenticación', 'Has fallado tres veces: no se ha hecho nada.', 'error'); if (siNo) siNo(); return true; }
              return false;
            }
            L.emit('clave', { ok: true, que });
            setTimeout(() => siOk && siOk(), 0);
          } },
        ],
        alCerrar: () => { if (siNo) siNo(); },
      });
      return d;
    };
    L.notificacion = (titulo, texto, ico) => {
      const t = el('div', 'w11-toast mint-toast');
      t.setAttribute('role', 'status');
      t.append(icono(ico || 'info', 'w11-toast__ico'));
      const c = el('div');
      c.append(el('p', 'w11-toast__titulo', titulo), el('p', 'w11-toast__texto', texto || ''));
      t.appendChild(c);
      toasts.innerHTML = '';
      toasts.appendChild(t);
      clearTimeout(L._toast);
      L._toast = setTimeout(() => t.remove(), 6500);
    };

    /* ---- escritorio, iconos ---- */
    function mostrarEscritorio(origen) {
      const visibles = L.ventanas.filter(v => v.estado !== 'min' && (v.area === L.area || v.fija));
      if (visibles.length) { L._escondidas = visibles; visibles.forEach(v => v.minimizar()); }
      else if (L._escondidas) { L._escondidas.filter(v => L.ventanas.indexOf(v) !== -1).forEach(v => v.enfocar()); L._escondidas = null; }
      L.emit('escritorio', { origen, ocultas: visibles.length });
    }
    L.mostrarEscritorio = mostrarEscritorio;
    const escDir = () => hijo(L.casa, 'Escritorio');
    L.pintarIconos = () => {
      iconos.innerHTML = '';
      const lista = [
        { n: 'Sistema de archivos', icono: 'raiz', abrir: () => thunar(L, { ruta: '/', origen: 'escritorio' }) },
        { n: 'Carpeta personal', icono: 'casa', abrir: () => thunar(L, { ruta: ruta(L.casa), origen: 'escritorio' }) },
        { n: 'Papelera', icono: L.papelera.length ? 'papelera-llena' : 'papelera', abrir: () => thunar(L, { papelera: true, origen: 'escritorio' }) },
      ];
      if (L.usb && L.usb.montado) lista.push({ n: L.usb.etiqueta, icono: 'usb', abrir: () => thunar(L, { ruta: ruta(L.usb.nodo), origen: 'escritorio' }), menu: (x, y) => L.menu(x, y, [{ t: 'Abrir', f: () => thunar(L, { ruta: ruta(L.usb.nodo) }) }, { t: 'Expulsar el volumen', icono: 'expulsar', f: () => L.expulsar('escritorio') }]) });
      enEscritorio.forEach(id => { const a = L.apps[id]; if (a) lista.push({ n: a.n, icono: a.icono, abrir: () => L.abrirApp(id, { origen: 'escritorio' }) }); });
      const ed = escDir();
      if (ed) ed.hijos.filter(h => L.est.verOcultos || h.n[0] !== '.').forEach(h => lista.push({ n: h.n, icono: iconoDe(h), abrir: () => abrirNodo(L, h, 'escritorio') }));
      lista.forEach(it => {
        const b = boton('', 'w11-icono mint-icono');
        b.append(icono(it.icono));
        const n = el('span', 'w11-icono__n', it.n);
        n.setAttribute('translate', 'no');
        b.appendChild(n);
        b.setAttribute('aria-label', it.n);
        let ultimo = 0;
        b.addEventListener('click', () => {
          const ahora = Date.now();
          if (ahora - ultimo < 450) { ultimo = 0; it.abrir && it.abrir(); return; }
          ultimo = ahora;
          iconos.querySelectorAll('.w11-icono--elegido').forEach(x => x.classList.remove('w11-icono--elegido'));
          b.classList.add('w11-icono--elegido');
        });
        b.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); it.abrir && it.abrir(); } });
        b.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); if (it.menu) it.menu(e.clientX, e.clientY); else L.menu(e.clientX, e.clientY, [{ t: 'Abrir', f: it.abrir }]); });
        iconos.appendChild(b);
      });
    };
    iconos.addEventListener('contextmenu', e => {
      if (e.target.closest('.w11-icono')) return;
      e.preventDefault();
      const ed = escDir();
      L.menu(e.clientX, e.clientY, [
        { t: 'Crear carpeta…', icono: 'carpeta', f: () => crearCarpeta(L, ed, 'escritorio') },
        { t: 'Crear un documento', sub: [{ t: 'Documento vacío', f: () => crearDocumento(L, ed, 'escritorio') }] },
        { t: 'Abrir terminal aquí', icono: 'terminal', f: () => L.abrirApp('terminal', { cwd: ed, origen: 'escritorio' }) },
        { sep: true },
        { t: 'Pegar', icono: 'pegar', off: !L.portapapeles, f: () => pegar(L, ed, 'escritorio') },
        { sep: true },
        { t: 'Configuración del escritorio…', icono: 'config', f: () => L.notificacion('Simulación', 'Aquí no hace falta cambiar el fondo de escritorio.') },
      ]);
    });
    fondo.addEventListener('contextmenu', e => { e.preventDefault(); iconos.dispatchEvent(new MouseEvent('contextmenu', e)); });

    /* ---- refrescar todo lo que enseña archivos ---- */
    L.refrescar = () => {
      L.ventanas.forEach(v => { if (v.thunar) v.thunar.pintar(); });
      L.pintarIconos();
      L.emit('cambio', {});
    };
    L.terminales = () => L.ventanas.filter(v => v.term).map(v => v.term);

    /* ---- Alt + Tab ---- */
    let altTab = null;
    function pasoAltTab() {
      const orden = L.ventanas.filter(v => v.area === L.area || v.fija).sort((a, b) => (b.el.style.zIndex | 0) - (a.el.style.zIndex | 0));
      if (!orden.length) return;
      if (!altTab) {
        altTab = { orden, i: orden.length > 1 ? 1 : 0, caja: el('div', 'w11-alttab mint-alttab') };
        altTab.caja.setAttribute('role', 'listbox');
        altTab.caja.setAttribute('aria-label', 'Cambiar de ventana');
        capaMenus.appendChild(altTab.caja);
      } else altTab.i = (altTab.i + 1) % altTab.orden.length;
      altTab.caja.innerHTML = '';
      altTab.orden.forEach((v, i) => {
        const b = boton('', 'mint-alttab__v' + (i === altTab.i ? ' mint-alttab__v--elegida' : ''));
        b.setAttribute('role', 'option');
        b.setAttribute('aria-selected', String(i === altTab.i));
        b.append(icono(v.def.icono || 'app'));
        b.title = v.def.titulo;
        b.addEventListener('click', () => { altTab.i = i; acabaAltTab('raton'); });
        altTab.caja.appendChild(b);
      });
      altTab.caja.appendChild(el('p', 'mint-alttab__t', altTab.orden[altTab.i].def.titulo));
    }
    function acabaAltTab(origen) {
      if (!altTab) return;
      const v = altTab.orden[altTab.i];
      altTab.caja.remove();
      altTab = null;
      if (v) { v.enfocar(); L.emit('alttab', { v, origen: origen || 'atajo' }); }
    }

    /* ---- bloquear, cerrar sesión, apagar ---- */
    function bloquear(origen) {
      const capa = el('div', 'mint-bloqueo');
      capa.append(el('p', 'mint-bloqueo__hora', op.hora || '16:05'), el('p', 'mint-bloqueo__fecha', op.fechaLarga || 'lunes, 1 de febrero'));
      const caja = el('div', 'mint-bloqueo__caja');
      caja.append(icono('usuario', 'mint-bloqueo__ico'), el('p', 'mint-bloqueo__usu', L.usuario));
      caja.children[1].setAttribute('translate', 'no');
      const i = document.createElement('input');
      i.type = 'password';
      i.className = 'mint-input';
      i.placeholder = 'Contraseña';
      i.setAttribute('aria-label', 'Contraseña de ' + L.usuario);
      const err = el('p', 'mint-bloqueo__err');
      err.setAttribute('role', 'alert');
      const b = boton('Desbloquear', 'w11-btn w11-btn--primario');
      const prueba = () => {
        if (i.value === L.clave) { capa.remove(); raiz.focus(); L.emit('desbloquear', { origen }); return; }
        err.textContent = 'Contraseña incorrecta. Prueba otra vez.';
        i.value = '';
        i.focus();
        L.emit('desbloquear', { ok: false });
      };
      b.addEventListener('click', prueba);
      i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); prueba(); } });
      caja.append(i, b, err);
      capa.appendChild(caja);
      escena.appendChild(capa);
      i.focus({ preventScroll: true });
      L.emit('bloquear', { origen });
    }
    L.bloquear = bloquear;
    function cerrarSesion(origen) {
      L.emit('salir', { origen });
      const capa = el('div', 'mint-salir');
      const caja = el('div', 'mint-salir__caja');
      caja.setAttribute('role', 'dialog');
      caja.setAttribute('aria-label', 'Cerrar la sesión para ' + L.usuario);
      caja.appendChild(el('p', 'mint-salir__titulo', 'Cerrar la sesión para ' + L.usuario));
      const fila = el('div', 'mint-salir__fila');
      const quitar = () => { capa.remove(); raiz.focus(); };
      [['salir', 'Cerrar la sesión'], ['recargar', 'Reiniciar'], ['apagar', 'Apagar'], ['bloquear', 'Suspender'], ['usuario', 'Cambiar de usuario']].forEach(([ic, t]) => {
        const b = boton('', 'mint-salir__b');
        b.append(icono(ic), el('span', null, t));
        b.addEventListener('click', () => {
          quitar();
          L.emit('energia', { que: t, origen });
          if (t === 'Apagar' || t === 'Reiniciar') apagar(t === 'Reiniciar');
          else if (t === 'Suspender') bloquear('suspender');
          else L.notificacion('Simulación', 'Aquí no hace falta: sigue con la misión.');
        });
        fila.appendChild(b);
      });
      const c = boton('Cancelar', 'w11-btn');
      c.addEventListener('click', () => { quitar(); L.emit('energia', { que: 'Cancelar', origen }); });
      caja.append(fila, c);
      capa.appendChild(caja);
      capa.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); c.click(); } });
      escena.appendChild(capa);
      fila.querySelector('button').focus({ preventScroll: true });
    }
    L.cerrarSesion = cerrarSesion;
    function apagar(reiniciar) {
      const capa = el('div', 'mint-apagado');
      capa.appendChild(el('p', 'mint-apagado__t', reiniciar ? 'Reiniciando…' : 'Apagando…'));
      escena.appendChild(capa);
      L.ventanas.slice().forEach(v => v.cerrar('apagar'));
      setTimeout(() => {
        if (!raiz.isConnected) return;
        capa.innerHTML = '';
        if (reiniciar) { capa.remove(); L.emit('encendido', {}); return; }
        const b = boton('⏻', 'mint-apagado__on');
        b.setAttribute('aria-label', 'Encender el ordenador');
        capa.append(el('p', 'mint-apagado__t', 'El ordenador está apagado.'), b);
        b.addEventListener('click', () => { capa.remove(); raiz.focus(); L.emit('encendido', {}); });
        b.focus({ preventScroll: true });
      }, 1600);
    }

    /* ---- atajos de Linux Mint (Xfce) ---- */
    const SISTEMA = {
      'Windows': () => toggleMenu('atajo'),
      'Ctrl + Esc': () => toggleMenu('atajo'),
      'Windows + E': () => L.abrirApp('archivos', { origen: 'atajo' }),
      'Ctrl + Alt + T': () => L.abrirApp('terminal', { origen: 'atajo' }),
      'Ctrl + Alt + D': () => mostrarEscritorio('atajo'),
      'Ctrl + Alt + →': () => L.irArea(L.area + 1, 'atajo'),
      'Ctrl + Alt + ←': () => L.irArea(L.area - 1, 'atajo'),
      'Ctrl + Alt + Shift + →': () => { const v = L.activa; if (v) { L.moverArea(v, L.area + 1, 'atajo'); L.irArea(L.area + 1, 'atajo'); v.enfocar(); } },
      'Ctrl + Alt + Shift + ←': () => { const v = L.activa; if (v) { L.moverArea(v, L.area - 1, 'atajo'); L.irArea(L.area - 1, 'atajo'); v.enfocar(); } },
      'Windows + ←': () => L.activa && L.activa.ajustar(L.activa.estado === 'der' ? 'normal' : 'izq', 'atajo'),
      'Windows + →': () => L.activa && L.activa.ajustar(L.activa.estado === 'izq' ? 'normal' : 'der', 'atajo'),
      'Alt + F10': () => L.activa && L.activa.maximizar('atajo'),
      'Alt + F9': () => L.activa && L.activa.minimizar(),
      'Alt + Tab': () => pasoAltTab(),
      'Alt + F4': () => {
        if (L.activa && L.activa.estado !== 'min') { const v = L.activa; v.cerrar('atajo'); L.emit('altf4', { v }); return; }
        cerrarSesion('atajo');
      },
      'Ctrl + Alt + L': () => bloquear('atajo'),
      'Ctrl + Alt + Supr': () => cerrarSesion('atajo'),
      'Ctrl + Shift + Esc': () => L.abrirApp('tareas', { origen: 'atajo' }),
      'Esc': () => { if (capaMenus.childNodes.length) { cerrarMenus(); cerrarCapas(); return true; } return false; },
    };
    L.pulsar = (c, info) => {
      info = info || {};
      if (altTab && c !== 'Alt + Tab') acabaAltTab();
      const campo = L._campo && document.body.contains(L._campo) && !L._campo.disabled ? L._campo : null;
      // teclas que se queda un campo especial (la terminal: Tab, ↑, ↓, Ctrl + C…)
      if (info.pantalla && campo && campo._teclas && campo._teclas(c) === true) return true;
      if (info.texto && campo) {
        const t = campo, i = t.selectionStart != null ? t.selectionStart : t.value.length;
        t.value = t.value.slice(0, i) + info.texto + t.value.slice(t.selectionEnd != null ? t.selectionEnd : i);
        try { t.setSelectionRange(i + 1, i + 1); } catch (_) { /* nada */ }
        t.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }
      if (c === 'Retroceso' && campo && info.pantalla) {
        const t = campo, i = t.selectionStart, j = t.selectionEnd;
        if (i != null) { const a = i === j ? Math.max(0, i - 1) : i; t.value = t.value.slice(0, a) + t.value.slice(j); t.setSelectionRange(a, a); t.dispatchEvent(new Event('input', { bubbles: true })); return true; }
      }
      if (info.pantalla && campo && /^Ctrl \+ [CXVA]$/.test(c)) {
        const t = campo, i = t.selectionStart, j = t.selectionEnd, k = c.slice(-1);
        if (k === 'A') { t.focus(); t.select(); return true; }
        if (k === 'C' || k === 'X') {
          if (i != null && j > i) L._texto = t.value.slice(i, j);
          if (k === 'X' && i != null && j > i && !t.readOnly) { t.value = t.value.slice(0, i) + t.value.slice(j); t.setSelectionRange(i, i); t.dispatchEvent(new Event('input', { bubbles: true })); }
          return true;
        }
        if (k === 'V' && L._texto && !t.readOnly && i != null) {
          t.value = t.value.slice(0, i) + L._texto + t.value.slice(j);
          const p = i + L._texto.length;
          t.setSelectionRange(p, p);
          t.dispatchEvent(new Event('input', { bubbles: true }));
        }
        return true;
      }
      if (c === 'Intro' && campo && info.pantalla) {
        campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        return true;
      }
      let hecho = false;
      if (L._capturar && L._capturar(c, info)) hecho = true;
      if (!hecho && L.activa && L.activa.estado !== 'min' && L.activa.def.onTecla && L.activa.def.onTecla(c, info) === true) hecho = true;
      if (!hecho && op.onTecla && op.onTecla(c, info) === true) hecho = true;
      if (!hecho && SISTEMA[c]) { const r = SISTEMA[c](info); hecho = r !== false; }
      L.emit('atajo', { combo: c, hecho, pantalla: !!info.pantalla });
      return hecho;
    };
    raiz.addEventListener('focusin', e => {
      if (e.target.matches('input[type=text], input[type=search], input[type=password], input:not([type]), textarea')) L._campo = e.target;
    });
    raiz.addEventListener('keydown', e => {
      const c = comboDeEvento(e);
      if (!c) return;
      const enCampo = e.target.matches('input, textarea, select');
      if (enCampo && !e.ctrlKey && !e.altKey && !e.metaKey && ['Esc', 'Tab'].indexOf(c) === -1) return;
      if (enCampo && e.ctrlKey && !e.altKey && /^Ctrl \+ [ACVXZY]$/.test(c)) return;
      if (!enCampo && e.target !== raiz && ['Intro', 'Espacio'].indexOf(c) !== -1 && e.target.matches('button')) return;
      if (!enCampo && c === 'Tab') return;
      if (L.pulsar(c, { fisico: true })) e.preventDefault();
    });
    const copia = () => { const t = L._campo; if (t && t.selectionEnd > t.selectionStart) L._texto = t.value.slice(t.selectionStart, t.selectionEnd); };
    raiz.addEventListener('copy', copia);
    raiz.addEventListener('cut', copia);
    raiz.addEventListener('keyup', e => { if (e.key === 'Alt' && altTab) acabaAltTab(); });
    raiz.addEventListener('pointerdown', e => {
      if (!e.target.closest('input, textarea, select, button, [tabindex]:not(.w11)')) raiz.focus({ preventScroll: true });
    });

    /* ---- teclado en pantalla (el del Windows de mentira) ---- */
    const cabT = el('div', 'w11__teclado-cab');
    const bTec = boton('⌨️ Teclado en pantalla', 'lab__boton');
    bTec.setAttribute('aria-expanded', 'true');
    cabT.appendChild(bTec);
    const avT = el('div', 'w11__teclado-aviso');
    avT.setAttribute('role', 'note');
    const l1 = el('p', 'w11__teclado-l1');
    l1.append(el('span', 'w11__teclado-ico', '⌨️'), el('strong', null, 'Para escribir, usa tu teclado (toca antes la pantalla de Linux).'));
    const l2 = el('p', 'w11__teclado-l2');
    l2.appendChild(el('strong', null, '👇 Para los atajos (Ctrl + Alt + T, Alt + Tab, la tecla Windows…), usa el teclado de abajo.'));
    const l3 = el('p', 'w11__teclado-l3', 'Ctrl, Alt, Shift y la tecla Windows (en Linux se llama Super): tócalas primero y después la otra tecla.');
    avT.append(l1, l2, l3);
    ayudaTeclado.append(avT, cabT);
    const T = teclado(ayudaTeclado, (c, info) => L.pulsar(c, info), (m) => { if (m === 'Alt' && altTab) acabaAltTab(); });
    L.teclado = T;
    if (op.teclado === false) { T.el.hidden = true; bTec.setAttribute('aria-expanded', 'false'); }
    bTec.addEventListener('click', () => { T.el.hidden = !T.el.hidden; bTec.setAttribute('aria-expanded', String(!T.el.hidden)); });

    pintarPanel();
    L.pintarIconos();
    return L;
  }

  /* ============================================================
     Archivos: crear, pegar, borrar… (los usan Thunar y el escritorio)
     ============================================================ */
  function nombreLibre(d, base) {
    if (!hijo(d, base)) return base;
    for (let i = 2; ; i++) { const n = base + ' ' + i; if (!hijo(d, n)) return n; }
  }
  function sinPermiso(L, d, origen) {
    if (L.puede(d, 'w')) return false;
    L.dialogo({ titulo: 'Error', icono: 'error', texto: ['No se ha podido crear ni cambiar nada en «' + d.n + '».', 'Permiso denegado: esta carpeta es de ' + d.dueno + '. Solo puedes escribir en tu carpeta personal (y en lo que te dejen sus permisos).'] });
    L.emit('fs', { tipo: 'error', motivo: 'permiso', nodo: d, origen });
    return true;
  }
  function pedirNombre(L, titulo, inicial, alAceptar, opciones) {
    L.dialogo({
      titulo,
      crear(t) {
        const l = el('label', 'mint-campo');
        l.append(el('span', null, (opciones && opciones.etiqueta) || 'Escriba un nombre nuevo:'));
        const i = document.createElement('input');
        i.type = 'text';
        i.className = 'mint-input';
        i.value = inicial;
        i.spellcheck = false;
        i.setAttribute('translate', 'no');
        l.appendChild(i);
        t.appendChild(l);
        t._i = i;
        t._err = el('p', 'mint-dlg__error');
        t._err.setAttribute('role', 'alert');
        t.appendChild(t._err);
        setTimeout(() => {
          i.focus();
          const p = (opciones && opciones.sinExt) ? i.value.lastIndexOf('.') : -1;
          try { i.setSelectionRange(0, p > 0 ? p : i.value.length); } catch (_) { /* nada */ }
        }, 0);
        i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); t.closest('.w11-dlg').querySelector('.w11-btn--primario').click(); } });
      },
      botones: [{ t: 'Cancelar' }, { t: (opciones && opciones.boton) || 'Crear', primario: true, f: t => {
        const v = t._i.value;
        if (!v.trim()) { t._err.textContent = 'El nombre no puede estar vacío.'; return false; }
        if (v.indexOf('/') !== -1) { t._err.textContent = 'El nombre no puede llevar «/»: en Linux la barra separa las carpetas de una ruta.'; return false; }
        const r = alAceptar(v);
        if (typeof r === 'string') { t._err.textContent = r; return false; }
      } }],
    });
  }
  function crearCarpeta(L, d, origen) {
    if (sinPermiso(L, d, origen)) return;
    pedirNombre(L, 'Carpeta nueva', nombreLibre(d, 'Carpeta sin título'), v => {
      if (hijo(d, v)) return 'Ya hay algo que se llama «' + v + '» en esta carpeta.';
      const n = dir(v, [], { dueno: L.usuario, grupo: L.usuario });
      d.hijos.push(n); enlazar(n, d);
      L.emit('fs', { tipo: 'nueva', nodo: n, origen });
      L.refrescar();
    }, { etiqueta: 'Escriba un nombre para la carpeta nueva:' });
  }
  function crearDocumento(L, d, origen) {
    if (sinPermiso(L, d, origen)) return;
    pedirNombre(L, 'Documento nuevo', nombreLibre(d, 'Archivo sin título'), v => {
      if (hijo(d, v)) return 'Ya hay algo que se llama «' + v + '» en esta carpeta.';
      const n = arch(v, 0, { dueno: L.usuario, grupo: L.usuario, contenido: '' });
      d.hijos.push(n); enlazar(n, d);
      L.emit('fs', { tipo: 'nuevo', nodo: n, origen });
      L.refrescar();
    }, { etiqueta: 'Escriba un nombre para el documento nuevo:' });
  }
  function renombrar(L, n, origen) {
    if (sinPermiso(L, n._p, origen)) return;
    pedirNombre(L, 'Renombrar «' + n.n + '»', n.n, v => {
      if (v === n.n) return;
      const otro = hijo(n._p, v);
      if (otro) return 'Ya hay algo que se llama «' + v + '». Ojo: en Linux «Foto.png» y «foto.png» son dos archivos distintos.';
      const antes = n.n;
      n.n = v;
      L.emit('fs', { tipo: 'renombrar', nodo: n, antes, origen });
      L.refrescar();
    }, { boton: 'Renombrar', sinExt: !n.dir, etiqueta: 'Escriba un nombre nuevo:' });
  }
  function aPapelera(L, nodos, origen) {
    nodos = nodos.filter(Boolean);
    if (!nodos.length) return;
    const d = nodos[0]._p;
    if (sinPermiso(L, d, origen)) return;
    if (L.usb && L.usb.nodo && L.esDentro(d, L.usb.nodo)) {
      L.dialogo({ titulo: 'Eliminar', icono: 'aviso', texto: ['Este USB no tiene papelera: lo que borres de él se borra para siempre.', '¿Seguro que quieres eliminar ' + (nodos.length > 1 ? 'los ' + nodos.length + ' elementos' : '«' + nodos[0].n + '»') + '?'], botones: [{ t: 'Cancelar' }, { t: 'Eliminar', primario: true, f: () => borrar(L, nodos, origen, true) }] });
      return;
    }
    nodos.forEach(n => { d.hijos.splice(d.hijos.indexOf(n), 1); L.papelera.push({ n, de: d }); });
    L.emit('fs', { tipo: 'papelera', nodos, origen });
    L.refrescar();
  }
  function borrar(L, nodos, origen, yaPreguntado) {
    const d = nodos[0]._p;
    if (sinPermiso(L, d, origen)) return;
    const hazlo = () => {
      nodos.forEach(n => { const i = d.hijos.indexOf(n); if (i !== -1) d.hijos.splice(i, 1); });
      L.emit('fs', { tipo: 'eliminar', nodos, origen });
      L.refrescar();
    };
    if (yaPreguntado) { hazlo(); return; }
    L.dialogo({ titulo: 'Eliminar', icono: 'aviso', texto: ['¿Seguro que quieres eliminar para siempre ' + (nodos.length > 1 ? 'los ' + nodos.length + ' elementos elegidos' : '«' + nodos[0].n + '»') + '?', 'Si lo eliminas, no irá a la papelera: se perderá para siempre.'], botones: [{ t: 'Cancelar' }, { t: 'Eliminar', primario: true, f: hazlo }] });
  }
  function pegar(L, d, origen) {
    const pp = L.portapapeles;
    if (!pp || !pp.nodos.length) return;
    if (sinPermiso(L, d, origen)) return;
    if (pp.nodos.some(n => n.dir && L.esDentro(d, n))) { L.dialogo({ titulo: 'Error', icono: 'error', texto: 'No se puede meter una carpeta dentro de sí misma.' }); return; }
    if (L.usb && L.usb.nodo && L.esDentro(d, L.usb.nodo)) {
      const cab = pp.nodos.reduce((a, n) => a + peso(n), 0);
      if (cab > libreDe(L.usb.capacidad, L.usb.nodo)) { L.dialogo({ titulo: 'Error', icono: 'error', texto: 'No queda espacio en «' + L.usb.etiqueta + '».' }); return; }
    }
    const hechos = [];
    pp.nodos.forEach(n => {
      let nuevo;
      const ya = hijo(d, n.n);
      if (pp.cortar) {
        if (n._p === d) return;
        if (ya) { L.notificacion('No se ha movido «' + n.n + '»', 'Ya hay un elemento con ese nombre en la carpeta.', 'aviso'); return; }
        n._p.hijos.splice(n._p.hijos.indexOf(n), 1);
        nuevo = n;
      } else {
        nuevo = clonar(n);
        if (ya) nuevo.n = nuevo.dir ? nombreLibre(d, n.n + ' (copia)') : n.n.replace(/(\.[^.]+)?$/, ' (copia)$1');
        const quien = L.usuario;
        (function dueno(x) { x.dueno = quien; x.grupo = quien; (x.hijos || []).forEach(dueno); })(nuevo);
      }
      d.hijos.push(nuevo); enlazar(nuevo, d);
      hechos.push(nuevo);
    });
    L.emit('fs', { tipo: pp.cortar ? 'mover' : 'copiar', nodos: hechos, origenes: pp.nodos, destino: d, origen });
    if (pp.cortar) L.portapapeles = null;
    L.refrescar();
  }
  function abrirNodo(L, n, origen) {
    if (n.dir) { thunar(L, { ruta: ruta(n), origen }); return; }
    const e = ext(n.n);
    L.emit('fs', { tipo: 'abrir', nodo: n, origen });
    if (['txt', 'md', 'sh', ''].indexOf(e) !== -1 || n.contenido != null) { editor(L, { nodo: n, origen }); return; }
    const con = { jpg: 'Visor de imágenes', jpeg: 'Visor de imágenes', png: 'Visor de imágenes', webp: 'Visor de imágenes', pdf: 'Visor de documentos', mp4: 'Celluloid', mkv: 'Celluloid', mp3: 'Rhythmbox', ogg: 'Rhythmbox', odt: 'LibreOffice Writer', docx: 'LibreOffice Writer', zip: 'Gestor de archivadores', gz: 'Gestor de archivadores', deb: 'Instalador de paquetes' }[e];
    L.abrir({ app: 'visor', titulo: n.n, tituloNoTraducir: true, icono: iconoDe(n), ancho: 46, alto: 50, crear: c => {
      c.classList.add('w11-visor');
      c.append(icono(iconoDe(n), 'w11-visor__ico'), el('p', null, n.n), el('p', 'w11-visor__t', con ? 'Se abre con ' + con + '. En esta simulación no hace falta abrirlo.' : 'En esta simulación no hace falta abrirlo.'));
      c.children[1].setAttribute('translate', 'no');
    } });
  }

  /* ---------- Editor de textos (Mousepad) ---------- */
  function editor(L, o) {
    o = o || {};
    const n = o.nodo;
    return L.abrir({ app: 'editor', titulo: (n ? n.n : 'Sin título 1') + ' - Mousepad', tituloNoTraducir: !!n, icono: 'editor', ancho: 56, alto: 64, crear: (c, v) => {
      c.classList.add('w11-bloc');
      const menu = el('div', 'w11-bloc__menu');
      ['Archivo', 'Editar', 'Buscar', 'Ver', 'Documento', 'Ayuda'].forEach(t => menu.appendChild(el('span', null, t)));
      const t = document.createElement('textarea');
      t.className = 'w11-bloc__texto';
      t.spellcheck = false;
      t.value = n ? (n.contenido || '') : (o.texto || '');
      t.readOnly = !!(n && !L.puede(n, 'w'));
      t.setAttribute('aria-label', 'Texto de ' + (n ? n.n : 'Sin título'));
      const estado = el('div', 'w11-bloc__estado', t.readOnly ? 'Solo lectura: no tienes permiso para cambiar este archivo.' : 'Ctrl + S para guardar');
      t.addEventListener('input', () => { v._cambiado = true; });
      c.append(menu, t, estado);
      v.def.onTecla = combo => {
        if (combo !== 'Ctrl + S' || !n) return false;
        if (t.readOnly) { L.dialogo({ titulo: 'Error', icono: 'error', texto: 'No se ha podido guardar «' + n.n + '»: permiso denegado.' }); return true; }
        n.contenido = t.value; n.tam = t.value.length; v._cambiado = false;
        estado.textContent = 'Guardado.';
        L.emit('fs', { tipo: 'guardar', nodo: n });
        return true;
      };
    } });
  }

  /* ============================================================
     Gestor de archivos (Thunar)
     ============================================================ */
  function thunar(L, o) {
    o = o || {};
    const inicio = o.ruta ? (L.resolver(o.ruta).nodo || L.casa) : (o.nodo || L.casa);
    const T = { cwd: inicio, papelera: !!o.papelera, atras: [], adelante: [], sel: [] };
    const v = L.abrir({ app: 'archivos', titulo: '', icono: 'thunar', ancho: 72, alto: 78, crear: (c, vv) => montar(c, vv) });
    v.thunar = T;
    T.pintar();
    L.emit('thunar', { tipo: 'abrir', ruta: ruta(T.cwd), papelera: T.papelera, origen: o.origen });
    return v;

    function montar(c, vv) {
      c.classList.add('mint-th');
      const menu = el('div', 'mint-th__menu');
      [['Archivo', () => [
        { t: 'Crear carpeta…', icono: 'carpeta', atajo: 'Ctrl + Shift + N', f: () => crearCarpeta(L, T.cwd, 'menu') },
        { t: 'Crear un documento', sub: [{ t: 'Documento vacío', f: () => crearDocumento(L, T.cwd, 'menu') }] },
        { t: 'Abrir terminal aquí', icono: 'terminal', f: () => L.abrirApp('terminal', { cwd: T.cwd, origen: 'thunar' }) },
        { sep: true },
        { t: 'Propiedades…', icono: 'propiedades', f: () => propiedades(L, T.sel[0] || T.cwd) },
        { sep: true },
        { t: 'Cerrar ventana', atajo: 'Ctrl + W', f: () => vv.cerrar('menu') },
      ]], ['Editar', () => [
        { t: 'Cortar', icono: 'cortar', atajo: 'Ctrl + X', off: !T.sel.length, f: () => portapapeles(true) },
        { t: 'Copiar', icono: 'copiar', atajo: 'Ctrl + C', off: !T.sel.length, f: () => portapapeles(false) },
        { t: 'Pegar', icono: 'pegar', atajo: 'Ctrl + V', off: !L.portapapeles, f: () => pegar(L, T.cwd, 'menu') },
        { sep: true },
        { t: 'Mover a la papelera', icono: 'eliminar', atajo: 'Supr', off: !T.sel.length, f: () => aPapelera(L, T.sel, 'menu') },
        { t: 'Renombrar…', icono: 'renombrar', atajo: 'F2', off: T.sel.length !== 1, f: () => renombrar(L, T.sel[0], 'menu') },
        { t: 'Seleccionar todo', atajo: 'Ctrl + A', f: () => { T.sel = visibles(); T.pintar(); } },
      ]], ['Ver', () => [
        { t: 'Mostrar archivos ocultos', marca: L.est.verOcultos, atajo: 'Ctrl + H', f: () => ocultos('menu') },
        { t: 'Recargar', icono: 'recargar', atajo: 'F5', f: () => T.pintar() },
      ]], ['Ir', () => [
        { t: 'Carpeta superior', icono: 'arriba', atajo: 'Alt + ↑', f: () => T.subir() },
        { t: 'Carpeta personal', icono: 'casa', atajo: 'Alt + Inicio', f: () => T.ir(L.casa) },
        { t: 'Escritorio', f: () => T.ir(hijo(L.casa, 'Escritorio')) },
        { t: 'Papelera', icono: 'papelera', f: () => T.verPapelera() },
        { t: 'Abrir ubicación…', atajo: 'Ctrl + L', f: () => editarRuta() },
      ]], ['Ayuda', () => [{ t: 'Acerca de', off: true }]]].forEach(([t, items]) => {
        const b = boton(t, 'mint-th__mb');
        b.addEventListener('click', e => { e.stopPropagation(); const r = b.getBoundingClientRect(); L.menu(r.left, r.bottom, items()); });
        menu.appendChild(b);
      });
      const barra = el('div', 'mint-th__barra');
      const bAt = boton('', 'mint-th__nb'); bAt.appendChild(icono('atras')); bAt.setAttribute('aria-label', 'Atrás');
      const bAd = boton('', 'mint-th__nb'); bAd.appendChild(icono('adelante')); bAd.setAttribute('aria-label', 'Adelante');
      const bAr = boton('', 'mint-th__nb'); bAr.appendChild(icono('arriba')); bAr.setAttribute('aria-label', 'Carpeta superior');
      const bCa = boton('', 'mint-th__nb'); bCa.appendChild(icono('casa')); bCa.setAttribute('aria-label', 'Carpeta personal');
      bAt.addEventListener('click', () => { if (T.atras.length) { T.adelante.push(T.cwd); T.ir(T.atras.pop(), true); } });
      bAd.addEventListener('click', () => { if (T.adelante.length) { T.atras.push(T.cwd); T.ir(T.adelante.pop(), true); } });
      bAr.addEventListener('click', () => T.subir());
      bCa.addEventListener('click', () => T.ir(L.casa));
      const rutaBar = el('div', 'mint-th__ruta');
      rutaBar.setAttribute('translate', 'no');
      rutaBar.addEventListener('click', e => { if (!e.target.closest('button')) editarRuta(); });
      barra.append(bAt, bAd, bAr, bCa, rutaBar);
      const main = el('div', 'mint-th__main');
      const lado = el('div', 'mint-th__lado');
      const lista = el('div', 'mint-th__lista');
      lista.tabIndex = 0;
      lista.setAttribute('role', 'listbox');
      lista.setAttribute('aria-multiselectable', 'true');
      lista.setAttribute('aria-label', 'Contenido de la carpeta');
      main.append(lado, lista);
      const estado = el('div', 'mint-th__estado');
      c.append(menu, barra, main, estado);

      function portapapeles(cortar) {
        if (!T.sel.length) return;
        if (cortar && sinPermiso(L, T.sel[0]._p, 'cortar')) return;
        L.portapapeles = { nodos: T.sel.slice(), cortar };
        L.emit('fs', { tipo: cortar ? 'cortar' : 'copiarPortapapeles', nodos: T.sel.slice() });
        T.pintar();
      }
      function ocultos(origen) {
        L.est.verOcultos = !L.est.verOcultos;
        L.emit('fs', { tipo: 'ocultos', si: L.est.verOcultos, origen });
        L.refrescar();
      }
      T.ocultos = ocultos;
      const visibles = () => T.papelera ? L.papelera.map(p => p.n) : T.cwd.hijos.filter(h => L.est.verOcultos || h.n[0] !== '.');
      function editarRuta() {
        rutaBar.innerHTML = '';
        const i = document.createElement('input');
        i.type = 'text';
        i.className = 'mint-th__rutaedit';
        i.value = T.papelera ? 'trash:///' : ruta(T.cwd);
        i.spellcheck = false;
        i.setAttribute('aria-label', 'Ubicación');
        rutaBar.appendChild(i);
        i.focus(); i.select();
        let hecho = false;
        i.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault(); e.stopPropagation();
            hecho = true;
            const r = L.resolver(i.value.trim(), T.cwd);
            if (!r.nodo || !r.nodo.dir) { L.dialogo({ titulo: 'Error', icono: 'error', texto: 'No se ha encontrado la ubicación «' + i.value + '».' }); L.emit('thunar', { tipo: 'ruta', ok: false, texto: i.value }); T.pintar(); return; }
            L.emit('thunar', { tipo: 'ruta', ok: true, texto: i.value, ruta: ruta(r.nodo) });
            T.ir(r.nodo);
          }
          if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); hecho = true; T.pintar(); }
        });
        i.addEventListener('blur', () => { if (!hecho) setTimeout(() => T.pintar(), 0); });
      }
      T.editarRuta = editarRuta;
      T.ir = (n, sinHistoria) => {
        if (!n) return;
        if (!L.puede(n, 'x') || !L.puede(n, 'r')) { L.dialogo({ titulo: 'Error', icono: 'error', texto: ['No se ha podido abrir la carpeta «' + n.n + '».', 'Permiso denegado.'] }); L.emit('thunar', { tipo: 'error', ruta: ruta(n) }); return; }
        if (!sinHistoria && (n !== T.cwd || T.papelera)) { T.atras.push(T.cwd); T.adelante = []; }
        T.cwd = n; T.papelera = false; T.sel = [];
        T.pintar();
        L.emit('thunar', { tipo: 'ir', ruta: ruta(n), nodo: n });
      };
      T.subir = () => { if (T.papelera) T.ir(L.casa); else if (T.cwd._p) T.ir(T.cwd._p); };
      T.verPapelera = () => { T.atras.push(T.cwd); T.papelera = true; T.sel = []; T.pintar(); L.emit('thunar', { tipo: 'papelera' }); };

      T.pintar = () => {
        if (!T.papelera && !L.esDentro(T.cwd, L.raiz)) T.cwd = L.casa; // carpeta borrada o USB quitado
        vv.titulo(T.papelera ? 'Papelera - Gestor de archivos' : (T.cwd === L.casa ? L.usuario : T.cwd.n === '/' ? 'Sistema de archivos' : T.cwd.n) + ' - Gestor de archivos');
        bAt.disabled = !T.atras.length; bAd.disabled = !T.adelante.length; bAr.disabled = !T.papelera && !T.cwd._p;
        // ruta en botones
        rutaBar.innerHTML = '';
        if (T.papelera) rutaBar.appendChild(boton('Papelera', 'mint-th__miga mint-th__miga--actual'));
        else {
          const cadena = [];
          for (let x = T.cwd; x; x = x._p) cadena.unshift(x);
          cadena.forEach(x => {
            const b = boton(x === L.raiz ? '/' : x === L.casa ? '🏠 ' + x.n : x.n, 'mint-th__miga' + (x === T.cwd ? ' mint-th__miga--actual' : ''));
            b.addEventListener('click', () => T.ir(x));
            rutaBar.appendChild(b);
          });
        }
        // panel lateral
        lado.innerHTML = '';
        const seccion = t => lado.appendChild(el('p', 'mint-th__lt', t));
        const sitio = (ic, t, n, f, extra) => {
          const b = boton('', 'mint-th__li' + ((n && n === T.cwd && !T.papelera) || (extra === 'papelera' && T.papelera) ? ' mint-th__li--actual' : ''));
          b.append(icono(ic), el('span', null, t));
          b.addEventListener('click', f);
          b.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); if (extra && extra.menu) extra.menu(e); });
          lado.appendChild(b);
          return b;
        };
        seccion('Equipo');
        sitio('raiz', 'Sistema de archivos', L.raiz, () => T.ir(L.raiz));
        sitio('casa', L.usuario, L.casa, () => T.ir(L.casa));
        const ed = hijo(L.casa, 'Escritorio');
        if (ed) sitio('carpeta', 'Escritorio', ed, () => T.ir(ed));
        sitio(L.papelera.length ? 'papelera-llena' : 'papelera', 'Papelera', null, () => T.verPapelera(), 'papelera');
        if (L.usb && L.usb.conectado && !L.usb.expulsado) {
          seccion('Dispositivos');
          const u = L.usb;
          const fila = el('div', 'mint-th__dev');
          const b = sitio('usb', u.etiqueta, u.nodo, () => { if (!u.montado) { L.montar('thunar'); L.notificacion('Montado «' + u.etiqueta + '»', 'Está en ' + '/media/' + L.usuario + '/' + u.etiqueta, 'usb'); } T.ir(u.nodo); }, { menu: e => L.menu(e.clientX, e.clientY, [{ t: 'Abrir', f: () => b.click() }, u.montado ? { t: 'Desmontar', f: () => L.desmontar('thunar') } : { t: 'Montar', f: () => L.montar('thunar') }, { t: 'Expulsar', icono: 'expulsar', f: () => L.expulsar('thunar') }]) });
          b.remove();
          fila.appendChild(b);
          if (u.montado) {
            const ej = boton('⏏', 'mint-th__eject');
            ej.setAttribute('aria-label', 'Expulsar ' + u.etiqueta);
            ej.title = 'Expulsar';
            ej.addEventListener('click', e => { e.stopPropagation(); L.expulsar('thunar'); });
            fila.appendChild(ej);
          }
          lado.appendChild(fila);
        }
        seccion('Red');
        sitio('red', 'Explorar la red', null, () => L.notificacion('Simulación', 'La red se ve en la unidad de Redes.'));
        // contenido
        lista.innerHTML = '';
        const items = visibles().slice().sort((a, b) => (b.dir - a.dir) || a.n.localeCompare(b.n, 'es', { sensitivity: 'base' }));
        if (!items.length) lista.appendChild(el('p', 'mint-th__vacia', T.papelera ? 'La papelera está vacía.' : 'Esta carpeta está vacía.'));
        items.forEach(n => {
          const b = el('div', 'mint-th__item' + (T.sel.indexOf(n) !== -1 ? ' mint-th__item--sel' : '') + (n.n[0] === '.' ? ' mint-th__item--oculto' : '') + (L.portapapeles && L.portapapeles.cortar && L.portapapeles.nodos.indexOf(n) !== -1 ? ' mint-th__item--cortado' : ''));
          b.setAttribute('role', 'option');
          b.setAttribute('aria-selected', String(T.sel.indexOf(n) !== -1));
          b.tabIndex = -1;
          const ic = icono(iconoDe(n));
          if (n.dir && !L.puede(n, 'x')) ic.appendChild(icono('candado', 'mint-th__candado'));
          const nom = el('span', 'mint-th__n', n.n);
          nom.setAttribute('translate', 'no');
          b.append(ic, nom);
          b._n = n;
          b.addEventListener('click', e => {
            // la lista se vuelve a pintar en cada clic: el doble clic se cuenta por archivo, no por elemento
            const ahora = Date.now();
            if (T._ult && T._ult.n === n && ahora - T._ult.t < 450 && !e.ctrlKey) { T._ult = null; abrir(n); return; }
            T._ult = { n, t: ahora };
            if (e.ctrlKey) { const i = T.sel.indexOf(n); if (i === -1) T.sel.push(n); else T.sel.splice(i, 1); }
            else T.sel = [n];
            T.pintar();
            lista.focus({ preventScroll: true });
          });
          b.addEventListener('contextmenu', e => {
            e.preventDefault(); e.stopPropagation();
            if (T.sel.indexOf(n) === -1) { T.sel = [n]; T.pintar(); }
            menuItem(e.clientX, e.clientY);
          });
          lista.appendChild(b);
        });
        // estado
        if (T.sel.length === 1) { const n = T.sel[0]; estado.textContent = '«' + n.n + '» ' + (n.dir ? 'carpeta' : '(' + tamano(n.tam) + ') ' + tipoDe(n)); }
        else if (T.sel.length > 1) estado.textContent = T.sel.length + ' elementos seleccionados';
        else if (T.papelera) estado.textContent = L.papelera.length + ' elementos';
        else {
          const enUsb = L.usb && L.usb.nodo && L.esDentro(T.cwd, L.usb.nodo);
          estado.textContent = items.length + ' elementos, espacio libre: ' + (enUsb ? tamano(libreDe(L.usb.capacidad, L.usb.nodo)) : '86,4 GB');
        }
        estado.setAttribute('translate', 'no');
      };
      function abrir(n) {
        if (T.papelera) { L.notificacion('Papelera', 'Para abrirlo, primero restáuralo (clic derecho → Restaurar).'); return; }
        if (n.dir) T.ir(n); else abrirNodo(L, n, 'thunar');
      }
      function menuItem(x, y) {
        const n = T.sel[0];
        if (T.papelera) {
          L.menu(x, y, [
            { t: 'Restaurar', icono: 'restaurar', f: () => restaurar() },
            { t: 'Eliminar', icono: 'eliminar', f: () => { T.sel.forEach(s => { const i = L.papelera.findIndex(p => p.n === s); if (i !== -1) L.papelera.splice(i, 1); }); L.emit('fs', { tipo: 'eliminar', nodos: T.sel.slice(), origen: 'papelera' }); T.sel = []; L.refrescar(); } },
            { sep: true },
            { t: 'Vaciar la papelera', f: () => vaciar() },
          ]);
          return;
        }
        const items = [{ t: n.dir ? 'Abrir' : 'Abrir con «' + (ext(n.n) === 'txt' || n.contenido != null ? 'Editor de textos' : 'la aplicación predeterminada') + '»', f: () => abrir(n) }];
        if (n.dir) items.push({ t: 'Abrir terminal aquí', icono: 'terminal', f: () => L.abrirApp('terminal', { cwd: n, origen: 'thunar' }) });
        items.push({ sep: true },
          { t: 'Cortar', icono: 'cortar', atajo: 'Ctrl + X', f: () => portapapeles(true) },
          { t: 'Copiar', icono: 'copiar', atajo: 'Ctrl + C', f: () => portapapeles(false) });
        if (n.dir && T.sel.length === 1) items.push({ t: 'Pegar dentro de la carpeta', icono: 'pegar', off: !L.portapapeles, f: () => pegar(L, n, 'menu') });
        items.push({ sep: true },
          { t: 'Mover a la papelera', icono: 'eliminar', atajo: 'Supr', f: () => aPapelera(L, T.sel, 'menu') },
          { t: 'Eliminar', atajo: 'Shift + Supr', f: () => borrar(L, T.sel.slice(), 'menu') },
          { sep: true },
          { t: 'Renombrar…', icono: 'renombrar', atajo: 'F2', off: T.sel.length !== 1, f: () => renombrar(L, n, 'menu') },
          { t: 'Crear un archivador…', icono: 'zip', f: () => archivador(T.sel.slice()) },
          { sep: true },
          { t: 'Propiedades…', icono: 'propiedades', atajo: 'Alt + Intro', off: T.sel.length !== 1, f: () => propiedades(L, n) });
        L.menu(x, y, items);
      }
      function restaurar() {
        T.sel.forEach(s => {
          const i = L.papelera.findIndex(p => p.n === s);
          if (i === -1) return;
          const p = L.papelera[i];
          L.papelera.splice(i, 1);
          if (!L.esDentro(p.de, L.raiz)) p.de = L.casa;
          if (hijo(p.de, s.n)) s.n = nombreLibre(p.de, s.n);
          p.de.hijos.push(s); enlazar(s, p.de);
          L.emit('fs', { tipo: 'restaurar', nodo: s, destino: p.de });
        });
        T.sel = [];
        L.refrescar();
      }
      function vaciar() {
        if (!L.papelera.length) return;
        L.dialogo({ titulo: 'Vaciar la papelera', icono: 'aviso', texto: ['¿Quieres eliminar para siempre todo lo que hay en la papelera?', 'Si la vacías, no se puede recuperar.'], botones: [{ t: 'Cancelar' }, { t: 'Vaciar la papelera', primario: true, f: () => { const n = L.papelera.length; L.papelera = []; L.emit('fs', { tipo: 'vaciar', n }); L.refrescar(); } }] });
      }
      function archivador(nodos) {
        const d = nodos[0]._p;
        if (sinPermiso(L, d, 'archivador')) return;
        const base = nodos.length === 1 ? nodos[0].n.replace(/\.[^.]+$/, '') : 'Archivador comprimido';
        L.dialogo({
          titulo: 'Crear un archivador',
          crear(t) {
            const l = el('label', 'mint-campo');
            l.append(el('span', null, 'Nombre del archivo:'));
            const i = document.createElement('input');
            i.type = 'text'; i.className = 'mint-input'; i.value = base; i.spellcheck = false;
            i.setAttribute('translate', 'no');
            l.appendChild(i);
            const l2 = el('label', 'mint-campo');
            l2.append(el('span', null, 'Formato:'));
            const s = document.createElement('select');
            s.className = 'mint-input';
            ['.tar.gz', '.zip', '.7z'].forEach(f => { const op = document.createElement('option'); op.value = f; op.textContent = f; s.appendChild(op); });
            l2.appendChild(s);
            t.append(l, l2);
            t._i = i; t._s = s;
            setTimeout(() => { i.focus(); i.select(); }, 0);
          },
          botones: [{ t: 'Cancelar' }, { t: 'Crear', primario: true, f: t => {
            const nombre = t._i.value.trim() + t._s.value;
            if (!t._i.value.trim()) return false;
            const total = nodos.reduce((a, n) => a + peso(n), 0);
            const n = arch(hijo(d, nombre) ? nombreLibre(d, nombre) : nombre, Math.max(200, Math.round(total * 0.55)), { dueno: L.usuario, grupo: L.usuario, dentro: nodos.map(clonar) });
            d.hijos.push(n); enlazar(n, d);
            L.emit('fs', { tipo: 'archivador', nodo: n, nodos, formato: t._s.value });
            L.refrescar();
          } }],
        });
      }
      lista.addEventListener('click', e => { if (!e.target.closest('.mint-th__item') && T.sel.length) { T.sel = []; T.pintar(); } });
      lista.addEventListener('contextmenu', e => {
        if (e.target.closest('.mint-th__item')) return;
        e.preventDefault();
        T.sel = []; T.pintar();
        if (T.papelera) { L.menu(e.clientX, e.clientY, [{ t: 'Vaciar la papelera', f: () => vaciar() }]); return; }
        L.menu(e.clientX, e.clientY, [
          { t: 'Crear carpeta…', icono: 'carpeta', f: () => crearCarpeta(L, T.cwd, 'menu') },
          { t: 'Crear un documento', sub: [{ t: 'Documento vacío', f: () => crearDocumento(L, T.cwd, 'menu') }] },
          { sep: true },
          { t: 'Abrir terminal aquí', icono: 'terminal', f: () => L.abrirApp('terminal', { cwd: T.cwd, origen: 'thunar' }) },
          { sep: true },
          { t: 'Pegar', icono: 'pegar', off: !L.portapapeles, f: () => pegar(L, T.cwd, 'menu') },
          { sep: true },
          { t: 'Mostrar archivos ocultos', marca: L.est.verOcultos, f: () => ocultos('menu') },
          { t: 'Propiedades…', icono: 'propiedades', f: () => propiedades(L, T.cwd) },
        ]);
      });
      vv.def.onTecla = combo => {
        if (combo === 'Ctrl + H') { ocultos('atajo'); return true; }
        if (combo === 'Ctrl + L') { editarRuta(); return true; }
        if (combo === 'Ctrl + Shift + N') { crearCarpeta(L, T.cwd, 'atajo'); return true; }
        if (combo === 'Ctrl + W') { vv.cerrar('atajo'); return true; }
        if (combo === 'Alt + ↑' || combo === 'Retroceso') { T.subir(); return true; }
        if (combo === 'Ctrl + A') { T.sel = visibles(); T.pintar(); return true; }
        if (combo === 'F5') { T.pintar(); return true; }
        if (combo === 'Ctrl + V') { if (!T.papelera) pegar(L, T.cwd, 'atajo'); return true; }
        if (!T.sel.length) return false;
        if (combo === 'F2') { if (T.sel.length === 1 && !T.papelera) renombrar(L, T.sel[0], 'atajo'); return true; }
        if (combo === 'Supr') { if (!T.papelera) aPapelera(L, T.sel.slice(), 'atajo'); return true; }
        if (combo === 'Shift + Supr') { if (!T.papelera) borrar(L, T.sel.slice(), 'atajo'); return true; }
        if (combo === 'Ctrl + C') { portapapeles(false); return true; }
        if (combo === 'Ctrl + X') { portapapeles(true); return true; }
        if (combo === 'Intro') { abrir(T.sel[0]); return true; }
        if (combo === 'Alt + Intro') { propiedades(L, T.sel[0]); return true; }
        return false;
      };
    }
  }

  /* ---------- Propiedades (General y Permisos) ---------- */
  function propiedades(L, n) {
    const ACC = [['rw', 'Lectura y escritura'], ['r', 'Solo lectura'], ['', 'Ninguno']];
    const accDe = t => (t[0] === 'r' ? 'r' : '') + (t[1] === 'w' ? 'w' : '');
    L.emit('fs', { tipo: 'propiedades', nodo: n });
    let pest = 'general';
    const d = L.dialogo({
      titulo: n.n + ' - Propiedades',
      crear(t) {
        const tabs = el('div', 'mint-props__tabs');
        tabs.setAttribute('role', 'tablist');
        const cont = el('div', 'mint-props__cont');
        const pinta = () => {
          tabs.innerHTML = ''; cont.innerHTML = '';
          [['general', 'General'], ['permisos', 'Permisos']].forEach(([k, txt]) => {
            const b = boton(txt, 'mint-props__tab' + (pest === k ? ' mint-props__tab--on' : ''));
            b.setAttribute('role', 'tab');
            b.setAttribute('aria-selected', String(pest === k));
            b.addEventListener('click', () => { pest = k; pinta(); if (k === 'permisos') L.emit('fs', { tipo: 'verPermisos', nodo: n }); });
            tabs.appendChild(b);
          });
          if (pest === 'general') {
            const dl = el('dl', 'mint-props__dl');
            const fila = (a, b) => { dl.append(el('dt', null, a), el('dd', null, b)); dl.lastChild.setAttribute('translate', 'no'); };
            fila('Nombre:', n.n);
            fila('Tipo:', tipoDe(n));
            fila('Ubicación:', ruta(n._p || n));
            fila('Tamaño:', n.dir ? n.hijos.length + ' elementos, ' + tamano(peso(n)) : tamano(n.tam) + ' (' + n.tam.toLocaleString('es-ES') + ' bytes)');
            cont.appendChild(dl);
            return;
          }
          const es = L.usuario === n.dueno;
          const tab = el('div', 'mint-props__perm');
          const fila = (et, quien, ini) => {
            const f = el('div', 'mint-props__pf');
            f.appendChild(el('span', 'mint-props__pl', et));
            const q = el('span', 'mint-props__q', quien);
            q.setAttribute('translate', 'no');
            f.appendChild(q);
            const s = document.createElement('select');
            s.className = 'mint-input';
            s.setAttribute('aria-label', 'Acceso de ' + et.toLowerCase().replace(':', ''));
            ACC.forEach(([v, txt]) => { const o = document.createElement('option'); o.value = v; o.textContent = (n.dir ? txt.replace('Lectura y escritura', 'Crear y borrar archivos').replace('Solo lectura', 'Solo ver el contenido') : txt); s.appendChild(o); });
            s.value = ini;
            s.disabled = !es;
            f.appendChild(s);
            tab.appendChild(f);
            return s;
          };
          const p = n.perm;
          const sD = fila('Propietario:', n.dueno, accDe(p.slice(0, 3)));
          const sG = fila('Grupo:', n.grupo, accDe(p.slice(3, 6)));
          const sO = fila('Otros:', '', accDe(p.slice(6, 9)));
          let x = null;
          if (!n.dir) {
            const l = el('label', 'mint-props__x');
            x = document.createElement('input');
            x.type = 'checkbox';
            x.checked = /x/.test(p);
            x.disabled = !es;
            l.append(x, el('span', null, 'Permitir que este archivo se ejecute como un programa'));
            tab.appendChild(l);
          }
          if (!es) tab.appendChild(el('p', 'mint-props__nota', 'No eres el propietario: no puedes cambiar los permisos.'));
          const cambia = () => {
            const trio = (s, ex) => (s.value.indexOf('r') !== -1 ? 'r' : '-') + (s.value.indexOf('w') !== -1 ? 'w' : '-') + ex;
            const antes = n.perm;
            const exD = n.dir ? 'x' : (x && x.checked ? 'x' : '-');
            const exG = n.dir ? (sG.value ? 'x' : '-') : (x && x.checked && sG.value ? 'x' : '-');
            const exO = n.dir ? (sO.value ? 'x' : '-') : (x && x.checked && sO.value ? 'x' : '-');
            n.perm = trio(sD, exD) + trio(sG, exG) + trio(sO, exO);
            L.emit('fs', { tipo: 'permisos', nodo: n, antes, origen: 'propiedades' });
            L.emit('permisos', { nodo: n, antes, origen: 'propiedades' });
            L.refrescar();
            num.textContent = 'En la terminal: ' + (n.dir ? 'd' : '-') + n.perm + '  (' + octalDe(n.perm) + ')';
          };
          [sD, sG, sO, x].forEach(s => s && s.addEventListener('change', cambia));
          const num = el('p', 'mint-props__num', 'En la terminal: ' + (n.dir ? 'd' : '-') + n.perm + '  (' + octalDe(n.perm) + ')');
          num.setAttribute('translate', 'no');
          tab.appendChild(num);
          cont.appendChild(tab);
        };
        t.append(tabs, cont);
        pinta();
      },
      botones: [{ t: 'Cerrar', primario: true }],
    });
    return d;
  }

  /* ============================================================
     Terminal (bash)
     ============================================================ */
  const PAQUETES_BASE = {
    vlc: { tam: 3.1, desc: 'reproductor de vídeo y audio', dep: 42 },
    gimp: { tam: 22.4, desc: 'editor de imágenes', dep: 31 },
    htop: { tam: 0.17, desc: 'visor de procesos', dep: 0 },
    tree: { tam: 0.06, desc: 'enseña las carpetas en árbol', dep: 0 },
    cowsay: { tam: 0.02, desc: 'una vaca que dice lo que le escribes', dep: 1 },
    sl: { tam: 0.03, desc: 'un tren que cruza la terminal', dep: 0 },
    'minetest': { tam: 4.2, desc: 'juego libre de bloques, parecido a Minecraft', dep: 12 },
    'neofetch': { tam: 0.08, desc: 'datos del sistema con el logo de la distribución', dep: 0 },
    'libreoffice-writer': { tam: 9.9, desc: 'procesador de textos', dep: 0 },
    firefox: { tam: 68, desc: 'navegador web', dep: 0 },
    'xfce4-terminal': { tam: 0.4, desc: 'terminal', dep: 0 },
    bash: { tam: 1.4, desc: 'intérprete de órdenes', dep: 0 },
    nano: { tam: 0.3, desc: 'editor de textos en la terminal', dep: 0 },
    mousepad: { tam: 0.5, desc: 'editor de textos', dep: 0 },
    thunar: { tam: 1.2, desc: 'gestor de archivos', dep: 0 },
  };
  function ventanaTerminal(L, o) {
    o = o || {};
    let cwd = o.cwd ? (typeof o.cwd === 'string' ? L.resolver(o.cwd).nodo : o.cwd) : L.casa;
    if (!cwd) cwd = L.casa;
    const v = L.abrir({ app: 'terminal', titulo: '', icono: 'terminal', ancho: 70, alto: 80, crear: (c, vv) => { vv.term = crearTerminal(L, c, vv, cwd); } });
    return v;
  }
  function partir(linea) {
    // separa por espacios respetando "…", '…' y «\ »
    const out = []; let cur = '', q = null, hay = false;
    for (let i = 0; i < linea.length; i++) {
      const ch = linea[i];
      if (q) { if (ch === q) q = null; else cur += ch; continue; }
      if (ch === '"' || ch === "'") { q = ch; hay = true; continue; }
      if (ch === '\\' && i + 1 < linea.length) { cur += linea[++i]; hay = true; continue; }
      if (/\s/.test(ch)) { if (cur || hay) out.push(cur); cur = ''; hay = false; continue; }
      cur += ch;
    }
    if (q) return null;
    if (cur || hay) out.push(cur);
    return out;
  }
  function crearTerminal(L, c, v, cwd0) {
    const T = { cwd: cwd0, historia: [], h: -1, espera: null, user: L.usuario };
    c.classList.add('mint-term');
    const menu = el('div', 'mint-term__menu');
    ['Archivo', 'Editar', 'Ver', 'Terminal', 'Pestañas', 'Ayuda'].forEach(t => menu.appendChild(el('span', null, t)));
    const pant = el('div', 'mint-term__pant');
    pant.setAttribute('translate', 'no');
    const salida = el('div', 'mint-term__salida');
    salida.setAttribute('role', 'log');
    salida.setAttribute('aria-live', 'polite');
    const linea = el('div', 'mint-term__linea');
    const pr = el('span', 'mint-term__pr');
    const inp = document.createElement('input');
    inp.type = 'text';
    inp.className = 'mint-term__in';
    inp.spellcheck = false;
    inp.autocomplete = 'off';
    inp.setAttribute('autocapitalize', 'off');
    inp.setAttribute('aria-label', 'Escribe una orden y pulsa Intro');
    linea.append(pr, inp);
    pant.append(salida, linea);
    c.append(menu, pant);
    pant.addEventListener('pointerup', () => { if (!window.getSelection().toString()) inp.focus({ preventScroll: true }); });
    const casaTxt = n => { const r = ruta(n), h = ruta(L.casa); return r === h ? '~' : r.indexOf(h + '/') === 0 ? '~' + r.slice(h.length) : r; };
    function titulo() { v.titulo(T.user + '@' + L.equipo + ': ' + casaTxt(T.cwd)); }
    function prompt() {
      pr.innerHTML = '';
      if (T.espera) { pr.textContent = T.espera.texto; inp.type = T.espera.oculto ? 'password' : 'text'; return; }
      inp.type = 'text';
      const u = el('span', T.user === 'root' ? 'mint-t-root' : 'mint-t-u', T.user + '@' + L.equipo);
      pr.append(u, document.createTextNode(':'), el('span', 'mint-t-r', casaTxt(T.cwd)), document.createTextNode(T.user === 'root' ? '# ' : '$ '));
      titulo();
    }
    function escribe(t, clase) {
      if (t == null) return;
      String(t).split('\n').forEach(l => { const d = el('div', 'mint-t-l' + (clase ? ' ' + clase : '')); d.textContent = l; salida.appendChild(d); });
      pant.scrollTop = pant.scrollHeight;
    }
    function escribeNodo(nodo) { salida.appendChild(nodo); pant.scrollTop = pant.scrollHeight; }
    function eco(texto) {
      const d = el('div', 'mint-t-l');
      d.innerHTML = pr.innerHTML;
      d.appendChild(document.createTextNode(T.espera && T.espera.oculto ? '' : texto));
      salida.appendChild(d);
    }
    T.escribe = escribe;
    T.limpiar = () => { salida.innerHTML = ''; };
    prompt();
    setTimeout(() => inp.focus({ preventScroll: true }), 0);

    function preguntar(texto, oculto, f) { T.espera = { texto, oculto, f }; prompt(); }
    T.ejecutar = lineaTxt => {
      if (T.espera) {
        const e = T.espera;
        eco(lineaTxt);
        T.espera = null;
        e.f(lineaTxt);
        prompt();
        return;
      }
      eco(lineaTxt);
      let l = lineaTxt.trim();
      if (l.indexOf('!!') !== -1) {
        const prev = T.historia[T.historia.length - 1];
        if (!prev) { escribe('bash: !!: evento no encontrado'); prompt(); return; }
        l = l.replace(/!!/g, prev);
        escribe(l);
      }
      if (l) { T.historia.push(l); }
      T.h = -1;
      if (!l) { prompt(); return; }
      // tubería sencilla: «orden | grep palabra»
      let filtro = null, cmdTxt = l;
      const m = /^(.*?)\|\s*grep\s+(-i\s+)?(\S+)\s*$/.exec(l);
      if (m) { cmdTxt = m[1].trim(); filtro = { t: m[3].replace(/^["']|["']$/g, ''), i: !!m[2] }; }
      const args = partir(cmdTxt);
      if (!args) { escribe('> (falta cerrar unas comillas: pulsa Ctrl + C y vuelve a escribirla)'); prompt(); return; }
      let sudo = false;
      if (args[0] === 'sudo') {
        args.shift();
        if (!args.length) { escribe('uso: sudo orden\nsudo ejecuta una orden como administrador (root).'); prompt(); return; }
        sudo = true;
        if (Date.now() < L.sudoHasta) { correr(args, true, filtro, l); return; }
        let intentos = 0;
        const pide = () => preguntar('[sudo] contraseña para ' + L.usuario + ': ', true, txt => {
          if (txt === L.clave) { L.sudoHasta = Date.now() + 15 * 60 * 1000; L.emit('sudo', { ok: true }); correr(args, true, filtro, l); return; }
          intentos++;
          L.emit('sudo', { ok: false });
          if (intentos >= 3) { escribe('sudo: 3 intentos de contraseña incorrectos'); L.emit('cmd', { linea: l, cmd: args[0], args: args.slice(1), ok: false, sudo: true, cwd: T.cwd, error: 'clave' }); return; }
          escribe('Lo siento, pruebe otra vez.');
          pide();
        });
        pide();
        return;
      }
      correr(args, sudo, filtro, l);
    };
    function correr(args, sudo, filtro, l) {
      const cmd = args[0], a = args.slice(1);
      const quien = sudo ? 'root' : T.user;
      let salidaTxt = [];
      const out = (t, cl) => { if (t == null) return; salidaTxt.push(String(t)); if (filtro) return; escribe(t, cl); };
      const outNodo = (nodo, texto) => { salidaTxt.push(texto); if (!filtro) escribeNodo(nodo); };
      const r = ORDENES[cmd] ? ORDENES[cmd]({ L, T, a, out, outNodo, quien, sudo, preguntar, escribe, escribeNodo, prompt, v, expandir }) : null;
      let ok, info = {};
      if (r === null) {
        if (/^\.?\.?\//.test(cmd)) { const x = ejecutarArchivo(L, T, cmd, out, quien); ok = x.ok; info = x; }
        else { out(cmd + ': orden no encontrada'); ok = false; info = { error: 'noorden' }; }
      } else if (r && typeof r === 'object') { ok = r.ok !== false; info = r; }
      else ok = r !== false;
      if (filtro) {
        const t = filtro.i ? filtro.t.toLowerCase() : filtro.t;
        salidaTxt.join('\n').split('\n').filter(x => (filtro.i ? x.toLowerCase() : x).indexOf(t) !== -1).forEach(x => escribe(x));
      }
      L.emit('cmd', Object.assign({ linea: l, cmd, args: a, ok, sudo, cwd: T.cwd, salida: salidaTxt.join('\n'), grep: filtro && filtro.t }, info));
      if (!info.espera) prompt();
    }
    function expandir(arg) {
      // comodín * dentro de la carpeta (sin / o con la carpeta delante)
      if (arg.indexOf('*') === -1 && arg.indexOf('?') === -1) return [arg];
      const k = arg.lastIndexOf('/');
      const base = k === -1 ? '' : arg.slice(0, k + 1);
      const patron = arg.slice(k + 1);
      const d = base ? L.resolver(base, T.cwd).nodo : T.cwd;
      if (!d || !d.dir) return [arg];
      const re = new RegExp('^' + patron.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
      const r = d.hijos.filter(h => (patron[0] === '.' || h.n[0] !== '.') && re.test(h.n)).map(h => base + h.n).sort();
      return r.length ? r : [arg];
    }
    // Tab: completa el nombre
    function completar() {
      const val = inp.value.slice(0, inp.selectionStart);
      const resto = inp.value.slice(inp.selectionStart);
      const m = /(\S*)$/.exec(val);
      const pal = m[1];
      const esPrimera = !/\S\s/.test(val.trim() + (val.endsWith(' ') ? ' ' : '')) && val.indexOf(' ') === -1;
      let opciones;
      if (esPrimera && pal.indexOf('/') === -1) opciones = Object.keys(ORDENES).filter(k => k.indexOf(pal) === 0).map(k => k + ' ');
      else {
        const k = pal.lastIndexOf('/');
        const base = k === -1 ? '' : pal.slice(0, k + 1);
        const pre = pal.slice(k + 1);
        const d = base ? L.resolver(base, T.cwd).nodo : T.cwd;
        if (!d || !d.dir) return;
        opciones = d.hijos.filter(h => h.n.indexOf(pre) === 0 && (pre[0] === '.' || h.n[0] !== '.')).map(h => base + h.n.replace(/ /g, '\\ ') + (h.dir ? '/' : ' '));
      }
      L.emit('tab', { palabra: pal, n: opciones.length });
      if (!opciones.length) return;
      if (opciones.length === 1) { inp.value = val.slice(0, val.length - pal.length) + opciones[0] + resto; inp.setSelectionRange(inp.value.length - resto.length, inp.value.length - resto.length); return; }
      // parte común
      let comun = opciones[0];
      opciones.forEach(x => { while (x.indexOf(comun) !== 0) comun = comun.slice(0, -1); });
      if (comun.length > pal.length) { inp.value = val.slice(0, val.length - pal.length) + comun + resto; return; }
      eco(inp.value);
      escribe(opciones.map(x => x.trim().replace(/^.*\/(?=.)/, '')).join('   '));
      prompt();
    }
    function teclas(combo) {
      if (combo === 'Tab') { completar(); return true; }
      if (combo === '↑') { if (T.historia.length) { T.h = T.h === -1 ? T.historia.length - 1 : Math.max(0, T.h - 1); inp.value = T.historia[T.h]; } return true; }
      if (combo === '↓') { if (T.h !== -1) { T.h++; if (T.h >= T.historia.length) { T.h = -1; inp.value = ''; } else inp.value = T.historia[T.h]; } return true; }
      if (combo === 'Ctrl + C') { eco(inp.value + '^C'); inp.value = ''; if (T.espera) { T.espera = null; } prompt(); L.emit('cmd', { linea: '^C', cmd: '^C', args: [], ok: true, cwd: T.cwd }); return true; }
      if (combo === 'Ctrl + L') { T.limpiar(); return true; }
      if (combo === 'Ctrl + D') { if (!inp.value) v.cerrar('exit'); return true; }
      if (combo === 'Ctrl + Shift + C') { const s = window.getSelection().toString() || (inp.selectionEnd > inp.selectionStart ? inp.value.slice(inp.selectionStart, inp.selectionEnd) : ''); if (s) L._texto = s; return true; }
      if (combo === 'Ctrl + Shift + V') { if (L._texto) { const i = inp.selectionStart; inp.value = inp.value.slice(0, i) + L._texto.replace(/\n/g, ' ') + inp.value.slice(inp.selectionEnd); } L.emit('pegarTerminal', {}); return true; }
      if (combo === 'Ctrl + V') { L.notificacion('En la terminal se pega con Ctrl + Shift + V', 'Ctrl + V no funciona en la terminal de Linux.', 'info'); L.emit('pegarTerminal', { mal: true }); return true; }
      return false;
    }
    inp._teclas = teclas;
    inp.addEventListener('keydown', e => {
      const combo = comboDeEvento(e);
      if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); const t = inp.value; inp.value = ''; T.ejecutar(t); return; }
      if (combo && teclas(combo)) { e.preventDefault(); e.stopPropagation(); }
    });
    v.def.alEnfocar = () => setTimeout(() => { if (!L.escena.querySelector('.w11-dlg__velo')) inp.focus({ preventScroll: true }); }, 0);
    T.input = inp;
    return T;
  }
  function ejecutarArchivo(L, T, cmd, out, quien) {
    const r = L.resolver(cmd, T.cwd);
    if (!r.nodo) { out('bash: ' + cmd + ': No existe el archivo o el directorio'); return { ok: false, error: 'noexiste' }; }
    if (r.nodo.dir) { out('bash: ' + cmd + ': Es un directorio'); return { ok: false, error: 'esdir' }; }
    if (!L.puede(r.nodo, 'x', quien)) { out('bash: ' + cmd + ': Permiso denegado'); return { ok: false, error: 'permiso', nodo: r.nodo }; }
    if (r.nodo.salida) out(typeof r.nodo.salida === 'function' ? r.nodo.salida(L) : r.nodo.salida);
    L.emit('ejecutar', { nodo: r.nodo });
    return { ok: true, ejecutado: r.nodo };
  }

  const MES = 'feb  1 16:05';
  function lineaLs(L, n, nombre) {
    const enlaces = n.dir ? 2 + n.hijos.filter(h => h.dir).length : 1;
    const tam = n.dir ? 4096 : n.tam;
    return (n.dir ? 'd' : '-') + n.perm + ' ' + String(enlaces).padStart(2) + ' ' + n.dueno.padEnd(6) + ' ' + n.grupo.padEnd(6) + ' ' + String(tam).padStart(8) + ' ' + MES + ' ' + (nombre || n.n);
  }
  function columnaNombres(L, nodos, extra) {
    const f = el('div', 'mint-t-l mint-t-cols');
    (extra || []).forEach(t => f.appendChild(el('span', 'mint-t-dir', t)));
    nodos.forEach(n => {
      const s = el('span', n.dir ? (n.usb ? 'mint-t-dir' : 'mint-t-dir') : /x/.test(n.perm) ? 'mint-t-exe' : null, /\s/.test(n.n) ? "'" + n.n + "'" : n.n);
      f.appendChild(s);
    });
    return f;
  }
  const NOEX = (o, x) => o + ": no se puede acceder a '" + x + "': No existe el archivo o el directorio";

  const ORDENES = {
    pwd: ({ T, out }) => { out(ruta(T.cwd)); return { ok: true }; },
    whoami: ({ out, quien }) => { out(quien); return { ok: true }; },
    hostname: ({ L, out }) => { out(L.equipo); return true; },
    clear: ({ T }) => { T.limpiar(); return true; },
    history: ({ T, out }) => { T.historia.forEach((h, i) => out(String(i + 1).padStart(5) + '  ' + h)); return true; },
    exit: ({ v }) => { setTimeout(() => v.cerrar('exit'), 0); return { ok: true, espera: true }; },
    help: ({ out }) => { out('Órdenes que entiende esta terminal de práctica:\n  pwd  ls  cd  mkdir  touch  cp  mv  rm  rmdir  cat  echo  clear  history\n  whoami  sudo  apt  adduser  groups  chmod  chown  df  lsblk  ps  kill  killall  top  exit\nY ./programa para ejecutar un archivo. Tab completa los nombres; ↑ y ↓ repiten órdenes.'); return true; },
    man: ({ out, a }) => { out('En esta simulación no hay manual. Prueba «help» o mira la tabla de órdenes de la sesión.' + (a[0] ? '' : '')); return true; },
    date: ({ out }) => { out('lun 01 feb 2027 16:05:12 CET'); return true; },
    uname: ({ out, a }) => { out(a.indexOf('-a') !== -1 ? 'Linux aula-pc 6.8.0-51-generic #52-Ubuntu SMP x86_64 GNU/Linux' : 'Linux'); return true; },
    echo: ({ out, a }) => { out(a.join(' ')); return true; },
    cd: ({ L, T, a, out, quien }) => {
      const dest = a[0] === undefined || a[0] === '~' ? L.casa : null;
      if (a.length > 1) { out('bash: cd: demasiados argumentos'); return { ok: false, error: 'args' }; }
      if (dest) { T.cwd = dest; return { ok: true, destino: dest }; }
      if (a[0] === '-') { out(ruta(T.cwd)); return { ok: true }; }
      const r = L.resolver(a[0], T.cwd);
      if (!r.nodo) { out('bash: cd: ' + a[0] + ': No existe el archivo o el directorio'); return { ok: false, error: 'noexiste' }; }
      if (!r.nodo.dir) { out('bash: cd: ' + a[0] + ': No es un directorio'); return { ok: false, error: 'nodir' }; }
      if (!L.puede(r.nodo, 'x', quien)) { out('bash: cd: ' + a[0] + ': Permiso denegado'); return { ok: false, error: 'permiso' }; }
      T.cwd = r.nodo;
      return { ok: true, destino: r.nodo };
    },
    ls: ({ L, T, a, out, outNodo, quien, expandir }) => {
      let largo = false, todo = false, humano = false;
      const rutas = [];
      a.forEach(x => { if (/^-[a-zA-Z]+$/.test(x)) { if (x.indexOf('l') !== -1) largo = true; if (/a/i.test(x)) todo = true; if (x.indexOf('h') !== -1) humano = true; } else rutas.push(...expandir(x)); });
      if (!rutas.length) rutas.push('.');
      let ok = true;
      const mostrados = [];
      rutas.forEach((x, k) => {
        const r = L.resolver(x, T.cwd);
        if (!r.nodo) { out(NOEX('ls', x)); ok = false; return; }
        const n = r.nodo;
        if (!n.dir) { out(largo ? lineaLs(L, n, x) : x); mostrados.push(n); return; }
        if (!L.puede(n, 'r', quien)) { out("ls: no se puede abrir el directorio '" + x + "': Permiso denegado"); ok = false; return; }
        if (rutas.length > 1) out((k ? '\n' : '') + x + ':');
        const hijos = n.hijos.filter(h => todo || h.n[0] !== '.').sort((p, q) => p.n.replace(/^\./, '').localeCompare(q.n.replace(/^\./, ''), 'es', { sensitivity: 'base' }));
        mostrados.push(...hijos);
        if (largo) {
          out('total ' + Math.max(4, hijos.length * 4));
          if (todo) { out(lineaLs(L, n, '.')); out(lineaLs(L, n._p || n, '..')); }
          hijos.forEach(h => {
            let lin = lineaLs(L, h);
            if (humano) lin = lin.replace(/\s+\d+ (feb)/, ' ' + (h.dir ? '4,0K' : corto(h.tam)).padStart(5) + ' $1');
            out(lin);
          });
        } else if (hijos.length || todo) {
          const f = columnaNombres(L, hijos, todo ? ['.', '..'] : []);
          outNodo(f, (todo ? ['.', '..'] : []).concat(hijos.map(h => h.n)).join('\n'));
        }
      });
      return { ok, largo, todo, mostrados, rutas };
    },
    mkdir: ({ L, T, a, out, quien }) => {
      const p = a.indexOf('-p') !== -1;
      const nombres = a.filter(x => x !== '-p');
      if (!nombres.length) { out('mkdir: falta un operando\nPruebe «mkdir --help» para más información.'); return { ok: false, error: 'operando' }; }
      let ok = true; const creadas = [];
      nombres.forEach(x => {
        const partes = x.replace(/\/+$/, '').split('/');
        let base = x[0] === '/' ? L.raiz : T.cwd;
        if (x === '~' || x.indexOf('~/') === 0) { base = L.casa; partes.shift(); }
        for (let i = 0; i < partes.length; i++) {
          const pz = partes[i];
          if (pz === '' || pz === '.') continue;
          if (pz === '..') { base = base._p || base; continue; }
          const ya = hijo(base, pz);
          const ultima = i === partes.length - 1;
          if (ya) {
            if (ultima && !p) { out('mkdir: no se puede crear el directorio «' + x + '»: El archivo ya existe'); ok = false; return; }
            if (!ya.dir) { out('mkdir: no se puede crear el directorio «' + x + '»: No es un directorio'); ok = false; return; }
            base = ya; continue;
          }
          if (!ultima && !p) { out('mkdir: no se puede crear el directorio «' + x + '»: No existe el archivo o el directorio'); ok = false; return; }
          if (!L.puede(base, 'w', quien)) { out('mkdir: no se puede crear el directorio «' + x + '»: Permiso denegado'); ok = false; return; }
          const n = dir(pz, [], { dueno: quien, grupo: quien });
          base.hijos.push(n); enlazar(n, base); creadas.push(n);
          base = n;
        }
      });
      if (creadas.length) { L.emit('fs', { tipo: 'nueva', nodos: creadas, origen: 'terminal' }); L.refrescar(); }
      return { ok, creadas };
    },
    touch: ({ L, T, a, out, quien }) => {
      if (!a.length) { out('touch: falta un operando del archivo'); return { ok: false }; }
      let ok = true; const creados = [];
      a.forEach(x => {
        const r = L.resolver(x, T.cwd);
        if (r.nodo) return;
        const k = x.replace(/\/+$/, '').lastIndexOf('/');
        const padre = k === -1 ? T.cwd : L.resolver(x.slice(0, k) || '/', T.cwd).nodo;
        r.padre = padre; r.nombre = x.replace(/\/+$/, '').slice(k + 1);
        if (!padre || !padre.dir) { out("touch: no se puede efectuar 'touch' sobre '" + x + "': No existe el archivo o el directorio"); ok = false; return; }
        if (!L.puede(r.padre, 'w', quien)) { out("touch: no se puede efectuar 'touch' sobre '" + x + "': Permiso denegado"); ok = false; return; }
        const n = arch(r.nombre, 0, { dueno: quien, grupo: quien, contenido: '' });
        r.padre.hijos.push(n); enlazar(n, r.padre); creados.push(n);
      });
      if (creados.length) { L.emit('fs', { tipo: 'nuevo', nodos: creados, origen: 'terminal' }); L.refrescar(); }
      return { ok, creados };
    },
    cat: ({ L, T, a, out, quien }) => {
      if (!a.length) { out('(cat sin archivo espera que escribas: pulsa Ctrl + C para salir)'); return { ok: false }; }
      let ok = true;
      a.forEach(x => {
        const r = L.resolver(x, T.cwd);
        if (!r.nodo) { out('cat: ' + x + ': No existe el archivo o el directorio'); ok = false; return; }
        if (r.nodo.dir) { out('cat: ' + x + ': Es un directorio'); ok = false; return; }
        if (!L.puede(r.nodo, 'r', quien)) { out('cat: ' + x + ': Permiso denegado'); ok = false; return; }
        out(r.nodo.contenido != null ? r.nodo.contenido : '(es un archivo ' + tipoDe(r.nodo) + ': no se puede leer como texto)');
      });
      return { ok, archivos: a };
    },
    cp: (o) => copiarMover(o, false),
    mv: (o) => copiarMover(o, true),
    rm: ({ L, T, a, out, quien, expandir }) => {
      const r_ = a.some(x => /^-[a-zA-Z]*r/i.test(x));
      const f_ = a.some(x => /^-[a-zA-Z]*f/.test(x));
      const nombres = [].concat(...a.filter(x => x[0] !== '-').map(expandir));
      if (!nombres.length) { out('rm: falta un operando'); return { ok: false }; }
      let ok = true; const borrados = [];
      nombres.forEach(x => {
        const r = L.resolver(x, T.cwd);
        if (!r.nodo) { if (!f_) { out("rm: no se puede borrar '" + x + "': No existe el archivo o el directorio"); ok = false; } return; }
        const n = r.nodo;
        if (n === L.raiz || n === L.casa || L.esDentro(T.cwd, n)) { out("rm: no se puede borrar '" + x + "': En esta simulación no te dejo borrar esa carpeta"); ok = false; return; }
        if (n.dir && !r_) { out("rm: no se puede borrar '" + x + "': Es un directorio"); ok = false; return; }
        if (!L.puede(n._p, 'w', quien)) { out("rm: no se puede borrar '" + x + "': Permiso denegado"); ok = false; return; }
        n._p.hijos.splice(n._p.hijos.indexOf(n), 1);
        borrados.push(n);
      });
      if (borrados.length) { L.emit('fs', { tipo: 'eliminar', nodos: borrados, origen: 'terminal' }); L.refrescar(); }
      return { ok, borrados };
    },
    rmdir: ({ L, T, a, out, quien }) => {
      if (!a.length) { out('rmdir: falta un operando'); return { ok: false }; }
      let ok = true; const borrados = [];
      a.forEach(x => {
        const r = L.resolver(x, T.cwd);
        if (!r.nodo) { out("rmdir: fallo al borrar '" + x + "': No existe el archivo o el directorio"); ok = false; return; }
        if (!r.nodo.dir) { out("rmdir: fallo al borrar '" + x + "': No es un directorio"); ok = false; return; }
        if (r.nodo.hijos.length) { out("rmdir: fallo al borrar '" + x + "': El directorio no está vacío"); ok = false; return; }
        if (!L.puede(r.nodo._p, 'w', quien)) { out("rmdir: fallo al borrar '" + x + "': Permiso denegado"); ok = false; return; }
        r.nodo._p.hijos.splice(r.nodo._p.hijos.indexOf(r.nodo), 1); borrados.push(r.nodo);
      });
      if (borrados.length) { L.emit('fs', { tipo: 'eliminar', nodos: borrados, origen: 'terminal' }); L.refrescar(); }
      return { ok, borrados };
    },
    groups: ({ L, a, out }) => {
      const u = a[0] || L.usuario;
      if (L.usuarios.indexOf(u) === -1) { out("groups: '" + u + "': no existe ese usuario"); return { ok: false }; }
      out((a[0] ? u + ' : ' : '') + (u === L.usuario ? L.grupos.join(' ') : u + (L._gruposDe && L._gruposDe[u] ? ' ' + L._gruposDe[u].join(' ') : '')));
      return { ok: true, usuario: u };
    },
    id: ({ L, out, quien }) => { out(quien === 'root' ? 'uid=0(root) gid=0(root) grupos=0(root)' : 'uid=1000(' + L.usuario + ') gid=1000(' + L.usuario + ') grupos=1000(' + L.usuario + '),4(adm),24(cdrom),27(sudo)'); return true; },
    adduser: ({ L, a, out, quien, preguntar, escribe }) => {
      const u = a.filter(x => x[0] !== '-').pop();
      if (quien !== 'root') { out('fatal: Solo root puede añadir un usuario o un grupo al sistema.'); return { ok: false, error: 'root' }; }
      if (!u) { out('fatal: Solo se permite un nombre o dos.'); return { ok: false }; }
      if (!/^[a-z][a-z0-9_-]*$/.test(u)) { out('fatal: Introduzca un nombre de usuario que concuerde con la expresión regular configurada: el nombre va en minúsculas, sin espacios ni tildes.'); return { ok: false, error: 'nombre' }; }
      if (L.usuarios.indexOf(u) !== -1) { out("fatal: El usuario «" + u + "» ya existe."); return { ok: false, error: 'existe' }; }
      out('info: Añadiendo el usuario «' + u + '» ...\ninfo: Seleccionando UID/GID de 1000 a 59999 ...\ninfo: Añadiendo el nuevo grupo «' + u + '» (1001) ...\ninfo: Añadiendo el nuevo usuario «' + u + '» (1001) con grupo «' + u + ' (1001)» ...\ninfo: Creando el directorio personal «/home/' + u + '» ...\ninfo: Copiando los archivos desde «/etc/skel» ...');
      let clave1 = '';
      const fin = () => {
        L.usuarios.push(u);
        L._gruposDe = L._gruposDe || {};
        L._gruposDe[u] = ['users'];
        const casa = dir(u, [dir('Escritorio'), dir('Descargas'), dir('Documentos')], { dueno: u, grupo: u, perm: 'rwxr-x---' });
        (function d(x) { x.dueno = u; x.grupo = u; (x.hijos || []).forEach(d); })(casa);
        const h = L.resolver('/home').nodo;
        h.hijos.push(casa); enlazar(casa, h);
        escribe('info: Añadiendo el usuario «' + u + '» a los grupos complementarios «users» ...');
        L.emit('usuario', { tipo: 'nuevo', usuario: u });
        L.refrescar();
      };
      const datos = ['Nombre completo []: ', 'Número de habitación []: ', 'Teléfono del trabajo []: ', 'Teléfono de casa []: ', 'Otro []: '];
      const pasoDatos = (i) => {
        if (i === 0) escribe('Cambiando la información de usuario para ' + u + '\nIntroduzca el nuevo valor, o pulse INTRO para usar el valor predeterminado');
        if (i < datos.length) { preguntar('\t' + datos[i], false, () => pasoDatos(i + 1)); return; }
        preguntar('¿Es correcta la información? [S/n] ', false, r => { if (/^n/i.test(r.trim())) pasoDatos(0); else fin(); });
      };
      const pide1 = () => preguntar('Nueva contraseña: ', true, x => { clave1 = x; preguntar('Vuelva a escribir la nueva contraseña: ', true, y => {
        if (!x) { escribe('No se ha escrito ninguna contraseña.'); pide1(); return; }
        if (x !== y) { escribe('Las contraseñas no coinciden.\npasswd: Error de manipulación del testigo de autenticación'); pide1(); return; }
        escribe('passwd: contraseña actualizada correctamente');
        pasoDatos(0);
      }); });
      pide1();
      return { ok: true, espera: true, usuario: u };
    },
    apt: (o) => apt(o),
    'apt-get': (o) => apt(o),
    chmod: ({ L, T, a, out, quien }) => {
      if (a.length < 2) { out('chmod: falta un operando\nPruebe «chmod --help» para más información.'); return { ok: false }; }
      const modo = a[0];
      let ok = true; const cambiados = [];
      a.slice(1).forEach(x => {
        const r = L.resolver(x, T.cwd);
        if (!r.nodo) { out("chmod: no se puede acceder a '" + x + "': No existe el archivo o el directorio"); ok = false; return; }
        const n = r.nodo;
        if (quien !== 'root' && n.dueno !== quien) { out("chmod: cambiando los permisos de '" + x + "': Operación no permitida"); ok = false; return; }
        const antes = n.perm;
        if (/^[0-7]{3}$/.test(modo)) n.perm = permDeOctal(modo);
        else {
          const m = /^([ugoa]*)([+\-=])([rwx]*)$/.exec(modo);
          if (!m) { out("chmod: modo inválido: «" + modo + "»"); ok = false; return; }
          const quienes = (m[1] || 'a').replace('a', 'ugo');
          const p = n.perm.split('');
          [['u', 0], ['g', 3], ['o', 6]].forEach(([q, i]) => {
            if (quienes.indexOf(q) === -1) return;
            ['r', 'w', 'x'].forEach((l, j) => {
              const tiene = m[3].indexOf(l) !== -1;
              if (m[2] === '+' && tiene) p[i + j] = l;
              if (m[2] === '-' && tiene) p[i + j] = '-';
              if (m[2] === '=') p[i + j] = tiene ? l : '-';
            });
          });
          n.perm = p.join('');
        }
        cambiados.push(n);
        L.emit('permisos', { nodo: n, antes, origen: 'terminal', modo });
      });
      if (cambiados.length) L.refrescar();
      return { ok, modo, cambiados };
    },
    chown: ({ L, T, a, out, quien }) => {
      if (a.length < 2) { out('chown: falta un operando'); return { ok: false }; }
      const [u, g] = a[0].split(':');
      let ok = true;
      a.slice(1).forEach(x => {
        const r = L.resolver(x, T.cwd);
        if (!r.nodo) { out("chown: no se puede acceder a '" + x + "': No existe el archivo o el directorio"); ok = false; return; }
        if (quien !== 'root') { out("chown: cambiando el propietario de '" + x + "': Operación no permitida"); ok = false; return; }
        if (L.usuarios.indexOf(u) === -1 && u !== 'root') { out("chown: usuario inválido: «" + a[0] + "»"); ok = false; return; }
        r.nodo.dueno = u; if (g) r.nodo.grupo = g;
        L.emit('fs', { tipo: 'dueno', nodo: r.nodo });
      });
      L.refrescar();
      return { ok };
    },
    df: ({ L, a, out }) => {
      const h = a.indexOf('-h') !== -1;
      const f = b => h ? corto(b) : String(Math.round(b / KB));
      out('S.ficheros      ' + (h ? 'Tamaño Usados  Disp Uso%' : '  1K-bloques    Usados    Disponibles Uso%') + ' Montado en');
      out('/dev/sda2       ' + [f(228 * GB), f(132 * GB), f(86.4 * GB), '61%'].map(x => x.padStart(6)).join(' ') + ' /');
      out('tmpfs           ' + [f(3.8 * GB), f(2 * MB), f(3.8 * GB), '1%'].map(x => x.padStart(6)).join(' ') + ' /run');
      out('/dev/sda1       ' + [f(512 * MB), f(6 * MB), f(506 * MB), '2%'].map(x => x.padStart(6)).join(' ') + ' /boot/efi');
      if (L.usb && L.usb.montado) {
        const usado = peso(L.usb.nodo), cap = L.usb.capacidad;
        out('/dev/sdb1       ' + [f(cap), f(usado), f(cap - usado), Math.max(1, Math.round(usado / cap * 100)) + '%'].map(x => x.padStart(6)).join(' ') + ' /media/' + L.usuario + '/' + L.usb.etiqueta);
      }
      return { ok: true, h };
    },
    lsblk: ({ L, a, out }) => {
      const fsCol = a.some(x => /f/.test(x));
      out('NAME   ' + (fsCol ? 'FSTYPE LABEL      ' : '') + ' SIZE TYPE MOUNTPOINTS');
      out('sda    ' + (fsCol ? '                  ' : '') + '238,5G disk');
      out('├─sda1 ' + (fsCol ? 'vfat              ' : '') + '  512M part /boot/efi');
      out('└─sda2 ' + (fsCol ? 'ext4              ' : '') + '  238G part /');
      if (L.usb && L.usb.conectado && !L.usb.expulsado) {
        out('sdb    ' + (fsCol ? '                  ' : '') + corto(L.usb.capacidad).padStart(6) + ' disk');
        out('└─sdb1 ' + (fsCol ? (L.usb.formato.toLowerCase().padEnd(7) + L.usb.etiqueta.padEnd(11)) : '') + corto(L.usb.capacidad).padStart(6) + ' part ' + (L.usb.montado ? '/media/' + L.usuario + '/' + L.usb.etiqueta : ''));
      }
      return { ok: true, fs: fsCol };
    },
    ps: ({ L, a, out }) => {
      const todo = a.some(x => /a|e|x/.test(x));
      if (!todo) { out('    PID TTY          TIME CMD\n   2471 pts/0    00:00:00 bash\n   2533 pts/0    00:00:00 ps'); return { ok: true }; }
      if (a.indexOf('aux') !== -1 || a.indexOf('-aux') !== -1) {
        out('USUARIO      PID %CPU %MEM COMANDO');
        L.procesos.forEach(p => out(p.usuario.padEnd(9) + String(p.pid).padStart(7) + String(p.cpu.toFixed(1)).replace('.', ',').padStart(5) + String((p.mem / 79).toFixed(1)).replace('.', ',').padStart(5) + ' ' + p.n));
      } else {
        out('    PID TTY          TIME CMD');
        L.procesos.forEach(p => out(String(p.pid).padStart(7) + ' ?        00:0' + Math.min(9, Math.round(p.cpu / 12)) + ':1' + (p.pid % 10) + ' ' + p.n));
      }
      return { ok: true, todo };
    },
    top: ({ L, out }) => {
      out('top - 16:05:33 arriba 25 min,  1 usuario,  carga media: 1,42, 0,98, 0,61\nTareas: ' + (L.procesos.length + 180) + ' total,   1 ejecutar\n%Cpu(s): ' + L.procesos.reduce((x, p) => x + p.cpu, 0).toFixed(1).replace('.', ',') + ' us\nMiB Mem :   7810,0 total\n');
      out('    PID USUARIO   %CPU  RES COMMAND');
      L.procesos.slice().sort((p, q) => q.cpu - p.cpu).slice(0, 10).forEach(p => out(String(p.pid).padStart(7) + ' ' + p.usuario.padEnd(9) + String(p.cpu.toFixed(1)).replace('.', ',').padStart(5) + ' ' + (p.mem + 'M').padStart(5) + ' ' + p.n));
      out('(En la terminal de verdad, top se queda abierto y se sale con la tecla q.)');
      return { ok: true };
    },
    kill: ({ L, a, out, quien }) => {
      const nueve = a.indexOf('-9') !== -1 || a.indexOf('-KILL') !== -1 || a.indexOf('-SIGKILL') !== -1;
      const pids = a.filter(x => /^\d+$/.test(x));
      if (!pids.length) { out('kill: uso: kill [-s señal | -n número | -señal] pid ...'); return { ok: false }; }
      let ok = true; const muertos = [], tercos = [];
      pids.forEach(x => {
        const p = L.procesos.find(q => String(q.pid) === x);
        if (!p) { out('bash: kill: (' + x + ') - No existe el proceso'); ok = false; return; }
        if (p.usuario !== quien && quien !== 'root') { out('bash: kill: (' + x + ') - Operación no permitida'); ok = false; return; }
        if (p.terco && !nueve) { tercos.push(p); L.emit('proceso', { tipo: 'terco', p, origen: 'terminal' }); return; }
        L.procesos.splice(L.procesos.indexOf(p), 1); muertos.push(p);
        L.emit('proceso', { tipo: nueve ? 'matar' : 'terminar', p, origen: 'terminal' });
      });
      if (muertos.length || tercos.length) L.refrescarProcesos && L.refrescarProcesos();
      return { ok, muertos, tercos, nueve };
    },
    killall: ({ L, a, out, quien }) => {
      const nombre = a.filter(x => x[0] !== '-').pop();
      const nueve = a.indexOf('-9') !== -1;
      const ps = L.procesos.filter(p => p.n === nombre);
      if (!ps.length) { out(nombre + ': no se ha encontrado ningún proceso'); return { ok: false }; }
      const muertos = [];
      ps.forEach(p => {
        if (p.usuario !== quien && quien !== 'root') { out(nombre + '(' + p.pid + '): Operación no permitida'); return; }
        if (p.terco && !nueve) { L.emit('proceso', { tipo: 'terco', p, origen: 'terminal' }); return; }
        L.procesos.splice(L.procesos.indexOf(p), 1); muertos.push(p);
        L.emit('proceso', { tipo: nueve ? 'matar' : 'terminar', p, origen: 'terminal' });
      });
      L.refrescarProcesos && L.refrescarProcesos();
      return { ok: true, muertos };
    },
    nano: ({ out }) => { out('nano es un editor dentro de la terminal. En esta simulación usa el Editor de textos (doble clic en el archivo).'); return true; },
  };
  function copiarMover({ L, T, a, out, quien, expandir }, mover) {
    const o = mover ? 'mv' : 'cp';
    const rec = a.some(x => /^-[a-zA-Z]*r/i.test(x));
    const args = [].concat(...a.filter(x => x[0] !== '-').map(expandir));
    if (args.length < 2) { out(args.length ? o + ": falta el archivo de destino después de '" + args[0] + "'" : o + ': falta un operando'); return { ok: false, error: 'operando' }; }
    const destTxt = args.pop();
    const rd = L.resolver(destTxt, T.cwd);
    let ok = true; const hechos = [];
    if (args.length > 1 && (!rd.nodo || !rd.nodo.dir)) { out(o + ": el destino '" + destTxt + "' no es un directorio"); return { ok: false }; }
    args.forEach(x => {
      const r = L.resolver(x, T.cwd);
      if (!r.nodo) { out(o + ": no se puede efectuar 'stat' sobre '" + x + "': No existe el archivo o el directorio"); ok = false; return; }
      const n = r.nodo;
      if (!mover && n.dir && !rec) { out("cp: -r no especificado; se omite el directorio '" + x + "'"); ok = false; return; }
      let d, nombre;
      if (rd.nodo && rd.nodo.dir) { d = rd.nodo; nombre = n.n; }
      else if (!rd.nodo && rd.padre && rd.error === 'noexiste' && (destTxt.indexOf('/') === -1 || L.resolver(destTxt.replace(/\/[^/]*$/, '') || '/', T.cwd).nodo === rd.padre)) { d = rd.padre; nombre = rd.nombre; }
      else if (rd.nodo && !rd.nodo.dir) { d = rd.nodo._p; nombre = rd.nodo.n; }
      else { out(o + ": no se puede crear el fichero regular '" + destTxt + "': No existe el archivo o el directorio"); ok = false; return; }
      if (n.dir && L.esDentro(d, n)) { out(o + ": no se puede " + (mover ? 'mover' : 'copiar') + " un directorio, '" + x + "', a un subdirectorio de sí mismo"); ok = false; return; }
      if (!L.puede(d, 'w', quien) || (mover && !L.puede(n._p, 'w', quien))) { out(o + (mover ? ": no se puede mover '" + x + "'" : ": no se puede crear el fichero regular '" + destTxt + "'") + ': Permiso denegado'); ok = false; return; }
      if (L.usb && L.usb.nodo && L.esDentro(d, L.usb.nodo) && !L.esDentro(n, L.usb.nodo) && peso(n) > libreDe(L.usb.capacidad, L.usb.nodo)) { out(o + ": error al escribir '" + destTxt + "': No queda espacio en el dispositivo"); ok = false; return; }
      const ya = hijo(d, nombre);
      if (ya && ya.dir && !n.dir) { out(o + ": no se puede sobrescribir el directorio '" + nombre + "' con un no-directorio"); ok = false; return; }
      if (ya && ya !== n) d.hijos.splice(d.hijos.indexOf(ya), 1);
      let nuevo;
      if (mover) { if (ya === n) return; n._p.hijos.splice(n._p.hijos.indexOf(n), 1); nuevo = n; nuevo.n = nombre; }
      else { nuevo = clonar(n); nuevo.n = nombre; (function du(y) { y.dueno = quien; y.grupo = quien; (y.hijos || []).forEach(du); })(nuevo); }
      d.hijos.push(nuevo); enlazar(nuevo, d);
      hechos.push({ de: n, a: nuevo, destino: d, sobrescrito: ya });
    });
    if (hechos.length) { L.emit('fs', { tipo: mover ? 'mover' : 'copiar', hechos, origen: 'terminal' }); L.refrescar(); }
    return { ok, hechos, rec };
  }
  function apt({ L, a, out, quien, preguntar, escribe }) {
    const sub = a[0];
    const pk = a.slice(1).filter(x => x[0] !== '-');
    const si = a.indexOf('-y') !== -1;
    if (!sub) { out('apt 2.7.14 (amd64)\nUso: apt [opciones] orden\n\nÓrdenes más usadas:\n  update - actualiza la lista de paquetes disponibles\n  upgrade - actualiza los programas instalados\n  install - instala paquetes\n  remove - desinstala paquetes\n  search - busca paquetes'); return { ok: true, sub: '' }; }
    if (sub === 'search') {
      const q = (pk[0] || '').toLowerCase();
      out('Ordenando... Hecho\nBúsqueda en todo el texto... Hecho');
      Object.keys(L.paquetes).filter(k => k.indexOf(q) !== -1 || L.paquetes[k].desc.indexOf(q) !== -1).forEach(k => out(k + '/noble ' + (L.instalados.indexOf(k) !== -1 ? '[instalado]' : '') + '\n  ' + L.paquetes[k].desc + '\n'));
      return { ok: true, sub };
    }
    if (sub === 'list') { out('Listando... Hecho'); L.instalados.forEach(k => out(k + '/noble,now [instalado]')); return { ok: true, sub }; }
    if (quien !== 'root') {
      if (sub === 'update') out('Leyendo lista de paquetes... Hecho\nE: No se pudo abrir el archivo de bloqueo /var/lib/apt/lists/lock - open (13: Permiso denegado)\nE: No se pudo bloquear el directorio /var/lib/apt/lists/');
      else out('E: No se pudo abrir el archivo de bloqueo /var/lib/dpkg/lock-frontend - open (13: Permiso denegado)\nE: No se pudo obtener el bloqueo de la interfaz dpkg (/var/lib/dpkg/lock-frontend), ¿es usted superusuario?');
      return { ok: false, sub, paquetes: pk, error: 'root' };
    }
    if (sub === 'update') {
      out('Obj:1 http://packages.linuxmint.com wilma InRelease\nObj:2 http://archive.ubuntu.com/ubuntu noble InRelease\nDes:3 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]\nDescargados 126 kB en 1s (98,4 kB/s)\nLeyendo lista de paquetes... Hecho\nCreando árbol de dependencias... Hecho\nLeyendo la información de estado... Hecho\nSe pueden actualizar 12 paquetes. Ejecute «apt list --upgradable» para verlos.');
      L.aptActualizado = true;
      L.emit('apt', { sub: 'update' });
      return { ok: true, sub };
    }
    if (sub === 'upgrade') {
      out('Leyendo lista de paquetes... Hecho\nCreando árbol de dependencias... Hecho\nCalculando la actualización... Hecho\nSe actualizarán los siguientes paquetes:\n  firefox libreoffice-writer mint-upgrade-info ...\n12 actualizados, 0 nuevos se instalarán, 0 para eliminar y 0 no actualizados.');
      const fin = () => { escribe('Configurando firefox ...\nProcesando disparadores para mint-common ...'); L.emit('apt', { sub: 'upgrade' }); };
      if (si) { fin(); return { ok: true, sub }; }
      preguntar('¿Desea continuar? [S/n] ', false, r => { if (/^n/i.test(r.trim())) { escribe('Abortado.'); return; } fin(); });
      return { ok: true, sub, espera: true };
    }
    if (sub === 'install' || sub === 'remove' || sub === 'purge') {
      if (!pk.length) { out('Leyendo lista de paquetes... Hecho\nCreando árbol de dependencias... Hecho\n0 actualizados, 0 nuevos se instalarán, 0 para eliminar y 12 no actualizados.'); return { ok: true, sub }; }
      out('Leyendo lista de paquetes... Hecho\nCreando árbol de dependencias... Hecho\nLeyendo la información de estado... Hecho');
      for (const p of pk) { if (!L.paquetes[p]) { out('E: No se ha podido localizar el paquete ' + p); L.emit('apt', { sub, paquete: p, error: 'noexiste' }); return { ok: false, sub, paquetes: pk, error: 'noexiste' }; } }
      if (sub === 'install') {
        const nuevos = pk.filter(p => L.instalados.indexOf(p) === -1);
        pk.filter(p => L.instalados.indexOf(p) !== -1).forEach(p => out(p + ' ya está en su versión más reciente.'));
        if (!nuevos.length) { out('0 actualizados, 0 nuevos se instalarán, 0 para eliminar y 12 no actualizados.'); return { ok: true, sub, paquetes: pk, ya: true }; }
        const dep = nuevos.reduce((x, p) => x + L.paquetes[p].dep, 0);
        const mb = nuevos.reduce((x, p) => x + L.paquetes[p].tam, 0);
        out('Se instalarán los siguientes paquetes NUEVOS:\n  ' + nuevos.join(' ') + (dep ? ' (y ' + dep + ' paquetes que necesitan)' : '') + '\n0 actualizados, ' + (nuevos.length + dep) + ' nuevos se instalarán, 0 para eliminar y 12 no actualizados.\nSe necesita descargar ' + num(mb, 1) + ' MB de archivos.');
        const fin = () => {
          nuevos.forEach(p => { escribe('Des:1 http://archive.ubuntu.com/ubuntu noble/universe amd64 ' + p + ' [' + num(L.paquetes[p].tam * 1024, 0) + ' kB]'); });
          nuevos.forEach(p => { escribe('Desempaquetando ' + p + ' ...\nConfigurando ' + p + ' ...'); L.instalados.push(p); });
          escribe('Procesando disparadores para man-db ...');
          L.emit('apt', { sub: 'install', paquetes: nuevos });
          L.emit('instalar', { paquetes: nuevos, origen: 'terminal' });
        };
        if (si) { fin(); return { ok: true, sub, paquetes: pk }; }
        preguntar('¿Desea continuar? [S/n] ', false, r => { if (/^n/i.test(r.trim())) { escribe('Abortado.'); L.emit('apt', { sub, abortado: true }); return; } fin(); });
        return { ok: true, sub, paquetes: pk, espera: true };
      }
      const quitar = pk.filter(p => L.instalados.indexOf(p) !== -1);
      pk.filter(p => L.instalados.indexOf(p) === -1).forEach(p => out('El paquete «' + p + '» no está instalado, no se eliminará'));
      if (!quitar.length) { out('0 actualizados, 0 nuevos se instalarán, 0 para eliminar y 12 no actualizados.'); return { ok: true, sub, paquetes: pk }; }
      out('Se ELIMINARÁN los siguientes paquetes:\n  ' + quitar.join(' ') + '\n0 actualizados, 0 nuevos se instalarán, ' + quitar.length + ' para eliminar y 12 no actualizados.');
      const fin = () => { quitar.forEach(p => { escribe('Desinstalando ' + p + ' ...'); L.instalados.splice(L.instalados.indexOf(p), 1); }); L.emit('apt', { sub: 'remove', paquetes: quitar }); L.emit('desinstalar', { paquetes: quitar, origen: 'terminal' }); };
      if (si) { fin(); return { ok: true, sub }; }
      preguntar('¿Desea continuar? [S/n] ', false, r => { if (/^n/i.test(r.trim())) { escribe('Abortado.'); return; } fin(); });
      return { ok: true, sub, paquetes: pk, espera: true };
    }
    out('E: Opción de línea de órdenes «' + sub + '» no válida');
    return { ok: false, sub };
  }

  /* ============================================================
     Gestor de tareas (xfce4-taskmanager)
     ============================================================ */
  function gestorTareas(L, o) {
    o = o || {};
    let orden = o.orden || L.op.ordenTareas || 'cpu', sel = null, filtro = '';
    const v = L.abrir({ app: 'tareas', titulo: 'Gestor de tareas', icono: 'tareas', ancho: 70, alto: 78, crear: c => {
      c.classList.add('mint-tm');
      const arriba = el('div', 'mint-tm__arriba');
      const cpu = el('div', 'mint-tm__medidor');
      const mem = el('div', 'mint-tm__medidor');
      const busca = document.createElement('input');
      busca.type = 'search';
      busca.className = 'mint-input mint-tm__buscar';
      busca.placeholder = 'Filtrar procesos';
      busca.setAttribute('aria-label', 'Filtrar procesos');
      busca.addEventListener('input', () => { filtro = busca.value.toLowerCase(); pintar(); });
      arriba.append(cpu, mem, busca);
      const tabla = el('div', 'mint-tm__tabla');
      tabla.setAttribute('role', 'table');
      c.append(arriba, tabla);
      function medidor(caja, t, val) {
        caja.innerHTML = '';
        caja.append(el('span', 'mint-tm__mt', t + ': ' + num(val, 0) + ' %'));
        const b = el('span', 'mint-tm__barra');
        const r = el('span', 'mint-tm__relleno' + (val > 80 ? ' mint-tm__relleno--alto' : ''));
        r.style.width = Math.min(100, val) + '%';
        b.appendChild(r);
        caja.appendChild(b);
      }
      function pintar() {
        const tot = L.procesos.reduce((x, p) => x + p.cpu, 0);
        medidor(cpu, 'CPU', Math.min(100, tot));
        medidor(mem, 'Memoria', Math.min(100, 18 + L.procesos.reduce((x, p) => x + p.mem, 0) / 79));
        tabla.innerHTML = '';
        const cab = el('div', 'mint-tm__fila mint-tm__fila--cab');
        cab.setAttribute('role', 'row');
        [['n', 'Tarea'], ['pid', 'PID'], ['mem', 'Memoria'], ['cpu', 'CPU']].forEach(([k, t]) => {
          const b = boton(t + (orden === k ? ' ▾' : ''), 'mint-tm__col');
          b.setAttribute('role', 'columnheader');
          b.addEventListener('click', () => { orden = k; L.emit('tareas', { tipo: 'ordenar', por: k }); pintar(); });
          cab.appendChild(b);
        });
        tabla.appendChild(cab);
        L.procesos.filter(p => !filtro || p.n.toLowerCase().indexOf(filtro) !== -1)
          .sort((a, b) => orden === 'n' ? a.n.localeCompare(b.n) : orden === 'pid' ? a.pid - b.pid : b[orden] - a[orden])
          .forEach(p => {
            const f = boton('', 'mint-tm__fila' + (p === sel ? ' mint-tm__fila--sel' : '') + (p.colgado ? ' mint-tm__fila--colgado' : ''));
            f.setAttribute('role', 'row');
            [p.n + (p.colgado ? ' (no responde)' : ''), String(p.pid), p.mem + ' MiB', num(p.cpu, 1) + ' %'].forEach((t, i) => { const s = el('span', 'mint-tm__c', t); s.setAttribute('role', 'cell'); if (i === 0) s.setAttribute('translate', 'no'); f.appendChild(s); });
            f.addEventListener('click', () => { sel = p; pintar(); });
            f.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); sel = p; pintar(); menu(e.clientX, e.clientY, p); });
            f.addEventListener('keydown', e => { if (e.key === 'Delete') { e.preventDefault(); e.stopPropagation(); senal(p, false); } });
            tabla.appendChild(f);
          });
      }
      function senal(p, matar) {
        if (p.sistema && p.usuario === 'root') { L.dialogo({ titulo: 'Error', icono: 'error', texto: 'No se ha podido ' + (matar ? 'matar' : 'terminar') + ' «' + p.n + '»: es de root (Operación no permitida).' }); return; }
        const hazlo = () => {
          if (p.terco && !matar) { L.emit('proceso', { tipo: 'terco', p, origen: 'gestor' }); L.notificacion('«' + p.n + '» no hace caso', 'Le has pedido que se cierre (Terminar), pero sigue colgado. Prueba con Matar.', 'aviso'); pintar(); return; }
          L.procesos.splice(L.procesos.indexOf(p), 1);
          if (sel === p) sel = null;
          L.emit('proceso', { tipo: matar ? 'matar' : 'terminar', p, origen: 'gestor' });
          if (p.ventana && L.ventanas.indexOf(p.ventana) !== -1) p.ventana.cerrar('matar');
          if (p.alMorir) p.alMorir(L);
          pintar();
        };
        L.dialogo({ titulo: 'Gestor de tareas', icono: 'pregunta', texto: '¿Seguro que quieres ' + (matar ? 'matar' : 'terminar') + ' la tarea «' + p.n + '»' + ' (PID ' + p.pid + ')?', botones: [{ t: 'Cancelar' }, { t: matar ? 'Matar' : 'Terminar', primario: true, f: hazlo }] });
      }
      function menu(x, y, p) {
        L.menu(x, y, [
          { t: 'Detener', f: () => { p.estado = 'T'; L.emit('proceso', { tipo: 'detener', p }); } },
          { t: 'Continuar', f: () => { p.estado = 'S'; } },
          { t: 'Terminar', atajo: 'Supr', f: () => senal(p, false) },
          { t: 'Matar', f: () => senal(p, true) },
          { sep: true },
          { t: 'Prioridad', sub: [{ t: 'Muy baja' }, { t: 'Baja' }, { t: 'Normal', marca: true }, { t: 'Alta', off: true }] },
        ]);
      }
      L.refrescarProcesos = pintar;
      pintar();
    } });
    return v;
  }

  window.MINT = {
    escritorio, icono, IC,
    fs: { dir, arch, KB, MB, GB, tamano, corto, peso, ruta, hijo, enlazar, permDeOctal, octalDe, ext },
    abrirNodo, thunar, propiedades,
  };
})();
