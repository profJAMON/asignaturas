/* ============================================================
   Generadores de la Unidad 5 de Instalaciones (sistemas
   inalámbricos), 10/11/2026.

   Archivo aparte, cargado DESPUÉS de js/generadores.js. Solo añade
   entradas al objeto global GENERADORES.

   red-alcance     tecnología o situación → WPAN, WLAN, WMAN o WWAN
   wifi-banda      situación → 2,4 GHz o 5 GHz
   wifi-nombre     Wi-Fi 4/5/6/7 ↔ 802.11n/ac/ax/be
   wifi-seguridad  ¿qué pondrías? / ¿es seguro? (WEP, WPA, WPA2, WPA3)
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;

  const elige = (lista) => lista[Math.floor(Math.random() * lista.length)];

  /* ---------- Alcance ---------- */
  const ALCANCE = [
    ['Unos auriculares Bluetooth conectados al móvil', 'WPAN'],
    ['Un reloj inteligente unido al móvil', 'WPAN'],
    ['Un ratón inalámbrico conectado al portátil', 'WPAN'],
    ['Pagar con el móvil acercándolo al datáfono (NFC)', 'WPAN'],
    ['El wifi de tu casa', 'WLAN'],
    ['El wifi del instituto', 'WLAN'],
    ['El wifi gratis de una cafetería', 'WLAN'],
    ['Una antena que da Internet a todo un pueblo, a varios kilómetros', 'WMAN'],
    ['Una red que cubre una ciudad entera con antenas en los tejados', 'WMAN'],
    ['WiMAX (antiguo)', 'WMAN'],
    ['Los datos móviles 4G de tu teléfono', 'WWAN'],
    ['El 5G del móvil', 'WWAN'],
    ['Internet por satélite en una casa de montaña', 'WWAN']
  ];
  function genAlcance() {
    const [t, r] = elige(ALCANCE);
    return {
      enunciado: `${t} → ¿WPAN, WLAN, WMAN o WWAN?`,
      respuesta: r,
      formato: 'texto',
      traducible: true,
      pista: 'WPAN: a pocos metros de ti (Bluetooth). WLAN: una casa o un edificio (wifi). WMAN: una ciudad o un pueblo. WWAN: un país o el mundo (4G, 5G, satélite).'
    };
  }

  /* ---------- Banda ---------- */
  const BANDA = [
    ['Una consola al lado del router, para jugar en línea', '5'],
    ['Una tele en el salón, junto al router, para ver series en 4K', '5'],
    ['Un portátil en la misma habitación que el router, para descargar mucho', '5'],
    ['Un móvil en el jardín, lejos del router', '2,4'],
    ['Un ordenador dos paredes más allá del router', '2,4'],
    ['Un enchufe inteligente en la otra punta de la casa', '2,4'],
    ['Una bombilla inteligente que solo admite la banda más antigua', '2,4'],
    ['Un altavoz inteligente en el piso de arriba', '2,4'],
    ['Un ordenador en la misma sala, cuando hay muchas redes vecinas que molestan', '5']
  ];
  function genBanda() {
    const [t, r] = elige(BANDA);
    return {
      enunciado: `${t} → ¿2,4 GHz o 5 GHz?`,
      respuesta: r === '5' ? '5 GHz' : '2,4 GHz',
      respuestas: r === '5' ? ['5', '5 GHz', '5ghz'] : ['2,4', '2.4', '2,4 GHz', '2.4 GHz', '2,4ghz', '2.4ghz'],
      formato: 'texto',
      traducible: true,
      pista: '5 GHz: más velocidad, menos alcance y atraviesa peor las paredes. 2,4 GHz: más alcance y atraviesa mejor, pero más lenta y con más interferencias. Los aparatos de domótica suelen ir en 2,4 GHz.'
    };
  }

  /* ---------- Nombres del wifi ---------- */
  const NOMBRES = [
    ['Wi-Fi 4', '802.11n'], ['Wi-Fi 5', '802.11ac'], ['Wi-Fi 6', '802.11ax'], ['Wi-Fi 7', '802.11be']
  ];
  function genNombre() {
    const [w, i] = elige(NOMBRES);
    if (Math.random() < 0.5) {
      return {
        enunciado: `${w} → ¿qué estándar 802.11 es?`,
        respuesta: i,
        respuestas: [i, i.replace('802.11', ''), 'ieee ' + i],
        formato: 'texto',
        pista: 'Wi-Fi 4 = 802.11n · Wi-Fi 5 = 802.11ac · Wi-Fi 6 = 802.11ax · Wi-Fi 7 = 802.11be.'
      };
    }
    const n = w.replace('Wi-Fi ', '');
    return {
      enunciado: `${i} → ¿qué Wi-Fi es (4, 5, 6 o 7)?`,
      respuesta: w,
      respuestas: [w, n, 'wifi ' + n, 'wi-fi ' + n, 'wi-fi' + n, 'wifi' + n],
      formato: 'texto',
      pista: 'Wi-Fi 4 = 802.11n · Wi-Fi 5 = 802.11ac · Wi-Fi 6 = 802.11ax · Wi-Fi 7 = 802.11be.'
    };
  }

  /* ---------- Seguridad ---------- */
  const SEG = [
    ['Tu router deja elegir WEP, WPA o WPA2. ¿Cuál pones?', 'WPA2', ['wpa2']],
    ['Tu router deja elegir WPA2 o WPA3. ¿Cuál pones?', 'WPA3', ['wpa3']],
    ['¿Cuál se rompe en pocos minutos y ya no se debe usar?', 'WEP', ['wep']],
    ['¿Cuál es el más nuevo y el más seguro?', 'WPA3', ['wpa3']],
    ['¿Cuál fue el primero, de 1999?', 'WEP', ['wep']],
    ['¿Cuál trajo el cifrado AES?', 'WPA2', ['wpa2']],
    ['Una red sin contraseña ni cifrado, ¿es abierta o cifrada?', 'abierta', ['abierta']],
    ['¿Es segura una red con WEP? (sí/no)', 'no', ['no']],
    ['¿Es segura una red con WPA3 y una contraseña larga? (sí/no)', 'sí', ['si', 'sí']]
  ];
  function genSeguridad() {
    const [t, r, rs] = elige(SEG);
    return {
      enunciado: t,
      respuesta: r,
      respuestas: rs,
      formato: 'texto',
      traducible: true,
      pista: 'De menos a más seguro: WEP (roto) → WPA → WPA2 (AES) → WPA3. Elige siempre el más nuevo que admitan todos tus aparatos.'
    };
  }

  GENERADORES['red-alcance'] = genAlcance;
  GENERADORES['wifi-banda'] = genBanda;
  GENERADORES['wifi-nombre'] = genNombre;
  GENERADORES['wifi-seguridad'] = genSeguridad;
})();
