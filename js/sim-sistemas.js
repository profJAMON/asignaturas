/* ============================================================
   Simulaciones de la Unidad 5 de Operaciones (sistemas
   operativos), 27/10/2026; rehechas el 16/11/2026 para que sean
   lo más reales posible (lo pidieron los alumnos). Usan el marco
   de js/simulador.js; van en tema.html después de js/win11.js.
   (El simulador del instalador de la S3 está en
   js/lab-instalador.js, anterior al marco.)

   dispositivos  S1 «Arregla los controladores»: el Administrador
                 de dispositivos dentro del Windows 11 de mentira
                 (clic derecho en Inicio). Dos aparatos con ⚠: la
                 impresora se arregla buscando automáticamente; el
                 wifi necesita el controlador de su modelo, que está
                 en Descargas. Clic derecho → Actualizar controlador,
                 como en el de verdad.
   bios          S2 «Cambia el orden de arranque»: un PC que se
                 enciende con su botón; hay que pulsar F2 a tiempo
                 (si no, arranca Windows). La BIOS se maneja solo con
                 el teclado (el de verdad o el de la pantalla):
                 ← → pestañas, ↑ ↓ elegir, + / − (o F6 / F5) subir y
                 bajar, F10 guardar y salir, Esc salir.

   Las pantallas de la BIOS van en inglés, como las de verdad,
   con translate="no"; la ayuda de debajo, en castellano.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function' || !window.LAB) return;
  const { el, boton } = window.LAB;
  const sinTraducir = n => { n.setAttribute('translate', 'no'); return n; };

  /* ============================================================
     S1 · Arregla los controladores
     ============================================================ */
  registrarSimulacion('dispositivos', {
    ventana: 'Windows 11',
    mision: [
      'Abre el Administrador de dispositivos y encuentra los dos aparatos con el triángulo amarillo ⚠.',
      'Arregla la impresora.',
      'Arregla el wifi con el controlador de su modelo.',
    ],
    final: 'Apunta en tu cuaderno qué dos aparatos tenían el triángulo, cómo arreglaste cada uno y qué controlador elegiste para el wifi (pregunta 7).',
    crear(ctx) {
      const F = WIN11.fs;
      const DESC = ['C:', 'Users', 'alumno', 'Downloads'];
      const DRIVERS = [['wifi-intel-ax201.inf', 'ok'], ['wifi-realtek-rtl8822.inf', 'otro'], ['impresora-hp-deskjet.inf', 'imp'], ['driver-gratis-todo-en-uno.inf', 'raro']];
      const W = WIN11.escritorio(ctx, {
        fs: F.equipo(F.usuario({ descargas: DRIVERS.map(([n]) => F.archivo(n, 40 * F.KB)).concat([F.archivo('horario.pdf', 200 * F.KB)]) })),
        barra: ['explorador', 'navegador'],
        apps: { dispositivos: { n: 'Administrador de dispositivos', icono: 'sistema', buscar: ['administrador de dispositivos', 'dispositivos', 'devmgmt', 'controladores'], abrir: () => abrirDM() } },
      });
      W.notificacion('Wifi', 'No hay conexión a Internet. No se ha encontrado ningún adaptador wifi que funcione.', 'wifi');
      const G = [
        { g: 'Adaptadores de pantalla', i: '🖥️', d: [{ n: 'Intel(R) UHD Graphics' }] },
        { g: 'Adaptadores de red', i: '🌐', d: [{ n: 'Intel(R) Wi-Fi 6 AX201 160MHz', mal: 'wifi' }, { n: 'Realtek PCIe GbE Family Controller' }] },
        { g: 'Colas de impresión', i: '🖨️', d: [{ n: 'Fax' }, { n: 'Microsoft Print to PDF' }] },
        { g: 'Otros dispositivos', i: '❓', d: [{ n: 'Dispositivo desconocido', mal: 'impresora' }] },
        { g: 'Teclados', i: '⌨️', d: [{ n: 'Teclado HID estándar' }] },
        { g: 'Unidades de disco', i: '💽', d: [{ n: 'SAMSUNG SSD 512GB' }] },
      ];
      const abiertos = new Set([1, 3]); // Windows abre solo los grupos con problemas
      const vistos = new Set();
      const arreglado = { wifi: false, impresora: false };
      const quitados = new Set();
      let sel = null, dm = null, pintarDM = null;
      const nombre = d => d.mal === 'impresora' && arreglado.impresora ? 'HP DeskJet 2700 series' : d.n;
      const roto = d => d.mal && !arreglado[d.mal];

      function abrirDM() {
        const ya = W.ventana('dispositivos');
        if (ya) { ya.enfocar(); return ya; }
        dm = W.abrir({ app: 'dispositivos', titulo: 'Administrador de dispositivos', icono: 'sistema', ancho: 60, alto: 78, crear: c => {
          c.classList.add('w11-dm');
          const menu = el('div', 'w11-bloc__menu');
          const accion = boton('Acción', 'w11-dm__m');
          accion.addEventListener('click', () => {
            const r = accion.getBoundingClientRect();
            W.menu(r.left, r.bottom, [
              { t: 'Actualizar controlador', off: !sel, f: () => actualizar(sel) },
              { t: 'Desinstalar el dispositivo', off: !sel, f: () => desinstalar(sel) },
              { sep: true },
              { t: 'Buscar cambios de hardware', f: buscarCambios },
              { sep: true },
              { t: 'Propiedades', off: !sel, f: () => propiedades(sel) },
            ]);
          });
          menu.append(el('span', null, 'Archivo'), accion, el('span', null, 'Ver'), el('span', null, 'Ayuda'));
          const arbol = el('ul', 'w11-dm__arbol');
          arbol.setAttribute('role', 'tree');
          const estado = el('div', 'w11-exp__estado');
          c.append(menu, arbol, estado);
          pintarDM = () => {
            arbol.innerHTML = '';
            const raiz = el('li', 'w11-dm__raiz');
            raiz.append(sinTraducir(el('span', null, '🖳 PCAULA-07')));
            arbol.appendChild(raiz);
            G.forEach((gr, gi) => {
              const vis = gr.d.filter(d => !quitados.has(d));
              if (!vis.length) return;
              const li = el('li', 'w11-dm__g');
              li.setAttribute('role', 'treeitem');
              li.setAttribute('aria-expanded', String(abiertos.has(gi)));
              const b = boton('', 'w11-dm__fila');
              b.append(el('span', 'w11-dm__flecha', abiertos.has(gi) ? '⌄' : '›'), el('span', 'w11-dm__i', gr.i), el('span', null, gr.g));
              const alterna = () => { abiertos.has(gi) ? abiertos.delete(gi) : abiertos.add(gi); pintarDM(); };
              b.addEventListener('dblclick', alterna);
              b.querySelector('.w11-dm__flecha').addEventListener('click', e => { e.stopPropagation(); alterna(); });
              b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowLeft') alterna(); });
              li.appendChild(b);
              if (abiertos.has(gi)) {
                const sub = el('ul', 'w11-dm__sub');
                sub.setAttribute('role', 'group');
                vis.forEach(d => {
                  const di = el('li');
                  di.setAttribute('role', 'treeitem');
                  const bd = boton('', 'w11-dm__fila w11-dm__dev' + (sel === d ? ' w11-dm__fila--sel' : ''));
                  bd.append(el('span', 'w11-dm__i', roto(d) ? '⚠️' : gr.i), sinTraducir(el('span', null, nombre(d))));
                  bd.addEventListener('click', () => { elegir(d); });
                  bd.addEventListener('dblclick', () => propiedades(d));
                  bd.addEventListener('keydown', e => { if (e.key === 'Enter') propiedades(d); });
                  bd.addEventListener('contextmenu', e => {
                    e.preventDefault(); e.stopPropagation();
                    elegir(d);
                    W.menu(e.clientX, e.clientY, [
                      { t: 'Actualizar controlador', f: () => actualizar(d) },
                      { t: 'Deshabilitar dispositivo', f: () => { ctx.falla(`Deshabilitar «${nombre(d)}».`); W.aviso('Deshabilitarlo lo apaga: así seguro que no funciona. Lo que le falta es su controlador.', 'cuidado'); } },
                      { t: 'Desinstalar el dispositivo', f: () => desinstalar(d) },
                      { sep: true },
                      { t: 'Buscar cambios de hardware', f: buscarCambios },
                      { sep: true },
                      { t: 'Propiedades', f: () => propiedades(d) },
                    ]);
                  });
                  di.appendChild(bd);
                  sub.appendChild(di);
                });
                li.appendChild(sub);
              }
              arbol.appendChild(li);
            });
            estado.textContent = sel ? nombre(sel) : '';
          };
          pintarDM();
        }, alCerrar: () => { pintarDM = null; } });
        return dm;
      }
      function elegir(d) {
        sel = d;
        if (roto(d)) {
          vistos.add(d.mal);
          if (vistos.size === 2) ctx.cumple(0, 'Clic derecho en Inicio → Administrador de dispositivos: ⚠ en «Adaptadores de red» (wifi Intel AX201) y en «Otros dispositivos» (un dispositivo desconocido: la impresora).');
        }
        if (pintarDM) pintarDM();
      }
      function repinta() { if (pintarDM) pintarDM(); }
      function propiedades(d) {
        elegir(d);
        W.abrir({ app: 'prop-disp', titulo: 'Propiedades: ' + nombre(d), tituloNoTraducir: true, icono: 'sistema', ancho: 46, alto: 66, crear: (c, v) => {
          c.classList.add('w11-prop');
          const tabs = el('div', 'w11-prop__tabs');
          const panel = el('div', 'w11-prop__panel');
          const pinta = k => {
            tabs.innerHTML = '';
            [['general', 'General'], ['controlador', 'Controlador']].forEach(([x, n]) => {
              const b = boton(n, 'w11-prop__tab');
              b.setAttribute('aria-selected', String(x === k));
              b.addEventListener('click', () => pinta(x));
              tabs.appendChild(b);
            });
            panel.innerHTML = '';
            const cab = el('div', 'w11-prop__cab');
            cab.append(el('span', 'w11-dm__i', roto(d) ? '⚠️' : '✔️'), sinTraducir(el('strong', null, nombre(d))));
            panel.appendChild(cab);
            if (k === 'general') {
              panel.appendChild(el('p', 'w11-nota', 'Estado del dispositivo'));
              panel.appendChild(el('div', 'w11-dm__estado', roto(d) ? 'No están instalados los controladores de este dispositivo. (Código 28)\n\nNo hay ningún controlador seleccionado para el dispositivo.\n\nPara encontrar un controlador, haga clic en Actualizar controlador.' : 'Este dispositivo funciona correctamente.'));
            } else {
              const f = (b, t, fn) => { const r = el('div', 'w11-dm__acc'); const x = boton(b, 'w11-btn'); x.addEventListener('click', fn); r.append(x, el('span', 'w11-nota', t)); panel.appendChild(r); };
              f('Actualizar controlador', 'Actualiza el controlador de este dispositivo.', () => { v.cerrar(); actualizar(d); });
              f('Deshabilitar dispositivo', 'Deshabilita el dispositivo seleccionado.', () => W.aviso('Deshabilitarlo lo apaga: así seguro que no funciona.', 'cuidado'));
              f('Desinstalar el dispositivo', 'Desinstala el dispositivo del sistema (avanzado).', () => { v.cerrar(); desinstalar(d); });
            }
            const pie = el('div', 'w11-prop__pie');
            const ok = boton('Aceptar', 'w11-btn w11-btn--primario');
            ok.addEventListener('click', () => v.cerrar());
            pie.appendChild(ok);
            panel.appendChild(pie);
          };
          c.append(tabs, panel);
          pinta('general');
        } });
      }
      function desinstalar(d) {
        W.dialogo({ titulo: 'Desinstalar el dispositivo', icono: 'aviso', texto: ['Advertencia: Está a punto de desinstalar este dispositivo del sistema.', nombre(d)], botones: [
          { t: 'Desinstalar', primario: true, f: () => {
            quitados.add(d);
            if (sel === d) sel = null;
            ctx.falla(`Desinstalar «${nombre(d)}».`);
            W.aviso(d.mal ? 'Ha desaparecido de la lista, pero el aparato sigue ahí y sigue sin funcionar: lo que le falta es su controlador. Para que vuelva: menú Acción → Buscar cambios de hardware.' : 'Has quitado un aparato que funcionaba. Para que vuelva: menú Acción → Buscar cambios de hardware.', 'cuidado');
            repinta();
          } },
          { t: 'Cancelar' },
        ] });
      }
      function buscarCambios() {
        if (!quitados.size) { W.notificacion('Administrador de dispositivos', 'No hay hardware nuevo.'); return; }
        quitados.clear();
        W.notificacion('Administrador de dispositivos', 'Se han vuelto a detectar los dispositivos.');
        repinta();
      }
      function exito(k, texto, msg) {
        arreglado[k] = true;
        ctx.cumple(k === 'impresora' ? 1 : 2, texto);
        W.aviso(msg, 'ok');
        if (k === 'wifi') W.notificacion('Wifi', 'Conectado a AULA-INFO. Ya tienes Internet.', 'wifi');
        repinta();
      }
      function actualizar(d) {
        elegir(d);
        const v = W.abrir({ app: 'asistente', titulo: 'Actualizar controladores: ' + nombre(d), tituloNoTraducir: true, icono: 'sistema', ancho: 54, alto: 70, crear: c => {
          c.classList.add('w11-dm__asis');
          paso1(c);
        } });
        function cierra() { v.cerrar(); }
        function pie(c, botones) {
          const p = el('div', 'w11-prop__pie');
          botones.forEach(([t, f, prim]) => { const b = boton(t, 'w11-btn' + (prim ? ' w11-btn--primario' : '')); b.addEventListener('click', f); p.appendChild(b); });
          c.appendChild(p);
        }
        function paso1(c) {
          c.innerHTML = '';
          c.appendChild(el('p', 'w11-dm__h', '¿Cómo desea buscar los controladores?'));
          const op = (t, s, f) => { const b = boton('', 'w11-dm__op'); b.append(el('strong', null, '→ ' + t), el('span', 'w11-nota', s)); b.addEventListener('click', f); c.appendChild(b); };
          op('Buscar controladores automáticamente', 'Windows buscará en el equipo y en Internet el mejor controlador disponible.', () => auto(c));
          op('Buscar controladores en mi equipo', 'Buscar e instalar un controlador manualmente.', () => manual(c));
          pie(c, [['Cancelar', cierra]]);
        }
        function auto(c) {
          c.innerHTML = '';
          if (!roto(d)) {
            c.appendChild(el('p', 'w11-dm__h', 'Los mejores controladores para el dispositivo ya están instalados'));
            c.appendChild(el('p', 'w11-nota', 'Este dispositivo ya funciona: no hacía falta tocarlo.'));
          } else if (d.mal === 'impresora') {
            c.appendChild(el('p', 'w11-dm__h', 'Windows actualizó correctamente los controladores'));
            c.appendChild(sinTraducir(el('p', null, 'HP DeskJet 2700 series')));
            exito('impresora', 'Impresora («Dispositivo desconocido»): clic derecho → Actualizar controlador → Buscar controladores automáticamente. Windows lo encuentra solo y ahora se llama «HP DeskJet 2700 series».', 'Windows ha encontrado el controlador solo: era una impresora HP DeskJet 2700.');
          } else {
            c.appendChild(el('p', 'w11-dm__h', 'No se pudieron encontrar los controladores'));
            c.appendChild(el('p', null, 'Windows ha buscado en el equipo y no ha podido conectarse a Internet para buscar más. Puede buscar el controlador en el sitio web del fabricante.'));
            ctx.apunta('Wifi: Buscar automáticamente → no lo encuentra (sin wifi no hay Internet para buscarlo).');
            W.aviso('Sin wifi no hay Internet, y Windows no puede buscar el controlador. Lo descargaste antes en otro ordenador: está en tu carpeta Descargas. Usa «Buscar controladores en mi equipo».', 'cuidado');
          }
          pie(c, [['Cerrar', cierra, true]]);
        }
        function manual(c) {
          c.innerHTML = '';
          c.appendChild(el('p', 'w11-dm__h', 'Buscar controladores en el equipo'));
          c.appendChild(el('p', null, 'Elija el archivo del controlador (.inf):'));
          const fila = el('div', 'w11-dm__ruta');
          const ruta = document.createElement('input');
          ruta.className = 'w11-campo';
          ruta.readOnly = true;
          ruta.setAttribute('aria-label', 'Archivo del controlador');
          sinTraducir(ruta);
          let elegido = null;
          const ex = boton('Examinar…', 'w11-btn');
          ex.addEventListener('click', () => examinar(a => { elegido = a; ruta.value = 'C:\\Users\\alumno\\Downloads\\' + a; }));
          fila.append(ruta, ex);
          c.appendChild(fila);
          pie(c, [['Atrás', () => paso1(c)], ['Siguiente', () => {
            if (!elegido) { W.aviso('Pulsa «Examinar…» y elige el archivo del controlador.', 'cuidado'); return; }
            const t = DRIVERS.find(x => x[0] === elegido)[1];
            c.innerHTML = '';
            if (!roto(d)) { c.appendChild(el('p', 'w11-dm__h', 'Los mejores controladores para el dispositivo ya están instalados')); }
            else if (t === 'raro') {
              ctx.falla(`Intentar instalar «${elegido}».`);
              c.appendChild(el('p', 'w11-dm__h', 'Windows encontró un problema al instalar el controlador'));
              c.appendChild(el('p', null, 'El editor de este controlador no se puede comprobar.'));
              W.aviso('Un «controlador para todo» descargado de cualquier web puede traer un virus. El controlador se baja de la web del fabricante, y tiene que ser el de tu modelo.', 'cuidado');
            } else if (d.mal === 'wifi' && t === 'ok') {
              c.appendChild(el('p', 'w11-dm__h', 'Windows actualizó correctamente los controladores'));
              c.appendChild(sinTraducir(el('p', null, 'Intel(R) Wi-Fi 6 AX201 160MHz')));
              exito('wifi', 'Wifi: clic derecho → Actualizar controlador → Buscar controladores en mi equipo → Examinar… → «wifi-intel-ax201.inf», el de la misma marca y el mismo modelo que pone en el nombre (Intel AX201).', 'Controlador instalado: el wifi ya funciona.');
            } else if (d.mal === 'impresora' && t === 'imp') {
              c.appendChild(el('p', 'w11-dm__h', 'Windows actualizó correctamente los controladores'));
              exito('impresora', 'Impresora: Actualizar controlador → Buscar en mi equipo → «impresora-hp-deskjet.inf».', 'Controlador instalado: la impresora ya funciona.');
            } else {
              ctx.falla(`Probar «${elegido}» en ${nombre(d)}: no es el de ese aparato.`);
              c.appendChild(el('p', 'w11-dm__h', 'Windows no encontró controladores para el dispositivo en esa ubicación'));
              W.aviso('Ese controlador es de otro aparato o de otro modelo. Mira el nombre del dispositivo: la marca y el modelo tienen que coincidir.', 'cuidado');
            }
            pie(c, [['Cerrar', cierra, true]]);
          }, true], ['Cancelar', cierra]]);
        }
      }
      function examinar(alElegir) {
        let sel2 = null;
        W.dialogo({ titulo: 'Abrir', crear: t => {
          const ruta = sinTraducir(el('p', 'w11-nota', 'Este equipo › Disco local (C:) › Usuarios › alumno › Descargas'));
          t.appendChild(ruta);
          const lista = el('div', 'w11-perm__lista');
          const pinta = () => {
            lista.innerHTML = '';
            W.buscar(DESC).hijos.forEach(h => {
              const b = boton('', 'w11-perm__g' + (h.n === sel2 ? ' w11-perm__g--sel' : ''));
              b.append(WIN11.icono(/\.pdf$/.test(h.n) ? 'pdf' : 'documento'), sinTraducir(el('span', null, h.n)));
              b.addEventListener('click', () => { sel2 = h.n; pinta(); });
              b.addEventListener('dblclick', () => { sel2 = h.n; });
              lista.appendChild(b);
            });
          };
          pinta();
          t.appendChild(lista);
        }, botones: [{ t: 'Abrir', primario: true, f: () => {
          if (!sel2) { W.aviso('Elige primero un archivo.', 'cuidado'); return false; }
          if (!/\.inf$/.test(sel2)) { W.aviso('Eso no es un controlador: los controladores son archivos .inf.', 'cuidado'); return false; }
          alElegir(sel2);
        } }, { t: 'Cancelar' }] });
      }
    },
  });

  /* ============================================================
     S2 · Cambia el orden de arranque
     ============================================================ */
  registrarSimulacion('bios', {
    ventana: 'PC del aula',
    mision: [
      'Al encender, entra en la BIOS.',
      'Pon el USB con la ISO el primero del orden de arranque.',
      'Guarda los cambios y sal, para que arranque el instalador.',
      'Con Linux ya instalado, vuelve a poner el disco el primero y guarda.',
    ],
    final: 'Apunta en tu cuaderno la tecla con la que entraste en la BIOS, cómo quedó el orden de arranque para instalar y por qué al final volviste a poner el disco el primero (pregunta 13).',
    crear(ctx) {
      const { pantalla } = ctx;
      const SEG = 6; // segundos para pulsar F2
      const PESTANAS = ['Main', 'Advanced', 'Boot', 'Security', 'Exit'];
      const EXIT = ['Save Changes and Exit', 'Exit Discarding Changes', 'Load Setup Defaults'];
      const s = {
        orden: ['SSD: SAMSUNG 512GB', 'USB: Kingston 32GB', 'Network: PXE IPv4'],
        guardado: null, instalado: false, fase: 'apagado', pest: 0, item: 0, dialogo: null, dsel: 0, menu12: 0, timer: null, linea: 0,
      };
      s.guardado = s.orden.slice();
      const esUSB = o => o.indexOf('USB') === 0, esDisco = o => o.indexOf('SSD') === 0;

      const caja = el('div', 'bios');
      const mon = el('div', 'bios__monitor');
      mon.tabIndex = 0;
      mon.setAttribute('role', 'application');
      mon.setAttribute('aria-label', 'Pantalla del PC. Toca aquí para usar el teclado de verdad.');
      sinTraducir(mon);
      const caja2 = el('div', 'bios__torre');
      const bPower = boton('⏻', 'bios__power');
      bPower.setAttribute('aria-label', 'Botón de encendido del PC');
      bPower.title = 'Botón de encendido';
      const bReset = boton('↺', 'bios__power bios__power--reset');
      bReset.setAttribute('aria-label', 'Botón de reinicio del PC');
      bReset.title = 'Reiniciar';
      const led = el('span', 'bios__led');
      const usb = el('span', 'bios__usb', 'USB');
      usb.title = 'USB con la ISO de Linux Mint';
      caja2.append(bPower, bReset, led, usb);
      caja.append(mon, caja2);
      pantalla.appendChild(caja);
      const ayuda = el('p', 'bios__ayuda');
      pantalla.appendChild(ayuda);
      const avisos = el('div');
      avisos.setAttribute('aria-live', 'polite');
      pantalla.appendChild(avisos);
      const aviso = (t, tipo) => { avisos.innerHTML = ''; if (t) avisos.appendChild(ctx.aviso(t, tipo)); };
      const tk = el('div', 'w11__teclado');
      pantalla.appendChild(tk);
      const T = WIN11.teclado(tk, c => tecla(c));

      bPower.addEventListener('click', () => {
        if (s.fase === 'apagado') encender();
        else { apagar(); aviso(''); }
      });
      bReset.addEventListener('click', () => { if (s.fase !== 'apagado') { ctx.apunta('Botón de reinicio.'); encender(); } });
      mon.addEventListener('keydown', e => {
        const c = WIN11.comboDeEvento(e);
        if (!c) return;
        if (tecla(c, true)) e.preventDefault();
      });
      mon.addEventListener('pointerdown', () => mon.focus({ preventScroll: true }));
      ctx.alLimpiar && ctx.alLimpiar(() => clearInterval(s.timer));

      function apagar() { clearInterval(s.timer); s.fase = 'apagado'; pinta(); }
      function encender() {
        clearInterval(s.timer);
        s.fase = 'post';
        s.cuenta = SEG;
        pinta();
        mon.focus({ preventScroll: true });
        s.timer = setInterval(() => {
          if (!document.body.contains(caja)) { clearInterval(s.timer); return; }
          s.cuenta -= 0.25;
          if (s.cuenta <= 0) { clearInterval(s.timer); arrancar(s.guardado[0], 'sin pulsar nada'); return; }
          const b = mon.querySelector('.bios__barra-in');
          if (b) b.style.width = (100 * (SEG - s.cuenta) / SEG) + '%';
        }, 250);
      }
      function arrancar(primero, como) {
        clearInterval(s.timer);
        if (esUSB(primero)) { s.fase = s.instalado ? 'instalador2' : 'instalador'; if (s.instalado) ctx.falla('Arranca otra vez el instalador: el USB sigue el primero.'); }
        else if (esDisco(primero)) { s.fase = s.instalado ? 'linux' : 'windows'; if (!s.instalado) ctx.apunta(`Arranca Windows desde el disco (${como}).`); }
        else s.fase = 'pxe';
        s.linea = 0;
        pinta();
      }
      function tecla(c, fisico) {
        if (s.fase === 'apagado') return false;
        if (s.fase === 'post') {
          if (c === 'F2' || c === 'Supr') { clearInterval(s.timer); s.fase = 'setup'; s.pest = 0; s.item = 0; s.orden = s.guardado.slice(); ctx.cumple(0, `Al encender, pulsar ${c} mientras sale «Press F2 to enter Setup»: se abre la BIOS (Setup).`); pinta(); return true; }
          if (c === 'F12') { clearInterval(s.timer); s.fase = 'menu12'; s.menu12 = 0; ctx.apunta('F12: menú de arranque (no es la BIOS).'); pinta(); return true; }
          if (/^F\d+$|^Esc$/.test(c)) { ctx.apunta(`${c}: no hace nada en este ordenador.`); return true; }
          return !!fisico;
        }
        if (s.fase === 'menu12') {
          const ops = s.guardado.concat(['Enter Setup']);
          if (c === '↑') s.menu12 = (s.menu12 + ops.length - 1) % ops.length;
          else if (c === '↓') s.menu12 = (s.menu12 + 1) % ops.length;
          else if (c === 'Intro') {
            const o = ops[s.menu12];
            if (o === 'Enter Setup') { s.fase = 'setup'; s.pest = 0; s.item = 0; s.orden = s.guardado.slice(); ctx.cumple(0, 'F12 → Enter Setup: se abre la BIOS.'); }
            else if (esUSB(o) && !s.instalado) { aviso('Con el menú de arranque (F12) arrancas del USB solo esta vez. Hoy la misión es cambiar el orden en la BIOS: reinicia y pulsa la tecla de Setup.', 'cuidado'); ctx.apunta('F12 → USB: arranca del USB solo una vez.'); arrancar(o, 'F12'); return true; }
            else arrancar(o, 'F12');
          } else if (c === 'Esc') arrancar(s.guardado[0], 'Esc');
          else return !!fisico;
          pinta();
          return true;
        }
        if (s.fase === 'setup') return teclaSetup(c, fisico);
        if (s.fase === 'instalador' || s.fase === 'instalador2') {
          if (c === '↑' || c === '↓') { s.linea = 1 - s.linea; pinta(); return true; }
          if (c === 'Intro') {
            if (s.linea === 1) { aviso('Esa opción es para fábricas (OEM). Elige la primera: Start Linux Mint.', 'cuidado'); return true; }
            s.fase = 'instalando';
            pinta();
            setTimeout(() => { if (s.fase === 'instalando') { s.instalado = true; ctx.apunta('Instalar Linux Mint desde el USB.'); s.fase = 'fin-instalar'; pinta(); } }, window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 200 : 1600);
            return true;
          }
          return !!fisico;
        }
        if (s.fase === 'fin-instalar') { if (c === 'Intro') { ctx.apunta('Reiniciar después de instalar.'); encender(); return true; } return !!fisico; }
        if (s.fase === 'windows' || s.fase === 'linux' || s.fase === 'pxe') {
          if (c === 'Ctrl + Alt + Supr') { ctx.apunta('Ctrl + Alt + Supr: reiniciar.'); encender(); return true; }
          return false;
        }
        return false;
      }
      function teclaSetup(c, fisico) {
        if (s.dialogo) {
          if (c === '←' || c === '→' || c === 'Tab') { s.dsel = 1 - s.dsel; pinta(); return true; }
          if (c === 'Esc') { s.dialogo = null; pinta(); return true; }
          if (c === 'Intro') {
            const d = s.dialogo; s.dialogo = null;
            if (s.dsel === 0) { if (d === 'guardar') guardar(); else if (d === 'descartar') descartar(); else if (d === 'defecto') { s.orden = ['SSD: SAMSUNG 512GB', 'USB: Kingston 32GB', 'Network: PXE IPv4']; revisa(); pinta(); } }
            else pinta();
            return true;
          }
          return !!fisico;
        }
        const n = itemsDe(s.pest).length;
        if (c === '←') { s.pest = (s.pest + PESTANAS.length - 1) % PESTANAS.length; s.item = 0; }
        else if (c === '→') { s.pest = (s.pest + 1) % PESTANAS.length; s.item = 0; }
        else if (c === '↑') { if (n) s.item = (s.item + n - 1) % n; }
        else if (c === '↓') { if (n) s.item = (s.item + 1) % n; }
        else if (['+', 'F6', 'Shift + +'].indexOf(c) !== -1) mueve(-1);
        else if (['-', 'F5'].indexOf(c) !== -1) mueve(1);
        else if (c === 'F10') { s.dialogo = 'guardar'; s.dsel = 0; }
        else if (c === 'F9') { s.dialogo = 'defecto'; s.dsel = 0; }
        else if (c === 'Esc') { s.dialogo = 'descartar'; s.dsel = 0; }
        else if (c === 'Intro') {
          if (PESTANAS[s.pest] === 'Exit') { s.dialogo = ['guardar', 'descartar', 'defecto'][s.item]; s.dsel = 0; }
          else if (PESTANAS[s.pest] === 'Boot') { aviso('Para cambiar el orden, usa + y − (o F6 y F5), como dice la columna de la derecha.', 'cuidado'); }
        } else return !!fisico;
        pinta();
        return true;
      }
      function itemsDe(p) {
        return { Main: ['System Date', 'System Time'], Advanced: ['CPU Configuration', 'Virtualization Technology'], Boot: s.orden, Security: ['Administrator Password', 'Secure Boot'], Exit: EXIT }[PESTANAS[p]];
      }
      function mueve(d) {
        if (PESTANAS[s.pest] !== 'Boot') { aviso('El orden de arranque está en la pestaña Boot: muévete con ← y →.', 'cuidado'); return; }
        const i = s.item, j = i + d;
        if (j < 0 || j >= s.orden.length) return;
        [s.orden[i], s.orden[j]] = [s.orden[j], s.orden[i]];
        s.item = j;
        ctx.apunta(`${d < 0 ? 'Subir' : 'Bajar'} «${s.orden[j]}» al puesto ${j + 1}.`);
        revisa();
      }
      function revisa() {
        if (!s.instalado) {
          if (esUSB(s.orden[0])) ctx.cumple(1, 'En la pestaña Boot, subir «USB: Kingston» al primer puesto con + (o F6).');
          else if (ctx.hecho(1) && !ctx.hecho(2)) ctx.deshace(1);
        }
      }
      function guardar() {
        s.guardado = s.orden.slice();
        const primero = s.guardado[0];
        if (!s.instalado) {
          if (esUSB(primero)) ctx.cumple(2, 'F10 → Save configuration and exit? → Yes: se guarda el orden con el USB el primero.');
          else ctx.apunta('Guardar y salir, pero sin el USB el primero.');
        } else if (esDisco(primero)) ctx.cumple(3, 'Con Linux instalado: F2, subir el disco al primer puesto y F10 → Yes (guardar y salir).');
        else ctx.apunta('Guardar y salir, con el disco todavía detrás.');
        arrancar(primero, 'al salir de la BIOS');
      }
      function descartar() {
        s.orden = s.guardado.slice();
        if (!s.instalado && ctx.hecho(1) && !ctx.hecho(2)) ctx.deshace(1);
        ctx.falla('Exit Discarding Changes: salir sin guardar. El orden vuelve a como estaba.');
        arrancar(s.guardado[0], 'al salir sin guardar');
      }

      function pinta() {
        mon.innerHTML = '';
        mon.className = 'bios__monitor bios__monitor--' + s.fase;
        led.classList.toggle('bios__led--on', s.fase !== 'apagado');
        const pre = t => { const p = el('pre', 'bios__txt'); p.textContent = t; mon.appendChild(p); return p; };
        if (s.fase === 'apagado') {
          ayuda.textContent = s.instalado ? 'Linux ya está instalado. Enciende y deja el disco el primero otra vez.' : 'El USB con la ISO de Linux Mint ya está enchufado. Pulsa el botón de encendido ⏻ del PC.';
          return;
        }
        if (s.fase === 'post') {
          const logo = el('p', 'bios__logo', 'PCAULA');
          mon.appendChild(logo);
          pre('Press F2 to enter Setup\nPress F12 for Boot Menu');
          const b = el('div', 'bios__barra');
          b.appendChild(el('div', 'bios__barra-in'));
          mon.appendChild(b);
          ayuda.textContent = 'Lee lo que pone la pantalla y pulsa la tecla a tiempo (con el teclado de abajo o, después de tocar la pantalla, con el tuyo). Si no, arranca lo primero del orden.';
          return;
        }
        if (s.fase === 'menu12') {
          const box = el('div', 'bios__caja');
          box.appendChild(el('p', 'bios__caja-t', 'Please select boot device:'));
          s.guardado.concat(['Enter Setup']).forEach((o, i) => box.appendChild(el('p', 'bios__op' + (i === s.menu12 ? ' bios__op--sel' : ''), o)));
          box.appendChild(el('p', 'bios__pie', '↑ and ↓ to move selection\nENTER to select boot device\nESC to boot using defaults'));
          mon.appendChild(box);
          ayuda.textContent = 'Es el menú de arranque (Boot Menu): sirve para arrancar una sola vez desde otro sitio. Muévete con ↑ ↓ e Intro.';
          return;
        }
        if (s.fase === 'setup') return pintaSetup();
        if (s.fase === 'instalador' || s.fase === 'instalador2') {
          const box = el('div', 'bios__grub');
          box.appendChild(el('p', 'bios__grub-t', 'GNU GRUB'));
          ['Start Linux Mint 22 Xfce 64-bit', 'OEM install (for manufacturers)'].forEach((o, i) => box.appendChild(el('p', 'bios__op' + (i === s.linea ? ' bios__op--sel' : ''), o)));
          box.appendChild(el('p', 'bios__pie', 'Use the ↑ and ↓ keys to select which entry is highlighted.\nPress enter to boot the selected OS.'));
          mon.appendChild(box);
          ayuda.textContent = s.fase === 'instalador' ? 'Ha arrancado el instalador desde el USB. Elige la primera opción e Intro para instalar (en la Sesión 3 lo harás paso a paso).' : '¡Otra vez el instalador! El USB sigue el primero. Apaga o reinicia el PC, entra en la BIOS y pon el disco el primero.';
          return;
        }
        if (s.fase === 'instalando') { pre('Installing Linux Mint…\n\nCopying files…'); ayuda.textContent = 'Instalando…'; return; }
        if (s.fase === 'fin-instalar') { pre('Installation Complete\n\nRemove the installation medium, then press ENTER.'); ayuda.textContent = 'Instalación terminada. Pulsa Intro para reiniciar (el USB se queda enchufado).'; return; }
        if (s.fase === 'windows') {
          const w = el('div', 'bios__win');
          w.appendChild(WIN11.icono('inicio', 'bios__win-logo'));
          w.appendChild(el('p', 'bios__win-t', 'Windows'));
          mon.appendChild(w);
          ayuda.textContent = 'Ha arrancado Windows desde el disco, no el instalador. Reinicia el PC (botón ↺ o Ctrl + Alt + Supr) y entra en la BIOS a tiempo.';
          return;
        }
        if (s.fase === 'linux') { pre('Linux Mint 22 Xfce\n\npcaula-07 login: _'); ayuda.textContent = 'Arranca Linux desde el disco. Así se queda.'; return; }
        if (s.fase === 'pxe') { pre('>>Start PXE over IPv4.\n  PXE-E18: Server response timeout.\n\nNo bootable device found.'); ayuda.textContent = 'Intenta arrancar por la red y no hay nada. Reinicia y pon el USB el primero.'; }
      }
      function pintaSetup() {
        const top = el('div', 'bios__top');
        top.appendChild(el('p', 'bios__titulo', 'Aptio Setup Utility'));
        const tabs = el('div', 'bios__tabs');
        PESTANAS.forEach((p, i) => {
          const t = el('span', 'bios__tab' + (i === s.pest ? ' bios__tab--on' : ''), p);
          t.addEventListener('click', () => { if (!s.dialogo) { s.pest = i; s.item = 0; pinta(); } });
          tabs.appendChild(t);
        });
        top.appendChild(tabs);
        mon.appendChild(top);
        const cuerpo = el('div', 'bios__cuerpo');
        const izq = el('div', 'bios__izq');
        const der = el('div', 'bios__der');
        const P = PESTANAS[s.pest];
        const items = itemsDe(s.pest);
        const fila = (k, v, i) => {
          const f = el('div', 'bios__fila' + (i === s.item ? ' bios__fila--sel' : ''));
          f.append(el('span', null, k), el('span', 'bios__v', v || ''));
          f.addEventListener('click', () => { if (!s.dialogo) { s.item = i; pinta(); } });
          izq.appendChild(f);
        };
        if (P === 'Main') { izq.appendChild(el('p', 'bios__sec', 'System Information')); fila('System Date', '[Thu 01/07/2027]', 0); fila('System Time', '[16:05:12]', 1); izq.appendChild(el('p', 'bios__dato', 'Total Memory      8192 MB')); }
        if (P === 'Advanced') { fila('CPU Configuration', '', 0); fila('Virtualization Technology', '[Enabled]', 1); }
        if (P === 'Boot') { izq.appendChild(el('p', 'bios__sec', 'Boot Priority Order')); s.orden.forEach((o, i) => fila(`Boot Option #${i + 1}`, `[${o}]`, i)); }
        if (P === 'Security') { fila('Administrator Password', 'Not Installed', 0); fila('Secure Boot', '[Disabled]', 1); }
        if (P === 'Exit') EXIT.forEach((o, i) => fila(o, '', i));
        const ayudaItem = { Boot: 'Sets the system boot order.', Exit: ['Exit system setup after saving the changes.', 'Exit system setup without saving any changes.', 'Restore default values for all setup options.'][s.item] }[P] || '';
        der.appendChild(el('p', 'bios__der-t', ayudaItem));
        der.appendChild(el('pre', 'bios__teclas', '→←: Select Screen\n↑↓: Select Item\nEnter: Select\n+/-: Change Opt.\nF5/F6: Change Priority\nF9: Setup Defaults\nF10: Save & Exit\nESC: Exit'));
        cuerpo.append(izq, der);
        mon.appendChild(cuerpo);
        mon.appendChild(el('p', 'bios__ver', 'Version 2.22.1287. Copyright (C) 2026 PCAULA Inc.'));
        if (s.dialogo) {
          const d = el('div', 'bios__dlg');
          d.appendChild(el('p', 'bios__dlg-t', { guardar: 'Save & Exit Setup', descartar: 'Exit Without Saving', defecto: 'Load Setup Defaults' }[s.dialogo]));
          d.appendChild(el('p', null, { guardar: 'Save configuration and exit?', descartar: 'Quit without saving?', defecto: 'Load optimized defaults?' }[s.dialogo]));
          const b = el('p', 'bios__dlg-b');
          ['Yes', 'No'].forEach((x, i) => {
            const o = el('span', 'bios__op' + (i === s.dsel ? ' bios__op--sel' : ''), x);
            o.addEventListener('click', () => { s.dsel = i; teclaSetup('Intro'); });
            b.appendChild(o);
          });
          d.appendChild(b);
          mon.appendChild(d);
        }
        ayuda.textContent = 'La BIOS se maneja con el teclado. Mira la columna de la derecha: ← → cambian de pestaña, ↑ ↓ eligen, + y − (o F6 y F5) suben y bajan, F10 guarda y sale.';
      }
      pinta();
      void T;
    },
  });
})();
