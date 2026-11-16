/* ============================================================
   Simulaciones de Gmail y Google Meet (Operaciones U4 S3,
   16/11/2026). Sustituyen a las actividades que se hacían con la
   cuenta del instituto de verdad (escribir un correo, CC y CCO en
   grupos de tres, etiquetas y spam, y la reunión de clase en Meet):
   así no hace falta montar la reunión ni que funcionen las cuentas
   de todos el mismo día, y se ve lo que en la realidad no se puede
   ver (la bandeja de cada destinatario). Van dentro del Windows 11
   de mentira (js/win11.js), en el Chrome de mentira con webs
   inventadas (WIN11.web, de js/sim-internet.js).

   correo-redacta  Actividad 1: correo a ti mismo con asunto,
                   saludo, despedida, firma y un adjunto de
                   Documentos › practicas-u1 (ventana «Abrir» de
                   Windows); Gmail avisa sin asunto, si dices
                   «adjunto» y no hay nada, si la dirección está mal
                   escrita (y devuelve el correo si no existe);
                   «Deshacer» después de enviar.
   correo-cco      Actividad 2: Para: Ana y CCO: Dani, y luego CC.
                   Se puede entrar en la cuenta de Ana y en la de Dani
                   (inicial de arriba a la derecha) y mirar con la
                   flechita de «para mí» a quién ve cada uno.
   correo-ordena   Actividad 3: etiqueta nueva «Unidad 4», archivar,
                   encontrarlo en la etiqueta y sacar del Spam el
                   correo bueno que se ha colado.
   meet            Actividad 6: la reunión, desde el aviso de
                   Classroom: entrar con micro y cámara apagados,
                   chat, levantar la mano, Personas y colgar. Si se
                   enciende el micro en el aula, acople.

   Todo inventado: cuentas, nombres (alias) y correos. Nada se
   guarda.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function' || !window.WIN11) return;

  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  const DOM = '@iesramonllull.net';
  const YO = 'profesorcabron' + DOM, ANA = 'ana' + DOM, DANI = 'dani' + DOM, PROFE = 'profe' + DOM;
  const CONTACTOS = { [YO]: 'ProfesorCabron', [ANA]: 'Ana', [DANI]: 'Dani', [PROFE]: 'Profe' };
  const KB = 1024, MB = KB * 1024;
  const ICO_EXT = { txt: 'texto', pdf: 'pdf', jpg: 'imagen', png: 'imagen', mp4: 'video', docx: 'word', exe: 'exe' };
  const icoDe = n => ICO_EXT[(/\.([a-z0-9]+)$/i.exec(n) || [])[1]] || 'documento';
  const tam = b => b >= MB ? (b / MB).toLocaleString('es-ES', { maximumFractionDigits: 1 }) + ' MB' : Math.max(1, Math.round(b / KB)) + ' KB';
  const DIR_OK = /^[^\s@,;]+@[^\s@,;]+\.[a-z]{2,}$/i;
  const sinTraducir = n => { n.setAttribute('translate', 'no'); return n; };

  /* ============================================================
     Un Gmail de mentira (mail.google.com) dentro del Chrome de
     mentira.
       op.cuentas   [dir, …] (la primera es la tuya; con más de una,
                    la inicial de arriba deja cambiar de cuenta)
       op.buzones   { dir: [{ de, para, cc, cco, as, cu, adj, fecha,
                    spam, estrella, leido, etiq, rec, env }] }
       op.etiquetas ['…']
       op.archivos  { 'Documents': [[nombre, bytes] | carpeta], … }
       op.evento(n, d)  'enviar' {m}, 'deshacer' {m}, 'lista'
                    {carpeta, entradas}, 'abrir' {e, carpeta},
                    'detalles' {m, cuenta}, 'etiqueta' {e, nombre,
                    puesta}, 'archivar' {e}, 'spam' {e}, 'noSpam' {e},
                    'eliminar' {e}, 'restaurar' {e}, 'cuenta' {dir},
                    'redactar', 'adjuntar' {n}
     ============================================================ */
  function gmail(W, ctx, op) {
    const { el, boton } = ctx;
    const ic = WIN11.icono;
    const ev = (n, d) => op.evento && op.evento(n, d || {});
    let idn = 1;
    const buzon = {};
    op.cuentas.forEach(d => { buzon[d] = []; });
    const S = { cuenta: op.cuentas[0], carpeta: 'rec', abierto: null, borrador: null, buscar: '', etiquetas: (op.etiquetas || []).slice(), detalles: false };
    const nuevoM = m => Object.assign({ id: idn++, de: YO, para: [], cc: [], cco: [], as: '', cu: '', adj: [], fecha: 'ahora' }, m);
    Object.keys(op.buzones || {}).forEach(d => {
      (op.buzones[d] || []).slice().reverse().forEach(x => {
        const m = nuevoM(x);
        buzon[d].push({ m, rec: x.rec !== false, env: !!x.env, arch: !!x.arch, spam: !!x.spam, papelera: false, estrella: !!x.estrella, leido: !!x.leido, etiq: (x.etiq || []).slice() });
      });
    });

    const nombre = d => d === S.cuenta ? 'yo' : (CONTACTOS[d] || d);
    const nombreMi = d => d === S.cuenta ? 'mí' : (CONTACTOS[d] || d);
    const mio = () => buzon[S.cuenta];
    const visible = (e, k) => {
      if (k === 'spam') return e.spam && !e.papelera;
      if (k === 'papelera') return e.papelera;
      if (e.spam || e.papelera) return false;
      if (k === 'rec') return e.rec && !e.arch;
      if (k === 'est') return e.estrella;
      if (k === 'env') return e.env;
      if (k === 'todos') return true;
      if (k === 'buscar') { const q = norm(S.buscar); return !!q && norm([e.m.as, e.m.cu, e.m.de, CONTACTOS[e.m.de] || '', e.m.adj.map(a => a.n).join(' ')].join(' ')).includes(q); }
      if (k.indexOf('et:') === 0) return e.etiq.indexOf(k.slice(3)) !== -1;
      return false;
    };
    const NOMBRES = { rec: 'Recibidos', est: 'Destacados', env: 'Enviados', todos: 'Todos', spam: 'Spam', papelera: 'Papelera', buscar: 'Resultados de búsqueda' };
    const nombreCarpeta = k => k.indexOf('et:') === 0 ? k.slice(3) : NOMBRES[k];

    let C = null, toastEl = null, toastT = null;
    C = WIN11.web(W, { pestanas: [{ url: 'mail.google.com/mail/u/0/#inbox' }], sitios: { 'mail.google.com': pagina } });
    function pinta() { C.pintar(); }
    function irA(k) { S.carpeta = k; S.abierto = null; S.detalles = false; pinta(); ev('carpeta', { carpeta: k }); }

    function pagina(t, cont) {
      cont.classList.add('w11-gm');
      t.t = (S.abierto ? (S.abierto.m.as || '(sin asunto)') : nombreCarpeta(S.carpeta)) + ' - ' + S.cuenta + ' - Gmail';
      // cabecera
      const cab = el('div', 'w11-gm__cab');
      cab.appendChild(el('span', 'w11-gm__logo', 'Gmail'));
      const bus = document.createElement('input');
      bus.type = 'search';
      bus.className = 'w11-web__campo w11-gm__buscar';
      bus.placeholder = 'Buscar correo';
      bus.setAttribute('aria-label', 'Buscar correo');
      bus.value = S.buscar;
      bus.addEventListener('keydown', e => { if (e.key === 'Enter') { S.buscar = bus.value; irA(S.buscar.trim() ? 'buscar' : 'rec'); } });
      const yo = boton((CONTACTOS[S.cuenta] || 'Y')[0], 'w11-gm__yo');
      yo.setAttribute('aria-label', 'Cuenta de Google: ' + S.cuenta);
      yo.title = 'Cuenta de Google: ' + S.cuenta;
      yo.addEventListener('click', () => {
        const r = yo.getBoundingClientRect();
        const items = [{ t: S.cuenta, off: true, noTraducir: true }, { sep: true }];
        if (op.cuentas.length > 1) {
          op.cuentas.filter(d => d !== S.cuenta).forEach(d => items.push({ t: 'Cambiar a ' + CONTACTOS[d] + ' (' + d + ')', f: () => { S.cuenta = d; S.carpeta = 'rec'; S.abierto = null; S.borrador = null; S.detalles = false; pinta(); ev('cuenta', { dir: d }); } }));
        } else items.push({ t: 'Gestionar tu cuenta de Google', off: true });
        W.menu(r.right - 220, r.bottom, items);
      });
      cab.append(bus, yo);
      cont.appendChild(cab);
      const cuerpo = el('div', 'w11-gm__cuerpo');
      cont.appendChild(cuerpo);
      // columna izquierda
      const lado = el('nav', 'w11-gm__lado');
      lado.setAttribute('aria-label', 'Carpetas y etiquetas');
      const red = boton('✏️ Redactar', 'w11-gm__redactar');
      red.addEventListener('click', () => { if (!S.borrador) S.borrador = { para: '', cc: '', cco: '', verCc: false, verCco: false, as: '', cu: '', adj: [] }; S.abierto = null; pinta(); ev('redactar'); });
      lado.appendChild(red);
      const carp = (k, n) => {
        const cuenta = k === 'rec' ? mio().filter(e => visible(e, 'rec') && !e.leido).length : k === 'spam' ? mio().filter(e => visible(e, 'spam')).length : 0;
        const b = boton('', 'w11-gm__carp' + (S.carpeta === k && !S.borrador ? ' w11-gm__carp--actual' : ''));
        b.append(el('span', null, n), el('span', 'w11-gm__num', cuenta ? String(cuenta) : ''));
        if (S.carpeta === k) b.setAttribute('aria-current', 'page');
        b.addEventListener('click', () => { S.borrador = null; irA(k); });
        lado.appendChild(b);
      };
      [['rec', '📥 Recibidos'], ['est', '☆ Destacados'], ['env', '➤ Enviados'], ['todos', '✉ Todos'], ['spam', '⚠ Spam'], ['papelera', '🗑 Papelera']].forEach(x => carp(x[0], x[1]));
      const et = el('div', 'w11-gm__ethead');
      et.appendChild(el('span', null, 'Etiquetas'));
      const mas = boton('+', 'w11-gm__etmas');
      mas.setAttribute('aria-label', 'Crear etiqueta');
      mas.title = 'Crear etiqueta';
      mas.addEventListener('click', () => crearEtiqueta(null));
      et.appendChild(mas);
      lado.appendChild(et);
      S.etiquetas.forEach(n => carp('et:' + n, '🏷 ' + n));
      const main = el('div', 'w11-gm__main');
      cuerpo.append(lado, main);
      if (S.borrador) return redactar(main);
      if (S.abierto) return correo(main);
      lista(main);
    }

    function lista(main) {
      const k = S.carpeta;
      const bar = el('div', 'w11-gm__bar');
      bar.appendChild(el('span', 'w11-gm__bar-t', k === 'buscar' ? 'Resultados de «' + S.buscar + '»' : nombreCarpeta(k)));
      main.appendChild(bar);
      if (k === 'spam') main.appendChild(el('p', 'w11-gm__nota', 'Los mensajes que lleven más de 30 días en Spam se eliminarán automáticamente.'));
      const vis = mio().filter(e => visible(e, k)).sort((a, b) => b.m.id - a.m.id);
      const l = el('div', 'w11-gm__lista');
      l.setAttribute('role', 'list');
      if (!vis.length) l.appendChild(el('p', 'w11-gm__vacia', k === 'rec' ? '¡Bandeja vacía!' : 'No hay ningún mensaje.'));
      vis.forEach(e => {
        const f = el('div', 'w11-gm__fila' + (e.leido ? '' : ' w11-gm__fila--nuevo'));
        f.setAttribute('role', 'listitem');
        const s = boton(e.estrella ? '★' : '☆', 'w11-gm__estrella' + (e.estrella ? ' w11-gm__estrella--on' : ''));
        s.setAttribute('aria-label', (e.estrella ? 'Quitar estrella: ' : 'Destacar: ') + (e.m.as || '(sin asunto)'));
        s.setAttribute('aria-pressed', String(e.estrella));
        s.addEventListener('click', x => { x.stopPropagation(); e.estrella = !e.estrella; pinta(); });
        const ab = boton('', 'w11-gm__abrir');
        const quien = k === 'env' ? 'Para: ' + e.m.para.concat(e.m.cc).map(nombre).join(', ') : (e.m.de === S.cuenta ? 'yo' : (CONTACTOS[e.m.de] || e.m.nombreDe || e.m.de));
        const de = sinTraducir(el('span', 'w11-gm__de', quien));
        const as = el('span', 'w11-gm__as');
        e.etiq.forEach(n => as.appendChild(el('span', 'w11-gm__chip', n)));
        if (k !== 'rec' && k !== 'spam' && e.rec && !e.arch && k !== 'env') as.appendChild(el('span', 'w11-gm__chip w11-gm__chip--gris', 'Recibidos'));
        as.append(el('strong', null, e.m.as || '(sin asunto)'), document.createTextNode(' — ' + e.m.cu.replace(/\s+/g, ' ').slice(0, 90)));
        const fin = el('span', 'w11-gm__fecha', (e.m.adj.length ? '📎 ' : '') + e.m.fecha);
        ab.append(de, as, fin);
        ab.addEventListener('click', () => { S.abierto = e; S.detalles = false; e.leido = true; pinta(); ev('abrir', { e, carpeta: k }); });
        f.append(s, ab);
        l.appendChild(f);
      });
      main.appendChild(l);
      ev('lista', { carpeta: k, entradas: vis });
    }

    function correo(main) {
      const e = S.abierto, m = e.m;
      const bar = el('div', 'w11-gm__bar');
      const b = (txt, lab, f, cls) => { const x = boton(txt, 'w11-gm__ib' + (cls ? ' ' + cls : '')); x.setAttribute('aria-label', lab); x.title = lab; x.addEventListener('click', f); bar.appendChild(x); return x; };
      const volver = () => { S.abierto = null; S.detalles = false; pinta(); };
      b('←', 'Volver a ' + nombreCarpeta(S.carpeta), volver);
      if (e.papelera) {
        b('Mover a Recibidos', 'Mover a Recibidos', () => { e.papelera = false; e.rec = true; e.arch = false; ev('restaurar', { e }); volver(); }, 'w11-gm__ib--txt');
      } else if (e.spam) {
        b('No es spam', 'No es spam', () => { e.spam = false; e.rec = true; e.arch = false; ev('noSpam', { e }); toast('Conversación movida a Recibidos.'); volver(); }, 'w11-gm__ib--txt');
        b('🗑', 'Eliminar', () => { e.papelera = true; ev('eliminar', { e }); volver(); });
      } else {
        if (e.rec && !e.arch) b('🗄', 'Archivar', () => { e.arch = true; ev('archivar', { e }); toast('Conversación archivada.', () => { e.arch = false; ev('desarchivar', { e }); pinta(); }); volver(); });
        else if (e.rec && e.arch) b('📥', 'Mover a Recibidos', () => { e.arch = false; ev('desarchivar', { e }); toast('Conversación movida a Recibidos.'); volver(); });
        b('⚠', 'Marcar como spam', () => { e.spam = true; ev('spam', { e }); toast('Conversación marcada como spam.'); volver(); });
        b('🗑', 'Eliminar', () => { e.papelera = true; ev('eliminar', { e }); toast('Conversación enviada a la papelera.'); volver(); });
        const et = b('🏷', 'Etiquetar', () => {
          const r = et.getBoundingClientRect();
          const items = S.etiquetas.map(n => ({ t: n, marca: e.etiq.indexOf(n) !== -1, f: () => ponEtiqueta(e, n, e.etiq.indexOf(n) === -1) }));
          if (items.length) items.push({ sep: true });
          items.push({ t: 'Crear etiqueta', f: () => crearEtiqueta(e) });
          W.menu(r.left, r.bottom, items);
        });
        const mas = b('⋮', 'Más', () => {
          const r = mas.getBoundingClientRect();
          W.menu(r.left, r.bottom, [{ t: 'Responder', off: true }, { t: 'Reenviar', off: true }, { sep: true }, { t: 'Marcar como no leído', f: () => { e.leido = false; volver(); } }]);
        });
      }
      main.appendChild(bar);
      const tit = el('div', 'w11-gm__titulo');
      tit.appendChild(el('span', 'w11-gm__titulo-t', m.as || '(sin asunto)'));
      if (e.spam) tit.appendChild(el('span', 'w11-gm__chip w11-gm__chip--gris', 'Spam'));
      e.etiq.forEach(n => {
        const c = el('span', 'w11-gm__chip', n + ' ');
        const x = boton('×', 'w11-gm__chip-x');
        x.setAttribute('aria-label', 'Quitar la etiqueta ' + n);
        x.addEventListener('click', () => ponEtiqueta(e, n, false));
        c.appendChild(x);
        tit.appendChild(c);
      });
      main.appendChild(tit);
      const cab = el('div', 'w11-gm__cabm');
      cab.appendChild(el('span', 'w11-gm__avatar', (CONTACTOS[m.de] || m.nombreDe || m.de)[0].toUpperCase()));
      const q = el('div', 'w11-gm__quien');
      q.append(sinTraducir(el('span', 'w11-gm__nombre', m.de === S.cuenta ? (CONTACTOS[m.de] || m.de) : (CONTACTOS[m.de] || m.nombreDe || m.de))), sinTraducir(el('span', 'w11-gm__dir', '<' + m.de + '>')));
      // «para mí ▾»
      let resumen = 'para ' + m.para.map(nombreMi).join(', ');
      if (m.cc.length) resumen += ', cc: ' + m.cc.map(nombreMi).join(', ');
      if (m.de === S.cuenta && m.cco.length) resumen += ', cco: ' + m.cco.map(nombreMi).join(', ');
      else if (m.cco.indexOf(S.cuenta) !== -1) resumen += ', cco: mí';
      if (!m.para.length && m.cco.indexOf(S.cuenta) !== -1) resumen = 'cco: mí';
      const para = boton(resumen + ' ▾', 'w11-gm__para');
      para.setAttribute('aria-expanded', String(S.detalles));
      para.setAttribute('aria-label', resumen + '. Ver detalles');
      para.addEventListener('click', () => { S.detalles = !S.detalles; pinta(); if (S.detalles) ev('detalles', { m, cuenta: S.cuenta, e }); });
      q.appendChild(para);
      cab.append(q, el('span', 'w11-gm__fecha', m.fecha));
      main.appendChild(cab);
      if (S.detalles) {
        const d = el('dl', 'w11-gm__det');
        const fila = (k2, v) => { d.append(el('dt', null, k2 + ':'), sinTraducir(el('dd', null, v))); };
        const lista2 = a => a.map(x => (CONTACTOS[x] || x) + ' <' + x + '>').join(', ');
        fila('de', (CONTACTOS[m.de] || m.nombreDe || m.de) + ' <' + m.de + '>');
        if (m.para.length) fila('para', lista2(m.para));
        if (m.cc.length) fila('cc', lista2(m.cc));
        if (m.cco.length && m.de === S.cuenta) fila('cco', lista2(m.cco));
        else if (m.cco.indexOf(S.cuenta) !== -1) fila('cco', S.cuenta);
        fila('fecha', m.fecha);
        fila('asunto', m.as || '(sin asunto)');
        main.appendChild(d);
      }
      main.appendChild(el('p', 'w11-gm__texto', m.cu));
      if (m.adj.length) {
        const zona = el('div', 'w11-gm__adjs');
        m.adj.forEach(a => zona.appendChild(adjunto(a)));
        main.appendChild(zona);
      }
    }

    function adjunto(a, quitar) {
      const c = el('div', 'w11-gm__adj' + (a.drive ? ' w11-gm__adj--drive' : ''));
      c.appendChild(ic(a.drive ? 'navegador' : icoDe(a.n)));
      const t = el('span', 'w11-gm__adj-t');
      t.append(sinTraducir(el('span', null, a.n)), el('small', null, a.drive ? 'Enlace de Google Drive' : tam(a.t)));
      c.appendChild(t);
      if (quitar) {
        const x = boton('×', 'w11-gm__chip-x');
        x.setAttribute('aria-label', 'Quitar ' + a.n);
        x.addEventListener('click', quitar);
        c.appendChild(x);
      }
      return c;
    }

    function ponEtiqueta(e, n, si) {
      const i = e.etiq.indexOf(n);
      if (si && i === -1) e.etiq.push(n);
      if (!si && i !== -1) e.etiq.splice(i, 1);
      ev('etiqueta', { e, nombre: n, puesta: si });
      pinta();
    }
    function crearEtiqueta(e) {
      let campo = null;
      C.modal('Etiqueta nueva', caja => {
        caja.appendChild(el('p', null, 'Escribe el nombre de la etiqueta:'));
        campo = document.createElement('input');
        campo.className = 'w11-web__campo';
        campo.setAttribute('aria-label', 'Nombre de la etiqueta');
        campo.addEventListener('keydown', x => { if (x.key === 'Enter') { x.preventDefault(); caja.closest('.w11-web__modal').querySelector('.w11-web__btn--primario').click(); } });
        caja.appendChild(campo);
      }, [{ t: 'Cancelar' }, { t: 'Crear', primario: true, f: () => {
        const n = campo.value.replace(/\s+/g, ' ').trim();
        if (!n) { W.aviso('Escribe un nombre para la etiqueta.', 'cuidado'); return false; }
        let nom = S.etiquetas.find(x => norm(x) === norm(n));
        if (!nom) { S.etiquetas.push(n); nom = n; ev('crearEtiqueta', { nombre: n }); }
        if (e) ponEtiqueta(e, nom, true); else pinta();
      } }]);
    }

    /* ---------- Redactar ---------- */
    function redactar(main) {
      const b = S.borrador;
      const caja = el('div', 'w11-gm__comp');
      caja.setAttribute('role', 'form');
      caja.setAttribute('aria-label', 'Mensaje nuevo');
      const cab = el('div', 'w11-gm__comp-cab');
      cab.appendChild(el('span', null, b.as || 'Mensaje nuevo'));
      const x = boton('×', 'w11-gm__comp-x');
      x.setAttribute('aria-label', 'Guardar y cerrar');
      x.title = 'Guardar y cerrar';
      x.addEventListener('click', () => { S.borrador = null; pinta(); });
      cab.appendChild(x);
      caja.appendChild(cab);
      const fila = (etq, k, extra) => {
        const f = el('label', 'w11-gm__comp-f');
        f.appendChild(el('span', 'w11-gm__comp-l', etq));
        const i = document.createElement('input');
        i.className = 'w11-gm__comp-i';
        i.value = b[k];
        i.setAttribute('aria-label', etq);
        if (k !== 'as') { i.setAttribute('autocomplete', 'off'); sinTraducir(i); i.setAttribute('list', 'w11-gm-contactos'); }
        i.addEventListener('input', () => { b[k] = i.value; });
        f.appendChild(i);
        if (extra) f.appendChild(extra);
        caja.appendChild(f);
        return i;
      };
      const dl = document.createElement('datalist');
      dl.id = 'w11-gm-contactos';
      Object.keys(CONTACTOS).forEach(d => { const o = document.createElement('option'); o.value = d; o.label = CONTACTOS[d]; dl.appendChild(o); });
      caja.appendChild(dl);
      const ccs = el('span', 'w11-gm__comp-ccs');
      if (!b.verCc) { const c = boton('Cc', 'w11-gm__comp-cc'); c.setAttribute('aria-label', 'Añadir destinatarios en copia (CC)'); c.addEventListener('click', e => { e.preventDefault(); b.verCc = true; pinta(); }); ccs.appendChild(c); }
      if (!b.verCco) { const c = boton('Cco', 'w11-gm__comp-cc'); c.setAttribute('aria-label', 'Añadir destinatarios en copia oculta (CCO)'); c.addEventListener('click', e => { e.preventDefault(); b.verCco = true; pinta(); }); ccs.appendChild(c); }
      const pi = fila('Para', 'para', ccs);
      if (b.verCc) fila('Cc', 'cc');
      if (b.verCco) fila('Cco', 'cco');
      const ai = fila('Asunto', 'as');
      ai.addEventListener('input', () => { cab.firstChild.textContent = ai.value || 'Mensaje nuevo'; });
      const ta = document.createElement('textarea');
      ta.className = 'w11-gm__comp-ta';
      ta.value = b.cu;
      ta.setAttribute('aria-label', 'Cuerpo del mensaje');
      ta.addEventListener('input', () => { b.cu = ta.value; });
      caja.appendChild(ta);
      if (b.adj.length) {
        const z = el('div', 'w11-gm__adjs');
        b.adj.forEach((a, i) => z.appendChild(adjunto(a, () => { b.adj.splice(i, 1); pinta(); })));
        caja.appendChild(z);
      }
      const pie = el('div', 'w11-gm__comp-pie');
      const env = boton('Enviar', 'w11-gm__enviar');
      env.addEventListener('click', enviar);
      const clip = boton('📎', 'w11-gm__ib');
      clip.setAttribute('aria-label', 'Adjuntar archivos');
      clip.title = 'Adjuntar archivos';
      clip.addEventListener('click', examinar);
      const tirar = boton('🗑', 'w11-gm__ib w11-gm__ib--fin');
      tirar.setAttribute('aria-label', 'Descartar borrador');
      tirar.title = 'Descartar borrador';
      tirar.addEventListener('click', () => { S.borrador = null; pinta(); toast('Borrador descartado.'); });
      pie.append(env, clip, tirar);
      caja.appendChild(pie);
      main.appendChild(caja);
      if (!b._foco) { b._foco = true; setTimeout(() => pi.focus({ preventScroll: true }), 0); }
    }

    // ventana «Abrir» de Windows para adjuntar
    function examinar() {
      const raiz = op.archivos || {};
      let ruta = ['Documents'], sel = null;
      const VISTA = { Documents: 'Documentos', Downloads: 'Descargas', Desktop: 'Escritorio' };
      const carpetaEn = r => r.reduce((n, p) => (n && n[p]) || null, raiz);
      W.dialogo({ titulo: 'Abrir', crear: t => {
        const pintaD = () => {
          t.innerHTML = '';
          const lugares = el('div', 'w11-gm__abrir-lug');
          Object.keys(raiz).forEach(k => {
            const x = boton(VISTA[k] || k, 'w11-btn' + (ruta[0] === k && ruta.length === 1 ? ' w11-btn--primario' : ''));
            x.addEventListener('click', () => { ruta = [k]; sel = null; pintaD(); });
            lugares.appendChild(x);
          });
          t.appendChild(lugares);
          const migas = el('div', 'w11-gm__abrir-migas');
          if (ruta.length > 1) {
            const sube = boton('↑', 'w11-btn');
            sube.setAttribute('aria-label', 'Subir un nivel');
            sube.addEventListener('click', () => { ruta.pop(); sel = null; pintaD(); });
            migas.appendChild(sube);
          }
          migas.appendChild(sinTraducir(el('span', 'w11-nota', 'Este equipo › alumno › ' + ruta.map(p => VISTA[p] || p).join(' › '))));
          t.appendChild(migas);
          const l = el('div', 'w11-perm__lista w11-gm__abrir-l');
          const aqui = carpetaEn(ruta) || {};
          const nombres = Object.keys(aqui).sort((a, b2) => (Array.isArray(aqui[a]) ? 1 : 0) - (Array.isArray(aqui[b2]) ? 1 : 0) || a.localeCompare(b2));
          if (!nombres.length) l.appendChild(el('p', 'w11-nota', 'Esta carpeta está vacía.'));
          nombres.forEach(n => {
            const v = aqui[n];
            const esC = !Array.isArray(v);
            const x = boton('', 'w11-perm__g' + (sel === n ? ' w11-perm__g--sel' : ''));
            x.append(ic(esC ? 'carpeta' : icoDe(n)), sinTraducir(el('span', null, n)));
            if (!esC) x.appendChild(el('span', 'w11-nota', ' ' + tam(v[0])));
            x.addEventListener('click', () => { if (esC) { ruta.push(n); sel = null; } else sel = n; pintaD(); });
            l.appendChild(x);
          });
          t.appendChild(l);
        };
        pintaD();
      }, botones: [{ t: 'Abrir', primario: true, f: () => {
        if (!sel) { W.aviso('Elige un archivo (las carpetas se abren tocándolas).', 'cuidado'); return false; }
        const v = carpetaEn(ruta)[sel];
        const a = { n: sel, t: v[0], ruta: ruta.join('/') };
        if (a.t > 25 * MB) {
          a.drive = true;
          toast('Los archivos de más de 25 MB se envían como un enlace de Google Drive.');
        }
        S.borrador.adj.push(a);
        ev('adjuntar', { a });
        pinta();
      } }, { t: 'Cancelar', cancelar: true }] });
    }

    function toast(texto, deshacer, extra) {
      clearTimeout(toastT);
      if (toastEl) toastEl.remove();
      const v = C.ventana();
      const zona = v && v.cuerpo.querySelector('.w11-ch__web');
      if (!zona) return;
      toastEl = el('div', 'w11-gm__toast');
      toastEl.setAttribute('role', 'status');
      toastEl.appendChild(el('span', null, texto));
      if (deshacer) { const d = boton('Deshacer', 'w11-gm__toast-b'); d.addEventListener('click', () => { toastEl.remove(); toastEl = null; deshacer(); }); toastEl.appendChild(d); }
      if (extra) { const d = boton(extra[0], 'w11-gm__toast-b'); d.addEventListener('click', () => { toastEl.remove(); toastEl = null; extra[1](); }); toastEl.appendChild(d); }
      zona.appendChild(toastEl);
      const yo2 = toastEl;
      toastT = setTimeout(() => { yo2.remove(); if (toastEl === yo2) toastEl = null; }, 8000);
    }

    function resolver(txt) {
      const out = [], malas = [];
      String(txt || '').split(/[,;]+/).map(x => x.trim()).filter(Boolean).forEach(tk => {
        if (tk.indexOf('@') !== -1) { (DIR_OK.test(tk) ? out : malas).push(tk.toLowerCase()); return; }
        const c = Object.keys(CONTACTOS).filter(d => norm(CONTACTOS[d]).indexOf(norm(tk)) === 0);
        if (c.length === 1) out.push(c[0]); else malas.push(tk);
      });
      return { out: out.filter((d, i) => out.indexOf(d) === i), malas };
    }
    function enviar() {
      const b = S.borrador;
      const r = { para: resolver(b.para), cc: resolver(b.cc), cco: resolver(b.cco) };
      const error = (titulo, texto) => C.modal(titulo, c => c.appendChild(el('p', null, texto)), [{ t: 'Aceptar', primario: true }]);
      const total = r.para.out.length + r.cc.out.length + r.cco.out.length;
      const mala = ['para', 'cc', 'cco'].find(k => r[k].malas.length);
      if (mala) { error('Error', `No se reconoce la dirección «${r[mala].malas[0]}» del campo «${{ para: 'Para', cc: 'Cc', cco: 'Cco' }[mala]}». Asegúrate de que todas las direcciones tienen el formato correcto (nombre@dominio).`); ev('error', { tipo: 'direccion' }); return; }
      if (!total) { error('Error', 'Indica al menos un destinatario.'); ev('error', { tipo: 'vacio' }); return; }
      const sigue = [];
      if (!b.as.trim()) sigue.push(fin => C.modal('¿Enviar sin asunto?', c => c.appendChild(el('p', null, '¿Quieres enviar este mensaje sin asunto?')), [{ t: 'Cancelar' }, { t: 'Enviar', primario: true, f: () => { setTimeout(fin, 0); } }]));
      if (/adjunt/i.test(norm(b.cu)) && !b.adj.length) sigue.push(fin => C.modal('¿Has olvidado adjuntar algo?', c => c.appendChild(el('p', null, 'Has escrito «adjunto» en el mensaje, pero no hay ningún archivo adjunto. ¿Quieres enviarlo igualmente?')), [{ t: 'Cancelar' }, { t: 'Enviar de todos modos', primario: true, f: () => { setTimeout(fin, 0); } }]));
      const paso = i => { if (i < sigue.length) sigue[i](() => paso(i + 1)); else hecho(); };
      const hecho = () => {
        const m = nuevoM({ de: S.cuenta, para: r.para.out, cc: r.cc.out, cco: r.cco.out, as: b.as.trim(), cu: b.cu, adj: b.adj.slice() });
        const guardado = Object.assign({}, b, { adj: b.adj.slice(), _foco: false });
        const puestas = entregar(m);
        S.borrador = null;
        S.abierto = null;
        pinta();
        ev('enviar', { m });
        toast('Mensaje enviado.', () => {
          puestas.forEach(p => { const l = buzon[p.d]; const i = l.indexOf(p.e); if (i !== -1) l.splice(i, 1); });
          S.borrador = guardado;
          pinta();
          ev('deshacer', { m });
        }, ['Ver mensaje', () => { const e = mio().find(x => x.m === m); if (e) { S.carpeta = 'env'; S.abierto = e; e.leido = true; pinta(); ev('abrir', { e, carpeta: 'env' }); } }]);
      };
      paso(0);
    }
    function entregar(m) {
      const puestas = [];
      const mia = { m, rec: false, env: true, arch: false, spam: false, papelera: false, estrella: false, leido: true, etiq: [] };
      buzon[m.de].push(mia);
      puestas.push({ d: m.de, e: mia });
      const todos = m.para.concat(m.cc, m.cco).filter((d, i, a) => a.indexOf(d) === i);
      todos.forEach(d => {
        if (d === m.de) { mia.rec = true; mia.leido = false; return; }
        if (buzon[d]) { const e = { m, rec: true, env: false, arch: false, spam: false, papelera: false, estrella: false, leido: false, etiq: [] }; buzon[d].push(e); puestas.push({ d, e }); return; }
        if (CONTACTOS[d]) return;
        if (/@iesramonllull\.net$/.test(d)) {
          const r = { m: nuevoM({ de: 'mailer-daemon@googlemail.com', nombreDe: 'Mail Delivery Subsystem', para: [m.de], as: 'Dirección no encontrada', cu: `Tu mensaje no se ha entregado a ${d} porque no se ha encontrado la dirección o no puede recibir correo.\n\nRevisa la dirección: puede que tenga una letra mal o que le falte algo.` }), rec: true, env: false, arch: false, spam: false, papelera: false, estrella: false, leido: false, etiq: [] };
          buzon[m.de].push(r);
          puestas.push({ d: m.de, e: r });
        }
      });
      return puestas;
    }

    return { S, buzon, C, pinta, toast, irA };
  }

  const PRACTICAS = {
    'notas-u1.txt': [2 * KB], 'horario.pdf': [184 * KB], 'perro.jpg': [2.4 * MB], 'video-viaje.mp4': [48 * MB],
  };
  const ARCHIVOS = {
    Documents: { 'practicas-u1': PRACTICAS, 'carta-presentacion.docx': [36 * KB] },
    Downloads: { 'minecraft-mods.zip': [12 * MB], 'instalar-juego.exe': [3 * MB] },
  };
  const BIENVENIDA = { de: PROFE, para: [YO], as: 'Bienvenida a la Unidad 4', cu: 'Hola:\n\nEsta semana vemos el navegador, los buscadores y el correo. Los apuntes están en la web de la asignatura.\n\nUn saludo,\nProfe', fecha: '9 nov', leido: true };

  /* ============================================================
     Actividad 1 · Un correo bien hecho
     ============================================================ */
  registrarSimulacion('correo-redacta', {
    ventana: 'Windows 11 · Google Chrome',
    mision: [
      'Mándate un correo a ti mismo (tu dirección sale al tocar tu inicial, arriba a la derecha) con el asunto «Prueba Unidad 4 - ProfesorCabron».',
      'Que lleve saludo, una frase, despedida y firma.',
      'Adjunta un archivo de Documentos › practicas-u1.',
      'Encuentra tu correo en los dos sitios de Gmail donde aparece.',
    ],
    final: 'Apunta en tu cuaderno el asunto exacto, el archivo que has adjuntado y en qué dos sitios de Gmail aparece el correo (pregunta 6).',
    crear(ctx) {
      const W = WIN11.escritorio(ctx, { fs: WIN11.fs.equipo(WIN11.fs.usuario({})), barra: ['explorador', 'navegador'] });
      let bueno = null, vistos = {};
      const G = gmail(W, ctx, {
        cuentas: [YO],
        buzones: { [YO]: [BIENVENIDA, { de: 'no-reply@classroom.google.com', nombreDe: 'Google Classroom', para: [YO], as: 'Nueva tarea: Unidad 4 - Sesión 3', cu: 'Profe ha publicado una tarea nueva en Operaciones básicas.', fecha: 'ayer' }] },
        archivos: ARCHIVOS,
        evento(n, d) {
          if (n === 'enviar') {
            const m = d.m;
            vistos = {};
            if (ctx.hecho(3)) ctx.deshace(3);
            const aMi = m.para.concat(m.cc).indexOf(YO) !== -1;
            const okAs = /^prueba unidad 4 ?- ?profesorcabron$/.test(norm(m.as));
            const lin = m.cu.split(/\n/).map(x => x.trim()).filter(Boolean);
            const DESP = /(un saludo|saludos|gracias|hasta (luego|pronto|manana|el)|un abrazo|atentamente|nos vemos)/;
            const saludo = lin.length && /^(hola|buen[oa]s|querid[oa]|estimad[oa]|hey)\b/.test(norm(lin[0]));
            const desp = lin.some(l => DESP.test(norm(l)));
            const ult = norm(lin[lin.length - 1] || '');
            const firma = lin.length >= 2 && ((DESP.test(ult) && /,\s*\S+/.test(ult.replace(DESP, ''))) || (!DESP.test(ult) && ult.split(' ').length <= 4 && !(lin.length === 1)));
            const frase = lin.length >= 3 && norm(m.cu).split(' ').length >= 8;
            const deP = m.adj.filter(a => a.ruta === 'Documents/practicas-u1');
            const falta = [];
            if (!saludo) falta.push('el saludo al principio («Hola, …»)');
            if (!frase) falta.push('una frase que cuente algo');
            if (!desp) falta.push('la despedida («Un saludo», «Gracias»…)');
            if (!firma) falta.push('la firma: tu nombre en la última línea');
            const t0 = aMi && okAs, t1 = !falta.length, t2 = deP.length > 0;
            [t0, t1, t2].forEach((ok, i) => { if (!ok && ctx.hecho(i)) ctx.deshace(i); });
            if (t0) ctx.cumple(0, `Correo a ti mismo (${YO}) con el asunto «${m.as}».`);
            if (t1) ctx.cumple(1, 'Saludo, frase, despedida y firma.');
            if (t2) ctx.cumple(2, `Adjunto: ${deP.map(a => a.n).join(', ')}${deP.some(a => a.drive) ? ' (pasa de 25 MB: va como enlace de Drive)' : ''}.`);
            const avisos = [];
            if (!aMi) avisos.push(`Este correo no te llega a ti: en «Para» va tu propia dirección (${YO}).`);
            else if (!okAs) avisos.push('El asunto tiene que ser exactamente «Prueba Unidad 4 - ProfesorCabron».');
            if (falta.length) avisos.push('Al cuerpo le falta: ' + falta.join(', ') + '.');
            if (!t2) avisos.push(m.adj.length ? 'El adjunto tiene que salir de Documentos › practicas-u1.' : 'No lleva adjunto: el clip 📎 está al lado de «Enviar».');
            if (avisos.length) {
              ctx.falla('Correo enviado, pero le falta algo: ' + avisos.join(' '));
              W.aviso(avisos.join(' ') + ' Vuelve a pulsar «Redactar» y escríbelo otra vez (o «Deshacer», justo después de enviar).', 'cuidado');
              bueno = null;
            } else {
              bueno = m;
              W.aviso('¡Enviado! Ahora búscalo: ¿en qué dos sitios de Gmail aparece?', 'ok');
            }
          } else if (n === 'deshacer') {
            if (bueno === d.m) { bueno = null; [0, 1, 2, 3].forEach(i => { if (ctx.hecho(i)) ctx.deshace(i); }); }
            ctx.apunta('«Deshacer»: el correo no se ha enviado y vuelve el borrador.');
          } else if (n === 'lista' && bueno && (d.carpeta === 'rec' || d.carpeta === 'env')) {
            if (d.entradas.some(e => e.m === bueno)) vistos[d.carpeta] = true;
            if (vistos.rec && vistos.env && !ctx.hecho(3)) ctx.cumple(3, 'El correo está en Recibidos (te ha llegado) y en Enviados (lo has mandado tú).');
          } else if (n === 'adjuntar' && d.a.drive) {
            W.aviso('Ese vídeo pesa más de 25 MB: Gmail no lo adjunta, lo sube a Drive y pone un enlace.', 'cuidado');
          } else if (n === 'error') {
            ctx.falla(d.tipo === 'vacio' ? 'Enviar sin nadie en «Para».' : 'Enviar con una dirección mal escrita.');
          }
        },
      });
      void G;
    },
  });

  /* ============================================================
     Actividad 2 · CC y CCO de verdad
     ============================================================ */
  registrarSimulacion('correo-cco', {
    ventana: 'Windows 11 · Google Chrome',
    mision: [
      'Manda un correo con Para: Ana, CCO: Dani y el asunto «Prueba CCO».',
      'Entra en la cuenta de Ana y en la de Dani, abre «Prueba CCO» y mira con la flechita de «para…» a quién ve cada uno.',
      'Repite con «Prueba CC» (Para: Ana, CC: Dani) y mira otra vez en la cuenta de Ana.',
    ],
    final: 'Apunta en tu cuaderno a quién veían Ana y Dani en cada prueba (pregunta 7).',
    crear(ctx) {
      const W = WIN11.escritorio(ctx, { fs: WIN11.fs.equipo(WIN11.fs.usuario({})), barra: ['explorador', 'navegador'] });
      let mCco = null, mCc = null, vA = false, vD = false;
      const iguales = (a, b) => a.length === b.length && a.every(x => b.indexOf(x) !== -1);
      gmail(W, ctx, {
        cuentas: [YO, ANA, DANI],
        buzones: { [YO]: [BIENVENIDA], [ANA]: [Object.assign({}, BIENVENIDA, { para: [ANA] })], [DANI]: [Object.assign({}, BIENVENIDA, { para: [DANI] })] },
        archivos: ARCHIVOS,
        evento(n, d) {
          if (n === 'enviar') {
            const m = d.m, a = norm(m.as);
            if (m.de !== YO) { W.aviso('Mándalo desde tu cuenta (ProfesorCabron): la de Ana y la de Dani son solo para mirar.', 'cuidado'); ctx.falla('Enviar desde la cuenta de otra persona.'); return; }
            if (a === 'prueba cco') {
              if (iguales(m.para, [ANA]) && iguales(m.cco, [DANI]) && !m.cc.length) { mCco = m; vA = vD = false; ctx.cumple(0, 'Enviado «Prueba CCO»: Para: Ana, CCO: Dani.'); W.aviso('Enviado. Ahora toca tu inicial (arriba a la derecha) y cambia a la cuenta de Ana.', 'ok'); }
              else if (m.cc.indexOf(DANI) !== -1) { ctx.falla('«Prueba CCO» con Dani en CC.'); W.aviso('Has puesto a Dani en CC, y así Ana sí lo ve. Para esta prueba, Dani va en CCO (pulsa «Cco» a la derecha de «Para»).', 'cuidado'); }
              else { ctx.falla('«Prueba CCO» con los destinatarios mal puestos.'); W.aviso('En «Para» va solo Ana y en «Cco», solo Dani (pulsa «Cco» a la derecha de «Para» para que salga).', 'cuidado'); }
            } else if (a === 'prueba cc') {
              if (iguales(m.para, [ANA]) && iguales(m.cc, [DANI]) && !m.cco.length) { mCc = m; ctx.apunta('Enviado «Prueba CC»: Para: Ana, CC: Dani.'); W.aviso('Enviado. Mira cómo lo ve Ana.', 'ok'); }
              else { ctx.falla('«Prueba CC» con los destinatarios mal puestos.'); W.aviso('En «Para» va Ana y en «Cc», Dani (pulsa «Cc» a la derecha de «Para»).', 'cuidado'); }
            } else {
              ctx.falla(`Correo con el asunto «${m.as}».`);
              W.aviso('El asunto tiene que ser «Prueba CCO» (y luego «Prueba CC»), para que los encuentres fácil.', 'cuidado');
            }
          } else if (n === 'deshacer') {
            if (d.m === mCco) { mCco = null; vA = vD = false; [0, 1].forEach(i => { if (ctx.hecho(i)) ctx.deshace(i); }); }
            if (d.m === mCc) mCc = null;
          } else if (n === 'cuenta') {
            ctx.apunta('Cambias a la cuenta de ' + CONTACTOS[d.dir] + '.');
          } else if (n === 'detalles') {
            if (d.m === mCco) {
              if (d.cuenta === YO) { W.aviso('Esta es tu cuenta: tú, que lo has mandado, ves a todos. Toca tu inicial (arriba a la derecha) y cambia a la cuenta de Ana o a la de Dani.', 'cuidado'); return; }
              if (d.cuenta === ANA && !vA) { vA = true; ctx.apunta('Cuenta de Ana: «para mí». Dani no sale por ninguna parte.'); }
              if (d.cuenta === DANI && !vD) { vD = true; ctx.apunta('Cuenta de Dani: «para Ana, cco: mí». Dani ve a Ana y sabe que a él le ha llegado en copia oculta.'); }
              if (vA && vD) ctx.cumple(1);
              else W.aviso(vA ? 'Ana no ve a Dani. Ahora mira en la cuenta de Dani.' : 'Ahora mira en la cuenta de Ana.', 'ok');
            } else if (d.m === mCc && d.cuenta === ANA) {
              if (!ctx.hecho(1)) { W.aviso('Primero mira la prueba de CCO en las dos cuentas.', 'cuidado'); return; }
              ctx.cumple(2, 'Cuenta de Ana con «Prueba CC»: «para mí, cc: Dani». Ahora Ana sí ve a Dani.');
            }
          } else if (n === 'error') {
            ctx.falla(d.tipo === 'vacio' ? 'Enviar sin nadie en «Para».' : 'Enviar con una dirección mal escrita.');
          }
        },
      });
    },
  });

  /* ============================================================
     Actividad 3 · Etiqueta y spam
     ============================================================ */
  registrarSimulacion('correo-ordena', {
    ventana: 'Windows 11 · Google Chrome',
    mision: [
      'Ponle al correo «Prueba Unidad 4 - ProfesorCabron» una etiqueta nueva: «Unidad 4».',
      'Archívalo.',
      'Encuéntralo otra vez: ábrelo desde la etiqueta «Unidad 4».',
      'En el Spam se ha colado un correo bueno: sácalo con «No es spam».',
    ],
    final: 'Apunta en tu cuaderno dónde has encontrado el correo archivado y qué tipo de correos había en el Spam (pregunta 9).',
    crear(ctx) {
      const W = WIN11.escritorio(ctx, { fs: WIN11.fs.equipo(WIN11.fs.usuario({})), barra: ['explorador', 'navegador'] });
      const G = gmail(W, ctx, {
        cuentas: [YO],
        etiquetas: ['Clase'],
        buzones: { [YO]: [
          { de: YO, para: [YO], as: 'Prueba Unidad 4 - ProfesorCabron', cu: 'Hola:\n\nEsto es una prueba del correo de la Unidad 4.\n\nUn saludo,\nProfesorCabron', adj: [{ n: 'horario.pdf', t: 184 * KB }], fecha: '10:12', env: true, leido: false, prueba: true },
          { de: ANA, para: [YO], as: '¿Quedamos para el trabajo?', cu: 'Hola, ProfesorCabron:\n¿Te va bien el jueves en la biblioteca?\nAna', fecha: '9:40', leido: false },
          Object.assign({}, BIENVENIDA, { etiq: ['Clase'] }),
          { de: 'ofertas@superskins-mc.shop', nombreDe: 'SuperSkins', para: [YO], as: '¡¡SKINS GRATIS SOLO HOY!!', cu: 'Consigue 500 skins de Minecraft gratis. Oferta por tiempo limitado. Pulsa aquí.', fecha: '8:01', spam: true, leido: false },
          { de: 'info@descuentos-top.es', nombreDe: 'Descuentos Top', para: [YO], as: 'Has sido seleccionado: -70 % en zapatillas', cu: 'Solo para ti: zapatillas con un 70 % de descuento. Date prisa, quedan pocas.', fecha: 'ayer', spam: true, leido: false },
          { de: PROFE, para: [YO], as: 'Cambio de aula el jueves', cu: 'Hola:\n\nEl jueves damos clase en el aula 2.14 (la de siempre está ocupada).\n\nUn saludo,\nProfe', fecha: 'ayer', spam: true, leido: false, bueno: true },
          { de: 'premios@loteria-mundial.win', nombreDe: 'Lotería Mundial', para: [YO], as: 'Has ganado 1.000.000 €', cu: 'Para cobrar tu premio, envíanos tus datos bancarios.', fecha: '15 nov', spam: true, leido: false },
        ] },
        archivos: ARCHIVOS,
        evento(n, d) {
          const e = d.e;
          const esP = e && e.m.prueba;
          if (n === 'etiqueta' && esP) {
            if (norm(d.nombre) === 'unidad 4') { if (d.puesta) ctx.cumple(0, 'Etiqueta: icono 🏷 → Crear etiqueta → «Unidad 4».'); else if (ctx.hecho(0)) ctx.deshace(0); }
            else if (d.puesta) { ctx.falla(`Etiqueta «${d.nombre}» en la prueba.`); W.aviso('La etiqueta que pide la actividad se llama «Unidad 4». Puedes quitar esta con la × que sale al lado del asunto.', 'cuidado'); }
          } else if (n === 'crearEtiqueta' && norm(d.nombre) !== 'unidad 4' && /unidad/.test(norm(d.nombre))) {
            W.aviso('Fíjate en cómo se escribe: «Unidad 4», con un espacio.', 'cuidado');
          } else if (n === 'archivar' && esP) {
            ctx.cumple(1, 'Archivar 🗄: desaparece de Recibidos, pero no se borra.');
            if (!ctx.hecho(0)) W.aviso('Archivado. ¿Le habías puesto la etiqueta? Si no, búscalo en «Todos» o con el buscador y pónsela.', 'cuidado');
            else W.aviso('Ya no está en Recibidos. ¿Dónde lo encuentras ahora?', 'ok');
          } else if (n === 'desarchivar' && esP) {
            if (ctx.hecho(1)) ctx.deshace(1);
            if (ctx.hecho(2)) ctx.deshace(2);
          } else if (n === 'abrir' && esP) {
            if (/^et:/.test(d.carpeta) && norm(d.carpeta.slice(3)) === 'unidad 4' && e.arch) ctx.cumple(2, 'Abierto desde la etiqueta «Unidad 4» (columna de la izquierda): archivado no es borrado.');
            else if (e.arch && (d.carpeta === 'todos' || d.carpeta === 'buscar')) { ctx.apunta(`Lo encuentras también en «${d.carpeta === 'todos' ? 'Todos' : 'la búsqueda'}».`); W.aviso('Bien: archivado, sigue estando. Ahora ábrelo desde la etiqueta «Unidad 4» (columna de la izquierda).', 'ok'); }
          } else if (n === 'eliminar' && esP) {
            ctx.falla('Eliminar la prueba en vez de archivarla.');
            W.aviso('Eliminar no es archivar: el correo va a la Papelera y en 30 días se borra para siempre. Sácalo: Papelera → ábrelo → «Mover a Recibidos».', 'cuidado');
          } else if (n === 'noSpam') {
            if (e.m.bueno) ctx.cumple(3, 'Spam: mi correo «Cambio de aula el jueves» se había colado. «No es spam» lo devuelve a Recibidos. Lo demás era publicidad y trampas (skins gratis, descuentos, un premio que pide tus datos del banco).');
            else { ctx.falla(`Sacar del Spam «${e.m.as}».`); W.aviso('Eso es publicidad o una trampa: mejor en el Spam. Vuelve a mandarlo allí (⚠).', 'cuidado'); }
          } else if (n === 'spam' && e && e.m.bueno) {
            if (ctx.hecho(3)) ctx.deshace(3);
          }
        },
      });
      void G;
    },
  });

  /* ============================================================
     Actividad 6 · Tu primera reunión en Meet
     ============================================================ */
  const CODIGO = 'kfp-ruxw-tbd';
  const GENTE = [
    { n: 'Profe', org: true, cam: true, c: 'a' },
    { n: 'Ana', c: 'b' }, { n: 'Dani', c: 'c' }, { n: 'nube_azul', c: 'd' }, { n: 'CreeperVerde', c: 'b' },
  ];
  registrarSimulacion('meet', {
    ventana: 'Windows 11 · Google Chrome',
    mision: [
      'Entra en la reunión de clase (el enlace está en Classroom) con el micro y la cámara apagados.',
      'Escribe en el chat «Hola, ya estoy».',
      'Levanta la mano y bájala cuando te dé la palabra en el chat.',
      'Abre Personas y busca tu nombre.',
      'Sal de la reunión con el botón rojo.',
    ],
    final: 'Apunta en tu cuaderno qué botones has usado, en orden, y para qué servía cada uno (pregunta 15).',
    crear(ctx) {
      const { el, boton } = ctx;
      const W = WIN11.escritorio(ctx, { fs: WIN11.fs.equipo(WIN11.fs.usuario({})), barra: ['explorador', 'navegador'] });
      const M = { fase: 'previa', mic: true, cam: true, mano: false, palabra: false, panel: null, chat: [], presentando: false, buscar: '', acople: false };
      let C = null, temp = [];
      const later = (f, ms) => { temp.push(setTimeout(() => { if (W.raiz.isConnected) f(); }, ms)); };
      const ICO = {
        mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
        cam: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6.5" width="12.5" height="11" rx="2"/><path d="M15.5 10.5l5-3v9l-5-3z"/></svg>',
        mano: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 20v-9a1.6 1.6 0 0 1 3.2 0V8a1.6 1.6 0 0 1 3.2 0v1a1.6 1.6 0 0 1 3.2 0v6.5A5 5 0 0 1 11.6 20h-1a4 4 0 0 1-3.6-2z"/></svg>',
        pres: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="12.5" rx="1.8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 14.5v-6M9 11l3-3 3 3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
        colgar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 14.5c5-5 13-5 18 0l-2.5 2.5-3.5-2v-2.5a9 9 0 0 0-6 0V15L5.5 17z"/></svg>',
        gente: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8.5" r="3.3"/><path d="M2.5 19a6.5 5.5 0 0 1 13 0z"/><circle cx="17" cy="9.5" r="2.5"/><path d="M15.5 13.5a5 4.5 0 0 1 6 5.5h-4"/></svg>',
        chat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H8l-4 4z"/></svg>',
        mas: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5.5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="18.5" r="1.8"/></svg>',
      };
      const btn = (svg, lab, cls, f) => {
        const b = boton('', 'w11-meet__b' + (cls ? ' ' + cls : ''));
        b.innerHTML = svg;
        b.setAttribute('aria-label', lab);
        b.title = lab;
        b.addEventListener('click', f);
        return b;
      };
      const tile = (p, yo) => {
        const t = el('div', 'w11-meet__tile' + (p.org && p.cam ? ' w11-meet__tile--cam' : '') + (yo && M.cam ? ' w11-meet__tile--cam' : ''));
        const av = el('span', 'w11-meet__av w11-meet__av--' + (p.c || 'a'), p.n[0].toUpperCase());
        t.appendChild(av);
        const nom = sinTraducir(el('span', 'w11-meet__nom', p.n + (yo ? ' (tú)' : '')));
        t.appendChild(nom);
        const mute = yo ? !M.mic : !p.org;
        if (mute) { const x = el('span', 'w11-meet__mute'); x.innerHTML = ICO.mic; x.setAttribute('aria-label', 'Micrófono desactivado'); x.setAttribute('role', 'img'); t.appendChild(x); }
        if (yo && M.mano) { const h = el('span', 'w11-meet__manito', '✋'); h.setAttribute('aria-label', 'Mano levantada'); h.setAttribute('role', 'img'); t.appendChild(h); }
        return t;
      };
      function revisa0() {
        if (M.fase !== 'dentro') return;
        if (M.entroBien && !M.mic && !M.cam) { if (!ctx.hecho(0)) ctx.cumple(0, 'Antes de «Unirse ahora», micro (1) y cámara (2) apagados: salen tachados.'); }
        else if (ctx.hecho(0)) ctx.deshace(0);
      }
      function pulsaMic() {
        M.mic = !M.mic;
        if (M.fase === 'dentro' && M.mic) {
          ctx.falla('Encender el micro en el aula.');
          W.aviso('¡Piiiiii! Al encender el micro con los altavoces de la clase, sale un pitido muy fuerte: el acople. En el aula, micro apagado todo el rato.', 'cuidado');
          M.acople = true;
        } else if (M.fase === 'dentro') { M.acople = false; W.aviso(''); }
        if (M.fase === 'previa') ctx.apunta(M.mic ? 'Micro encendido.' : 'Micro (1) apagado antes de entrar.');
        revisa0();
        C.pintar();
      }
      function pulsaCam() {
        M.cam = !M.cam;
        if (M.fase === 'previa') ctx.apunta(M.cam ? 'Cámara encendida.' : 'Cámara (2) apagada antes de entrar.');
        else if (M.cam) W.aviso('En esta reunión de clase, mejor con la cámara apagada.', 'cuidado');
        revisa0();
        C.pintar();
      }
      function entrar() {
        M.fase = 'dentro';
        M.entroBien = !M.mic && !M.cam;
        if (M.mic || M.cam) {
          ctx.falla(`Entrar con ${M.mic && M.cam ? 'el micro y la cámara encendidos' : M.mic ? 'el micro encendido' : 'la cámara encendida'}.`);
          if (M.mic) { M.acople = true; W.aviso('¡Piiiiii! Has entrado con el micro encendido y se oye un pitido en toda el aula (el acople). Apágalo con el botón del micrófono (1). Para cumplir la misión, sal con el botón rojo (5) y vuelve a entrar con el micro y la cámara apagados.', 'cuidado'); }
          else W.aviso('Has entrado con la cámara encendida. Apágala con su botón (2). La misión pide entrar con las dos cosas apagadas: sal con el botón rojo (5) y vuelve a entrar.', 'cuidado');
        } else W.aviso('');
        revisa0();
        later(() => { M.chat.push({ de: 'Profe', t: '¡Hola a todos! Escribid en el chat cuando estéis.' }); if (M.panel !== 'chat') M.nuevo = true; C.pintar(); }, 1500);
        C.pintar();
      }
      function colgar() {
        if (!M.entroBien) {
          ctx.apunta('Colgar (5): sales para volver a entrar bien.');
          W.aviso('Ahora pulsa «Volver a unirse» y, antes de «Unirse ahora», apaga el micro (1) y la cámara (2).', 'ok');
        } else if (!ctx.hecho(0) || !ctx.hecho(1) || !ctx.hecho(2) || !ctx.hecho(3)) {
          ctx.falla('Salir de la reunión antes de acabar.');
          W.aviso('Has salido antes de terminar la misión. Pulsa «Volver a unirse».', 'cuidado');
        } else ctx.cumple(4, 'Colgar (5), el botón rojo: sales de la reunión.');
        M.fase = 'fuera';
        M.mano = false;
        M.panel = null;
        C.pintar();
      }
      function enviarChat(txt) {
        txt = txt.trim();
        if (!txt) return;
        M.chat.push({ de: 'ProfesorCabron', t: txt, yo: true });
        if (/hola/.test(norm(txt)) && /ya estoy/.test(norm(txt))) {
          ctx.cumple(1, 'Chat (7): escribes «' + txt + '» y lo ven todos los de la llamada.');
          later(() => { M.chat.push({ de: 'Profe', t: '¡Bienvenido, ProfesorCabron! Si quieres decir algo, levanta la mano.' }); C.pintar(); }, 1200);
        } else W.aviso('La misión pide escribir «Hola, ya estoy».', 'cuidado');
        C.pintar();
      }
      function mano() {
        if (!M.mano) {
          M.mano = true; M.palabra = false;
          ctx.apunta('Levantar la mano (3): pides la palabra sin interrumpir.');
          W.notificacion('Has levantado la mano', 'Todos ven ✋ en tu recuadro.', 'info');
          later(() => { if (!M.mano) return; M.palabra = true; M.chat.push({ de: 'Profe', t: 'Te veo la mano, ProfesorCabron. Ya puedes bajarla.' }); if (M.panel !== 'chat') M.nuevo = true; W.aviso('Te he contestado en el chat (7).', 'ok'); C.pintar(); }, 2500);
        } else {
          M.mano = false;
          if (M.palabra) ctx.cumple(2, 'Bajar la mano (3) cuando te doy la palabra.');
          else { ctx.falla('Bajar la mano antes de que te dé la palabra.'); W.aviso('La has bajado demasiado pronto: espera a que te conteste (mira el chat).', 'cuidado'); }
        }
        C.pintar();
      }
      function presentar() {
        M.presentando = !M.presentando;
        if (M.presentando) { ctx.falla('Presentar la pantalla sin que te lo pidan.'); W.aviso('Cuidado: ahora todos ven tu pantalla entera (también lo que tengas abierto). Solo se presenta cuando te lo piden: pulsa «Dejar de presentar».', 'cuidado'); }
        else W.aviso('');
        C.pintar();
      }

      function classroom(t, cont) {
        t.t = 'Operaciones básicas - Classroom';
        cont.classList.add('w11-cr');
        const cab = el('div', 'w11-cr__cab');
        cab.append(el('p', 'w11-cr__curso', 'Operaciones básicas'), el('p', 'w11-cr__sub', '1.º FP Básica · Informática de oficina'));
        cont.appendChild(cab);
        const a = el('div', 'w11-cr__anuncio');
        const q = el('p', 'w11-cr__quien');
        q.append(el('span', 'w11-meet__av w11-meet__av--a', 'P'), el('strong', null, 'Profe'), el('span', 'w11-web__sub', ' · 08:30'));
        a.appendChild(q);
        a.appendChild(el('p', null, 'Hoy hacemos la reunión de clase en Meet. Entrad con el micro y la cámara apagados:'));
        const enl = el('a', 'w11-web__a', 'https://meet.google.com/' + CODIGO);
        enl.href = '#';
        sinTraducir(enl);
        const url = 'meet.google.com/' + CODIGO;
        enl.addEventListener('mouseenter', () => C.estado('https://' + url));
        enl.addEventListener('mouseleave', () => C.estado(''));
        enl.addEventListener('click', e => { e.preventDefault(); C.ir(url); });
        a.appendChild(enl);
        cont.appendChild(a);
      }

      function meet(t, cont, C2, ruta) {
        cont.classList.add('w11-meet');
        if (ruta.replace(/^\//, '') !== CODIGO) {
          t.t = 'Google Meet';
          cont.appendChild(el('p', 'w11-meet__fuera-t', 'Comprueba el código de la reunión'));
          cont.appendChild(el('p', null, 'Esa reunión no existe. Usa el enlace que hay en Classroom.'));
          return;
        }
        t.t = 'Meet - ' + CODIGO;
        if (M.fase === 'previa') {
          const p = el('div', 'w11-meet__previa');
          const vista = el('div', 'w11-meet__vista' + (M.cam ? ' w11-meet__vista--cam' : ''));
          vista.appendChild(M.cam ? el('span', 'w11-meet__av w11-meet__av--c w11-meet__av--grande', 'P') : el('span', 'w11-meet__vista-t', 'La cámara está desactivada'));
          const bs = el('div', 'w11-meet__vista-b');
          bs.append(btn(ICO.mic, M.mic ? 'Desactivar micrófono' : 'Activar micrófono', M.mic ? '' : 'w11-meet__b--off', pulsaMic), btn(ICO.cam, M.cam ? 'Desactivar cámara' : 'Activar cámara', M.cam ? '' : 'w11-meet__b--off', pulsaCam));
          vista.appendChild(bs);
          const der = el('div', 'w11-meet__unir');
          der.appendChild(el('p', 'w11-meet__unir-t', '¿Todo listo para unirte?'));
          der.appendChild(el('p', 'w11-meet__unir-s', 'Profe y 4 personas más están en la llamada'));
          const u = boton('Unirse ahora', 'w11-meet__unirse');
          u.addEventListener('click', entrar);
          der.appendChild(u);
          der.appendChild(sinTraducir(el('p', 'w11-meet__unir-s', 'ProfesorCabron · ' + YO)));
          p.append(vista, der);
          cont.appendChild(p);
          return;
        }
        if (M.fase === 'fuera') {
          const f = el('div', 'w11-meet__fuera');
          f.appendChild(el('p', 'w11-meet__fuera-t', 'Has salido de la reunión'));
          const v = boton('Volver a unirse', 'w11-meet__unirse');
          v.addEventListener('click', () => { M.fase = 'previa'; M.chat = []; M.palabra = false; C.pintar(); });
          f.appendChild(v);
          cont.appendChild(f);
          return;
        }
        // dentro de la llamada
        const sala = el('div', 'w11-meet__sala');
        const zona = el('div', 'w11-meet__zona');
        if (M.presentando) zona.appendChild(el('p', 'w11-meet__pres', 'Estás presentando tu pantalla a todos'));
        const rej = el('div', 'w11-meet__rejilla');
        GENTE.forEach(p => rej.appendChild(tile(p, false)));
        rej.appendChild(tile({ n: 'ProfesorCabron', c: 'c' }, true));
        zona.appendChild(rej);
        sala.appendChild(zona);
        if (M.panel) {
          const pan = el('div', 'w11-meet__panel');
          pan.setAttribute('role', 'complementary');
          const ph = el('div', 'w11-meet__panel-cab');
          ph.appendChild(el('span', null, M.panel === 'chat' ? 'Mensajes de la llamada' : 'Personas'));
          const x = boton('×', 'w11-meet__panel-x');
          x.setAttribute('aria-label', 'Cerrar');
          x.addEventListener('click', () => { M.panel = null; C.pintar(); });
          ph.appendChild(x);
          pan.appendChild(ph);
          if (M.panel === 'chat') {
            const l = el('div', 'w11-meet__msgs');
            l.setAttribute('role', 'log');
            M.chat.forEach(c => { const m = el('div', 'w11-meet__msg'); m.append(sinTraducir(el('strong', null, c.yo ? 'Tú' : c.de)), el('p', null, c.t)); l.appendChild(m); });
            pan.appendChild(l);
            const i = document.createElement('input');
            i.className = 'w11-meet__entrada';
            i.placeholder = 'Enviar un mensaje';
            i.setAttribute('aria-label', 'Enviar un mensaje a todos');
            i.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); enviarChat(i.value); } });
            const env = boton('➤', 'w11-meet__panel-x');
            env.setAttribute('aria-label', 'Enviar mensaje');
            env.addEventListener('click', () => enviarChat(i.value));
            const fi = el('div', 'w11-meet__fila-in');
            fi.append(i, env);
            pan.appendChild(fi);
            setTimeout(() => { l.scrollTop = l.scrollHeight; if (M._focoChat) { M._focoChat = false; i.focus({ preventScroll: true }); } }, 0);
          } else {
            const i = document.createElement('input');
            i.className = 'w11-meet__entrada';
            i.type = 'search';
            i.placeholder = 'Buscar personas';
            i.setAttribute('aria-label', 'Buscar personas');
            i.value = M.buscar;
            pan.appendChild(i);
            const l = el('ul', 'w11-meet__gente');
            const pinta = () => {
              l.innerHTML = '';
              const q = norm(i.value);
              const todos = GENTE.concat([{ n: 'ProfesorCabron', c: 'c', yo: true }]).filter(p => !q || norm(p.n).indexOf(q) !== -1);
              pan.querySelector('.w11-meet__cuenta').textContent = 'En la llamada (' + todos.length + ')';
              todos.forEach(p => {
                const li = el('li', null, '');
                li.append(el('span', 'w11-meet__av w11-meet__av--' + p.c, p.n[0].toUpperCase()), sinTraducir(el('span', null, p.n + (p.yo ? ' (tú)' : ''))), el('span', 'w11-web__sub', p.org ? 'Organizador de la reunión' : ''));
                l.appendChild(li);
              });
              if (q && todos.some(p => p.yo) && !ctx.hecho(3)) ctx.cumple(3, 'Personas (6): la lista de quién está conectado. Tu nombre sale como «ProfesorCabron (tú)».');
            };
            i.addEventListener('input', () => { M.buscar = i.value; pinta(); });
            pan.appendChild(el('p', 'w11-meet__cuenta', ''));
            pan.appendChild(l);
            pinta();
            if (!ctx.hecho(3)) later(() => { if (M.panel === 'personas' && !ctx.hecho(3)) ctx.cumple(3, 'Personas (6): la lista de quién está conectado. Tu nombre sale como «ProfesorCabron (tú)».'); }, 1200);
          }
          sala.appendChild(pan);
        }
        cont.appendChild(sala);
        const barra = el('div', 'w11-meet__barra');
        const izq = sinTraducir(el('span', 'w11-meet__codigo', CODIGO));
        const cen = el('div', 'w11-meet__cen');
        cen.append(
          btn(ICO.mic, M.mic ? 'Desactivar micrófono' : 'Activar micrófono', M.mic ? '' : 'w11-meet__b--off', pulsaMic),
          btn(ICO.cam, M.cam ? 'Desactivar cámara' : 'Activar cámara', M.cam ? '' : 'w11-meet__b--off', pulsaCam),
          btn(ICO.mano, M.mano ? 'Bajar la mano' : 'Levantar la mano', M.mano ? 'w11-meet__b--on' : '', mano),
          btn(ICO.pres, M.presentando ? 'Dejar de presentar' : 'Presentar ahora', M.presentando ? 'w11-meet__b--on' : '', presentar),
          btn(ICO.mas, 'Más opciones', '', e => { const r = e.currentTarget.getBoundingClientRect(); W.menu(r.left, r.top - 140, [{ t: 'Grabar la reunión', off: true }, { t: 'Cambiar fondo', off: true }, { t: 'Configuración', off: true }]); }),
          btn(ICO.colgar, 'Abandonar la llamada', 'w11-meet__b--colgar', colgar),
        );
        const der = el('div', 'w11-meet__der');
        const gb = btn(ICO.gente, 'Personas', M.panel === 'personas' ? 'w11-meet__b--on w11-meet__b--peq' : 'w11-meet__b--peq', () => { M.panel = M.panel === 'personas' ? null : 'personas'; if (M.panel) ctx.apunta('Abres Personas (6).'); C.pintar(); });
        const cb = btn(ICO.chat, 'Chat con todos', (M.panel === 'chat' ? 'w11-meet__b--on ' : '') + 'w11-meet__b--peq' + (M.nuevo ? ' w11-meet__b--nuevo' : ''), () => { M.panel = M.panel === 'chat' ? null : 'chat'; M.nuevo = false; M._focoChat = !!M.panel; C.pintar(); });
        der.append(gb, cb);
        barra.append(izq, cen, der);
        cont.appendChild(barra);
      }

      C = WIN11.web(W, { pestanas: [{ url: 'classroom.google.com/c/operaciones' }], sitios: { 'classroom.google.com': classroom, 'meet.google.com': meet } });
    },
  });
})();
