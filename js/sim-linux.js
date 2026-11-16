/* ============================================================
   Simulaciones de la Unidad 7 de Operaciones (Linux), 16/11/2026.
   Usan el marco de js/simulador.js y el Linux Mint de mentira de
   js/mint.js (van antes en tema.html).

   l-escritorio  S1: el menú con la tecla Windows (Super), buscar,
                 un lanzador en el panel, Ctrl + Alt + T, áreas de
                 trabajo y apagar desde el menú.
   l-archivos    S2: Gestor de archivos: crear carpeta, Mapa.png y
                 mapa.png (las mayúsculas cuentan), ocultos con
                 Ctrl + H, archivador .tar.gz y la ruta absoluta.
   l-terminal    S3: pwd, ls, mkdir, cd, cp, mv, rm y ls -l.
   l-usb         S4: el USB en ext4 de un amigo: copiar, lsblk -f,
                 formatear en exFAT o FAT con Discos y expulsar.
   l-programas   S5: sudo apt update, apt install, el Gestor de
                 software, adduser y groups.
   l-permisos    S6: ls -l, chmod +x y ./, chmod 600 y 644.
   l-procesos    S6: Gestor de tareas (Ctrl + Shift + Esc), ordenar
                 por CPU, Terminar y Matar; ps aux | grep y kill.

   Aquí están también dos aplicaciones de Linux Mint que solo usan
   estas simulaciones: Discos (gnome-disks) y el Gestor de software.
   Todo inventado. Nada se guarda.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function' || !window.MINT) return;
  const { el, boton } = window.LAB;
  const { icono } = window.MINT;
  const { dir, arch, KB, MB, GB, ruta, hijo, corto, tamano } = window.MINT.fs;
  const NOMBRE_FS = { ext4: 'Ext4', ntfs: 'NTFS', vfat: 'FAT', exfat: 'exFAT' };

  /* ============================================================
     Discos (gnome-disks)
     ============================================================ */
  function discos(L) {
    let elegido = L.usb && L.usb.conectado && !L.usb.expulsado ? 'usb' : 'sda';
    let parte = 1;
    const v = L.abrir({ app: 'discos', titulo: 'Discos', icono: 'discos', ancho: 76, alto: 80, crear: c => {
      c.classList.add('mint-dk');
      const lado = el('div', 'mint-dk__lado');
      const der = el('div', 'mint-dk__der');
      c.append(lado, der);
      function pintar() {
        const u = L.usb;
        const hayUsb = u && u.conectado && !u.expulsado;
        if (!hayUsb && elegido === 'usb') elegido = 'sda';
        lado.innerHTML = '';
        const fila = (id, t, s, ic) => {
          const b = boton('', 'mint-dk__disco' + (elegido === id ? ' mint-dk__disco--sel' : ''));
          b.append(icono(ic), el('span', 'mint-dk__dt', t), el('span', 'mint-dk__ds', s));
          b.addEventListener('click', () => { elegido = id; parte = 1; pintar(); });
          lado.appendChild(b);
        };
        fila('sda', '256 GB Disco duro', 'Samsung SSD 860', 'discos');
        if (hayUsb) fila('usb', corto(u.capacidad).replace(/G$/, ' GB') + ' Unidad', 'Kingston DataTraveler 3.0', 'usb');
        der.innerHTML = '';
        const cab = el('div', 'mint-dk__cab');
        const tt = el('p', 'mint-dk__titulo', elegido === 'usb' ? 'Unidad de ' + corto(u.capacidad).replace(/G$/, ' GB') : 'Disco de 256 GB');
        cab.appendChild(tt);
        if (elegido === 'usb') {
          const ej = boton('⏏', 'mint-dk__b');
          ej.setAttribute('aria-label', 'Expulsar este disco');
          ej.title = 'Expulsar este disco';
          ej.addEventListener('click', () => { L.expulsar('discos'); pintar(); });
          cab.appendChild(ej);
        }
        der.appendChild(cab);
        const dl = el('dl', 'mint-dk__dl');
        const dato = (a, b) => { dl.append(el('dt', null, a), el('dd', null, b)); dl.lastChild.setAttribute('translate', 'no'); };
        if (elegido === 'usb') { dato('Modelo', 'Kingston DataTraveler 3.0'); dato('Tamaño', corto(u.capacidad).replace(/G$/, ' GB') + ' (' + (u.capacidad).toLocaleString('es-ES') + ' bytes)'); dato('Dispositivo', '/dev/sdb'); }
        else { dato('Modelo', 'Samsung SSD 860 EVO'); dato('Tamaño', '256 GB'); dato('Dispositivo', '/dev/sda'); }
        der.appendChild(dl);
        der.appendChild(el('p', 'mint-dk__sub', 'Volúmenes'));
        const mapa = el('div', 'mint-dk__mapa');
        const partes = elegido === 'usb'
          ? [{ n: 1, et: u.etiqueta, tam: u.capacidad, fs: NOMBRE_FS[u.formato] || u.formato, mont: u.montado ? '/media/' + L.usuario + '/' + u.etiqueta : '', dev: '/dev/sdb1', flex: 1 }]
          : [{ n: 1, et: 'EFI', tam: 512 * MB, fs: 'FAT', mont: '/boot/efi', dev: '/dev/sda1', flex: 0.18, sistema: true }, { n: 2, et: 'Sistema', tam: 238 * GB, fs: 'Ext4', mont: '/', dev: '/dev/sda2', flex: 1, sistema: true }];
        if (!partes.find(p => p.n === parte)) parte = partes[0].n;
        partes.forEach(p => {
          const b = boton('', 'mint-dk__vol' + (p.n === parte ? ' mint-dk__vol--sel' : ''));
          b.style.flexGrow = p.flex;
          b.append(el('span', null, p.et), el('span', null, 'Partición ' + p.n), el('span', null, corto(p.tam).replace(/G$/, ' GB').replace(/M$/, ' MB') + ' ' + p.fs));
          b.setAttribute('translate', 'no');
          b.addEventListener('click', () => { parte = p.n; pintar(); });
          mapa.appendChild(b);
        });
        der.appendChild(mapa);
        const p = partes.find(x => x.n === parte);
        const acc = el('div', 'mint-dk__acc');
        if (elegido === 'usb') {
          const bm = boton(u.montado ? '■' : '▶', 'mint-dk__b');
          bm.setAttribute('aria-label', u.montado ? 'Desmontar este sistema de archivos' : 'Montar este sistema de archivos');
          bm.title = bm.getAttribute('aria-label');
          bm.addEventListener('click', () => { if (u.montado) L.desmontar('discos'); else L.montar('discos'); pintar(); });
          acc.appendChild(bm);
        } else {
          const bm = boton('■', 'mint-dk__b');
          bm.setAttribute('aria-label', 'Desmontar este sistema de archivos');
          bm.title = bm.getAttribute('aria-label');
          bm.addEventListener('click', () => L.dialogo({ titulo: 'Error', icono: 'error', texto: 'No se puede desmontar: es donde está funcionando el sistema.' }));
          acc.appendChild(bm);
        }
        const bmas = boton('⚙', 'mint-dk__b');
        bmas.setAttribute('aria-label', 'Más acciones de la partición');
        bmas.title = 'Más acciones de la partición';
        bmas.addEventListener('click', e => {
          const r = bmas.getBoundingClientRect();
          L.menu(r.left, r.bottom, [
            { t: 'Formatear partición…', f: () => formatear(p) },
            { t: 'Editar sistema de archivos…', off: true },
            { t: 'Comprobar sistema de archivos…', off: true },
          ]);
          e.stopPropagation();
        });
        acc.appendChild(bmas);
        der.appendChild(acc);
        const dl2 = el('dl', 'mint-dk__dl');
        const d2 = (a, b) => { dl2.append(el('dt', null, a), el('dd', null, b)); dl2.lastChild.setAttribute('translate', 'no'); };
        d2('Tamaño', corto(p.tam).replace(/G$/, ' GB').replace(/M$/, ' MB'));
        d2('Contenido', p.fs + ' — ' + (p.mont ? 'Montado en ' + p.mont : 'No montado'));
        d2('Dispositivo', p.dev);
        der.appendChild(dl2);
      }
      function formatear(p) {
        if (p.sistema) {
          L.dialogo({ titulo: '¡Cuidado!', icono: 'aviso', texto: ['Has elegido el disco del ordenador (' + p.dev + ').', 'Si lo formateas, borras Linux entero y todos tus archivos. Elige a la izquierda la unidad del USB.'], botones: [{ t: 'Volver', primario: true }] });
          L.emit('formatear', { error: 'sistema' });
          return;
        }
        const u = L.usb;
        let tipo = 'ext4';
        L.dialogo({
          titulo: 'Formatear volumen',
          crear(t) {
            const l = el('label', 'mint-campo');
            l.append(el('span', null, 'Nombre del volumen:'));
            const i = document.createElement('input');
            i.type = 'text'; i.className = 'mint-input'; i.value = u.etiqueta; i.spellcheck = false;
            i.setAttribute('translate', 'no');
            l.appendChild(i);
            t.appendChild(l);
            t._i = i;
            const g = el('fieldset', 'mint-dk__tipos');
            g.appendChild(el('legend', null, 'Tipo'));
            [['ext4', 'Interno, para usar solo con sistemas Linux (Ext4)'], ['ntfs', 'Para usar con sistemas Windows (NTFS)'], ['vfat', 'Para usar con todos los sistemas y dispositivos (FAT)'], ['otro', 'Otro']].forEach(([v, txt]) => {
              const r = el('label', 'mint-dk__radio');
              const x = document.createElement('input');
              x.type = 'radio'; x.name = 'tipo-fs'; x.value = v; x.checked = v === tipo;
              x.addEventListener('change', () => { tipo = v; });
              r.append(x, el('span', null, txt));
              g.appendChild(r);
            });
            t.appendChild(g);
          },
          botones: [{ t: 'Cancelar' }, { t: 'Siguiente', primario: true, f: t => {
            const nombre = t._i.value.trim() || 'USB';
            if (tipo === 'otro') setTimeout(() => otro(nombre), 0);
            else setTimeout(() => confirmar(nombre, tipo), 0);
          } }],
        });
        function otro(nombre) {
          let t2 = 'exfat';
          L.dialogo({
            titulo: 'Formatear volumen: otro',
            crear(t) {
              const g = el('fieldset', 'mint-dk__tipos');
              g.appendChild(el('legend', null, 'Sistema de archivos'));
              [['exfat', 'exFAT: para todos los sistemas, también con archivos de más de 4 GB'], ['ntfs', 'NTFS: Windows'], ['ext4', 'Ext4: Linux'], ['vfat', 'FAT: todos los sistemas y aparatos viejos']].forEach(([v, txt]) => {
                const r = el('label', 'mint-dk__radio');
                const x = document.createElement('input');
                x.type = 'radio'; x.name = 'tipo-fs2'; x.value = v; x.checked = v === t2;
                x.addEventListener('change', () => { t2 = v; });
                r.append(x, el('span', null, txt));
                g.appendChild(r);
              });
              t.appendChild(g);
            },
            botones: [{ t: 'Cancelar' }, { t: 'Siguiente', primario: true, f: () => { setTimeout(() => confirmar(nombre, t2), 0); } }],
          });
        }
        function confirmar(nombre, fs) {
          L.dialogo({
            titulo: 'Confirmar los detalles',
            icono: 'aviso',
            texto: ['¿Formatear el volumen?', 'Se perderán todos los datos del volumen: ' + u.etiqueta + ' (' + corto(u.capacidad) + ', /dev/sdb1).', 'Nuevo: ' + nombre + ' — ' + NOMBRE_FS[fs]],
            botones: [{ t: 'Atrás' }, { t: 'Formatear', primario: true, f: () => {
              setTimeout(() => L.pedirClave('Para formatear un dispositivo hace falta ser administrador.', () => {
                if (u.montado && !L.desmontar('discos')) { L.emit('formatear', { error: 'ocupado' }); return; }
                const antes = { formato: u.formato, etiqueta: u.etiqueta, hijos: u.hijos };
                u.formato = fs; u.etiqueta = fs === 'vfat' ? nombre.toUpperCase().slice(0, 11) : nombre; u.hijos = [];
                L.notificacion('Formateado', u.etiqueta + ' — ' + NOMBRE_FS[fs] + '. El USB está vacío.', 'usb');
                L.emit('formatear', { formato: fs, etiqueta: u.etiqueta, antes });
                L.refrescar();
                pintar();
              }), 0);
            } }],
          });
        }
      }
      L.on('usb', () => { if (v.el.isConnected) pintar(); });
      pintar();
    } });
    return v;
  }

  /* ============================================================
     Gestor de software (mintinstall)
     ============================================================ */
  const CATALOGO = [
    { id: 'vlc', n: 'VLC', d: 'Reproductor de vídeo y música: abre casi cualquier archivo.', ic: 'video', cat: 'Multimedia' },
    { id: 'gimp', n: 'GIMP', d: 'Editor de imágenes, como un Photoshop libre.', ic: 'imagen', cat: 'Gráficos' },
    { id: 'minetest', n: 'Minetest', d: 'Juego libre de bloques, parecido a Minecraft.', ic: 'juego', cat: 'Juegos' },
    { id: 'libreoffice-writer', n: 'LibreOffice Writer', d: 'Procesador de textos.', ic: 'writer', cat: 'Oficina' },
    { id: 'cowsay', n: 'cowsay', d: 'Una vaca que dice en la terminal lo que le escribas.', ic: 'terminal', cat: 'Accesorios' },
  ];
  function software(L) {
    let pagina = null, q = '', ocupado = false;
    const v = L.abrir({ app: 'software', titulo: 'Gestor de software', icono: 'software', ancho: 72, alto: 80, crear: c => {
      c.classList.add('mint-sw');
      const cab = el('div', 'mint-sw__cab');
      const at = boton('', 'mint-th__nb');
      at.appendChild(icono('atras'));
      at.setAttribute('aria-label', 'Atrás');
      at.addEventListener('click', () => { pagina = null; pintar(); });
      const busca = document.createElement('input');
      busca.type = 'search';
      busca.className = 'mint-input mint-sw__buscar';
      busca.placeholder = 'Buscar';
      busca.setAttribute('aria-label', 'Buscar programas');
      busca.addEventListener('input', () => { q = busca.value.trim().toLowerCase(); pagina = null; pintar(); });
      cab.append(at, busca);
      const cuerpo = el('div', 'mint-sw__cuerpo');
      c.append(cab, cuerpo);
      function tarjeta(a) {
        const b = boton('', 'mint-sw__tarjeta');
        b.append(icono(a.ic), el('span', 'mint-sw__tn', a.n), el('span', 'mint-sw__td', a.d));
        if (L.instalados.indexOf(a.id) !== -1) b.appendChild(el('span', 'mint-sw__ya', '✓ Instalado'));
        b.addEventListener('click', () => { pagina = a; pintar(); L.emit('software', { tipo: 'ver', id: a.id }); });
        return b;
      }
      function pintar() {
        at.disabled = !pagina;
        cuerpo.innerHTML = '';
        if (pagina) {
          const a = pagina;
          const ya = L.instalados.indexOf(a.id) !== -1;
          const p = el('div', 'mint-sw__pag');
          const arriba = el('div', 'mint-sw__parriba');
          arriba.append(icono(a.ic, 'mint-sw__pico'));
          const tx = el('div');
          tx.append(el('p', 'mint-sw__pn', a.n), el('p', 'mint-sw__pd', a.d), el('p', 'mint-sw__pd', 'Paquete: ' + a.id + ' · Repositorio oficial de Linux Mint'));
          tx.lastChild.setAttribute('translate', 'no');
          arriba.appendChild(tx);
          p.appendChild(arriba);
          const fila = el('div', 'mint-sw__bots');
          if (ocupado) {
            const bar = el('div', 'mint-sw__prog');
            bar.appendChild(el('span', 'mint-sw__progr'));
            fila.append(el('span', null, 'Instalando…'), bar);
          } else if (ya) {
            const des = boton('Desinstalar', 'w11-btn');
            des.addEventListener('click', () => L.pedirClave('Para desinstalar programas hace falta ser administrador.', () => {
              L.instalados.splice(L.instalados.indexOf(a.id), 1);
              delete L.apps[a.id];
              L.emit('desinstalar', { paquetes: [a.id], origen: 'software' });
              pintar();
            }));
            const ab = boton('Abrir', 'w11-btn w11-btn--primario');
            ab.addEventListener('click', () => { if (L.apps[a.id]) L.abrirApp(a.id, { origen: 'software' }); });
            fila.append(des, ab);
          } else {
            const ins = boton('Instalar', 'w11-btn w11-btn--primario');
            ins.addEventListener('click', () => L.pedirClave('Para instalar programas hace falta ser administrador.', () => {
              ocupado = true; pintar();
              setTimeout(() => {
                ocupado = false;
                if (!v.el.isConnected) return;
                if (L.instalados.indexOf(a.id) === -1) L.instalados.push(a.id);
                nuevaApp(L, a);
                L.emit('instalar', { paquetes: [a.id], origen: 'software' });
                L.notificacion('Instalado', a.n + ' ya está en el menú.', 'software');
                pintar();
              }, 1300);
            }));
            fila.appendChild(ins);
          }
          p.appendChild(fila);
          cuerpo.appendChild(p);
          return;
        }
        const lista = q ? CATALOGO.filter(a => (a.n + ' ' + a.d + ' ' + a.id).toLowerCase().indexOf(q) !== -1) : CATALOGO;
        cuerpo.appendChild(el('p', 'mint-sw__sub', q ? 'Resultados' : 'Destacados'));
        const rej = el('div', 'mint-sw__rej');
        lista.forEach(a => rej.appendChild(tarjeta(a)));
        if (!lista.length) rej.appendChild(el('p', 'mint-sw__nada', 'No se ha encontrado nada.'));
        cuerpo.appendChild(rej);
      }
      pintar();
    } });
    return v;
  }
  function nuevaApp(L, a) {
    if (L.apps[a.id]) return;
    L.apps[a.id] = { id: a.id, n: a.n, icono: a.ic, cat: a.cat === 'Multimedia' || a.cat === 'Gráficos' || a.cat === 'Juegos' ? 'Accesorios' : a.cat, buscar: [a.id, a.n.toLowerCase()] };
  }
  const APPS_EXTRA = {
    discos: { abrir: L => discos(L) },
    software: { abrir: L => software(L) },
  };

  /* ============================================================
     S1 · Linux y su escritorio
     ============================================================ */
  registrarSimulacion('l-escritorio', {
    ventana: 'Linux Mint',
    mision: [
      'Abre el menú con la tecla Windows (en Linux se llama Super) y abre el Editor de textos buscándolo con el teclado.',
      'Pon la Calculadora en el panel de abajo, para abrirla con un clic.',
      'Abre la Terminal con su atajo de teclado.',
      'Lleva la Terminal al área de trabajo 2 y cámbiate a esa área para verla.',
      'Cuando tengas lo demás, apaga el ordenador desde el menú.',
    ],
    final: 'Apunta en tu cuaderno cómo has hecho cada una de las cinco cosas: el atajo que has pulsado o dónde has hecho clic (pregunta 15).',
    crear(ctx) {
      const L = MINT.escritorio(ctx, {
        documentos: [arch('horario.pdf', 210 * KB)],
        apps: APPS_EXTRA,
      });
      let menuTeclado = false;
      L.on('menu', d => { menuTeclado = d.origen === 'atajo'; ctx.apunta('Abrir el menú ' + (d.origen === 'atajo' ? 'con la tecla Windows (Super).' : 'con el ratón (botón Menú).')); });
      L.on('app', d => {
        if (d.id === 'editor') {
          if (d.origen === 'buscar' && menuTeclado) ctx.cumple(0, 'Tecla Windows (Super) → escribir «editor» → Editor de textos.');
          else if (!ctx.hecho(0)) {
            ctx.apunta('Abrir el Editor de textos.');
            L.aviso(d.origen === 'buscar' ? 'Lo has buscado bien, pero el menú lo abriste con el ratón. Ciérralo y prueba con la tecla Windows del teclado de abajo (dos toques).' : 'Se ha abierto, pero sin buscarlo. Abre el menú con la tecla Windows y escribe «editor».', 'cuidado');
          }
        }
        if (d.id === 'terminal') {
          if (d.origen === 'atajo') ctx.cumple(2, 'Ctrl + Alt + T: se abre la Terminal.');
          else if (!ctx.hecho(2)) { ctx.apunta('Abrir la Terminal con el ratón.'); L.aviso('Se ha abierto, pero con el ratón. La misión pide el atajo de teclado: búscalo en la tabla de los atajos.', 'cuidado'); }
        }
      });
      L.on('anclar', d => {
        if (d.id !== 'calculadora') return;
        if (d.donde === 'escritorio') { ctx.apunta('Añadir la Calculadora al escritorio.'); L.aviso('Eso la pone en el escritorio. La misión pide el panel de abajo.', 'cuidado'); return; }
        if (d.si) ctx.cumple(1, 'Menú → clic derecho en la Calculadora → Añadir al panel.');
        else if (ctx.hecho(1)) { ctx.deshace(1); ctx.apunta('Quitar la Calculadora del panel.'); }
      });
      function revisa() {
        const t = L.ventanas.find(v => v.app === 'terminal');
        if (t && t.area === 1 && L.area === 1) ctx.cumple(3, 'La Terminal en el área de trabajo 2 y cambio al área 2.');
      }
      L.on('moverArea', d => { ctx.apunta('Mover «' + d.v.def.titulo + '» al área de trabajo ' + (d.area + 1) + (d.origen === 'atajo' ? ' (Ctrl + Alt + Shift + flecha).' : ' (clic derecho en la barra de título → Mover a otro área de trabajo).')); revisa(); });
      L.on('area', d => { if (d.origen !== 'ventana') ctx.apunta('Cambiar al área de trabajo ' + (d.area + 1) + (d.origen === 'atajo' ? ' (Ctrl + Alt + flecha).' : ' (clic en su cuadrito del panel).')); revisa(); });
      L.on('energia', d => {
        if (d.que !== 'Apagar') { ctx.apunta('Menú → ⏻ → ' + d.que + '.'); return; }
        if ([0, 1, 2, 3].every(i => ctx.hecho(i))) ctx.cumple(4, 'Menú → ⏻ (Cerrar la sesión) → Apagar.');
        else { ctx.falla('Apagar antes de acabar la misión.'); L.aviso('Has apagado antes de acabar lo demás. Pulsa ⏻ para encender y sigue con la misión.', 'cuidado'); }
      });
    },
  });

  /* ============================================================
     S2 · Archivos en Linux
     ============================================================ */
  registrarSimulacion('l-archivos', {
    ventana: 'Linux Mint',
    mision: [
      'Crea la carpeta minecraft dentro de Documentos.',
      'Mueve a esa carpeta los dos mapas de Descargas: Mapa.png y mapa.png.',
      'Enseña los archivos ocultos y abre el que hay en Descargas.',
      'Crea un archivador .tar.gz de la carpeta minecraft.',
      'Escribe en la barra de ruta (Ctrl + L) la ruta absoluta de la carpeta minecraft y pulsa Intro.',
    ],
    final: 'Apunta en tu cuaderno la ruta absoluta de la carpeta minecraft, qué dice el archivo oculto y por qué en Linux pueden estar Mapa.png y mapa.png en la misma carpeta (pregunta 15).',
    crear(ctx) {
      const m1 = arch('Mapa.png', 845 * KB), m2 = arch('mapa.png', 812 * KB);
      const oculto = arch('.servidor.txt', 64, { contenido: 'Servidor de BloqueCraft\ndirección: bloquecraft.es\npuerto: 25565' });
      const L = MINT.escritorio(ctx, {
        descargas: [m1, m2, arch('lista-mods.txt', 2 * KB, { contenido: 'OptiFine\nJourneyMap' }), oculto],
        documentos: [arch('apuntes-u6.odt', 48 * KB)],
        apps: APPS_EXTRA,
      });
      L.abrirApp('archivos', { origen: 'inicio' });
      const mc = () => { const r = L.resolver('~/Documentos/minecraft'); return r.nodo && r.nodo.dir ? r.nodo : null; };
      L.on('cambio', () => {
        const c = mc();
        if (c) ctx.cumple(0, 'Documentos → clic derecho → Crear carpeta… → minecraft.'); else if (ctx.hecho(0)) ctx.deshace(0);
        if (c && m1._p === c && m2._p === c) ctx.cumple(1, 'Mapa.png y mapa.png, cortados de Descargas y pegados en minecraft.');
        else if (ctx.hecho(1)) ctx.deshace(1);
      });
      L.on('fs', d => {
        if (d.tipo === 'nueva' && d.nodo && /^minecraft$/i.test(d.nodo.n) && d.nodo.n !== 'minecraft') L.aviso('Ojo: la has llamado «' + d.nodo.n + '». En Linux las mayúsculas cuentan: tiene que ser minecraft, todo en minúsculas. Renómbrala con F2.', 'cuidado');
        if (d.tipo === 'nueva' && d.nodo && d.nodo.n === 'minecraft' && d.nodo._p !== L.resolver('~/Documentos').nodo) L.aviso('La has creado, pero no dentro de Documentos. Muévela o créala otra vez dentro de Documentos.', 'cuidado');
        if (d.tipo === 'copiar' && d.origenes && (d.origenes.indexOf(m1) !== -1 || d.origenes.indexOf(m2) !== -1)) { ctx.apunta('Copiar un mapa.'); L.aviso('Lo has copiado: en Descargas sigue estando. La misión pide moverlos: Cortar (Ctrl + X) y Pegar.', 'cuidado'); }
        if (d.tipo === 'ocultos') ctx.apunta(d.si ? 'Mostrar los archivos ocultos (' + (d.origen === 'atajo' ? 'Ctrl + H' : 'Ver → Mostrar archivos ocultos') + ').' : 'Esconder los archivos ocultos.');
        if (d.tipo === 'abrir' && d.nodo === oculto) ctx.cumple(2, 'Ctrl + H y abrir .servidor.txt (empieza por punto: es oculto).');
        if (d.tipo === 'archivador') {
          const c = mc();
          if (c && d.nodos.indexOf(c) !== -1 && d.formato === '.tar.gz') ctx.cumple(3, 'Clic derecho en minecraft → Crear un archivador… → ' + d.nodo.n + '.');
          else if (d.formato !== '.tar.gz') { ctx.apunta('Crear el archivador ' + d.nodo.n + '.'); L.aviso('Has elegido ' + d.formato + '. La misión pide .tar.gz, el de Linux.', 'cuidado'); }
          else { ctx.apunta('Crear el archivador ' + d.nodo.n + '.'); L.aviso('Ese archivador no es de la carpeta minecraft.', 'cuidado'); }
        }
      });
      L.on('thunar', d => {
        if (d.tipo !== 'ruta') return;
        const t = d.texto.trim().replace(/\/+$/, '');
        if (!d.ok) { ctx.falla('Escribir la ruta «' + d.texto + '»: no existe.'); return; }
        const c = mc();
        if (c && d.ruta === ruta(c)) {
          if (t[0] === '/') ctx.cumple(4, 'Ctrl + L → ' + t + ' → Intro.');
          else { ctx.apunta('Escribir la ruta ' + t + '.'); L.aviso('Te ha llevado, pero esa ruta no es absoluta: una ruta absoluta empieza por / (la raíz).', 'cuidado'); }
        } else ctx.apunta('Ir a ' + d.ruta + ' escribiendo la ruta.');
      });
    },
  });

  /* ============================================================
     S3 · La terminal
     ============================================================ */
  registrarSimulacion('l-terminal', {
    ventana: 'Linux Mint',
    mision: [
      'Mira en qué carpeta estás y qué hay en ella.',
      'Crea la carpeta practicas-u7 en tu carpeta personal y entra en ella.',
      'Copia lista-mods.txt de Descargas a practicas-u7 (en Descargas tiene que seguir estando).',
      'Mueve las dos imágenes .png de Descargas a practicas-u7.',
      'Borra basura.tmp de Descargas.',
      'Dentro de practicas-u7, mira lo que hay con todos los detalles (ls -l).',
    ],
    final: 'Apunta en tu cuaderno, en orden, las órdenes que has escrito para cada punto de la misión (pregunta 15).',
    crear(ctx) {
      const L = MINT.escritorio(ctx, {
        descargas: [arch('castillo.png', 1.2 * MB), arch('aldea.png', 940 * KB), arch('lista-mods.txt', 2 * KB, { contenido: 'OptiFine\nJourneyMap\nJEI' }), arch('basura.tmp', 18 * KB)],
        documentos: [arch('apuntes-u6.odt', 48 * KB)],
        apps: APPS_EXTRA,
      });
      L.abrirApp('terminal', { origen: 'inicio' });
      let pwd = false, lsCasa = false, raton = false;
      const P = () => { const r = L.resolver('~/practicas-u7'); return r.nodo && r.nodo.dir ? r.nodo : null; };
      const D = () => L.resolver('~/Descargas').nodo;
      L.on('fs', d => {
        if (d.origen && d.origen !== 'terminal' && ['nueva', 'nuevo', 'mover', 'copiar', 'eliminar', 'papelera'].indexOf(d.tipo) !== -1 && !raton) {
          raton = true;
          L.aviso('Eso lo has hecho con el ratón. En esta misión todo se hace escribiendo órdenes en la Terminal.', 'cuidado');
        }
      });
      L.on('cmd', d => {
        if (d.cmd === 'pwd') pwd = true;
        if (d.cmd === 'ls' && d.ok && d.cwd === L.casa && !d.args.filter(a => a[0] !== '-').length) lsCasa = true;
        if (pwd && lsCasa) ctx.cumple(0, 'pwd (estoy en /home/alumno) y ls.');
        const p = P();
        if (p && L.terminales().some(t => t.cwd === p)) ctx.cumple(1, 'mkdir practicas-u7 y cd practicas-u7.');
        if (d.cmd === 'mv' && d.ok && d.hechos && d.hechos.some(h => h.a.n === 'lista-mods.txt')) L.aviso('Has movido lista-mods.txt: ya no está en Descargas. La misión pide copiarla (cp). Devuélvela con mv y cópiala.', 'cuidado');
        if (d.cmd === 'cp' && d.ok && d.hechos && d.hechos.some(h => /\.png$/.test(h.a.n))) L.aviso('Has copiado una imagen: sigue en Descargas. Las imágenes se mueven (mv); bórralas de Descargas o muévelas.', 'cuidado');
        const des = D();
        if (p && hijo(p, 'lista-mods.txt') && hijo(des, 'lista-mods.txt')) ctx.cumple(2, 'cp ~/Descargas/lista-mods.txt . (o con la ruta de practicas-u7).');
        else if (ctx.hecho(2)) ctx.deshace(2);
        if (p && hijo(p, 'castillo.png') && hijo(p, 'aldea.png') && !hijo(des, 'castillo.png') && !hijo(des, 'aldea.png')) ctx.cumple(3, 'mv con las dos imágenes .png (o mv ~/Descargas/*.png .).');
        else if (ctx.hecho(3)) ctx.deshace(3);
        if (!hijo(des, 'basura.tmp')) ctx.cumple(4, 'rm ~/Descargas/basura.tmp.');
        if (d.cmd === 'ls' && d.largo && d.ok && p && [1, 2, 3, 4].every(i => ctx.hecho(i))) {
          const dentro = d.cwd === p && !d.rutas.some(r => r !== '.') || d.rutas.some(r => L.resolver(r, d.cwd).nodo === p);
          if (dentro) ctx.cumple(5, 'ls -l dentro de practicas-u7: tres archivos.');
        }
        if (d.cmd === 'rm' && d.ok && d.borrados && d.borrados.some(n => n.n !== 'basura.tmp')) L.aviso('Has borrado ' + d.borrados.filter(n => n.n !== 'basura.tmp').map(n => n.n).join(', ') + ' y rm no usa la papelera. Pulsa «Empezar otra vez» si lo necesitas.', 'cuidado');
      });
    },
  });

  /* ============================================================
     S4 · Unidades y USB
     ============================================================ */
  registrarSimulacion('l-usb', {
    ventana: 'Linux Mint',
    mision: [
      'Abre el USB en el Gestor de archivos y copia mapa-servidor.zip a tu carpeta Documentos.',
      'En la Terminal, mira con lsblk -f dónde está montado el USB y qué sistema de archivos tiene.',
      'Con Discos, formatea el USB para que lo lean Windows, Linux y la tele, con el nombre CLASE.',
      'Expulsa el USB para poder quitarlo.',
    ],
    final: 'Apunta en tu cuaderno dónde estaba montado el USB, qué sistema de archivos tenía, cuál has elegido al formatear y por qué, y cómo lo has expulsado (pregunta 15).',
    crear(ctx) {
      const L = MINT.escritorio(ctx, {
        documentos: [arch('apuntes-u6.odt', 48 * KB)],
        usb: { etiqueta: 'KINGSTON', capacidad: 16 * GB, formato: 'ext4', hijos: [arch('mapa-servidor.zip', 120 * MB), arch('leeme.txt', 1 * KB, { contenido: 'Te paso el mapa del servidor.\nEl USB lo formateé en mi Linux, en ext4.' })] },
        apps: APPS_EXTRA,
      });
      setTimeout(() => { if (L.dom.isConnected) L.notificacion('Se ha conectado un dispositivo', 'KINGSTON (16 GB). Lo verás en el Gestor de archivos, en Dispositivos.', 'usb'); }, 300);
      let formateado = false;
      L.on('cambio', () => {
        const doc = L.resolver('~/Documentos').nodo;
        if (hijo(doc, 'mapa-servidor.zip')) ctx.cumple(0, 'Abrir KINGSTON en el Gestor de archivos y copiar mapa-servidor.zip a Documentos.');
      });
      L.on('usb', d => {
        if (d.tipo === 'montar') ctx.apunta('Montar el USB: está en /media/alumno/' + L.usb.etiqueta + '.');
        if (d.tipo === 'expulsar') {
          if (formateado && ctx.hecho(2)) ctx.cumple(3, 'Expulsar el USB (⏏ en el Gestor de archivos o en Discos).');
          else { ctx.apunta('Expulsar el USB.'); L.aviso('Lo has expulsado antes de acabar. Para volver a usarlo, pulsa «Empezar otra vez».', 'cuidado'); }
        }
      });
      L.on('cmd', d => {
        if (d.cmd === 'lsblk' && d.ok) {
          if (!L.usb.montado) { ctx.apunta('lsblk: el USB (sdb) aún no está montado.'); L.aviso('Sale sdb, pero sin montar. Ábrelo antes en el Gestor de archivos y vuelve a probar.', 'cuidado'); return; }
          if (d.fs) ctx.cumple(1, 'lsblk -f: sdb1, ext4, montado en /media/alumno/KINGSTON.');
          else { ctx.apunta('lsblk: sale dónde está montado.'); L.aviso('Ahí ves dónde está montado, pero no el sistema de archivos. Prueba lsblk -f.', 'cuidado'); }
        }
        if (d.cmd === 'df' && d.ok) { ctx.apunta('df: el espacio de cada disco.'); if (!ctx.hecho(1)) L.aviso('df -h enseña el espacio y dónde está montado, pero no el sistema de archivos. Prueba lsblk -f.', 'cuidado'); }
      });
      L.on('formatear', d => {
        if (d.error === 'sistema') { ctx.falla('Intentar formatear el disco del ordenador.'); return; }
        if (d.error) return;
        formateado = true;
        if (!ctx.hecho(0)) { ctx.falla('Formatear sin copiar antes el mapa: se ha borrado.'); L.aviso('Has formateado sin copiar antes mapa-servidor.zip: se ha borrado para siempre. Pulsa «Empezar otra vez».'); return; }
        if (d.formato === 'ext4') { ctx.falla('Formatear en Ext4.'); L.aviso('Ext4 es de Linux: el Windows del instituto y la tele no lo leen. Formatea otra vez.', 'cuidado'); return; }
        if (d.formato === 'ntfs') { ctx.falla('Formatear en NTFS.'); L.aviso('Windows y Linux leen NTFS, pero muchas teles no. Mejor exFAT (en «Otro») o FAT.', 'cuidado'); return; }
        if (d.etiqueta !== 'CLASE') { ctx.apunta('Formatear en ' + NOMBRE_FS[d.formato] + ' con el nombre ' + d.etiqueta + '.'); L.aviso('El sistema de archivos está bien, pero la misión pide el nombre CLASE (en mayúsculas).', 'cuidado'); return; }
        ctx.cumple(2, 'Discos → la unidad de 16 GB → ⚙ → Formatear partición… → ' + NOMBRE_FS[d.formato] + ', nombre CLASE → contraseña.');
      });
    },
  });

  /* ============================================================
     S5 · Usuarios, sudo e instalar programas
     ============================================================ */
  registrarSimulacion('l-programas', {
    ventana: 'Linux Mint',
    mision: [
      'En la Terminal, actualiza la lista de programas con apt. Prueba primero sin sudo y luego con sudo (tu contraseña es alumno).',
      'Instala minetest con apt.',
      'Instala VLC con el Gestor de software, sin la Terminal.',
      'Crea la usuaria ana con adduser.',
      'Mira con groups tus grupos y los de ana: ¿quién está en el grupo sudo?',
    ],
    final: 'Apunta en tu cuaderno la orden de cada punto, qué error salió sin sudo y quién está en el grupo sudo (pregunta 15).',
    crear(ctx) {
      const L = MINT.escritorio(ctx, { apps: APPS_EXTRA, instalados: ['firefox', 'thunar', 'mousepad', 'libreoffice-writer', 'xfce4-terminal', 'bash', 'nano', 'cowsay'] });
      L.abrirApp('terminal', { origen: 'inicio' });
      let sinSudo = false, gYo = false, gAna = false;
      L.on('cmd', d => {
        if (d.cmd === 'apt' && d.sub === 'update' && d.error === 'root') { sinSudo = true; ctx.apunta('apt update sin sudo: «Permiso denegado».'); }
        if (d.cmd === 'apt' && d.sub === 'install' && d.error === 'root') ctx.apunta('apt install sin sudo: «¿es usted superusuario?».');
        if (d.cmd === 'apt' && d.sub === 'install' && d.error === 'noexiste') { ctx.falla('apt install: no existe ese paquete.'); L.aviso('Ese paquete no existe: mira cómo se escribe (todo en minúsculas).', 'cuidado'); }
        if (d.cmd === 'adduser' && d.error === 'root') ctx.apunta('adduser sin sudo: solo root puede añadir usuarios.');
        if (d.cmd === 'groups' && d.ok) {
          if (d.usuario === 'ana' || d.args[0] === 'ana') gAna = true; else if (!d.args.length || d.args[0] === L.usuario) gYo = true;
          if (gYo && gAna && ctx.hecho(3)) { L.aviso(''); ctx.cumple(4, 'groups y groups ana: yo estoy en sudo; ana, no.'); }
          else if (gAna && !gYo) L.aviso('Ahora mira también los tuyos: groups, sin nada más.', 'cuidado');
          else if (gYo && !gAna && ctx.hecho(3)) L.aviso('Ahora los de ana: groups ana.', 'cuidado');
        }
      });
      L.on('apt', d => {
        if (d.sub === 'update') ctx.cumple(0, (sinSudo ? 'apt update sin sudo da error; ' : '') + 'sudo apt update → contraseña → lista actualizada.');
      });
      L.on('instalar', d => {
        if (d.paquetes.indexOf('minetest') !== -1) {
          if (d.origen === 'terminal') ctx.cumple(1, 'sudo apt install minetest → S.');
          else { ctx.apunta('Instalar Minetest con el Gestor de software.'); L.aviso('Así también se instala, pero la misión pide hacerlo con apt en la Terminal. Desinstálalo y prueba con apt.', 'cuidado'); }
        }
        if (d.paquetes.indexOf('vlc') !== -1) {
          if (d.origen === 'software') ctx.cumple(2, 'Gestor de software → VLC → Instalar → contraseña.');
          else { ctx.apunta('Instalar VLC con apt.'); L.aviso('Funciona, pero la misión pide el Gestor de software (Menú → buscar «software»). Quítalo con sudo apt remove vlc y prueba otra vez.', 'cuidado'); }
        }
      });
      L.on('desinstalar', d => { ctx.apunta('Desinstalar ' + d.paquetes.join(', ') + '.'); if (d.paquetes.indexOf('vlc') !== -1 && ctx.hecho(2)) ctx.deshace(2); if (d.paquetes.indexOf('minetest') !== -1 && ctx.hecho(1)) ctx.deshace(1); });
      L.on('usuario', d => {
        if (d.usuario === 'ana') ctx.cumple(3, 'sudo adduser ana → contraseña de ana dos veces → Intro en los datos → S.');
        else { ctx.apunta('Crear el usuario ' + d.usuario + '.'); L.aviso('Has creado «' + d.usuario + '». La misión pide ana, en minúsculas.', 'cuidado'); }
      });
    },
  });

  /* ============================================================
     S6 · Permisos
     ============================================================ */
  registrarSimulacion('l-permisos', {
    ventana: 'Linux Mint',
    mision: [
      'Entra en la carpeta servidor y mira los permisos de sus archivos con ls -l.',
      'Arranca el servidor con ./arrancar.sh. Si da «Permiso denegado», dale permiso de ejecución.',
      'Haz que claves.txt solo lo puedas leer y cambiar tú, nadie más.',
      'Haz que lista-blanca.txt la puedan leer todos, pero solo tú la puedas cambiar.',
    ],
    final: 'Apunta en tu cuaderno los permisos que tenía cada archivo al principio (con letras) y las órdenes chmod que has usado (pregunta 10).',
    crear(ctx) {
      const arranca = arch('arrancar.sh', 312, { perm: 'rw-r--r--', contenido: '#!/bin/bash\n# arranca el servidor de BloqueCraft\njava -jar bloquecraft.jar', salida: 'Arrancando el servidor de BloqueCraft...\nServidor listo en bloquecraft.es, puerto 25565.' });
      const claves = arch('claves.txt', 120, { perm: 'rw-r--r--', contenido: 'admin: Cr33per!2027\nconsola: bloque-1234' });
      const lista = arch('lista-blanca.txt', 90, { perm: 'rw-rw-rw-', contenido: 'ProfesorCabron\nCreeperVerde\nAldeanoFeliz' });
      const L = MINT.escritorio(ctx, {
        casa: [dir('servidor', [arranca, claves, lista, dir('mundo', [arch('level.dat', 6 * KB)])])],
        apps: APPS_EXTRA,
      });
      L.abrirApp('terminal', { origen: 'inicio' });
      const S = () => L.resolver('~/servidor').nodo;
      L.on('cmd', d => {
        if (d.cmd === 'ls' && d.largo && d.ok) {
          const s = S();
          if (d.cwd === s && !d.rutas.some(r => r !== '.')) ctx.cumple(0, 'cd servidor y ls -l.');
          else if (d.rutas.some(r => L.resolver(r, d.cwd).nodo === s)) ctx.cumple(0, 'ls -l servidor.');
        }
        if (d.error === 'permiso' && d.nodo === arranca) ctx.apunta('./arrancar.sh → Permiso denegado (no tiene x).');
        if (d.cmd === 'arrancar.sh' || (d.error === 'noorden' && /arrancar/.test(d.cmd))) L.aviso('Para ejecutar un programa de la carpeta en la que estás hay que poner ./ delante: ./arrancar.sh', 'cuidado');
      });
      L.on('ejecutar', d => { if (d.nodo === arranca) ctx.cumple(1, 'chmod +x arrancar.sh y ./arrancar.sh: el servidor arranca.'); });
      L.on('permisos', d => {
        const n = d.nodo;
        ctx.apunta((d.origen === 'terminal' ? 'chmod ' + d.modo + ' ' + n.n : 'Propiedades → Permisos de ' + n.n) + ': ' + n.perm + ' (' + MINT.fs.octalDe(n.perm) + ').');
        if (n.perm === 'rwxrwxrwx') { L.aviso('¡777! Ahora cualquiera puede cambiar y borrar ' + n.n + '. Nunca uses 777.', 'cuidado'); }
        if (n === claves) {
          if (n.perm === 'rw-------') ctx.cumple(2, 'chmod 600 claves.txt (rw-------).');
          else { if (ctx.hecho(2)) ctx.deshace(2); if (/r/.test(n.perm.slice(3))) L.aviso('Aún la pueden leer otros: mira las letras del grupo y de otros.', 'cuidado'); else if (n.perm.slice(0, 2) !== 'rw') L.aviso('Ahora ni tú puedes cambiarla: tú necesitas rw.', 'cuidado'); }
        }
        if (n === lista) {
          if (n.perm === 'rw-r--r--') ctx.cumple(3, 'chmod 644 lista-blanca.txt (rw-r--r--).');
          else { if (ctx.hecho(3)) ctx.deshace(3); if (/w/.test(n.perm.slice(3))) L.aviso('Aún la puede cambiar alguien más que tú: quita la w del grupo y de otros.', 'cuidado'); else if (n.perm.slice(3).indexOf('r') === -1 || n.perm[6] !== 'r') L.aviso('Ahora no la pueden leer todos: el grupo y otros necesitan r.', 'cuidado'); }
        }
        if (n === arranca && !/x/.test(n.perm.slice(0, 3)) && ctx.hecho(1)) L.aviso('Le has quitado la x a arrancar.sh: ya no se puede ejecutar.', 'cuidado');
      });
    },
  });

  /* ============================================================
     S6 · Procesos
     ============================================================ */
  registrarSimulacion('l-procesos', {
    ventana: 'Linux Mint',
    mision: [
      'Prueba a cerrar el juego con la ✕. Como no responde, abre el Gestor de tareas con su atajo.',
      'Ordena los procesos por CPU para ver cuál la está gastando.',
      'Cierra el juego: prueba primero Terminar y, si no hace caso, Matar.',
      'En la Terminal, busca el PID de bloquecraft-chat con ps aux | grep bloque y ciérralo con kill.',
    ],
    final: 'Apunta en tu cuaderno cómo abriste el Gestor de tareas, qué programa gastaba más CPU y cuánta, qué pasó con Terminar y con Matar, y las dos órdenes de la Terminal, con el PID (pregunta 15).',
    crear(ctx) {
      const L = MINT.escritorio(ctx, {
        apps: Object.assign({ juego: { n: 'Minecraft Launcher', icono: 'juego', cat: 'Accesorios', buscar: ['minecraft', 'juego'] } }, APPS_EXTRA),
        ordenTareas: 'n',
        procesos: [
          { pid: 2210, n: 'firefox', cpu: 1.8, mem: 612 },
          { pid: 3412, n: 'minecraft-launcher', cpu: 97.6, mem: 1450, terco: true, colgado: true },
          { pid: 3520, n: 'bloquecraft-chat', cpu: 0.3, mem: 118 },
        ],
      });
      const p = L.procesos.find(x => x.n === 'minecraft-launcher');
      const juego = L.abrir({ app: 'juego', titulo: 'Minecraft Launcher (no responde)', icono: 'juego', ancho: 58, alto: 62, crear: c => {
        c.classList.add('mint-colgado');
        c.append(icono('juego', 'mint-colgado__ico'), el('p', null, 'Cargando el mundo… 37 %'), el('p', 'mint-colgado__t', 'La ventana no responde.'));
      }, alCerrar: () => {
        if (L.procesos.indexOf(p) === -1) return true;
        ctx.apunta('Clic en la ✕ del juego: no se cierra.');
        L.notificacion('«Minecraft Launcher» no responde', 'La ventana no hace caso. Ciérralo desde el Gestor de tareas.', 'aviso');
        return false;
      } });
      p.ventana = juego;
      let probadoTerminar = false;
      L.on('app', d => {
        if (d.id !== 'tareas') return;
        if (d.origen === 'atajo') ctx.cumple(0, 'Ctrl + Shift + Esc: el Gestor de tareas.');
        else if (!ctx.hecho(0)) { ctx.apunta('Abrir el Gestor de tareas con el ratón.'); L.aviso('Se ha abierto, pero con el ratón. La misión pide el atajo: Ctrl + Shift + Esc en el teclado de abajo.', 'cuidado'); }
      });
      L.on('tareas', d => { if (d.tipo === 'ordenar' && d.por === 'cpu') ctx.cumple(1, 'Clic en la columna CPU: minecraft-launcher, 97,6 %.'); });
      L.on('proceso', d => {
        if (d.p.n === 'minecraft-launcher') {
          if (d.tipo === 'terco') { probadoTerminar = true; ctx.apunta('Terminar minecraft-launcher: no hace caso (está colgado).'); }
          if (d.tipo === 'matar' || d.tipo === 'terminar') ctx.cumple(2, (probadoTerminar ? 'Terminar no funciona; ' : '') + (d.origen === 'terminal' ? 'kill -9 3412' : 'clic derecho → Matar') + ': el juego se cierra.');
        }
        if (d.p.n === 'bloquecraft-chat') {
          if (d.origen === 'terminal') ctx.cumple(3, 'ps aux | grep bloque → PID 3520 → kill 3520.');
          else { ctx.apunta('Cerrar bloquecraft-chat desde el Gestor de tareas.'); L.aviso('Lo has cerrado con el Gestor de tareas. La misión pedía la Terminal: pulsa «Empezar otra vez» para practicarlo.', 'cuidado'); }
        }
        if (d.p.n === 'firefox') { ctx.apunta('Cerrar firefox.'); L.aviso('Firefox no estaba colgado: se ha cerrado sin motivo.', 'cuidado'); }
      });
      L.on('cmd', d => {
        if (d.cmd === 'kill' && !d.ok) ctx.falla(d.linea + ': ese PID no existe.');
        if (d.cmd === 'killall') L.aviso('killall también funciona, pero la misión pedía kill con el número (PID).', 'cuidado');
      });
    },
  });
})();
