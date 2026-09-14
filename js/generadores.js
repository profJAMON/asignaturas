/* ============================================================
   Generadores de ejercicios.

   Idea: los ejercicios repetitivos (binario, unidades de medida,
   clases de IP, máscaras, redes y broadcast) no se escriben a mano
   uno a uno. Se describen aquí una sola vez y el navegador genera
   una tanda nueva cada vez que el alumno pulsa "Otra tanda".
   Así la bolsa de ejercicios es infinita y nunca es la misma.

   Cómo se usa desde el json de una sesión:

     {
       "tipo": "generador",
       "titulo": "Pasa de binario a decimal",
       "generador": "binario-a-decimal",
       "n": 8
     }

   Cada generador es una función generar() que devuelve un objeto:

     {
       enunciado: "1011 0111",
       respuesta: "183",            // o respuestas: ["183", "183 "]
       formato:   "numero",         // "numero" | "texto"
       pista:     "1+2+4+16+32+128" // opcional, se ve al corregir
     }

   Para añadir un generador nuevo: escribe la función y regístrala
   en el objeto GENERADORES del final. Nada más.
   ============================================================ */

/* ---------- utilidades ---------- */

function _ent(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function _elige(lista) {
  return lista[_ent(0, lista.length - 1)];
}

/* Devuelve n elementos distintos de una lista (o todos si pides de más). */
function _varios(lista, n) {
  const copia = lista.slice();
  const salida = [];
  while (copia.length && salida.length < n) {
    salida.push(copia.splice(_ent(0, copia.length - 1), 1)[0]);
  }
  return salida;
}

/* 183 -> "10110111" con ceros a la izquierda hasta 8 bits. */
function _aBinario(n, bits) {
  let s = n.toString(2);
  while (s.length < (bits || 8)) s = '0' + s;
  return s;
}

/* "10110111" -> "1011 0111" (se lee mucho mejor en grupos de 4). */
function _enGrupos(binario) {
  return binario.replace(/(.{4})(?=.)/g, '$1 ');
}

/* Separador de miles a la española: 1048576 -> "1.048.576" */
function _miles(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/* Compara la respuesta del alumno con la esperada.
   - "numero": se ignoran espacios y separadores de miles; la coma
     decimal y el punto decimal valen igual.
   - "texto": se ignoran mayúsculas, acentos, espacios de más y el
     punto final. */
function _normalizarNumero(texto) {
  let t = String(texto).trim().replace(/\s/g, '');
  if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(t)) t = t.replace(/\./g, ''); // 1.048.576
  t = t.replace(',', '.');
  const n = parseFloat(t);
  return isNaN(n) ? null : n;
}

function _normalizarTexto(texto) {
  return String(texto)
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\.$/, '');
}

function respuestaCorrecta(pregunta, entrada) {
  const validas = pregunta.respuestas || [pregunta.respuesta];
  if (pregunta.formato === 'numero') {
    const dada = _normalizarNumero(entrada);
    if (dada === null) return false;
    return validas.some(v => {
      const esperada = _normalizarNumero(v);
      if (esperada === null) return false;
      // margen mínimo, para que 0,1+0,2 no suspenda a nadie
      return Math.abs(dada - esperada) < 1e-9;
    });
  }
  const dada = _normalizarTexto(entrada);
  return validas.some(v => _normalizarTexto(v) === dada);
}

/* ---------- 1.2 Sistemas de codificación ---------- */

function genBinarioADecimal() {
  const n = _ent(5, 255);
  const bin = _aBinario(n, 8);
  const sumandos = [];
  for (let i = 0; i < 8; i++) {
    if (bin[7 - i] === '1') sumandos.push(Math.pow(2, i));
  }
  return {
    enunciado: _enGrupos(bin),
    respuesta: String(n),
    formato: 'numero',
    pista: sumandos.slice().reverse().join(' + ') + ' = ' + n
  };
}

