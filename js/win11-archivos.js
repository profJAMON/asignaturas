/* ============================================================
   Windows 11 de mentira: archivos (15/11/2026)
   ============================================================
   Completa js/win11.js (va justo después en tema.html). Cuando una
   simulación le pasa un disco (op.fs), el escritorio enseña los
   iconos de la carpeta Escritorio y la Papelera, y se pueden abrir
   ventanas del Explorador de archivos de Windows 11:

     - barra de direcciones con migas (clic para escribir la ruta
       de verdad, C:\Users\alumno\Desktop) y cuadro de búsqueda
       (también *.pdf);
     - barra de comandos: Nuevo, cortar, copiar, pegar, cambiar
       nombre, eliminar, Ordenar, Ver (extensiones y elementos
       ocultos), ⋯;
     - panel de navegación, lista en detalles, barra de estado;
     - clic, doble clic, clic derecho (menú de Windows 11 y
       «Mostrar más opciones» con «Enviar a»), arrastrar y soltar
       (mover en la misma unidad, copiar a otra), F2, Supr,
       Shift + Supr, Ctrl + C / X / V / Z / A, Intro, Retroceso;
     - Papelera (restaurar, vaciar), accesos directos con flecha,
       atributos (solo lectura, oculto), Propiedades, comprimir y
       extraer, formatear y expulsar un USB, el límite de 4 GB de
       FAT32 y el espacio libre de cada unidad (×1024).

   Lo usan las simulaciones de la U1 (js/sim-archivos.js) y de la
   U6, Windows (js/sim-windows.js). Para un disco:
     const { carpeta, archivo, unidad, equipo, usuario, KB, MB, GB } = WIN11.fs;
   Eventos: W.on('fs', d => …) con d.tipo = 'abrir', 'mover',
   'copiar', 'eliminar', 'restaurar', 'vaciar', 'renombrar',
   'nueva', 'acceso', 'atributos', 'propiedades', 'comprimir',
   'extraer', 'formatear', 'expulsar', 'buscar', 'vista', 'ruta',
   'error', 'ejecutar'; y W.on('cambio') después de cada cambio.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window === 'undefined' || !window.WIN11 || !window.LAB) return;
  const { el, boton } = window.LAB;
  const { icono } = window.WIN11;

  const KB = 1024, MB = KB * 1024, GB = MB * 1024;
  const FAT32_MAX = 4 * GB - 1;
  const num = (x, d) => x.toLocaleString('es-ES', { maximumFractionDigits: d });
  function tamano(b) {
    if (b >= GB) return num(b / GB, 1) + ' GB';
    if (b >= MB) return num(b / MB, b >= 100 * MB ? 0 : 1) + ' MB';
    if (b >= KB) return Math.max(1, Math.round(b / KB)).toLocaleString('es-ES') + ' KB';
    return b + ' bytes';
  }
  const ext = n => ((/\.([^.\\]+)$/.exec(n) || [])[1] || '').toLowerCase();
  const sinTildes = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  /* ---------- Constructores del disco ---------- */
  const carpeta = (n, hijos, extra) => Object.assign({ n, carpeta: true, hijos: hijos || [] }, extra || {});
  const archivo = (n, t, extra) => Object.assign({ n, t: Math.round(t || 0) }, extra || {});
  const unidad = (letra, etiqueta, capacidad, libre, hijos, extra) => carpeta(letra, hijos, Object.assign({ unidad: true, etiqueta, capacidad, libre, fs: 'NTFS' }, extra || {}));
  const equipo = (...unidades) => carpeta('Este equipo', unidades, { raiz: true });
  function usuario(o) {
    o = o || {};
    return unidad('C:', 'Disco local', 237 * GB, o.libreC != null ? o.libreC : 112 * GB, [
      carpeta('Program Files', [carpeta('Google'), carpeta('Microsoft Office')]),
      carpeta('Users', [carpeta(o.nombre || 'alumno', [
        carpeta('Desktop', o.escritorio || []),
        carpeta('Documents', o.documentos || []),
        carpeta('Downloads', o.descargas || []),
        carpeta('Pictures', o.imagenes || []),
        carpeta('Music', o.musica || []),
        carpeta('Videos', o.videos || []),
      ])]),
      carpeta('Windows', [carpeta('System32')]),
    ].concat(o.raizC || []), { sistema: true });
  }
  const VISTA = { Users: 'Usuarios', Desktop: 'Escritorio', Downloads: 'Descargas', Documents: 'Documentos', Pictures: 'Imágenes', Music: 'Música', Videos: 'Vídeos', 'Program Files': 'Archivos de programa' };
  const ICONO_EXT = { txt: 'texto', docx: 'word', doc: 'word', odt: 'word', pdf: 'pdf', jpg: 'imagen', jpeg: 'imagen', png: 'imagen', webp: 'imagen', gif: 'imagen', mp4: 'video', avi: 'video', mkv: 'video', mov: 'video', mp3: 'musica', wav: 'musica', zip: 'zip', exe: 'exe', msi: 'exe', pptx: 'presentacion', html: 'navegador', iso: 'disco' };
  const TIPO_EXT = { txt: 'Documento de texto', docx: 'Documento de Microsoft Word', pdf: 'Documento PDF', jpg: 'Archivo JPG', jpeg: 'Archivo JPEG', png: 'Archivo PNG', webp: 'Archivo WEBP', mp4: 'Archivo MP4', mp3: 'Archivo MP3', zip: 'Carpeta comprimida (en zip)', exe: 'Aplicación', pptx: 'Presentación de PowerPoint', html: 'Documento HTML', css: 'Hoja de estilos CSS', iso: 'Archivo de imagen de disco' };
  const ABRE_CON = { txt: 'Bloc de notas', docx: 'Word', pdf: 'Microsoft Edge', jpg: 'Fotos', jpeg: 'Fotos', png: 'Fotos', webp: 'Fotos', mp4: 'Reproductor multimedia', mp3: 'Reproductor multimedia', pptx: 'PowerPoint', html: 'Google Chrome', zip: 'Explorador de Windows' };

  function enlazar(n, p) { n._p = p || null; (n.hijos || []).forEach(h => enlazar(h, n)); return n; }
  function peso(n) { return n.carpeta ? n.hijos.reduce((a, h) => a + peso(h), 0) : (n.acceso ? KB : n.t || 0); }
  function clonar(n) {
    const c = {};
    Object.keys(n).forEach(k => { if (k[0] !== '_') c[k] = n[k]; });
    if (n.hijos) c.hijos = n.hijos.map(clonar);
    if (n.permisos) c.permisos = JSON.parse(JSON.stringify(n.permisos));
    return c;
  }
  const cadena = n => { const r = []; for (let x = n; x; x = x._p) r.unshift(x); return r; };
  const unidadDe = n => cadena(n).find(x => x.unidad) || null;
  function rutaReal(n) {
    if (!n || n.raiz) return 'Este equipo';
    if (n.papelera) return 'Papelera de reciclaje';
    const c = cadena(n).filter(x => !x.raiz);
    return c[0].n + '\\' + c.slice(1).map(x => x.n).join('\\');
  }
  function contar(n) { let a = 0, c = 0; (function r(x) { (x.hijos || []).forEach(h => { if (h.carpeta) { c++; r(h); } else a++; }); })(n); return { a, c }; }

  /* ============================================================ */
  function archivos(W, op) {
    const ctx = W.ctx;
    const raiz = enlazar(op.fs);
    const PAPELERA = { n: 'Papelera de reciclaje', carpeta: true, papelera: true, hijos: [] };
    const exploradores = [];
    let port = null;          // portapapeles: { nodos, cortar }
    const deshacer = [];
    const usuarioRuta = op.usuarioRuta || ['C:', 'Users', 'alumno'];

    function buscar(nombres) {
      let n = raiz;
      for (const x of nombres) {
        if (!n.hijos) return null;
        n = n.hijos.find(h => h.n.toLowerCase() === String(x).toLowerCase());
        if (!n) return null;
      }
      return n;
    }
    const carpetaUsuario = sub => buscar(usuarioRuta.concat(sub ? [sub] : []));
    const escritorioNodo = () => carpetaUsuario('Desktop');
    const visto = n => {
      if (n.papelera) return n.n;
      if (n.unidad) return `${n.etiqueta || 'Unidad'} (${n.n})`;
      if (VISTA[n.n] && n._p && (n._p.n === 'Users' || (n._p._p && n._p._p.n === 'Users') || n._p.unidad)) return VISTA[n.n];
      if (n.carpeta || W.est.verExt || !/\.[^.]+$/.test(n.n)) return n.n;
      return n.n.replace(/\.[^.]+$/, '');
    };
    const iconoDe = n => n.papelera ? (n.hijos.length ? 'papelera-llena' : 'papelera') : n.unidad ? (n.usb ? 'usb' : n.sistema ? 'sistema' : 'disco') : n.raiz ? 'equipo'
      : n.acceso ? iconoDe(destinoDe(n) || { n: '' }) : n.carpeta ? 'carpeta' : (ICONO_EXT[ext(n.n)] || 'documento');
    const tipoDe = n => n.unidad ? (n.usb ? 'Unidad USB' : 'Disco local') : n.acceso ? 'Acceso directo' : n.carpeta ? 'Carpeta de archivos' : (TIPO_EXT[ext(n.n)] || 'Archivo ' + ext(n.n).toUpperCase());
    function destinoDe(n) { if (!n.acceso) return null; const d = buscar(n.acceso); return d && !d.expulsado ? d : null; }
    const fs = (tipo, d) => { W.emit('fs', Object.assign({ tipo }, d || {})); };
    function cambio() { repintar(); W.emit('cambio', {}); }
    function repintar() { exploradores.slice().forEach(E => E.pintar()); W.pintarIconos(); }

    /* ---- operaciones ---- */
    function libre(u) { return u ? u.libre : Infinity; }
    function puedeEntrar(nodos, dest, cortar) {
      const u = unidadDe(dest);
      const misma = nodos.every(n => unidadDe(n) === u);
      if (u && u.fs === 'FAT32') {
        const grande = [];
        nodos.forEach(n => (function r(x) { if (x.carpeta) x.hijos.forEach(r); else if ((x.t || 0) > FAT32_MAX) grande.push(x); })(n));
        if (grande.length) {
          W.dialogo({ titulo: 'Archivo demasiado grande', icono: 'error', texto: [`El archivo «${grande[0].n}» es demasiado grande para el sistema de archivos de destino.`] });
          fs('error', { error: 'fat32', nodo: grande[0], dest });
          return false;
        }
      }
      const total = nodos.reduce((a, n) => a + peso(n), 0);
      if (u && !(cortar && misma) && total > libre(u)) {
        W.dialogo({ titulo: 'No hay espacio suficiente', icono: 'error', texto: [`No hay espacio suficiente en ${visto(u)}.`, `Se necesitan ${tamano(total)} y quedan ${tamano(u.libre)} libres. Elimina algunos archivos o copia menos.`] });
        fs('error', { error: 'espacio', dest, total });
        return false;
      }
      return true;
    }
    function nombreLibre(dest, n) {
      if (!dest.hijos.some(h => h.n.toLowerCase() === n.toLowerCase())) return n;
      const m = /^(.*?)(\.[^.]+)?$/.exec(n);
      let k = 1, c;
      do { c = `${m[1]} - copia${k > 1 ? ' (' + k + ')' : ''}${m[2] || ''}`; k++; } while (dest.hijos.some(h => h.n.toLowerCase() === c.toLowerCase()));
      return c;
    }
    function meter(dest, nodos, cortar, origen) {
      if (dest.papelera) { eliminar(nodos); return true; }
      if (dest.raiz) { W.aviso('No se pueden guardar archivos directamente en «Este equipo». Entra en una unidad o carpeta.', 'cuidado'); return false; }
      if (nodos.some(n => n === dest || cadena(dest).indexOf(n) !== -1)) { W.dialogo({ titulo: 'Interrumpir acción', icono: 'error', texto: 'La carpeta de destino es una subcarpeta de la carpeta de origen.' }); return false; }
      const u = unidadDe(dest);
      if (cortar === 'auto') cortar = nodos.every(n => unidadDe(n) === u);
      if (cortar && nodos.every(n => n._p === dest)) return false;
      if (!puedeEntrar(nodos, dest, cortar)) return false;
      const hechos = [];
      nodos.forEach(n => {
        const choca = dest.hijos.find(h => h.n.toLowerCase() === n.n.toLowerCase());
        if (choca && (cortar || n._p !== dest)) {
          W.dialogo({ titulo: 'Reemplazar u omitir archivos', icono: 'aviso', texto: `El destino ya tiene un elemento llamado «${n.n}».`, botones: [
            { t: 'Reemplazar', primario: true, f: () => { quitar(choca); poner(n); cambio(); } }, { t: 'Omitir' }] });
          return;
        }
        poner(n);
      });
      function poner(n) {
        const uo = unidadDe(n);
        let nuevo = n;
        if (cortar) { quitar(n, true); if (uo && uo !== u) uo.libre += peso(n); }
        else { nuevo = clonar(n); nuevo.n = n._p === dest ? nombreLibre(dest, n.n) : n.n; }
        dest.hijos.push(nuevo);
        enlazar(nuevo, dest);
        if (u && (!cortar || uo !== u)) u.libre -= peso(nuevo);
        hechos.push({ n, nuevo });
      }
      if (hechos.length) {
        const txt = hechos.map(h => h.nuevo.n).join(', ');
        ctx.apunta(`${cortar ? 'Mover' : 'Copiar'} ${txt} a ${rutaReal(dest)}${origen ? ' (' + origen + ')' : ''}.`);
        if (cortar) deshacer.push({ t: 'mover', f: () => hechos.forEach(h => { quitar(h.nuevo, true); h.desde.hijos.push(h.nuevo); enlazar(h.nuevo, h.desde); }) });
        hechos.forEach(h => { h.desde = cortar ? (h.n._antes || null) : null; });
        fs(cortar ? 'mover' : 'copiar', { nodos: hechos.map(h => h.nuevo), dest, origen });
        cambio();
      }
      return true;
    }
    function quitar(n, mover) {
      const p = n._p;
      if (!p) return;
      n._antes = p;
      p.hijos.splice(p.hijos.indexOf(n), 1);
      if (!mover) { const u = unidadDe(p); if (u && !p.papelera) u.libre += peso(n); }
    }
    function eliminar(nodos, permanente) {
      nodos = nodos.filter(n => !n.unidad && !n.raiz && !n.papelera);
      if (!nodos.length) return;
      const enUsb = nodos.some(n => { const u = unidadDe(n); return u && u.usb; });
      const enPapelera = nodos.some(n => n._p && n._p.papelera);
      if (nodos.some(n => n.soloLectura) && !permanente) { /* Windows avisa al borrar uno de solo lectura */
        W.dialogo({ titulo: 'Eliminar archivo', icono: 'aviso', texto: [`«${nodos.find(n => n.soloLectura).n}» es de solo lectura.`, '¿Seguro que quieres moverlo a la Papelera de reciclaje?'], botones: [{ t: 'Sí', primario: true, f: () => { nodos.forEach(n => { n.soloLectura = false; }); hacer(); nodos.forEach(n => { n.soloLectura = true; }); } }, { t: 'No' }] });
        return;
      }
      if (permanente || enUsb || enPapelera) {
        const que = nodos.length === 1 ? `«${nodos[0].n}»` : `estos ${nodos.length} elementos`;
        W.dialogo({ titulo: nodos.length === 1 ? 'Eliminar archivo' : 'Eliminar varios elementos', icono: 'aviso', texto: [`¿Seguro que quieres eliminar ${que} de forma permanente?`].concat(enUsb && !permanente ? ['Los archivos de un USB no van a la Papelera.'] : []), botones: [{ t: 'Sí', primario: true, f: () => { borrarDeVerdad(nodos); } }, { t: 'No' }] });
        return;
      }
      hacer();
      function hacer() {
        nodos.forEach(n => {
          n._origen = cadena(n._p).filter(x => !x.raiz).map(x => x.n);
          quitar(n, true);
          PAPELERA.hijos.push(n);
          n._p = PAPELERA;
        });
        ctx.apunta(`Eliminar ${nodos.map(n => n.n).join(', ')}: va${nodos.length > 1 ? 'n' : ''} a la Papelera.`);
        deshacer.push({ t: 'eliminar', f: () => restaurar(nodos, true) });
        fs('eliminar', { nodos, permanente: false });
        cambio();
      }
    }
    function borrarDeVerdad(nodos) {
      nodos.forEach(n => {
        if (n._p && n._p.papelera) { PAPELERA.hijos.splice(PAPELERA.hijos.indexOf(n), 1); const u = buscar(n._origen.slice(0, 1)); if (u) u.libre += peso(n); }
        else quitar(n);
        n._borrado = true;
      });
      ctx.apunta(`Eliminar para siempre ${nodos.map(n => n.n).join(', ')} (no pasa por la Papelera).`);
      fs('eliminar', { nodos, permanente: true });
      cambio();
    }
    function restaurar(nodos, porDeshacer) {
      nodos.forEach(n => {
        const i = PAPELERA.hijos.indexOf(n);
        if (i === -1) return;
        PAPELERA.hijos.splice(i, 1);
        let dest = buscar(n._origen || usuarioRuta.concat('Desktop'));
        if (!dest) dest = escritorioNodo();
        dest.hijos.push(n);
        enlazar(n, dest);
      });
      ctx.apunta(`${porDeshacer ? 'Deshacer (Ctrl + Z): vuelve' : 'Restaurar desde la Papelera'} ${nodos.map(n => n.n).join(', ')}${porDeshacer ? '' : ' a ' + rutaReal(nodos[0]._p)}.`);
      fs('restaurar', { nodos, porDeshacer: !!porDeshacer });
      cambio();
    }
    function vaciar() {
      if (!PAPELERA.hijos.length) return;
      W.dialogo({ titulo: 'Eliminar varios elementos', icono: 'aviso', texto: `¿Seguro que quieres eliminar de forma permanente estos ${PAPELERA.hijos.length} elementos?`, botones: [{ t: 'Sí', primario: true, f: () => {
        const n = PAPELERA.hijos.slice();
        n.forEach(x => { const u = buscar((x._origen || ['C:']).slice(0, 1)); if (u) u.libre += peso(x); x._borrado = true; });
        PAPELERA.hijos = [];
        ctx.apunta(`Vaciar la Papelera de reciclaje (${n.length} elementos, ${tamano(n.reduce((a, x) => a + peso(x), 0))}).`);
        fs('vaciar', { nodos: n });
        cambio();
      } }, { t: 'No' }] });
    }
    function nueva(dest, tipo, E) {
      const base = tipo === 'txt' ? 'Nuevo documento de texto.txt' : 'Nueva carpeta';
      const nombre = nombreLibre(dest, base).replace(' - copia', ' ').replace(/\s+\(/, ' (');
      const n = tipo === 'txt' ? archivo(nombre, 0, { contenido: '' }) : carpeta(nombre);
      dest.hijos.push(n);
      enlazar(n, dest);
      ctx.apunta(`Nuevo → ${tipo === 'txt' ? 'Documento de texto' : 'Carpeta'} en ${rutaReal(dest)}.`);
      fs('nueva', { nodo: n, dest });
      cambio();
      if (E) { E.elegir([n]); E.renombrar(n); } else renombrarEscritorio(n);
      return n;
    }
    function crearAcceso(n, dest, origen) {
      dest = dest || escritorioNodo();
      const nom = nombreLibre(dest, n.n + ' - Acceso directo');
      const a = archivo(nom, KB, { acceso: cadena(n).filter(x => !x.raiz).map(x => x.n) });
      dest.hijos.push(a);
      enlazar(a, dest);
      ctx.apunta(`Crear acceso directo a «${n.n}» en ${rutaReal(dest)}${origen ? ' (' + origen + ')' : ''}.`);
      fs('acceso', { nodo: a, a: n, dest, origen });
      cambio();
      return a;
    }
    function renombrarNodo(n, nuevo) {
      nuevo = nuevo.trim();
      if (!nuevo || nuevo === n.n) return true;
      if (/[\\/:*?"<>|]/.test(nuevo)) { W.dialogo({ titulo: 'Cambiar nombre', icono: 'error', texto: 'Un nombre de archivo no puede contener ninguno de estos caracteres: \\ / : * ? " < > |' }); return false; }
      if (n._p && n._p.hijos.some(x => x !== n && x.n.toLowerCase() === nuevo.toLowerCase())) { W.dialogo({ titulo: 'Cambiar nombre', icono: 'error', texto: `Ya hay un elemento llamado «${nuevo}» en esta ubicación.` }); return false; }
      if (n.unidad) { const v = n.etiqueta; n.etiqueta = nuevo; ctx.apunta(`Cambiar el nombre de la unidad ${n.n}: «${v}» → «${nuevo}».`); fs('renombrar', { nodo: n, antes: v }); cambio(); return true; }
      const antes = n.n;
      const aplicar = () => {
        n.n = nuevo;
        ctx.apunta(`Cambiar el nombre: «${antes}» → «${nuevo}».`);
        deshacer.push({ t: 'renombrar', f: () => { n.n = antes; ctx.apunta(`Deshacer (Ctrl + Z): «${nuevo}» vuelve a llamarse «${antes}».`); } });
        fs('renombrar', { nodo: n, antes });
        cambio();
      };
      if (!n.carpeta && !n.acceso && ext(antes) && ext(nuevo) !== ext(antes)) {
        W.dialogo({ titulo: 'Cambiar nombre', icono: 'aviso', texto: ['Si cambias la extensión de un nombre de archivo, puede que este quede inutilizable.', '¿Seguro que quieres cambiarla?'], botones: [{ t: 'Sí', primario: true, f: aplicar }, { t: 'No' }] });
        return true;
      }
      aplicar();
      return true;
    }

    /* ---- abrir ---- */
    function abrirNodo(n, E, nuevaVentana) {
      if (n.acceso) {
        const d = destinoDe(n);
        fs('abrir', { nodo: n, acceso: true, destino: d });
        if (!d) { W.dialogo({ titulo: 'Problema con el acceso directo', icono: 'aviso', texto: `El elemento «${n.acceso[n.acceso.length - 1]}» al que hace referencia este acceso directo se ha cambiado o movido, por lo que el acceso directo ya no funcionará correctamente.` }); return; }
        ctx.apunta(`Abrir el acceso directo «${n.n}»: lleva a ${rutaReal(d)}.`);
        return abrirNodo(d, null, true);
      }
      if (n.carpeta || n.raiz) {
        if (n.expulsado) return;
        if (E && !nuevaVentana) { E.ir(n); fs('abrir', { nodo: n, E }); return; }
        const X = abrirExplorador(n);
        fs('abrir', { nodo: n, E: X });
        return X;
      }
      fs('abrir', { nodo: n });
      if (op.abrirArchivo && op.abrirArchivo(n, W) === true) return;
      const e = ext(n.n);
      if (e === 'zip') {
        if (E) { E.ir(n); return; }
        return abrirExplorador(n);
      }
      if (e === 'exe' || e === 'msi') {
        W.dialogo({ titulo: 'Control de cuentas de usuario', icono: 'escudo', texto: ['¿Quieres permitir que esta aplicación de un editor desconocido haga cambios en el dispositivo?', `${n.n}`, 'Editor: Desconocido · Origen del archivo: Disco duro de este equipo'], botones: [
          { t: 'Sí', f: () => { ctx.falla(`Ejecutar «${n.n}»: has dejado que un programa desconocido haga cambios en el equipo.`); fs('ejecutar', { nodo: n, si: true }); } },
          { t: 'No', primario: true, f: () => { ctx.apunta(`No dejar que se ejecute «${n.n}».`); fs('ejecutar', { nodo: n, si: false }); } }] });
        return;
      }
      if (e === 'txt') {
        return W.abrir({ app: 'bloc', titulo: n.n + ' - Bloc de notas', tituloNoTraducir: true, icono: 'bloc', ancho: 56, alto: 62, crear: c => {
          c.classList.add('w11-bloc');
          const menu = el('div', 'w11-bloc__menu');
          ['Archivo', 'Editar', 'Ver'].forEach(t => menu.appendChild(el('span', null, t)));
          const t = document.createElement('textarea');
          t.className = 'w11-bloc__texto';
          t.spellcheck = false;
          t.value = n.contenido || '';
          t.readOnly = !!n.soloLectura;
          t.setAttribute('aria-label', 'Texto de ' + n.n);
          c.append(menu, t);
          if (n.soloLectura) c.appendChild(el('div', 'w11-bloc__estado', 'Solo lectura: no se puede cambiar.'));
        }, onTecla: comb => {
          if (comb !== 'Ctrl + S') return false;
          const v = W.activa, t = v.cuerpo.querySelector('textarea');
          if (n.soloLectura) { W.dialogo({ titulo: 'Bloc de notas', icono: 'error', texto: `No se puede guardar «${n.n}»: es de solo lectura.` }); fs('error', { error: 'solo-lectura', nodo: n }); return true; }
          n.contenido = t.value; ctx.apunta(`Guardar «${n.n}» (Ctrl + S).`); fs('guardar', { nodo: n }); return true;
        } });
      }
      const con = ABRE_CON[e] || 'su programa';
      return W.abrir({ app: 'visor', titulo: `${n.n} - ${con}`, tituloNoTraducir: true, icono: iconoDe(n), ancho: 52, alto: 58, crear: c => {
        c.classList.add('w11-visor');
        c.appendChild(icono(iconoDe(n), 'w11-visor__ico'));
        const p = el('p', 'w11-visor__n', n.n);
        p.setAttribute('translate', 'no');
        c.appendChild(p);
        c.appendChild(el('p', 'w11-visor__t', `Se ha abierto con ${con}. En esta simulación no hace falta trabajar dentro.`));
      } });
    }

    /* ---- propiedades ---- */
    function propiedades(n) {
      fs('propiedades', { nodo: n });
      ctx.apunta(`Propiedades de «${visto(n)}»${n.unidad ? ': ' + tamano(n.libre) + ' libres de ' + tamano(n.capacidad) + ', ' + n.fs : n.carpeta || !n.acceso ? ': ' + tamano(peso(n)) : ''}.`);
      n._vistoTam = true;
      const ya = W.ventanas.find(v => v.def.propDe === n);
      if (ya) { ya.enfocar(); return; }
      let pend = { soloLectura: !!n.soloLectura, oculto: !!n.oculto, etiqueta: n.etiqueta };
      const extras = (op.pestanasPropiedades && op.pestanasPropiedades(n, W)) || [];
      return W.abrir({ app: 'propiedades', propDe: n, titulo: `Propiedades: ${visto(n)}`, icono: iconoDe(n), ancho: 46, alto: 86, rect: { x: 27, y: 4, w: 46, h: 88 }, crear: (c, v) => {
        c.classList.add('w11-prop');
        const tabs = el('div', 'w11-prop__tabs');
        tabs.setAttribute('role', 'tablist');
        const panel = el('div', 'w11-prop__panel');
        const lista = [{ t: 'General', crear: general }].concat(n.acceso ? [{ t: 'Acceso directo', crear: accesoTab }] : []).concat(extras);
        lista.forEach((p, i) => {
          const b = boton(p.t, 'w11-prop__tab');
          b.setAttribute('role', 'tab');
          b.addEventListener('click', () => elegir(i));
          tabs.appendChild(b);
        });
        function elegir(i) {
          tabs.querySelectorAll('.w11-prop__tab').forEach((b, j) => { b.setAttribute('aria-selected', String(i === j)); });
          panel.innerHTML = '';
          lista[i].crear(panel, v, W);
          if (lista[i].alAbrir) lista[i].alAbrir();
        }
        const pie = el('div', 'w11-prop__pie');
        const aplicar = () => {
          extras.forEach(p => p.aplicar && p.aplicar());
          if (n.unidad) { if (pend.etiqueta !== n.etiqueta) renombrarNodo(n, pend.etiqueta); return; }
          const camb = pend.soloLectura !== !!n.soloLectura || pend.oculto !== !!n.oculto;
          if (!camb) return;
          n.soloLectura = pend.soloLectura; n.oculto = pend.oculto;
          ctx.apunta(`Atributos de «${n.n}»: solo lectura ${n.soloLectura ? 'sí' : 'no'}, oculto ${n.oculto ? 'sí' : 'no'}.`);
          fs('atributos', { nodo: n });
          cambio();
        };
        const bA = boton('Aceptar', 'w11-btn w11-btn--primario'); bA.addEventListener('click', () => { aplicar(); v.cerrar(); });
        const bC = boton('Cancelar', 'w11-btn'); bC.addEventListener('click', () => v.cerrar());
        const bP = boton('Aplicar', 'w11-btn'); bP.addEventListener('click', aplicar);
        pie.append(bA, bC, bP);
        c.append(tabs, panel, pie);
        elegir(0);
        function filaDato(tabla, a, b, noTr) {
          const f = el('div', 'w11-prop__fila');
          f.append(el('span', 'w11-prop__k', a));
          const s = el('span', 'w11-prop__v', b);
          if (noTr) s.setAttribute('translate', 'no');
          f.appendChild(s);
          tabla.appendChild(f);
        }
        function general(p) {
          const cab = el('div', 'w11-prop__cab');
          cab.appendChild(icono(iconoDe(n), 'w11-prop__ico'));
          const nom = document.createElement('input');
          nom.className = 'w11-campo';
          nom.value = n.unidad ? (pend.etiqueta || '') : n.n;
          nom.readOnly = !n.unidad;
          nom.setAttribute('aria-label', n.unidad ? 'Etiqueta de la unidad' : 'Nombre');
          nom.setAttribute('translate', 'no');
          nom.addEventListener('input', () => { pend.etiqueta = nom.value; });
          cab.appendChild(nom);
          p.appendChild(cab);
          const t = el('div', 'w11-prop__tabla');
          if (n.unidad) {
            filaDato(t, 'Tipo:', tipoDe(n));
            filaDato(t, 'Sistema de archivos:', n.fs, true);
            filaDato(t, 'Espacio usado:', tamano(n.capacidad - n.libre), true);
            filaDato(t, 'Espacio disponible:', tamano(n.libre), true);
            filaDato(t, 'Capacidad:', tamano(n.capacidad), true);
            p.appendChild(t);
            const q = el('div', 'w11-prop__tarta');
            q.style.setProperty('--usado', Math.round((n.capacidad - n.libre) / n.capacidad * 100) + '%');
            q.setAttribute('role', 'img');
            q.setAttribute('aria-label', `Usado ${Math.round((n.capacidad - n.libre) / n.capacidad * 100)} %`);
            const fq = el('div', 'w11-prop__tarta-fila');
            fq.append(q, el('span', null, `Unidad ${n.n}`));
            p.appendChild(fq);
            return;
          }
          filaDato(t, 'Tipo de archivo:', tipoDe(n));
          if (!n.carpeta && !n.acceso && ABRE_CON[ext(n.n)]) filaDato(t, 'Se abre con:', ABRE_CON[ext(n.n)]);
          filaDato(t, 'Ubicación:', rutaReal(n._p), true);
          filaDato(t, 'Tamaño:', `${tamano(peso(n))} (${peso(n).toLocaleString('es-ES')} bytes)`, true);
          if (n.carpeta) { const k = contar(n); filaDato(t, 'Contiene:', `${k.a} archivos, ${k.c} carpetas`); }
          filaDato(t, 'Creado:', n.fecha || '12/12/2026, 10:42', true);
          p.appendChild(t);
          const at = el('fieldset', 'w11-prop__atrib');
          at.appendChild(el('legend', null, 'Atributos:'));
          [['soloLectura', 'Solo lectura'], ['oculto', 'Oculto']].forEach(([k, txt]) => {
            const l = el('label', 'w11-check');
            const i = document.createElement('input');
            i.type = 'checkbox';
            i.checked = pend[k];
            i.addEventListener('change', () => { pend[k] = i.checked; });
            l.append(i, document.createTextNode(' ' + txt));
            at.appendChild(l);
          });
          p.appendChild(at);
        }
        function accesoTab(p) {
          const t = el('div', 'w11-prop__tabla');
          filaDato(t, 'Tipo de destino:', destinoDe(n) ? tipoDe(destinoDe(n)) : '—');
          filaDato(t, 'Destino:', n.acceso[0] + '\\' + n.acceso.slice(1).join('\\'), true);
          p.appendChild(t);
          p.appendChild(el('p', 'w11-nota', 'Un acceso directo solo guarda dónde está el original: ocupa muy poco. Si borras el acceso directo, el original no se borra.'));
        }
      } });
    }

    /* ---- formatear ---- */
    function formatear(u) {
      if (u.sistema) { W.dialogo({ titulo: 'Formatear Disco local (C:)', icono: 'error', texto: 'No puedes formatear este volumen. Contiene la versión de Windows que estás usando.' }); fs('error', { error: 'formatear-c' }); return; }
      W.abrir({ app: 'formatear', titulo: `Formatear ${visto(u)}`, icono: 'usb', rect: { x: 30, y: 4, w: 40, h: 88 }, crear: (c, v) => {
        c.classList.add('w11-form');
        const campo = (txt, nodo) => { const l = el('label', 'w11-form__campo'); l.append(el('span', null, txt), nodo); c.appendChild(l); return nodo; };
        const cap = document.createElement('select'); cap.className = 'w11-campo'; cap.innerHTML = `<option>${tamano(u.capacidad)}</option>`; cap.setAttribute('translate', 'no');
        campo('Capacidad:', cap);
        const sel = document.createElement('select'); sel.className = 'w11-campo';
        (u.capacidad > 32 * GB ? ['NTFS', 'exFAT'] : ['FAT32 (predeterminado)', 'NTFS', 'exFAT']).forEach(x => { const o = document.createElement('option'); o.value = x.split(' ')[0]; o.textContent = x; sel.appendChild(o); });
        sel.setAttribute('translate', 'no');
        campo('Sistema de archivos:', sel);
        const asig = document.createElement('select'); asig.className = 'w11-campo'; asig.innerHTML = '<option>Tamaño de asignación predeterminado</option>';
        campo('Tamaño de la unidad de asignación:', asig);
        const eti = document.createElement('input'); eti.className = 'w11-campo'; eti.value = u.etiqueta || ''; eti.maxLength = 11; eti.setAttribute('translate', 'no');
        campo('Etiqueta del volumen:', eti);
        const l = el('label', 'w11-check');
        const rap = document.createElement('input'); rap.type = 'checkbox'; rap.checked = true;
        l.append(rap, document.createTextNode(' Formato rápido'));
        c.appendChild(el('p', 'w11-form__grupo', 'Opciones de formato'));
        c.appendChild(l);
        const pie = el('div', 'w11-prop__pie');
        const ini = boton('Iniciar', 'w11-btn w11-btn--primario');
        const cer = boton('Cerrar', 'w11-btn');
        cer.addEventListener('click', () => v.cerrar());
        ini.addEventListener('click', () => {
          W.dialogo({ titulo: `Formatear ${visto(u)}`, icono: 'aviso', texto: ['ADVERTENCIA: al formatear se borrarán TODOS los datos de este disco.', 'Para formatear el disco, haz clic en Aceptar. Para salir, haz clic en Cancelar.'], botones: [{ t: 'Aceptar', primario: true, f: () => {
            const perdidos = u.hijos.slice();
            const antes = u.fs;
            u.hijos = []; u.fs = sel.value; u.etiqueta = eti.value.trim() || 'USB'; u.libre = u.capacidad;
            perdidos.forEach(x => { x._borrado = true; });
            ctx.apunta(`Formatear ${u.n}: sistema de archivos ${u.fs} (antes ${antes}), etiqueta «${u.etiqueta}»${rap.checked ? ', formato rápido' : ''}.`);
            fs('formatear', { nodo: u, antes, perdidos, rapido: rap.checked });
            cambio();
            W.dialogo({ titulo: `Formatear ${visto(u)}`, icono: 'info', texto: 'Formato completado.', botones: [{ t: 'Aceptar', primario: true, f: () => v.cerrar() }] });
          } }, { t: 'Cancelar' }] });
        });
        pie.append(ini, cer);
        c.appendChild(pie);
      } });
    }
    function expulsar(u) {
      u.expulsado = true;
      exploradores.forEach(E => { if (cadena(E.aqui()).indexOf(u) !== -1) E.ir(raiz); });
      ctx.apunta(`Expulsar ${visto(u)}.`);
      W.notificacion('Es seguro quitar el hardware', `Ahora se puede quitar el dispositivo «${u.etiqueta || 'USB'}» del equipo.`, 'usb');
      fs('expulsar', { nodo: u });
      cambio();
    }
    function comprimir(nodos, dest) {
      const base = nodos.length === 1 ? nodos[0].n.replace(/\.[^.]+$/, '') : (dest.n || 'Archivos');
      const nom = nombreLibre(dest, base + '.zip');
      const z = archivo(nom, Math.max(KB, Math.round(nodos.reduce((a, n) => a + peso(n), 0) * 0.6)), { zipDe: nodos.map(n => n.n), zipHijos: nodos.map(clonar) });
      if (!puedeEntrar([z], dest, false)) return null;
      dest.hijos.push(z);
      enlazar(z, dest);
      const u = unidadDe(dest); if (u) u.libre -= peso(z);
      ctx.apunta(`Comprimir ${nodos.map(n => n.n).join(', ')}: sale «${nom}».`);
      fs('comprimir', { nodo: z, de: nodos });
      cambio();
      return z;
    }
    function extraer(z, E) {
      const dest = z._p;
      const nom = nombreLibre(dest, z.n.replace(/\.zip$/i, ''));
      const c = carpeta(nom, (z.zipHijos || []).map(clonar));
      if (!puedeEntrar([c], dest, false)) return;
      dest.hijos.push(c);
      enlazar(c, dest);
      const u = unidadDe(dest); if (u) u.libre -= peso(c);
      ctx.apunta(`Extraer todo de «${z.n}»: sale la carpeta «${nom}».`);
      fs('extraer', { nodo: c, zip: z });
      cambio();
      if (E) E.elegir([c]);
    }

    /* ---- menús de un elemento ---- */
    function menuNodo(x, y, nodos, E) {
      const n = nodos[0];
      if (!n) return;
      if (n._p && n._p.papelera) {
        W.menu(x, y, [
          { t: 'Restaurar', icono: 'restaurar', f: () => restaurar(nodos) },
          { sep: true },
          { t: 'Cortar', icono: 'cortar', atajo: 'Ctrl+X', f: () => portapapeles(nodos, true) },
          { t: 'Eliminar', icono: 'eliminar', atajo: 'Supr', f: () => eliminar(nodos) },
          { sep: true },
          { t: 'Propiedades', icono: 'propiedades', f: () => propiedades(n) },
        ]);
        return;
      }
      if (n.papelera) {
        W.menu(x, y, [{ t: 'Abrir', f: () => abrirNodo(n) }, { t: 'Vaciar Papelera de reciclaje', icono: 'eliminar', off: !PAPELERA.hijos.length, f: vaciar }, { sep: true }, { t: 'Crear acceso directo', icono: 'acceso', off: true }]);
        return;
      }
      if (n.unidad) {
        W.menu(x, y, [
          { t: 'Abrir', f: () => abrirNodo(n, E) },
          { t: 'Abrir en una ventana nueva', f: () => abrirNodo(n, E, true) },
          { sep: true },
          n.usb ? { t: 'Expulsar', icono: 'expulsar', f: () => expulsar(n) } : null,
          { t: 'Formatear…', f: () => formatear(n) },
          { t: 'Cambiar nombre', icono: 'renombrar', f: () => E ? E.renombrar(n) : null },
          { sep: true },
          { t: 'Propiedades', icono: 'propiedades', atajo: 'Alt+Intro', f: () => propiedades(n) },
        ]);
        return;
      }
      const varios = nodos.length > 1;
      const comprimirAqui = () => { const z = comprimir(nodos, n._p); if (z && E) { E.elegir([z]); E.renombrar(z); } };
      const extra = (op.acciones && op.acciones(n, W, nodos)) || [];
      const enviarA = [
        { t: 'Carpeta comprimida (en zip)', icono: 'zip', f: comprimirAqui },
        { t: 'Documentos', icono: 'documento', f: () => meter(carpetaUsuario('Documents'), nodos, false, 'Enviar a') },
        { t: 'Escritorio (crear acceso directo)', icono: 'acceso', f: () => nodos.forEach(x => crearAcceso(x, escritorioNodo(), 'Enviar a')) },
      ].concat(raiz.hijos.filter(u => u.usb && !u.expulsado).map(u => ({ t: visto(u), icono: 'usb', noTraducir: true, f: () => meter(u, nodos, false, 'Enviar a') })));
      const clasico = [
        { t: 'Abrir', f: () => abrirNodo(n, E) },
        { sep: true },
        { t: 'Enviar a', sub: enviarA },
        { sep: true },
        { t: 'Cortar', f: () => portapapeles(nodos, true) },
        { t: 'Copiar', f: () => portapapeles(nodos, false) },
        { sep: true },
        { t: 'Crear acceso directo', off: varios, f: () => crearAcceso(n, n._p, 'Crear acceso directo') },
        { t: 'Eliminar', f: () => eliminar(nodos) },
        { t: 'Cambiar nombre', off: varios, f: () => E ? E.renombrar(n) : renombrarEscritorio(n) },
        { sep: true },
        { t: 'Propiedades', f: () => propiedades(n) },
      ];
      const items = [
        { t: 'Abrir', atajo: 'Intro', f: () => abrirNodo(n, E) },
        n.carpeta ? { t: 'Abrir en una ventana nueva', f: () => abrirNodo(n, E, true) } : null,
        ext(n.n) === 'zip' ? { t: 'Extraer todo…', icono: 'zip', f: () => extraer(n, E) } : null,
        !n.acceso && ext(n.n) !== 'zip' ? { t: 'Comprimir en archivo ZIP', icono: 'zip', f: comprimirAqui } : null,
        { t: 'Copiar como ruta de acceso', atajo: 'Ctrl+Shift+C', f: () => { ctx.apunta(`Copiar como ruta: "${rutaReal(n)}".`); W.notificacion('Ruta copiada', rutaReal(n), 'copiar'); fs('ruta-copiada', { nodo: n }); } },
      ].concat(extra).concat([
        { t: 'Propiedades', icono: 'propiedades', atajo: 'Alt+Intro', f: () => propiedades(n) },
        { sep: true },
        { t: 'Mostrar más opciones', icono: 'mas', f: () => { W.menu(x, y, clasico); fs('mas-opciones', { nodo: n }); } },
      ]);
      W.menu(x, y, items, { fila: [
        { t: 'Cortar', icono: 'cortar', f: () => portapapeles(nodos, true) },
        { t: 'Copiar', icono: 'copiar', f: () => portapapeles(nodos, false) },
        { t: 'Cambiar nombre', icono: 'renombrar', off: varios, f: () => E ? E.renombrar(n) : renombrarEscritorio(n) },
        { t: 'Compartir', icono: 'compartir', f: () => W.notificacion('Compartir', 'En esta simulación no hace falta compartir.', 'compartir') },
        { t: 'Eliminar', icono: 'eliminar', f: () => eliminar(nodos) },
      ] });
    }
    function portapapeles(nodos, cortar) {
      port = { nodos: nodos.slice(), cortar };
      ctx.apunta(`${cortar ? 'Cortar' : 'Copiar'} ${nodos.map(n => n.n).join(', ')}.`);
      fs(cortar ? 'cortar' : 'copiar-port', { nodos });
      repintar();
    }
    function pegar(dest) {
      if (!port) return;
      const ok = meter(dest, port.nodos, port.cortar, 'pegar');
      if (ok && port.cortar) port = null;
    }

    /* ---- arrastrar y soltar ---- */
    function arrastrable(nodoEl, nodosFn) {
      let ini = null, fantasma = null;
      nodoEl.addEventListener('pointerdown', e => {
        if (e.button !== 0 || e.pointerType === 'touch') return;
        ini = { x: e.clientX, y: e.clientY, id: e.pointerId };
      });
      nodoEl.addEventListener('pointermove', e => {
        if (!ini) return;
        if (!fantasma && Math.abs(e.clientX - ini.x) + Math.abs(e.clientY - ini.y) < 8) return;
        const nodos = nodosFn();
        if (!nodos.length || nodos.some(n => n.unidad || n.papelera)) { ini = null; return; }
        if (!fantasma) {
          fantasma = el('div', 'w11-fantasma');
          fantasma.append(icono(iconoDe(nodos[0])), el('span', 'w11-fantasma__n', nodos.length > 1 ? nodos.length + ' elementos' : visto(nodos[0])), el('span', 'w11-fantasma__accion'));
          fantasma.setAttribute('translate', 'no');
          W.escena.appendChild(fantasma);
          try { nodoEl.setPointerCapture(ini.id); } catch (_) { /* nada */ }
        }
        const r = W.escena.getBoundingClientRect();
        fantasma.style.left = (e.clientX - r.left + 10) + 'px';
        fantasma.style.top = (e.clientY - r.top + 10) + 'px';
        const d = destinoBajo(e.clientX, e.clientY);
        W.escena.querySelectorAll('.w11-soltar').forEach(x => x.classList.remove('w11-soltar'));
        const acc = fantasma.querySelector('.w11-fantasma__accion');
        if (d && nodos.indexOf(d.nodo) === -1) {
          if (d.el) d.el.classList.add('w11-soltar');
          const mueve = d.nodo.papelera || (!e.ctrlKey && nodos.every(n => unidadDe(n) === unidadDe(d.nodo)));
          acc.textContent = d.nodo.papelera ? '→ Mover a la Papelera' : (mueve ? '→ Mover a ' : '+ Copiar en ') + (d.nodo.papelera ? '' : visto(d.nodo));
        } else acc.textContent = '';
      });
      const fin = e => {
        if (!ini) return;
        const habia = !!fantasma;
        if (fantasma) { fantasma.remove(); fantasma = null; }
        W.escena.querySelectorAll('.w11-soltar').forEach(x => x.classList.remove('w11-soltar'));
        ini = null;
        if (!habia || e.type === 'pointercancel') return;
        nodoEl._arrastrado = Date.now();
        const nodos = nodosFn();
        const d = destinoBajo(e.clientX, e.clientY);
        if (!d || nodos.indexOf(d.nodo) !== -1) return;
        if (d.nodo.papelera) { eliminar(nodos); return; }
        meter(d.nodo, nodos, e.ctrlKey ? false : 'auto', 'arrastrar');
      };
      nodoEl.addEventListener('pointerup', fin);
      nodoEl.addEventListener('pointercancel', fin);
    }
    function destinoBajo(x, y) {
      const elems = document.elementsFromPoint(x, y);
      for (const e of elems) {
        if (e.classList.contains('w11-fantasma')) continue;
        const t = e.closest('[data-destino]');
        if (t && t._nodo) {
          const n = t._nodo;
          if (n.carpeta || n.papelera || n.unidad) return { nodo: n, el: t };
          if (n.acceso && destinoDe(n) && destinoDe(n).carpeta) return { nodo: destinoDe(n), el: t };
        }
        const lst = e.closest('.w11-exp__lista');
        if (lst && lst._E) return { nodo: lst._E.aqui(), el: lst };
        if (e.classList.contains('w11__iconos') || e.classList.contains('w11__fondo')) return { nodo: escritorioNodo(), el: null };
        if (e.closest('.w11-v')) return null;
      }
      return null;
    }

    /* ---- escritorio ---- */
    let elegidoEsc = null;
    W.iconosEscritorio = () => {
      const esc = escritorioNodo();
      const lista = [{ n: 'Papelera de reciclaje', icono: PAPELERA.hijos.length ? 'papelera-llena' : 'papelera', nodo: PAPELERA }];
      (esc ? esc.hijos : []).filter(h => !h.oculto || W.est.verOcultos).forEach(h => lista.push({ n: visto(h), icono: iconoDe(h), acceso: !!h.acceso, nodo: h, oculto: h.oculto }));
      return lista.map(it => Object.assign(it, {
        elegido: it.nodo === elegidoEsc,
        elegir: () => { elegidoEsc = it.nodo; },
        abrir: () => { elegidoEsc = it.nodo; abrirNodo(it.nodo); },
        menu: (x, y) => menuNodo(x, y, [it.nodo], null),
      }));
    };
    const pintarIconosBase = W.pintarIconos;
    W.pintarIconos = () => {
      pintarIconosBase();
      W.escena.querySelectorAll('.w11-icono').forEach(b => {
        const it = b._it;
        if (!it) return;
        b._nodo = it.nodo;
        b.dataset.destino = '1';
        arrastrable(b, () => [it.nodo].filter(n => !n.papelera));
      });
    };
    function renombrarEscritorio(n) {
      const b = Array.from(W.escena.querySelectorAll('.w11-icono')).find(x => x._nodo === n);
      if (!b) return;
      const i = document.createElement('input');
      i.className = 'w11-renombrar';
      i.value = n.n;
      i.setAttribute('aria-label', 'Nombre nuevo');
      i.setAttribute('translate', 'no');
      const span = b.querySelector('.w11-icono__n');
      span.replaceWith(i);
      i.focus();
      if (!n.carpeta && /\./.test(n.n)) i.setSelectionRange(0, n.n.lastIndexOf('.')); else i.select();
      let hecho = false;
      const fin = ok => { if (hecho) return; hecho = true; if (ok) renombrarNodo(n, i.value); W.pintarIconos(); };
      i.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') fin(true); if (e.key === 'Escape') fin(false); });
      i.addEventListener('blur', () => fin(true));
      i.addEventListener('click', e => e.stopPropagation());
    }
    W.menuEscritorio = (x, y) => {
      const esc = escritorioNodo();
      W.menu(x, y, [
        { t: 'Ver', icono: 'ver', sub: [{ t: 'Iconos medianos', marca: true }, { t: 'Mostrar iconos del escritorio', marca: true }] },
        { t: 'Ordenar por', icono: 'ordenar', sub: ['Nombre', 'Tamaño', 'Tipo de elemento', 'Fecha de modificación'].map(t => ({ t, f: () => { esc.hijos.sort((a, b) => a.n.localeCompare(b.n)); cambio(); } })) },
        { t: 'Actualizar', icono: 'recargar', f: repintar },
        { sep: true },
        port ? { t: 'Pegar', icono: 'pegar', atajo: 'Ctrl+V', f: () => pegar(esc) } : null,
        deshacer.length ? { t: 'Deshacer', atajo: 'Ctrl+Z', f: deshacerUltimo } : null,
        { t: 'Nuevo', icono: 'nuevo', sub: [{ t: 'Carpeta', icono: 'carpeta', f: () => nueva(esc, 'carpeta') }, { t: 'Documento de texto', icono: 'texto', f: () => nueva(esc, 'txt') }] },
        { sep: true },
        { t: 'Configuración de pantalla', icono: 'equipo', f: () => W.abrirApp('configuracion', { origen: 'escritorio', pagina: 'sistema' }) },
        { t: 'Personalizar', icono: 'configuracion', f: () => W.abrirApp('configuracion', { origen: 'escritorio', pagina: 'personalizacion' }) },
      ]);
    };
    function deshacerUltimo() {
      const d = deshacer.pop();
      if (!d) return false;
      d.f();
      fs('deshacer', { que: d.t });
      cambio();
      return true;
    }
    const onTeclaBase = op.onTecla;
    op.onTecla = (c, info) => {
      if (onTeclaBase && onTeclaBase(c, info) === true) return true;
      if (W.activa && W.activa.estado !== 'min') return false;
      const sel = elegidoEsc && elegidoEsc !== PAPELERA && elegidoEsc._p ? [elegidoEsc] : [];
      if (c === 'Ctrl + Z') return deshacerUltimo();
      if (c === 'Ctrl + V' && port) { pegar(escritorioNodo()); return true; }
      if (!sel.length) return false;
      if (c === 'Supr') { eliminar(sel); return true; }
      if (c === 'Shift + Supr') { eliminar(sel, true); return true; }
      if (c === 'F2') { renombrarEscritorio(sel[0]); return true; }
      if (c === 'Ctrl + C' || c === 'Ctrl + X') { portapapeles(sel, c === 'Ctrl + X'); return true; }
      if (c === 'Intro') { abrirNodo(sel[0]); return true; }
      if (c === 'Alt + Intro') { propiedades(sel[0]); return true; }
      return false;
    };

    /* ---- el Explorador ---- */
    function abrirExplorador(inicio, o) {
      o = o || {};
      let destino = inicio;
      if (Array.isArray(inicio)) destino = buscar(inicio) || raiz;
      if (!destino) destino = raiz;
      const E = { historia: [], futuro: [], sel: [], orden: 'nombre', vista: 'detalles', q: '' };
      let actual = destino;
      E.aqui = () => actual;
      let v = null;
      let dir, busca, lista, estadoBar, panel, cmd;
      exploradores.push(E);
      function tituloDe(n) { return n.raiz ? 'Este equipo' : visto(n); }

      function montar(c) {
        c.classList.add('w11-exp');
        const nav = el('div', 'w11-exp__nav');
        const bAtras = boton('', 'w11-exp__nb'); bAtras.appendChild(icono('atras')); bAtras.setAttribute('aria-label', 'Atrás (Alt + ←)');
        const bAdel = boton('', 'w11-exp__nb'); bAdel.appendChild(icono('adelante')); bAdel.setAttribute('aria-label', 'Adelante (Alt + →)');
        const bArr = boton('', 'w11-exp__nb'); bArr.appendChild(icono('arriba')); bArr.setAttribute('aria-label', 'Subir (Alt + ↑)');
        const bRec = boton('', 'w11-exp__nb'); bRec.appendChild(icono('recargar')); bRec.setAttribute('aria-label', 'Actualizar (F5)');
        bAtras.addEventListener('click', atras); bAdel.addEventListener('click', adelante); bArr.addEventListener('click', subir); bRec.addEventListener('click', () => E.pintar());
        dir = el('div', 'w11-exp__dir');
        dir.setAttribute('translate', 'no');
        dir.addEventListener('click', e => { if (e.target === dir || e.target.classList.contains('w11-exp__dir-hueco')) editarRuta(); });
        busca = document.createElement('input');
        busca.type = 'search';
        busca.className = 'w11-exp__busca';
        busca.setAttribute('aria-label', 'Buscar en esta carpeta');
        busca.addEventListener('input', () => { E.q = busca.value; E.pintar(); if (E.q.trim()) fs('buscar', { q: busca.value, en: actual, resultados: resultados(), vivo: true }); });
        busca.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); fs('buscar', { q: busca.value, en: actual, resultados: resultados() }); ctx.apunta(`Buscar «${busca.value}» en ${tituloDe(actual)}: ${resultados().length} resultados.`); } });
        nav.append(bAtras, bAdel, bArr, bRec, dir, busca);
        E._nav = { bAtras, bAdel, bArr };
        cmd = el('div', 'w11-exp__cmd');
        const main = el('div', 'w11-exp__main');
        panel = el('div', 'w11-exp__panel');
        panel.setAttribute('role', 'tree');
        panel.setAttribute('aria-label', 'Panel de navegación');
        lista = el('div', 'w11-exp__lista');
        lista._E = E;
        lista.setAttribute('role', 'grid');
        lista.setAttribute('aria-label', 'Elementos de la carpeta');
        lista.addEventListener('contextmenu', e => {
          if (e.target.closest('.w11-exp__fila')) return;
          e.preventDefault();
          E.sel = []; E.pintar();
          menuFondo(e.clientX, e.clientY);
        });
        lista.addEventListener('click', e => { if (!e.target.closest('.w11-exp__fila') && E.sel.length) { E.sel = []; E.pintar(); } });
        main.append(panel, lista);
        estadoBar = el('div', 'w11-exp__estado');
        c.append(nav, cmd, main, estadoBar);
        E.pintar();
      }
      function editarRuta() {
        const i = document.createElement('input');
        i.className = 'w11-exp__dir-edit';
        i.value = rutaReal(actual);
        i.setAttribute('aria-label', 'Dirección');
        i.spellcheck = false;
        dir.innerHTML = '';
        dir.appendChild(i);
        i.focus(); i.select();
        let hecho = false;
        const fin = ir => {
          if (hecho) return; hecho = true;
          if (ir) {
            const txt = i.value.trim().replace(/[\\/]+$/, '');
            ctx.apunta(`Escribir la ruta en la barra de direcciones: ${txt}`);
            const n = rutaANodo(txt);
            fs('ruta', { texto: txt, nodo: n });
            if (n) { E.ir(n); return; }
            W.dialogo({ titulo: 'Explorador de archivos', icono: 'error', texto: `Windows no encuentra «${txt}». Comprueba la ortografía e inténtalo de nuevo.` });
          }
          E.pintar();
        };
        i.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') fin(true); if (e.key === 'Escape') fin(false); });
        i.addEventListener('blur', () => fin(false));
      }
      function rutaANodo(txt) {
        const t = txt.toLowerCase();
        if (t === 'este equipo' || t === '') return raiz;
        if (t === 'papelera de reciclaje') return PAPELERA;
        const map = { escritorio: 'Desktop', descargas: 'Downloads', documentos: 'Documents', imágenes: 'Pictures', imagenes: 'Pictures', música: 'Music', musica: 'Music', vídeos: 'Videos', videos: 'Videos' };
        if (map[t]) return carpetaUsuario(map[t]);
        const partes = txt.split(/[\\/]+/).filter(Boolean);
        if (!/^[a-z]:$/i.test(partes[0] || '')) return null;
        partes[0] = partes[0].toUpperCase();
        const n = buscar(partes);
        return n && n.carpeta && !n.expulsado ? n : null;
      }
      E.ir = (n, sinHistoria) => {
        if (!n || n === actual) { E.pintar(); return; }
        if (!sinHistoria) { E.historia.push(actual); E.futuro = []; }
        actual = n; E.sel = []; E.q = ''; if (busca) busca.value = '';
        v.titulo(tituloDe(n));
        W.emit('navegar', { E, nodo: n });
        cambioLigero();
      };
      function cambioLigero() { E.pintar(); W.emit('cambio', {}); }
      function atras() { const p = E.historia.pop(); if (p) { E.futuro.push(actual); E.ir(p, true); } }
      function adelante() { const p = E.futuro.pop(); if (p) { E.historia.push(actual); E.ir(p, true); } }
      function subir() { if (actual.papelera || actual.raiz) { if (!actual.raiz) E.ir(raiz); return; } E.ir(actual.unidad ? raiz : actual._p || raiz); }
      E.elegir = nodos => { E.sel = nodos.slice(); E.pintar(); };
      function contenido() {
        if (actual.raiz) return actual.hijos.filter(u => !u.expulsado);
        const hijos = actual.zipHijos && !actual.carpeta ? actual.zipHijos : actual.hijos;
        return hijos.filter(h => !h.oculto || W.est.verOcultos);
      }
      function resultados() {
        const q = E.q.trim();
        if (!q) return [];
        const re = q.indexOf('*') !== -1 ? new RegExp('^' + sinTildes(q).replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$') : null;
        const out = [];
        (function r(n) { (n.hijos || []).forEach(h => { if (h.expulsado || (h.oculto && !W.est.verOcultos)) return; const nm = sinTildes(h.n); if (re ? re.test(nm) : nm.indexOf(sinTildes(q)) !== -1) out.push(h); if (h.carpeta) r(h); }); })(actual);
        return out;
      }
      function ordenar(l) {
        const k = E.orden;
        return l.slice().sort((a, b) => ((b.carpeta ? 1 : 0) - (a.carpeta ? 1 : 0)) || (k === 'tamano' ? peso(b) - peso(a) : k === 'tipo' ? tipoDe(a).localeCompare(tipoDe(b)) : k === 'fecha' ? String(b.fecha || '').localeCompare(String(a.fecha || '')) : 0) || a.n.localeCompare(b.n, 'es', { numeric: true }));
      }
      E.pintar = () => {
        if (!lista) return;
        if (W.ventanas.indexOf(v) === -1) return;
        if (busca) busca.placeholder = 'Buscar en ' + tituloDe(actual);
        E._nav.bAtras.disabled = !E.historia.length;
        E._nav.bAdel.disabled = !E.futuro.length;
        E._nav.bArr.disabled = actual.raiz;
        // dirección
        if (!dir.querySelector('input')) {
          dir.innerHTML = '';
          dir.appendChild(icono(actual.papelera ? 'papelera' : actual.raiz ? 'equipo' : 'carpeta', 'w11-exp__dir-ico'));
          const migas = actual.papelera ? [PAPELERA] : cadena(actual);
          migas.forEach((n, i) => {
            if (i) dir.appendChild(el('span', 'w11-exp__sep', '›'));
            const b = boton(n.raiz ? 'Este equipo' : visto(n), 'w11-exp__miga');
            b._nodo = n; b.dataset.destino = '1';
            b.addEventListener('click', e => { e.stopPropagation(); E.ir(n); });
            dir.appendChild(b);
          });
          dir.appendChild(el('span', 'w11-exp__dir-hueco'));
        }
        pintarCmd();
        pintarPanel();
        // lista
        lista.innerHTML = '';
        const q = E.q.trim();
        const items = ordenar(q ? resultados() : contenido());
        if (actual.raiz && !q) {
          lista.classList.add('w11-exp__lista--unidades');
          lista.appendChild(el('p', 'w11-exp__grupo', 'Dispositivos y unidades'));
          items.forEach(u => lista.appendChild(filaUnidad(u)));
        } else {
          lista.classList.remove('w11-exp__lista--unidades');
          const cab = el('div', 'w11-exp__cabecera');
          [['nombre', 'Nombre'], ['fecha', 'Fecha de modificación'], ['tipo', 'Tipo'], ['tamano', 'Tamaño']].forEach(([k, t]) => {
            const b = boton(t + (E.orden === k ? ' ⌄' : ''), 'w11-exp__col w11-exp__col--' + k);
            b.addEventListener('click', () => { E.orden = k; ctx.apunta(`Ordenar por ${t.toLowerCase()}.`); fs('ordenar', { por: k }); E.pintar(); });
            cab.appendChild(b);
          });
          lista.appendChild(cab);
          if (actual.zipHijos && !actual.carpeta) {
            const ban = el('div', 'w11-exp__banner');
            ban.appendChild(el('span', null, 'Estás dentro de una carpeta comprimida.'));
            const bx = boton('Extraer todo', 'w11-btn w11-btn--primario');
            bx.addEventListener('click', () => { const z = actual; E.ir(z._p); extraer(z, E); });
            ban.appendChild(bx);
            lista.appendChild(ban);
          }
          if (!items.length) lista.appendChild(el('p', 'w11-exp__vacia', q ? 'Ningún elemento coincide con la búsqueda.' : actual.papelera ? 'La Papelera de reciclaje está vacía.' : 'Esta carpeta está vacía.'));
          items.forEach(n => lista.appendChild(fila(n, !!q)));
        }
        const tot = items.length, s = E.sel.filter(n => items.indexOf(n) !== -1);
        estadoBar.textContent = `${tot} elemento${tot === 1 ? '' : 's'}` + (s.length ? ` | ${s.length} elemento${s.length === 1 ? '' : 's'} seleccionado${s.length === 1 ? '' : 's'}${s.every(n => !n.carpeta && !n.unidad) ? ' ' + tamano(s.reduce((a, n) => a + peso(n), 0)) : ''}` : '');
      };
      function filaUnidad(u) {
        const b = boton('', 'w11-exp__unidad' + (E.sel.indexOf(u) !== -1 ? ' w11-exp__fila--sel' : ''));
        b._nodo = u; b.dataset.destino = '1';
        b.appendChild(icono(iconoDe(u), 'w11-exp__unidad-ico'));
        const d = el('span', 'w11-exp__unidad-datos');
        const nm = el('span', 'w11-exp__unidad-n', visto(u));
        nm.setAttribute('translate', 'no');
        const bar = el('span', 'w11-exp__barra-esp' + (u.libre / u.capacidad < 0.1 ? ' w11-exp__barra-esp--llena' : ''));
        const rel = el('span'); rel.style.width = Math.round((u.capacidad - u.libre) / u.capacidad * 100) + '%';
        bar.appendChild(rel);
        const t = el('span', 'w11-exp__unidad-t', `${tamano(u.libre)} disponibles de ${tamano(u.capacidad)}`);
        t.setAttribute('translate', 'no');
        d.append(nm, bar, t);
        b.appendChild(d);
        eventosFila(b, u);
        return b;
      }
      function fila(n, conUbic) {
        const elegido = E.sel.indexOf(n) !== -1;
        const f = el('div', 'w11-exp__fila' + (elegido ? ' w11-exp__fila--sel' : '') + (n.oculto ? ' w11-exp__fila--oculta' : '') + (port && port.cortar && port.nodos.indexOf(n) !== -1 ? ' w11-exp__fila--cortada' : ''));
        f.tabIndex = 0;
        f.setAttribute('role', 'row');
        f.setAttribute('aria-selected', String(elegido));
        f._nodo = n;
        if (n.carpeta || n.acceso) f.dataset.destino = '1';
        const c1 = el('span', 'w11-exp__c w11-exp__c--nombre');
        const ic = icono(iconoDe(n));
        if (n.acceso) ic.appendChild(icono('acceso', 'w11-ico__acceso'));
        c1.appendChild(ic);
        const nm = el('span', 'w11-exp__n', visto(n));
        nm.setAttribute('translate', 'no');
        c1.appendChild(nm);
        if (conUbic || (n._p && n._p.papelera)) {
          const u = el('span', 'w11-exp__ubic', n._p && n._p.papelera ? 'Ubicación original: ' + (n._origen || []).join('\\') : rutaReal(n._p));
          u.setAttribute('translate', 'no');
          c1.appendChild(u);
        }
        f.appendChild(c1);
        const fe = el('span', 'w11-exp__c w11-exp__c--fecha', n.fecha || '12/12/2026 10:42'); fe.setAttribute('translate', 'no');
        f.appendChild(fe);
        f.appendChild(el('span', 'w11-exp__c w11-exp__c--tipo', tipoDe(n)));
        const ta = el('span', 'w11-exp__c w11-exp__c--tamano', n.carpeta ? '' : tamano(peso(n))); ta.setAttribute('translate', 'no');
        f.appendChild(ta);
        eventosFila(f, n);
        arrastrable(f, () => (E.sel.indexOf(n) !== -1 ? E.sel : [n]));
        return f;
      }
      function eventosFila(f, n) {
        let ult = 0;
        f.addEventListener('click', e => {
          if (f._arrastrado && Date.now() - f._arrastrado < 300) return;
          const ahora = Date.now();
          if (ahora - ult < 450) { ult = 0; abrir([n]); return; }
          ult = ahora;
          if (e.ctrlKey || e.metaKey) E.sel = E.sel.indexOf(n) !== -1 ? E.sel.filter(x => x !== n) : E.sel.concat(n);
          else E.sel = [n];
          E.pintar();
          const otra = Array.from(lista.querySelectorAll('.w11-exp__fila, .w11-exp__unidad')).find(x => x._nodo === n);
          if (otra) otra.focus({ preventScroll: true });
        });
        f.addEventListener('contextmenu', e => {
          e.preventDefault(); e.stopPropagation();
          if (E.sel.indexOf(n) === -1) { E.sel = [n]; E.pintar(); }
          menuNodo(e.clientX, e.clientY, E.sel.length ? E.sel : [n], E);
        });
        f.addEventListener('keydown', e => {
          if ((e.key === 'F10' && e.shiftKey) || e.key === 'ContextMenu') {
            e.preventDefault(); e.stopPropagation();
            if (E.sel.indexOf(n) === -1) E.sel = [n];
            const r = f.getBoundingClientRect();
            menuNodo(r.left + 40, r.top + r.height / 2, E.sel, E);
          }
        });
      }
      function abrir(nodos) {
        const n = nodos[0];
        if (!n) return;
        if (n._p && n._p.papelera) { propiedades(n); return; }
        abrirNodo(n, E);
      }
      function pintarCmd() {
        cmd.innerHTML = '';
        const b = (t, ic, f, off, sinTexto) => {
          const x = boton('', 'w11-exp__cb' + (sinTexto ? ' w11-exp__cb--ico' : ''));
          x.appendChild(icono(ic));
          x.setAttribute('aria-label', t); x.title = t;
          if (!sinTexto) x.appendChild(el('span', null, t));
          if (off) x.disabled = true;
          x.addEventListener('click', ev => { ev.stopPropagation(); f(x); });
          cmd.appendChild(x);
          return x;
        };
        const sep = () => cmd.appendChild(el('span', 'w11-exp__cs'));
        const sel = E.sel;
        if (actual.papelera) {
          b('Vaciar Papelera de reciclaje', 'eliminar', vaciar, !PAPELERA.hijos.length);
          b(sel.length ? 'Restaurar los elementos seleccionados' : 'Restaurar todos los elementos', 'restaurar', () => restaurar(sel.length ? sel : PAPELERA.hijos.slice()), !PAPELERA.hijos.length);
          sep();
        } else if (!actual.raiz) {
          b('Nuevo', 'nuevo', x => { const r = x.getBoundingClientRect(); W.menu(r.left, r.bottom, [{ t: 'Carpeta', icono: 'carpeta', atajo: 'Ctrl+Shift+N', f: () => nueva(actual, 'carpeta', E) }, { t: 'Documento de texto', icono: 'texto', f: () => nueva(actual, 'txt', E) }]); });
          sep();
          b('Cortar', 'cortar', () => portapapeles(sel, true), !sel.length, true);
          b('Copiar', 'copiar', () => portapapeles(sel, false), !sel.length, true);
          b('Pegar', 'pegar', () => pegar(actual), !port, true);
          b('Cambiar nombre', 'renombrar', () => E.renombrar(sel[0]), sel.length !== 1, true);
          b('Compartir', 'compartir', () => W.notificacion('Compartir', 'En esta simulación no hace falta compartir.', 'compartir'), !sel.length, true);
          b('Eliminar', 'eliminar', () => eliminar(sel), !sel.length, true);
          sep();
        }
        b('Ordenar', 'ordenar', x => { const r = x.getBoundingClientRect(); W.menu(r.left, r.bottom, [['nombre', 'Nombre'], ['fecha', 'Fecha de modificación'], ['tipo', 'Tipo'], ['tamano', 'Tamaño']].map(([k, t]) => ({ t, marca: E.orden === k, f: () => { E.orden = k; ctx.apunta(`Ordenar por ${t.toLowerCase()}.`); fs('ordenar', { por: k }); E.pintar(); } }))); });
        b('Ver', 'ver', x => { const r = x.getBoundingClientRect(); W.menu(r.left, r.bottom, [
          { t: 'Detalles', marca: true },
          { sep: true },
          { t: 'Mostrar', sub: [
            { t: 'Panel de navegación', marca: !W.est.sinPanel, f: () => { W.est.sinPanel = !W.est.sinPanel; repintar(); } },
            { t: 'Extensiones de nombre de archivo', marca: W.est.verExt, f: () => vista('verExt') },
            { t: 'Elementos ocultos', marca: W.est.verOcultos, f: () => vista('verOcultos') },
          ] },
        ]); });
        sep();
        b('Ver más', 'mas', x => { const r = x.getBoundingClientRect(); W.menu(r.left, r.bottom, [
          { t: 'Deshacer', atajo: 'Ctrl+Z', off: !deshacer.length, f: deshacerUltimo },
          { t: 'Seleccionar todo', atajo: 'Ctrl+A', f: () => E.elegir(contenido()) },
          { t: 'Propiedades', icono: 'propiedades', off: !sel.length && actual.raiz, f: () => propiedades(sel[0] || actual) },
        ]); }, false, true);
      }
      function vista(k) {
        W.est[k] = !W.est[k];
        const t = k === 'verExt' ? 'Extensiones de nombre de archivo' : 'Elementos ocultos';
        ctx.apunta(`Ver → Mostrar → ${t}: ${W.est[k] ? 'sí' : 'no'}.`);
        fs('vista', { que: k, si: W.est[k], en: actual });
        repintar();
        W.emit('cambio', {});
      }
      function pintarPanel() {
        panel.hidden = !!W.est.sinPanel;
        panel.innerHTML = '';
        const item = (n, txt, ic, nivel) => {
          if (!n) return;
          const b = boton('', 'w11-exp__pi' + (n === actual ? ' w11-exp__pi--actual' : ''));
          b.style.paddingLeft = (0.5 + (nivel || 0) * 0.9) + 'rem';
          b._nodo = n; b.dataset.destino = '1';
          b.appendChild(icono(ic));
          const s = el('span', null, txt);
          s.setAttribute('translate', 'no');
          b.appendChild(s);
          b.addEventListener('click', () => E.ir(n));
          b.addEventListener('contextmenu', e => { e.preventDefault(); e.stopPropagation(); menuNodo(e.clientX, e.clientY, [n], E); });
          panel.appendChild(b);
        };
        [['Desktop', 'Escritorio'], ['Downloads', 'Descargas'], ['Documents', 'Documentos'], ['Pictures', 'Imágenes'], ['Music', 'Música'], ['Videos', 'Vídeos']].forEach(([k, t]) => item(carpetaUsuario(k), t, 'carpeta'));
        panel.appendChild(el('span', 'w11-exp__psep'));
        item(raiz, 'Este equipo', 'equipo');
        raiz.hijos.filter(u => !u.expulsado).forEach(u => item(u, visto(u), iconoDe(u), 1));
        (op.panelExtra || []).forEach(p => item(buscar(p.ruta), p.t, 'carpeta', 1));
      }
      function menuFondo(x, y) {
        if (actual.raiz) { W.menu(x, y, [{ t: 'Actualizar', icono: 'recargar', f: () => E.pintar() }]); return; }
        if (actual.papelera) { W.menu(x, y, [{ t: 'Vaciar Papelera de reciclaje', icono: 'eliminar', off: !PAPELERA.hijos.length, f: vaciar }, { t: 'Restaurar todos los elementos', icono: 'restaurar', off: !PAPELERA.hijos.length, f: () => restaurar(PAPELERA.hijos.slice()) }, { t: 'Actualizar', icono: 'recargar', f: () => E.pintar() }]); return; }
        W.menu(x, y, [
          { t: 'Ver', icono: 'ver', sub: [{ t: 'Detalles', marca: true }] },
          { t: 'Ordenar por', icono: 'ordenar', sub: [['nombre', 'Nombre'], ['fecha', 'Fecha de modificación'], ['tipo', 'Tipo'], ['tamano', 'Tamaño']].map(([k, t]) => ({ t, marca: E.orden === k, f: () => { E.orden = k; fs('ordenar', { por: k }); E.pintar(); } })) },
          { t: 'Actualizar', icono: 'recargar', f: () => E.pintar() },
          { sep: true },
          port ? { t: 'Pegar', icono: 'pegar', atajo: 'Ctrl+V', f: () => pegar(actual) } : null,
          deshacer.length ? { t: 'Deshacer', atajo: 'Ctrl+Z', f: deshacerUltimo } : null,
          { t: 'Nuevo', icono: 'nuevo', sub: [{ t: 'Carpeta', icono: 'carpeta', f: () => nueva(actual, 'carpeta', E) }, { t: 'Documento de texto', icono: 'texto', f: () => nueva(actual, 'txt', E) }] },
          { sep: true },
          { t: 'Propiedades', icono: 'propiedades', f: () => propiedades(actual) },
        ]);
      }
      E.renombrar = n => {
        if (!n) return;
        const f = Array.from(lista.querySelectorAll('.w11-exp__fila, .w11-exp__unidad')).find(x => x._nodo === n);
        if (!f) return;
        const span = f.querySelector('.w11-exp__n, .w11-exp__unidad-n');
        const i = document.createElement('input');
        i.className = 'w11-renombrar';
        i.value = n.unidad ? n.etiqueta || '' : n.n;
        i.setAttribute('aria-label', 'Nombre nuevo');
        i.setAttribute('translate', 'no');
        i.spellcheck = false;
        span.replaceWith(i);
        i.focus();
        if (!n.carpeta && !n.unidad && /\./.test(n.n)) i.setSelectionRange(0, n.n.lastIndexOf('.')); else i.select();
        let hecho = false;
        const fin = ok => { if (hecho) return; hecho = true; if (ok) { if (!renombrarNodo(n, i.value)) return E.pintar(); } E.pintar(); };
        i.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') fin(true); if (e.key === 'Escape') fin(false); });
        i.addEventListener('blur', () => fin(true));
        i.addEventListener('click', e => e.stopPropagation());
        i.addEventListener('dblclick', e => e.stopPropagation());
      };
      function teclaExp(c) {
        const sel = E.sel.filter(n => n !== actual);
        const vis = Array.from(lista.querySelectorAll('.w11-exp__fila, .w11-exp__unidad')).map(x => x._nodo);
        switch (c) {
          case 'Ctrl + C': if (sel.length) portapapeles(sel, false); return true;
          case 'Ctrl + X': if (sel.length && !actual.raiz) portapapeles(sel, true); return true;
          case 'Ctrl + V': if (!actual.raiz && !actual.papelera) pegar(actual); return true;
          case 'Ctrl + Z': deshacerUltimo(); return true;
          case 'Ctrl + A': E.elegir(vis); return true;
          case 'Supr': if (sel.length) eliminar(sel); return true;
          case 'Shift + Supr': if (sel.length) eliminar(sel, true); return true;
          case 'F2': if (sel.length === 1) E.renombrar(sel[0]); return true;
          case 'Intro': if (sel.length) abrir(sel); return true;
          case 'Alt + Intro': propiedades(sel[0] || actual); return true;
          case 'Retroceso': case 'Alt + ←': atras(); return true;
          case 'Alt + →': adelante(); return true;
          case 'Alt + ↑': subir(); return true;
          case 'F5': E.pintar(); return true;
          case 'Ctrl + Shift + N': if (!actual.raiz && !actual.papelera) nueva(actual, 'carpeta', E); return true;
          case 'Ctrl + E': case 'Ctrl + F': if (busca) busca.focus(); return true;
          case 'Ctrl + Shift + C': if (sel[0]) { ctx.apunta(`Copiar como ruta (Ctrl + Shift + C): "${rutaReal(sel[0])}".`); W.notificacion('Ruta copiada', rutaReal(sel[0]), 'copiar'); fs('ruta-copiada', { nodo: sel[0] }); } return true;
          case '↓': case '↑': {
            if (!vis.length) return true;
            const i = vis.indexOf(sel[sel.length - 1]);
            const j = c === '↓' ? Math.min(vis.length - 1, i + 1) : Math.max(0, i === -1 ? 0 : i - 1);
            E.elegir([vis[j]]);
            const fe = Array.from(lista.querySelectorAll('.w11-exp__fila, .w11-exp__unidad')).find(x => x._nodo === vis[j]);
            if (fe) fe.focus({ preventScroll: false });
            return true;
          }
          case 'Shift + F10': case 'Menú': if (sel.length) { const fe = lista.querySelector('.w11-exp__fila--sel'); const r = (fe || lista).getBoundingClientRect(); menuNodo(r.left + 40, r.top + 12, sel, E); } return true;
          default: return false;
        }
      }
      W.abrir({ app: 'explorador', titulo: tituloDe(actual), icono: 'explorador', ancho: 74, alto: 84, estado: o.max ? 'max' : undefined,
        alCerrar: () => { exploradores.splice(exploradores.indexOf(E), 1); },
        onTecla: (c) => teclaExp(c),
        crear: (c, vv) => { v = vv; E.v = vv; montar(c); } });
      E.ruta = () => rutaReal(actual);
      E.extensiones = () => W.est.verExt;
      E.ocultos = () => W.est.verOcultos;
      E.aviso = W.aviso;
      E.buscar = buscar;
      E.raiz = raiz;
      E.papelera = PAPELERA.hijos;
      E.actual = () => cadena(actual);
      return E;
    }

    /* ---- lo que se exporta en W ---- */
    function aLaPapelera(n, ruta) { n._origen = ruta; n._p = PAPELERA; PAPELERA.hijos.push(n); enlazar(n, PAPELERA); n._p = PAPELERA; repintar(); }
    Object.assign(W, {
      fsRaiz: raiz, PAPELERA, aLaPapelera, buscar, rutaReal, visto, peso, tamano, unidadDe, cadena,
      abrirExplorador, abrirNodo, propiedades, eliminar, restaurar, vaciar, meter, crearAcceso, formatear, expulsar,
      comprimir, extraer, renombrarNodo, carpetaUsuario, repintar, exploradores: () => exploradores.slice(),
      deshacer: deshacerUltimo,
    });
    W.apps.explorador.abrir = (W2, o) => abrirExplorador(o && o.ruta ? o.ruta : (op.inicioExplorador || raiz), { max: o && o.max });
    W.apps.papelera = { id: 'papelera', n: 'Papelera de reciclaje', icono: 'papelera', abrir: () => abrirExplorador(PAPELERA) };
  }

  window.WIN11.archivos = archivos;
  window.WIN11.fs = { carpeta, archivo, unidad, equipo, usuario, KB, MB, GB, tamano, peso, ext, FAT32_MAX };
})();
