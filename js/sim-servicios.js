/* ============================================================
   Simulaciones de la Unidad 3 de Operaciones (servicios de
   Internet), 27/10/2026. Usan el marco de js/simulador.js y van
   en tema.html después de él.

   foro       S1 «Modera el foro»: mover un mensaje a su hilo,
              marcar la solución y cerrar un tema repetido.
   perfil     S2 «Arregla este perfil»: una red social con el perfil
              mal configurado; al lado, «Así te ve un desconocido».
   compartir  S2 «Comparte bien»: un Drive con cuatro archivos
              compartidos mal; cada uno, como pide su nota.
   wiki       S3 «Salva la wiki»: encontrar en el historial el cambio
              que estropeó un artículo y deshacer solo ese.

   Todos los nombres son inventados (alias). Nada se guarda.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function') return;

  function select(opciones, valor, etiqueta) {
    const s = document.createElement('select');
    s.className = 'lab__entrada sim__select';
    if (etiqueta) s.setAttribute('aria-label', etiqueta);
    opciones.forEach(([v, t]) => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = t;
      if (v === valor) o.selected = true;
      s.appendChild(o);
    });
    return s;
  }
  function interruptor(el, texto, valor, onCambio) {
    const l = el('label', 'sim__interruptor');
    const c = document.createElement('input');
    c.type = 'checkbox';
    c.setAttribute('role', 'switch');
    c.checked = valor;
    c.addEventListener('change', () => onCambio(c.checked));
    l.appendChild(c);
    l.appendChild(document.createTextNode(' ' + texto));
    return l;
  }

  /* ============================================================
     S1 · Modera el foro
     ============================================================ */
  registrarSimulacion('foro', {
    ventana: 'Comunidad BloqueCraft · foro de Minecraft',
    mision: [
      'Hay un mensaje en el tema equivocado: muévelo a su tema.',
      'Marca como solución la respuesta que arregló el problema.',
      'Hay un tema repetido: márcalo como duplicado del original.',
    ],
    final: 'Apunta en tu cuaderno qué mensaje moviste y adónde, qué respuesta marcaste como solución y por qué, y qué tema estaba repetido (pregunta 6).',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const T = {
        cierra: { titulo: 'Minecraft se cierra al arrancar', autor: 'nube_azul', msgs: [] },
        kart: { titulo: '¿Qué mod me recomendáis para empezar?', autor: 'rayo77', msgs: [] },
        hielo: { titulo: 'Trucos para sobrevivir en el Nether', autor: 'mar_gris', msgs: [] },
        repe: { titulo: '¡¡¡SE ME CIERRA EL MINECRAFT!!!', autor: 'tigre_99', msgs: [] },
      };
      T.cierra.msgs = [
        { id: 'c0', autor: 'nube_azul', t: 'Abro Minecraft y a los dos segundos se cierra. Tengo Windows 11. ¿Alguien sabe qué pasa?' },
        { id: 'c1', autor: 'rayo77', t: 'A mí me pasaba con el antivirus. Prueba a desactivarlo un momento.' },
        { id: 'c2', autor: 'pixel_verde', t: 'Actualiza el controlador de la tarjeta gráfica. Con el viejo, Minecraft se cierra al cargar el mundo.' },
        { id: 'c3', autor: 'nube_azul', t: '¡Era el controlador de la gráfica! Lo he actualizado y ya funciona. Gracias, pixel_verde.' },
      ];
      T.kart.msgs = [
        { id: 'k0', autor: 'rayo77', t: 'Acabo de empezar y quiero probar algún mod. ¿Cuál me recomendáis?' },
        { id: 'k1', autor: 'mar_gris', t: 'El Gato Turbo: no corre mucho, pero gira muy bien.' },
        { id: 'k2', autor: 'luna_8', t: 'A mí también se me cierra Minecraft al arrancar, ¿le pasa a alguien más?', fuera: true },
        { id: 'k3', autor: 'pixel_verde', t: 'Yo empecé con el Escarabajo. Es lento pero no derrapa.' },
      ];
      T.hielo.msgs = [
        { id: 'h0', autor: 'mar_gris', t: 'Ponte alguna pieza de armadura de oro: así los piglins no te atacan.' },
        { id: 'h1', autor: 'luna_8', t: 'Y lleva siempre bloques de sobra para taparte si cae lava.' },
      ];
      T.repe.msgs = [
        { id: 'r0', autor: 'tigre_99', t: 'Se me cierra nada más abrirlo, ayudaaa' },
      ];
      const orden = ['cierra', 'kart', 'hielo', 'repe'];
      let solucion = null, duplicado = false, abierto = null;

      function lista() {
        abierto = null;
        ctx.barra('Comunidad BloqueCraft · foro de Minecraft');
        pantalla.innerHTML = '';
        pantalla.appendChild(el('p', 'sim__h', 'Temas'));
        const ul = el('ul', 'sim__temas');
        orden.forEach(k => {
          const tm = T[k];
          const li = el('li');
          const b = boton(tm.titulo, 'sim__tema');
          b.addEventListener('click', () => abrir(k));
          li.appendChild(b);
          const info = [`${tm.autor} · ${tm.msgs.length - 1} respuestas`];
          if (k === 'cierra' && solucion) info.push('✓ resuelto');
          if (k === 'repe' && duplicado) info.push('cerrado: duplicado');
          li.appendChild(el('span', 'sim__ayuda', info.join(' · ')));
          ul.appendChild(li);
        });
        pantalla.appendChild(ul);
        pantalla.appendChild(el('p', 'sim__ayuda', 'Eres moderador: en cada mensaje tienes el botón «⋯» con las opciones.'));
      }

      function abrir(k) {
        abierto = k;
        const tm = T[k];
        ctx.barra('Comunidad BloqueCraft · ' + tm.titulo);
        pantalla.innerHTML = '';
        const volver = boton('‹ Todos los temas');
        volver.addEventListener('click', lista);
        pantalla.appendChild(volver);
        pantalla.appendChild(el('p', 'sim__h', tm.titulo));
        if (k === 'repe' && duplicado) pantalla.appendChild(ctx.aviso('Tema cerrado: es un duplicado de «Minecraft se cierra al arrancar».', 'ok'));
        const msg = el('div');
        tm.msgs.forEach((m, i) => {
          const c = el('div', 'sim__mensaje' + (i === 0 ? ' sim__mensaje--inicial' : '') + (solucion === m.id ? ' sim__mensaje--solucion' : ''));
          const cab = el('p', 'sim__mensaje-cab');
          cab.appendChild(el('strong', null, m.autor));
          if (i === 0) cab.appendChild(document.createTextNode(' · abrió el tema'));
          if (solucion === m.id) cab.appendChild(el('span', 'sim__sello', '✓ Solución'));
          c.appendChild(cab);
          c.appendChild(el('p', null, m.t));
          const mas = boton('⋯', 'lab__boton sim__mas');
          mas.setAttribute('aria-label', 'Opciones del mensaje de ' + m.autor);
          mas.setAttribute('aria-expanded', 'false');
          const menu = el('div', 'sim__menu');
          menu.hidden = true;
          mas.addEventListener('click', () => {
            menu.hidden = !menu.hidden;
            mas.setAttribute('aria-expanded', String(!menu.hidden));
          });
          c.appendChild(mas);
          c.appendChild(menu);
          if (i > 0) {
            const mover = select([['', 'Mover a otro tema…']].concat(orden.filter(o => o !== k).map(o => [o, T[o].titulo])), '', 'Mover a otro tema');
            mover.addEventListener('change', () => {
              const dest = mover.value;
              if (!dest) return;
              if (m.fuera && dest === 'cierra') {
                tm.msgs.splice(tm.msgs.indexOf(m), 1);
                T.cierra.msgs.push(m);
                ctx.cumple(0, `Mover el mensaje de ${m.autor} («se me cierra Minecraft») del tema de los mods a «${T.cierra.titulo}».`);
                abrir(k);
                pantalla.appendChild(ctx.aviso('Movido: ahora está en el tema donde se habla de ese problema.', 'ok'));
              } else if (m.fuera && dest === 'repe') {
                mover.value = '';
                msg.innerHTML = '';
                msg.appendChild(ctx.aviso('Ese tema es el repetido: así lo tendrías en dos sitios. Muévelo al tema original.'));
              } else {
                mover.value = '';
                msg.innerHTML = '';
                msg.appendChild(ctx.aviso('Este mensaje está bien donde está: habla de lo mismo que el tema.'));
                ctx.falla(`Intentar mover un mensaje que estaba bien (${m.autor}).`);
              }
            });
            menu.appendChild(mover);
            if (k === 'cierra') {
              const sol = boton('✓ Marcar como solución');
              sol.addEventListener('click', () => {
                msg.innerHTML = '';
                if (m.id === 'c2') {
                  solucion = 'c2';
                  ctx.cumple(1, 'Marcar como solución la respuesta de pixel_verde (el controlador de la gráfica): nube_azul dice que fue eso.');
                  abrir(k);
                } else if (m.autor === 'nube_azul') {
                  msg.appendChild(ctx.aviso('Ese mensaje es el «gracias»: dice qué funcionó, pero la solución la dio otra persona. Márcala a ella.'));
                } else {
                  msg.appendChild(ctx.aviso('¿Seguro? Lee el último mensaje de nube_azul: dice qué le funcionó.'));
                  ctx.falla(`Marcar como solución una respuesta que no arregló nada (${m.autor}).`);
                }
              });
              menu.appendChild(sol);
            }
          }
          if (i === 0 && k === 'repe' && !duplicado) {
            const dup = select([['', 'Cerrar como duplicado de…']].concat(orden.filter(o => o !== 'repe').map(o => [o, T[o].titulo])), '', 'Cerrar como duplicado de');
            dup.addEventListener('change', () => {
              msg.innerHTML = '';
              if (dup.value === 'cierra') {
                duplicado = true;
                ctx.cumple(2, '«¡¡¡SE ME CIERRA EL MINECRAFT!!!» cerrado como duplicado de «Minecraft se cierra al arrancar»: la respuesta ya está allí.');
                abrir(k);
              } else if (dup.value) {
                dup.value = '';
                msg.appendChild(ctx.aviso('Ese tema habla de otra cosa. ¿Cuál trata del mismo problema?'));
              }
            });
            menu.appendChild(dup);
          }
          pantalla.appendChild(c);
        });
        pantalla.appendChild(msg);
      }
      lista();
    },
  });

  /* ============================================================
     S2 · Arregla este perfil
     ============================================================ */
  registrarSimulacion('perfil', {
    ventana: 'Fotogram · Configuración',
    mision: [
      'Haz la cuenta privada.',
      'Que las fotos no digan dónde estás.',
      'Que solo te escriban tus seguidores.',
      'Quita el correo y el teléfono del perfil.',
      'Cambia la biografía: dice dónde vives.',
    ],
    final: 'Apunta en tu cuaderno las cinco cosas que cambiaste y por qué es peligrosa una de ellas (pregunta 5).',
    crear(ctx) {
      const { el, pantalla } = ctx;
      const BIOS = [
        ['casa', 'Vivo en C/ Major 14, 2.º B, Palma · 1.º de FP en el Ramon Llull'],
        ['clase', 'Estudiante en el Ramon Llull, 1.º de FP · 8:00 a 14:00'],
        ['gustos', 'Minecraft, música y dibujo'],
      ];
      const s = { privada: false, ubic: true, msg: 'todos', datos: true, bio: 'casa', tema: false };
      const panel = el('div', 'sim__dos');
      const ajustes = el('div', 'sim__ajustes');
      const vista = el('div', 'sim__vista');
      panel.appendChild(ajustes);
      panel.appendChild(vista);
      pantalla.appendChild(el('p', 'sim__ayuda', 'El perfil es de «pixelrojo». A la derecha ves lo que ve cualquier desconocido. Cambia lo que haga falta.'));
      pantalla.appendChild(panel);
      const msg = el('div');
      msg.setAttribute('aria-live', 'polite');
      pantalla.appendChild(msg);

      ajustes.appendChild(el('p', 'sim__h', 'Privacidad'));
      ajustes.appendChild(interruptor(el, 'Cuenta privada', s.privada, v => { s.privada = v; cambio(0, v, 'Cuenta privada: activada. Solo ven tus fotos los seguidores que aceptas.'); }));
      ajustes.appendChild(interruptor(el, 'Añadir mi ubicación a las fotos', s.ubic, v => { s.ubic = v; cambio(1, !v, 'Ubicación en las fotos: desactivada.'); }));
      const sMsg = select([['todos', 'Todo el mundo'], ['seguidores', 'Solo mis seguidores'], ['nadie', 'Nadie']], s.msg, 'Quién puede enviarte mensajes');
      sMsg.addEventListener('change', () => {
        s.msg = sMsg.value;
        msg.innerHTML = '';
        if (s.msg === 'nadie') msg.appendChild(ctx.aviso('Así no te podrían escribir ni tus amigos. La misión pide «solo seguidores».', 'cuidado'));
        cambio(2, s.msg === 'seguidores', 'Mensajes: solo de mis seguidores.');
      });
      const l = el('label', 'sim__campo');
      l.appendChild(el('span', 'sim__ayuda', 'Quién puede enviarte mensajes'));
      l.appendChild(sMsg);
      ajustes.appendChild(l);
      ajustes.appendChild(interruptor(el, 'Mostrar correo y teléfono en el perfil', s.datos, v => { s.datos = v; cambio(3, !v, 'Correo y teléfono: ocultos.'); }));
      ajustes.appendChild(el('p', 'sim__h', 'Perfil'));
      const sBio = select(BIOS.map(([k, t]) => [k, t]), s.bio, 'Biografía');
      sBio.addEventListener('change', () => {
        s.bio = sBio.value;
        msg.innerHTML = '';
        if (s.bio === 'clase') msg.appendChild(ctx.aviso('Esta tampoco: dice en qué centro estás y a qué hora sales. Con eso te pueden encontrar.', 'cuidado'));
        cambio(4, s.bio === 'gustos', 'Biografía: sin dirección ni horarios, solo gustos.');
      });
      const lb = el('label', 'sim__campo');
      lb.appendChild(el('span', 'sim__ayuda', 'Biografía'));
      lb.appendChild(sBio);
      ajustes.appendChild(lb);
      ajustes.appendChild(el('p', 'sim__h', 'Pantalla'));
      ajustes.appendChild(interruptor(el, 'Modo oscuro', s.tema, v => {
        s.tema = v;
        msg.innerHTML = '';
        msg.appendChild(ctx.aviso('El modo oscuro solo cambia los colores: no tiene nada que ver con tu privacidad.', 'cuidado'));
      }));

      function cambio(i, bien, texto) {
        if (bien) ctx.cumple(i, texto);
        else if (ctx.hecho(i)) { ctx.deshace(i); ctx.falla('Deshacer: ' + texto.split(':')[0].toLowerCase() + ' vuelve a estar mal.'); }
        pintarVista();
      }
      function pintarVista() {
        vista.innerHTML = '';
        vista.appendChild(el('p', 'sim__h', 'Así te ve un desconocido'));
        const cab = el('div', 'sim__perfil-cab');
        cab.appendChild(el('span', 'sim__avatar', 'P'));
        const n = el('div');
        n.appendChild(el('strong', null, 'pixelrojo'));
        n.appendChild(el('p', 'sim__ayuda', s.privada ? '🔒 Cuenta privada' : 'Cuenta pública'));
        cab.appendChild(n);
        vista.appendChild(cab);
        vista.appendChild(el('p', 'sim__bio', BIOS.find(b => b[0] === s.bio)[1]));
        if (s.datos) vista.appendChild(el('p', 'sim__peligro', '✉ pixelrojo@correo.es · ☎ 600 000 000'));
        if (s.privada) {
          vista.appendChild(el('p', 'sim__candado', '🔒 Esta cuenta es privada. Síguela para ver sus fotos.'));
        } else {
          const fotos = el('div', 'sim__fotos');
          ['🏎️', '🎨', '🎧'].forEach(e => {
            const f = el('div', 'sim__foto');
            f.appendChild(el('span', 'sim__foto-icono', e));
            if (s.ubic) f.appendChild(el('span', 'sim__peligro sim__foto-ubic', '📍 Palma'));
            fotos.appendChild(f);
          });
          vista.appendChild(fotos);
        }
        const boton = el('p', 'sim__ayuda', s.msg === 'todos' ? '💬 Cualquiera puede enviarle un mensaje' : s.msg === 'seguidores' ? '💬 Solo sus seguidores pueden escribirle' : '💬 No acepta mensajes');
        if (s.msg === 'todos') boton.classList.add('sim__peligro');
        vista.appendChild(boton);
      }
      pintarVista();
    },
  });

  /* ============================================================
     S2 · Comparte bien
     ============================================================ */
  const PIDE = [
    'que lo editen Ana y Leo, y nadie más',
    'que toda la gente del instituto las vea, sin cambiarlas',
    'que no lo vea nadie más que tú',
    'que Leo pueda comentar, pero no cambiar nada',
  ];
  registrarSimulacion('compartir', {
    ventana: 'Mi unidad · Drive de mentira',
    mision: ['trabajo-grupo', 'fotos-excursion', 'dni-escaneado', 'apuntes-u3'].map((n, i) => `${n}: ${PIDE[i]}.`),
    final: 'Apunta en tu cuaderno cómo dejaste compartido cada uno de los cuatro archivos y por qué (pregunta 14).',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const DOM = 'iesramonllull.net';
      const ARCH = [
        { n: 'trabajo-grupo.docx', i: '📄', general: 'enlace', rolG: 'editor', gente: [] },
        { n: 'fotos-excursion', i: '📁', general: 'dominio', rolG: 'editor', gente: [] },
        { n: 'dni-escaneado.pdf', i: '📕', general: 'enlace', rolG: 'lector', gente: [] },
        { n: 'apuntes-u3.docx', i: '📄', general: 'restringido', rolG: 'lector', gente: [['leo', 'editor']] },
      ];
      const ROLES = [['lector', 'Lector'], ['comentador', 'Comentador'], ['editor', 'Editor']];
      const GENERAL = [['restringido', 'Restringido: solo las personas añadidas'], ['dominio', `Cualquiera de ${DOM}`], ['enlace', 'Cualquiera con el enlace']];
      const rol = (a, q) => (a.gente.find(g => g[0] === q) || [])[1];
      const COMPRUEBA = [
        a => a.general === 'restringido' && rol(a, 'ana') === 'editor' && rol(a, 'leo') === 'editor' && a.gente.length === 2,
        a => a.general === 'dominio' && a.rolG === 'lector',
        a => a.general === 'restringido' && a.gente.length === 0,
        a => a.general === 'restringido' && rol(a, 'leo') === 'comentador' && a.gente.length === 1,
      ];
      function describir(a) {
        const g = a.general === 'restringido' ? 'restringido' : (a.general === 'dominio' ? `todo ${DOM}` : 'cualquiera con el enlace') + ' como ' + a.rolG;
        const p = a.gente.map(([q, r]) => `${q} (${r})`).join(', ');
        return g + (p ? '; ' + p : '');
      }

      function lista() {
        ctx.barra('Mi unidad · Drive de mentira');
        pantalla.innerHTML = '';
        pantalla.appendChild(el('p', 'sim__ayuda', 'Toca un archivo para ver con quién está compartido.'));
        const ul = el('ul', 'sim__temas');
        ARCH.forEach((a, k) => {
          const li = el('li');
          const b = boton(`${a.i} ${a.n}`, 'sim__tema');
          b.setAttribute('translate', 'no');
          b.addEventListener('click', () => abrir(k));
          li.appendChild(b);
          li.appendChild(el('span', 'sim__ayuda', (ctx.hecho(k) ? '✓ ' : '') + 'Compartido: ' + describir(a)));
          ul.appendChild(li);
        });
        pantalla.appendChild(ul);
      }
      function abrir(k) {
        const a = ARCH[k];
        ctx.barra('Compartir «' + a.n + '»');
        pantalla.innerHTML = '';
        const nombre = el('p', 'sim__h', `${a.i} ${a.n}`);
        nombre.setAttribute('translate', 'no');
        pantalla.appendChild(nombre);
        pantalla.appendChild(el('p', 'sim__pide', 'Lo que pide: ' + PIDE[k] + '.'));

        pantalla.appendChild(el('p', 'sim__etiqueta', 'Personas con acceso'));
        const gente = el('ul', 'sim__gente');
        const fila = (q, r, tuyo) => {
          const li = el('li');
          li.appendChild(el('span', null, tuyo ? 'pixelrojo (tú) · propietario' : `${q}@${DOM}`));
          if (!tuyo) {
            const s = select(ROLES.concat([['quitar', 'Quitar acceso']]), r, 'Permiso de ' + q);
            s.addEventListener('change', () => {
              if (s.value === 'quitar') a.gente = a.gente.filter(g => g[0] !== q);
              else a.gente.find(g => g[0] === q)[1] = s.value;
              abrir(k);
            });
            li.appendChild(s);
          }
          gente.appendChild(li);
        };
        fila('pixelrojo', '', true);
        a.gente.forEach(([q, r]) => fila(q, r));
        pantalla.appendChild(gente);

        const nueva = el('div', 'lab__fila');
        const quien = select([['', 'Añadir a…'], ['ana', `ana@${DOM}`], ['leo', `leo@${DOM}`], ['mar', `mar@${DOM}`]].filter(([q]) => !q || !rol(a, q)), '', 'Añadir a una persona');
        const rolN = select(ROLES, 'lector', 'Permiso de la persona nueva');
        const anadir = boton('Añadir');
        anadir.addEventListener('click', () => {
          if (!quien.value) return;
          a.gente.push([quien.value, rolN.value]);
          abrir(k);
        });
        nueva.appendChild(quien);
        nueva.appendChild(rolN);
        nueva.appendChild(anadir);
        pantalla.appendChild(nueva);

        pantalla.appendChild(el('p', 'sim__etiqueta', 'Acceso general'));
        const filaG = el('div', 'lab__fila');
        const g = select(GENERAL, a.general, 'Acceso general');
        const rg = select(ROLES, a.rolG, 'Permiso del acceso general');
        rg.hidden = a.general === 'restringido';
        g.addEventListener('change', () => { a.general = g.value; abrir(k); });
        rg.addEventListener('change', () => { a.rolG = rg.value; });
        filaG.appendChild(g);
        filaG.appendChild(rg);
        pantalla.appendChild(filaG);
        if (a.general === 'enlace') pantalla.appendChild(ctx.aviso('Con el enlace, cualquiera que lo reciba lo abre, aunque no sea del instituto. Si alguien lo reenvía, ya no controlas quién lo ve.', 'cuidado'));

        const msg = el('div');
        msg.setAttribute('aria-live', 'polite');
        const listo = boton('Listo', 'lab__boton lab__boton--activo');
        listo.addEventListener('click', () => {
          msg.innerHTML = '';
          if (COMPRUEBA[k](a)) {
            ctx.cumple(k, `${a.n}: ${describir(a)}.`);
            lista();
          } else {
            if (ctx.hecho(k)) ctx.deshace(k);
            ctx.falla(`${a.n}: ${describir(a)} (no es lo que pide).`);
            msg.appendChild(ctx.aviso('Todavía no está como pide. Vuelve a leer «Lo que pide» y mira quién tiene acceso y con qué permiso.'));
          }
        });
        const atras = boton('‹ Volver sin comprobar');
        atras.addEventListener('click', lista);
        const mandos = el('div', 'lab__fila');
        mandos.appendChild(atras);
        mandos.appendChild(listo);
        pantalla.appendChild(mandos);
        pantalla.appendChild(msg);
      }
      lista();
    },
  });

  /* ============================================================
     S3 · Salva la wiki
     ============================================================ */
  registrarSimulacion('wiki', {
    ventana: 'Wiki de clase · Blogs',
    mision: [
      'Encuentra en el historial la versión que estropeó el artículo.',
      'Arréglalo sin perder los cambios buenos que vinieron después.',
      'Explica en el resumen de edición qué has hecho.',
    ],
    final: 'Apunta en tu cuaderno qué versión estropeó el artículo, quién la hizo, qué cambió y por qué no bastaba con volver a la versión anterior (pregunta 9).',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const P1 = 'Un blog publica entradas con fecha. La más nueva sale arriba.';
      const P2 = 'Ejemplo: Xataka es un blog de tecnología.';
      const P3 = 'Muchos blogs dejan comentarios debajo de cada entrada.';
      const MALO = 'los blogs son una tontería y nadie los lee jajaja';
      const P4 = 'Para saber más: Microsiervos, un blog de curiosidades.';
      // cada versión: quién, qué hizo y cómo queda el artículo
      const V = [
        { n: 1, quien: 'ana_k', que: 'Crea el artículo', texto: [P1] },
        { n: 2, quien: 'leo_m', que: 'Añade un ejemplo', texto: [P1, P2] },
        { n: 3, quien: 'mar_t', que: 'Añade los comentarios', texto: [P1, P2, P3] },
        { n: 4, quien: '83.45.12.7 (sin cuenta)', que: 'Cambio sin resumen', texto: [P1, MALO] },
        { n: 5, quien: 'pau_r', que: 'Añade un enlace', texto: [P1, MALO, P4] },
      ];
      let actual = V[4].texto.slice(), encontrada = false, arreglado = false;

      function articulo() {
        ctx.barra('Wiki de clase · Blogs');
        pantalla.innerHTML = '';
        const tabs = el('div', 'lab__fila');
        const leer = boton('Leer', 'lab__boton lab__boton--activo');
        const hist = boton('Ver historial');
        hist.addEventListener('click', historial);
        tabs.appendChild(leer);
        tabs.appendChild(hist);
        pantalla.appendChild(tabs);
        pantalla.appendChild(el('p', 'sim__h', 'Blogs'));
        actual.forEach(p => pantalla.appendChild(el('p', p === MALO ? 'sim__peligro' : null, p)));
        if (!arreglado) pantalla.appendChild(el('p', 'sim__ayuda', 'Algo no cuadra: ¿falta algo? ¿sobra algo? Mira el historial.'));
      }
      function diff(a, b) {
        const box = el('div', 'sim__diff');
        a.filter(p => b.indexOf(p) === -1).forEach(p => box.appendChild(Object.assign(el('del'), { textContent: '− ' + p })));
        b.filter(p => a.indexOf(p) === -1).forEach(p => box.appendChild(Object.assign(el('ins'), { textContent: '+ ' + p })));
        if (!box.childNodes.length) box.appendChild(el('span', 'sim__ayuda', 'Sin cambios.'));
        return box;
      }
      function historial() {
        ctx.barra('Wiki de clase · Blogs · Historial');
        pantalla.innerHTML = '';
        const volver = boton('‹ Volver al artículo');
        volver.addEventListener('click', articulo);
        pantalla.appendChild(volver);
        pantalla.appendChild(el('p', 'sim__ayuda', 'Lo más nuevo, arriba. «Ver cambios» enseña lo que se quitó (−) y lo que se añadió (+) en esa versión.'));
        const msg = el('div');
        msg.setAttribute('aria-live', 'polite');
        const ul = el('ul', 'sim__versiones');
        V.slice().reverse().forEach(v => {
          const li = el('li');
          li.appendChild(el('strong', null, `v${v.n}`));
          li.appendChild(document.createTextNode(` · ${v.quien} · ${v.que}`));
          const caja = el('div');
          const ver = boton('Ver cambios');
          ver.addEventListener('click', () => {
            caja.innerHTML = '';
            caja.appendChild(diff(v.n > 1 ? V[v.n - 2].texto : [], v.texto));
            if (v.n === 4 && !encontrada) {
              encontrada = true;
              ctx.cumple(0, 'En el historial, «Ver cambios» de la v4: un usuario sin cuenta (83.45.12.7) quitó un ejemplo y un párrafo y escribió una tontería.');
            }
          });
          const fila = el('div', 'lab__fila');
          fila.appendChild(ver);
          if (v.n === 4) {
            const deshacer = boton('↶ Deshacer este cambio');
            deshacer.addEventListener('click', resumen);
            fila.appendChild(deshacer);
          }
          if (v.n < 5) {
            const rest = boton(`Restaurar la v${v.n}`);
            rest.addEventListener('click', () => {
              msg.innerHTML = '';
              if (v.n === 3) {
                msg.appendChild(ctx.aviso('Si vuelves a la v3, también pierdes el enlace que añadió pau_r en la v5, que estaba bien. Mejor deshaz solo la v4.'));
                ctx.falla('Restaurar la v3 perdería el enlace bueno de la v5.');
              } else {
                msg.appendChild(ctx.aviso(`La v${v.n} es todavía más antigua: perderías más cambios buenos.`));
              }
            });
            fila.appendChild(rest);
          }
          li.appendChild(fila);
          li.appendChild(caja);
          ul.appendChild(li);
        });
        pantalla.appendChild(ul);
        pantalla.appendChild(msg);
      }
      function resumen() {
        ctx.barra('Wiki de clase · Blogs · Deshacer');
        pantalla.innerHTML = '';
        pantalla.appendChild(el('p', null, 'Se va a quitar solo lo que hizo la v4. Lo de la v5 se queda.'));
        pantalla.appendChild(diff(V[4].texto, [P1, P2, P3, P4]));
        const opc = select([
          ['', 'Resumen de edición…'],
          ['bien', 'Deshago el vandalismo de la v4 (83.45.12.7)'],
          ['nada', 'cambios'],
          ['mal', 'borro lo del otro porque sí'],
        ], '', 'Resumen de edición');
        const l = el('label', 'sim__campo');
        l.appendChild(el('span', 'sim__ayuda', 'Resumen de edición: lo que verán los demás en el historial.'));
        l.appendChild(opc);
        pantalla.appendChild(l);
        const msg = el('div');
        msg.setAttribute('aria-live', 'polite');
        const guardar = boton('Guardar cambios', 'lab__boton lab__boton--activo');
        guardar.addEventListener('click', () => {
          msg.innerHTML = '';
          if (opc.value !== 'bien') {
            msg.appendChild(ctx.aviso('Escoge un resumen que diga a los demás qué has hecho y por qué. Así, quien mire el historial lo entiende.'));
            return;
          }
          actual = [P1, P2, P3, P4];
          arreglado = true;
          V.push({ n: 6, quien: 'pixelrojo (tú)', que: 'Deshago el vandalismo de la v4', texto: actual.slice() });
          ctx.cumple(1, 'Deshacer solo la v4: vuelven el ejemplo y los comentarios, y se queda el enlace de la v5.');
          ctx.cumple(2, 'Resumen de edición: «Deshago el vandalismo de la v4». Queda como v6 en el historial.');
          articulo();
        });
        const atras = boton('‹ Cancelar');
        atras.addEventListener('click', historial);
        const f = el('div', 'lab__fila');
        f.appendChild(atras);
        f.appendChild(guardar);
        pantalla.appendChild(f);
        pantalla.appendChild(msg);
      }
      articulo();
    },
  });
})();
