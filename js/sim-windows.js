/* ============================================================
   Simulaciones de la Unidad 6 de Operaciones (Windows), 15/11/2026.
   Usan el marco de js/simulador.js y el Windows 11 de mentira de
   js/win11.js y js/win11-archivos.js (van antes en tema.html).

   w-escritorio  S1: abrir el Explorador con su atajo, anclar la
                 Calculadora, ajustar dos ventanas a media pantalla,
                 Alt + Tab y ver el escritorio.
   w-archivos    S2: restaurar de la Papelera, ver los ocultos, solo
                 lectura, acceso directo (no una copia) y buscar *.pdf.
   w-usb         S3: el vídeo de 6,2 GB no cabe en un USB FAT32:
                 guardar lo del USB, formatear en exFAT o NTFS,
                 copiar y expulsar.
   w-config      S4: Configuración: cuenta local estándar, desinstalar
                 un programa basura e impresora predeterminada.
   w-tareas      S5: Administrador de tareas: cerrar un programa que
                 no responde, ordenar por memoria y quitar uno del
                 arranque. Si cierras el Explorador de Windows, se va
                 la barra de tareas (y se arregla con «Ejecutar nueva
                 tarea» → explorer).
   w-permisos    S5: permisos NTFS de una carpeta (Propiedades →
                 Seguridad → Editar).

   Todo inventado. Nada se guarda.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function' || !window.WIN11 || !window.WIN11.fs) return;
  const { el, boton } = window.LAB;
  const { icono } = window.WIN11;
  const { carpeta, archivo, unidad, equipo, usuario, KB, MB, GB, tamano } = window.WIN11.fs;

  /* ---------- piezas de Configuración (Windows 11) ---------- */
  function interruptor(texto, valor, alCambiar) {
    const l = el('label', 'w11-sw');
    const i = document.createElement('input');
    i.type = 'checkbox';
    i.setAttribute('role', 'switch');
    i.checked = !!valor;
    const t = el('span', 'w11-sw__t', valor ? 'Activado' : 'Desactivado');
    i.addEventListener('change', () => { t.textContent = i.checked ? 'Activado' : 'Desactivado'; alCambiar(i.checked); });
    l.append(el('span', 'w11-sw__texto', texto), t, i, el('span', 'w11-sw__pista'));
    return l;
  }
  function tarjeta(ic, titulo, sub, derecha, alPulsar) {
    const c = el(alPulsar ? 'button' : 'div', 'w11-cfg__tarjeta');
    if (alPulsar) { c.type = 'button'; c.addEventListener('click', alPulsar); }
    if (ic) c.appendChild(icono(ic, 'w11-cfg__tico'));
    const t = el('span', 'w11-cfg__ttexto');
    const tt = el('span', 'w11-cfg__ttitulo', titulo);
    t.appendChild(tt);
    if (sub) t.appendChild(el('span', 'w11-cfg__tsub', sub));
    c.appendChild(t);
    if (derecha) c.appendChild(derecha);
    else if (alPulsar) c.appendChild(el('span', 'w11-cfg__flecha', '›'));
    return c;
  }

  /* ============================================================
     S1 · El escritorio y las ventanas
     ============================================================ */
  registrarSimulacion('w-escritorio', {
    ventana: 'Windows 11',
    mision: [
      'Abre el Explorador de archivos con su atajo de teclado, sin tocar el ratón.',
      'Ancla la Calculadora a la barra de tareas.',
      'Pon el Explorador en la mitad izquierda de la pantalla y el Bloc de notas en la mitad derecha.',
      'Pasa del Bloc de notas al Explorador con el teclado, sin tocar el ratón.',
      'Esconde todas las ventanas de golpe para ver el escritorio.',
    ],
    final: 'Apunta en tu cuaderno cómo has hecho cada una de las cinco cosas: el atajo que has pulsado o dónde has hecho clic (pregunta 13).',
    crear(ctx) {
      const W = WIN11.escritorio(ctx, {
        fs: equipo(usuario({
          escritorio: [carpeta('practicas-u6', [archivo('lista.txt', 2 * KB, { contenido: 'Practicas de la U6' })]), archivo('horario.pdf', 210 * KB)],
          documentos: [archivo('apuntes-u5.docx', 64 * KB)],
        })),
        barra: ['explorador', 'navegador'],
      });
      W.abrirApp('bloc', { origen: 'inicio', texto: 'Para mañana:\n- traer el USB\n- acabar la práctica de Windows' });
      let antes = null, ahora = W.activa;
      W.on('foco', d => { if (d.v !== ahora) { antes = ahora; ahora = d.v; } });
      W.on('app', d => {
        if (d.id !== 'explorador') return;
        if (d.origen === 'atajo') ctx.cumple(0, 'Abrir el Explorador con el teclado: Windows + E.');
        else if (!ctx.hecho(0)) { ctx.apunta('Abrir el Explorador con el ratón.'); W.aviso('Se ha abierto, pero con el ratón. La misión pide el atajo de teclado: búscalo en la tabla de los atajos de la sesión.', 'cuidado'); }
      });
      W.on('anclar', d => {
        if (d.id !== 'calculadora') return;
        if (d.si) ctx.cumple(1, `Anclar la Calculadora a la barra de tareas (${d.donde === 'inicio' ? 'menú Inicio → clic derecho → Anclar a la barra de tareas' : 'clic derecho en su botón → Anclar a la barra de tareas'}).`);
        else if (ctx.hecho(1)) { ctx.deshace(1); ctx.apunta('Desanclar la Calculadora de la barra de tareas.'); }
      });
      const como = {};
      W.on('ajustar', d => {
        como[d.v.app] = d.origen === 'atajo' ? (d.lado === 'izq' ? 'Windows + ←' : 'Windows + →') : 'arrastrando la barra de título hasta el borde';
        ctx.apunta(`Ajustar ${(W.apps[d.v.app] || { n: d.v.def.titulo }).n} a la ${d.lado === 'izq' ? 'izquierda' : d.lado === 'der' ? 'derecha' : 'pantalla'} (${como[d.v.app]}).`);
        revisa();
      });
      W.on('max', revisa);
      function revisa() {
        const e = W.ventanas.find(v => v.app === 'explorador' && v.estado === 'izq');
        const b = W.ventanas.find(v => v.app === 'bloc' && v.estado === 'der');
        if (e && b) ctx.cumple(2, `Explorador a la izquierda (${como.explorador}) y Bloc de notas a la derecha (${como.bloc}).`);
      }
      W.on('alttab', d => {
        if (d.v.app === 'explorador' && antes && antes.app === 'bloc') ctx.cumple(3, 'Alt + Tab: del Bloc de notas al Explorador.');
        else ctx.apunta(`Alt + Tab: ${d.v.def.titulo}.`);
      });
      W.on('foco', d => {
        if (ctx.hecho(3) || d.v.app !== 'explorador' || !antes || antes.app !== 'bloc') return;
        setTimeout(() => { if (!ctx.hecho(3) && W._ultimoClic && Date.now() - W._ultimoClic < 400) W.aviso('Has cambiado de ventana con el ratón. La misión pide hacerlo con el teclado.', 'cuidado'); }, 0);
      });
      W.raiz.addEventListener('pointerdown', () => { W._ultimoClic = Date.now(); }, true);
      W.on('escritorio', d => {
        if (!d.ocultas) return;
        ctx.cumple(4, d.origen === 'atajo' ? 'Windows + D: se esconden todas las ventanas y se ve el escritorio.' : 'Clic en la esquina de la derecha de la barra de tareas («Mostrar el escritorio»).');
      });
    },
  });

  /* ============================================================
     S2 · Archivos a fondo
     ============================================================ */
  registrarSimulacion('w-archivos', {
    ventana: 'Windows 11',
    mision: [
      'Ayer borraste sin querer trabajo-final.docx. Recupéralo: tiene que volver a Documentos.',
      'En Documentos hay un archivo oculto. Haz que se vea.',
      'Pon el archivo normas-clase.pdf de solo lectura.',
      'Crea en el Escritorio un acceso directo a la carpeta practicas-u6 de Documentos (no una copia).',
      'Encuentra con el buscador del Explorador todos los PDF de Documentos, también los de dentro de las carpetas.',
    ],
    final: 'Apunta en tu cuaderno el nombre del archivo oculto y cómo lo hiciste aparecer, cómo pusiste normas-clase.pdf de solo lectura, cómo creaste el acceso directo y en qué se nota que no es una copia, y qué escribiste en el buscador (pregunta 14).',
    crear(ctx) {
      const normas = archivo('normas-clase.pdf', 320 * KB);
      const W = WIN11.escritorio(ctx, {
        fs: equipo(usuario({
          escritorio: [archivo('horario.pdf', 210 * KB)],
          documentos: [
            carpeta('practicas-u6', [archivo('enunciado-u6.pdf', 180 * KB), archivo('ejercicio-1.txt', 3 * KB), archivo('ejercicio-2.txt', 2 * KB)]),
            carpeta('fotos-clase', [archivo('grupo.jpg', 2.4 * MB)]),
            normas,
            archivo('notas-privadas.txt', 2 * KB, { oculto: true, contenido: 'Contraseña del wifi de casa: ¡no la pongas aquí! :)' }),
            archivo('apuntes-u5.docx', 64 * KB),
          ],
          descargas: [archivo('ficha-matricula.pdf', 95 * KB)],
        })),
        barra: ['explorador', 'navegador'],
      });
      W.aLaPapelera(archivo('trabajo-final.docx', 48 * KB), ['C:', 'Users', 'alumno', 'Documents']);
      W.aLaPapelera(archivo('captura-vieja.png', 340 * KB), ['C:', 'Users', 'alumno', 'Desktop']);
      W.abrirExplorador(['C:', 'Users', 'alumno', 'Documents']);
      const DOC = ['C:', 'Users', 'alumno', 'Documents'];
      const PDFS = ['enunciado-u6.pdf', 'normas-clase.pdf'];
      W.on('cambio', () => {
        const doc = W.buscar(DOC);
        if (doc && doc.hijos.some(h => h.n === 'trabajo-final.docx')) ctx.cumple(0, 'Papelera de reciclaje → trabajo-final.docx → Restaurar: vuelve a Documentos.');
        if (W.est.verOcultos) ctx.cumple(1, 'Ver → Mostrar → Elementos ocultos: aparece notas-privadas.txt, más clarito.');
        else if (ctx.hecho(1)) ctx.deshace(1);
        if (normas.soloLectura) ctx.cumple(2, 'Clic derecho en normas-clase.pdf → Propiedades → Atributos: Solo lectura → Aplicar.');
        else if (ctx.hecho(2)) { ctx.deshace(2); }
        const esc = W.buscar(['C:', 'Users', 'alumno', 'Desktop']);
        const acc = esc.hijos.find(h => h.acceso && /practicas-u6$/i.test(h.acceso.join('\\')));
        if (acc) ctx.cumple(3, `Acceso directo «${acc.n}» en el Escritorio (con la flecha).`);
        else if (ctx.hecho(3)) ctx.deshace(3);
      });
      W.on('fs', d => {
        if (d.tipo === 'copiar' && d.dest && d.dest.n === 'Desktop' && d.nodos.some(n => n.n === 'practicas-u6' && n.carpeta)) {
          W.aviso('Eso es una copia de la carpeta: ocupa lo mismo y si cambias algo en una, la otra no cambia. Un acceso directo lleva una flecha y solo apunta al original. Busca «Mostrar más opciones».', 'cuidado');
          ctx.falla('Copiar practicas-u6 en el Escritorio: es una copia, no un acceso directo.');
        }
        if (d.tipo === 'mover' && d.dest && d.dest.n === 'Desktop' && d.nodos.some(n => n.n === 'practicas-u6')) {
          W.aviso('Has movido la carpeta entera al Escritorio: ya no está en Documentos. Deshazlo con Ctrl + Z y crea un acceso directo.', 'cuidado');
          ctx.falla('Mover practicas-u6 al Escritorio: ya no está en Documentos.');
        }
        if (d.tipo === 'buscar') {
          const r = d.resultados || [];
          const enDoc = d.en && d.en.n === 'Documents';
          if (enDoc && r.length >= PDFS.length && r.every(n => /\.pdf$/i.test(n.n)) && PDFS.every(p => r.some(n => n.n === p))) ctx.cumple(4, `Buscar «${d.q}» en Documentos: salen ${r.map(n => n.n).join(' y ')}.`);
          else if (!enDoc && !d.vivo) W.aviso('Busca dentro de Documentos: el buscador del Explorador busca en la carpeta que tienes abierta y en las de dentro.', 'cuidado');
        }
        if (d.tipo === 'eliminar' && d.permanente) W.aviso('Shift + Supr borra para siempre: eso no se puede recuperar de la Papelera.', 'cuidado');
      });
    },
  });

  /* ============================================================
     S3 · El USB y el vídeo de 6 GB
     ============================================================ */
  registrarSimulacion('w-usb', {
    ventana: 'Windows 11',
    mision: [
      'Copia el vídeo video-proyecto.mp4 (está en Vídeos) al USB. Si Windows se queja, lee bien el mensaje.',
      'Antes de formatear, guarda en Documentos todo lo que hay en el USB.',
      'Formatea el USB con un sistema de archivos que admita archivos de más de 4 GB y ponle de nombre CLASE.',
      'Ahora sí: copia el vídeo al USB.',
      'Expulsa el USB antes de quitarlo.',
    ],
    final: 'Apunta en tu cuaderno qué sistema de archivos tenía el USB, qué mensaje salió y por qué, qué sistema elegiste al formatear y por qué guardaste antes lo que había en el USB (pregunta 13).',
    crear(ctx) {
      const usb = unidad('E:', 'USB', 28.8 * GB, 0, [archivo('trabajo-tecnologia.docx', 52 * KB), carpeta('fotos-excursion', Array.from({ length: 6 }, (_, i) => archivo(`foto-${i + 1}.jpg`, 3.2 * MB)))], { usb: true, fs: 'FAT32' });
      usb.libre = usb.capacidad - (52 * KB + 6 * Math.round(3.2 * MB));
      const W = WIN11.escritorio(ctx, {
        fs: equipo(usuario({ videos: [archivo('video-proyecto.mp4', 6.2 * GB)], documentos: [archivo('apuntes-u5.docx', 64 * KB)] }), usb),
        barra: ['explorador', 'navegador'],
      });
      W.abrirExplorador(['C:', 'Users', 'alumno', 'Videos']);
      W.notificacion('USB (E:)', 'Se ha conectado un dispositivo USB.', 'usb');
      let perdido = false;
      const DOC = ['C:', 'Users', 'alumno', 'Documents'];
      function guardado() { const d = W.buscar(DOC); return d && ['trabajo-tecnologia.docx', 'fotos-excursion'].every(n => d.hijos.some(h => h.n === n)); }
      W.on('fs', d => {
        if (d.tipo === 'error' && d.error === 'fat32') ctx.cumple(0, 'Copiar video-proyecto.mp4 al USB: «El archivo es demasiado grande para el sistema de archivos de destino». El USB está en FAT32, que no admite archivos de más de 4 GB.');
        if (d.tipo === 'formatear' && d.nodo === usb) {
          if (!ctx.hecho(1)) {
            perdido = true;
            ctx.falla(`Formatear sin guardar antes: se han perdido ${d.perdidos.map(n => n.n).join(' y ')}.`);
            W.aviso('¡Has formateado sin guardar antes lo que había en el USB! Se ha perdido. Pulsa «Empezar otra vez» y guárdalo primero.');
            return;
          }
          if (d.nodo.fs === 'FAT32') { W.aviso('Lo has formateado otra vez en FAT32: el vídeo sigue sin caber.', 'cuidado'); return; }
          if (d.nodo.etiqueta.toUpperCase() !== 'CLASE') { W.aviso('El sistema de archivos está bien, pero el nombre (la etiqueta del volumen) tiene que ser CLASE.', 'cuidado'); return; }
          ctx.cumple(2, `Clic derecho en USB (E:) → Formatear… → ${d.nodo.fs}, etiqueta CLASE → Iniciar → Aceptar.`);
        }
        if (d.tipo === 'expulsar') {
          if (ctx.hecho(3)) ctx.cumple(4, 'Clic derecho en el USB → Expulsar: «Es seguro quitar el hardware».');
          else { ctx.falla('Expulsar el USB antes de copiar el vídeo.'); W.aviso('Lo has expulsado antes de acabar. Pulsa «Empezar otra vez».', 'cuidado'); }
        }
      });
      W.on('cambio', () => {
        if (!perdido && guardado()) ctx.cumple(1, 'Copiar trabajo-tecnologia.docx y fotos-excursion del USB a Documentos.');
        if (!usb.expulsado && usb.hijos.some(h => h.n === 'video-proyecto.mp4') && ctx.hecho(2)) ctx.cumple(3, `Copiar video-proyecto.mp4 (6,2 GB) al USB en ${usb.fs}: ahora sí cabe.`);
      });
    },
  });

  /* ============================================================
     S4 · Configuración: cuentas, aplicaciones, impresoras
     ============================================================ */
  function appConfiguracion(W, estado, ctx) {
    const PAGINAS = [
      ['sistema', 'Sistema', 'equipo'], ['dispositivos', 'Bluetooth y dispositivos', 'impresora'], ['red', 'Red e Internet', 'wifi'],
      ['personalizacion', 'Personalización', 'imagen'], ['apps', 'Aplicaciones', 'app'], ['cuentas', 'Cuentas', 'usuario'],
      ['idioma', 'Hora e idioma', 'navegador'], ['update', 'Windows Update', 'recargar'],
    ];
    return (W2, o) => W.abrir({ app: 'configuracion', titulo: 'Configuración', icono: 'configuracion', ancho: 82, alto: 88, crear: (c, v) => {
      c.classList.add('w11-cfg');
      const nav = el('div', 'w11-cfg__nav');
      const usu = el('div', 'w11-cfg__usu');
      usu.append(icono('usuario'), el('span', null, 'alumno'));
      nav.appendChild(usu);
      const pag = el('div', 'w11-cfg__pag');
      c.append(nav, pag);
      let actual = (o && o.pagina) || 'inicio', sub = (o && o.sub) || null;
      v.ir = (p, s) => { actual = p; sub = s || null; pintar(); };
      PAGINAS.forEach(([id, t, ic]) => {
        const b = boton('', 'w11-cfg__ni');
        b.append(icono(ic), el('span', null, t));
        b.dataset.p = id;
        b.addEventListener('click', () => v.ir(id));
        nav.appendChild(b);
      });
      function cabecera(migas) {
        const h = el('div', 'w11-cfg__h');
        migas.forEach((m, i) => {
          if (i) h.appendChild(el('span', 'w11-cfg__hsep', '›'));
          if (i < migas.length - 1) { const b = boton(m[0], 'w11-cfg__hm'); b.addEventListener('click', () => v.ir(m[1], m[2])); h.appendChild(b); }
          else h.appendChild(el('span', 'w11-cfg__hm w11-cfg__hm--actual', m[0]));
        });
        pag.appendChild(h);
      }
      function pintar() {
        nav.querySelectorAll('.w11-cfg__ni').forEach(b => b.classList.toggle('w11-cfg__ni--actual', b.dataset.p === actual));
        pag.innerHTML = '';
        pag.scrollTop = 0;
        const P = { inicio, sistema, dispositivos, apps, cuentas, idioma }[actual];
        if (P) P(); else { cabecera([[PAGINAS.find(p => p[0] === actual)[1]]]); pag.appendChild(el('p', 'w11-nota', 'En esta simulación no hace falta tocar nada aquí.')); }
        W.emit('config', { pagina: actual, sub });
      }
      function inicio() {
        cabecera([['Inicio']]);
        pag.appendChild(tarjeta('equipo', 'PC-AULA-12', 'Windows 11 Education', null));
        pag.appendChild(tarjeta('usuario', 'Cuentas', 'Tu cuenta y otros usuarios', null, () => v.ir('cuentas')));
        pag.appendChild(tarjeta('app', 'Aplicaciones', 'Aplicaciones instaladas', null, () => v.ir('apps')));
      }
      function sistema() {
        cabecera([['Sistema']]);
        pag.appendChild(tarjeta('equipo', 'Pantalla', 'Brillo, escala, resolución', null, () => {}));
        pag.appendChild(tarjeta('disco', 'Almacenamiento', '125 GB usados de 237 GB', null, () => {}));
        pag.appendChild(tarjeta('info', 'Información', 'Especificaciones del dispositivo, edición de Windows', null, () => {}));
      }
      function idioma() {
        cabecera([['Hora e idioma'], ['Idioma y región']]);
        pag.appendChild(tarjeta('navegador', 'Idioma para mostrar de Windows', 'Los menús de Windows salen en este idioma', el('span', 'w11-cfg__valor', 'Español (España)')));
        pag.appendChild(tarjeta('app', 'Español (España)', 'Paquete de idioma, teclado, escritura a mano', null));
      }
      /* Impresoras */
      function dispositivos() {
        if (sub && sub.indexOf('imp:') === 0) return impresora(sub.slice(4));
        if (sub === 'impresoras') return impresoras();
        cabecera([['Bluetooth y dispositivos']]);
        pag.appendChild(tarjeta('impresora', 'Impresoras y escáneres', 'Preferencias, solución de problemas', null, () => v.ir('dispositivos', 'impresoras')));
        pag.appendChild(tarjeta('equipo', 'Mouse', 'Botones, velocidad del puntero, desplazamiento', null, () => {}));
        pag.appendChild(tarjeta('app', 'Escritura', 'Corrector ortográfico, configuración del teclado', null, () => {}));
      }
      function impresoras() {
        cabecera([['Bluetooth y dispositivos', 'dispositivos'], ['Impresoras y escáneres']]);
        estado.impresoras.forEach(p => {
          const d = p.n === estado.predeterminada ? 'Predeterminada' : '';
          pag.appendChild(tarjeta('impresora', p.n, d, null, () => v.ir('dispositivos', 'imp:' + p.n)));
        });
        pag.appendChild(el('p', 'w11-cfg__grupo', 'Preferencias de impresora'));
        pag.appendChild(interruptor('Permitir que Windows administre mi impresora predeterminada', estado.administra, si => {
          estado.administra = si;
          ctx.apunta(`«Permitir que Windows administre mi impresora predeterminada»: ${si ? 'activado' : 'desactivado'}.`);
          W.emit('config', { pagina: 'impresoras', administra: si });
        }));
      }
      function impresora(n) {
        cabecera([['Bluetooth y dispositivos', 'dispositivos'], ['Impresoras y escáneres', 'dispositivos', 'impresoras'], [n]]);
        const fila = el('div', 'w11-cfg__acciones');
        if (estado.predeterminada === n) fila.appendChild(el('span', 'w11-cfg__valor', '✓ Es la impresora predeterminada'));
        else if (!estado.administra) {
          const b = boton('Establecer como predeterminado', 'w11-btn');
          b.addEventListener('click', () => {
            estado.predeterminada = n;
            ctx.apunta(`«${n}» → Establecer como predeterminado.`);
            W.emit('config', { impresora: n });
            pintar();
          });
          fila.appendChild(b);
        }
        const q = boton('Quitar', 'w11-btn');
        q.addEventListener('click', () => W.dialogo({ titulo: 'Quitar dispositivo', icono: 'pregunta', texto: `¿Seguro que quieres quitar «${n}»?`, botones: [{ t: 'Sí', f: () => { W.aviso('No hace falta quitar ninguna impresora.', 'cuidado'); } }, { t: 'No', primario: true }] }));
        fila.appendChild(q);
        pag.appendChild(fila);
        if (estado.predeterminada !== n && estado.administra) pag.appendChild(el('p', 'w11-nota', 'No sale «Establecer como predeterminado» mientras Windows administra la impresora predeterminada.'));
        pag.appendChild(tarjeta('impresora', 'Imprimir página de prueba', '', null, () => W.notificacion(n, 'Página de prueba enviada.', 'impresora')));
        pag.appendChild(tarjeta('propiedades', 'Preferencias de impresión', 'Orientación, orden de páginas, páginas por hoja', null, () => {}));
      }
      /* Aplicaciones */
      function apps() {
        cabecera([['Aplicaciones'], ['Aplicaciones instaladas']]);
        const b = document.createElement('input');
        b.className = 'w11-campo w11-cfg__buscar';
        b.placeholder = 'Buscar aplicaciones';
        b.setAttribute('aria-label', 'Buscar aplicaciones');
        pag.appendChild(b);
        const lista = el('div', 'w11-cfg__lista');
        pag.appendChild(lista);
        function pintaLista() {
          lista.innerHTML = '';
          const q = b.value.trim().toLowerCase();
          lista.appendChild(el('p', 'w11-cfg__grupo', `${estado.apps.length} aplicaciones encontradas`));
          estado.apps.filter(a => !q || a.n.toLowerCase().indexOf(q) !== -1).forEach(a => {
            const m = boton('', 'w11-cfg__mas');
            m.appendChild(icono('mas'));
            m.setAttribute('aria-label', 'Más opciones de ' + a.n);
            m.addEventListener('click', e => {
              e.stopPropagation();
              const r = m.getBoundingClientRect();
              W.menu(r.left - 120, r.bottom, [{ t: 'Modificar', off: true }, { t: 'Desinstalar', f: () => desinstalar(a) }]);
            });
            const der = el('span', 'w11-cfg__der');
            der.append(el('span', 'w11-cfg__valor', a.t), m);
            const t = tarjeta(a.ic, a.n, `${a.ed} · ${a.f}`, der);
            t.querySelector('.w11-cfg__ttitulo').setAttribute('translate', 'no');
            lista.appendChild(t);
          });
        }
        b.addEventListener('input', pintaLista);
        pintaLista();
        function desinstalar(a) {
          W.dialogo({ titulo: 'Desinstalar', icono: 'pregunta', texto: 'Esta aplicación y su información relacionada se desinstalarán.', crear: t => { const p = el('p', 'w11-nota', a.n); p.setAttribute('translate', 'no'); t.appendChild(p); }, botones: [
            { t: 'Desinstalar', primario: true, f: () => {
              estado.apps.splice(estado.apps.indexOf(a), 1);
              ctx.apunta(`Aplicaciones instaladas → ${a.n} → ⋯ → Desinstalar.`);
              W.emit('config', { desinstalada: a });
              pintaLista();
            } }, { t: 'Cancelar' }] });
        }
      }
      /* Cuentas */
      function cuentas() {
        if (sub === 'otros') return otros();
        cabecera([['Cuentas']]);
        pag.appendChild(tarjeta('usuario', 'alumno', 'Cuenta local · Administrador', null));
        pag.appendChild(tarjeta('usuario', 'Tu información', 'Foto, tipo de cuenta', null, () => {}));
        pag.appendChild(tarjeta('candado', 'Opciones de inicio de sesión', 'PIN, contraseña, bloqueo dinámico', null, () => {}));
        pag.appendChild(tarjeta('usuario', 'Otros usuarios', 'Acceso de dispositivos, permisos de trabajo o escuela', null, () => v.ir('cuentas', 'otros')));
      }
      function otros() {
        cabecera([['Cuentas', 'cuentas'], ['Otros usuarios']]);
        const ag = boton('Agregar cuenta', 'w11-btn w11-btn--primario');
        ag.addEventListener('click', agregar);
        pag.appendChild(tarjeta('usuario', 'Agregar otro usuario', null, ag));
        pag.appendChild(el('p', 'w11-cfg__grupo', 'Otros usuarios'));
        if (!estado.usuarios.length) pag.appendChild(el('p', 'w11-nota', 'Todavía no hay otros usuarios en este equipo.'));
        estado.usuarios.forEach(u => {
          const caja = el('div', 'w11-cfg__desp');
          const t = tarjeta('usuario', u.n, `Cuenta local · ${u.admin ? 'Administrador' : 'Usuario estándar'}`, null, () => { caja.classList.toggle('w11-cfg__desp--abierto'); });
          t.querySelector('.w11-cfg__ttitulo').setAttribute('translate', 'no');
          const op = el('div', 'w11-cfg__desp-cuerpo');
          const ct = boton('Cambiar tipo de cuenta', 'w11-btn');
          ct.addEventListener('click', () => tipo(u));
          const qu = boton('Quitar', 'w11-btn');
          qu.addEventListener('click', () => W.dialogo({ titulo: '¿Eliminar la cuenta y los datos?', icono: 'aviso', texto: 'Al eliminar la cuenta de esta persona se eliminarán sus datos de este equipo.', botones: [{ t: 'Eliminar la cuenta y los datos', f: () => { estado.usuarios.splice(estado.usuarios.indexOf(u), 1); ctx.apunta(`Quitar la cuenta ${u.n}.`); W.emit('config', { usuarios: true }); pintar(); } }, { t: 'Cancelar', primario: true }] }));
          op.append(el('span', 'w11-nota', 'Opciones de cuenta'), ct, qu);
          caja.append(t, op);
          pag.appendChild(caja);
        });
      }
      function tipo(u) {
        let elegido = u.admin ? 'admin' : 'estandar';
        W.dialogo({ titulo: 'Cambiar tipo de cuenta', crear: t => {
          const p = el('p', null, u.n); p.setAttribute('translate', 'no'); t.appendChild(p);
          const s = document.createElement('select');
          s.className = 'w11-campo';
          s.setAttribute('aria-label', 'Tipo de cuenta');
          s.innerHTML = '<option value="estandar">Usuario estándar</option><option value="admin">Administrador</option>';
          s.value = elegido;
          s.addEventListener('change', () => { elegido = s.value; });
          t.appendChild(s);
        }, botones: [{ t: 'Aceptar', primario: true, f: () => {
          u.admin = elegido === 'admin';
          u.revisado = true;
          ctx.apunta(`Cambiar tipo de cuenta de ${u.n}: ${u.admin ? 'Administrador' : 'Usuario estándar'}.`);
          W.emit('config', { usuarios: true });
          pintar();
        } }, { t: 'Cancelar' }] });
      }
      function agregar() {
        W.dialogo({ titulo: 'Cuenta Microsoft', crear: t => {
          t.appendChild(el('p', 'w11-dlg__grande', '¿Cómo iniciará sesión esta persona?'));
          t.appendChild(el('p', 'w11-nota', 'Escribe la dirección de correo o el número de teléfono de la persona que quieres agregar.'));
          const i = document.createElement('input'); i.className = 'w11-campo'; i.placeholder = 'Correo electrónico o teléfono'; i.setAttribute('aria-label', 'Correo electrónico o teléfono');
          t.appendChild(i);
          const l = boton('No tengo los datos de inicio de sesión de esta persona', 'w11-enlace');
          l.addEventListener('click', () => { t.closest('.w11-dlg__velo').remove(); crearCuenta(); });
          t.appendChild(l);
        }, botones: [{ t: 'Siguiente', primario: true, f: () => { W.aviso('Tu hermano no tiene cuenta Microsoft: busca otra opción en esa ventana.', 'cuidado'); return false; } }, { t: 'Cancelar' }] });
      }
      function crearCuenta() {
        W.dialogo({ titulo: 'Cuenta Microsoft', crear: t => {
          t.appendChild(el('p', 'w11-dlg__grande', 'Crear cuenta'));
          t.appendChild(el('p', 'w11-nota', 'Con una cuenta Microsoft tienes correo, Office en línea y OneDrive.'));
          const i = document.createElement('input'); i.className = 'w11-campo'; i.placeholder = 'alguien@example.com'; i.setAttribute('aria-label', 'Correo nuevo');
          t.appendChild(i);
          const l = boton('Agregar un usuario sin cuenta Microsoft', 'w11-enlace');
          l.addEventListener('click', () => { t.closest('.w11-dlg__velo').remove(); local(); });
          t.appendChild(l);
        }, botones: [{ t: 'Siguiente', primario: true, f: () => { W.aviso('La misión pide una cuenta local, sin cuenta Microsoft.', 'cuidado'); return false; } }, { t: 'Atrás' }] });
      }
      function local() {
        const campos = {};
        W.dialogo({ titulo: 'Cuenta Microsoft', crear: t => {
          t.appendChild(el('p', 'w11-dlg__grande', 'Crear un usuario para este equipo'));
          const f = (k, txt, tipo) => { const l = el('label', 'w11-form__campo'); const i = document.createElement('input'); i.className = 'w11-campo'; i.type = tipo || 'text'; i.spellcheck = false; l.append(el('span', null, txt), i); t.appendChild(l); campos[k] = i; };
          f('n', '¿Quién va a usar este equipo?');
          f('p1', 'Escribe una contraseña', 'password');
          f('p2', 'Vuelve a escribir la contraseña', 'password');
          t.appendChild(el('p', 'w11-nota', 'Si olvidas la contraseña, estas preguntas de seguridad te ayudarán a recuperarla.'));
          ['¿Cómo se llamaba tu primera mascota?', '¿Cuál era tu apodo de pequeño?', '¿Cómo se llama la ciudad donde naciste?'].forEach((q, k) => {
            const l = el('label', 'w11-form__campo'); const i = document.createElement('input'); i.className = 'w11-campo'; i.spellcheck = false;
            l.append(el('span', null, `Pregunta ${k + 1}: ${q}`), i); t.appendChild(l); campos['q' + k] = i;
          });
        }, botones: [{ t: 'Siguiente', primario: true, f: () => {
          const n = campos.n.value.trim();
          if (!n) { W.aviso('Escribe el nombre del usuario.', 'cuidado'); return false; }
          if (/[\\/"[\]:|<>+=;,?*@]/.test(n)) { W.dialogo({ titulo: 'Cuenta Microsoft', icono: 'error', texto: 'El nombre de usuario no puede contener estos caracteres: \\ / " [ ] : | < > + = ; , ? * @' }); return false; }
          if (campos.p1.value !== campos.p2.value) { W.dialogo({ titulo: 'Cuenta Microsoft', icono: 'error', texto: 'Las contraseñas no coinciden.' }); return false; }
          if (campos.p1.value && [0, 1, 2].some(k => !campos['q' + k].value.trim())) { W.dialogo({ titulo: 'Cuenta Microsoft', icono: 'error', texto: 'Contesta las tres preguntas de seguridad.' }); return false; }
          if (estado.usuarios.some(u => u.n.toLowerCase() === n.toLowerCase()) || n.toLowerCase() === 'alumno') { W.dialogo({ titulo: 'Cuenta Microsoft', icono: 'error', texto: 'Ya existe un usuario con ese nombre.' }); return false; }
          const u = { n, admin: false, clave: !!campos.p1.value };
          estado.usuarios.push(u);
          ctx.apunta(`Agregar cuenta → «No tengo los datos…» → «Agregar un usuario sin cuenta Microsoft» → usuario ${n}, ${u.clave ? 'con' : 'sin'} contraseña.`);
          W.emit('config', { usuarios: true, nuevo: u });
          v.ir('cuentas', 'otros');
        } }, { t: 'Atrás' }] });
      }
      pintar();
    }, irA: null });
  }
  registrarSimulacion('w-config', {
    ventana: 'Windows 11',
    mision: [
      'Crea una cuenta local para tu hermano: usuario leo, con contraseña y sin cuenta Microsoft.',
      'Comprueba que la cuenta de leo es de usuario estándar (no de administrador).',
      'Desinstala el programa basura «Turbo Optimizador PC», sin quitar nada que haga falta.',
      'Pon como impresora predeterminada la HP LaserJet aula 2B.',
    ],
    final: 'Apunta en tu cuaderno los pasos que has seguido para crear la cuenta de leo, qué tipo de cuenta tiene y por qué, qué programa desinstalaste y qué tuviste que desactivar para poder cambiar la impresora predeterminada (pregunta 14).',
    crear(ctx) {
      const estado = {
        usuarios: [],
        apps: [
          { n: 'Controlador de audio Realtek', ed: 'Realtek Semiconductor', t: '62,4 MB', f: '03/09/2026', ic: 'volumen', hace: true },
          { n: 'Google Chrome', ed: 'Google LLC', t: '512 MB', f: '10/12/2026', ic: 'navegador' },
          { n: 'LibreOffice 25.2', ed: 'The Document Foundation', t: '712 MB', f: '02/10/2026', ic: 'documento' },
          { n: 'Minecraft Launcher', ed: 'Mojang', t: '1,2 GB', f: '20/11/2026', ic: 'juego' },
          { n: 'Turbo Optimizador PC', ed: 'Desconocido', t: '186 MB', f: '04/01/2027', ic: 'exe', basura: true },
          { n: 'VLC media player', ed: 'VideoLAN', t: '160 MB', f: '15/10/2026', ic: 'video' },
        ],
        impresoras: [{ n: 'HP LaserJet aula 2B' }, { n: 'Microsoft Print to PDF' }, { n: 'Fax' }],
        predeterminada: 'Microsoft Print to PDF',
        administra: true,
      };
      const W = WIN11.escritorio(ctx, {
        fs: equipo(usuario({})),
        barra: ['explorador', 'navegador', 'configuracion'],
        apps: { configuracion: { abrir: null } },
      });
      W.apps.configuracion.abrir = appConfiguracion(W, estado, ctx);
      W.apps.configuracion.irA = (W2, v, o) => { if (o && o.pagina && v.ir) v.ir(o.pagina); };
      W.on('config', d => {
        const leo = estado.usuarios.find(u => u.n.toLowerCase() === 'leo');
        if (d.nuevo) {
          if (d.nuevo.n.toLowerCase() !== 'leo') W.aviso('El usuario se tiene que llamar leo.', 'cuidado');
          else if (!d.nuevo.clave) W.aviso('Has creado la cuenta sin contraseña: cualquiera podría entrar. Quítala y vuelve a crearla con contraseña.', 'cuidado');
        }
        if (leo && leo.clave) ctx.cumple(0, 'Cuenta local leo creada, con contraseña.');
        else if (ctx.hecho(0)) ctx.deshace(0);
        if (leo && leo.revisado && !leo.admin) ctx.cumple(1, 'Otros usuarios → leo → Cambiar tipo de cuenta: Usuario estándar.');
        else if (ctx.hecho(1)) ctx.deshace(1);
        if (leo && leo.admin && d.usuarios) W.aviso('Un administrador puede instalar programas y cambiar todo el equipo. Para tu hermano basta una cuenta estándar.', 'cuidado');
        if (d.desinstalada) {
          if (d.desinstalada.basura) ctx.cumple(2, 'Aplicaciones → Aplicaciones instaladas → Turbo Optimizador PC → ⋯ → Desinstalar.');
          else if (d.desinstalada.hace) { ctx.falla(`Desinstalar ${d.desinstalada.n}: ¡te has quedado sin sonido! Era un controlador que hace falta.`); W.aviso('Has quitado el controlador del audio: el ordenador se ha quedado sin sonido. Pulsa «Empezar otra vez».'); }
          else W.aviso(`${d.desinstalada.n} no era el programa basura. La misión pide no quitar nada que haga falta.`, 'cuidado');
        }
        if (d.impresora) {
          if (d.impresora === 'HP LaserJet aula 2B') ctx.cumple(3, 'Desactivar «Permitir que Windows administre mi impresora predeterminada» → HP LaserJet aula 2B → Establecer como predeterminado.');
          else if (ctx.hecho(3)) ctx.deshace(3);
        }
      });
      W.abrirApp('configuracion', { origen: 'inicio', pagina: 'inicio' });
    },
  });

  /* ============================================================
     S5 · Administrador de tareas
     ============================================================ */
  registrarSimulacion('w-tareas', {
    ventana: 'Windows 11',
    mision: [
      'Abre el Administrador de tareas.',
      'El juego BloqueCraft se ha colgado (No responde): ciérralo desde el Administrador de tareas.',
      'Ordena los procesos por memoria y averigua qué programa gasta más.',
      'Haz que «Turbo Optimizador PC» no se abra solo al encender el ordenador.',
    ],
    final: 'Apunta en tu cuaderno cómo abriste el Administrador de tareas, cómo cerraste el juego, qué programa gastaba más memoria y cuánta, y dónde quitaste Turbo Optimizador del arranque (pregunta 7).',
    crear(ctx) {
      const procesos = [
        { n: 'BloqueCraft', g: 'app', cpu: 24.8, mem: 1.1 * GB, cuelga: true, ic: 'juego' },
        { n: 'Google Chrome (12)', g: 'app', cpu: 3.1, mem: 2.6 * GB, ic: 'navegador' },
        { n: 'Bloc de notas', g: 'app', cpu: 0, mem: 14 * MB, ic: 'bloc' },
        { n: 'Turbo Optimizador PC', g: 'fondo', cpu: 17.6, mem: 640 * MB, ic: 'exe' },
        { n: 'Spotify', g: 'fondo', cpu: 0.8, mem: 312 * MB, ic: 'musica' },
        { n: 'Antimalware Service Executable', g: 'fondo', cpu: 1.9, mem: 186 * MB, ic: 'escudo' },
        { n: 'Explorador de Windows', g: 'win', cpu: 0.6, mem: 92 * MB, ic: 'explorador', explorer: true },
        { n: 'Inicio', g: 'win', cpu: 0, mem: 48 * MB, ic: 'inicio' },
      ];
      const arranque = [
        { n: 'Turbo Optimizador PC', ed: 'Desconocido', on: true, imp: 'Alto' },
        { n: 'Spotify', ed: 'Spotify AB', on: true, imp: 'Medio' },
        { n: 'Microsoft OneDrive', ed: 'Microsoft Corporation', on: true, imp: 'Bajo' },
        { n: 'Controlador de audio Realtek', ed: 'Realtek Semiconductor', on: true, imp: 'Bajo' },
      ];
      const W = WIN11.escritorio(ctx, { fs: equipo(usuario({})), barra: ['explorador', 'navegador'],
        apps: { juego: { n: 'BloqueCraft', icono: 'juego', enInicio: true } } });
      // el juego colgado y el Bloc abiertos al empezar
      W.abrirApp('bloc', { origen: 'inicio', texto: 'Mods que quiero probar:\n- más biomas\n- cofres con candado' });
      const juego = W.abrir({ app: 'juego', titulo: 'BloqueCraft (No responde)', icono: 'juego', crear: c => {
        c.classList.add('w11-colgado');
        c.appendChild(el('p', 'w11-colgado__t', 'BloqueCraft no responde'));
        c.appendChild(el('p', 'w11-nota', 'La ventana se ha quedado congelada: no hace caso de nada.'));
      }, alCerrar: () => { if (!juegoMuerto) { W.dialogo({ titulo: 'BloqueCraft', icono: 'aviso', texto: ['BloqueCraft no responde.', 'Si cierras el programa, se pueden perder los datos.'], botones: [{ t: 'Esperar a que el programa responda', primario: true }, { t: 'Cerrar el programa', f: () => { W.aviso('Así a veces funciona, pero la misión pide cerrarlo desde el Administrador de tareas.', 'cuidado'); } }] }); return false; } } });
      let juegoMuerto = false;
      let orden = 'cpu', tab = 'procesos', elegido = null, explorerMuerto = false;
      W.apps.tareas.abrir = (W2, o) => W.abrir({ app: 'tareas', titulo: 'Administrador de tareas', icono: 'tareas', ancho: 80, alto: 88, crear: (c, v) => {
        c.classList.add('w11-tm');
        const nav = el('div', 'w11-tm__nav');
        const pag = el('div', 'w11-tm__pag');
        c.append(nav, pag);
        [['procesos', 'Procesos', 'vistas'], ['rendimiento', 'Rendimiento', 'tareas'], ['historial', 'Historial de aplicaciones', 'recargar'], ['arranque', 'Aplicaciones de arranque', 'apagar'], ['usuarios', 'Usuarios', 'usuario'], ['detalles', 'Detalles', 'propiedades'], ['servicios', 'Servicios', 'configuracion']].forEach(([id, t, ic]) => {
          const b = boton('', 'w11-tm__ni');
          b.append(icono(ic), el('span', null, t));
          b.dataset.p = id;
          b.setAttribute('aria-label', t);
          b.addEventListener('click', () => { tab = id; elegido = null; pintar(); });
          nav.appendChild(b);
        });
        v.pintar = pintar;
        function pintar() {
          nav.querySelectorAll('.w11-tm__ni').forEach(b => b.classList.toggle('w11-tm__ni--actual', b.dataset.p === tab));
          pag.innerHTML = '';
          if (tab === 'procesos') return pProcesos();
          if (tab === 'arranque') return pArranque();
          if (tab === 'rendimiento') return pRend();
          pag.appendChild(el('p', 'w11-tm__titulo', nav.querySelector(`[data-p="${tab}"]`).textContent));
          pag.appendChild(el('p', 'w11-nota', 'En esta simulación no hace falta mirar aquí.'));
        }
        function barraSup(titulo, botones) {
          const h = el('div', 'w11-tm__cab');
          h.appendChild(el('p', 'w11-tm__titulo', titulo));
          const bs = el('div', 'w11-tm__botones');
          botones.forEach(([t, f, off]) => { const b = boton(t, 'w11-tm__b'); b.disabled = !!off; b.addEventListener('click', f); bs.appendChild(b); });
          h.appendChild(bs);
          pag.appendChild(h);
        }
        function pProcesos() {
          const sel = procesos.find(p => p === elegido);
          barraSup('Procesos', [
            ['Ejecutar nueva tarea', nuevaTarea],
            [sel && sel.explorer ? 'Reiniciar tarea' : 'Finalizar tarea', () => sel && (sel.explorer ? reiniciarExplorer() : finalizar(sel)), !sel],
          ]);
          const tabla = el('div', 'w11-tm__tabla');
          tabla.setAttribute('role', 'grid');
          const cab = el('div', 'w11-tm__fila w11-tm__fila--cab');
          const totCpu = procesos.reduce((a, p) => a + p.cpu, 0), totMem = 6.9;
          [['n', 'Nombre', ''], ['estado', 'Estado', ''], ['cpu', 'CPU', Math.round(totCpu) + ' %'], ['mem', 'Memoria', Math.round(totMem / 8 * 100) + ' %']].forEach(([k, t, x]) => {
            const b = boton('', 'w11-tm__col' + (orden === k ? ' w11-tm__col--orden' : ''));
            b.append(el('span', 'w11-tm__col-x', x), el('span', null, t + (orden === k ? ' ⌄' : '')));
            b.addEventListener('click', () => {
              if (k === 'estado') return;
              orden = k;
              if (k !== 'mem') ctx.apunta(`Ordenar por la columna ${t}.`);
              if (k === 'mem') { const top = procesos.slice().sort((a, b) => b.mem - a.mem)[0]; ctx.cumple(2, `Clic en la columna Memoria: el que más gasta es ${top.n}, con ${tamano(top.mem)}.`); }
              pintar();
            });
            cab.appendChild(b);
          });
          tabla.appendChild(cab);
          const grupos = [['app', 'Aplicaciones'], ['fondo', 'Procesos en segundo plano'], ['win', 'Procesos de Windows']];
          const lista = procesos.slice().sort((a, b) => orden === 'n' ? a.n.localeCompare(b.n) : orden === 'mem' ? b.mem - a.mem : b.cpu - a.cpu);
          grupos.forEach(([g, t]) => {
            const ps = lista.filter(p => p.g === g);
            if (!ps.length) return;
            tabla.appendChild(el('p', 'w11-tm__grupo', `${t} (${ps.length})`));
            ps.forEach(p => {
              const f = boton('', 'w11-tm__fila' + (p === elegido ? ' w11-tm__fila--sel' : ''));
              f.setAttribute('aria-pressed', String(p === elegido));
              const n = el('span', 'w11-tm__c w11-tm__c--n');
              n.append(icono(p.ic), el('span', null, p.n));
              n.lastChild.setAttribute('translate', 'no');
              f.append(n, el('span', 'w11-tm__c w11-tm__c--estado', p.cuelga ? 'No responde' : ''), el('span', 'w11-tm__c', p.cpu.toLocaleString('es-ES', { minimumFractionDigits: 1 }) + ' %'), el('span', 'w11-tm__c', tamano(p.mem)));
              f.querySelectorAll('.w11-tm__c:not(.w11-tm__c--n):not(.w11-tm__c--estado)').forEach(x => x.setAttribute('translate', 'no'));
              if (p.cpu > 10) f.classList.add('w11-tm__fila--caliente');
              f.addEventListener('click', () => { elegido = p; pintar(); });
              f.addEventListener('contextmenu', e => {
                e.preventDefault(); elegido = p; pintar();
                W.menu(e.clientX, e.clientY, [
                  p.explorer ? { t: 'Reiniciar', f: reiniciarExplorer } : null,
                  { t: 'Finalizar tarea', f: () => finalizar(p) },
                  { t: 'Modo de eficiencia', off: true },
                  { sep: true },
                  { t: 'Abrir ubicación del archivo', off: true },
                  { t: 'Buscar en línea', off: true },
                  { t: 'Propiedades', off: true },
                ]);
              });
              tabla.appendChild(f);
            });
          });
          pag.appendChild(tabla);
        }
        function pRend() {
          barraSup('Rendimiento', []);
          [['CPU', Math.round(procesos.reduce((a, p) => a + p.cpu, 0)) + ' %  2,80 GHz'], ['Memoria', '6,9/8,0 GB (86 %)'], ['Disco 0 (C:)', 'SSD · 3 %'], ['Wi-Fi', 'Enviado: 0 Recibido: 24 Kbps']].forEach(([a, b]) => {
            const t = tarjeta(null, a, b, null);
            t.setAttribute('translate', 'no');
            pag.appendChild(t);
          });
        }
        function pArranque() {
          const sel = arranque.find(a => a === elegido);
          barraSup('Aplicaciones de arranque', [[sel && sel.on ? 'Deshabilitar' : 'Habilitar', () => {
            if (!sel) return;
            sel.on = !sel.on;
            if (sel.n !== 'Turbo Optimizador PC' || sel.on) ctx.apunta(`Aplicaciones de arranque → ${sel.n} → ${sel.on ? 'Habilitar' : 'Deshabilitar'}.`);
            if (sel.n === 'Turbo Optimizador PC') { if (!sel.on) ctx.cumple(3, 'Administrador de tareas → Aplicaciones de arranque → Turbo Optimizador PC → Deshabilitar.'); else ctx.deshace(3); }
            else if (!sel.on && /Realtek/.test(sel.n)) W.aviso('El controlador de audio sí hace falta al arrancar. Vuelve a habilitarlo.', 'cuidado');
            pintar();
          }, !sel]]);
          const tabla = el('div', 'w11-tm__tabla');
          const cab = el('div', 'w11-tm__fila w11-tm__fila--cab w11-tm__fila--arr');
          ['Nombre', 'Editor', 'Estado', 'Impacto de inicio'].forEach(t => cab.appendChild(el('span', 'w11-tm__col', t)));
          tabla.appendChild(cab);
          arranque.forEach(a => {
            const f = boton('', 'w11-tm__fila w11-tm__fila--arr' + (a === elegido ? ' w11-tm__fila--sel' : ''));
            f.setAttribute('aria-pressed', String(a === elegido));
            const n = el('span', 'w11-tm__c w11-tm__c--n', a.n); n.setAttribute('translate', 'no');
            f.append(n, el('span', 'w11-tm__c', a.ed), el('span', 'w11-tm__c', a.on ? 'Habilitado' : 'Deshabilitado'), el('span', 'w11-tm__c', a.imp));
            f.addEventListener('click', () => { elegido = a; pintar(); });
            tabla.appendChild(f);
          });
          pag.appendChild(tabla);
        }
        function finalizar(p) {
          procesos.splice(procesos.indexOf(p), 1);
          elegido = null;
          if (p.cuelga) {
            juegoMuerto = true;
            juego.cerrar();
            ctx.cumple(1, `Procesos → ${p.n} (No responde) → Finalizar tarea.`);
          } else if (p.explorer) {
            explorerMuerto = true;
            W.escena.classList.add('w11__escena--sin-explorer');
            ctx.falla('Finalizar «Explorador de Windows»: desaparecen la barra de tareas y los iconos del escritorio.');
            W.aviso('Has cerrado el Explorador de Windows: por eso han desaparecido la barra de tareas y el escritorio. Arréglalo: «Ejecutar nueva tarea» y escribe explorer.', 'cuidado');
          } else if (p.n === 'Bloc de notas') {
            const b = W.ventana('bloc'); if (b) b.cerrar();
            ctx.apunta('Finalizar tarea: Bloc de notas (se pierde lo que no estaba guardado).');
          } else ctx.apunta(`Finalizar tarea: ${p.n}.`);
          pintar();
        }
        function reiniciarExplorer() {
          ctx.apunta('Reiniciar el Explorador de Windows: la barra de tareas parpadea y vuelve.');
          W.notificacion('Explorador de Windows', 'Se ha reiniciado.', 'explorador');
        }
        function nuevaTarea() {
          let campo;
          W.dialogo({ titulo: 'Crear nueva tarea', crear: t => {
            t.appendChild(el('p', 'w11-nota', 'Escribe el nombre del programa, carpeta, documento o recurso de Internet que quieres que Windows abra.'));
            campo = document.createElement('input'); campo.className = 'w11-campo'; campo.setAttribute('aria-label', 'Abrir'); campo.spellcheck = false; campo.setAttribute('translate', 'no');
            t.appendChild(campo);
          }, botones: [{ t: 'Aceptar', primario: true, f: () => {
            const x = campo.value.trim().toLowerCase();
            if (x === 'explorer' || x === 'explorer.exe') {
              if (explorerMuerto) {
                explorerMuerto = false;
                W.escena.classList.remove('w11__escena--sin-explorer');
                procesos.push({ n: 'Explorador de Windows', g: 'win', cpu: 0.6, mem: 92 * MB, ic: 'explorador', explorer: true });
                ctx.apunta('Ejecutar nueva tarea → explorer: vuelven la barra de tareas y el escritorio.');
                W.aviso('Arreglado: el Explorador de Windows vuelve a estar en marcha.', 'ok');
              } else W.abrirApp('explorador', { origen: 'tarea' });
              pintar();
            } else if (x) { W.dialogo({ titulo: x, icono: 'error', texto: `Windows no encuentra «${x}». Asegúrate de que el nombre es correcto.` }); }
          } }, { t: 'Cancelar' }] });
        }
        pintar();
      } });
      W.on('app', d => {
        if (d.id !== 'tareas') return;
        const como = { atajo: 'Ctrl + Shift + Esc', barra: 'clic derecho en la barra de tareas', winx: 'clic derecho en Inicio (Windows + X)', 'ctrl-alt-supr': 'Ctrl + Alt + Supr', inicio: 'el menú Inicio', busqueda: 'buscándolo en Inicio' }[d.origen] || d.origen;
        ctx.cumple(0, `Abrir el Administrador de tareas: ${como}.`);
      });
      W.apps.tareas.enInicio = false;
    },
  });

  /* ============================================================
     S5 · Permisos de una carpeta
     ============================================================ */
  const PERM = [['control', 'Control total'], ['modificar', 'Modificar'], ['lecturaEj', 'Lectura y ejecución'], ['mostrar', 'Mostrar el contenido de la carpeta'], ['lectura', 'Lectura'], ['escritura', 'Escritura']];
  const INCLUYE = { control: ['control', 'modificar', 'lecturaEj', 'mostrar', 'lectura', 'escritura'], modificar: ['modificar', 'lecturaEj', 'mostrar', 'lectura', 'escritura'], lecturaEj: ['lecturaEj', 'mostrar', 'lectura'], mostrar: ['mostrar'], lectura: ['lectura'], escritura: ['escritura'] };
  function marcar(p, k, si) {
    if (si) INCLUYE[k].forEach(x => { p[x] = true; });
    else Object.keys(INCLUYE).forEach(x => { if (INCLUYE[x].indexOf(k) !== -1) p[x] = false; });
  }
  function permisosTab(n, W, ctx, alAplicar) {
    if (!n.permisos) return [];
    return [{ t: 'Seguridad', crear: (p) => {
      const elegido = n._grupo || 0;
      const nom = el('p', 'w11-nota', 'Nombre de objeto: ' + W.rutaReal(n)); nom.setAttribute('translate', 'no');
      p.appendChild(nom);
      p.appendChild(el('p', null, 'Nombres de grupos o usuarios:'));
      const lista = el('div', 'w11-perm__lista');
      lista.setAttribute('role', 'listbox');
      n.permisos.forEach((g, i) => {
        const b = boton('', 'w11-perm__g' + (i === elegido ? ' w11-perm__g--sel' : ''));
        b.setAttribute('role', 'option');
        b.setAttribute('aria-selected', String(i === elegido));
        b.append(icono('usuario'), el('span', null, g.n));
        b.lastChild.setAttribute('translate', 'no');
        b.addEventListener('click', () => { n._grupo = i; W.emit('permisos-ver', { g }); repinta(); });
        lista.appendChild(b);
      });
      p.appendChild(lista);
      const fila = el('div', 'w11-prop__pie');
      fila.appendChild(el('span', 'w11-nota', 'Para cambiar los permisos, haz clic en Editar.'));
      const ed = boton('Editar…', 'w11-btn');
      ed.addEventListener('click', () => editar(n, W, ctx, alAplicar, repinta));
      fila.appendChild(ed);
      p.appendChild(fila);
      const g = n.permisos[elegido];
      p.appendChild(tablaPermisos(g, false));
      function repinta() { p.innerHTML = ''; permisosTab(n, W, ctx, alAplicar)[0].crear(p); }
    } }];
  }
  function tablaPermisos(g, editable, alCambiar) {
    const t = el('div', 'w11-perm__tabla');
    t.setAttribute('role', 'table');
    const cab = el('div', 'w11-perm__fila w11-perm__fila--cab');
    cab.setAttribute('role', 'row');
    const c0 = el('span', null, 'Permisos de ' + g.n); c0.setAttribute('translate', 'no');
    cab.append(c0, el('span', null, 'Permitir'), el('span', null, 'Denegar'));
    t.appendChild(cab);
    PERM.forEach(([k, txt]) => {
      const f = el('div', 'w11-perm__fila');
      f.setAttribute('role', 'row');
      f.appendChild(el('span', null, txt));
      ['p', 'd'].forEach(col => {
        const s = el('span', 'w11-perm__c');
        if (editable) {
          const i = document.createElement('input');
          i.type = 'checkbox';
          i.checked = !!g[col][k];
          i.setAttribute('aria-label', `${col === 'p' ? 'Permitir' : 'Denegar'}: ${txt}`);
          i.addEventListener('change', () => { marcar(g[col], k, i.checked); if (i.checked) marcar(g[col === 'p' ? 'd' : 'p'], k, false); alCambiar(); });
          s.appendChild(i);
        } else s.textContent = g[col][k] ? '✓' : '';
        f.appendChild(s);
      });
      t.appendChild(f);
    });
    return t;
  }
  function editar(n, W, ctx, alAplicar, alCerrar) {
    const copia = JSON.parse(JSON.stringify(n.permisos));
    let elegido = 0;
    W.abrir({ app: 'permisos', titulo: 'Permisos de ' + n.n, tituloNoTraducir: true, icono: 'candado', rect: { x: 24, y: 3, w: 52, h: 92 }, crear: (c, v) => {
      c.classList.add('w11-prop');
      const cuerpo = el('div', 'w11-prop__panel');
      const pie = el('div', 'w11-prop__pie');
      c.append(cuerpo, pie);
      const aplicar = () => { n.permisos = JSON.parse(JSON.stringify(copia)); alAplicar(); };
      const bA = boton('Aceptar', 'w11-btn w11-btn--primario'); bA.addEventListener('click', () => { aplicar(); v.cerrar(); alCerrar(); });
      const bC = boton('Cancelar', 'w11-btn'); bC.addEventListener('click', () => { v.cerrar(); alCerrar(); });
      const bP = boton('Aplicar', 'w11-btn'); bP.addEventListener('click', aplicar);
      pie.append(bA, bC, bP);
      function pinta() {
        cuerpo.innerHTML = '';
        cuerpo.appendChild(el('p', null, 'Nombres de grupos o usuarios:'));
        const lista = el('div', 'w11-perm__lista');
        copia.forEach((g, i) => {
          const b = boton('', 'w11-perm__g' + (i === elegido ? ' w11-perm__g--sel' : ''));
          b.setAttribute('aria-pressed', String(i === elegido));
          b.append(icono('usuario'), el('span', null, g.n));
          b.lastChild.setAttribute('translate', 'no');
          b.addEventListener('click', () => { elegido = i; pinta(); });
          lista.appendChild(b);
        });
        cuerpo.appendChild(lista);
        const g = copia[elegido];
        cuerpo.appendChild(tablaPermisos(g, true, () => {
          const on = PERM.filter(([k]) => g.p[k]).map(([, t]) => t), off = PERM.filter(([k]) => g.d[k]).map(([, t]) => t);
          ctx.apunta(`${g.n}: permitir ${on.length ? on.join(', ') : 'nada'}${off.length ? '; denegar ' + off.join(', ') : ''}.`);
          pinta();
        }));
      }
      pinta();
    } });
  }
  registrarSimulacion('w-permisos', {
    ventana: 'Windows 11',
    mision: [
      'Mira qué permisos tiene ahora el grupo Alumnos en la carpeta notas-1r.',
      'Los alumnos solo tienen que poder leer las notas: quítales todo lo que les deja cambiarlas.',
      'El usuario profe tiene que poder modificar las notas.',
    ],
    final: 'Apunta en tu cuaderno qué permisos tenía el grupo Alumnos al principio, cuáles le has dejado y qué permiso le has dado a profe. Explica por qué no hay que usar «Denegar» en la lectura (pregunta 12).',
    crear(ctx) {
      const todo = { control: true, modificar: true, lecturaEj: true, mostrar: true, lectura: true, escritura: true };
      const nada = { control: false, modificar: false, lecturaEj: false, mostrar: false, lectura: false, escritura: false };
      const leer = { control: false, modificar: false, lecturaEj: true, mostrar: true, lectura: true, escritura: false };
      const notas = carpeta('notas-1r', [archivo('notas-1a-evaluacion.xlsx', 38 * KB), archivo('notas-2a-evaluacion.xlsx', 12 * KB)], { permisos: [
        { n: 'Administradores (PC-AULA-12\\Administradores)', p: Object.assign({}, todo), d: Object.assign({}, nada) },
        { n: 'profe (PC-AULA-12\\profe)', p: Object.assign({}, leer), d: Object.assign({}, nada) },
        { n: 'Alumnos (PC-AULA-12\\Alumnos)', p: Object.assign({}, todo), d: Object.assign({}, nada) },
        { n: 'SYSTEM', p: Object.assign({}, todo), d: Object.assign({}, nada) },
      ] });
      let W;
      const revisa = () => {
        const al = notas.permisos.find(g => /^Alumnos/.test(g.n)), pr = notas.permisos.find(g => /^profe/.test(g.n));
        if (al.d.lectura || al.d.lecturaEj || al.d.mostrar) {
          W.aviso('Has denegado la lectura a los Alumnos: «Denegar» manda sobre «Permitir», así que ahora ni siquiera pueden abrir la carpeta. Quita esa marca.', 'cuidado');
          ctx.falla('Denegar la lectura a Alumnos: ya no pueden ni abrir las notas.');
        }
        const soloLeer = al.p.lectura && al.p.lecturaEj && al.p.mostrar && !al.p.modificar && !al.p.escritura && !al.p.control && !al.d.lectura && !al.d.lecturaEj && !al.d.mostrar;
        if (soloLeer) ctx.cumple(1, 'Alumnos: quitar Control total, Modificar y Escritura; quedan Lectura y ejecución, Mostrar el contenido y Lectura.');
        else if (ctx.hecho(1)) ctx.deshace(1);
        if (!al.p.lectura && !al.d.lectura) W.aviso('Así los alumnos ya no pueden ni leer las notas. La misión pide que sí puedan leerlas.', 'cuidado');
        if (pr.p.modificar && !pr.p.control) ctx.cumple(2, 'profe: Permitir Modificar.');
        else if (pr.p.control) W.aviso('Control total deja además cambiar los permisos. Para profe basta con Modificar.', 'cuidado');
        else if (ctx.hecho(2)) ctx.deshace(2);
      };
      W = WIN11.escritorio(ctx, {
        fs: equipo(usuario({ raizC: [carpeta('Datos', [notas, carpeta('horarios', [archivo('horario-1r.pdf', 120 * KB)])])] })),
        barra: ['explorador', 'navegador'],
        pestanasPropiedades: n => permisosTab(n, W, ctx, () => { ctx.apunta('Aplicar los permisos.'); revisa(); }),
      });
      W.on('permisos-ver', d => { if (/^Alumnos/.test(d.g.n)) ctx.cumple(0, 'Clic derecho en notas-1r → Propiedades → Seguridad → Alumnos: tienen Control total (todo marcado).'); });
      W.abrirExplorador(['C:', 'Datos']);
    },
  });
})();