function genDecimalABinario() {
  const n = _ent(5, 255);
  const bin = _aBinario(n, 8);
  return {
    enunciado: String(n),
    respuestas: [_enGrupos(bin), bin, String(parseInt(bin, 2).toString(2))],
    respuesta: _enGrupos(bin),
    formato: 'texto',
    pista: 'Divide entre 2 una y otra vez y lee los restos de abajo arriba. Con espacios o sin ellos vale igual.'
  };
}

/* ---------- 1.3 Unidades de medida ---------- */

const _UNIDADES = [
  { nombre: 'B', exp: 0 },
  { nombre: 'KB', exp: 1 },
  { nombre: 'MB', exp: 2 },
  { nombre: 'GB', exp: 3 },
  { nombre: 'TB', exp: 4 }
];

function genUnidades() {
  const i = _ent(0, 3);
  const j = _ent(i + 1, 4);
  const grande = _UNIDADES[j];
  const pequena = _UNIDADES[i];
  const factor = Math.pow(1024, j - i);

  if (Math.random() < 0.5) {
    // de grande a pequeña: 2 TB -> ? MB
    const cantidad = _elige([1, 2, 3, 4, 5, 8, 10, 16]);
    return {
      enunciado: `${cantidad} ${grande.nombre} = ______ ${pequena.nombre}`,
      respuesta: String(cantidad * factor),
      formato: 'numero',
      pista: `Cada escalón multiplica por 1024. De ${grande.nombre} a ${pequena.nombre} hay ${j - i} escalón(es): ${cantidad} × ${_miles(factor)} = ${_miles(cantidad * factor)}`
    };
  }
  // de pequeña a grande: 4096 MB -> ? GB
  const resultado = _elige([1, 2, 3, 4, 8]);
  const cantidad = resultado * factor;
  return {
    enunciado: `${_miles(cantidad)} ${pequena.nombre} = ______ ${grande.nombre}`,
    respuesta: String(resultado),
    formato: 'numero',
    pista: `Cada escalón divide entre 1024: ${_miles(cantidad)} ÷ ${_miles(factor)} = ${resultado}`
  };
}

function genBitsYBytes() {
  const modo = _ent(1, 3);
  if (modo === 1) {
    const bytes = _elige([2, 4, 8, 16, 32, 64, 128, 256, 512]);
    return {
      enunciado: `${bytes} bytes (B) = ______ bits (b)`,
      respuesta: String(bytes * 8),
      formato: 'numero',
      pista: `Un byte son 8 bits: ${bytes} × 8 = ${bytes * 8}`
    };
  }
  if (modo === 2) {
    const megas = _elige([100, 300, 600, 1000, 1200]);
    return {
      enunciado: `Tu conexión es de ${megas} Mbps. ¿Cuántos MB por segundo bajas como máximo?`,
      respuesta: String(megas / 8),
      formato: 'numero',
      pista: `Mbps son megabits; para pasar a megabytes se divide entre 8: ${megas} ÷ 8 = ${megas / 8} MB/s. Por eso una línea de ${megas} "megas" nunca baja a ${megas} MB/s.`
    };
  }
  const archivo = _elige([100, 200, 400, 600, 800]);
  const linea = _elige([100, 200, 400]);
  return {
    enunciado: `Descargas un archivo de ${archivo} MB por una línea de ${linea} Mbps. ¿Cuántos segundos tarda como mínimo?`,
    respuesta: String((archivo * 8) / linea),
    formato: 'numero',
    pista: `Pasa el archivo a megabits: ${archivo} × 8 = ${archivo * 8} Mb. Luego divide entre la velocidad: ${archivo * 8} ÷ ${linea} = ${(archivo * 8) / linea} s`
  };
}

