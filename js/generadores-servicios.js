/* ============================================================
   Generadores de la Unidad 3 de Operaciones (servicios de Internet).

   Archivo aparte, cargado DESPUÉS de js/generadores.js, igual que
   js/generadores-internet.js. Solo añade entradas al objeto global
   GENERADORES.

   foro-blog-wiki   ¿foro, blog o wiki? (sesión 1)
   servicio-web     ¿qué servicio es? foro, blog, wiki, red social,
                    RSS, nube, gestor de contenidos o P2P (repaso)
   red-rss-nube     ¿red social, RSS o nube? (sesión 2)
   cs-o-p2p         ¿cliente-servidor o P2P? (sesión 3)

   Los enunciados son frases en castellano: llevan "traducible: true".
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;

  function elige(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
  }

  const SERVICIO = {
    foro: { nombre: 'foro', r: ['foro', 'un foro', 'forum'] },
    blog: { nombre: 'blog', r: ['blog', 'un blog'] },
    wiki: { nombre: 'wiki', r: ['wiki', 'una wiki', 'wikipedia'] },
    red: { nombre: 'red social', r: ['red social', 'una red social', 'redes sociales', 'red'] },
    rss: { nombre: 'RSS', r: ['rss', 'sindicacion', 'sindicacion de contenidos', 'suscripcion', 'podcast', 'feed'] },
    nube: { nombre: 'nube', r: ['nube', 'la nube', 'en la nube', 'computacion en la nube', 'cloud'] },
    cms: { nombre: 'gestor de contenidos', r: ['gestor de contenidos', 'cms', 'un cms', 'gestor', 'wordpress', 'google sites'] },
    p2p: { nombre: 'P2P', r: ['p2p', 'peer to peer', 'de igual a igual', 'red p2p'] }
  };

  const CASOS = [
    { s: 'foro', t: 'Alguien pregunta por qué su router parpadea en rojo y otros usuarios le van contestando debajo, en un mismo tema.', p: 'Temas (hilos) con respuestas debajo, que se quedan guardadas: es un foro.' },
    { s: 'foro', t: 'En la web de un videojuego hay una sección de «Ayuda» con preguntas de jugadores y las respuestas de otros jugadores, ordenadas por temas.', p: 'Organizado por temas y con respuestas debajo: foro.' },
    { s: 'foro', t: 'Buscas un problema de tu móvil y encuentras una conversación de hace dos años con una respuesta marcada como «solución».', p: 'Las respuestas se guardan y se pueden buscar años después: foro.' },
    { s: 'blog', t: 'Una cocinera publica cada semana una receta nueva con fecha; la más reciente sale arriba y los lectores comentan debajo.', p: 'Entradas con fecha, la más nueva arriba y comentarios: blog.' },
    { s: 'blog', t: 'Una web de tecnología publica artículos firmados, con fecha y etiquetas como «móviles» o «videojuegos».', p: 'Artículos fechados, firmados y con etiquetas: blog.' },
    { s: 'blog', t: 'Un viajero cuenta día a día su viaje por Japón: cada día, una entrada nueva encima de la anterior.', p: 'Lo nuevo siempre arriba, ordenado por fecha: blog.' },
    { s: 'wiki', t: 'Ves un error en un artículo sobre tu pueblo, pulsas «Editar» y lo corriges tú directamente, sin pedir permiso.', p: 'Cualquiera edita lo ya publicado: wiki.' },
    { s: 'wiki', t: 'Una página guarda quién cambió cada párrafo y cuándo, y se puede volver a cualquier versión anterior.', p: 'El historial de versiones es lo típico de una wiki.' },
    { s: 'wiki', t: 'Toda la clase escribe juntos un mismo documento de apuntes: cada uno añade y corrige lo de los demás.', p: 'Muchas personas editando el mismo contenido: funciona como una wiki.' }
  ];

  const CASOS_REPASO = CASOS.concat([
    { s: 'red', t: 'Publicas una foto, tus seguidores le dan a «me gusta» y un algoritmo decide a quién más se la enseña.', p: 'Perfil, seguidores y algoritmo: red social.' },
    { s: 'red', t: 'Una app te enseña en «Para ti» vídeos de gente a la que no sigues, según lo que has visto antes.', p: 'Es el algoritmo de una red social.' },
    { s: 'rss', t: 'Te suscribes a un pódcast y cada episodio nuevo te aparece solo en la app, sin tener que ir a buscarlo.', p: 'Suscribirte y que lo nuevo te llegue solo: sindicación (RSS).' },
    { s: 'nube', t: 'Guardas tus apuntes en Drive y los abres después desde el móvil y desde el ordenador de casa.', p: 'Tus archivos están en servidores de otra empresa y los usas desde cualquier sitio: la nube.' },
    { s: 'nube', t: 'Editas una presentación desde el navegador, sin instalar ningún programa, y se guarda sola en Internet.', p: 'El programa y el archivo están en servidores de Internet: la nube.' },
    { s: 'cms', t: 'Montas una web con plantillas y botones, sin escribir nada de código, y la publicas con un clic.', p: 'Hacer webs sin código, con plantillas: gestor de contenidos (como WordPress o Google Sites).' },
    { s: 'cms', t: 'Miras el código de una web con Ctrl+U y aparece muchas veces «wp-content».', p: '«wp-content» es la huella de WordPress, un gestor de contenidos.' },
    { s: 'p2p', t: 'Pasas una foto del móvil al ordenador de al lado directamente, sin subirla antes a ningún servidor.', p: 'De un equipo a otro, sin servidor en medio: P2P.' },
    { s: 'p2p', t: 'Descargas un archivo que te van mandando a trozos muchos usuarios a la vez, y tú también envías trozos a otros.', p: 'Todos dan y reciben a la vez: P2P (como BitTorrent).' }
  ]);

  function gen(lista, opciones) {
    const d = elige(lista);
    const serv = SERVICIO[d.s];
    return {
      enunciado: `${d.t} (${opciones})`,
      respuesta: serv.nombre,
      respuestas: serv.r,
      formato: 'texto',
      traducible: true,
      pista: d.p
    };
  }

  GENERADORES['foro-blog-wiki'] = () => gen(CASOS, 'foro / blog / wiki');
  GENERADORES['servicio-web'] = () => gen(CASOS_REPASO, 'foro / blog / wiki / red social / RSS / nube / gestor de contenidos / P2P');
  GENERADORES['red-rss-nube'] = () =>
    gen(CASOS_REPASO.filter(c => ['red', 'rss', 'nube'].indexOf(c.s) !== -1), 'red social / RSS / nube');

  /* ---------- ¿Cliente-servidor o P2P? ---------- */

  const CS = { nombre: 'cliente-servidor', r: ['cliente-servidor', 'cliente servidor', 'cliente/servidor', 'cs', 'servidor'] };
  const P2P = { nombre: 'P2P', r: ['p2p', 'peer to peer', 'de igual a igual'] };

  const CASOS_CS = [
    { p2p: false, t: 'Ves un vídeo de YouTube.', p: 'El vídeo está en los servidores de YouTube y tu navegador se lo pide.' },
    { p2p: false, t: 'Abres la web del instituto.', p: 'Tu navegador (cliente) le pide la página a un servidor.' },
    { p2p: false, t: 'Descargas un archivo de tu Drive.', p: 'El archivo está guardado en los servidores de Google.' },
    { p2p: false, t: 'Miras tu correo de Gmail.', p: 'Los correos están en los servidores de Google y tú los pides.' },
    { p2p: false, t: 'Entras en Wikipedia a leer un artículo.', p: 'Wikipedia tiene sus servidores; tú eres el cliente.' },
    { p2p: true, t: 'Pasas una foto al ordenador de tu compañero con pairdrop.net, sin subirla a ningún sitio.', p: 'La foto va directa de un equipo al otro: P2P.' },
    { p2p: true, t: 'Descargas un archivo por BitTorrent y, a la vez, envías trozos a otros usuarios.', p: 'Todos son a la vez clientes y servidores: P2P.' },
    { p2p: true, t: 'Mandas un archivo al móvil de al lado por Bluetooth.', p: 'Directo de un aparato al otro, sin servidor: P2P.' },
    { p2p: true, t: 'Dos ordenadores del aula comparten una carpeta entre ellos, sin servidor del centro.', p: 'Los dos son iguales: cada uno da y recibe.' }
  ];

  GENERADORES['cs-o-p2p'] = () => {
    const d = elige(CASOS_CS);
    const r = d.p2p ? P2P : CS;
    return {
      enunciado: `${d.t} (cliente-servidor / P2P)`,
      respuesta: r.nombre,
      respuestas: r.r,
      formato: 'texto',
      traducible: true,
      pista: d.p
    };
  };
})();
