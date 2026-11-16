/* ============================================================
   Generadores de la Unidad 6 de Operaciones (Windows), 15/11/2026.

   Archivo aparte, cargado DESPUÉS de js/generadores.js, igual que
   js/generadores-sistemas.js. Solo añade entradas a GENERADORES.

   atajo-windows     ¿qué atajo uso? (sesión 1)
   papelera-acceso   ¿Papelera, borrar para siempre, acceso directo o copia? (sesión 2)
   sistema-archivos  ¿FAT32, exFAT o NTFS? (sesión 3)
   tipo-cuenta       ¿estándar o administrador? (sesión 4)
   permiso-ntfs      ¿qué permiso NTFS le doy? (sesión 5)

   Los enunciados son frases en castellano: llevan "traducible: true".
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;
  const elige = l => l[Math.floor(Math.random() * l.length)];
  // acepta «Windows + E», «win+e», «tecla windows + e», «Ctrl+Shift+Esc»…
  const variantes = combo => {
    const base = combo.toLowerCase();
    const sin = base.replace(/\s+/g, '');
    const out = [base, sin, base.replace(/windows/g, 'win'), sin.replace(/windows/g, 'win'), base.replace(/windows/g, 'tecla windows'), base.replace(/shift/g, 'mayus'), sin.replace(/shift/g, 'mayus'), base.replace(/supr/g, 'suprimir')];
    return Array.from(new Set(out));
  };

  const ATAJOS = [
    { s: 'Abrir el Explorador de archivos', a: 'Windows + E' },
    { s: 'Ver el escritorio (esconder todas las ventanas de golpe)', a: 'Windows + D' },
    { s: 'Cambiar de una ventana abierta a otra', a: 'Alt + Tab' },
    { s: 'Poner la ventana que estás usando en la mitad izquierda de la pantalla', a: 'Windows + ←' },
    { s: 'Poner la ventana que estás usando en la mitad derecha de la pantalla', a: 'Windows + →' },
    { s: 'Cerrar la ventana que estás usando', a: 'Alt + F4' },
    { s: 'Bloquear el ordenador cuando te levantas de la silla', a: 'Windows + L' },
    { s: 'Abrir la Configuración de Windows', a: 'Windows + I' },
    { s: 'Abrir el Administrador de tareas directamente', a: 'Ctrl + Shift + Esc' },
    { s: 'Cambiar el nombre del archivo que tienes elegido', a: 'F2' },
    { s: 'Deshacer lo último que has hecho en el Explorador (por ejemplo, un borrado)', a: 'Ctrl + Z' },
    { s: 'Abrir el menú Inicio sin el ratón', a: 'Windows' },
  ];
  GENERADORES['atajo-windows'] = () => {
    const d = elige(ATAJOS);
    return { enunciado: d.s, respuesta: d.a, respuestas: variantes(d.a).concat(d.a === 'Windows' ? ['win', 'tecla windows', 'la tecla windows'] : []), formato: 'texto', traducible: true, pista: `Es ${d.a}. Repasa la tabla de los atajos.` };
  };

  const PAPELERA = [
    { s: 'Has pulsado Supr sobre un archivo de tu Escritorio. ¿Dónde está ahora?', r: ['en la papelera', 'papelera', 'papelera de reciclaje', 'en la papelera de reciclaje'], a: 'en la Papelera', p: 'Supr lo manda a la Papelera de reciclaje: se puede restaurar.' },
    { s: 'Has borrado un archivo de un USB. ¿Lo puedes sacar de la Papelera? (sí / no)', r: ['no'], a: 'no', p: 'Lo que se borra de un USB no pasa por la Papelera: se borra para siempre.' },
    { s: 'Has pulsado Shift + Supr. ¿Puedes recuperar el archivo de la Papelera? (sí / no)', r: ['no'], a: 'no', p: 'Shift + Supr borra para siempre, sin pasar por la Papelera.' },
    { s: 'Quieres abrir una carpeta desde el Escritorio sin moverla ni copiarla. ¿Qué creas? (acceso directo / copia)', r: ['acceso directo', 'un acceso directo'], a: 'acceso directo', p: 'Un acceso directo solo apunta al original y lleva una flecha.' },
    { s: 'Borras un acceso directo del Escritorio. ¿Se borra la carpeta original? (sí / no)', r: ['no'], a: 'no', p: 'El acceso directo solo es un «atajo»: el original sigue en su sitio.' },
    { s: 'Has vaciado la Papelera. ¿Puedes restaurar lo que había? (sí / no)', r: ['no'], a: 'no', p: 'Vaciar la Papelera borra para siempre lo que había dentro.' },
    { s: '¿Qué icono lleva un acceso directo en la esquina de abajo? (una flecha / un candado)', r: ['una flecha', 'flecha'], a: 'una flecha', p: 'La flechita azul es lo que distingue un acceso directo de una copia.' },
  ];
  GENERADORES['papelera-acceso'] = () => {
    const d = elige(PAPELERA);
    return { enunciado: d.s, respuesta: d.a, respuestas: d.r.concat(['si'].indexOf(d.a) !== -1 ? ['sí'] : []), formato: 'texto', traducible: true, pista: d.p };
  };

  const FS = [
    { s: 'Un USB de 32 GB que tiene que funcionar en la tele de casa y en un Mac, con un vídeo de 6 GB', a: 'exFAT', p: 'Más de 4 GB por archivo y en muchos aparatos: exFAT.' },
    { s: 'Un USB pequeño para la radio del coche, con canciones de 5 MB', a: 'FAT32', p: 'Archivos pequeños y aparatos viejos: FAT32 lo entiende todo.' },
    { s: 'El disco C: donde está instalado Windows', a: 'NTFS', p: 'Windows se instala en NTFS: tiene permisos y aguanta archivos enormes.' },
    { s: 'Un disco duro externo de 2 TB que solo usas con ordenadores Windows y necesitas permisos', a: 'NTFS', p: 'Solo Windows y con permisos: NTFS.' },
    { s: 'Un USB para pasar una película de 8 GB de un ordenador Windows a un Mac', a: 'exFAT', p: 'FAT32 no admite archivos de más de 4 GB y un Mac solo lee NTFS: exFAT.' },
    { s: 'Una tarjeta de memoria de 16 GB para una cámara de fotos antigua', a: 'FAT32', p: 'Los aparatos antiguos suelen entender solo FAT32.' },
  ];
  GENERADORES['sistema-archivos'] = () => {
    const d = elige(FS);
    return { enunciado: `${d.s} (FAT32 / exFAT / NTFS)`, respuesta: d.a, respuestas: [d.a.toLowerCase()], formato: 'texto', traducible: true, pista: d.p };
  };

  const CUENTAS = [
    { s: 'Tu hermano pequeño, que solo usa el ordenador para jugar y hacer deberes', a: 'estándar' },
    { s: 'Tú, que instalas los programas y cambias la configuración del ordenador de casa', a: 'administrador' },
    { s: 'Un invitado que viene a casa y quiere mirar el correo', a: 'estándar' },
    { s: 'Los alumnos en los ordenadores del aula', a: 'estándar' },
    { s: 'El técnico que mantiene los ordenadores del instituto', a: 'administrador' },
    { s: 'Tu abuela, que solo ve fotos y hace videollamadas', a: 'estándar' },
  ];
  GENERADORES['tipo-cuenta'] = () => {
    const d = elige(CUENTAS);
    return { enunciado: `${d.s} (estándar / administrador)`, respuesta: d.a, respuestas: d.a === 'estándar' ? ['estandar', 'usuario estandar', 'estándar', 'usuario estándar'] : ['administrador', 'admin'], formato: 'texto', traducible: true, pista: d.a === 'estándar' ? 'Si no tiene que instalar programas ni cambiar el equipo, estándar: es más seguro.' : 'Instala programas y cambia la configuración: necesita ser administrador.' };
  };

  const PERMISOS = [
    { s: 'Los alumnos tienen que poder abrir las notas, pero no cambiarlas', a: 'lectura', r: ['lectura', 'leer', 'lectura y ejecucion'] },
    { s: 'El profesor tiene que poder abrir, cambiar y borrar los archivos de su carpeta', a: 'modificar', r: ['modificar'] },
    { s: 'El administrador tiene que poder hacerlo todo, también cambiar los permisos', a: 'control total', r: ['control total'] },
    { s: 'Una carpeta de entregas: los alumnos dejan archivos, pero no pueden ver lo que han dejado los demás', a: 'escritura', r: ['escritura', 'escribir'] },
    { s: 'Los alumnos tienen que ver qué archivos hay en una carpeta de apuntes y abrirlos', a: 'lectura', r: ['lectura', 'leer', 'lectura y ejecucion'] },
  ];
  GENERADORES['permiso-ntfs'] = () => {
    const d = elige(PERMISOS);
    return { enunciado: `${d.s} (lectura / escritura / modificar / control total)`, respuesta: d.a, respuestas: d.r, formato: 'texto', traducible: true, pista: { lectura: 'Solo ver y abrir: Lectura.', modificar: 'Abrir, cambiar y borrar, pero no tocar los permisos: Modificar.', 'control total': 'Todo, también los permisos: Control total.', escritura: 'Dejar archivos sin poder leer: Escritura.' }[d.a] };
  };
})();
