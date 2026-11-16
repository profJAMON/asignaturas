/* ============================================================
   Simulaciones de la Unidad 4 de Operaciones (el navegador,
   buscadores y correo), 27/10/2026; rehechas el 15/11/2026 para
   que sean lo más reales posible: van dentro del Windows 11 de
   mentira (js/win11.js) con un Chrome de mentira, y los atajos se
   pulsan con el teclado (el de verdad o el de la pantalla), no con
   botones que ya dicen el atajo.

   navegador  S1 «Ordena este navegador»: recuperar una pestaña
              (Ctrl + Shift + T, clic derecho en la barra de
              pestañas o ⋮ → Historial), meter marcadores en una
              carpeta (arrastrar, Editar… o Cortar y Pegar), buscar
              en el historial y dejar el zoom al 100 %.
   buscador   S2 «Encuéntralo»: un buscador de mentira que entiende
              los cinco operadores de la sesión (" ", -, site:,
              filetype:, OR) y cinco retos. Los anuncios no hacen
              caso de los operadores, como en uno de verdad.
   red-casa   U2 S1 «Monta la red de casa» (rehecha el 16/11/2026):
              la página del router en Chrome (IP fijas) y la Terminal
              (ipconfig, nslookup, ping, tracert).
   bandeja    S3 «Revisa la bandeja»: un correo como el del
              instituto; denunciar phishing (⋮), mandar a spam (⚠),
              destacar con la estrella. Al pasar el ratón por un
              botón del correo sale abajo adónde lleva, como en Chrome.

   Todo inventado: webs, correos y nombres. Nada se guarda.
   ============================================================ */