function genCuantosCaben() {
  const soportes = [
    { nombre: 'un CD', mb: 700 },
    { nombre: 'un DVD', mb: 4700 },
    { nombre: 'un pendrive de 8 GB', mb: 8192 },
    { nombre: 'una tarjeta SD de 2 GB', mb: 2048 }
  ];
  const soporte = _elige(soportes);
  const archivos = [
    { nombre: 'una película', mb: _ent(2, 9) * 1024 },
    { nombre: 'una carpeta de fotos', mb: _ent(200, 900) },
    { nombre: 'una copia de seguridad', mb: _ent(3, 12) * 1024 }
  ];
  const archivo = _elige(archivos);
  const n = Math.ceil(archivo.mb / soporte.mb);
  return {
    enunciado: `Quieres pasar ${archivo.nombre} de ${_miles(archivo.mb)} MB usando ${soporte.nombre} (${soporte.mb} MB). ¿Cuántos necesitas?`,
    respuesta: String(n),
    formato: 'numero',
    pista: `${_miles(archivo.mb)} ÷ ${soporte.mb} = ${(archivo.mb / soporte.mb).toFixed(2)}. Como no existen los medios soportes, se redondea hacia arriba: ${n}.`
  };
}

/* ---------- 1.7 Direccionamiento IP ---------- */

function _ipAleatoria(claseForzada) {
  const clase = claseForzada || _elige(['A', 'A', 'B', 'B', 'C', 'C', 'C', 'D', 'E']);
  const rangos = { A: [1, 126], B: [128, 191], C: [192, 223], D: [224, 239], E: [240, 255] };
  const [min, max] = rangos[clase];
  const o1 = _ent(min, max);
  return { ip: `${o1}.${_ent(0, 255)}.${_ent(0, 255)}.${_ent(1, 254)}`, clase, o1 };
}

function genClaseDeIp() {
  const { ip, clase, o1 } = _ipAleatoria();
  const limites = {
    A: '1 a 126', B: '128 a 191', C: '192 a 223', D: '224 a 239', E: '240 a 255'
  };
  return {
    enunciado: `¿De qué clase es la dirección ${ip}?`,
    respuestas: [clase, `clase ${clase}`],
    respuesta: clase,
    formato: 'texto',
    pista: `Solo hay que mirar el primer octeto: ${o1}. La clase ${clase} va del ${limites[clase]}.`
  };
}

function genMascaraPorDefecto() {
  const { ip, clase, o1 } = _ipAleatoria(_elige(['A', 'B', 'C']));
  const mascaras = { A: '255.0.0.0', B: '255.255.0.0', C: '255.255.255.0' };
  return {
    enunciado: `Máscara por defecto de ${ip}`,
    respuestas: [mascaras[clase], mascaras[clase] + '.'],
    respuesta: mascaras[clase],
    formato: 'texto',
    pista: `Primer octeto ${o1} → clase ${clase} → máscara ${mascaras[clase]}.`
  };
}

function genParteDeRed() {
  const { ip, clase } = _ipAleatoria(_elige(['A', 'B', 'C']));
  const octetos = ip.split('.');
  const cuantos = { A: 1, B: 2, C: 3 }[clase];
  const red = octetos.slice(0, cuantos).join('.');
  const host = octetos.slice(cuantos).join('.');
  const pregunta = Math.random() < 0.5;
  return {
    enunciado: pregunta
      ? `¿Cuál es la parte de RED de ${ip}?`
      : `¿Cuál es la parte de HOST de ${ip}?`,
    respuesta: pregunta ? red : host,
    formato: 'texto',
    pista: `${ip} es de clase ${clase}, así que la red ocupa ${cuantos} octeto(s): red = ${red}, host = ${host}.`
  };
}

function genPublicaOPrivada() {
  const privadas = [
    () => `10.${_ent(0, 255)}.${_ent(0, 255)}.${_ent(1, 254)}`,
    () => `172.${_ent(16, 31)}.${_ent(0, 255)}.${_ent(1, 254)}`,
    () => `192.168.${_ent(0, 255)}.${_ent(1, 254)}`
  ];
  const publicas = [
    () => `${_ent(11, 126)}.${_ent(0, 255)}.${_ent(0, 255)}.${_ent(1, 254)}`,
    () => `172.${_elige([1, 5, 9, 32, 40, 60])}.${_ent(0, 255)}.${_ent(1, 254)}`,
    () => `193.${_ent(0, 255)}.${_ent(0, 255)}.${_ent(1, 254)}`,
    () => `8.8.8.8`
  ];
  const esPrivada = Math.random() < 0.5;
  const ip = esPrivada ? _elige(privadas)() : _elige(publicas)();
  return {
    enunciado: `${ip} — ¿pública o privada?`,
    respuestas: esPrivada ? ['privada'] : ['publica', 'pública'],
    respuesta: esPrivada ? 'privada' : 'pública',
    formato: 'texto',
    pista: 'Los tres rangos privados son 10.0.0.0–10.255.255.255, 172.16.0.0–172.31.255.255 y 192.168.0.0–192.168.255.255. Todo lo demás es público. Ojo con 172: solo del 16 al 31.'
  };
}

