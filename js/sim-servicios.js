/* ============================================================
   Simulaciones de la Unidad 3 de Operaciones (servicios de
   Internet), 27/10/2026; rehechas el 16/11/2026 para que sean lo
   más reales posible (lo pidieron los alumnos): van en el Windows
   11 de mentira (js/win11.js) con un Chrome de mentira y webs que
   imitan las de verdad (WIN11.web, en js/sim-internet.js). Se
   usan con el ratón y el teclado, sin listas de «elige qué hacer».

   foro       S2 «Modera el foro»: un foro tipo Discourse. Mover un
              mensaje a su tema (⋯ → Mover a otro tema), marcar la
              solución (☑ Solución) y cerrar un tema repetido
              (🔧 → Cerrar como duplicado).
   perfil     S3 «Arregla este perfil»: una red social tipo
              Instagram (Fotogram). Configuración con interruptores
              y la biografía, que se escribe de verdad. En otra
              pestaña, el perfil como lo ve un desconocido.
   compartir  S3 «Comparte bien»: Google Drive con clic derecho →
              Compartir y la ventana de compartir de Google
              (personas, permisos, acceso general).
   wiki       S4 «Salva la wiki»: una wiki tipo Wikipedia. Historial
              con (act | ant), «deshacer» y versiones antiguas.
   wiki-escribe  S4 «Escribe en la wiki»: editar la sección que toca
              copiando el ejemplo de tus apuntes (Bloc de notas) con
              Ctrl + C y Ctrl + V; resumen de edición escrito.

   Todos los nombres son inventados (alias). Nada se guarda.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function' || !window.LAB) return;
  const { el, boton } = window.LAB;
  const norm = t => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim();
  const sinTraducir = n => { n.setAttribute('translate', 'no'); return n; };

  /* ---------- piezas de las webs ---------- */
  const COLORES = ['a', 'b', 'c', 'd', 'e', 'f'];
  function avatar(nombre) {
    const a = el('span', 'w11-web__av w11-web__av--' + COLORES[(nombre.charCodeAt(0) + nombre.length) % COLORES.length], (nombre[0] || '?').toUpperCase());
    a.setAttribute('aria-hidden', 'true');
    return a;
  }
  function boton2(t, clase, f) {
    const b = boton(t, 'w11-web__btn' + (clase ? ' ' + clase : ''));
    if (f) b.addEventListener('click', f);
    return b;
  }
  function enlace(t, f, clase) {
    const a = el('a', 'w11-web__a' + (clase ? ' ' + clase : ''), t);
    a.href = '#';
    a.addEventListener('click', e => { e.preventDefault(); f(e); });
    return a;
  }
  function interruptor(texto, sub, valor, alCambiar) {
    const l = el('label', 'w11-web__sw');
    const t = el('span', 'w11-web__sw-t');
    t.appendChild(el('span', null, texto));
    if (sub) t.appendChild(el('span', 'w11-web__sub', sub));
    const i = document.createElement('input');
    i.type = 'checkbox';
    i.setAttribute('role', 'switch');
    i.checked = !!valor;
    i.addEventListener('change', () => alCambiar(i.checked));
    l.append(t, i);
    return l;
  }
  function radios(nombre, opciones, valor, alCambiar) {
    const f = el('div', 'w11-web__radios');
    f.setAttribute('role', 'radiogroup');
    opciones.forEach(([v, t]) => {
      const l = el('label', 'w11-web__radio');
      const r = document.createElement('input');
      r.type = 'radio';
      r.name = nombre;
      r.value = v;
      r.checked = v === valor;
      r.addEventListener('change', () => { if (r.checked) alCambiar(v); });
      l.append(el('span', null, t), r);
      f.appendChild(l);
    });
    return f;
  }
  function desplegable(opciones, valor, etiqueta, alCambiar) {
    const s = document.createElement('select');
    s.className = 'w11-web__sel';
    s.setAttribute('aria-label', etiqueta);
    opciones.forEach(([v, t]) => { const o = document.createElement('option'); o.value = v; o.textContent = t; o.selected = v === valor; s.appendChild(o); });
    s.addEventListener('change', () => alCambiar(s.value));
    return s;
  }
  const equipo = () => window.WIN11.fs.equipo(window.WIN11.fs.usuario({}));
  const escritorio = ctx => window.WIN11.escritorio(ctx, { fs: equipo(), barra: ['explorador', 'navegador'] });

  /* ============================================================
     S2 · Modera el foro
     ============================================================ */
  registrarSimulacion('foro', {
    ventana: 'Windows 11 · Google Chrome',
    mision: [
      'Hay un mensaje en el tema equivocado: muévelo a su tema.',
      'Marca como solución la respuesta que arregló el problema.',
      'Hay un tema repetido: márcalo como duplicado del original.',
    ],
    final: 'Apunta en tu cuaderno qué mensaje moviste y adónde, qué respuesta marcaste como solución y por qué, y qué tema estaba repetido (pregunta 6).',
    crear(ctx) {
      const W = escritorio(ctx);
      const HOST = 'comunidad.bloquecraft.es';
      const T = {
        cierra: { titulo: 'Minecraft se cierra al arrancar', cat: 'Ayuda', autor: 'nube_azul', hace: '2 h', msgs: [] },
        mods: { titulo: '¿Qué mod me recomendáis para empezar?', cat: 'Mods', autor: 'rayo77', hace: '5 h', msgs: [] },
        nether: { titulo: 'Trucos para sobrevivir en el Nether', cat: 'Trucos', autor: 'mar_gris', hace: '1 d', msgs: [] },
        repe: { titulo: '¡¡¡SE ME CIERRA EL MINECRAFT!!!', cat: 'Ayuda', autor: 'tigre_99', hace: '20 min', msgs: [] },
      };
      T.cierra.msgs = [
        { id: 'c0', autor: 'nube_azul', hace: '2 h', t: 'Abro Minecraft y a los dos segundos se cierra. Tengo Windows 11. ¿Alguien sabe qué pasa?' },
        { id: 'c1', autor: 'rayo77', hace: '2 h', t: 'A mí me pasaba con el antivirus. Prueba a desactivarlo un momento.' },
        { id: 'c2', autor: 'pixel_verde', hace: '1 h', t: 'Actualiza el controlador de la tarjeta gráfica. Con el viejo, Minecraft se cierra al cargar el mundo.' },
        { id: 'c3', autor: 'nube_azul', hace: '45 min', t: '¡Era el controlador de la gráfica! Lo he actualizado y ya funciona. Gracias, pixel_verde.' },
      ];
      T.mods.msgs = [
        { id: 'k0', autor: 'rayo77', hace: '5 h', t: 'Acabo de empezar y quiero probar algún mod. ¿Cuál me recomendáis?' },
        { id: 'k1', autor: 'mar_gris', hace: '4 h', t: 'Uno de minimapa: así no te pierdes al explorar.' },
        { id: 'k2', autor: 'luna_8', hace: '3 h', t: 'A mí también se me cierra Minecraft al arrancar, ¿le pasa a alguien más?', fuera: true },
        { id: 'k3', autor: 'pixel_verde', hace: '2 h', t: 'Yo empecé con uno que enseña las recetas de fabricación. Va muy bien.' },
      ];
      T.nether.msgs = [
        { id: 'h0', autor: 'mar_gris', hace: '1 d', t: 'Ponte alguna pieza de armadura de oro: así los piglins no te atacan.' },
        { id: 'h1', autor: 'luna_8', hace: '1 d', t: 'Y lleva siempre bloques de sobra para taparte si cae lava.' },
      ];
      T.repe.msgs = [
        { id: 'r0', autor: 'tigre_99', hace: '20 min', t: 'Se me cierra nada más abrirlo, ayudaaa' },
      ];
      const SLUG = { cierra: 'minecraft-se-cierra-al-arrancar', mods: 'que-mod-me-recomendais', nether: 'trucos-nether', repe: 'se-me-cierra-el-minecraft' };
      const orden = ['repe', 'cierra', 'mods', 'nether'];
      let solucion = null, duplicado = false;

      const C = WIN11.web(W, {
        pestanas: [{ url: HOST }],
        sitios: { [HOST]: pagina },
      });
      function pagina(t, cont, C2, ruta) {
        cont.classList.add('w11-foro');
        const cab = el('div', 'w11-web__cab');
        const logo = enlace('⛏ BloqueCraft', () => C2.ir(HOST), 'w11-web__logo');
        cab.append(logo, el('span', 'w11-web__hueco'), avatar('pixelrojo'), el('span', 'w11-web__sub', 'pixelrojo 🛡 moderador'));
        cont.appendChild(cab);
        const k = Object.keys(SLUG).find(x => ruta === '/t/' + SLUG[x]);
        if (k) return tema(k, t, cont);
        t.t = 'BloqueCraft · Comunidad';
        const nav = el('div', 'w11-foro__nav');
        nav.append(el('span', 'w11-foro__pill w11-foro__pill--on', 'Últimos'), el('span', 'w11-foro__pill', 'Categorías'), el('span', 'w11-foro__pill', 'Principales'));
        cont.appendChild(nav);
        const tabla = el('div', 'w11-foro__lista');
        tabla.setAttribute('role', 'table');
        const fc = el('div', 'w11-foro__fila w11-foro__fila--cab');
        fc.setAttribute('role', 'row');
        fc.append(el('span', null, 'Tema'), el('span', 'w11-foro__num', 'Respuestas'), el('span', 'w11-foro__num', 'Actividad'));
        tabla.appendChild(fc);
        orden.forEach(x => {
          const tm = T[x];
          const f = el('div', 'w11-foro__fila');
          f.setAttribute('role', 'row');
          const c = el('span', 'w11-foro__tit');
          if (x === 'repe' && duplicado) c.appendChild(el('span', 'w11-foro__candado', '🔒 '));
          c.appendChild(enlace(tm.titulo, () => C2.ir(HOST + '/t/' + SLUG[x])));
          if (x === 'cierra' && solucion) c.appendChild(el('span', 'w11-foro__resuelto', '☑ Resuelto'));
          const cat = el('span', 'w11-foro__cat w11-foro__cat--' + norm(tm.cat), tm.cat);
          c.append(document.createElement('br'), cat);
          f.append(c, el('span', 'w11-foro__num', String(tm.msgs.length - 1)), el('span', 'w11-foro__num', tm.hace));
          tabla.appendChild(f);
        });
        cont.appendChild(tabla);
      }
      function elegirTema(titulo, excluir, alElegir) {
        let elegido = null;
        C.modal(titulo, caja => {
          const i = document.createElement('input');
          i.type = 'search';
          i.className = 'w11-web__campo';
          i.placeholder = 'Busca el tema por su título';
          i.setAttribute('aria-label', 'Buscar tema');
          const lista = el('div', 'w11-foro__elige');
          const pinta = () => {
            lista.innerHTML = '';
            const q = norm(i.value);
            Object.keys(T).filter(x => x !== excluir && (!q || norm(T[x].titulo).indexOf(q) !== -1)).forEach(x => {
              const l = el('label', 'w11-web__radio');
              const r = document.createElement('input');
              r.type = 'radio';
              r.name = 'tema-destino';
              r.checked = elegido === x;
              r.addEventListener('change', () => { elegido = x; });
              l.append(el('span', null, T[x].titulo), r);
              lista.appendChild(l);
            });
            if (!lista.childNodes.length) lista.appendChild(el('p', 'w11-web__sub', 'Ningún tema se llama así.'));
          };
          i.addEventListener('input', pinta);
          caja.append(i, lista);
          pinta();
        }, [{ t: 'Cancelar' }, { t: 'Aceptar', primario: true, f: () => { if (!elegido) { W.aviso('Elige primero un tema de la lista.', 'cuidado'); return false; } alElegir(elegido); } }]);
      }
      function tema(k, t, cont) {
        const tm = T[k];
        t.t = tm.titulo + ' - BloqueCraft';
        const h = el('div', 'w11-foro__h');
        const ht = el('div');
        ht.appendChild(el('p', 'w11-foro__h1', (k === 'repe' && duplicado ? '🔒 ' : '') + tm.titulo));
        ht.appendChild(el('span', 'w11-foro__cat w11-foro__cat--' + norm(tm.cat), tm.cat));
        const llave = boton2('🔧', 'w11-foro__llave');
        llave.setAttribute('aria-label', 'Acciones de moderador del tema');
        llave.title = 'Acciones de moderador';
        llave.addEventListener('click', () => {
          const r = llave.getBoundingClientRect();
          W.menu(r.right - 230, r.bottom, [
            { t: 'Fijar el tema', f: () => W.aviso('Fijar lo pone el primero de la lista. No es lo que pide la misión.', 'cuidado') },
            { t: 'Cerrar el tema', f: () => { ctx.apunta(`Cerrar «${tm.titulo}» sin decir por qué.`); W.aviso(k === 'repe' ? 'Si solo lo cierras, quien llegue aquí no sabrá dónde está la respuesta. Ciérralo como duplicado del tema original: así enlaza con él.' : 'Este tema no hay que cerrarlo.', 'cuidado'); } },
            { t: 'Cerrar como duplicado…', f: () => elegirTema('Cerrar como duplicado de…', k, x => {
              if (k === 'repe' && x === 'cierra') {
                duplicado = true;
                ctx.cumple(2, '🔧 → Cerrar como duplicado: «¡¡¡SE ME CIERRA EL MINECRAFT!!!» es el mismo problema que «Minecraft se cierra al arrancar», donde ya está la respuesta.');
              } else if (k === 'repe') {
                ctx.falla(`Cerrar el tema repetido como duplicado de «${T[x].titulo}», que habla de otra cosa.`);
                W.aviso('Ese tema habla de otra cosa. ¿Cuál trata del mismo problema?', 'cuidado');
              } else {
                ctx.falla(`Cerrar «${tm.titulo}» como duplicado: no está repetido.`);
                W.aviso('Este tema no está repetido. Busca el que pregunta lo mismo que otro.', 'cuidado');
              }
              C.pintar();
            }) },
            { t: 'Eliminar el tema', f: () => { ctx.falla(`Intentar eliminar «${tm.titulo}».`); W.aviso('Si lo eliminas, tigre_99 no sabrá qué ha pasado. Mejor ciérralo como duplicado: así le lleva a la respuesta.', 'cuidado'); } },
          ]);
        });
        h.append(ht, llave);
        cont.appendChild(h);
        if (k === 'repe' && duplicado) {
          const a = el('div', 'w11-foro__aviso');
          a.append('🔒 Tema cerrado. Es un duplicado de ', enlace(T.cierra.titulo, () => C.ir(HOST + '/t/' + SLUG.cierra)), '.');
          cont.appendChild(a);
        }
        tm.msgs.forEach((m, i) => {
          const p = el('article', 'w11-foro__post' + (solucion === m.id ? ' w11-foro__post--sol' : ''));
          const c = el('div', 'w11-foro__post-cab');
          const n = el('strong', null, m.autor);
          sinTraducir(n);
          c.append(avatar(m.autor), n, el('span', 'w11-web__sub', m.hace));
          if (solucion === m.id) c.appendChild(el('span', 'w11-foro__sello', '☑ Solución'));
          p.appendChild(c);
          p.appendChild(el('p', 'w11-foro__texto', m.t));
          if (i === 0 && k === 'cierra' && solucion) {
            const s = el('div', 'w11-foro__aviso w11-foro__aviso--ok');
            s.append('☑ Resuelto: ', enlace('ver la respuesta de ' + T.cierra.msgs.find(x => x.id === solucion).autor, () => { const x = cont.querySelector('.w11-foro__post--sol'); if (x) x.scrollIntoView({ block: 'center' }); }));
            p.appendChild(s);
          }
          const acc = el('div', 'w11-foro__acc');
          const gusta = boton2('♡', 'w11-foro__ab');
          gusta.setAttribute('aria-label', 'Me gusta');
          gusta.addEventListener('click', () => { gusta.textContent = gusta.textContent === '♡' ? '♥' : '♡'; });
          acc.appendChild(gusta);
          if (i > 0 && T[k].cat === 'Ayuda') {
            const sol = boton2(solucion === m.id ? '☑ Solución' : '☐ Solución', 'w11-foro__ab');
            sol.title = 'Marcar esta respuesta como la solución';
            sol.addEventListener('click', () => {
              if (solucion === m.id) { solucion = null; if (ctx.hecho(1)) ctx.deshace(1); C.pintar(); return; }
              solucion = m.id;
              if (m.id === 'c2') ctx.cumple(1, 'En la respuesta de pixel_verde (actualizar el controlador de la gráfica), ☐ Solución: nube_azul dice que fue eso lo que le funcionó.');
              else {
                if (ctx.hecho(1)) ctx.deshace(1);
                if (m.autor === 'nube_azul') { ctx.apunta('Marcar como solución el «gracias» de nube_azul.'); W.aviso('Ese mensaje es el «gracias»: dice qué funcionó, pero la solución la dio otra persona. Márcala a ella.', 'cuidado'); }
                else { ctx.falla(`Marcar como solución la respuesta de ${m.autor}, que no arregló nada.`); W.aviso('¿Seguro? Lee el último mensaje de nube_azul: dice qué le funcionó.', 'cuidado'); }
              }
              C.pintar();
            });
            acc.appendChild(sol);
          }
          const mas = boton2('⋯', 'w11-foro__ab');
          mas.setAttribute('aria-label', 'Más opciones del mensaje de ' + m.autor);
          mas.addEventListener('click', () => {
            const r = mas.getBoundingClientRect();
            W.menu(r.left - 150, r.bottom, [
              { t: 'Copiar enlace', f: () => W.notificacion('Enlace copiado', HOST + '/t/' + SLUG[k]) },
              { t: 'Responder citando', off: true },
              { sep: true },
              { t: '🔧 Mover a otro tema…', off: i === 0, f: () => elegirTema('Mover el mensaje a un tema existente', k, x => mover(k, m, x)) },
              { t: 'Eliminar', f: () => { ctx.falla(`Intentar borrar el mensaje de ${m.autor}.`); W.aviso('Borrar un mensaje que está bien escrito no es moderar: si está en el sitio equivocado, se mueve.', 'cuidado'); } },
            ]);
          });
          acc.appendChild(mas);
          p.appendChild(acc);
          cont.appendChild(p);
        });
        cont.appendChild(enlace('‹ Todos los temas', () => C.ir(HOST), 'w11-foro__volver'));
      }
      function mover(k, m, dest) {
        if (m.fuera && dest === 'cierra') {
          T[k].msgs.splice(T[k].msgs.indexOf(m), 1);
          T.cierra.msgs.push(Object.assign({}, m, { hace: 'ahora' }));
          ctx.cumple(0, `⋯ → Mover a otro tema: el mensaje de ${m.autor} («se me cierra Minecraft») pasa del tema de los mods a «${T.cierra.titulo}».`);
          W.aviso('Movido: ahora está en el tema donde se habla de ese problema.', 'ok');
          C.ir(HOST + '/t/' + SLUG.cierra);
          return;
        }
        if (m.fuera && dest === 'repe') { W.aviso('Ese tema es el repetido: lo vas a cerrar. Muévelo al tema original.', 'cuidado'); return; }
        if (m.fuera) { ctx.falla(`Mover el mensaje de ${m.autor} a «${T[dest].titulo}».`); W.aviso('Ese tema habla de otra cosa. ¿Cuál trata del mismo problema que el mensaje?', 'cuidado'); return; }
        ctx.falla(`Intentar mover un mensaje que estaba bien (${m.autor}).`);
        W.aviso('Este mensaje está bien donde está: habla de lo mismo que el tema.', 'cuidado');
      }
      void C;
    },
  });

  /* ============================================================
     S3 · Arregla este perfil
     ============================================================ */
  registrarSimulacion('perfil', {
    ventana: 'Windows 11 · Google Chrome',
    mision: [
      'Haz la cuenta privada.',
      'Que las fotos no digan dónde estás.',
      'Que solo te escriban tus seguidores.',
      'Quita el correo y el teléfono del perfil.',
      'Cambia la biografía: dice dónde vives.',
    ],
    final: 'Apunta en tu cuaderno las cinco cosas que cambiaste y por qué es peligrosa una de ellas (pregunta 6).',
    crear(ctx) {
      const W = escritorio(ctx);
      const HOST = 'fotogram.com';
      const BIO0 = 'Vivo en C/ Major 14, 2.º B, Palma · 1.º de FP en el Ramon Llull · Minecraft, música y dibujo 🎨';
      const s = { privada: false, ubic: true, msg: 'todos', datos: true, bio: BIO0, tema: false, sec: 'editar' };
      // ¿la biografía dice dónde vive o dónde está?
      function problemaBio(b) {
        const n = norm(b);
        if (/\bc\/|calle|major|\b\d+ ?,? ?\d*\.? ?º|\bpiso\b|palma/.test(n) || /\b\d{1,3}\b/.test(n.replace(/\d{1,2}:\d{2}/g, ''))) return 'casa';
        if (/llull|instituto|\bies\b|\d{1,2}:\d{2}|de \d+ a \d+/.test(n)) return 'clase';
        return '';
      }
      function cambio(i, bien, texto) {
        if (bien) ctx.cumple(i, texto);
        else if (ctx.hecho(i)) { ctx.deshace(i); ctx.falla('Deshacer: ' + texto.split(':')[0].toLowerCase() + ' vuelve a estar mal.'); }
      }
      const C = WIN11.web(W, {
        pestanas: [{ url: HOST + '/accounts/edit', t: 'Configuración • Fotogram' }, { url: HOST + '/pixelrojo', t: 'pixelrojo • Fotogram' }],
        sitios: { [HOST]: pagina },
      });
      C.activa = 0;
      C.pintar();
      function pagina(t, cont, C2, ruta) {
        cont.classList.add('w11-fg');
        if (ruta.indexOf('/accounts') === 0) return ajustes(t, cont);
        return perfil(t, cont);
      }
      function perfil(t, cont) {
        t.t = 'pixelrojo • Fotogram';
        const aviso = el('p', 'w11-fg__como', 'Estás viendo tu perfil como lo ve alguien que no te sigue.');
        cont.appendChild(aviso);
        const cab = el('div', 'w11-fg__cab');
        const av = el('span', 'w11-fg__avatar', 'P');
        const d = el('div', 'w11-fg__datos');
        const n = el('p', 'w11-fg__nombre');
        n.append(sinTraducir(el('strong', null, 'pixelrojo')), document.createTextNode(s.privada ? '  🔒' : ''));
        d.appendChild(n);
        d.appendChild(el('p', 'w11-fg__cuenta', '3 publicaciones · 212 seguidores · 180 seguidos'));
        d.appendChild(el('p', 'w11-fg__bio', s.bio));
        if (s.datos) d.appendChild(sinTraducir(el('p', 'w11-fg__contacto', '✉ pixelrojo@correo.es · ☎ 600 000 000')));
        const b = el('div', 'w11-fg__botones');
        b.appendChild(boton2('Seguir', 'w11-web__btn--primario', () => W.aviso('Es tu propio perfil, visto desde fuera.', 'cuidado')));
        if (s.msg === 'todos') b.appendChild(boton2('Enviar mensaje', null, () => W.aviso('Cualquiera, aunque no te conozca, te puede escribir.', 'cuidado')));
        d.appendChild(b);
        cab.append(av, d);
        cont.appendChild(cab);
        if (s.privada) {
          const c = el('div', 'w11-fg__privada');
          c.append(el('p', 'w11-fg__candado', '🔒'), el('p', null, 'Esta cuenta es privada'), el('p', 'w11-web__sub', 'Síguela para ver sus fotos y vídeos.'));
          cont.appendChild(c);
          return;
        }
        const fotos = el('div', 'w11-fg__fotos');
        ['🏞️', '🎨', '🎧'].forEach(e => {
          const f = el('div', 'w11-fg__foto');
          f.appendChild(el('span', 'w11-fg__foto-ico', e));
          if (s.ubic) f.appendChild(el('span', 'w11-fg__ubic', '📍 Palma, plaza Major'));
          fotos.appendChild(f);
        });
        cont.appendChild(fotos);
      }
      function ajustes(t, cont) {
        t.t = 'Configuración • Fotogram';
        const caja = el('div', 'w11-fg__ajustes');
        const nav = el('nav', 'w11-fg__nav');
        nav.appendChild(el('p', 'w11-fg__nav-t', 'Configuración'));
        [['editar', 'Editar perfil'], ['privacidad', 'Privacidad de la cuenta'], ['mensajes', 'Mensajes'], ['publicaciones', 'Publicaciones'], ['pantalla', 'Pantalla']].forEach(([k, n]) => {
          const b = boton(n, 'w11-fg__ni' + (s.sec === k ? ' w11-fg__ni--on' : ''));
          b.addEventListener('click', () => { s.sec = k; C.pintar(); });
          nav.appendChild(b);
        });
        const pag = el('div', 'w11-fg__pag');
        caja.append(nav, pag);
        cont.appendChild(caja);
        if (s.sec === 'editar') {
          pag.appendChild(el('p', 'w11-fg__h', 'Editar perfil'));
          const fila = el('div', 'w11-fg__yo');
          fila.append(el('span', 'w11-fg__avatar w11-fg__avatar--peq', 'P'), sinTraducir(el('strong', null, 'pixelrojo')));
          pag.appendChild(fila);
          const lb = el('label', 'w11-fg__campo');
          lb.appendChild(el('span', 'w11-fg__etq', 'Presentación'));
          const ta = document.createElement('textarea');
          ta.className = 'w11-web__campo w11-fg__bio-edit';
          ta.maxLength = 150;
          ta.value = s.bio;
          ta.spellcheck = false;
          const cuenta = el('span', 'w11-web__sub', ta.value.length + ' / 150');
          ta.addEventListener('input', () => { cuenta.textContent = ta.value.length + ' / 150'; });
          lb.append(ta, cuenta);
          pag.appendChild(lb);
          pag.appendChild(interruptor('Mostrar el correo y el teléfono en el perfil', 'Cualquiera que vea tu perfil los podrá ver.', s.datos, v => {
            s.datos = v;
            cambio(3, !v, 'Editar perfil → «Mostrar el correo y el teléfono»: desactivado.');
          }));
          const env = boton2('Enviar', 'w11-web__btn--primario', () => {
            s.bio = ta.value.trim();
            const p = problemaBio(s.bio);
            if (p === 'casa') { cambio(4, false, 'Biografía: sin dirección ni horarios.'); W.aviso('Guardada, pero todavía dice dónde vives (la calle, el número o la ciudad). Bórralo.', 'cuidado'); }
            else if (p === 'clase') { cambio(4, false, 'Biografía: sin dirección ni horarios.'); W.aviso('Guardada, pero dice en qué instituto estás o a qué hora sales. Con eso te pueden encontrar.', 'cuidado'); }
            else { cambio(4, true, `Editar perfil → Presentación: «${s.bio || '(vacía)'}». Ya no dice dónde vives ni dónde estudias.`); W.notificacion('Fotogram', 'Perfil guardado.'); }
            ctx.apunta('Guardar la presentación: «' + s.bio + '».');
          });
          pag.appendChild(env);
          pag.appendChild(el('p', 'w11-web__sub', 'La presentación (biografía) se cambia al pulsar «Enviar».'));
        } else if (s.sec === 'privacidad') {
          pag.appendChild(el('p', 'w11-fg__h', 'Privacidad de la cuenta'));
          pag.appendChild(interruptor('Cuenta privada', 'Si es privada, solo las personas que apruebes podrán ver tus fotos y vídeos.', s.privada, v => {
            s.privada = v;
            cambio(0, v, 'Privacidad de la cuenta → Cuenta privada: activada. Solo te ven los seguidores que apruebas.');
          }));
        } else if (s.sec === 'mensajes') {
          pag.appendChild(el('p', 'w11-fg__h', 'Mensajes'));
          pag.appendChild(el('p', 'w11-fg__etq', '¿Quién puede enviarte solicitudes de mensajes?'));
          pag.appendChild(radios('fg-msg', [['todos', 'Todo el mundo en Fotogram'], ['seguidores', 'Solo tus seguidores'], ['nadie', 'Nadie']], s.msg, v => {
            s.msg = v;
            if (v === 'nadie') W.aviso('Así no te podrían escribir ni tus amigos. La misión pide «solo seguidores».', 'cuidado');
            cambio(2, v === 'seguidores', 'Mensajes → Solo tus seguidores.');
          }));
        } else if (s.sec === 'publicaciones') {
          pag.appendChild(el('p', 'w11-fg__h', 'Publicaciones'));
          pag.appendChild(interruptor('Añadir mi ubicación a las fotos', 'Fotogram pone en cada foto el sitio donde la hiciste.', s.ubic, v => {
            s.ubic = v;
            cambio(1, !v, 'Publicaciones → «Añadir mi ubicación a las fotos»: desactivado.');
          }));
        } else {
          pag.appendChild(el('p', 'w11-fg__h', 'Pantalla'));
          pag.appendChild(interruptor('Modo oscuro', null, s.tema, v => {
            s.tema = v;
            W.aviso('El modo oscuro solo cambia los colores: no tiene nada que ver con tu privacidad.', 'cuidado');
          }));
        }
        const ver = boton2('👁 Ver mi perfil como público', 'w11-fg__ver', () => { C.activa = 1; C.pintar(); });
        pag.appendChild(ver);
      }
    },
  });

  /* ============================================================
     S3 · Comparte bien
     ============================================================ */
  const DOM = 'iesramonllull.net';
  const PIDE = [
    'que lo editen Ana y Leo, y nadie más',
    'que toda la gente del instituto las vea, sin cambiarlas',
    'que no lo vea nadie más que tú',
    'que Leo pueda comentar, pero no cambiar nada',
  ];
  registrarSimulacion('compartir', {
    ventana: 'Windows 11 · Google Chrome',
    mision: ['trabajo-grupo', 'fotos-excursion', 'dni-escaneado', 'apuntes-u3'].map((n, i) => `${n}: ${PIDE[i]}.`),
    final: 'Apunta en tu cuaderno cómo dejaste compartido cada uno de los cuatro archivos y por qué (pregunta 14).',
    crear(ctx) {
      const W = escritorio(ctx);
      const ic = WIN11.icono;
      const ARCH = [
        { n: 'trabajo-grupo', i: 'word', tipo: 'Documento', general: 'enlace', rolG: 'editor', gente: [] },
        { n: 'fotos-excursion', i: 'carpeta', tipo: 'Carpeta', general: 'dominio', rolG: 'editor', gente: [] },
        { n: 'dni-escaneado.pdf', i: 'pdf', tipo: 'PDF', general: 'enlace', rolG: 'lector', gente: [] },
        { n: 'apuntes-u3', i: 'word', tipo: 'Documento', general: 'restringido', rolG: 'lector', gente: [['leo', 'editor']] },
      ];
      const PERSONAS = { ana: 'Ana Ruiz', leo: 'Leo Martín', mar: 'Mar Torres' };
      const ROLES = [['lector', 'Lector'], ['comentador', 'Comentador'], ['editor', 'Editor']];
      const rol = (a, q) => (a.gente.find(g => g[0] === q) || [])[1];
      const COMPRUEBA = [
        a => a.general === 'restringido' && rol(a, 'ana') === 'editor' && rol(a, 'leo') === 'editor' && a.gente.length === 2,
        a => a.general === 'dominio' && a.rolG === 'lector',
        a => a.general === 'restringido' && a.gente.length === 0,
        a => a.general === 'restringido' && rol(a, 'leo') === 'comentador' && a.gente.length === 1,
      ];
      function describir(a) {
        const g = a.general === 'restringido' ? 'acceso restringido' : (a.general === 'dominio' ? `todo ${DOM}` : 'cualquiera con el enlace') + ' como ' + a.rolG;
        const p = a.gente.map(([q, r]) => `${q} (${r})`).join(', ');
        return g + (p ? '; ' + p : '');
      }
      let sel = -1;
      const C = WIN11.web(W, {
        pestanas: [{ url: 'drive.google.com/drive/my-drive' }],
        sitios: { 'drive.google.com': pagina },
      });
      function pagina(t, cont) {
        t.t = 'Mi unidad - Google Drive';
        cont.classList.add('w11-drive');
        const bar = el('div', 'w11-drive__bar');
        bar.append(boton2('+ Nuevo', 'w11-mail__redactar', () => W.aviso('Hoy no hace falta crear nada: comparte bien lo que ya hay.', 'cuidado')), el('p', 'w11-drive__migas', 'Mi unidad'));
        cont.appendChild(bar);
        const tabla = el('div', 'w11-gd');
        tabla.setAttribute('role', 'table');
        const cab = el('div', 'w11-gd__fila w11-gd__fila--cab');
        cab.append(el('span', null, 'Nombre'), el('span', 'w11-gd__c', 'Propietario'), el('span', 'w11-gd__c', 'Compartido'), el('span', 'w11-gd__acc', ''));
        tabla.appendChild(cab);
        ARCH.forEach((a, k) => {
          const f = el('div', 'w11-gd__fila' + (sel === k ? ' w11-gd__fila--sel' : ''));
          f.setAttribute('role', 'row');
          f.tabIndex = 0;
          const n = el('span', 'w11-gd__n');
          n.append(ic(a.i), sinTraducir(el('span', null, a.n)));
          if (a.general !== 'restringido' || a.gente.length) n.appendChild(el('span', 'w11-gd__comp', '👥'));
          const comp = a.general === 'enlace' ? 'Cualquiera con el enlace' : a.general === 'dominio' ? 'IES Ramon Llull' : a.gente.length ? a.gente.length + ' persona' + (a.gente.length > 1 ? 's' : '') : 'Solo tú';
          const acc = boton2('👤+', 'w11-gd__share');
          acc.setAttribute('aria-label', 'Compartir ' + a.n);
          acc.title = 'Compartir';
          acc.addEventListener('click', e => { e.stopPropagation(); compartir(k); });
          f.append(n, el('span', 'w11-gd__c', 'yo'), el('span', 'w11-gd__c', comp), acc);
          f.addEventListener('click', () => { sel = k; C.pintar(); });
          f.addEventListener('dblclick', () => W.aviso(a.tipo === 'Carpeta' ? 'Para compartir no hace falta entrar: clic derecho → Compartir.' : 'Para compartirlo no hace falta abrirlo: clic derecho → Compartir.', 'cuidado'));
          f.addEventListener('contextmenu', e => {
            e.preventDefault();
            sel = k;
            C.pintar();
            W.menu(e.clientX, e.clientY, [
              { t: 'Abrir con', off: true },
              { sep: true },
              { t: 'Descargar', off: true },
              { t: 'Cambiar nombre', off: true },
              { t: 'Hacer una copia', off: true },
              { sep: true },
              { t: 'Compartir', sub: [
                { t: 'Compartir', f: () => compartir(k) },
                { t: 'Copiar enlace', f: () => { ctx.apunta(`Copiar el enlace de ${a.n} (${describir(a)}).`); W.notificacion('Enlace copiado', a.general === 'restringido' ? 'Solo lo podrán abrir las personas con acceso.' : 'Lo podrá abrir ' + (a.general === 'dominio' ? 'cualquiera del instituto.' : 'cualquiera que tenga el enlace.')); } },
              ] },
              { t: 'Información del archivo', off: true },
              { sep: true },
              { t: 'Mover a la papelera', f: () => W.aviso('Borrarlo no es compartirlo bien: déjalo compartido como pide la misión.', 'cuidado') },
            ]);
          });
          f.addEventListener('keydown', e => { if (e.key === 'Enter') compartir(k); });
          tabla.appendChild(f);
        });
        cont.appendChild(tabla);
        cont.appendChild(el('p', 'w11-web__sub', 'Clic derecho en un archivo → Compartir, o el botón 👤+ de su fila.'));
      }
      function compartir(k) {
        const a = ARCH[k];
        const copia = JSON.parse(JSON.stringify({ general: a.general, rolG: a.rolG, gente: a.gente }));
        let nuevos = [];
        C.modal(`Compartir «${a.n}»`, caja => {
          const pinta = () => {
            caja.innerHTML = '';
            // añadir personas
            const add = el('div', 'w11-share__add');
            const i = document.createElement('input');
            i.className = 'w11-web__campo';
            i.placeholder = 'Añadir personas, grupos o eventos de calendario';
            i.setAttribute('aria-label', 'Añadir personas');
            i.spellcheck = false;
            const sug = el('div', 'w11-share__sug');
            const sugerir = () => {
              sug.innerHTML = '';
              const q = norm(i.value);
              if (!q) return;
              Object.keys(PERSONAS).filter(p => !rol(copia, p) && nuevos.indexOf(p) === -1 && (norm(PERSONAS[p]).indexOf(q) !== -1 || (p + '@' + DOM).indexOf(q) !== -1)).forEach(p => {
                const b = boton('', 'w11-share__s');
                b.append(avatar(p), el('span', null, PERSONAS[p]), sinTraducir(el('span', 'w11-web__sub', p + '@' + DOM)));
                b.addEventListener('click', () => { nuevos.push(p); pinta(); });
                sug.appendChild(b);
              });
              if (!sug.childNodes.length) sug.appendChild(el('p', 'w11-web__sub', 'Nadie del instituto se llama así.'));
            };
            i.addEventListener('input', sugerir);
            add.append(i, sug);
            caja.appendChild(add);
            if (nuevos.length) {
              const chips = el('div', 'w11-share__chips');
              nuevos.forEach(p => {
                const c = el('span', 'w11-share__chip');
                c.appendChild(sinTraducir(el('span', null, p + '@' + DOM)));
                const x = boton('×', 'w11-share__x');
                x.setAttribute('aria-label', 'Quitar ' + p);
                x.addEventListener('click', () => { nuevos = nuevos.filter(y => y !== p); pinta(); });
                c.appendChild(x);
                chips.appendChild(c);
              });
              const rN = desplegable(ROLES, caja.dataset.rolN || 'editor', 'Permiso de las personas nuevas', v => { caja.dataset.rolN = v; });
              chips.appendChild(rN);
              caja.appendChild(chips);
              const env = boton2('Enviar', 'w11-web__btn--primario', () => {
                const r = caja.dataset.rolN || 'editor';
                nuevos.forEach(p => copia.gente.push([p, r]));
                ctx.apunta(`${a.n}: añadir a ${nuevos.join(' y ')} como ${r}.`);
                nuevos = [];
                pinta();
              });
              caja.appendChild(env);
              return;
            }
            caja.appendChild(el('p', 'w11-share__h', 'Personas con acceso'));
            const lista = el('div', 'w11-share__lista');
            const fila = (q, r) => {
              const f = el('div', 'w11-share__p');
              f.appendChild(avatar(q));
              const d = el('span', 'w11-share__pd');
              d.append(el('span', null, q === 'yo' ? 'pixelrojo (tú)' : PERSONAS[q]), sinTraducir(el('span', 'w11-web__sub', (q === 'yo' ? 'pixelrojo' : q) + '@' + DOM)));
              f.appendChild(d);
              if (q === 'yo') f.appendChild(el('span', 'w11-web__sub', 'Propietario'));
              else f.appendChild(desplegable(ROLES.concat([['quitar', 'Quitar acceso']]), r, 'Permiso de ' + PERSONAS[q], v => {
                if (v === 'quitar') copia.gente = copia.gente.filter(g => g[0] !== q);
                else copia.gente.find(g => g[0] === q)[1] = v;
                pinta();
              }));
              lista.appendChild(f);
            };
            fila('yo');
            copia.gente.forEach(([q, r]) => fila(q, r));
            caja.appendChild(lista);
            caja.appendChild(el('p', 'w11-share__h', 'Acceso general'));
            const g = el('div', 'w11-share__g');
            g.appendChild(el('span', 'w11-share__gi', copia.general === 'restringido' ? '🔒' : copia.general === 'dominio' ? '🏫' : '🌐'));
            const gd = el('div', 'w11-share__gd');
            gd.appendChild(desplegable([['restringido', 'Restringido'], ['dominio', 'IES Ramon Llull'], ['enlace', 'Cualquier persona con el enlace']], copia.general, 'Acceso general', v => { copia.general = v; pinta(); }));
            gd.appendChild(el('span', 'w11-web__sub', copia.general === 'restringido' ? 'Solo pueden abrirlo con este enlace las personas que tienen acceso' : copia.general === 'dominio' ? 'Cualquier persona de este grupo que tenga el enlace puede acceder' : 'Cualquier persona de Internet que tenga el enlace puede acceder'));
            g.appendChild(gd);
            if (copia.general !== 'restringido') g.appendChild(desplegable(ROLES, copia.rolG, 'Permiso del acceso general', v => { copia.rolG = v; }));
            caja.appendChild(g);
          };
          pinta();
        }, [
          { t: '🔗 Copiar enlace', f: () => { W.notificacion('Enlace copiado', ''); return false; } },
          { t: 'Hecho', primario: true, f: () => {
            if (nuevos.length) { W.aviso('Has escrito personas pero no has pulsado «Enviar»: no se han añadido.', 'cuidado'); return false; }
            Object.assign(a, copia);
            if (COMPRUEBA[k](a)) { ctx.cumple(k, `${a.n}: ${describir(a)}.`); W.aviso(`${a.n}: compartido como pide.`, 'ok'); }
            else {
              if (ctx.hecho(k)) ctx.deshace(k);
              ctx.falla(`${a.n}: ${describir(a)} (no es lo que pide).`);
              W.aviso(`${a.n}: todavía no está como pide la misión. Mira quién tiene acceso, con qué permiso, y el acceso general.`, 'cuidado');
            }
            C.pintar();
          } },
        ]);
      }
    },
  });

  /* ============================================================
     Una wiki tipo Wikipedia (MediaWiki) para las dos de la S4
     ============================================================ */
  function cabWiki(cont, ir, host, art, pest, alPest) {
    const c = el('div', 'w11-wiki__cab');
    const logo = enlace('📖 Wiki de clase', () => ir(host), 'w11-wiki__logo');
    c.append(logo, el('span', 'w11-web__hueco'), el('span', 'w11-web__sub', '👤 pixelrojo'));
    cont.appendChild(c);
    if (!art) return;
    const t = el('div', 'w11-wiki__tabs');
    const izq = el('div', 'w11-wiki__tg');
    izq.append(el('span', 'w11-wiki__tab w11-wiki__tab--on', 'Artículo'), el('span', 'w11-wiki__tab', 'Discusión'));
    const der = el('div', 'w11-wiki__tg');
    [['leer', 'Leer'], ['editar', 'Editar'], ['historial', 'Ver historial']].forEach(([k, n]) => {
      const a = enlace(n, () => alPest(k), 'w11-wiki__tab' + (pest === k ? ' w11-wiki__tab--on' : ''));
      der.appendChild(a);
    });
    t.append(izq, der);
    cont.appendChild(t);
  }
  function diffWiki(a, b) {
    const box = el('table', 'w11-wiki__diff');
    const tb = el('tbody');
    const quitado = a.filter(p => b.indexOf(p) === -1), puesto = b.filter(p => a.indexOf(p) === -1);
    const n = Math.max(quitado.length, puesto.length);
    const cab = el('tr');
    cab.append(el('th', null, 'Versión de antes'), el('th', null, 'Versión de después'));
    tb.appendChild(cab);
    for (let i = 0; i < n; i++) {
      const tr = el('tr');
      const x = el('td', quitado[i] ? 'w11-wiki__del' : null, quitado[i] ? '− ' + quitado[i] : '');
      const y = el('td', puesto[i] ? 'w11-wiki__ins' : null, puesto[i] ? '+ ' + puesto[i] : '');
      tr.append(x, y);
      tb.appendChild(tr);
    }
    if (!n) { const tr = el('tr'); const td = el('td', null, 'Sin cambios en el texto.'); td.colSpan = 2; tr.appendChild(td); tb.appendChild(tr); }
    box.appendChild(tb);
    return box;
  }
  function filaHist(v, prev, ult, op) {
    const li = el('li', 'w11-wiki__hf');
    const r = (t, f) => f ? enlace(t, f) : el('span', 'w11-web__sub', t);
    li.append('(', r('act', ult ? null : op.act), ' | ', r('ant', prev ? op.ant : null), ') ');
    li.append(enlace(v.cuando, op.ver), ' ');
    const q = sinTraducir(el('strong', 'w11-wiki__quien', v.quien));
    li.append(q, ' ');
    const bytes = v.bytes > 0 ? '+' + v.bytes : String(v.bytes);
    li.appendChild(el('span', 'w11-wiki__bytes ' + (v.bytes < 0 ? 'w11-wiki__bytes--menos' : 'w11-wiki__bytes--mas'), '(' + bytes + ')'));
    li.append(' . . ', el('em', null, v.que ? '(' + v.que + ')' : '(sin resumen)'));
    if (op.deshacer) li.append(' (', enlace('deshacer', op.deshacer), ')');
    return li;
  }

  /* ============================================================
     S4 · Salva la wiki
     ============================================================ */
  registrarSimulacion('wiki', {
    ventana: 'Windows 11 · Google Chrome',
    mision: [
      'Encuentra en el historial la versión que estropeó el artículo.',
      'Arréglalo sin perder los cambios buenos que vinieron después.',
      'Explica en el resumen de edición qué has hecho.',
    ],
    final: 'Apunta en tu cuaderno qué versión estropeó el artículo, quién la hizo, qué cambió y por qué no bastaba con volver a la versión anterior (pregunta 9).',
    crear(ctx) {
      const W = escritorio(ctx);
      const HOST = 'wiki.iesramonllull.net';
      const URL = HOST + '/wiki/Blogs';
      const P1 = 'Un blog publica entradas con fecha. La más nueva sale arriba.';
      const P2 = 'Ejemplo: Xataka es un blog de tecnología.';
      const P3 = 'Muchos blogs dejan comentarios debajo de cada entrada.';
      const MALO = 'los blogs son una tontería y nadie los lee jajaja';
      const P4 = 'Para saber más: Microsiervos, un blog de curiosidades.';
      const V = [
        { n: 1, cuando: '18:05 2 nov 2026', quien: 'ana_k', que: 'Creo el artículo', texto: [P1], bytes: 62 },
        { n: 2, cuando: '18:20 2 nov 2026', quien: 'leo_m', que: 'Añado un ejemplo', texto: [P1, P2], bytes: 42 },
        { n: 3, cuando: '17:12 5 nov 2026', quien: 'mar_t', que: 'Añado los comentarios', texto: [P1, P2, P3], bytes: 56 },
        { n: 4, cuando: '23:47 9 nov 2026', quien: '83.45.12.7', que: '', texto: [P1, MALO], bytes: -50 },
        { n: 5, cuando: '10:31 12 nov 2026', quien: 'pau_r', que: 'Añado un enlace', texto: [P1, MALO, P4], bytes: 56 },
      ];
      let actual = V[4].texto.slice(), arreglado = false, vista = { p: 'leer' };
      const C = WIN11.web(W, { pestanas: [{ url: URL }], sitios: { [HOST]: pagina } });
      function ir(p) { vista = p; C.pintar(); }
      const ver = v => () => {
        if (v.n === 4) ctx.cumple(0, `Historial → (ant) de la versión de las ${v.cuando.split(' ')[0]} del 9 nov: la hizo 83.45.12.7 (sin cuenta), sin resumen y con −50 bytes. Quitó el ejemplo y los comentarios y escribió una tontería.`);
        ir({ p: 'diff', n: v.n });
      };
      function pagina(t, cont) {
        cont.classList.add('w11-wiki');
        t.t = 'Blogs - Wiki de clase';
        cabWiki(cont, u => C.ir(u), HOST, true, vista.p === 'diff' || vista.p === 'vieja' ? 'historial' : vista.p, k => ir({ p: k }));
        const main = el('div', 'w11-wiki__main');
        cont.appendChild(main);
        if (vista.p === 'leer') {
          main.appendChild(el('p', 'w11-wiki__h1', 'Blogs'));
          main.appendChild(el('p', 'w11-web__sub', 'De Wiki de clase'));
          actual.forEach(p => main.appendChild(el('p', null, p)));
          return;
        }
        if (vista.p === 'editar') {
          main.appendChild(el('p', 'w11-wiki__h1', 'Editando «Blogs»'));
          main.appendChild(el('p', 'w11-wiki__nota', 'Para arreglar lo que hizo una sola versión sin perder lo de después, no hace falta escribirlo todo otra vez: en el historial, cada versión tiene su enlace «deshacer».'));
          const ta = document.createElement('textarea');
          ta.className = 'w11-web__campo w11-wiki__ta';
          ta.value = actual.join('\n\n');
          ta.setAttribute('aria-label', 'Texto del artículo');
          main.appendChild(ta);
          main.appendChild(boton2('Cancelar', null, () => ir({ p: 'leer' })));
          ta.addEventListener('input', () => { ta.dataset.tocado = '1'; });
          main.appendChild(boton2('Guardar cambios', 'w11-web__btn--primario', () => W.aviso('Aquí tendrías que reescribir de memoria lo que se borró. Mejor usa «deshacer» en la versión mala del historial.', 'cuidado')));
          return;
        }
        if (vista.p === 'historial') {
          main.appendChild(el('p', 'w11-wiki__h1', 'Blogs: historial de revisiones'));
          main.appendChild(el('p', 'w11-wiki__nota', 'Lo más nuevo, arriba. (act) = diferencias con la versión actual; (ant) = diferencias con la versión anterior. Pulsa la fecha para ver cómo era el artículo.'));
          const ul = el('ul', 'w11-wiki__hist');
          V.slice().reverse().forEach((v, i) => {
            const ult = i === 0;
            ul.appendChild(filaHist(v, v.n > 1, ult, {
              act: () => ir({ p: 'diff', n: v.n, con: 'act' }),
              ant: ver(v),
              ver: () => ir({ p: 'vieja', n: v.n }),
              deshacer: v.n > 1 && !(arreglado && v.n === 4) ? () => deshacer(v) : null,
            }));
          });
          main.appendChild(ul);
          return;
        }
        if (vista.p === 'diff') {
          const v = V[vista.n - 1];
          const a = vista.con === 'act' ? v.texto : (vista.n > 1 ? V[vista.n - 2].texto : []);
          const b = vista.con === 'act' ? V[V.length - 1].texto : v.texto;
          main.appendChild(el('p', 'w11-wiki__h1', 'Blogs: diferencias entre revisiones'));
          const cab = el('p', 'w11-wiki__nota');
          cab.append(vista.con === 'act' ? `Desde la versión de ${v.cuando} hasta la actual.` : 'Cambios de la versión de ', vista.con === 'act' ? '' : sinTraducir(el('strong', null, v.quien)), vista.con === 'act' ? '' : ` (${v.cuando}). Resumen: ${v.que || '(sin resumen)'}.`);
          main.appendChild(cab);
          main.appendChild(diffWiki(a, b));
          const f = el('p');
          f.appendChild(enlace('‹ Volver al historial', () => ir({ p: 'historial' })));
          if (vista.con !== 'act' && vista.n > 1 && !(arreglado && v.n === 4)) f.append('  ·  ', enlace('deshacer esta versión', () => deshacer(v)));
          main.appendChild(f);
          return;
        }
        if (vista.p === 'vieja') {
          const v = V[vista.n - 1];
          main.appendChild(el('p', 'w11-wiki__h1', 'Blogs'));
          const n = el('div', 'w11-wiki__vieja');
          n.append(`Esta es una versión antigua de esta página, editada por ${v.quien} el ${v.cuando}. Puede ser muy distinta de la versión actual.`);
          main.appendChild(n);
          v.texto.forEach(p => main.appendChild(el('p', null, p)));
          if (v.n < V.length) main.appendChild(boton2('Restaurar esta versión', null, () => {
            if (v.n === 3) { ctx.falla('Restaurar la versión del 5 nov (mar_t): se perdería el enlace bueno de pau_r.'); W.aviso('Si vuelves a esta versión, también pierdes el enlace que añadió pau_r después, que estaba bien. Mejor deshaz solo la versión mala.', 'cuidado'); }
            else if (v.n === 4) W.aviso('Esta es la versión estropeada: restaurarla no arregla nada.', 'cuidado');
            else if (v.n === 5) W.aviso('Esta ya es la versión actual.', 'cuidado');
            else W.aviso('Es todavía más antigua: perderías más cambios buenos. Busca la versión que estropeó el artículo y deshaz solo esa.', 'cuidado');
          }));
          main.appendChild(enlace('‹ Volver al historial', () => ir({ p: 'historial' })));
          return;
        }
        if (vista.p === 'deshacer') {
          main.appendChild(el('p', 'w11-wiki__h1', 'Editando «Blogs» (deshacer)'));
          main.appendChild(el('p', 'w11-wiki__nota', 'Se puede deshacer la edición. Comprueba las diferencias de abajo y, si es lo que quieres, guarda los cambios.'));
          const nuevo = [P1, P2, P3, P4];
          main.appendChild(diffWiki(actual, nuevo));
          const l = el('label', 'w11-wiki__resumen');
          l.appendChild(el('span', null, 'Resumen:'));
          const i = document.createElement('input');
          i.className = 'w11-web__campo';
          i.spellcheck = false;
          i.maxLength = 200;
          i.setAttribute('aria-label', 'Resumen de edición');
          l.appendChild(i);
          main.appendChild(l);
          main.appendChild(el('p', 'w11-web__sub', 'El resumen lo verán los demás en el historial: di qué has hecho y por qué.'));
          const f = el('div', 'w11-wiki__botones');
          f.append(boton2('Guardar cambios', 'w11-web__btn--primario', () => {
            const r = i.value.trim(), n = norm(r);
            if (r.length < 8 || ['cambios', 'cambio', 'arreglo', 'arreglado', 'edito'].indexOf(n) !== -1) { W.aviso('Escribe un resumen que se entienda: qué versión deshaces y por qué (por ejemplo, que era vandalismo).', 'cuidado'); i.focus(); return; }
            actual = nuevo;
            arreglado = true;
            V.push({ n: 6, cuando: '16:05 16 nov 2026', quien: 'pixelrojo', que: r, texto: nuevo.slice(), bytes: 98 });
            ctx.cumple(1, 'Historial → «deshacer» en la versión de 83.45.12.7: vuelven el ejemplo y los comentarios, y se queda el enlace de pau_r.');
            ctx.cumple(2, `Resumen de edición: «${r}». Queda como la versión más nueva del historial.`);
            ir({ p: 'leer' });
            W.notificacion('Wiki de clase', 'Se ha guardado tu edición.');
          }), boton2('Cancelar', null, () => ir({ p: 'historial' })));
          main.appendChild(f);
        }
      }
      function deshacer(v) {
        if (v.n === 4) { ir({ p: 'deshacer' }); return; }
        if (v.n === 5) { ctx.falla('Deshacer la edición de pau_r, que estaba bien.'); W.aviso('Esa es la de pau_r: añadió un enlace que estaba bien. ¿Qué versión estropeó el artículo?', 'cuidado'); return; }
        if (v.n === 6) { W.aviso('Esa es tu propia edición.', 'cuidado'); return; }
        W.aviso('No se ha podido deshacer: ese trozo lo cambiaron versiones posteriores. Busca la versión que estropeó el artículo.', 'cuidado');
        ctx.apunta(`Deshacer la versión de ${v.quien}: no se puede (conflicto con versiones posteriores).`);
      }
    },
  });

  /* ============================================================
     S4 · Escribe en la wiki (27/10/2026; real desde el 16/11/2026)
     ============================================================ */
  registrarSimulacion('wiki-escribe', {
    ventana: 'Windows 11 · Google Chrome',
    mision: [
      'Busca el artículo que está a medio hacer (esbozo) y ábrelo.',
      'Añade el ejemplo de tus apuntes en la sección que toca, sin borrar lo que escribieron otros.',
      'Guarda con un resumen de edición que diga qué has añadido.',
      'Busca tu cambio en el historial y mira qué datos guarda.',
    ],
    final: 'Apunta en tu cuaderno qué artículo completaste, qué añadiste y en qué sección, y qué datos guarda el historial de tu cambio (pregunta 8).',
    crear(ctx) {
      const W = escritorio(ctx);
      const HOST = 'wiki.iesramonllull.net';
      const SEC = [['que', 'Qué es'], ['ejemplo', 'Ejemplo'], ['mas', 'Para saber más']];
      const Q1 = 'El RSS avisa de lo nuevo que publica una web, sin tener que entrar a mirarla.';
      const Q2 = 'El RSS avisa de lo nuevo que publica una web, sin tener que entrar a mirarla cada día.';
      const E1 = 'Muchos blogs y periódicos tienen RSS.';
      const TUYO = 'Con un lector RSS, como Feedly, sigo cinco blogs y veo sus entradas nuevas en un solo sitio.';
      const NUBE = 'La nube guarda tus archivos en servidores de Internet y los ves desde cualquier sitio.';
      const OPINION = '¡¡El RSS es lo mejor de Internet y todo el mundo debería usarlo!!';
      const M1 = 'Al RSS también se le llama sindicación.';
      const OTROS = {
        Foros: ['Un foro ordena los mensajes por temas. Cada tema empieza con una pregunta y debajo van las respuestas.'],
        Blogs: ['Un blog publica entradas con fecha. La más nueva sale arriba.', 'Muchos blogs dejan comentarios debajo de cada entrada.'],
        Wikis: ['Una wiki la escriben muchas personas. Todo cambio queda en el historial y se puede deshacer.'],
        'Redes sociales': ['En una red social cada persona tiene su perfil y comparte fotos, vídeos y mensajes con sus seguidores.'],
        'La nube': ['La nube guarda tus archivos en servidores de Internet. Los puedes abrir desde cualquier dispositivo con conexión.'],
      };
      const copia = a => ({ que: a.que.slice(), ejemplo: a.ejemplo.slice(), mas: a.mas.slice() });
      const tam = a => SEC.reduce((s, [k]) => s + a[k].join('').length, 0);
      const V = [
        { n: 1, cuando: '17:05 10 oct 2026', quien: 'ana_k', que: 'Creo el artículo', a: { que: [Q1], ejemplo: [], mas: [] } },
        { n: 2, cuando: '17:20 10 oct 2026', quien: 'leo_m', que: 'Empiezo el ejemplo y añado «Para saber más»', a: { que: [Q1], ejemplo: [E1], mas: [M1] } },
      ];
      V.forEach((v, i) => { v.bytes = tam(v.a) - (i ? tam(V[i - 1].a) : 0); });
      let actual = copia(V[1].a), guardado = false, vista = { p: 'portada' };
      const C = WIN11.web(W, { pestanas: [{ url: HOST }], sitios: { [HOST]: pagina } });
      // Tus apuntes, en el Bloc de notas
      const bloc = W.abrirApp('bloc', { texto: 'Apuntes U3 - RSS y la nube\r\n\r\nEjemplo de RSS:\r\n' + TUYO + '\r\n\r\nLa nube:\r\n' + NUBE + '\r\n\r\nLo que dijo Leo en clase:\r\n' + OPINION + '\r\n' });
      if (bloc) { bloc.titulo('apuntes-u3.txt: Bloc de notas'); bloc.rect = { x: 44, y: 6, w: 54, h: 66 }; if (bloc.estado === 'max' && (W.escena.clientWidth === 0 || W.escena.clientWidth >= 560)) bloc.estado = 'normal'; bloc.colocar(); }
      W.notificacion('Tus apuntes', 'Están en el Bloc de notas. Para pasar el ejemplo a la wiki: selecciónalo, cópialo (Ctrl + C) y pégalo (Ctrl + V).', 'bloc');

      function ir(p) { vista = p; C.pintar(); }
      function pagina(t, cont, C2, ruta) {
        cont.classList.add('w11-wiki');
        const art = decodeURIComponent((ruta.match(/^\/wiki\/(.+)$/) || [])[1] || '').replace(/_/g, ' ');
        if (!art) { vista = { p: 'portada' }; return portada(t, cont); }
        if (art !== 'RSS') return otro(art, t, cont);
        if (vista.p === 'portada') vista = { p: 'leer' };
        t.t = 'RSS - Wiki de clase';
        cabWiki(cont, u => C.ir(u), HOST, true, ['editar', 'leer', 'historial'].indexOf(vista.p) !== -1 ? vista.p : vista.p === 'diff' ? 'historial' : 'editar', k => {
          if (k === 'editar') { W.aviso('Edita solo la sección que toca, con su enlace [editar].', 'cuidado'); return; }
          ir({ p: k });
        });
        const main = el('div', 'w11-wiki__main');
        cont.appendChild(main);
        if (vista.p === 'leer') {
          ctx.cumple(0, 'En la portada, el artículo «RSS» pone «esbozo»: está a medio hacer.');
          main.appendChild(el('p', 'w11-wiki__h1', 'RSS'));
          if (!guardado) main.appendChild(el('div', 'w11-wiki__esbozo', '✎ Este artículo es un esbozo: le falta un ejemplo. Puedes ayudar ampliándolo.'));
          SEC.forEach(([k, n]) => {
            const h = el('p', 'w11-wiki__h2', n);
            const e = el('span', 'w11-wiki__ed');
            e.append('[', enlace('editar', () => ir({ p: 'editar', sec: k })), ']');
            h.appendChild(e);
            main.appendChild(h);
            actual[k].forEach(p => main.appendChild(el('p', null, p)));
          });
          return;
        }
        if (vista.p === 'editar') return editar(main, vista.sec);
        if (vista.p === 'historial') {
          main.appendChild(el('p', 'w11-wiki__h1', 'RSS: historial de revisiones'));
          main.appendChild(el('p', 'w11-wiki__nota', 'Lo más nuevo, arriba. (ant) enseña lo que cambió en esa versión.'));
          const ul = el('ul', 'w11-wiki__hist');
          V.slice().reverse().forEach((v, i) => ul.appendChild(filaHist(v, v.n > 1, i === 0, {
            act: () => ir({ p: 'diff', n: v.n, con: 'act' }),
            ant: () => ir({ p: 'diff', n: v.n }),
            ver: () => ir({ p: 'diff', n: v.n }),
          })));
          main.appendChild(ul);
          return;
        }
        if (vista.p === 'diff') {
          const v = V[vista.n - 1];
          const lin = a => { const o = []; SEC.forEach(([k, n]) => a[k].forEach(p => o.push(`${n}: ${p}`))); return o; };
          const a = vista.con === 'act' ? v.a : (vista.n > 1 ? V[vista.n - 2].a : { que: [], ejemplo: [], mas: [] });
          const b = vista.con === 'act' ? V[V.length - 1].a : v.a;
          main.appendChild(el('p', 'w11-wiki__h1', 'RSS: diferencias entre revisiones'));
          const cab = el('p', 'w11-wiki__nota');
          cab.append('Versión de ', sinTraducir(el('strong', null, v.quien)), ` · ${v.cuando} · resumen: «${v.que}»`);
          main.appendChild(cab);
          main.appendChild(diffWiki(lin(a), lin(b)));
          if (v.quien === 'pixelrojo' && vista.con !== 'act') ctx.cumple(3, `En el historial, tu cambio: tu usuario (pixelrojo), la fecha y la hora (${v.cuando}), los bytes añadidos (+${v.bytes}), tu resumen y lo que añadiste (+). Justo antes, la versión de mar_t, guardada mientras tú editabas.`);
          main.appendChild(enlace('‹ Volver al historial', () => ir({ p: 'historial' })));
        }
      }
      function portada(t, cont) {
        t.t = 'Wiki de clase';
        cabWiki(cont, u => C.ir(u), HOST, false);
        const main = el('div', 'w11-wiki__main');
        main.appendChild(el('p', 'w11-wiki__h1', 'Wiki de clase: Servicios de Internet'));
        main.appendChild(el('p', null, 'Cada tema de la unidad es un artículo. Los que pone «esbozo» están a medio hacer: ayúdanos a completarlos.'));
        const ul = el('ul', 'w11-wiki__lista');
        ['Foros', 'Blogs', 'Wikis', 'Redes sociales', 'RSS', 'La nube'].forEach(n => {
          const li = el('li');
          li.appendChild(enlace(n, () => { vista = { p: 'leer' }; C.ir(HOST + '/wiki/' + n.replace(/ /g, '_')); }));
          if (n === 'RSS' && !guardado) li.appendChild(el('span', 'w11-wiki__marca', ' (esbozo)'));
          ul.appendChild(li);
        });
        main.appendChild(ul);
        cont.appendChild(main);
      }
      function otro(n, t, cont) {
        t.t = n + ' - Wiki de clase';
        cabWiki(cont, u => C.ir(u), HOST, true, 'leer', () => W.aviso(`«${n}» ya está completo. El que hay que completar es el que pone «esbozo» en la portada.`, 'cuidado'));
        const main = el('div', 'w11-wiki__main');
        main.appendChild(el('p', 'w11-wiki__h1', n));
        (OTROS[n] || ['Esta página no existe todavía.']).forEach(p => main.appendChild(el('p', null, p)));
        main.appendChild(enlace('‹ Portada', () => C.ir(HOST)));
        cont.appendChild(main);
      }
      function editar(main, k) {
        const nombre = SEC.find(x => x[0] === k)[1];
        main.appendChild(el('p', 'w11-wiki__h1', `Editando «RSS» (sección «${nombre}»)`));
        main.appendChild(el('p', 'w11-wiki__nota', 'Escribe o pega el texto. Las líneas que empiezan por == son el título de la sección: déjalas.'));
        const ta = document.createElement('textarea');
        ta.className = 'w11-web__campo w11-wiki__ta';
        ta.spellcheck = false;
        ta.value = `== ${nombre} ==\n` + actual[k].join('\n') + (actual[k].length ? '\n' : '');
        ta.setAttribute('aria-label', 'Texto de la sección ' + nombre);
        main.appendChild(ta);
        const l = el('label', 'w11-wiki__resumen');
        l.appendChild(el('span', null, 'Resumen:'));
        const res = document.createElement('input');
        res.className = 'w11-web__campo';
        res.spellcheck = false;
        res.maxLength = 200;
        res.setAttribute('aria-label', 'Resumen de edición');
        l.appendChild(res);
        main.appendChild(l);
        main.appendChild(el('p', 'w11-web__sub', 'El resumen lo verán los demás en el historial. Tu nombre no hace falta: el historial ya lo guarda.'));
        const f = el('div', 'w11-wiki__botones');
        f.append(boton2('Guardar cambios', 'w11-web__btn--primario', () => {
          const lineas = ta.value.split(/\r?\n/).map(x => x.trim()).filter(x => x && !/^==.*==$/.test(x));
          const antes = actual[k];
          const borradas = antes.filter(p => lineas.indexOf(p) === -1);
          const nuevas = lineas.filter(p => antes.indexOf(p) === -1);
          const txt = norm(nuevas.join(' '));
          const di = m => W.aviso(m, 'cuidado');
          if (!nuevas.length && !borradas.length) return di('No has cambiado nada. Pega el ejemplo de tus apuntes debajo de lo que hay.');
          if (borradas.length) { ctx.falla(`Borrar lo que escribió otro en «${nombre}».`); return di('Has borrado lo que escribió otra persona, que estaba bien. En una wiki se añade o se corrige; no se borra el trabajo de otro sin motivo. Déjalo como estaba y añade lo tuyo debajo.'); }
          if (txt.indexOf('la nube guarda') !== -1) { ctx.falla('Pegar lo de la nube en el artículo del RSS.'); return di('Eso es de la nube, no del RSS: iría en el artículo «La nube». Aquí va el ejemplo del RSS.'); }
          if (txt.indexOf('lo mejor de internet') !== -1) { ctx.falla('Escribir una opinión en la wiki.'); return di('Eso es una opinión. Una wiki explica las cosas; no es sitio para opiniones.'); }
          if (k !== 'ejemplo') { ctx.falla(`Poner el ejemplo en «${nombre}».`); return di(`Es un ejemplo: va en la sección «Ejemplo», no en «${nombre}».`); }
          if (txt.length < 20) return di('Es muy corto. Pega el ejemplo entero de tus apuntes.');
          const r = res.value.trim(), nr = norm(r);
          if (r.length < 8 || ['cambios', 'cambio', 'arreglo todo', 'arreglo', 'edito'].indexOf(nr) !== -1 || !/ejempl|rss|lector|feedly|anad|complet/.test(nr)) { res.focus(); return di('Escribe un resumen que diga qué has añadido (por ejemplo, que añades un ejemplo). Así, quien mire el historial lo sabe sin leerlo todo.'); }
          // Mientras tanto, mar_t ha guardado otra sección
          const deMarT = copia(actual);
          deMarT.que = [Q2];
          V.push({ n: 3, cuando: '18:41 16 nov 2026', quien: 'mar_t', que: 'Completo la definición', a: deMarT, bytes: tam(deMarT) - tam(actual) });
          actual = copia(deMarT);
          actual.ejemplo = antes.concat(nuevas);
          V.push({ n: 4, cuando: '18:43 16 nov 2026', quien: 'pixelrojo', que: r, a: copia(actual), bytes: tam(actual) - tam(deMarT) });
          guardado = true;
          ctx.cumple(1, `Sección «Ejemplo» → [editar]: pegar debajo de la frase de leo_m «${nuevas.join(' ')}»`);
          ctx.cumple(2, `Resumen de edición: «${r}».`);
          ir({ p: 'leer' });
          W.aviso('Guardado. Mientras editabas, mar_t ha guardado un cambio en otra sección («Qué es»). La wiki ha juntado los dos cambios. Ahora mira el historial.', 'ok');
        }), boton2('Cancelar', null, () => ir({ p: 'leer' })));
        main.appendChild(f);
        ta.focus({ preventScroll: true });
      }
    },
  });
})();