(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function') return;
  const { el } = window.LAB;

  const norm = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  function select(opciones, valor, etiqueta) {
    const s = document.createElement('select');
    s.className = 'lab__entrada sim__select';
    if (etiqueta) s.setAttribute('aria-label', etiqueta);
    opciones.forEach(([v, t]) => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = t;
      if (v === '') { o.disabled = true; o.hidden = true; } /* «Elige…»: rótulo, no opción (09/11/2026) */
      if (v === valor) o.selected = true;
      s.appendChild(o);
    });
    return s;
  }

  /* ============================================================
     Un Chrome de mentira dentro del Windows 11 de mentira
     (15/11/2026, para que las simulaciones de la U4 sean reales).
     chrome(W, op) abre la ventana de Chrome maximizada con
     pestañas, barra de direcciones, ☆, ⋮, barra de marcadores y la
     página. El estado (C) se guarda aunque se cierre la ventana:
     al volver a abrir Chrome desde la barra de tareas sigue igual,
     y Ctrl + Shift + T recupera lo cerrado, como el de verdad.
       op.pestanas   [{ t, url, zoom, pag: 'web' }]
       op.marcadores [{ n, url } | { n, carpeta: true, hijos: [] }] o null
       op.pagina(tab, cont, C)   dibuja una página «web»
       op.navegar(texto, tab, C) escribir en la barra de direcciones
       op.historial  [{ d, h, n, url }]
       op.descargas  [{ n, url }]
       op.evento(nombre, datos)  'reabrir', 'cerrar', 'zoom', 'historial',
                     'abrir-historial', 'marcadores', 'descargas'
     ============================================================ */
  function chrome(W, op) {
    const { el, boton } = window.LAB;
    const ic = window.WIN11.icono;
    const C = W._chrome || (W._chrome = {
      tabs: op.pestanas.map(t => Object.assign({ zoom: 100, pag: 'web' }, t)),
      activa: op.activa || 0, cerradas: (op.cerradas || []).slice(), marcas: op.marcadores, barra: !!op.marcadores,
    });
    const ev = (n, d) => op.evento && op.evento(n, d || {});
    let v = null, cuerpo = null;
    const tab = () => C.tabs[C.activa];
    C.pintar = pintar;
    C.ventana = () => v;
    W.apps.navegador.abrir = () => abrirVentana();
    function abrirVentana() {
      if (!C.tabs.length) { C.tabs.push({ t: 'Nueva pestaña', url: '', zoom: 100, pag: 'nueva' }); C.activa = 0; }
      return W.abrir({ app: 'navegador', titulo: '', icono: 'navegador', estado: 'max', crear: (c, vv) => { v = vv; cuerpo = c; c.classList.add('w11-ch'); pintar(); },
        onTecla: tecla, alCerrar: () => { v = null; } });
    }
    abrirVentana();
    function nombreDe(t) { return t.pag === 'historial' ? 'Historial' : t.pag === 'descargas' ? 'Descargas' : t.t; }
    function urlDe(t) { return t.pag === 'historial' ? 'chrome://history' : t.pag === 'descargas' ? 'chrome://downloads' : t.url || ''; }
    function pintar() {
      if (!v || !cuerpo) return;
      const t = tab();
      v.titulo(t ? nombreDe(t) + ' - Google Chrome' : 'Google Chrome');
      cuerpo.innerHTML = '';
      // pestañas
      const tiras = el('div', 'w11-ch__tabs');
      tiras.setAttribute('role', 'tablist');
      C.tabs.forEach((x, i) => {
        const p = el('div', 'w11-ch__tab' + (i === C.activa ? ' w11-ch__tab--activa' : ''));
        p.setAttribute('role', 'tab');
        p.setAttribute('aria-selected', String(i === C.activa));
        const b = boton('', 'w11-ch__tab-b');
        b.append(el('span', 'w11-ch__fav', (nombreDe(x)[0] || '·').toUpperCase()), el('span', 'w11-ch__tab-t', nombreDe(x)));
        b.addEventListener('click', () => { C.activa = i; pintar(); });
        b.addEventListener('auxclick', e => { if (e.button === 1) cerrar(i, 'clic con la rueda'); });
        const x2 = boton('×', 'w11-ch__tab-x');
        x2.setAttribute('aria-label', 'Cerrar pestaña ' + nombreDe(x));
        x2.addEventListener('click', e => { e.stopPropagation(); cerrar(i, 'la × de la pestaña'); });
        p.append(b, x2);
        p.addEventListener('contextmenu', e => {
          e.preventDefault(); e.stopPropagation();
          W.menu(e.clientX, e.clientY, [
            { t: 'Nueva pestaña a la derecha', f: () => nueva('menú de la pestaña') },
            { t: 'Volver a cargar', atajo: 'Ctrl+R' },
            { t: 'Duplicar', f: () => { C.tabs.splice(i + 1, 0, Object.assign({}, x)); C.activa = i + 1; pintar(); } },
            { sep: true },
            { t: 'Cerrar', atajo: 'Ctrl+W', f: () => cerrar(i, 'clic derecho en la pestaña → Cerrar') },
            { t: 'Cerrar otras pestañas', f: () => { C.tabs.filter((y, j) => j !== i).forEach(y => C.cerradas.unshift(y)); C.tabs = [x]; C.activa = 0; ev('cerrar', {}); pintar(); } },
          ]);
        });
        tiras.appendChild(p);
      });
      const mas = boton('+', 'w11-ch__nueva');
      mas.setAttribute('aria-label', 'Nueva pestaña');
      mas.addEventListener('click', () => nueva('el botón +'));
      tiras.appendChild(mas);
      tiras.addEventListener('contextmenu', e => {
        if (e.target.closest('.w11-ch__tab')) return;
        e.preventDefault();
        W.menu(e.clientX, e.clientY, [
          { t: 'Nueva pestaña', atajo: 'Ctrl+T', f: () => nueva('menú de la barra de pestañas') },
          { t: 'Volver a abrir pestaña cerrada', atajo: 'Ctrl+Mayús+T', off: !C.cerradas.length, f: () => reabrir('clic derecho en la barra de pestañas → Volver a abrir pestaña cerrada') },
        ]);
      });
      // barra de herramientas
      const her = el('div', 'w11-ch__her');
      const bt = (txt, lab, f, off) => { const b = boton(txt, 'w11-ch__hb'); b.setAttribute('aria-label', lab); b.title = lab; if (off) b.disabled = true; b.addEventListener('click', f); her.appendChild(b); return b; };
      bt('←', 'Atrás', () => {}, true);
      bt('→', 'Adelante', () => {}, true);
      bt('⟳', 'Volver a cargar', () => pintar());
      const omni = el('div', 'w11-ch__omni');
      const ent = document.createElement('input');
      ent.className = 'w11-ch__url';
      ent.value = t ? urlDe(t) : '';
      ent.spellcheck = false;
      ent.setAttribute('aria-label', 'Barra de direcciones y de búsqueda');
      ent.setAttribute('translate', 'no');
      ent.placeholder = 'Busca en Google o escribe una URL';
      ent.addEventListener('focus', () => ent.select());
      ent.addEventListener('keydown', e => {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const x = tab();
        if (op.navegar) op.navegar(ent.value.trim(), x, C);
        pintar();
      });
      omni.appendChild(ent);
      if (t && t.zoom !== 100) {
        const z = boton('🔍', 'w11-ch__zoomb');
        z.setAttribute('aria-label', `Zoom: ${t.zoom} %`);
        z.title = `Zoom: ${t.zoom} %`;
        z.addEventListener('click', () => {
          const r = z.getBoundingClientRect();
          W.menu(r.left - 140, r.bottom, [
            { t: `Zoom: ${t.zoom} %`, off: true },
            { t: 'Alejar  −', f: () => zoom(-10, 'la lupa de la barra de direcciones') },
            { t: 'Acercar  +', f: () => zoom(10, 'la lupa de la barra de direcciones') },
            { t: 'Restablecer', f: () => zoom(0, 'la lupa de la barra de direcciones → Restablecer') },
          ]);
        });
        omni.appendChild(z);
      }
      const est = boton('☆', 'w11-ch__estrella');
      est.setAttribute('aria-label', 'Añadir esta pestaña a marcadores');
      est.addEventListener('click', () => marcar('la estrella ☆'));
      omni.appendChild(est);
      her.appendChild(omni);
      const menu = bt('⋮', 'Personaliza y controla Google Chrome', () => {
        const r = menu.getBoundingClientRect();
        W.menu(r.right - 260, r.bottom, [
          { t: 'Nueva pestaña', atajo: 'Ctrl+T', f: () => nueva('menú ⋮') },
          { t: 'Nueva ventana', atajo: 'Ctrl+N', off: true },
          { t: 'Nueva ventana de incógnito', atajo: 'Ctrl+Mayús+N', off: true },
          { sep: true },
          { t: 'Marcadores y listas', sub: [
            { t: 'Añadir pestaña a marcadores…', atajo: 'Ctrl+D', f: () => marcar('menú ⋮ → Marcadores') },
            { t: 'Mostrar barra de marcadores', atajo: 'Ctrl+Mayús+B', marca: C.barra, f: () => { C.barra = !C.barra; pintar(); } },
          ] },
          { t: 'Historial', sub: [
            { t: 'Historial', atajo: 'Ctrl+H', f: () => historial('menú ⋮ → Historial') },
            { sep: true },
            { t: 'Cerradas recientemente', off: true },
          ].concat(C.cerradas.slice(0, 5).map((x, i) => ({ t: nombreDe(x), noTraducir: true, f: () => reabrir('menú ⋮ → Historial → Cerradas recientemente', i) }))) },
          { t: 'Descargas', atajo: 'Ctrl+J', f: () => descargas('menú ⋮ → Descargas') },
          { sep: true },
          { t: `Zoom: ${t ? t.zoom : 100} %`, sub: [
            { t: 'Alejar', atajo: 'Ctrl+-', f: () => zoom(-10, 'menú ⋮ → Zoom') },
            { t: 'Acercar', atajo: 'Ctrl++', f: () => zoom(10, 'menú ⋮ → Zoom') },
          ] },
          { t: 'Imprimir…', atajo: 'Ctrl+P', off: true },
          { t: 'Borrar datos de navegación…', atajo: 'Ctrl+Mayús+Supr', off: true },
          { sep: true },
          { t: 'Configuración', off: true },
        ]);
      });
      cuerpo.append(tiras, her);
      // marcadores
      if (C.marcas && C.barra) cuerpo.appendChild(barraMarcadores());
      // página
      const web = el('div', 'w11-ch__web');
      const cont = el('div', 'w11-ch__cont');
      cont.style.fontSize = ((t ? t.zoom : 100) / 100) + 'em';
      web.appendChild(cont);
      cuerpo.appendChild(web);
      const estado = el('div', 'w11-ch__estado');
      estado.setAttribute('translate', 'no');
      estado.setAttribute('aria-live', 'polite');
      cuerpo.appendChild(estado);
      C.estado = u => { estado.textContent = u || ''; estado.classList.toggle('w11-ch__estado--on', !!u); };
      if (!t) return;
      if (t.pag === 'historial') return pagHistorial(cont);
      if (t.pag === 'descargas') return pagDescargas(cont);
      if (t.pag === 'nueva') {
        cont.classList.add('w11-ch__nuevap');
        cont.appendChild(el('p', 'w11-ch__logo', 'Buscador'));
        const i = document.createElement('input'); i.className = 'w11-campo w11-ch__busca'; i.placeholder = 'Busca o escribe una URL'; i.setAttribute('aria-label', 'Buscar');
        i.addEventListener('keydown', e => { if (e.key === 'Enter' && op.navegar) { op.navegar(i.value.trim(), t, C); pintar(); } });
        cont.appendChild(i);
        return;
      }
      if (op.pagina) {
        const antes = t.t;
        op.pagina(t, cont, C);
        // la web cambia el título: que lo enseñen ya la pestaña y la ventana (16/11/2026)
        if (t.t !== antes) {
          v.titulo(nombreDe(t) + ' - Google Chrome');
          const tt = tiras.querySelectorAll('.w11-ch__tab-t')[C.activa];
          if (tt) tt.textContent = nombreDe(t);
          const fv = tiras.querySelectorAll('.w11-ch__fav')[C.activa];
          if (fv) fv.textContent = (nombreDe(t)[0] || '·').toUpperCase();
        }
      }
    }
    function barraMarcadores() {
      const b = el('div', 'w11-ch__marc');
      C.marcas.forEach(m => b.appendChild(chipMarca(m, C.marcas)));
      return b;
    }
    function chipMarca(m, dentro) {
      const b = boton('', 'w11-ch__m' + (m.carpeta ? ' w11-ch__m--carpeta' : ''));
      b.append(el('span', 'w11-ch__micono', m.carpeta ? '📁' : '⭐'), el('span', null, m.n));
      b._marca = m;
      if (m.carpeta) b.dataset.carpeta = '1';
      b.addEventListener('click', () => {
        if (b._arr && Date.now() - b._arr < 300) return;
        if (m.carpeta) {
          const r = b.getBoundingClientRect();
          W.menu(r.left, r.bottom, m.hijos.length ? m.hijos.map(h => ({ t: '⭐ ' + h.n, f: () => abrirUrl(h) })) : [{ t: '(vacía)', off: true }]);
          ev('carpeta', { m });
          return;
        }
        abrirUrl(m);
      });
      b.addEventListener('contextmenu', e => {
        e.preventDefault(); e.stopPropagation();
        if (m.carpeta) {
          W.menu(e.clientX, e.clientY, [
            { t: 'Pegar', atajo: 'Ctrl+V', off: !C.portaMarca, f: () => { mover(C.portaMarca, m, 'Cortar y pegar en la carpeta'); C.portaMarca = null; } },
            { t: 'Cambiar nombre…', off: true },
          ]);
          return;
        }
        W.menu(e.clientX, e.clientY, [
          { t: 'Abrir en una pestaña nueva', f: () => { C.tabs.push({ t: m.n, url: m.url, zoom: 100, pag: 'web' }); C.activa = C.tabs.length - 1; pintar(); } },
          { sep: true },
          { t: 'Editar…', f: () => editar(m) },
          { sep: true },
          { t: 'Cortar', atajo: 'Ctrl+X', f: () => { C.portaMarca = m; W.notificacion('Marcadores', `Has cortado «${m.n}». Pégalo con clic derecho en la carpeta.`, 'copiar'); } },
          { t: 'Eliminar', f: () => { quitarMarca(m); ev('marcadores', { eliminado: m }); pintar(); } },
        ]);
      });
      if (!m.carpeta) arrastrarMarca(b, m);
      return b;
    }
    function quitarMarca(m) {
      [C.marcas].concat(C.marcas.filter(x => x.carpeta).map(x => x.hijos)).forEach(l => { const i = l.indexOf(m); if (i !== -1) l.splice(i, 1); });
    }
    function mover(m, carpeta, como) {
      if (!m) return;
      quitarMarca(m);
      (carpeta ? carpeta.hijos : C.marcas).push(m);
      ev('marcadores', { m, carpeta, como });
      pintar();
    }
    function editar(m) {
      let sel, nom;
      W.dialogo({ titulo: 'Editar marcador', crear: t => {
        const l1 = el('label', 'w11-form__campo'); nom = document.createElement('input'); nom.className = 'w11-campo'; nom.value = m.n; l1.append(el('span', null, 'Nombre'), nom); t.appendChild(l1);
        const l2 = el('label', 'w11-form__campo'); const u = document.createElement('input'); u.className = 'w11-campo'; u.value = m.url || ''; u.readOnly = true; u.setAttribute('translate', 'no'); l2.append(el('span', null, 'URL'), u); t.appendChild(l2);
        const l3 = el('label', 'w11-form__campo'); sel = document.createElement('select'); sel.className = 'w11-campo';
        sel.innerHTML = '<option value="">Barra de marcadores</option>' + C.marcas.filter(x => x.carpeta).map((x, i) => `<option value="${i}">Barra de marcadores › ${x.n}</option>`).join('');
        const dentro = C.marcas.filter(x => x.carpeta).findIndex(x => x.hijos.indexOf(m) !== -1);
        sel.value = dentro === -1 ? '' : String(dentro);
        l3.append(el('span', null, 'Carpeta'), sel); t.appendChild(l3);
      }, botones: [{ t: 'Guardar', primario: true, f: () => { m.n = nom.value.trim() || m.n; mover(m, sel.value === '' ? null : C.marcas.filter(x => x.carpeta)[+sel.value], 'clic derecho → Editar… → Carpeta'); } }, { t: 'Cancelar' }] });
    }
    function arrastrarMarca(b, m) {
      let ini = null, fant = null;
      b.addEventListener('pointerdown', e => { if (e.button === 0 && e.pointerType !== 'touch') ini = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
      b.addEventListener('pointermove', e => {
        if (!ini) return;
        if (!fant && Math.abs(e.clientX - ini.x) + Math.abs(e.clientY - ini.y) < 8) return;
        if (!fant) { fant = el('div', 'w11-fantasma', '⭐ ' + m.n); W.escena.appendChild(fant); try { b.setPointerCapture(ini.id); } catch (_) { /* nada */ } }
        const r = W.escena.getBoundingClientRect();
        fant.style.left = (e.clientX - r.left + 10) + 'px'; fant.style.top = (e.clientY - r.top + 10) + 'px';
        W.escena.querySelectorAll('.w11-soltar').forEach(x => x.classList.remove('w11-soltar'));
        const d = document.elementsFromPoint(e.clientX, e.clientY).map(x => x.closest && x.closest('[data-carpeta]')).find(Boolean);
        if (d) d.classList.add('w11-soltar');
      });
      const fin = e => {
        if (!ini) return;
        ini = null;
        if (!fant) return;
        fant.remove(); fant = null;
        b._arr = Date.now();
        W.escena.querySelectorAll('.w11-soltar').forEach(x => x.classList.remove('w11-soltar'));
        const d = document.elementsFromPoint(e.clientX, e.clientY).map(x => x.closest && x.closest('[data-carpeta]')).find(Boolean);
        if (d && d._marca) mover(m, d._marca, 'arrastrar a la carpeta');
      };
      b.addEventListener('pointerup', fin);
      b.addEventListener('pointercancel', fin);
    }
    function abrirUrl(m) { const t = tab(); if (!t) return; Object.assign(t, { t: m.n, url: m.url, pag: 'web', zoom: 100 }); pintar(); }
    function nueva(origen) { C.tabs.push({ t: 'Nueva pestaña', url: '', zoom: 100, pag: 'nueva' }); C.activa = C.tabs.length - 1; ev('nueva', { origen }); pintar(); }
    function cerrar(i, origen) {
      const t = C.tabs.splice(i, 1)[0];
      if (!t) return;
      C.cerradas.unshift(t);
      if (C.activa >= C.tabs.length) C.activa = C.tabs.length - 1;
      ev('cerrar', { tab: t, origen });
      if (!C.tabs.length) { C.activa = 0; if (v) v.cerrar(); W.notificacion('Google Chrome', 'Has cerrado la última pestaña y se ha cerrado Chrome. Vuelve a abrirlo desde la barra de tareas.', 'navegador'); return; }
      pintar();
    }
    function reabrir(origen, i) {
      if (!C.cerradas.length) { W.aviso('No queda ninguna pestaña cerrada que recuperar.', 'cuidado'); return; }
      const t = C.cerradas.splice(i || 0, 1)[0];
      C.tabs.push(t);
      C.activa = C.tabs.length - 1;
      ev('reabrir', { tab: t, origen });
      pintar();
    }
    function zoom(d, origen) {
      const t = tab();
      if (!t || t.pag !== 'web') { W.aviso('El zoom se cambia en una página web. Vuelve a una pestaña.', 'cuidado'); return; }
      t.zoom = d === 0 ? 100 : Math.min(200, Math.max(50, t.zoom + d));
      ev('zoom', { tab: t, origen });
      pintar();
    }
    function historial(origen) { C.tabs.push({ t: 'Historial', pag: 'historial', zoom: 100, busca: '' }); C.activa = C.tabs.length - 1; ev('historial', { origen }); pintar(); }
    function descargas(origen) { C.tabs.push({ t: 'Descargas', pag: 'descargas', zoom: 100 }); C.activa = C.tabs.length - 1; ev('descargas', { origen }); pintar(); }
    function marcar(origen) {
      const t = tab();
      if (!t || t.pag !== 'web' || !C.marcas) return;
      if (!C.marcas.some(m => m.url === t.url) && !C.marcas.filter(m => m.carpeta).some(c => c.hijos.some(m => m.url === t.url))) C.marcas.push({ n: t.t, url: t.url });
      W.notificacion('Marcador añadido', `«${t.t}» está en la barra de marcadores (${origen}).`, 'navegador');
      ev('marcadores', { nuevo: t, como: origen });
      pintar();
    }
    function pagHistorial(cont) {
      const t = tab();
      cont.classList.add('w11-ch__interna');
      cont.appendChild(el('p', 'w11-ch__h1', 'Historial'));
      const b = document.createElement('input');
      b.type = 'search'; b.className = 'w11-campo w11-ch__busca'; b.placeholder = 'Buscar en el historial'; b.setAttribute('aria-label', 'Buscar en el historial');
      b.value = t.busca || '';
      const lista = el('div', 'w11-ch__hist');
      cont.append(b, lista);
      const norm2 = x => x.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      function filtra() {
        t.busca = b.value;
        lista.innerHTML = '';
        const q = norm2(b.value.trim());
        let dia = '';
        (op.historial || []).filter(h => !q || norm2(h.n + ' ' + h.url).indexOf(q) !== -1).forEach(h => {
          if (h.d !== dia) { dia = h.d; lista.appendChild(el('p', 'w11-ch__dia', dia)); }
          const f = boton('', 'w11-ch__hfila');
          const u = el('span', 'w11-ch__hurl', h.url); u.setAttribute('translate', 'no');
          f.append(el('span', 'w11-ch__hhora', h.h), el('span', 'w11-ch__htit', h.n), u);
          f.addEventListener('click', () => { Object.assign(t, { t: h.n.split(':')[0], url: h.url, pag: 'web', zoom: 100 }); ev('abrir-historial', { h, busca: b.value.trim() }); pintar(); });
          f.addEventListener('mouseenter', () => C.estado(h.url));
          f.addEventListener('mouseleave', () => C.estado(''));
          lista.appendChild(f);
        });
        if (!lista.childNodes.length) lista.appendChild(el('p', 'w11-nota', 'No hay nada en el historial con esa palabra.'));
      }
      b.addEventListener('input', filtra);
      filtra();
    }
    function pagDescargas(cont) {
      cont.classList.add('w11-ch__interna');
      cont.appendChild(el('p', 'w11-ch__h1', 'Descargas'));
      (op.descargas || []).forEach(d => {
        const f = el('div', 'w11-cfg__tarjeta');
        const n = el('span', 'w11-cfg__ttexto');
        const a = el('span', 'w11-cfg__ttitulo', d.n); a.setAttribute('translate', 'no');
        const b = el('span', 'w11-cfg__tsub', d.url); b.setAttribute('translate', 'no');
        n.append(a, b);
        f.append(n, el('span', 'w11-cfg__valor', 'Mostrar en carpeta'));
        cont.appendChild(f);
      });
    }
    function tecla(c) {
      const T = {
        'Ctrl + T': () => nueva('Ctrl + T'),
        'Ctrl + W': () => cerrar(C.activa, 'Ctrl + W'),
        'Ctrl + Shift + T': () => reabrir('Ctrl + Shift + T'),
        'Ctrl + Tab': () => { if (C.tabs.length) { C.activa = (C.activa + 1) % C.tabs.length; pintar(); } },
        'Ctrl + Shift + Tab': () => { if (C.tabs.length) { C.activa = (C.activa - 1 + C.tabs.length) % C.tabs.length; pintar(); } },
        'Ctrl + H': () => historial('Ctrl + H'),
        'Ctrl + J': () => descargas('Ctrl + J'),
        'Ctrl + D': () => marcar('Ctrl + D'),
        'Ctrl + Shift + B': () => { C.barra = !C.barra; pintar(); },
        'Ctrl + +': () => zoom(10, 'Ctrl + +'),
        'Ctrl + Shift + +': () => zoom(10, 'Ctrl + +'),
        'Ctrl + -': () => zoom(-10, 'Ctrl + -'),
        'Ctrl + 0': () => zoom(0, 'Ctrl + 0'),
        'Ctrl + L': () => { const i = cuerpo && cuerpo.querySelector('.w11-ch__url'); if (i) i.focus(); },
        'F5': () => pintar(),
        'Ctrl + R': () => pintar(),
      };
      if (!T[c]) return false;
      T[c]();
      return true;
    }
    C.tecla = tecla;
    return C;
  }
  if (window.WIN11) window.WIN11.chrome = chrome;

  /* ============================================================
     Webs de mentira dentro del Chrome de mentira (16/11/2026).
     WIN11.web(W, op) abre Chrome con unas webs inventadas que se
     pueden escribir en la barra de direcciones; lo demás da el
     error de Chrome «No se puede acceder a este sitio».
       op.pestanas  [{ url }]          (el título lo pone la web)
       op.sitios    { 'host': (t, cont, C, ruta) => … }
                    la web pone t.t (título de la pestaña)
       op.evento    como en chrome()
     Devuelve C con C.ir(url) (navegar en la pestaña activa) y
     C.modal(titulo, crear(caja), botones) (ventana de la web).
     ============================================================ */
  function partes(txt) {
    const u = String(txt || '').trim().replace(/^https?:\/\//i, '').replace(/^www\./i, '');
    const i = u.indexOf('/');
    return { host: (i === -1 ? u : u.slice(0, i)).toLowerCase(), ruta: i === -1 ? '/' : u.slice(i) };
  }
  function web(W, op) {
    const { el, boton } = window.LAB;
    let C = null;
    const pinta = (t, cont, C2) => {
      const p = partes(t.url);
      cont.classList.add('w11-web');
      const f = op.sitios[p.host];
      if (f) return f(t, cont, C2, p.ruta);
      if (p.host === 'google.com' && /^\/search/.test(p.ruta)) {
        const q = decodeURIComponent(p.ruta.replace(/^\/search\?q=/, ''));
        t.t = q + ' - Buscar con Google';
        const b = el('div', 'w11-web__error');
        b.append(el('p', 'w11-web__error-t', 'Resultados de «' + q + '»'), el('p', null, 'Para ir a una web que ya conoces, escribe su dirección exacta en la barra de arriba (por ejemplo, la que pone en la misión o en los pasos de la actividad).'));
        cont.appendChild(b);
        return;
      }
      t.t = p.host || 'Nueva pestaña';
      const e = el('div', 'w11-web__error');
      e.append(el('p', 'w11-web__error-ico', '☹'), el('p', 'w11-web__error-t', 'No se puede acceder a este sitio'));
      const d = el('p', null, '');
      const h = el('strong', null, p.host);
      h.setAttribute('translate', 'no');
      d.append('No se ha encontrado la dirección IP del servidor de ', h, '.');
      const c = el('p', 'w11-web__error-cod', 'DNS_PROBE_FINISHED_NXDOMAIN');
      c.setAttribute('translate', 'no');
      e.append(d, c);
      cont.appendChild(e);
      if (op.evento) op.evento('error', { host: p.host });
    };
    C = chrome(W, {
      pestanas: op.pestanas.map(x => Object.assign({ t: partes(x.url).host }, x)),
      marcadores: op.marcadores || null,
      evento: op.evento,
      pagina: pinta,
      navegar(txt, t) {
        if (!txt) return;
        const p = partes(txt);
        const dominio = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(p.host) || /^\d+\.\d+\.\d+\.\d+$/.test(p.host);
        Object.assign(t, { url: dominio ? p.host + (p.ruta === '/' ? '' : p.ruta) : 'google.com/search?q=' + encodeURIComponent(txt), pag: 'web', zoom: t.zoom || 100 });
        if (op.evento) op.evento('navegar', { url: t.url });
      },
    });
    C.ir = url => { const t = C.tabs[C.activa]; if (!t) return; t.url = url; t.pag = 'web'; C.pintar(); };
    C.partes = partes;
    C.modal = (titulo, crear, botones) => {
      const v = C.ventana();
      const zona = v && v.cuerpo.querySelector('.w11-ch__web');
      if (!zona) return null;
      const velo = el('div', 'w11-web__velo');
      const caja = el('div', 'w11-web__modal');
      caja.setAttribute('role', 'dialog');
      caja.setAttribute('aria-modal', 'true');
      caja.setAttribute('aria-label', titulo);
      caja.appendChild(el('p', 'w11-web__modal-t', titulo));
      const cuerpo = el('div', 'w11-web__modal-c');
      caja.appendChild(cuerpo);
      const cerrar = () => velo.remove();
      if (crear) crear(cuerpo, cerrar);
      const pie = el('div', 'w11-web__modal-pie');
      (botones || [{ t: 'Aceptar', primario: true }]).forEach(b => {
        const x = boton(b.t, 'w11-web__btn' + (b.primario ? ' w11-web__btn--primario' : ''));
        x.addEventListener('click', () => { if (b.f && b.f(cuerpo) === false) return; cerrar(); });
        pie.appendChild(x);
      });
      caja.appendChild(pie);
      velo.appendChild(caja);
      velo.addEventListener('keydown', e => { if (e.key === 'Escape') { e.stopPropagation(); cerrar(); } });
      zona.appendChild(velo);
      const f = caja.querySelector('input, textarea, select, button');
      if (f) f.focus({ preventScroll: true });
      return { cerrar, caja: cuerpo };
    };
    return C;
  }
  if (window.WIN11) window.WIN11.web = web;

  /* ============================================================
     S1 · Ordena este navegador
     ============================================================ */
  registrarSimulacion('navegador', {
    ventana: 'Windows 11 · Google Chrome',
    mision: [
      'Recupera la pestaña de la web de materiales, que se ha cerrado sin querer.',
      'Mete en la carpeta «Clase» de la barra de marcadores los tres marcadores de clase. «Juegos gratis» se queda fuera.',
      'Encuentra en el historial la tienda de bicis que viste el martes y ábrela.',
      'La pestaña de Wikipedia está al 150 %: déjala al 100 %.',
    ],
    final: 'Apunta en tu cuaderno cómo has hecho cada una de las cuatro cosas: el atajo de teclado que has pulsado o dónde has hecho clic (pregunta 12).',
    crear(ctx) {
      const W = WIN11.escritorio(ctx, { fs: WIN11.fs.equipo(WIN11.fs.usuario({})), barra: ['explorador', 'navegador'] });
      const DE_CLASE = ['Web de materiales', 'Classroom', 'Gmail del instituto'];
      const C = chrome(W, {
        pestanas: [
          { t: 'YouTube', url: 'youtube.com' },
          { t: 'Wikipedia: Navegador web', url: 'es.wikipedia.org/wiki/Navegador_web', zoom: 150 },
        ],
        activa: 1,
        cerradas: [{ t: 'Web de materiales', url: 'asignaturas.profesorjamon.workers.dev', zoom: 100, pag: 'web' }],
        marcadores: [
          { n: 'Clase', carpeta: true, hijos: [] },
          { n: 'Web de materiales', url: 'asignaturas.profesorjamon.workers.dev' },
          { n: 'Juegos gratis', url: 'juegos-gratis-ya.net' },
          { n: 'Classroom', url: 'classroom.google.com' },
          { n: 'Gmail del instituto', url: 'mail.google.com' },
        ],
        historial: [
          { d: 'Hoy · jueves, 19 de noviembre', h: '16:02', n: 'Wikipedia: Navegador web', url: 'es.wikipedia.org' },
          { d: 'Hoy · jueves, 19 de noviembre', h: '15:40', n: 'YouTube', url: 'youtube.com' },
          { d: 'Hoy · jueves, 19 de noviembre', h: '15:05', n: 'Web de materiales', url: 'asignaturas.profesorjamon.workers.dev' },
          { d: 'Martes, 17 de noviembre', h: '18:31', n: 'Pedalea: tienda de bicis', url: 'pedalea-bicis.es', bici: true },
          { d: 'Martes, 17 de noviembre', h: '18:20', n: 'Gmail del instituto', url: 'mail.google.com' },
          { d: 'Martes, 17 de noviembre', h: '18:15', n: 'El tiempo en Palma', url: 'eltiempo-palma.es' },
          { d: 'Lunes, 16 de noviembre', h: '15:10', n: 'Classroom', url: 'classroom.google.com' },
        ],
        descargas: [{ n: 'horario-1r.pdf', url: 'iesramonllull.net/horario-1r.pdf' }],
        pagina(t, cont) {
          const h = el('p', 'w11-ch__h1', t.t); h.setAttribute('translate', 'no');
          cont.appendChild(h);
          cont.appendChild(el('p', null, 'Así se ve esta página. (En esta simulación las webs no tienen nada más.)'));
          if (t.zoom !== 100) cont.appendChild(el('p', 'w11-nota', `Zoom de esta página: ${t.zoom} %`));
        },
        navegar(txt, t) {
          if (!txt) return;
          const u = /\./.test(txt) && !/\s/.test(txt) ? txt.replace(/^https?:\/\//, '') : 'buscador.es/search?q=' + encodeURIComponent(txt);
          Object.assign(t, { t: /\./.test(txt) && !/\s/.test(txt) ? u.split('/')[0] : txt + ' - Buscar', url: u, pag: 'web', zoom: 100 });
        },
        evento(n, d) {
          if (n === 'reabrir') {
            if (d.tab.url === 'asignaturas.profesorjamon.workers.dev') ctx.cumple(0, `Recuperar la pestaña de la web de materiales: ${d.origen}.`);
            else ctx.apunta(`Recuperar la pestaña «${d.tab.t}» (${d.origen}).`);
          }
          if (n === 'cerrar' && d.tab && d.tab.url === 'asignaturas.profesorjamon.workers.dev' && ctx.hecho(0)) { ctx.deshace(0); ctx.falla('Has vuelto a cerrar la pestaña de la web de materiales.'); }
          if (n === 'historial') ctx.apunta(`Abrir el historial (${d.origen}).`);
          if (n === 'abrir-historial') {
            if (d.h.bici) ctx.cumple(2, `Historial${d.busca ? ', buscar «' + d.busca + '»' : ''} y abrir «${d.h.n}» (martes, ${d.h.h}).`);
            else ctx.apunta(`Abrir desde el historial «${d.h.n}».`);
          }
          if (n === 'zoom' && /wikipedia/.test(d.tab.url)) {
            if (d.tab.zoom === 100) ctx.cumple(3, `Wikipedia al 100 %: ${d.origen}.`);
            else { if (ctx.hecho(3)) ctx.deshace(3); ctx.apunta(`Zoom de Wikipedia al ${d.tab.zoom} % (${d.origen}).`); }
          }
          if (n === 'marcadores') {
            if (d.m && d.carpeta && !DE_CLASE.includes(d.m.n)) W.aviso(`«${d.m.n}» no es de clase: no va en esa carpeta.`, 'cuidado');
            if (d.m) ctx.apunta(`Mover el marcador «${d.m.n}» ${d.carpeta ? 'a la carpeta «Clase»' : 'a la barra'} (${d.como}).`);
            const clase = C.marcas.find(m => m.carpeta);
            const ok = DE_CLASE.every(x => clase.hijos.some(m => m.n === x)) && !clase.hijos.some(m => m.n === 'Juegos gratis');
            if (ok) ctx.cumple(1, `Marcadores: ${DE_CLASE.join(', ')} dentro de «Clase»; «Juegos gratis», fuera.`);
            else if (ctx.hecho(1)) ctx.deshace(1);
          }
        },
      });
    },
  });

  /* ============================================================
     S2 · Encuéntralo
     ============================================================ */
  const PAGINAS = [
    { t: 'Receta de lentejas con chorizo', u: 'recetasfaciles.es/lentejas-chorizo', x: 'receta lentejas con chorizo y morcilla, el guiso de la abuela' },
    { t: 'Lentejas estofadas con verduras', u: 'cocinaconana.es/lentejas-verduras', x: 'receta lentejas estofadas con zanahoria, pimiento y patata' },
    { t: 'Lentejas al curry', u: 'verdeplato.es/lentejas-curry', x: 'receta lentejas veganas al curry con leche de coco' },
    { t: 'Chorizo a la sidra', u: 'recetasfaciles.es/chorizo-sidra', x: 'receta chorizo a la sidra, tapa asturiana' },
    { t: 'Tortilla de patatas jugosa', u: 'cocinaconana.es/tortilla-patatas', x: 'receta tortilla de patatas con cebolla' },
    { t: 'Croquetas de jamón caseras', u: 'abuelacocina.es/croquetas', x: 'receta croquetas de jamón con bechamel' },
    { t: 'Historia de la tortilla de patatas', u: 'historiasdecomida.es/tortilla', x: 'de donde viene la tortilla de patatas' },
    { t: 'Calendario escolar 2026-2027', u: 'iesramonllull.net/calendario', x: 'calendario escolar del curso, festivos y evaluaciones del instituto' },
    { t: 'Calendario escolar de las Illes Balears', u: 'caib.es/educacio/calendario', x: 'calendario escolar oficial para todos los centros de baleares' },
    { t: 'Horario de clases de 1.º de FP', u: 'iesramonllull.net/horario-fp1', x: 'horario de clases semanal de formacion profesional' },
    { t: 'Apuntes de redes locales', u: 'iesramonllull.net/apuntes/redes.pdf', x: 'apuntes de redes locales: cables, switch y router', pdf: true },
    { t: 'Redes locales explicadas fácil', u: 'blogtec.es/redes-locales', x: 'apuntes y explicacion de las redes locales en casa' },
    { t: 'Guía de redes sociales para familias', u: 'internetsegura.es/guia-redes.pdf', x: 'guia de redes sociales y privacidad para familias', pdf: true },
    { t: '¿Qué es la red de área local (LAN)?', u: 'wikired.es/lan', x: 'la red de area local une los ordenadores de un mismo edificio' },
    { t: 'Bar La Red: comida local', u: 'barlared.es', x: 'la red de amigos del barrio: comida local en un area tranquila' },
    { t: 'Jaguar, el felino de América', u: 'animalesdelmundo.es/jaguar', x: 'el jaguar es el felino mas grande de america' },
    { t: 'Jaguar F-Type: precio del coche', u: 'motorhoy.es/jaguar-f-type', x: 'jaguar coche deportivo precio y prueba' },
  ];
  const ANUNCIOS = [
    { para: 'lentejas', t: 'Lentejas con chorizo en lata · 2x1', u: 'superpaco.es/ofertas', x: 'compra ya lentejas con chorizo listas para calentar' },
    { para: 'tortilla', t: 'Tortilla precocinada a domicilio', u: 'comidarapida.es', x: 'pide tortilla y croquetas en 30 minutos' },
  ];
  function analizar(q) {
    const terms = [];
    let resto = q.replace(/"([^"]*)"/g, (_, f) => { terms.push({ tipo: 'frase', v: norm(f.trim()) }); return ' '; });
    const toks = resto.split(/\s+/).filter(Boolean);
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (t === 'OR' && terms.length && toks[i + 1]) {
        const prev = terms.pop();
        const sig = norm(toks[++i]);
        const ops = prev.tipo === 'o' ? prev.v.concat(sig) : [prev.v, sig];
        terms.push({ tipo: 'o', v: ops });
      } else if (/^-./.test(t)) terms.push({ tipo: 'no', v: norm(t.slice(1)) });
      else if (/^site:./i.test(t)) terms.push({ tipo: 'site', v: norm(t.slice(5)) });
      else if (/^filetype:./i.test(t)) terms.push({ tipo: 'tipo', v: norm(t.slice(9)) });
      else terms.push({ tipo: 'si', v: norm(t) });
    }
    return terms;
  }
  function casa(p, terms) {
    const txt = norm(p.t + ' ' + p.x + ' ' + p.u);
    const palabras = txt.split(/[^a-z0-9ñ]+/);
    const tiene = w => palabras.indexOf(w) !== -1;
    return terms.every(t => {
      if (t.tipo === 'frase') return txt.replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').includes(t.v);
      if (t.tipo === 'no') return !tiene(t.v);
      if (t.tipo === 'site') return p.u.startsWith(t.v);
      if (t.tipo === 'tipo') return t.v === 'pdf' ? !!p.pdf : false;
      if (t.tipo === 'o') return t.v.some(tiene);
      return tiene(t.v);
    });
  }
  const tieneP = (p, w) => norm(p.t + ' ' + p.x).split(/[^a-z0-9ñ]+/).indexOf(w) !== -1;
  const RETOS = [
    { r: res => res.length > 0 && res.every(p => tieneP(p, 'lentejas') && !tieneP(p, 'chorizo')) },
    { r: res => res.length > 0 && res.every(p => p.u.startsWith('iesramonllull.net') && tieneP(p, 'calendario')) },
    { r: res => res.length > 0 && res.every(p => p.pdf && tieneP(p, 'apuntes') && tieneP(p, 'redes')) },
    { r: res => res.length === 1 && res[0].u === 'wikired.es/lan' },
    { r: res => res.some(p => tieneP(p, 'tortilla')) && res.some(p => tieneP(p, 'croquetas')) && res.every(p => tieneP(p, 'receta')) },
  ];

  registrarSimulacion('buscador', {
    ventana: 'Windows 11 · Google Chrome',
    mision: [
      'Recetas de lentejas, pero ninguna con chorizo.',
      'El calendario escolar, pero solo de la web del instituto (iesramonllull.net).',
      'Apuntes de redes que sean un PDF.',
      'Solo la página que tenga, tal cual, «la red de área local».',
      'Recetas de tortilla o de croquetas, las dos a la vez.',
    ],
    final: 'Apunta en tu cuaderno la búsqueda exacta que escribiste para cada reto (pregunta 8).',
    crear(ctx) {
      const { el } = ctx;
      const W = WIN11.escritorio(ctx, { fs: WIN11.fs.equipo(WIN11.fs.usuario({})), barra: ['explorador', 'navegador'] });
      W.aviso('Este buscador solo tiene unas pocas webs inventadas, pero entiende los cinco operadores de la tabla. Escribe en su cuadro o en la barra de direcciones y pulsa Intro.', 'cuidado');
      function buscarEn(t, texto) {
        Object.assign(t, { t: texto ? texto + ' - Buscador' : 'Buscador', url: texto ? 'buscador.es/search?q=' + encodeURIComponent(texto) : 'buscador.es', pag: 'web', q: texto, zoom: 100 });
        if (!texto) return;
        const terms = analizar(texto);
        const encontrados = PAGINAS.filter(p => casa(p, terms));
        let algo = false;
        RETOS.forEach((r, i) => { if (!ctx.hecho(i) && r.r(encontrados)) { ctx.cumple(i, `Reto ${i + 1}: ${texto}`); algo = true; } });
        if (!algo) ctx.apunta(`Buscar: ${texto}`);
      }
      const C = chrome(W, {
        pestanas: [{ t: 'Buscador', url: 'buscador.es' }],
        marcadores: null,
        navegar(txt, t) { buscarEn(t, txt); },
        pagina(t, cont, C2) {
          cont.classList.add('w11-bus');
          const cab = el('div', 'w11-bus__cab' + (t.q ? '' : ' w11-bus__cab--inicio'));
          cab.appendChild(el('p', 'w11-ch__logo', 'Buscador'));
          const q = document.createElement('input');
          q.type = 'search';
          q.className = 'w11-campo w11-ch__busca';
          q.value = t.q || '';
          q.placeholder = 'por ejemplo: receta lentejas';
          q.spellcheck = false;
          q.setAttribute('translate', 'no');
          q.setAttribute('aria-label', 'Lo que buscas');
          q.addEventListener('keydown', e => { if (e.key === 'Enter') { buscarEn(t, q.value.trim()); C2.pintar(); } });
          cab.appendChild(q);
          cont.appendChild(cab);
          if (!t.q) return;
          const texto = t.q;
          const avisos = [];
          if (/(^|\s)-\s/.test(texto)) avisos.push('El - va pegado a la palabra: -chorizo, no - chorizo.');
          if (/(site|filetype):\s/i.test(texto)) avisos.push('Después de site: y filetype: no va espacio.');
          if (/\sor\s/.test(texto)) avisos.push('El OR va en mayúsculas. En minúsculas, es una palabra más.');
          if (avisos.length) W.aviso(avisos.join(' '), 'cuidado'); else W.aviso();
          const terms = analizar(texto);
          const encontrados = PAGINAS.filter(p => casa(p, terms));
          const pos = terms.filter(x => x.tipo === 'si' || x.tipo === 'o').map(x => [].concat(x.v)).flat();
          const anuncio = ANUNCIOS.find(a => pos.indexOf(a.para) !== -1);
          const res = el('div', 'sim__resultados w11-bus__res');
          res.appendChild(el('p', 'w11-nota', `Unos ${encontrados.length} resultado${encontrados.length === 1 ? '' : 's'}`));
          if (anuncio) res.appendChild(tarjeta(anuncio, true, C2));
          encontrados.forEach(p => res.appendChild(tarjeta(p, false, C2)));
          cont.appendChild(res);
        },
      });
      function tarjeta(p, anuncio, C2) {
        const c = el('div', 'sim__resultado');
        if (anuncio) c.appendChild(el('span', 'sim__patrocinado', 'Patrocinado'));
        const u = el('p', 'sim__ayuda', p.u);
        u.setAttribute('translate', 'no');
        c.appendChild(u);
        const tt = el('a', 'sim__resultado-titulo', p.t);
        tt.href = '#';
        tt.addEventListener('click', e => { e.preventDefault(); W.aviso('En esta simulación no hace falta entrar en las webs: mira si los resultados cumplen el reto.', 'cuidado'); });
        tt.addEventListener('mouseenter', () => C2.estado('https://' + p.u));
        tt.addEventListener('mouseleave', () => C2.estado(''));
        if (p.pdf) tt.prepend(el('span', 'sim__pdf', 'PDF'));
        c.appendChild(tt);
        c.appendChild(el('p', 'sim__resultado-texto', p.x));
        return c;
      }
      void C;
    },
  });

  /* ============================================================
     S3 · Revisa la bandeja
     ============================================================ */
  const CORREOS = [
    { de: 'Secretaría <secretaria@iesramonllull.net>', as: 'Horario de exámenes de la 1.ª evaluación', cu: 'Hola: os dejamos el horario de los exámenes en la web del instituto.', enlace: ['Ver el horario', 'https://iesramonllull.net/examenes'], tipo: 'bueno', por: 'Viene del dominio del instituto y el enlace lleva a la web del instituto.' },
    { de: 'Netflix <avisos@netfIix-pagos.com>', as: '⚠️ Tu cuenta se cancelará HOY', cu: 'No hemos podido cobrar tu suscripción. Actualiza tus datos de pago en las próximas 2 horas o perderás tu cuenta.', enlace: ['Actualizar el pago', 'http://netfIix-pagos.com/login'], tipo: 'phishing', por: 'Mira bien el remitente: «netfIix» lleva una i mayúscula en vez de una l. Además mete prisa y pide datos de pago.' },
    { de: 'Correos <info@correos-envio-paquete.top>', as: 'Tu paquete está retenido', cu: 'Tu paquete no se ha podido entregar. Abre el adjunto para ver el justificante y pagar 1,99 € de gastos.', adjunto: 'justificante.pdf.exe', tipo: 'phishing', por: 'El adjunto acaba en .exe: no es un PDF, es un programa. Y Correos no escribe desde un dominio .top.' },
    { de: 'Ana Serra <ana.serra@iesramonllull.net>', as: 'Apuntes de la U3', cu: '¡Hola! Te paso los apuntes que me pediste. Nos vemos el lunes.', adjunto: 'apuntes-u3.pdf', tipo: 'bueno', por: 'Es una compañera, desde el correo del instituto, con un PDF de verdad que le habías pedido.' },
    { de: 'Superofertas <ofertas@superpaco.es>', as: 'Este finde, 2x1 en lentejas', cu: 'Ofertas de la semana en tu súper. Si no quieres recibir más correos, pulsa aquí para darte de baja.', tipo: 'spam', por: 'Es publicidad: no te pide datos ni te mete prisa. Es spam, no phishing.' },
    { de: 'Banco Seguro <seguridad@banco-seguro-verificar.com>', as: 'Hemos detectado un acceso extraño', cu: 'Estimado cliente: para proteger tu cuenta, confirma tu usuario y tu contraseña pulsando el botón.', enlace: ['Confirmar mis datos', 'http://banco-seguro-verificar.com/acceso'], tipo: 'phishing', por: 'Ningún banco te pide la contraseña por correo. Saludo genérico («Estimado cliente») y un dominio raro.' },
  ];
  registrarSimulacion('bandeja', {
    ventana: 'Windows 11 · Google Chrome',
    mision: [
      'Denuncia como phishing los tres correos trampa.',
      'Destaca con la estrella ☆ los dos correos de fiar.',
      'Manda a spam la publicidad.',
    ],
    final: 'Apunta en tu cuaderno los tres correos de phishing y, de cada uno, la señal que te hizo sospechar (pregunta 13).',
    crear(ctx) {
      const { el, boton } = ctx;
      const ic = WIN11.icono;
      const W = WIN11.escritorio(ctx, { fs: WIN11.fs.equipo(WIN11.fs.usuario({})), barra: ['explorador', 'navegador'] });
      const est = CORREOS.map(() => ({ carpeta: 'rec', estrella: false, leido: false }));
      let abierto = -1, carpeta = 'rec';
      const FECHAS = ['10:42', '9:15', '8:03', 'ayer', 'ayer', '16 nov'];
      function recalcula() {
        const tipos = { phishing: 'phish', spam: 'spam' };
        const ok0 = CORREOS.every((c, i) => (c.tipo === 'phishing') === (est[i].carpeta === 'phish'));
        const ok1 = CORREOS.every((c, i) => (c.tipo === 'bueno') === (est[i].estrella && est[i].carpeta === 'rec'));
        const ok2 = CORREOS.every((c, i) => (c.tipo === 'spam') === (est[i].carpeta === 'spam'));
        [ok0, ok1, ok2].forEach((ok, i) => { if (ok) ctx.cumple(i); else if (ctx.hecho(i)) ctx.deshace(i); });
        void tipos;
      }
      function clasifica(i, como) {
        const c = CORREOS[i];
        const bien = (como === 'phish' && c.tipo === 'phishing') || (como === 'spam' && c.tipo === 'spam') || (como === 'estrella' && c.tipo === 'bueno');
        const NOM = { phish: 'denunciar phishing', spam: 'marcar como spam', estrella: 'destacar con la estrella' };
        if (bien) { ctx.apunta(`«${c.as}»: ${NOM[como]}. ${c.por}`); W.aviso('Bien visto. ' + c.por, 'ok'); }
        else {
          ctx.falla(`«${c.as}»: ${NOM[como]}, pero no lo es.`);
          W.aviso('No es eso. ' + (c.tipo === 'phishing' ? 'Míralo otra vez: el remitente letra a letra, adónde lleva el enlace (pasa el ratón por encima), el adjunto, si mete prisa o te pide datos.' : c.tipo === 'spam' ? 'No pide datos ni mete prisa: es publicidad que no has pedido.' : 'Mira el remitente y adónde lleva: ¿hay algo raro de verdad?'), 'cuidado');
        }
        recalcula();
      }
      chrome(W, {
        pestanas: [{ t: 'Recibidos - correo del instituto', url: 'correo.iesramonllull.net/#inbox' }],
        marcadores: null,
        pagina(t, cont, C) {
          cont.classList.add('w11-mail');
          cont.style.fontSize = '';
          const lado = el('div', 'w11-mail__lado');
          const red = boton('✏️ Redactar', 'w11-mail__redactar');
          red.addEventListener('click', () => W.aviso('Hoy no hace falta escribir: revisa la bandeja.', 'cuidado'));
          lado.appendChild(red);
          [['rec', 'Recibidos'], ['est', 'Destacados'], ['spam', 'Spam'], ['phish', 'Denunciados']].forEach(([k, n]) => {
            const cuenta = k === 'est' ? est.filter(e => e.estrella).length : est.filter(e => e.carpeta === k).length;
            const b = boton('', 'w11-mail__carp' + (carpeta === k ? ' w11-mail__carp--actual' : ''));
            b.append(el('span', null, n), el('span', 'w11-mail__num', cuenta ? String(cuenta) : ''));
            b.addEventListener('click', () => { carpeta = k; abierto = -1; C.pintar(); });
            lado.appendChild(b);
          });
          const main = el('div', 'w11-mail__main');
          cont.append(lado, main);
          if (abierto !== -1) return correo(main, C);
          const lista = el('div', 'w11-mail__lista');
          lista.setAttribute('role', 'list');
          const vis = CORREOS.map((c, i) => i).filter(i => carpeta === 'est' ? est[i].estrella : est[i].carpeta === carpeta);
          if (!vis.length) lista.appendChild(el('p', 'w11-nota w11-mail__vacia', carpeta === 'rec' ? '¡Bandeja vacía!' : 'No hay correos aquí.'));
          vis.forEach(i => {
            const c = CORREOS[i];
            const f = el('div', 'w11-mail__fila' + (est[i].leido ? '' : ' w11-mail__fila--nuevo'));
            f.setAttribute('role', 'listitem');
            const s = boton(est[i].estrella ? '★' : '☆', 'w11-mail__estrella' + (est[i].estrella ? ' w11-mail__estrella--on' : ''));
            s.setAttribute('aria-label', (est[i].estrella ? 'Quitar estrella: ' : 'Destacar: ') + c.as);
            s.setAttribute('aria-pressed', String(est[i].estrella));
            s.addEventListener('click', e => { e.stopPropagation(); est[i].estrella = !est[i].estrella; if (est[i].estrella) clasifica(i, 'estrella'); else recalcula(); C.pintar(); });
            const abrir = boton('', 'w11-mail__abrir');
            const de = el('span', 'w11-mail__de', c.de.split(' <')[0]);
            de.setAttribute('translate', 'no');
            const as = el('span', 'w11-mail__as');
            as.append(el('strong', null, c.as), document.createTextNode(' — ' + c.cu));
            abrir.append(de, as, el('span', 'w11-mail__fecha', FECHAS[i]));
            abrir.addEventListener('click', () => { abierto = i; est[i].leido = true; C.pintar(); });
            f.append(s, abrir);
            lista.appendChild(f);
          });
          main.appendChild(lista);
        },
      });
      function correo(main, C) {
        const i = abierto, c = CORREOS[i];
        const bar = el('div', 'w11-mail__bar');
        const b = (txt, lab, f) => { const x = boton(txt, 'w11-mail__ib'); x.setAttribute('aria-label', lab); x.title = lab; x.addEventListener('click', f); bar.appendChild(x); return x; };
        b('←', 'Volver a Recibidos', () => { abierto = -1; C.pintar(); });
        b('🗄', 'Archivar', () => { W.aviso('Archivar lo quita de Recibidos pero no dice qué es. Decide si es de fiar, spam o phishing.', 'cuidado'); });
        b('⚠', 'Marcar como spam', () => { est[i].carpeta = 'spam'; est[i].estrella = false; clasifica(i, 'spam'); abierto = -1; C.pintar(); });
        b('🗑', 'Eliminar', () => { W.aviso('Eliminarlo no avisa a nadie. Si es una trampa, denúncialo; si es publicidad, mándalo a spam.', 'cuidado'); });
        const mas = b('⋮', 'Más', () => {
          const r = mas.getBoundingClientRect();
          W.menu(r.left, r.bottom, [
            { t: 'Responder', off: true }, { t: 'Reenviar', off: true },
            { sep: true },
            { t: `Bloquear a «${c.de.split(' <')[0]}»`, off: true },
            { t: 'Denunciar spam', f: () => { est[i].carpeta = 'spam'; est[i].estrella = false; clasifica(i, 'spam'); abierto = -1; C.pintar(); } },
            { t: 'Denunciar phishing', f: () => { est[i].carpeta = 'phish'; est[i].estrella = false; clasifica(i, 'phish'); abierto = -1; C.pintar(); } },
          ]);
        });
        main.appendChild(bar);
        const h = el('p', 'w11-mail__titulo', c.as);
        main.appendChild(h);
        const cab = el('div', 'w11-mail__cab');
        cab.appendChild(ic('usuario', 'w11-mail__avatar'));
        const quien = el('div', 'w11-mail__quien');
        const nom = el('span', 'w11-mail__nombre', c.de.split(' <')[0]);
        const dir = el('span', 'w11-mail__dir', '<' + c.de.split(' <')[1]);
        nom.setAttribute('translate', 'no'); dir.setAttribute('translate', 'no');
        quien.append(nom, dir, el('span', 'w11-mail__para', 'para mí'));
        cab.append(quien, el('span', 'w11-mail__fecha', FECHAS[i]));
        const s = boton(est[i].estrella ? '★' : '☆', 'w11-mail__estrella' + (est[i].estrella ? ' w11-mail__estrella--on' : ''));
        s.setAttribute('aria-label', est[i].estrella ? 'Quitar estrella' : 'Destacar');
        s.setAttribute('aria-pressed', String(est[i].estrella));
        s.addEventListener('click', () => { est[i].estrella = !est[i].estrella; if (est[i].estrella) clasifica(i, 'estrella'); else recalcula(); C.pintar(); });
        cab.appendChild(s);
        main.appendChild(cab);
        main.appendChild(el('p', 'w11-mail__cuerpo', c.cu));
        if (c.enlace) {
          const a = el('a', 'w11-mail__boton', c.enlace[0]);
          a.href = '#';
          const ver = () => { C.estado(c.enlace[1]); if (!c._visto) { c._visto = true; ctx.apunta(`«${c.as}»: el botón lleva a ${c.enlace[1]}.`); } };
          a.addEventListener('mouseenter', ver);
          a.addEventListener('focus', ver);
          a.addEventListener('mouseleave', () => C.estado(''));
          a.addEventListener('blur', () => C.estado(''));
          a.addEventListener('contextmenu', e => { e.preventDefault(); ver(); W.menu(e.clientX, e.clientY, [{ t: 'Copiar dirección del enlace', f: () => W.notificacion('Enlace copiado', c.enlace[1], 'copiar') }]); });
          a.addEventListener('click', e => { e.preventDefault(); ver(); W.aviso('¡Cuidado! Antes de pulsar el botón de un correo, pasa el ratón por encima y mira abajo a la izquierda adónde lleva de verdad.', 'cuidado'); });
          main.appendChild(a);
        }
        if (c.adjunto) {
          const ad = el('div', 'w11-mail__adjunto');
          ad.append(ic(/\.exe$/.test(c.adjunto) ? 'exe' : 'pdf'), el('span', null, c.adjunto));
          ad.setAttribute('translate', 'no');
          main.appendChild(ad);
        }
      }
    },
  });

  /* ============================================================
     U2 S1 · Monta la red de casa (rehecha el 16/11/2026 en el
     Windows 11 de mentira): la página del router en Chrome
     (192.168.1.1) para dar a cada aparato su IP fija, y la Terminal
     con ipconfig, nslookup, ping y tracert.
     ============================================================ */
  registrarSimulacion('red-casa', {
    ventana: 'Windows 11',
    mision: [
      'En la página del router (192.168.1.1), dale a cada aparato de casa una IP fija privada, sin repetir ninguna.',
      'Busca la IP pública del router (Internet) y la de tu ordenador (ipconfig en la Terminal).',
      'Pregunta al DNS la IP de bloquecraft.es (nslookup en la Terminal).',
      'Mira el camino hasta bloquecraft.es (tracert) y abre la web en Chrome.',
    ],
    final: 'Apunta en tu cuaderno la IP que diste a cada aparato, la IP pública del router y la IP de bloquecraft.es. Después explica, paso a paso, el viaje desde que escribiste bloquecraft.es hasta que se cargó (pregunta 15).',
    crear(ctx) {
      const { el, boton } = window.LAB;
      const PUBLICA = '83.45.120.17', SERVIDOR = '91.45.7.33', ROUTER = '192.168.1.1';
      const AP = [
        { k: 'pc', n: 'Ordenador (PC-SALON)', mac: 'A4:5E:60:1B:22:7F', ic: '🖥️' },
        { k: 'movil', n: 'Móvil (Galaxy-de-Pau)', mac: '3C:28:6D:90:11:AB', ic: '📱' },
        { k: 'consola', n: 'Consola (Switch)', mac: '98:41:5C:07:E2:10', ic: '🎮' },
      ];
      const fija = { pc: '', movil: '', consola: '' };
      const visto = { publica: false, ipconfig: false, tracert: false, web: false };
      let pag = 'estado';
      const W = WIN11.escritorio(ctx, { fs: WIN11.fs.equipo(WIN11.fs.usuario({})), barra: ['explorador', 'navegador', 'terminal'],
        apps: { terminal: { n: 'Terminal', icono: 'terminal', enInicio: true, buscar: ['terminal', 'cmd', 'simbolo del sistema', 'símbolo del sistema', 'powershell'], abrir: () => terminal() } } });
      const ipPC = () => fija.pc || '192.168.1.35';
      function revisa() {
        if (visto.publica && visto.ipconfig) ctx.cumple(1, `IP pública del router (página del router → Internet): ${PUBLICA}. IP de tu ordenador (ipconfig): ${ipPC()}. Son distintas: dentro de casa se usan IP privadas (192.168…); hacia Internet, el router sale con la pública.`);
        if (visto.tracert && visto.web) ctx.cumple(3, `tracert bloquecraft.es: tu ordenador (${ipPC()}) → router (${ROUTER}) → operadora → Internet → servidor de bloquecraft.es (${SERVIDOR}). En Chrome, bloquecraft.es se carga.`);
      }
      const C = WIN11.web(W, {
        pestanas: [{ url: ROUTER, t: 'Router · Inicio' }],
        sitios: { [ROUTER]: router, 'bloquecraft.es': fans, [SERVIDOR]: fans, [PUBLICA]: deFuera },
      });
      function deFuera(t, cont) {
        t.t = PUBLICA;
        const e = el('div', 'w11-web__error');
        e.append(el('p', 'w11-web__error-t', 'No se puede acceder a este sitio'), el('p', null, `${PUBLICA} ha rechazado la conexión. (Es la IP pública de tu propio router: desde fuera no enseña nada.)`));
        cont.appendChild(e);
      }
      function fans(t, cont) {
        t.t = 'BloqueCraft · Web de fans de Minecraft';
        cont.classList.add('w11-fans');
        const c = el('div', 'w11-fans__cab');
        c.append(el('p', 'w11-fans__logo', '⛏ BloqueCraft'), el('p', null, 'La web de fans de Minecraft'));
        cont.appendChild(c);
        ['Los mejores mods para empezar', 'Trucos para el Nether', 'Construye tu primera casa de supervivencia'].forEach(x => cont.appendChild(el('p', 'w11-fans__art', '▸ ' + x)));
        if (!visto.web) { visto.web = true; ctx.apunta(`Chrome → bloquecraft.es: la página se carga (el servidor está en ${SERVIDOR}).`); revisa(); }
      }
      function router(t, cont, C2) {
        cont.classList.add('w11-rt');
        t.t = 'Router · ' + { estado: 'Inicio', internet: 'Internet', lan: 'Red local' }[pag];
        const cab = el('div', 'w11-rt__cab');
        cab.append(el('p', 'w11-rt__logo', '📶 Router Wi-Fi 6'), el('span', 'w11-web__hueco'), el('span', 'w11-web__sub', 'admin'));
        cont.appendChild(cab);
        const caja = el('div', 'w11-rt__caja');
        const nav = el('nav', 'w11-rt__nav');
        [['estado', 'Inicio'], ['internet', 'Internet'], ['lan', 'Red local (LAN)']].forEach(([k, n]) => {
          const b = boton(n, 'w11-rt__ni' + (pag === k ? ' w11-rt__ni--on' : ''));
          b.addEventListener('click', () => { pag = k; C2.pintar(); });
          nav.appendChild(b);
        });
        const main = el('div', 'w11-rt__main');
        caja.append(nav, main);
        cont.appendChild(caja);
        const tabla = filas => {
          const tb = el('div', 'w11-rt__tabla');
          filas.forEach(([k, v]) => { const f = el('div', 'w11-rt__f'); f.append(el('span', 'w11-web__sub', k), el('strong', null, v)); f.lastChild.setAttribute('translate', 'no'); tb.appendChild(f); });
          return tb;
        };
        if (pag === 'estado') {
          main.appendChild(el('p', 'w11-rt__h', 'Inicio'));
          main.appendChild(tabla([['Internet', '● Conectado'], ['Wi-Fi', 'CASA-2.4G y CASA-5G'], ['Aparatos conectados', '3']]));
          main.appendChild(el('p', 'w11-web__sub', 'En «Internet» está la conexión con la operadora; en «Red local», los aparatos de casa.'));
        } else if (pag === 'internet') {
          main.appendChild(el('p', 'w11-rt__h', 'Internet (WAN)'));
          main.appendChild(tabla([['Estado', '● Conectado'], ['IP pública', PUBLICA], ['Puerta de enlace de la operadora', '83.45.120.1'], ['Servidor DNS', '80.58.61.250']]));
          main.appendChild(el('p', 'w11-web__sub', 'Esta IP la pone la operadora. Es la que ve Internet cuando sales desde cualquier aparato de casa.'));
          if (!visto.publica) { visto.publica = true; ctx.apunta(`Página del router → Internet: IP pública ${PUBLICA}.`); revisa(); }
        } else {
          main.appendChild(el('p', 'w11-rt__h', 'Red local (LAN)'));
          main.appendChild(tabla([['IP del router', ROUTER], ['Máscara de subred', '255.255.255.0'], ['DHCP (IP automáticas)', '192.168.1.33 – 192.168.1.199']]));
          main.appendChild(el('p', 'w11-rt__h2', 'IP fijas (reserva DHCP)'));
          main.appendChild(el('p', 'w11-web__sub', 'Escribe la IP que tendrá siempre cada aparato y pulsa «Guardar».'));
          const tb = el('div', 'w11-rt__res');
          const ent = {};
          AP.forEach(a => {
            const f = el('label', 'w11-rt__r');
            const d = el('span', 'w11-rt__rd');
            d.append(el('span', null, a.ic + ' ' + a.n), el('span', 'w11-web__sub', 'MAC ' + a.mac));
            d.lastChild.setAttribute('translate', 'no');
            const i = document.createElement('input');
            i.className = 'w11-web__campo w11-rt__ip';
            i.value = fija[a.k];
            i.placeholder = '192.168.1.…';
            i.spellcheck = false;
            i.inputMode = 'decimal';
            i.setAttribute('translate', 'no');
            i.setAttribute('aria-label', 'IP fija de ' + a.n);
            ent[a.k] = i;
            f.append(d, i);
            tb.appendChild(f);
          });
          main.appendChild(tb);
          const msg = el('div', 'w11-rt__msg');
          msg.setAttribute('aria-live', 'polite');
          const g = boton('Guardar', 'w11-web__btn w11-web__btn--primario');
          g.addEventListener('click', () => {
            msg.innerHTML = '';
            const err = (a, t) => { msg.appendChild(el('p', 'w11-rt__err', `${a.n}: ${t}`)); ent[a.k].classList.add('w11-rt__ip--mal'); };
            const vals = {};
            let mal = false;
            AP.forEach(a => {
              ent[a.k].classList.remove('w11-rt__ip--mal');
              const v = ent[a.k].value.trim();
              vals[a.k] = v;
              const p = v.split('.');
              if (!v) { err(a, 'falta la IP.'); mal = true; return; }
              if (p.length !== 4 || p.some(x => !/^\d{1,3}$/.test(x))) { err(a, 'eso no es una IP: son cuatro números separados por puntos.'); mal = true; return; }
              if (p.some(x => +x > 255)) { err(a, 'ningún número de una IP pasa de 255.'); mal = true; ctx.apunta(`${a.n}: ${v} (no vale: pasa de 255).`); return; }
              if (v === PUBLICA) { err(a, 'esa es la IP pública del router, la de fuera. Dentro de casa, cada aparato lleva una privada: 192.168.1.…'); mal = true; ctx.falla(`Poner a ${a.n} la IP pública (${PUBLICA}).`); return; }
              if (p.slice(0, 3).join('.') !== '192.168.1') { err(a, 'tiene que estar en tu red: 192.168.1.…'); mal = true; return; }
              if (v === ROUTER) { err(a, '192.168.1.1 ya es del router.'); mal = true; return; }
              if (p[3] === '0' || p[3] === '255') { err(a, 'el .0 y el .255 están reservados: usa otro número.'); mal = true; }
            });
            if (!mal) {
              const r = Object.values(vals);
              if (new Set(r).size < r.length) { msg.appendChild(el('p', 'w11-rt__err', 'Dos aparatos con la misma IP chocarían: cada uno necesita la suya.')); ctx.falla('Repetir una IP en dos aparatos.'); mal = true; }
            }
            if (mal) { if (ctx.hecho(0)) ctx.deshace(0); return; }
            Object.assign(fija, vals);
            msg.appendChild(el('p', 'w11-rt__ok', '✔ Guardado. Los aparatos tendrán estas IP la próxima vez que se conecten.'));
            ctx.cumple(0, `Router → Red local → IP fijas: ordenador ${fija.pc}, móvil ${fija.movil}, consola ${fija.consola}.`);
          });
          main.append(g, msg);
        }
      }
      // ---------- Terminal ----------
      function terminal() {
        const ya = W.ventana('terminal');
        if (ya) { ya.enfocar(); return ya; }
        let salida, entrada;
        const v = W.abrir({ app: 'terminal', titulo: 'Símbolo del sistema', icono: 'terminal', ancho: 62, alto: 70, crear: c => {
          c.classList.add('w11-term');
          c.setAttribute('translate', 'no');
          salida = el('pre', 'w11-term__out');
          salida.textContent = 'Microsoft Windows [Versión 10.0.26100.2314]\n(c) Microsoft Corporation. Todos los derechos reservados.\n\n';
          const fila = el('label', 'w11-term__fila');
          fila.appendChild(el('span', 'w11-term__prompt', 'C:\\Users\\alumno>'));
          entrada = document.createElement('input');
          entrada.className = 'w11-term__in';
          entrada.spellcheck = false;
          entrada.autocomplete = 'off';
          entrada.setAttribute('aria-label', 'Escribe una orden y pulsa Intro');
          entrada.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); orden(entrada.value); entrada.value = ''; } });
          fila.appendChild(entrada);
          c.append(salida, fila);
          c.addEventListener('click', () => entrada.focus({ preventScroll: true }));
          setTimeout(() => entrada.focus({ preventScroll: true }), 0);
        } });
        function escribe(t) { salida.textContent += t; const c = v.cuerpo; c.scrollTop = c.scrollHeight; }
        function nombreDe(x) { return (x || '').toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, ''); }
        function resuelve(n) { return n === 'bloquecraft.es' ? SERVIDOR : (n === 'google.es' || n === 'google.com') ? '142.250.184.78' : /^\d+\.\d+\.\d+\.\d+$/.test(n) ? n : null; }
        function orden(txt) {
          const t = txt.trim();
          escribe('C:\\Users\\alumno>' + txt + '\n');
          if (!t) return;
          const [cmd, arg] = t.split(/\s+/);
          const c = cmd.toLowerCase();
          if (c === 'cls') { salida.textContent = ''; return; }
          if (c === 'ipconfig') {
            escribe(`\nConfiguración IP de Windows\n\nAdaptador de LAN inalámbrica Wi-Fi:\n\n   Dirección IPv4. . . . . . . . . . . . . . : ${ipPC()}\n   Máscara de subred . . . . . . . . . . . . : 255.255.255.0\n   Puerta de enlace predeterminada . . . . . : ${ROUTER}\n\n`);
            if (!visto.ipconfig) { visto.ipconfig = true; ctx.apunta(`ipconfig: la IP de tu ordenador es ${ipPC()} (privada) y la puerta de enlace, el router (${ROUTER}).`); revisa(); }
            if (!fija.pc) W.aviso('Todavía no le has dado su IP fija: esta la ha puesto el router automáticamente (DHCP).', 'cuidado');
            return;
          }
          if (c === 'nslookup') {
            const n = nombreDe(arg);
            if (!n) { escribe('Uso: nslookup nombre (por ejemplo, nslookup bloquecraft.es)\n\n'); return; }
            const ip = resuelve(n);
            escribe(`Servidor:  dns.operadora.es\nAddress:  80.58.61.250\n\n`);
            if (ip && !/^\d/.test(n)) {
              escribe(`Respuesta no autoritativa:\nNombre:  ${n}\nAddress:  ${ip}\n\n`);
              if (n === 'bloquecraft.es') ctx.cumple(2, `nslookup bloquecraft.es: el DNS responde ${SERVIDOR}.`);
              else ctx.apunta(`nslookup ${n}: ${ip}.`);
            } else if (!ip) { escribe(`*** dns.operadora.es no encuentra ${n}: Non-existent domain\n\n`); ctx.apunta(`nslookup ${n}: no existe.`); }
            else escribe(`*** dns.operadora.es no encuentra ${n}: es una IP, no un nombre.\n\n`);
            return;
          }
          if (c === 'ping') {
            const n = nombreDe(arg);
            const ip = n === 'router' ? null : (n === ROUTER || n === PUBLICA || Object.values(fija).indexOf(n) !== -1) ? n : resuelve(n);
            if (!n) { escribe('Uso: ping nombre o IP\n\n'); return; }
            if (!ip) { escribe(`La solicitud de ping no pudo encontrar el host ${n}. Compruebe el nombre y vuelva a intentarlo.\n\n`); return; }
            const ms = ip === ROUTER || ip.startsWith('192.168.') ? 2 : 24;
            escribe(`\nHaciendo ping a ${n}${n !== ip ? ' [' + ip + ']' : ''} con 32 bytes de datos:\n` + [0, 1, 2, 3].map(i => `Respuesta desde ${ip}: bytes=32 tiempo=${ms + i}ms TTL=${ms > 5 ? 54 : 64}`).join('\n') + '\n\n');
            ctx.apunta(`ping ${n}: responde.`);
            return;
          }
          if (c === 'tracert') {
            const n = nombreDe(arg);
            const ip = resuelve(n);
            if (!n) { escribe('Uso: tracert nombre\n\n'); return; }
            if (!ip) { escribe(`No se puede resolver el nombre del sistema de destino ${n}.\n\n`); return; }
            escribe(`\nTraza a ${n}${n !== ip ? ' [' + ip + ']' : ''}\nsobre un máximo de 30 saltos:\n\n  1     2 ms     1 ms     2 ms  ${ROUTER}\n  2     9 ms     8 ms     9 ms  83.45.120.1\n  3    14 ms    13 ms    14 ms  core1.operadora.es [80.58.10.4]\n  4    21 ms    20 ms    22 ms  ix.madrid.es [193.149.1.30]\n  5    24 ms    23 ms    24 ms  ${ip}\n\nTraza completa.\n\n`);
            if (n === 'bloquecraft.es' || ip === SERVIDOR) { if (!visto.tracert) { visto.tracert = true; ctx.apunta(`tracert bloquecraft.es: 1 el router (${ROUTER}), 2 la operadora, 3-4 Internet, 5 el servidor (${SERVIDOR}).`); revisa(); } }
            return;
          }
          if (c === 'help' || c === 'ayuda') { escribe('Órdenes que entiende esta Terminal: ipconfig, nslookup, ping, tracert, cls.\n\n'); return; }
          escribe(`"${cmd}" no se reconoce como un comando interno o externo,\nprograma o archivo por lotes ejecutable.\n\n`);
        }
        return v;
      }
      void C;
    },
  });
})();
