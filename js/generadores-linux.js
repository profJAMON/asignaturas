/* ============================================================
   Generadores de la Unidad 7 de Operaciones (Linux), 16/11/2026.

   Archivo aparte, cargado DESPUÉS de js/generadores.js, igual que
   js/generadores-windows.js. Solo añade entradas a GENERADORES.

   atajo-linux      ¿qué atajo uso en Linux Mint? (sesión 1)
   ruta-linux       ¿cuál es la ruta absoluta? (sesión 2)
   orden-linux      ¿qué orden escribo en la terminal? (sesión 3)
   fs-linux         ¿ext4, NTFS, FAT32 o exFAT? (sesión 4)
   sudo-si-no       ¿hace falta sudo? (sesión 5)
   permisos-numero  rwx ↔ número (sesión 6)

   Ojo: la corrección de los generadores no distingue mayúsculas
   (js/generadores.js, _normalizarTexto). Las rutas y órdenes se
   escriben en minúsculas en todos los enunciados.
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;
  const elige = l => l[Math.floor(Math.random() * l.length)];
  const variantes = combo => {
    const base = combo.toLowerCase();
    const sin = base.replace(/\s+/g, '');
    return Array.from(new Set([base, sin, base.replace(/windows/g, 'super'), sin.replace(/windows/g, 'super'), base.replace(/windows/g, 'win'), sin.replace(/windows/g, 'win'), base.replace(/shift/g, 'mayus'), base.replace(/supr/g, 'suprimir')]));
  };

  const ATAJOS = [
    { s: 'Abrir el menú de aplicaciones sin el ratón', a: 'Windows', extra: ['super', 'tecla windows', 'tecla super', 'la tecla windows'] },
    { s: 'Abrir la Terminal', a: 'Ctrl + Alt + T' },
    { s: 'Abrir el Gestor de archivos', a: 'Windows + E' },
    { s: 'Cambiar de una ventana abierta a otra', a: 'Alt + Tab' },
    { s: 'Cerrar la ventana que estás usando', a: 'Alt + F4' },
    { s: 'Ver el escritorio (esconder todas las ventanas de golpe)', a: 'Ctrl + Alt + D' },
    { s: 'Pasar al área de trabajo de la derecha', a: 'Ctrl + Alt + →', extra: ['ctrl + alt + flecha derecha', 'ctrl+alt+flecha derecha'] },
    { s: 'Pasar al área de trabajo de la izquierda', a: 'Ctrl + Alt + ←', extra: ['ctrl + alt + flecha izquierda', 'ctrl+alt+flecha izquierda'] },
    { s: 'Bloquear la pantalla cuando te levantas de la silla', a: 'Ctrl + Alt + L' },
    { s: 'Abrir el Gestor de tareas directamente', a: 'Ctrl + Shift + Esc' },
    { s: 'Enseñar los archivos ocultos en el Gestor de archivos', a: 'Ctrl + H' },
    { s: 'Cambiar el nombre del archivo que tienes elegido en el Gestor de archivos', a: 'F2' },
  ];
  GENERADORES['atajo-linux'] = () => {
    const d = elige(ATAJOS);
    return { enunciado: d.s, respuesta: d.a, respuestas: variantes(d.a).concat(d.extra || []), formato: 'texto', traducible: true, pista: `Es ${d.a}. Repasa la tabla de los atajos.` };
  };

  const USUARIOS = ['alumno', 'ana', 'dani', 'marta'];
  const RUTAS = [
    u => ({ s: `La carpeta personal del usuario ${u}`, a: `/home/${u}` }),
    u => ({ s: `La carpeta Descargas del usuario ${u}`, a: `/home/${u}/Descargas` }),
    u => ({ s: `La carpeta Documentos del usuario ${u}`, a: `/home/${u}/Documentos` }),
    u => ({ s: `El Escritorio del usuario ${u}`, a: `/home/${u}/Escritorio` }),
    u => ({ s: `Un USB llamado KINGSTON que ha conectado el usuario ${u}`, a: `/media/${u}/KINGSTON` }),
    u => ({ s: `Un USB llamado CLASE que ha conectado el usuario ${u}`, a: `/media/${u}/CLASE` }),
    () => ({ s: 'La carpeta raíz, de la que cuelga todo', a: '/' }),
    () => ({ s: 'La carpeta donde están las carpetas personales de todos los usuarios', a: '/home' }),
    () => ({ s: 'La carpeta personal del administrador (root)', a: '/root' }),
    () => ({ s: 'La carpeta de la configuración del sistema', a: '/etc' }),
    u => ({ s: `El usuario ${u} está en su carpeta personal y escribe cd Documentos. ¿En qué carpeta está ahora?`, a: `/home/${u}/Documentos` }),
    u => ({ s: `El usuario ${u} está en /home/${u}/Documentos y escribe cd .. ¿En qué carpeta está ahora?`, a: `/home/${u}` }),
    u => ({ s: `El usuario ${u} escribe ~/Imágenes. ¿Qué ruta absoluta es?`, a: `/home/${u}/Imágenes` }),
  ];
  GENERADORES['ruta-linux'] = () => {
    const d = elige(RUTAS)(elige(USUARIOS));
    const r = [d.a];
    if (d.a !== '/') r.push(d.a + '/');
    return { enunciado: d.s + ' (escribe la ruta absoluta)', respuesta: d.a, respuestas: r, formato: 'texto', traducible: true, pista: `Es ${d.a}. En Linux todo empieza en / y las carpetas se separan con /.` };
  };

  const CARPETAS = ['fotos', 'mods', 'trabajos', 'mapas', 'apuntes'];
  const ARCHIVOS = ['notas.txt', 'lista.txt', 'mapa.png', 'skin.png', 'tarea.odt'];
  const ORDENES = [
    () => ({ s: 'Ver en qué carpeta estás', a: ['pwd'] }),
    () => ({ s: 'Ver qué hay en la carpeta en la que estás', a: ['ls'] }),
    () => ({ s: 'Ver qué hay en la carpeta, también los archivos ocultos', a: ['ls -a', 'ls -la', 'ls -al'] }),
    () => ({ s: 'Ver qué hay en la carpeta con todos los detalles (permisos, dueño, tamaño)', a: ['ls -l', 'ls -la', 'ls -al'] }),
    () => ({ s: 'Volver a tu carpeta personal estés donde estés', a: ['cd', 'cd ~', 'cd ~/'] }),
    () => ({ s: 'Subir a la carpeta de arriba', a: ['cd ..', 'cd ../'] }),
    () => { const c = elige(CARPETAS); return { s: `Entrar en la carpeta ${c}`, a: [`cd ${c}`, `cd ${c}/`] }; },
    () => { const c = elige(CARPETAS); return { s: `Crear la carpeta ${c}`, a: [`mkdir ${c}`] }; },
    () => { const f = elige(ARCHIVOS); return { s: `Crear el archivo vacío ${f}`, a: [`touch ${f}`] }; },
    () => { const f = elige(ARCHIVOS), c = elige(CARPETAS); return { s: `Copiar ${f} a la carpeta ${c}`, a: [`cp ${f} ${c}`, `cp ${f} ${c}/`] }; },
    () => { const f = elige(ARCHIVOS), c = elige(CARPETAS); return { s: `Mover ${f} a la carpeta ${c}`, a: [`mv ${f} ${c}`, `mv ${f} ${c}/`] }; },
    () => ({ s: 'Cambiar el nombre de notas.txt a viejo.txt', a: ['mv notas.txt viejo.txt'] }),
    () => { const f = elige(ARCHIVOS); return { s: `Borrar el archivo ${f}`, a: [`rm ${f}`] }; },
    () => { const c = elige(CARPETAS); return { s: `Borrar la carpeta ${c}, que tiene archivos dentro`, a: [`rm -r ${c}`, `rm -rf ${c}`, `rm -r ${c}/`] }; },
    () => { const c = elige(CARPETAS); return { s: `Copiar la carpeta ${c} entera con el nombre ${c}-copia`, a: [`cp -r ${c} ${c}-copia`] }; },
    () => ({ s: 'Ver lo que hay escrito dentro de notas.txt', a: ['cat notas.txt'] }),
    () => ({ s: 'Borrar todo lo que hay escrito en la pantalla de la terminal', a: ['clear'] }),
  ];
  GENERADORES['orden-linux'] = () => {
    const d = elige(ORDENES)();
    return { enunciado: d.s, respuesta: d.a[0], respuestas: d.a, formato: 'texto', traducible: true, pista: `Por ejemplo: ${d.a[0]}. Mira la tabla de órdenes de la sesión.` };
  };

  const FS = [
    { s: 'El disco donde está instalado Linux Mint', a: 'ext4', p: 'Linux se instala en ext4.' },
    { s: 'Un USB que vas a usar en el Linux de casa, en el Windows del instituto y en la tele, con vídeos de 6 GB', a: 'exFAT', p: 'Lo leen todos y admite archivos de más de 4 GB: exFAT.' },
    { s: 'Un USB pequeño para la radio del coche, con canciones de 5 MB', a: 'FAT32', p: 'Aparatos viejos y archivos pequeños: FAT32.' },
    { s: 'Un disco externo que solo vas a usar con ordenadores Linux', a: 'ext4', p: 'Solo Linux: ext4, su sistema de archivos.' },
    { s: 'El disco C: de un ordenador con Windows', a: 'NTFS', p: 'Windows se instala en NTFS.' },
    { s: 'Un USB para pasar una película de 8 GB de un Linux a un Mac y a una tele', a: 'exFAT', p: 'FAT32 no admite más de 4 GB y la tele no lee ext4 ni NTFS: exFAT.' },
  ];
  GENERADORES['fs-linux'] = () => {
    const d = elige(FS);
    return { enunciado: `${d.s} (ext4 / NTFS / FAT32 / exFAT)`, respuesta: d.a, respuestas: [d.a.toLowerCase()], formato: 'texto', traducible: true, pista: d.p };
  };

  const SUDO = [
    { s: 'Instalar el programa vlc con apt', a: 'sí', p: 'Instalar programas cambia el sistema: sudo apt install vlc.' },
    { s: 'Actualizar la lista de programas (apt update)', a: 'sí', p: 'apt update escribe en carpetas del sistema: hace falta sudo.' },
    { s: 'Crear el usuario dani', a: 'sí', p: 'Solo root puede crear usuarios: sudo adduser dani.' },
    { s: 'Desinstalar el programa gimp', a: 'sí', p: 'Quitar programas cambia el sistema: sudo apt remove gimp.' },
    { s: 'Ver qué hay en tu carpeta personal (ls)', a: 'no', p: 'Tu carpeta es tuya: no hace falta sudo.' },
    { s: 'Crear la carpeta fotos dentro de tu carpeta personal', a: 'no', p: 'Dentro de tu carpeta personal puedes crear lo que quieras sin sudo.' },
    { s: 'Cambiar los permisos de un archivo tuyo con chmod', a: 'no', p: 'Los permisos de lo tuyo los cambias tú, sin sudo.' },
    { s: 'Borrar un archivo de tu carpeta Descargas', a: 'no', p: 'Es tuyo: rm sin sudo.' },
    { s: 'Cambiar un archivo de configuración de /etc', a: 'sí', p: '/etc es del sistema (de root): hace falta sudo.' },
    { s: 'Ver en qué carpeta estás (pwd)', a: 'no', p: 'Mirar no cambia nada: sin sudo.' },
  ];
  GENERADORES['sudo-si-no'] = () => {
    const d = elige(SUDO);
    return { enunciado: `${d.s}. ¿Hace falta sudo? (sí / no)`, respuesta: d.a, respuestas: d.a === 'sí' ? ['sí', 'si'] : ['no'], formato: 'texto', traducible: true, pista: d.p };
  };

  const TRIO = { 7: 'rwx', 6: 'rw-', 5: 'r-x', 4: 'r--', 0: '---' };
  const NUMS = ['755', '644', '600', '700', '640', '750', '777', '664', '400', '444'];
  GENERADORES['permisos-numero'] = () => {
    const n = elige(NUMS);
    const letras = n.split('').map(d => TRIO[d]).join('');
    const suma = n.split('').map(d => TRIO[d] + ' = ' + d).join(', ');
    if (Math.random() < 0.5) return { enunciado: `¿Qué número son estos permisos? ${letras}`, respuesta: n, respuestas: [n], formato: 'texto', pista: `Es ${n}: r = 4, w = 2, x = 1, y se suman de tres en tres (${suma}).` };
    return { enunciado: `Escribe con letras los permisos ${n}`, respuesta: letras, respuestas: [letras], formato: 'texto', pista: `Es ${letras}: ${suma}.` };
  };
})();
