/* ============================================================
   Generadores de la Unidad 5 de Operaciones (sistemas operativos).

   Archivo aparte, cargado DESPUÉS de js/generadores.js, igual que
   js/generadores-servicios.js. Solo añade entradas al objeto global
   GENERADORES.

   tipo-software      ¿sistema operativo, aplicación o controlador? (sesión 1)
   libre-propietario  ¿libre o propietario? (sesión 1)
   ram-maquina-virtual  la RAM de una máquina virtual: GB a MB (×1024),
                    MB a GB y la regla de «como mucho la mitad» (sesión 2)

   Los enunciados son frases en castellano: llevan "traducible: true".
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;

  function elige(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  /* ---------- ¿Sistema operativo, aplicación o controlador? ---------- */

  const TIPO = {
    so: { nombre: 'sistema operativo', r: ['sistema operativo', 'so', 'el sistema operativo', 'un sistema operativo', 's.o.'] },
    app: { nombre: 'aplicación', r: ['aplicacion', 'una aplicacion', 'app', 'programa', 'aplicaciones'] },
    ctrl: { nombre: 'controlador', r: ['controlador', 'un controlador', 'driver', 'drivers', 'controladores'] }
  };

  const CASOS_TIPO = [
    { t: 'so', s: 'Windows 11', p: 'Windows es el que manda en el ordenador: es un sistema operativo.' },
    { t: 'so', s: 'Ubuntu', p: 'Ubuntu es un Linux: un sistema operativo.' },
    { t: 'so', s: 'Android', p: 'Android es el sistema operativo de la mayoría de móviles.' },
    { t: 'so', s: 'iOS', p: 'iOS es el sistema operativo del iPhone.' },
    { t: 'so', s: 'macOS', p: 'macOS es el sistema operativo de los ordenadores de Apple.' },
    { t: 'so', s: 'Linux Mint', p: 'Linux Mint es un Linux: un sistema operativo.' },
    { t: 'app', s: 'Google Chrome', p: 'Chrome sirve para navegar: es una aplicación.' },
    { t: 'app', s: 'Word', p: 'Word sirve para escribir documentos: es una aplicación.' },
    { t: 'app', s: 'WhatsApp', p: 'WhatsApp sirve para enviar mensajes: es una aplicación.' },
    { t: 'app', s: 'VLC, para ver vídeos', p: 'VLC sirve para ver vídeos: es una aplicación.' },
    { t: 'app', s: 'Paint', p: 'Paint sirve para dibujar: es una aplicación, aunque venga con Windows.' },
    { t: 'app', s: 'Un juego como Minecraft', p: 'Un juego es una aplicación: lo usas para hacer algo (jugar).' },
    { t: 'ctrl', s: 'El programa que le explica a Windows cómo se usa tu impresora', p: 'Le explica al sistema operativo cómo se usa un aparato: es un controlador.' },
    { t: 'ctrl', s: 'El programa que hace funcionar la tarjeta gráfica', p: 'Hace funcionar un aparato del ordenador: es un controlador.' },
    { t: 'ctrl', s: 'El programa que hace que el ordenador reconozca una webcam nueva', p: 'Sin él la webcam no funciona: es un controlador.' },
    { t: 'ctrl', s: 'El programa que hace funcionar la tarjeta wifi', p: 'Hace funcionar un aparato (la tarjeta wifi): es un controlador.' }
  ];

  GENERADORES['tipo-software'] = () => {
    const d = elige(CASOS_TIPO);
    const tipo = TIPO[d.t];
    return {
      enunciado: `${d.s} (sistema operativo / aplicación / controlador)`,
      respuesta: tipo.nombre,
      respuestas: tipo.r,
      formato: 'texto',
      traducible: true,
      pista: d.p
    };
  };

  /* ---------- ¿Libre o propietario? ---------- */

  const LIBRE = { nombre: 'libre', r: ['libre', 'software libre', 'codigo abierto', 'open source'] };
  const PROP = { nombre: 'propietario', r: ['propietario', 'software propietario', 'privativo', 'cerrado'] };

  const CASOS_LIBRE = [
    { l: true, s: 'Ubuntu', p: 'Ubuntu es un Linux: puedes usarlo, ver su código, cambiarlo y compartirlo.' },
    { l: true, s: 'LibreOffice', p: 'LibreOffice es libre (lo dice hasta su nombre) y gratis.' },
    { l: true, s: 'Firefox', p: 'Firefox es libre: su código está publicado y cualquiera puede verlo.' },
    { l: true, s: 'VLC', p: 'VLC es libre y gratis.' },
    { l: true, s: 'GIMP, para retocar fotos', p: 'GIMP es libre: la alternativa libre a Photoshop.' },
    { l: true, s: 'Audacity, para editar audio', p: 'Audacity es libre y gratis.' },
    { l: true, s: 'Linux Mint', p: 'Linux Mint es un Linux: software libre.' },
    { l: true, s: '7-Zip, para comprimir', p: '7-Zip es libre y gratis.' },
    { l: false, s: 'Windows 11', p: 'Windows es de Microsoft y no enseña su código: propietario.' },
    { l: false, s: 'Word', p: 'Word es de Microsoft, de pago y sin el código a la vista: propietario.' },
    { l: false, s: 'Photoshop', p: 'Photoshop es de Adobe, de pago: propietario.' },
    { l: false, s: 'macOS', p: 'macOS es de Apple y no enseña su código: propietario.' },
    { l: false, s: 'Google Chrome', p: 'Chrome es gratis, pero no puedes ver ni cambiar todo su código: propietario. Gratis no quiere decir libre.' },
    { l: false, s: 'WhatsApp', p: 'WhatsApp es gratis, pero propietario: no te dan la receta. Gratis no quiere decir libre.' },
    { l: false, s: 'iOS', p: 'iOS es de Apple y no enseña su código: propietario.' },
    { l: false, s: 'El Bloc de notas de Windows', p: 'Viene gratis con Windows, pero es de Microsoft: propietario.' }
  ];

  GENERADORES['libre-propietario'] = () => {
    const d = elige(CASOS_LIBRE);
    const tipo = d.l ? LIBRE : PROP;
    return {
      enunciado: `${d.s} (libre / propietario)`,
      respuesta: tipo.nombre,
      respuestas: tipo.r,
      formato: 'texto',
      traducible: true,
      pista: d.p
    };
  };
  /* ---------- La RAM de la máquina virtual ---------- */

  GENERADORES['ram-maquina-virtual'] = () => {
    const tipo = elige(['gb-mb', 'mb-gb', 'mitad']);
    if (tipo === 'gb-mb') {
      const n = elige([1, 2, 3, 4, 6]);
      return {
        enunciado: `Quieres darle ${n} GB de RAM a la máquina virtual. VirtualBox la pide en MB. ¿Cuántos MB escribes?`,
        respuesta: String(n * 1024),
        formato: 'numero',
        traducible: true,
        pista: `De GB a MB se multiplica por 1024: ${n} × 1024 = ${n * 1024} MB.`
      };
    }
    if (tipo === 'mb-gb') {
      const n = elige([1, 2, 3, 4, 8]);
      return {
        enunciado: `VirtualBox te propone ${n * 1024} MB de RAM. ¿Cuántos GB son?`,
        respuesta: String(n),
        formato: 'numero',
        traducible: true,
        pista: `De MB a GB se divide entre 1024: ${n * 1024} ÷ 1024 = ${n} GB.`
      };
    }
    const x = elige([4, 8, 16, 32]);
    return {
      enunciado: `Tu ordenador tiene ${x} GB de RAM. ¿Cuántos GB le das, como mucho, a la máquina virtual?`,
      respuesta: String(x / 2),
      formato: 'numero',
      traducible: true,
      pista: `Como mucho, la mitad: Windows necesita la otra mitad. ${x} ÷ 2 = ${x / 2} GB.`
    };
  };
})();