/* ---------- Máscaras, CIDR y subredes ---------- */

const _MASCARAS = {
  8: '255.0.0.0', 16: '255.255.0.0', 24: '255.255.255.0',
  25: '255.255.255.128', 26: '255.255.255.192', 27: '255.255.255.224',
  28: '255.255.255.240', 29: '255.255.255.248', 30: '255.255.255.252'
};

function genCidrAMascara() {
  const prefijos = Object.keys(_MASCARAS).map(Number);
  const p = _elige(prefijos);
  const alReves = Math.random() < 0.5;
  if (alReves) {
    return {
      enunciado: `Escribe en notación CIDR la máscara ${_MASCARAS[p]}`,
      respuestas: [`/${p}`, String(p)],
      respuesta: `/${p}`,
      formato: 'texto',
      pista: `${_MASCARAS[p]} tiene ${p} unos seguidos en binario, por eso se escribe /${p}.`
    };
  }
  return {
    enunciado: `Escribe en decimal la máscara /${p}`,
    respuesta: _MASCARAS[p],
    formato: 'texto',
    pista: `/${p} son ${p} unos: ${_aBinario(255, 8)}… hasta completar ${p} bits → ${_MASCARAS[p]}`
  };
}

function genHostsPorMascara() {
  const p = _elige([24, 25, 26, 27, 28, 29, 30]);
  const bitsHost = 32 - p;
  const total = Math.pow(2, bitsHost);
  return {
    enunciado: `¿Cuántos equipos se pueden direccionar en una red /${p}?`,
    respuesta: String(total - 2),
    formato: 'numero',
    pista: `Quedan ${bitsHost} bits para hosts: 2^${bitsHost} = ${total}. Se restan 2 (la dirección de red y la de broadcast): ${total - 2}.`
  };
}

/* Dirección de red y broadcast a partir de una IP y un prefijo.
   Solo se generan prefijos de /24 a /30, que es lo que se calcula
   mentalmente con el "salto" del último octeto. */
function _calculaRed(ip, p) {
  const o = ip.split('.').map(Number);
  const bitsHost = 32 - p;
  const salto = Math.pow(2, bitsHost);
  const base = Math.floor(o[3] / salto) * salto;
  return {
    red: `${o[0]}.${o[1]}.${o[2]}.${base}`,
    broadcast: `${o[0]}.${o[1]}.${o[2]}.${base + salto - 1}`,
    primera: `${o[0]}.${o[1]}.${o[2]}.${base + 1}`,
    ultima: `${o[0]}.${o[1]}.${o[2]}.${base + salto - 2}`,
    salto: salto
  };
}

function genRedYBroadcast() {
  const p = _elige([25, 26, 27, 28, 29]);
  const ip = `192.168.${_ent(0, 20)}.${_ent(1, 254)}`;
  const r = _calculaRed(ip, p);
  const que = _elige(['red', 'broadcast', 'primera', 'ultima']);
  const etiquetas = {
    red: 'la dirección de RED',
    broadcast: 'la dirección de BROADCAST',
    primera: 'la PRIMERA dirección utilizable',
    ultima: 'la ÚLTIMA dirección utilizable'
  };
  return {
    enunciado: `${ip}/${p} — ¿cuál es ${etiquetas[que]}?`,
    respuesta: r[que],
    formato: 'texto',
    pista: `Con /${p} el salto es de ${r.salto} en ${r.salto}. Bloque: red ${r.red}, hosts de ${r.primera} a ${r.ultima}, broadcast ${r.broadcast}.`
  };
}

