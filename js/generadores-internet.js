/* ============================================================
   Generadores de la Unidad 4 de Operaciones (el navegador,
   buscadores y correo).

   Archivo aparte, cargado DESPUÉS de js/generadores.js, igual que
   js/generadores-riesgos.js. Solo añade entradas al objeto global
   GENERADORES.

   atajo-navegador     qué atajo de teclado hace una acción en Chrome
   operador-busqueda   qué operador de búsqueda resuelve una situación
   para-cc-cco         en qué campo va una dirección de correo
   correo-sospechoso   ¿este correo es sospechoso? (sí / no)

   Los enunciados son frases en castellano, así que llevan
   "traducible: true": js/actividades.js no les pone translate="no"
   y el traductor del navegador los puede traducir. Las respuestas
   (atajos, operadores, Para/CC/CCO, sí/no) valen en cualquier idioma.
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;

  function elige(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  /* ---------- Atajos del navegador ---------- */

  /* Nombres que puede escribir el alumno para cada tecla. Se comparan
     ya en minúsculas y sin acentos (lo hace respuestaCorrecta). */
  const TECLA = {
    ctrl: ['ctrl', 'control', 'ctl'],
    shift: ['shift', 'mayus', 'mayusculas', 'may'],
    '+': ['+', 'mas'],
    '-': ['-', 'menos'],
    supr: ['supr', 'suprimir', 'delete', 'del'],
    tab: ['tab', 'tabulador']
  };
  const UNION = ['+', ' + ', ' '];

  /* ['ctrl', 'shift', 't'] → todas las formas de escribirlo:
     "ctrl+shift+t", "control + mayus + t", "ctrl shift t"… */
  function formasDeEscribir(teclas) {
    let formas = [''];
    teclas.forEach((t, i) => {
      const nombres = TECLA[t] || [t];
      const nuevas = [];
      formas.forEach(f => {
        nombres.forEach(n => {
          if (i === 0) nuevas.push(n);
          else UNION.forEach(u => nuevas.push(f + u + n));
        });
      });
      formas = nuevas;
    });
    return formas;
  }

  function bonito(teclas) {
    return teclas.map(t => {
      if (t === 'ctrl') return 'Ctrl';
      if (t === 'shift') return 'Shift';
      if (t === 'supr') return 'Supr';
      if (t === 'tab') return 'Tab';
      return t.length === 1 ? t.toUpperCase() : t;
    }).join(' + ');
  }

  const ATAJOS = [
    { a: 'Abrir una pestaña nueva', t: [['ctrl', 't']], p: 'T de «tab», pestaña en inglés.' },
    { a: 'Cerrar la pestaña en la que estás', t: [['ctrl', 'w']], p: 'Cierra solo la pestaña, no todo el navegador.' },
    { a: 'Recuperar la pestaña que acabas de cerrar sin querer', t: [['ctrl', 'shift', 't']], p: 'Es el de abrir pestaña nueva con Shift: «abre la de antes».' },
    { a: 'Pasar a la pestaña siguiente', t: [['ctrl', 'tab']], p: 'Cada vez que lo pulsas saltas a la pestaña de la derecha.' },
    { a: 'Guardar la página en favoritos (marcadores)', t: [['ctrl', 'd']], p: 'Hace lo mismo que la estrella de la barra de direcciones.' },
    { a: 'Enseñar u ocultar la barra de favoritos', t: [['ctrl', 'shift', 'b']], p: 'B de «bookmarks», marcadores en inglés.' },
    { a: 'Abrir el historial', t: [['ctrl', 'h']], p: 'H de «history», historial en inglés.' },
    { a: 'Abrir la lista de descargas', t: [['ctrl', 'j']], p: 'Desde ahí puedes abrir la carpeta donde se ha guardado cada archivo.' },
    { a: 'Ir a la barra de direcciones para escribir una URL', t: [['ctrl', 'l']], p: 'Selecciona toda la dirección: escribes encima y se borra la anterior.' },
    { a: 'Recargar la página', t: [['f5'], ['ctrl', 'r']], p: 'También vale el botón de la flecha en círculo.' },
    { a: 'Buscar una palabra dentro de la página', t: [['ctrl', 'f']], p: 'F de «find», encontrar en inglés. Sale una cajita arriba a la derecha.' },
    { a: 'Hacer la página más grande (zoom)', t: [['ctrl', '+']], p: 'Solo cambia esa web; las demás siguen igual.' },
    { a: 'Hacer la página más pequeña (zoom)', t: [['ctrl', '-']], p: 'Solo cambia esa web; las demás siguen igual.' },
    { a: 'Volver a dejar la página a su tamaño normal (100 %)', t: [['ctrl', '0']], p: 'Es un cero. Deshace el zoom de esa web.' },
    { a: 'Abrir una ventana de incógnito', t: [['ctrl', 'shift', 'n']], p: 'N de «nueva» ventana, pero de incógnito.' },
    { a: 'Borrar los datos de navegación (historial, cookies…)', t: [['ctrl', 'shift', 'supr']], p: 'Abre el cuadro para elegir qué borras y de cuándo.' }
  ];

  /* La sesión 1 no ha visto aún el incógnito ni el borrado de datos:
     ese generador usa solo los atajos de la sesión 1. */
  const SOLO_SESION_2 = ['Abrir una ventana de incógnito', 'Borrar los datos de navegación (historial, cookies…)'];

  function genAtajo(lista) {
    const d = elige(lista);
    let respuestas = [];
    d.t.forEach(teclas => { respuestas = respuestas.concat(formasDeEscribir(teclas)); });
    return {
      enunciado: `${d.a} →`,
      respuesta: d.t.map(bonito).join(' o '),
      respuestas,
      formato: 'texto',
      traducible: true,
      pista: d.p
    };
  }

  GENERADORES['atajo-navegador'] = () =>
    genAtajo(ATAJOS.filter(x => SOLO_SESION_2.indexOf(x.a) === -1));
  GENERADORES['atajo-navegador-todos'] = () => genAtajo(ATAJOS);

  /* ---------- Operadores de búsqueda ---------- */

  const OPERADOR = {
    comillas: { nombre: 'comillas " "', respuestas: ['"', '""', '" "', '"..."', 'comillas', 'las comillas', 'entre comillas', 'comillas " "', '«»', 'quotes'] },
    menos: { nombre: 'el menos -', respuestas: ['-', 'menos', 'el menos', 'signo menos', 'guion', 'el guion', 'el menos -', 'minus'] },
    site: { nombre: 'site:', respuestas: ['site:', 'site', 'site :'] },
    filetype: { nombre: 'filetype:', respuestas: ['filetype:', 'filetype', 'filetype :'] },
    or: { nombre: 'OR', respuestas: ['or'] }
  };

  const SITUACIONES = [
    { op: 'comillas', s: 'Solo recuerdas una frase exacta de un libro: «la luna sobre el puerto».', e: '"la luna sobre el puerto"' },
    { op: 'comillas', s: 'Quieres webs que digan «formación profesional básica», con esas tres palabras juntas y en ese orden.', e: '"formación profesional básica"' },
    { op: 'comillas', s: 'Tu ordenador da un error que dice exactamente «no se encuentra el controlador de audio».', e: '"no se encuentra el controlador de audio"' },
    { op: 'comillas', s: 'Buscas un equipo que se llama «Club Deportivo Son Ferrer», y no webs que hablen de clubes en general.', e: '"Club Deportivo Son Ferrer"' },
    { op: 'menos', s: 'Buscas información de «jaguar», el animal, pero solo te salen coches.', e: 'jaguar -coche' },
    { op: 'menos', s: 'Quieres recetas de pizza, pero ninguna que lleve piña.', e: 'receta pizza -piña' },
    { op: 'menos', s: 'Buscas «Python», el lenguaje de programación, y te salen fotos de serpientes.', e: 'python -serpiente' },
    { op: 'menos', s: 'Quieres noticias de Mallorca que no hablen de turismo.', e: 'noticias Mallorca -turismo' },
    { op: 'menos', s: 'Buscas fondos de pantalla de montañas, sin que salgan los que dicen «premium» (de pago).', e: 'fondos de pantalla montañas -premium' },
    { op: 'site', s: 'Quieres buscar «horario» solo dentro de la web del instituto, iesramonllull.net.', e: 'horario site:iesramonllull.net' },
    { op: 'site', s: 'Buscas «fibra óptica», pero solo quieres resultados de Wikipedia.', e: 'fibra óptica site:wikipedia.org' },
    { op: 'site', s: 'Solo quieres páginas del Gobierno de España, que acaban en gob.es.', e: 'becas site:gob.es' },
    { op: 'site', s: 'Solo te interesan vídeos de YouTube sobre cómo crimpar un cable.', e: 'crimpar cable site:youtube.com' },
    { op: 'site', s: 'Buscas «calendario escolar» solo en la web del Govern balear, caib.es.', e: 'calendario escolar site:caib.es' },
    { op: 'filetype', s: 'Necesitas un documento PDF con apuntes de redes, no una página web.', e: 'apuntes redes filetype:pdf' },
    { op: 'filetype', s: 'Buscas una presentación de PowerPoint ya hecha sobre el reciclaje.', e: 'reciclaje filetype:pptx' },
    { op: 'filetype', s: 'Quieres una hoja de cálculo de Excel con una plantilla de presupuesto.', e: 'plantilla presupuesto filetype:xlsx' },
    { op: 'filetype', s: 'Buscas el manual de tu router en PDF para imprimirlo.', e: 'manual router filetype:pdf' },
    { op: 'or', s: 'Te vale una receta de tortilla o de croquetas: cualquiera de las dos.', e: 'receta tortilla OR croquetas' },
    { op: 'or', s: 'Buscas ofertas de trabajo en Palma o en Inca; te sirve cualquiera de los dos sitios.', e: 'ofertas trabajo Palma OR Inca' },
    { op: 'or', s: 'Te sirven trucos de Minecraft o de Fortnite, los dos te interesan.', e: 'trucos Minecraft OR Fortnite' }
  ];

  function genOperador() {
    const d = elige(SITUACIONES);
    const op = OPERADOR[d.op];
    return {
      enunciado: `${d.s} ¿Qué operador usas?`,
      respuesta: op.nombre,
      respuestas: op.respuestas,
      formato: 'texto',
      traducible: true,
      pista: `Se escribiría así: ${d.e}`
    };
  }

  GENERADORES['operador-busqueda'] = genOperador;

  /* ---------- Para, CC o CCO ---------- */

  const CAMPO = {
    para: { nombre: 'Para', respuestas: ['para', 'to', 'destinatario'] },
    cc: { nombre: 'CC', respuestas: ['cc', 'con copia'] },
    cco: { nombre: 'CCO', respuestas: ['cco', 'bcc', 'con copia oculta', 'copia oculta'] }
  };

  const CASOS = [
    { c: 'para', s: 'Le mandas los deberes a tu profesora. ¿Dónde va su dirección?', p: 'Ella es quien tiene que leerlo y hacer algo (corregirlo): va en Para.' },
    { c: 'cc', s: 'Mandas el trabajo de grupo a tu profesor y quieres que tu compañero vea que lo has enviado, aunque él no tenga que hacer nada. ¿Dónde va el compañero?', p: 'Tiene que estar enterado, pero no es a quien va dirigido: CC.' },
    { c: 'cco', s: 'Avisas de una excursión a 30 familias y no quieres que cada familia vea las direcciones de las otras. ¿Dónde van las familias?', p: 'Con CCO nadie ve las direcciones de los demás. Así no regalas los correos de 30 personas.' },
    { c: 'cc', s: 'Pides un presupuesto a una tienda y tu jefe quiere estar enterado de la conversación. ¿Dónde va tu jefe?', p: 'Está enterado, pero quien tiene que contestar es la tienda: tu jefe va en CC.' },
    { c: 'para', s: 'Mandas tu currículum a una empresa. ¿Dónde va la dirección de la empresa?', p: 'Es a quien va dirigido el correo: Para.' },
    { c: 'cco', s: 'Envías una invitación de cumpleaños a toda la clase y no quieres que se vean los correos entre ellos. ¿Dónde va la clase?', p: 'Muchos destinatarios que no tienen por qué ver las direcciones de los demás: CCO.' },
    { c: 'cc', s: 'Contestas a un cliente y quieres que tu compañera de trabajo sepa en qué habéis quedado. ¿Dónde va tu compañera?', p: 'Solo tiene que enterarse; el cliente sí ve que ella lo ha recibido: CC.' },
    { c: 'para', s: 'Escribes al servicio técnico para que te arreglen el portátil. ¿Dónde va el servicio técnico?', p: 'Son quienes tienen que hacer algo: Para.' },
    { c: 'cco', s: 'Reenvías un aviso del ayuntamiento a 50 vecinos que no se conocen entre ellos. ¿Dónde van los vecinos?', p: 'Si los pones en Para o CC, cada vecino ve los correos de los otros 49. Con CCO, no.' },
    { c: 'cc', s: 'Tu jefa te pide que la pongas en todos los correos que mandes a un proveedor, y el proveedor puede saberlo. ¿Dónde va tu jefa?', p: 'Que esté enterada y que se vea que lo está: CC.' },
    { c: 'para', s: 'Le preguntas a tu tutora la nota del examen. ¿Dónde va tu tutora?', p: 'Es ella quien tiene que contestarte: Para.' },
    { c: 'cco', s: 'Una empresa manda su boletín de ofertas a 2.000 clientes. ¿Dónde deberían ir los clientes?', p: 'Ningún cliente tiene por qué ver el correo de los otros 1.999: CCO. Ponerlos en Para sería un fallo grave de privacidad.' }
  ];

  function genParaCcCco() {
    const d = elige(CASOS);
    const campo = CAMPO[d.c];
    return {
      enunciado: `${d.s} (Para / CC / CCO)`,
      respuesta: campo.nombre,
      respuestas: campo.respuestas,
      formato: 'texto',
      traducible: true,
      pista: d.p
    };
  }

  GENERADORES['para-cc-cco'] = genParaCcCco;

  /* ---------- ¿Correo sospechoso? ---------- */

  const SI = ['si', 'sí', 's', 'yes', 'sospechoso'];
  const NO = ['no', 'n', 'no es sospechoso', 'fiable'];

  const CORREOS = [
    { sos: true, s: 'De avisos@bancomas-seguridad24.com: «Tu cuenta se bloqueará en 24 horas. Entra en este enlace y escribe tu contraseña».', p: 'Prisa, amenaza y te pide la contraseña. Ningún banco te la pide por correo, y el dominio no es el del banco.' },
    { sos: true, s: '«¡Has ganado un móvil! Solo tienes que pagar 2 € de gastos de envío con tu tarjeta». No has participado en ningún sorteo.', p: 'Premio que no esperabas + piden datos de tu tarjeta. Es el truco más viejo.' },
    { sos: true, s: 'Un desconocido te manda un adjunto que se llama factura.pdf.exe.', p: 'La extensión de verdad es la última: .exe, un programa. Es lo que viste en la Unidad 1: no es un PDF.' },
    { sos: true, s: 'Desde un Gmail personal: «Soy tu jefe, estoy en una reunión. Compra tres tarjetas regalo y mándame los códigos, es urgente».', p: 'Se hace pasar por alguien que conoces, con prisa y pidiendo dinero. Llama a tu jefe antes de hacer nada.' },
    { sos: true, s: '«Tu paquete está retenido. Paga 1,99 € en este enlace para recibirlo». El enlace va a entregas-pago-online.xyz y no esperas ningún paquete.', p: 'Pago pequeño para que no sospeches, con un enlace a un dominio raro. Lo que quieren es tu tarjeta.' },
    { sos: true, s: '«URJENTE: verifike su cuenta de correo o sera eliminada hoy mismo».', p: 'Faltas de ortografía, mayúsculas y prisa: tres señales a la vez.' },
    { sos: true, s: 'Alguien que dice ser «el soporte técnico de Google» te escribe y te pide la contraseña para «revisar tu cuenta».', p: 'Nadie de verdad te pide la contraseña. Nunca. Ni Google, ni tu banco, ni yo.' },
    { sos: true, s: 'Un correo con el logo de tu plataforma de series dice que tu pago ha fallado. Pasas el ratón por el botón y abajo se ve pagos-series-cuenta.top.', p: 'El enlace no lleva a la web de la plataforma: lo has descubierto pasando el ratón sin hacer clic.' },
    { sos: false, s: 'Tu profesor te escribe desde su dirección @iesramonllull.net para recordarte la entrega de mañana. No hay enlaces ni adjuntos.', p: 'Remitente conocido, dominio del centro, no pide datos ni dinero. Es normal.' },
    { sos: false, s: 'Te llega el código de verificación justo después de pedirlo al registrarte en una web.', p: 'Lo has pedido tú hace un momento. Ese correo lo esperabas.' },
    { sos: false, s: 'Classroom te avisa de una tarea nueva. Pasas el ratón por el enlace y abajo se ve classroom.google.com.', p: 'El enlace va a donde dice. Es el aviso normal de Classroom.' },
    { sos: false, s: 'La tienda donde compraste ayer te manda la factura, con el número de pedido que tienes apuntado. No te pide nada.', p: 'Coincide con una compra tuya y no te pide datos ni pagos.' },
    { sos: false, s: 'Un compañero te manda el horario desde su correo del instituto, como le habías pedido en clase.', p: 'Lo esperabas y viene de una dirección del centro.' },
    { sos: false, s: 'Google te avisa de un inicio de sesión nuevo justo después de entrar tú en tu cuenta desde otro ordenador. El aviso no pide la contraseña.', p: 'Has sido tú, y el aviso no te pide nada. Es un aviso de seguridad normal.' }
  ];

  function genCorreoSospechoso() {
    const d = elige(CORREOS);
    return {
      enunciado: `${d.s} ¿Es sospechoso? (sí / no)`,
      respuesta: d.sos ? 'sí' : 'no',
      respuestas: d.sos ? SI : NO,
      formato: 'texto',
      traducible: true,
      pista: d.p
    };
  }

  GENERADORES['correo-sospechoso'] = genCorreoSospechoso;
})();
