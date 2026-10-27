/* ============================================================
   Simulaciones de la Unidad 5 de Operaciones (sistemas
   operativos), 27/10/2026. Usan el marco de js/simulador.js y van
   en tema.html después de él. (El simulador del instalador de la
   S3 está en js/lab-instalador.js, anterior al marco.)

   dispositivos  S1 «Arregla los controladores»: un Administrador
                 de dispositivos de mentira con dos aparatos con el
                 triángulo amarillo; uno se arregla solo y el otro
                 necesita el controlador de su modelo.
   bios          S2 «Cambia el orden de arranque»: entrar en la
                 BIOS al encender, poner el USB primero, guardar,
                 instalar y volver a dejar el disco primero.

   Las pantallas de la BIOS van en inglés, como las de verdad,
   con translate="no"; la ayuda de cada una, en castellano.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function') return;

  /* ============================================================
     S1 · Arregla los controladores
     ============================================================ */
  registrarSimulacion('dispositivos', {
    ventana: 'Administrador de dispositivos',
    mision: [
      'Encuentra los dos aparatos que tienen el triángulo amarillo ⚠.',
      'Arregla la impresora.',
      'Arregla el wifi con el controlador de su modelo.',
    ],
    final: 'Apunta en tu cuaderno qué dos aparatos tenían el triángulo, cómo arreglaste cada uno y qué controlador elegiste para el wifi (pregunta 7).',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const G = [
        { g: 'Adaptadores de red', d: [{ n: 'Intel(R) Wi-Fi 6 AX201', mal: 'wifi' }, { n: 'Realtek PCIe GbE (cable de red)' }] },
        { g: 'Adaptadores de pantalla', d: [{ n: 'Intel(R) UHD Graphics' }] },
        { g: 'Colas de impresión', d: [{ n: 'Fax' }] },
        { g: 'Otros dispositivos', d: [{ n: 'Dispositivo desconocido (impresora HP)', mal: 'impresora' }] },
        { g: 'Teclados', d: [{ n: 'Teclado HID estándar' }] },
        { g: 'Unidades de disco', d: [{ n: 'SSD de 512 GB' }] },
      ];
      const abiertos = new Set();
      const vistos = new Set();
      const arreglado = { wifi: false, impresora: false };
      let sel = null;

      function pintar(mensaje) {
        ctx.barra('Administrador de dispositivos');
        pantalla.innerHTML = '';
        pantalla.appendChild(el('p', 'sim__ayuda', 'Cada grupo se abre pulsándolo. Los aparatos sin controlador llevan ⚠.'));
        const arbol = el('ul', 'sim__arbol');
        G.forEach((gr, gi) => {
          const li = el('li');
          const malo = gr.d.some(d => d.mal && !arreglado[d.mal]);
          const b = boton(`${abiertos.has(gi) ? '▾' : '▸'} ${gr.g}`, 'sim__tema');
          b.setAttribute('aria-expanded', String(abiertos.has(gi)));
          b.addEventListener('click', () => { abiertos.has(gi) ? abiertos.delete(gi) : abiertos.add(gi); pintar(); });
          li.appendChild(b);
          if (abiertos.has(gi)) {
            const sub = el('ul', 'sim__arbol-sub');
            gr.d.forEach(d => {
              const di = el('li');
              const roto = d.mal && !arreglado[d.mal];
              const bd = boton((roto ? '⚠ ' : '') + (d.mal === 'impresora' && arreglado.impresora ? 'HP DeskJet 2700' : d.n), 'sim__tema' + (roto ? ' sim__peligro' : ''));
              bd.setAttribute('translate', 'no');
              bd.addEventListener('click', () => {
                sel = d;
                if (roto) {
                  vistos.add(d.mal);
                  if (vistos.size === 2) ctx.cumple(0, 'Encontrar el ⚠ en «Adaptadores de red» (wifi Intel AX201) y en «Otros dispositivos» (impresora HP).');
                }
                propiedades(d);
              });
              di.appendChild(bd);
              sub.appendChild(di);
            });
            li.appendChild(sub);
          }
          arbol.appendChild(li);
          if (malo && !abiertos.has(gi)) b.classList.add('sim__peligro');
        });
        pantalla.appendChild(arbol);
        if (mensaje) pantalla.appendChild(mensaje);
      }

      function propiedades(d) {
        const roto = d.mal && !arreglado[d.mal];
        ctx.barra('Propiedades: ' + d.n);
        pantalla.innerHTML = '';
        const volver = boton('‹ Volver a la lista');
        volver.addEventListener('click', () => pintar());
        pantalla.appendChild(volver);
        const n = el('p', 'sim__h', d.mal === 'impresora' && arreglado.impresora ? 'HP DeskJet 2700' : d.n);
        n.setAttribute('translate', 'no');
        pantalla.appendChild(n);
        pantalla.appendChild(el('p', roto ? 'sim__peligro' : null, roto ? 'Estado: no se han instalado los controladores de este dispositivo.' : 'Estado: este dispositivo funciona correctamente.'));
        const msg = el('div');
        msg.setAttribute('aria-live', 'polite');
        const f = el('div', 'lab__fila');
        const auto = boton('Actualizar controlador → Buscar automáticamente');
        auto.addEventListener('click', () => {
          msg.innerHTML = '';
          archivos.innerHTML = '';
          if (!roto) { msg.appendChild(ctx.aviso('Ya tiene el mejor controlador. No hace falta tocar nada.', 'cuidado')); return; }
          if (d.mal === 'impresora') {
            arreglado.impresora = true;
            ctx.cumple(1, 'Impresora: Actualizar controlador → Buscar automáticamente. Windows lo encuentra solo y ahora se llama «HP DeskJet 2700».');
            pintar(ctx.aviso('Windows ha encontrado el controlador solo: era una impresora HP DeskJet 2700.', 'ok'));
          } else {
            ctx.apunta('Wifi: Buscar automáticamente → Windows no lo encuentra (sin wifi no puede buscar en Internet).');
            msg.appendChild(ctx.aviso('Windows no lo encuentra: busca en Internet, y sin wifi no tiene Internet. Descarga el controlador del fabricante en otro ordenador, o conecta el cable de red, y elígelo a mano.'));
          }
        });
        const archivos = el('div');
        const mano = boton('Actualizar controlador → Elegir un archivo');
        mano.addEventListener('click', () => {
          msg.innerHTML = '';
          archivos.innerHTML = '';
          if (!roto) { msg.appendChild(ctx.aviso('Este funciona bien: no hace falta.', 'cuidado')); return; }
          archivos.appendChild(el('p', 'sim__etiqueta', 'Elige el archivo del controlador:'));
          const lista = el('div', 'lab__fila');
          [['wifi-intel-ax201.exe', 'ok'], ['wifi-realtek-rtl8822.exe', 'otro'], ['impresora-hp-deskjet.exe', 'imp'], ['driver-gratis-todo-en-uno.exe', 'raro']].forEach(([a, t]) => {
            const b = boton('📄 ' + a, 'lab__boton lab__boton--codigo');
            b.setAttribute('translate', 'no');
            b.addEventListener('click', () => {
              msg.innerHTML = '';
              if (d.mal === 'wifi' && t === 'ok') {
                arreglado.wifi = true;
                ctx.cumple(2, 'Wifi: Actualizar controlador → elegir «wifi-intel-ax201.exe», el del mismo modelo que pone en el nombre (Intel AX201).');
                pintar(ctx.aviso('Controlador instalado: el wifi ya funciona.', 'ok'));
              } else if (t === 'raro') {
                ctx.falla(`Intentar instalar «${a}».`);
                msg.appendChild(ctx.aviso('Un «controlador para todo» descargado de cualquier web puede traer un virus. El controlador se baja de la web del fabricante, para tu modelo.'));
              } else if (d.mal === 'impresora' && t === 'imp') {
                arreglado.impresora = true;
                ctx.cumple(1, 'Impresora: Actualizar controlador → elegir «impresora-hp-deskjet.exe».');
                pintar(ctx.aviso('Controlador instalado: la impresora ya funciona.', 'ok'));
              } else {
                ctx.falla(`Probar «${a}» en ${d.n}: no es el de ese aparato.`);
                msg.appendChild(ctx.aviso('Ese controlador es de otro aparato o de otro modelo. Mira el nombre del dispositivo: la marca y el modelo tienen que coincidir.'));
              }
            });
            lista.appendChild(b);
          });
          archivos.appendChild(lista);
        });
        const quitar = boton('Desinstalar el dispositivo');
        quitar.addEventListener('click', () => {
          msg.innerHTML = '';
          ctx.falla(`Intentar desinstalar «${d.n}».`);
          msg.appendChild(ctx.aviso('Desinstalarlo no lo arregla: el aparato deja de funcionar del todo. Lo que falta es su controlador.'));
        });
        f.appendChild(auto);
        f.appendChild(mano);
        f.appendChild(quitar);
        pantalla.appendChild(f);
        pantalla.appendChild(archivos);
        pantalla.appendChild(msg);
      }
      pintar();
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
      const { el, boton, pantalla } = ctx;
      const s = { orden: ['Disco: SSD', 'USB: Kingston', 'Red (PXE)'], guardado: ['Disco: SSD', 'USB: Kingston', 'Red (PXE)'], instalado: false, fase: 'apagado' };
      const negra = t => { const p = el('pre', 'inst__negra'); p.setAttribute('translate', 'no'); p.textContent = t; return p; };
      function ir(f) { s.fase = f; pintar(); }
      function pintar(extra) {
        pantalla.innerHTML = '';
        ({ apagado, logo, bios, arranca, menu12 })[s.fase]();
        if (extra) pantalla.appendChild(extra);
      }
      function apagado() {
        ctx.barra('PC del aula · apagado');
        pantalla.appendChild(el('p', null, s.instalado ? 'Linux ya está instalado. Toca dejar el disco el primero otra vez.' : 'El USB con la ISO de Linux Mint ya está enchufado. Enciende el ordenador.'));
        const b = boton('⏻ Encender', 'lab__boton lab__boton--activo');
        b.addEventListener('click', () => ir('logo'));
        pantalla.appendChild(b);
      }
      function logo() {
        ctx.barra('PC del aula · arrancando');
        pantalla.appendChild(negra('PCAULA\n\nPress F2 to enter Setup\nPress F12 for Boot Menu'));
        pantalla.appendChild(el('p', 'sim__ayuda', 'Pone: «Pulsa F2 para entrar en la configuración» y «F12 para el menú de arranque». Tienes unos segundos.'));
        const f = el('div', 'lab__fila');
        [['F2', () => { ctx.cumple(0, 'Al encender, pulsar F2: se abre la BIOS (Setup).'); ir('bios'); }],
          ['F12', () => ir('menu12')],
          ['Esc', () => { ctx.apunta('Esc: no hace nada en este ordenador.'); pintar(ctx.aviso('En este ordenador, Esc no hace nada. Lee lo que pone en la pantalla.', 'cuidado')); }],
          ['No pulsar nada', () => { ctx.apunta('No pulsar nada: arranca lo primero del orden.'); ir('arranca'); }],
        ].forEach(([t, fn]) => {
          const b = boton(t, 'lab__boton sim__tecla');
          b.setAttribute('translate', 'no');
          b.addEventListener('click', fn);
          f.appendChild(b);
        });
        pantalla.appendChild(f);
      }
      function menu12() {
        ctx.barra('PC del aula · Boot Menu');
        pantalla.appendChild(negra('Boot Menu\n\n' + s.guardado.map((o, i) => `${i + 1}. ${o}`).join('\n')));
        pantalla.appendChild(ctx.aviso('El menú de arranque (F12) sirve para arrancar una sola vez desde otro sitio. Hoy la misión es cambiar el orden en la BIOS: apaga y vuelve a encender.', 'cuidado'));
        ctx.apunta('F12: menú de arranque (no es la BIOS).');
        const b = boton('⏻ Apagar');
        b.addEventListener('click', () => ir('apagado'));
        pantalla.appendChild(b);
      }
      function bios() {
        ctx.barra('BIOS Setup Utility · Boot');
        const caja = el('div', 'sim__bios');
        caja.setAttribute('translate', 'no');
        caja.appendChild(el('p', 'sim__bios-titulo', 'BIOS SETUP UTILITY      Main   [Boot]   Exit'));
        caja.appendChild(el('p', null, 'Boot Priority Order'));
        const ol = el('ol', 'sim__bios-orden');
        s.orden.forEach((o, i) => {
          const li = el('li');
          li.appendChild(el('span', null, o));
          const sube = boton('▲', 'lab__boton sim__tecla');
          sube.setAttribute('aria-label', `Subir ${o}`);
          sube.disabled = i === 0;
          sube.addEventListener('click', () => { [s.orden[i - 1], s.orden[i]] = [s.orden[i], s.orden[i - 1]]; ctx.apunta(`Subir «${o}» al puesto ${i}.`); revisa(); pintar(); });
          const baja = boton('▼', 'lab__boton sim__tecla');
          baja.setAttribute('aria-label', `Bajar ${o}`);
          baja.disabled = i === s.orden.length - 1;
          baja.addEventListener('click', () => { [s.orden[i + 1], s.orden[i]] = [s.orden[i], s.orden[i + 1]]; ctx.apunta(`Bajar «${o}» al puesto ${i + 2}.`); revisa(); pintar(); });
          li.appendChild(sube);
          li.appendChild(baja);
          ol.appendChild(li);
        });
        caja.appendChild(ol);
        pantalla.appendChild(caja);
        pantalla.appendChild(el('p', 'sim__ayuda', '«Boot Priority Order» es el orden de arranque: arranca con el primero que tenga un sistema. Muévelos con ▲ ▼.'));
        const f = el('div', 'lab__fila');
        const g = boton('Save Changes and Exit (F10)', 'lab__boton lab__boton--activo');
        g.setAttribute('translate', 'no');
        g.addEventListener('click', () => {
          s.guardado = s.orden.slice();
          const primero = s.guardado[0];
          if (!s.instalado) {
            if (primero.startsWith('USB')) ctx.cumple(2, 'Save Changes and Exit (F10): se guarda el orden con el USB el primero.');
            else ctx.apunta('Guardar y salir, pero sin el USB el primero.');
          } else if (primero.startsWith('Disco')) {
            ctx.cumple(3, 'Con Linux instalado: F2, subir el disco al primer puesto y Save Changes and Exit.');
          } else ctx.apunta('Guardar y salir, con el disco todavía detrás.');
          ir('arranca');
        });
        const d = boton('Exit Discarding Changes', 'lab__boton');
        d.setAttribute('translate', 'no');
        d.addEventListener('click', () => {
          s.orden = s.guardado.slice();
          ctx.falla('Exit Discarding Changes: salir sin guardar. El orden vuelve a como estaba.');
          revisa();
          ir('arranca');
        });
        f.appendChild(g);
        f.appendChild(d);
        pantalla.appendChild(f);
        pantalla.appendChild(el('p', 'sim__ayuda', 'Save Changes and Exit: guardar y salir. Exit Discarding Changes: salir sin guardar.'));
      }
      function revisa() {
        if (!s.instalado) {
          if (s.orden[0].startsWith('USB')) ctx.cumple(1, 'En Boot, subir «USB: Kingston» al primer puesto.');
          else if (ctx.hecho(1) && !ctx.hecho(2)) ctx.deshace(1);
        }
      }
      function arranca() {
        ctx.barra('PC del aula · arrancando');
        const primero = s.guardado[0];
        if (primero.startsWith('USB') && !s.instalado) {
          pantalla.appendChild(negra('  Start Linux Mint 22 Xfce 64-bit\n  OEM install (for manufacturers)'));
          pantalla.appendChild(el('p', null, 'Ha arrancado el instalador desde el USB. Imagina que instalas Linux (lo harás en la Sesión 3).'));
          const b = boton('Instalar Linux y apagar', 'lab__boton lab__boton--activo');
          b.addEventListener('click', () => { s.instalado = true; ctx.apunta('Instalar Linux desde el USB y apagar.'); ir('apagado'); });
          pantalla.appendChild(b);
        } else if (primero.startsWith('USB') && s.instalado) {
          pantalla.appendChild(negra('  Start Linux Mint 22 Xfce 64-bit\n  OEM install (for manufacturers)'));
          pantalla.appendChild(ctx.aviso('¡Otra vez el instalador! El USB sigue el primero. Entra en la BIOS y pon el disco el primero.'));
          ctx.falla('Arranca otra vez el instalador: el USB sigue el primero.');
          const b = boton('⏻ Apagar');
          b.addEventListener('click', () => ir('apagado'));
          pantalla.appendChild(b);
        } else {
          pantalla.appendChild(negra(s.instalado ? 'Linux Mint 22\n\npixelrojo-pc login: _' : 'Windows\n\nIniciando…'));
          pantalla.appendChild(el('p', null, s.instalado ? 'Arranca Linux desde el disco. Así se queda.' : 'Ha arrancado Windows desde el disco, no el instalador: el USB no estaba el primero.'));
          if (!s.instalado) ctx.apunta('Arranca Windows: el USB no iba el primero.');
          const b = boton('⏻ Apagar');
          b.addEventListener('click', () => ir('apagado'));
          pantalla.appendChild(b);
        }
      }
      pintar();
    },
  });
})();