function genMismaRed() {
  const p = _elige([25, 26, 27, 28]);
  const ipA = `192.168.${_ent(0, 20)}.${_ent(1, 254)}`;
  const base = _calculaRed(ipA, p);
  const juntas = Math.random() < 0.5;
  let ipB;
  if (juntas) {
    const o = ipA.split('.');
    const inicio = parseInt(base.red.split('.')[3], 10);
    ipB = `${o[0]}.${o[1]}.${o[2]}.${inicio + _ent(1, base.salto - 2)}`;
  } else {
    const o = ipA.split('.');
    const inicio = parseInt(base.red.split('.')[3], 10);
    let otro = inicio + base.salto + _ent(1, base.salto - 2);
    if (otro > 254) otro = Math.max(1, inicio - base.salto + 1);
    ipB = `${o[0]}.${o[1]}.${o[2]}.${otro}`;
  }
  const mismaRed = _calculaRed(ipA, p).red === _calculaRed(ipB, p).red;
  return {
    enunciado: `Con máscara /${p}: ${ipA} y ${ipB}, ¿están en la misma red? (sí / no)`,
    respuestas: mismaRed ? ['si', 'sí'] : ['no'],
    respuesta: mismaRed ? 'sí' : 'no',
    formato: 'texto',
    pista: `${ipA} pertenece al bloque ${_calculaRed(ipA, p).red}/${p} y ${ipB} al bloque ${_calculaRed(ipB, p).red}/${p}.`
  };
}

/* ---------- MAC ---------- */

function _hex() {
  return '0123456789ABCDEF'[_ent(0, 15)];
}

function genMacValida() {
  const buena = Math.random() < 0.5;
  let mac = '';
  const grupos = [];
  for (let i = 0; i < 6; i++) grupos.push(_hex() + _hex());
  if (buena) {
    mac = grupos.join(':');
  } else {
    const fallo = _ent(1, 3);
    if (fallo === 1) mac = grupos.slice(0, 5).join(':');            // faltan grupos
    else if (fallo === 2) mac = grupos.join(':').replace(/^../, 'G7'); // carácter no hexadecimal
    else mac = grupos.join(':') + ':' + _hex() + _hex();            // sobra un grupo
  }
  return {
    enunciado: `${mac} — ¿puede ser una dirección MAC? (sí / no)`,
    respuestas: buena ? ['si', 'sí'] : ['no'],
    respuesta: buena ? 'sí' : 'no',
    formato: 'texto',
    pista: 'Una MAC son 48 bits = 6 grupos de 2 dígitos hexadecimales (0-9 y A-F). Ni más grupos, ni menos, ni letras a partir de la G.'
  };
}

/* ---------- registro ---------- */

const GENERADORES = {
  'binario-a-decimal': genBinarioADecimal,
  'decimal-a-binario': genDecimalABinario,
  'unidades-informacion': genUnidades,
  'bits-y-bytes': genBitsYBytes,
  'cuantos-caben': genCuantosCaben,
  'clase-de-ip': genClaseDeIp,
  'mascara-por-defecto': genMascaraPorDefecto,
  'parte-de-red': genParteDeRed,
  'publica-o-privada': genPublicaOPrivada,
  'cidr-a-mascara': genCidrAMascara,
  'hosts-por-mascara': genHostsPorMascara,
  'red-y-broadcast': genRedYBroadcast,
  'misma-red': genMismaRed,
  'mac-valida': genMacValida
};

/* Genera una tanda de n preguntas sin repetir enunciado. */
function generarTanda(clave, n) {
  const gen = GENERADORES[clave];
  if (!gen) return [];
  const preguntas = [];
  const vistos = new Set();
  let intentos = 0;
  while (preguntas.length < n && intentos < n * 40) {
    intentos++;
    const p = gen();
    if (vistos.has(p.enunciado)) continue;
    vistos.add(p.enunciado);
    preguntas.push(p);
  }
  return preguntas;
}

/* Para poder probar los generadores fuera del navegador (node). */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GENERADORES, generarTanda, respuestaCorrecta, _varios };
}
