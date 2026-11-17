/* ============================================================
   Animaciones de servicios de Internet (Operaciones U3)
   js/anim-servicios.js — cargado DESPUÉS de js/anim-iso.js.
   Estilo isométrico (ISO.animacion), desde el 09/11/2026.

   rss   U3 S2 · sin RSS entras tú en cada web; con RSS la app
         consulta los feeds por ti y te avisa.
   p2p   U3 S3 · cliente-servidor (todo pasa por el centro; si se
         cae, nadie descarga) frente a P2P (trozos entre iguales).
   dns-web     U2 S1 · pregunta al DNS, pide la página al servidor y,
               si el nombre no existe, error (17/11/2026).
   correo-viaje U4 S3 · tu servidor, el del dominio, el buzón y la
               descarga con el ordenador apagado (17/11/2026).
   publicar-web Proyecto S7 · subir a GitHub, Cloudflare copia; el
               visitante pregunta al DNS y pide los archivos (17/11/2026).
   ============================================================ */

(function () {
  'use strict';
  if (!window.ISO || !window.ANIM) return;
  const ISO = window.ISO;
  const ruta = (...p) => p;

  /* ============================================================
     rss
     ============================================================ */
  (function () {
    const TU = [110, 224];
    const WEBS = [[480, 74], [520, 196], [480, 318]];
    const NOM = ['Pódcast A', 'Blog B', 'Pódcast C'];
    const yo = [TU[0] + 40, TU[1] - 10];
    const web = i => [WEBS[i][0] - 40, WEBS[i][1] - 6];
    ISO.animacion('rss', {
      titulo: 'Sin RSS vas tú a cada web; con RSS tu aplicación consulta los feeds por ti y te avisa cuando hay algo nuevo',
      msMovimiento: 1500,
      dibujar(k) {
        WEBS.forEach((w, i) => k.cable('w' + i, yo, web(i)));
        k.pc(k.svg, TU[0], TU[1], 'Tú');
        WEBS.forEach((w, i) => {
          k.servidor(k.svg, w[0], w[1] - 6);
          k.texto(k.svg, w[0] + 48, w[1] - 20, NOM[i], 'i-t i-negrita', 'start');
        });
        k.nombre('app', k.pastilla(k.svg, TU[0], TU[1] - 82, 'App de pódcast', { claseTexto: 'i-t i-negrita' }));
        k.nombre('nada', k.bocadillo(k.svg, 300, 300, 'Nada nuevo… otra vez', [web(2)[0] - 40, 300]));
        k.nombre('nuevo', k.marca(k.svg, WEBS[1][0] + 40, WEBS[1][1] - 54, true));
        k.nombre('aviso', k.bocadillo(k.svg, 170, 44, '¡Episodio nuevo!', [TU[0], TU[1] - 100]));
      },
      pasos: [
        { texto: 'Sigues tres pódcast y blogs. ¿Cómo sabes si han publicado algo?' },
        { texto: '<strong>Sin RSS</strong>, entras tú en cada web, una por una, a mirar.',
          luz: ['w0', 'w1', 'w2'],
          paq: [{ id: 'a', ruta: ruta(yo, web(0), yo), chips: ['¿algo?'] }, { id: 'b', ruta: ruta(yo, web(1), yo), chips: ['¿algo?'] }, { id: 'c', ruta: ruta(yo, web(2), yo), chips: ['¿algo?'] }] },
        { texto: 'Casi siempre, <strong>nada nuevo</strong>. Has perdido el tiempo.', ver: ['nada'] },
        { texto: '<strong>Con RSS</strong>, cada web publica su <strong>feed</strong> (su lista de novedades) y tu app los consulta todos por ti.',
          ver: ['app'], luz: ['w0', 'w1', 'w2'],
          paq: [{ id: 'fa', ruta: ruta(web(0), yo), chips: [{ t: 'feed', c: 'lima' }], color: 'lima' }, { id: 'fb', ruta: ruta(web(1), yo), chips: [{ t: 'feed', c: 'lima' }], color: 'lima' }, { id: 'fc', ruta: ruta(web(2), yo), chips: [{ t: 'feed', c: 'lima' }], color: 'lima' }] },
        { texto: 'Cuando el blog B publica algo, la app <strong>te avisa sola</strong>. Tú no has ido a buscarlo.',
          ver: ['app', 'nuevo', 'aviso'], luz: ['w1'],
          paq: [{ id: 'nb', ruta: ruta(web(1), yo), chips: [{ t: 'nuevo', c: 'ambar' }], color: 'ambar' }] }
      ]
    });
  })();

  /* ============================================================
     p2p
     ============================================================ */
  (function () {
    const S = [320, 186];
    const C = [[104, 74], [536, 74], [104, 306], [536, 306]];
    const lado = i => [C[i][0] + (C[i][0] < 320 ? 38 : -38), C[i][1] + (C[i][1] < 186 ? 26 : -16)];
    const cen = [S[0], S[1] + 10];
    ISO.animacion('p2p', {
      titulo: 'Cliente-servidor y P2P: en uno todo pasa por el servidor; en el otro cada equipo comparte trozos con los demás',
      msMovimiento: 1600,
      dibujar(k) {
        const el = window.ANIM.el;
        const sv = k.nombre('serv', el('g', {}, k.svg));
        const red = k.nombre('red', el('g', {}, k.svg));
        const mete = (g, c) => { g.appendChild(c.base); g.appendChild(c.luz); };
        C.forEach((c, i) => mete(sv, k.cable('s' + i, lado(i), cen)));
        [['p01', 0, 1], ['p23', 2, 3], ['p02', 0, 2], ['p13', 1, 3]].forEach(([n, a, b]) => mete(red, k.cable(n, lado(a), lado(b))));
        k.servidor(sv, S[0], S[1], 'Servidor');
        C.forEach((c, i) => k.pc(k.svg, c[0], c[1] - 16, String.fromCharCode(65 + i)));
        k.nombre('caido', k.marca(k.svg, S[0] + 40, S[1] - 70, false));
        k.nombre('nadie', k.bocadillo(k.svg, 320, 40, 'Nadie descarga', [S[0], S[1] - 70]));
        k.nombre('okP', k.marca(k.svg, 320, 342, true));
      },
      pasos: [
        { texto: '<strong>Cliente-servidor</strong>: un servidor central guarda el archivo y se lo envía entero a cada cliente.',
          ver: ['serv'], luz: ['s0', 's1', 's2', 's3'],
          paq: [0, 1, 2, 3].map(i => ({ id: 'c' + i, ruta: ruta(cen, lado(i)), chips: ['archivo'] })) },
        { texto: 'Todo pasa por el centro. Si el servidor <strong>se cae</strong>, nadie puede descargar.',
          ver: ['serv', 'caido', 'nadie'] },
        { texto: '<strong>P2P</strong>, de igual a igual: no hay servidor. El archivo se parte en trozos y cada equipo tiene alguno.', ver: ['red'],
          paq: [0, 1, 2, 3].map(i => ({ id: 't' + i, ruta: ruta(lado(i)), chips: [String(i + 1)], color: 'lima' })) },
        { texto: 'Cada uno pasa sus trozos a los otros, directamente. Como en <strong>BitTorrent</strong>.',
          ver: ['red'], luz: ['p01', 'p23', 'p02', 'p13'],
          paq: [{ id: 't0', ruta: ruta(lado(0), lado(1)) }, { id: 't1', ruta: ruta(lado(1), lado(3)) }, { id: 't3', ruta: ruta(lado(3), lado(2)) }, { id: 't2', ruta: ruta(lado(2), lado(0)) }] },
        { texto: 'Al final todos tienen el archivo entero. Si uno se va, los demás <strong>siguen compartiendo</strong>.',
          ver: ['red', 'okP'], paq: [0, 1, 2, 3].map(i => ({ id: 'f' + i, ruta: ruta(lado(i)), chips: ['1 2 3 4'], color: 'lima' })) }
      ]
    });
  })();
  /* ============================================================
     dns-web · Operaciones U2 S1 (preguntas 13 y 14)
     ============================================================ */
  (function () {
    const PC = [90, 240], R = [235, 250], N = [380, 150], DN = [545, 92], WB = [550, 280];
    const pc = [124, 256], rt = [235, 258], nb = [380, 162], dn = [516, 100], we = [520, 284];
    const ida = [pc, rt, nb, dn], vuelta = [dn, nb, rt, pc];
    const idaWeb = [pc, rt, nb, we], vueltaWeb = [we, nb, rt, pc];
    ISO.animacion('dns-web', {
      titulo: 'El ordenador pregunta al DNS la IP de bloquecraft.es, pide la página al servidor y, si el nombre no existe, sale un error',
      msMovimiento: 1500,
      capas: ['Dirección', 'Mensaje'],
      textoCapas: 'por dentro',
      dibujar(k) {
        k.cable('c1', [120, 262], [194, 266]);
        k.cable('c2', [272, 250], [342, 172], [300, 196]);
        k.cable('c3', [420, 142], [516, 104]);
        k.cable('c4', [416, 176], [518, 282]);
        k.pc(k.svg, PC[0], PC[1], 'Tu ordenador');
        k.router(k.svg, R[0], R[1], 'Router');
        k.nube(k.svg, N[0], N[1]);
        k.servidor(k.svg, DN[0], DN[1], 'DNS');
        k.servidor(k.svg, WB[0], WB[1], '91.45.7.33');
        k.nombre('escribe', k.bocadillo(k.svg, 150, 140, 'bloquecraft.es', [100, 194]));
        k.nombre('lista', k.bocadillo(k.svg, 350, 30, 'bloquecraft.es = 91.45.7.33', [512, 62]));
        k.nombre('noexiste', k.bocadillo(k.svg, 400, 34, 'No existe', [520, 54]));
        k.nombre('ok', k.marca(k.svg, PC[0] + 54, PC[1] - 26, true));
        k.nombre('mal', k.marca(k.svg, PC[0] + 54, PC[1] - 26, false));
      },
      pasos: [
        { texto: 'Escribes <strong>bloquecraft.es</strong>. Pero los ordenadores se buscan por su IP, no por su nombre.',
          ver: ['escribe'] },
        { texto: '1. Tu ordenador pregunta al <strong>DNS</strong>: «¿Qué IP tiene bloquecraft.es?».',
          ver: ['escribe'], luz: ['c1', 'c2', 'c3'],
          paq: [{ id: 'q', ruta: ida, chips: ['¿bloquecraft.es?'] }],
          registro: { de: 'Tu ordenador', a: 'DNS', msg: 'Pregunta', dato: '¿IP de bloquecraft.es?', color: 'azul',
                      capas: ['De tu casa al DNS', '¿Qué IP tiene bloquecraft.es?'] } },
        { texto: '2. El DNS lo busca en su lista y <strong>contesta</strong>: 91.45.7.33.',
          ver: ['lista'], luz: ['c3', 'c2', 'c1'],
          paq: [{ id: 'r', ruta: vuelta, chips: ['91.45.7.33'], color: 'rosa' }],
          registro: { de: 'DNS', a: 'Tu ordenador', msg: 'Respuesta', dato: '91.45.7.33', color: 'rosa',
                      capas: ['Del DNS a tu casa', 'bloquecraft.es es 91.45.7.33'] } },
        { texto: '3. Ahora sí: el navegador, el <strong>cliente</strong>, pide la página a 91.45.7.33.',
          luz: ['c1', 'c2', 'c4'],
          paq: [{ id: 'p', ruta: idaWeb, chips: ['Quiero la página'] }],
          registro: { de: 'Tu ordenador', a: '91.45.7.33', msg: 'Petición', dato: 'quiero la página', color: 'azul',
                      capas: ['De tu casa a 91.45.7.33', 'Quiero la página principal'] } },
        { texto: '4. El <strong>servidor</strong> le envía la página.',
          luz: ['c4', 'c2', 'c1'],
          paq: [{ id: 'w', ruta: vueltaWeb, chips: ['La página'], color: 'rosa' }],
          registro: { de: '91.45.7.33', a: 'Tu ordenador', msg: 'Respuesta', dato: 'la página', color: 'rosa',
                      capas: ['De 91.45.7.33 a tu casa', 'El texto, las imágenes…'] } },
        { texto: 'La página sale en tu pantalla. <strong>Cliente pide, servidor responde.</strong>',
          ver: ['ok'] },
        { texto: '¿Y si el nombre no existe? Escribes esta-web-no-existe.es.',
          ver: ['escribe'], textos: { escribe: 'esta-web-no-existe.es' }, registroNuevo: true },
        { texto: 'Tu ordenador pregunta al DNS, como siempre.',
          ver: ['escribe'], luz: ['c1', 'c2', 'c3'],
          paq: [{ id: 'q2', ruta: ida, chips: ['¿esta-web…?'] }],
          registro: { de: 'Tu ordenador', a: 'DNS', msg: 'Pregunta', dato: '¿IP de esta-web-no-existe.es?', color: 'azul',
                      capas: ['De tu casa al DNS', '¿Qué IP tiene esta-web-no-existe.es?'] } },
        { texto: 'El DNS no lo encuentra: «<strong>no existe</strong>». Sin IP, el navegador no sabe a quién pedir la página y sale un error.',
          ver: ['escribe', 'noexiste', 'mal'], luz: ['c3', 'c2', 'c1'],
          paq: [{ id: 'r2', ruta: vuelta, chips: ['No existe'], color: 'rosa' }],
          registro: { de: 'DNS', a: 'Tu ordenador', msg: 'Respuesta', dato: 'no existe', color: 'rosa',
                      capas: ['Del DNS a tu casa', 'Ese nombre no está en la lista'] } }
      ]
    });
  })();

  /* ============================================================
     correo-viaje · Operaciones U4 S3 (pregunta 3)
     ============================================================ */
  (function () {
    const TU = [80, 250], GM = [230, 110], IES = [400, 110], ANA = [570, 260];
    const tu = [112, 238], gm = [206, 130], gm2 = [256, 120], ies = [374, 120], ies2 = [424, 138], ana = [538, 248];
    const CORREO = ['Para: ana.serra@iesramonllull.net', 'Asunto, texto y adjunto'];
    ISO.animacion('correo-viaje', {
      titulo: 'Un correo va de tu servidor al servidor del dominio y espera en el buzón aunque Ana tenga el ordenador apagado',
      msMovimiento: 1500,
      capas: ['El sobre', 'La carta'],
      textoCapas: 'por dentro',
      dibujar(k) {
        k.cable('c1', tu, gm);
        k.cable('c2', gm2, ies);
        k.cable('c3', ies2, ana);
        k.pc(k.svg, TU[0], TU[1], 'Tú');
        k.servidor(k.svg, GM[0], GM[1], 'Gmail');
        k.servidor(k.svg, IES[0], IES[1], 'iesramonllull.net');
        k.pc(k.svg, ANA[0], ANA[1], 'Ana');
        k.cartel(k.svg, 236, 236, 190, 92, 'Buzón de Ana');
        k.nombre('buzon', k.texto(k.svg, 331, 302, '(vacío)', 'i-t i-tenue'));
        k.nombre('apagado', k.pastilla(k.svg, ANA[0], ANA[1] - 70, 'Apagado'));
        k.nombre('ok', k.marca(k.svg, ANA[0] + 46, ANA[1] - 64, true));
      },
      pasos: [
        { texto: 'Escribes un correo para <strong>ana.serra@iesramonllull.net</strong>. Ana tiene el ordenador apagado.',
          ver: ['apagado'] },
        { texto: '1. Al pulsar Enviar, el correo va a <strong>tu servidor</strong> de correo, Gmail.',
          ver: ['apagado'], luz: ['c1'],
          paq: [{ id: 'm', ruta: [tu, gm], chips: ['Para Ana'] }],
          registro: { de: 'Tú', a: 'Gmail', msg: 'Correo', dato: 'para Ana', color: 'azul', capas: CORREO } },
        { texto: '2. Tu servidor mira el <strong>dominio</strong>, iesramonllull.net, y se lo pasa al servidor de ese dominio.',
          ver: ['apagado'], luz: ['c2'],
          paq: [{ id: 'm', ruta: [gm2, ies], chips: ['Para Ana'] }],
          registro: { de: 'Gmail', a: 'iesramonllull.net', msg: 'Correo', dato: 'para Ana', color: 'azul', capas: CORREO } },
        { texto: '3. Allí se queda en el <strong>buzón</strong> de Ana. Su ordenador sigue apagado y no pasa nada.',
          ver: ['apagado'], textos: { buzon: '1 correo nuevo' } },
        { texto: '4. Ana enciende el ordenador y abre su correo: se lo <strong>descarga</strong> de su buzón.',
          luz: ['c3'], textos: { buzon: '1 correo nuevo' },
          paq: [{ id: 'd', ruta: [ies2, ana], chips: ['Tu correo'], color: 'rosa' }],
          registro: { de: 'iesramonllull.net', a: 'Ana', msg: 'Descarga', dato: 'tu correo', color: 'rosa', capas: CORREO } },
        { texto: 'Por eso puedes escribir a alguien con el ordenador apagado: el correo le <strong>espera en su buzón</strong>.',
          ver: ['ok'], textos: { buzon: '(leído)' } }
      ]
    });
  })();

  /* ============================================================
     publicar-web · Proyecto S7 (sin pregunta)
     ============================================================ */
  (function () {
    const PC = [125, 110], GH = [290, 96], CF = [420, 196], DNS = [570, 268], VI = [100, 286];
    const pc = [158, 116], gh = [266, 104], gh2 = [316, 112], cf = [397, 186], cf2 = [395, 214];
    const vi = [134, 290], vi2 = [134, 280], dn = [542, 280];
    const DIR = 'bloquecraft.pages.dev';
    ISO.animacion('publicar-web', {
      titulo: 'Publicar: subís a GitHub y Cloudflare copia los archivos. Visitar: el navegador pregunta al DNS y pide los archivos a Cloudflare',
      msMovimiento: 1500,
      capas: ['De → a', 'Lo que lleva'],
      textoCapas: 'por dentro',
      dibujar(k) {
        k.cable('c1', pc, gh);
        k.cable('c2', gh2, cf);
        k.cable('c3', vi, dn);
        k.cable('c4', vi2, cf2, [260, 214]);
        k.pc(k.svg, PC[0], PC[1], 'Vuestro ordenador');
        k.servidor(k.svg, GH[0], GH[1], 'GitHub');
        k.servidor(k.svg, CF[0], CF[1], 'Cloudflare');
        k.servidor(k.svg, DNS[0], DNS[1], 'DNS');
        k.pc(k.svg, VI[0], VI[1], 'Visitante');
        k.nombre('publicada', k.pastilla(k.svg, 535, 160, 'Publicada'));
        k.nombre('ok', k.marca(k.svg, VI[0] + 46, VI[1] - 64, true));
      },
      pasos: [
        { texto: 'Dos viajes distintos: <strong>publicar</strong> (arriba) y <strong>visitar</strong> (abajo).' },
        { texto: '1. <strong>Subís</strong> los archivos a GitHub, como cada semana.',
          luz: ['c1'], paq: [{ id: 's', ruta: [pc, gh], chips: ['Los archivos'] }],
          registro: { de: 'Vosotros', a: 'GitHub', msg: 'Subida', dato: 'los archivos de la web', color: 'azul',
                      capas: ['Vuestro ordenador → GitHub', 'index.html, estilos.css, img…'] } },
        { texto: '2. Cloudflare ve el cambio y <strong>copia los archivos</strong> a sus servidores. Tarda uno o dos minutos.',
          luz: ['c2'], paq: [{ id: 's', ruta: [gh2, cf] }],
          registro: { de: 'GitHub', a: 'Cloudflare', msg: 'Copia', dato: 'los archivos nuevos', color: 'azul',
                      capas: ['GitHub → Cloudflare', 'index.html, estilos.css, img…'] } },
        { texto: 'Ya está <strong>publicada</strong>. Esto pasa una vez por cada cambio que subís.',
          ver: ['publicada'], registroNuevo: true },
        { texto: '3. Alguien escribe ' + DIR + '. Su navegador pregunta al <strong>DNS</strong>: «¿Qué IP tiene?».',
          ver: ['publicada'], luz: ['c3'], paq: [{ id: 'q', ruta: [vi, dn], chips: ['¿IP?'] }],
          registro: { de: 'Visitante', a: 'DNS', msg: 'Pregunta', dato: '¿IP de ' + DIR + '?', color: 'azul',
                      capas: ['Visitante → DNS', '¿Qué IP tiene ' + DIR + '?'] } },
        { texto: 'El DNS contesta con la IP de un servidor de Cloudflare.',
          ver: ['publicada'], luz: ['c3'], paq: [{ id: 'r', ruta: [dn, vi], chips: ['104.21.35.12'], color: 'rosa' }],
          registro: { de: 'DNS', a: 'Visitante', msg: 'Respuesta', dato: '104.21.35.12', color: 'rosa',
                      capas: ['DNS → visitante', DIR + ' es 104.21.35.12'] } },
        { texto: '4. Con la IP, el navegador <strong>pide los archivos</strong> a Cloudflare.',
          ver: ['publicada'], luz: ['c4'], paq: [{ id: 'p', ruta: [vi2, cf2], chips: ['Quiero index.html'] }],
          registro: { de: 'Visitante', a: 'Cloudflare', msg: 'Petición', dato: 'quiero index.html', color: 'azul',
                      capas: ['Visitante → 104.21.35.12', 'Quiero index.html'] } },
        { texto: '5. Cloudflare se los envía y el navegador <strong>dibuja la página</strong>. Esto pasa cada vez que alguien la abre.',
          ver: ['publicada', 'ok'], luz: ['c4'], paq: [{ id: 'w', ruta: [cf2, vi2], chips: ['HTML, CSS, JS'], color: 'rosa' }],
          registro: { de: 'Cloudflare', a: 'Visitante', msg: 'Respuesta', dato: 'HTML, CSS, JS e imágenes', color: 'rosa',
                      capas: ['104.21.35.12 → visitante', 'index.html, estilos.css, imágenes…'] } }
      ]
    });
  })();

})();
