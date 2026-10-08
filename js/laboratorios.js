/* ============================================================
   Laboratorios de teoría (08/10/2026)
   ============================================================
   El «Toca y mira» de lo que no es código: pequeños simuladores
   dentro de la explicación para TOCAR un concepto en lugar de
   leerlo. No cuentan para nota ni se entregan.

     <div class="lab" data-lab="terminal" aria-label="…"></div>
     <div class="lab" data-lab="url" data-valor="https://…"></div>
     <div class="lab" data-lab="peticion"></div>
     <div class="lab" data-lab="viaje"></div>

   terminal  Terminal de práctica (ipconfig, ping, nslookup, tracert)
             con averías: «Todo funciona» o «Avería misteriosa», y
             el alumno busca dónde está el problema.
   url       Escribes una URL y se colorea por partes (protocolo,
             subdominio, dominio, ruta, parámetros, fragmento).
   peticion  Un servidor de práctica (pixelkart.es): pides una URL y
             ves la petición, el código de estado (200, 301, 404, 500)
             y lo que llega.
   viaje     De la URL a la pantalla, paso a paso, quitando o poniendo
             los tres ingredientes (dominio, hosting, HTTPS).

   Para añadir uno: una función en LABS que recibe (caja, opciones).
   Lo llama js/tema.js (pintarLeccion) con iniciarLaboratorios().
   Comparte el aspecto de cabecera con «Toca y mira» (js/probador.js).
   ============================================================ */

(function () {
  'use strict';

  function el(etiqueta, clase, texto) {
    const e = document.createElement(etiqueta);
    if (clase) e.className = clase;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }
  function boton(texto, clase) {
    const b = el('button', clase || 'lab__boton', texto);
    b.type = 'button';
    return b;
  }
  const azar = l => l[Math.floor(Math.random() * l.length)];
  const entre = (a, b) => a + Math.floor(Math.random() * (b - a + 1));

  function cabecera(caja, etiqueta) {
    const cab = el('div', 'probador__cabecera');
    cab.appendChild(el('span', 'probador__etiqueta', 'Toca y mira'));
    const t = caja.getAttribute('aria-label');
    if (t) cab.appendChild(el('span', 'probador__titulo', t));
    caja.appendChild(cab);
    return cab;
  }

  /* ============================================================
     1. Terminal de práctica
     ============================================================ */

  const MI_IP = '192.168.1.20';
  const ROUTER = '192.168.1.1';
  const HOSTS = {
    'google.com': { ip: '142.250.184.78', ms: [12, 16], saltos: ['10.15.0.1', '*', '142.250.184.78'] },
    'www.google.com': { ip: '142.250.184.78', ms: [12, 16], saltos: ['10.15.0.1', '*', '142.250.184.78'] },
    'youtube.com': { ip: '142.250.200.142', ms: [13, 18], saltos: ['10.15.0.1', '*', '142.250.200.142'] },
    'wikipedia.org': { ip: '185.15.59.224', ms: [28, 36], saltos: ['10.15.0.1', '84.16.6.9', '*', '91.198.174.1', '185.15.59.224'] },
    'es.wikipedia.org': { ip: '185.15.59.224', ms: [28, 36], saltos: ['10.15.0.1', '84.16.6.9', '*', '91.198.174.1', '185.15.59.224'] },
    'iesramonllull.net': { ip: '82.98.134.21', ms: [18, 25], saltos: ['10.15.0.1', '84.16.6.9', '82.98.134.21'] },
    'cloudflare.com': { ip: '104.16.132.229', ms: [9, 14], saltos: ['10.15.0.1', '104.16.132.229'] },
  };
  const IPS_PUBLICAS = { '8.8.8.8': [10, 15], '1.1.1.1': [8, 12] };

  const AVERIAS = {
    ok: { nombre: 'Todo funciona' },
    cable: { nombre: 'Tu ordenador, su cable o su wifi', paso: 1 },
    router: { nombre: 'Entre tu ordenador y el router', paso: 2 },
    internet: { nombre: 'El router o la operadora', paso: 3 },
    dns: { nombre: 'El DNS', paso: 4 },
  };

  function simular(cmd, averia) {
    const partes = cmd.trim().split(/\s+/);
    const orden = (partes[0] || '').toLowerCase();
    const arg = (partes[1] || '').toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    const L = [];
    const sinRed = averia === 'cable';

    function resolver(nombre) {
      if (/^\d+\.\d+\.\d+\.\d+$/.test(nombre)) return { ip: nombre };
      if (sinRed || averia === 'router' || averia === 'internet' || averia === 'dns') return { fallo: 'dns' };
      if (HOSTS[nombre]) return { ip: HOSTS[nombre].ip, host: HOSTS[nombre] };
      return { fallo: 'noexiste' };
    }
    function alcanzable(ip) {
      if (sinRed) return false;
      if (ip === ROUTER) return averia !== 'router';
      if (ip === MI_IP || ip === '127.0.0.1') return true;
      if (/^192\.168\./.test(ip)) return false;
      if (averia === 'router' || averia === 'internet') return false;
      return IPS_PUBLICAS[ip] || Object.values(HOSTS).some(h => h.ip === ip);
    }
    function msDe(ip) {
      if (ip === ROUTER || ip === MI_IP || ip === '127.0.0.1') return [1, 2];
      if (IPS_PUBLICAS[ip]) return IPS_PUBLICAS[ip];
      const h = Object.values(HOSTS).find(x => x.ip === ip);
      return h ? h.ms : [20, 40];
    }

    switch (orden) {
      case '':
        return [];
      case 'cls':
        return null;
      case 'help': case 'ayuda':
        return [['Comandos de esta terminal de práctica:'], ['  ipconfig'], ['  ping dominio-o-ip'], ['  nslookup dominio'], ['  tracert dominio'], ['  cls  (borra la pantalla)']];
      case 'ipconfig':
        L.push([''], ['Configuración IP de Windows'], [''], ['Adaptador de Ethernet:'], ['']);
        if (sinRed) {
          L.push(['   Estado de los medios. . . . . . . . . : ', ['medios desconectados', 'mal']]);
        } else {
          L.push(['   Dirección IPv4. . . . . . . . . . . . : ', [MI_IP, 'dato']]);
          L.push(['   Máscara de subred . . . . . . . . . . : 255.255.255.0']);
          L.push(['   Puerta de enlace predeterminada . . . : ', [ROUTER, 'dato']]);
        }
        return L;
      case 'ping': {
        if (!arg) return [['Falta a quién hacer ping. Por ejemplo: ping google.com']];
        if (sinRed) return [['Error general.', 'mal']];
        const r = resolver(arg);
        if (r.fallo) return [[`La solicitud de ping no pudo encontrar el host ${arg}. Compruebe el nombre y vuelva a intentarlo.`, 'mal']];
        L.push([''], [`Haciendo ping a ${r.ip === arg ? arg : arg + ' [' + r.ip + ']'} con 32 bytes de datos:`]);
        if (!alcanzable(r.ip)) {
          for (let i = 0; i < 4; i++) L.push(['Tiempo de espera agotado para esta solicitud.', 'mal']);
          L.push([''], [`Estadísticas de ping para ${r.ip}:`], ['    Paquetes: enviados = 4, recibidos = 0, perdidos = 4']);
          return L;
        }
        const [a, b] = msDe(r.ip);
        const ttl = /^192\.168\./.test(r.ip) || r.ip === '127.0.0.1' ? 64 : 115;
        for (let i = 0; i < 4; i++) L.push([`Respuesta desde ${r.ip}: bytes=32 tiempo=`, [entre(a, b) + 'ms', 'dato'], ` TTL=${ttl}`]);
        L.push([''], [`Estadísticas de ping para ${r.ip}:`], ['    Paquetes: enviados = 4, recibidos = 4, perdidos = 0']);
        return L;
      }
      case 'nslookup': {
        if (!arg) return [['Falta el dominio. Por ejemplo: nslookup wikipedia.org']];
        if (sinRed || averia === 'router' || averia === 'internet' || averia === 'dns') {
          return [['Servidor:  UnKnown'], ['Address:  ' + ROUTER], [''], ['DNS request timed out.', 'mal'], ['*** Se agotó el tiempo de espera de la solicitud a UnKnown.', 'mal']];
        }
        L.push(['Servidor:  UnKnown'], ['Address:  ', [ROUTER, 'dato']], ['']);
        if (!HOSTS[arg]) { L.push([`*** UnKnown no encuentra ${arg}: Non-existent domain`, 'mal']); return L; }
        L.push(['Respuesta no autoritativa:'], ['Nombre:  ' + arg], ['Address:  ', [HOSTS[arg].ip, 'dato']]);
        return L;
      }
      case 'tracert': {
        if (!arg) return [['Falta el dominio. Por ejemplo: tracert google.com']];
        const r = resolver(arg);
        if (sinRed || r.fallo) return [[`No se puede resolver el nombre de destino ${arg}.`, 'mal']];
        L.push([''], [`Traza a ${arg} [${r.ip}] sobre un máximo de 30 saltos:`], ['']);
        const saltos = [ROUTER].concat(r.host ? r.host.saltos : (IPS_PUBLICAS[r.ip] ? ['10.15.0.1', r.ip] : [r.ip]));
        let n = 0;
        for (const s of saltos) {
          n++;
          const llega = s === ROUTER ? averia !== 'router' : alcanzable(r.ip) || s === '10.15.0.1' && averia === 'dns';
          if (s === '*' || !llega) {
            L.push([`  ${String(n).padStart(2)}     *        *        *     Tiempo de espera agotado para esta solicitud.`]);
            if (!llega && n >= 3) { L.push([''], ['(Aquí se pararía: la traza no llega.)', 'mal']); return L; }
            continue;
          }
          const [da, db] = msDe(r.ip);
          const [a, b] = s === ROUTER ? [1, 2] : s === r.ip ? [da, db] : [Math.max(3, Math.round(da * 0.6)), Math.max(4, Math.round(db * 0.8))];
          const t = () => (entre(a, b) + ' ms').padStart(6);
          L.push([`  ${String(n).padStart(2)}  ${t()}  ${t()}  ${t()}  `, [s, 'dato']]);
        }
        L.push([''], ['Traza completa.']);
        return L;
      }
      default:
        return [[`"${partes[0]}" no se reconoce como un comando interno o externo,`, 'mal'], ['programa o archivo por lotes ejecutable.', 'mal']];
    }
  }

  function labTerminal(caja) {
    cabecera(caja);
    const modos = el('div', 'lab__fila');
    const bOk = boton('✔ Todo funciona', 'lab__boton lab__boton--activo');
    const bAveria = boton('🔧 Avería misteriosa');
    modos.appendChild(bOk);
    modos.appendChild(bAveria);
    caja.appendChild(modos);

    const term = el('div', 'lab__terminal');
    term.setAttribute('translate', 'no');
    const salida = el('div', 'lab__terminal-salida');
    salida.setAttribute('role', 'log');
    salida.setAttribute('aria-live', 'polite');
    salida.setAttribute('aria-label', 'Lo que responde la terminal');
    const linea = el('form', 'lab__terminal-linea');
    const prompt = el('span', 'lab__terminal-prompt', 'C:\\Users\\alumno>');
    prompt.setAttribute('aria-hidden', 'true');
    const entrada = el('input', 'lab__terminal-entrada');
    entrada.type = 'text';
    entrada.autocomplete = 'off';
    entrada.spellcheck = false;
    entrada.setAttribute('autocapitalize', 'off');
    entrada.setAttribute('aria-label', 'Escribe un comando y pulsa Intro');
    entrada.placeholder = '(escribe aquí un comando y pulsa Intro)';
    linea.appendChild(prompt);
    linea.appendChild(entrada);
    term.appendChild(salida);
    term.appendChild(linea);
    caja.appendChild(term);

    const atajos = el('div', 'lab__fila lab__fila--atajos');
    atajos.appendChild(el('span', 'lab__nota', 'O pulsa:'));
    ['ipconfig', 'ping ' + ROUTER, 'ping 8.8.8.8', 'nslookup google.com', 'ping google.com', 'tracert google.com'].forEach(c => {
      const b = boton(c, 'lab__boton lab__boton--codigo');
      b.setAttribute('translate', 'no');
      b.addEventListener('click', () => ejecutar(c));
      atajos.appendChild(b);
    });
    caja.appendChild(atajos);

    /* La avería misteriosa: el alumno contesta dónde está el problema. */
    const pregunta = el('div', 'lab__pregunta');
    pregunta.hidden = true;
    pregunta.appendChild(el('p', 'lab__pregunta-texto', 'Hay una avería escondida. Usa los comandos en el orden de la tabla y decide: ¿dónde está el problema?'));
    const opciones = el('div', 'lab__fila');
    const estado = el('p', 'lab__estado');
    estado.setAttribute('role', 'status');
    ['cable', 'router', 'internet', 'dns'].forEach(k => {
      const b = boton(`${AVERIAS[k].paso}. ${AVERIAS[k].nombre}`);
      b.addEventListener('click', () => {
        if (k === averia) {
          estado.textContent = `✓ ¡Bien visto! El fallo estaba en: ${AVERIAS[k].nombre.toLowerCase()}. Pulsa «Avería misteriosa» otra vez para otra.`;
          estado.className = 'lab__estado lab__estado--bien';
        } else {
          estado.textContent = '✗ No es ahí. Sigue el orden: ipconfig → ping a la puerta de enlace → ping 8.8.8.8 → nslookup. El primero que falla te dice dónde está.';
          estado.className = 'lab__estado lab__estado--mal';
        }
      });
      opciones.appendChild(b);
    });
    pregunta.appendChild(opciones);
    pregunta.appendChild(estado);
    caja.appendChild(pregunta);

    let averia = 'ok';
    const historial = [];
    let pos = 0;

    /* Cada línea es una lista de trozos: texto suelto o [texto, clase].
       Una línea ['texto', 'mal'] es entera de esa clase. */
    function pintar(lineas) {
      lineas.forEach(l => {
        const d = el('div', 'lab__terminal-texto');
        if (l.length === 2 && typeof l[0] === 'string' && (l[1] === 'mal' || l[1] === 'dato')) {
          d.classList.add('lab__t-' + l[1]);
          d.textContent = l[0];
        } else {
          l.forEach(trozo => {
            if (Array.isArray(trozo)) d.appendChild(el('span', 'lab__t-' + trozo[1], trozo[0]));
            else d.appendChild(document.createTextNode(trozo));
          });
        }
        if (!d.textContent) d.innerHTML = '&nbsp;';
        salida.appendChild(d);
      });
      salida.scrollTop = salida.scrollHeight;
    }
    function ejecutar(cmd) {
      const eco = el('div', 'lab__terminal-texto');
      eco.appendChild(el('span', 'lab__t-prompt', 'C:\\Users\\alumno> '));
      eco.appendChild(el('span', 'lab__t-cmd', cmd));
      salida.appendChild(eco);
      if (cmd.trim()) { historial.push(cmd); pos = historial.length; }
      const r = simular(cmd, averia);
      if (r === null) { salida.innerHTML = ''; return; }
      pintar(r);
      pintar([['']]);
    }
    function bienvenida() {
      salida.innerHTML = '';
      pintar([['Terminal de práctica (las IP son de ejemplo). Escribe help para ver los comandos.']]);
      if (averia !== 'ok') pintar([['🔧 Hay una avería escondida en esta red.', 'mal']]);
      pintar([['']]);
    }
    linea.addEventListener('submit', e => {
      e.preventDefault();
      ejecutar(entrada.value);
      entrada.value = '';
    });
    entrada.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' && historial.length) { pos = Math.max(0, pos - 1); entrada.value = historial[pos]; e.preventDefault(); }
      if (e.key === 'ArrowDown' && historial.length) { pos = Math.min(historial.length, pos + 1); entrada.value = historial[pos] || ''; e.preventDefault(); }
    });
    bOk.addEventListener('click', () => {
      averia = 'ok';
      bOk.classList.add('lab__boton--activo'); bAveria.classList.remove('lab__boton--activo');
      pregunta.hidden = true;
      bienvenida();
    });
    bAveria.addEventListener('click', () => {
      const antes = averia;
      do { averia = azar(['cable', 'router', 'internet', 'dns']); } while (averia === antes);
      bAveria.classList.add('lab__boton--activo'); bOk.classList.remove('lab__boton--activo');
      pregunta.hidden = false;
      estado.textContent = '';
      estado.className = 'lab__estado';
      bienvenida();
    });
    bienvenida();
  }

  /* ============================================================
     2. Las partes de una URL
     ============================================================ */

  function partirURL(texto) {
    const t = texto.trim();
    const m = /^([a-z]+:\/\/)?([^\/?#\s]*)(\/[^?#\s]*)?(\?[^#\s]*)?(#\S*)?$/i.exec(t);
    if (!m) return null;
    const [, protocolo = '', host = '', ruta = '', query = '', frag = ''] = m;
    const trozos = host.split('.');
    let sub = '', dominio = host;
    if (trozos.length >= 3) { sub = trozos[0] + '.'; dominio = trozos.slice(1).join('.'); }
    return { protocolo, sub, dominio, ruta, query, frag };
  }

  function labUrl(caja) {
    cabecera(caja);
    const fila = el('div', 'lab__fila');
    const etiqueta = el('label', 'lab__nota', 'URL:');
    const entrada = el('input', 'lab__entrada');
    entrada.type = 'text';
    entrada.spellcheck = false;
    entrada.setAttribute('autocapitalize', 'off');
    entrada.setAttribute('translate', 'no');
    const id = 'lab-url-' + Math.random().toString(36).slice(2, 7);
    entrada.id = id;
    etiqueta.htmlFor = id;
    entrada.value = caja.dataset.valor || 'https://www.tienda.com/zapatillas/running?color=azul&talla=42#opiniones';
    fila.appendChild(etiqueta);
    fila.appendChild(entrada);
    caja.appendChild(fila);

    const ejemplos = el('div', 'lab__fila lab__fila--atajos');
    ejemplos.appendChild(el('span', 'lab__nota', 'Prueba:'));
    [
      'https://es.wikipedia.org/wiki/Internet',
      'https://www.google.com/search?q=gatos',
      'http://iesramonllull.net',
      'https://www.youtube.com/watch?v=abc123&t=60',
      'https://asignaturas.profesorjamon.workers.dev/tema.html?id=sesion-4-url-http-basico#seccion-2',
    ].forEach(u => {
      const b = boton(u.replace(/^https?:\/\//, '').slice(0, 28) + (u.length > 36 ? '…' : ''), 'lab__boton lab__boton--codigo');
      b.setAttribute('translate', 'no');
      b.title = u;
      b.addEventListener('click', () => { entrada.value = u; pintar(); });
      ejemplos.appendChild(b);
    });
    caja.appendChild(ejemplos);

    const tira = el('div', 'lab__url');
    tira.setAttribute('translate', 'no');
    tira.setAttribute('aria-hidden', 'true');
    caja.appendChild(tira);
    const tabla = el('table', 'lab__tabla');
    caja.appendChild(tabla);

    const PARTES = [
      ['protocolo', 'Protocolo', 'Cómo hablan navegador y servidor. https = cifrado.'],
      ['sub', 'Subdominio', 'Una parte concreta dentro del dominio (www, es, blog…).'],
      ['dominio', 'Dominio', 'El nombre que el DNS traduce a una IP.'],
      ['ruta', 'Ruta', 'Qué página o archivo pides dentro del servidor.'],
      ['query', 'Parámetros', 'Variaciones de la misma página: clave=valor, separados por &.'],
      ['frag', 'Fragmento', 'Salta a un punto de la página. NO se envía al servidor.'],
    ];

    function pintar() {
      const p = partirURL(entrada.value);
      tira.innerHTML = '';
      tabla.innerHTML = '';
      if (!p || !p.dominio) {
        tira.appendChild(el('span', 'lab__aviso', 'Escribe una URL entera, por ejemplo https://www.google.com'));
        return;
      }
      const cab = tabla.insertRow();
      ['Parte', 'En tu URL', 'Para qué sirve'].forEach(t => { const th = el('th', null, t); cab.appendChild(th); });
      PARTES.forEach(([k, nombre, desc]) => {
        const v = p[k];
        if (v) {
          const s = el('span', 'lab__parte lab__parte--' + k, v);
          s.title = nombre;
          tira.appendChild(s);
        }
        const tr = tabla.insertRow();
        const td1 = tr.insertCell(); td1.appendChild(el('span', 'lab__chip lab__parte--' + k, nombre));
        const td2 = tr.insertCell(); td2.setAttribute('translate', 'no');
        if (!v) { td2.appendChild(el('span', 'lab__vacio', k === 'protocolo' ? '(falta: el navegador pondrá https://)' : '(no tiene)')); }
        else if (k === 'query') {
          td2.appendChild(el('code', null, v));
          v.slice(1).split('&').filter(Boolean).forEach(par => {
            const [cl, va = ''] = par.split('=');
            const d = el('div', 'lab__par');
            d.appendChild(el('span', 'lab__clave', cl));
            d.appendChild(document.createTextNode(' = '));
            d.appendChild(el('span', 'lab__valor', decodeURIComponent(va.replace(/\+/g, ' ')) || '(vacío)'));
            td2.appendChild(d);
          });
        } else td2.appendChild(el('code', null, v));
        const td3 = tr.insertCell();
        td3.textContent = desc + (k === 'protocolo' && v.toLowerCase() === 'http://' ? ' ⚠ Esta va sin cifrar.' : '');
      });
    }
    entrada.addEventListener('input', pintar);
    pintar();
  }

  /* ============================================================
     3. Petición y respuesta: un servidor de práctica
     ============================================================ */

  const SERVIDOR = 'pixelkart.es';
  const PAGINAS = {
    '/': ['Pixel Kart', 'El juego de karts más rápido del instituto.'],
    '/index.html': ['Pixel Kart', 'El juego de karts más rápido del instituto.'],
    '/circuitos.html': ['Circuitos', 'Volcán, Playa Pixel y Ciudad Neón.'],
    '/personajes.html': ['Personajes', 'Turbo Rex, Chispa y Nube Veloz.'],
    '/img/logo.png': ['(imagen) logo.png', 'Una imagen: el servidor manda el archivo.'],
    '/buscar': ['Resultados de la búsqueda', ''],
  };
  const ROTAS = ['/tienda'];

  function labPeticion(caja) {
    cabecera(caja);
    caja.appendChild(el('p', 'lab__nota', `Este servidor de práctica se llama ${SERVIDOR} y tiene: /index.html, /circuitos.html, /personajes.html, /img/logo.png y /buscar?q=… La tienda (/tienda) está rota.`));
    const fila = el('form', 'lab__fila');
    const entrada = el('input', 'lab__entrada');
    entrada.type = 'text';
    entrada.spellcheck = false;
    entrada.setAttribute('autocapitalize', 'off');
    entrada.setAttribute('translate', 'no');
    entrada.setAttribute('aria-label', 'URL que pides');
    entrada.value = 'https://pixelkart.es/circuitos.html';
    const ir = boton('Pedir la página →', 'lab__boton lab__boton--activo');
    ir.type = 'submit';
    fila.appendChild(entrada);
    fila.appendChild(ir);
    caja.appendChild(fila);

    const ejemplos = el('div', 'lab__fila lab__fila--atajos');
    ejemplos.appendChild(el('span', 'lab__nota', 'Prueba:'));
    ['https://pixelkart.es/personajes.html', 'https://pixelkart.es/Circuitos.html', 'http://pixelkart.es/', 'https://pixelkart.es/tienda', 'https://pixelkart.es/buscar?q=volcan#resultados', 'https://pixelkart.es/pilotos.html'].forEach(u => {
      const b = boton(u.replace('https://', '').replace('http://', 'http://'), 'lab__boton lab__boton--codigo');
      b.setAttribute('translate', 'no');
      b.addEventListener('click', () => { entrada.value = u; pedir(); });
      ejemplos.appendChild(b);
    });
    caja.appendChild(ejemplos);

    const charla = el('div', 'lab__charla');
    charla.setAttribute('aria-live', 'polite');
    caja.appendChild(charla);

    function mensaje(de, texto, codigo) {
      const m = el('div', 'lab__msg lab__msg--' + de);
      m.appendChild(el('span', 'lab__msg-quien', de === 'nav' ? '🖥 Tu navegador' : '🗄 Servidor ' + SERVIDOR));
      const t = el('div', 'lab__msg-texto');
      t.setAttribute('translate', 'no');
      t.textContent = texto;
      if (codigo) t.prepend(el('span', 'lab__codigo lab__codigo--' + String(codigo)[0], String(codigo)));
      m.appendChild(t);
      charla.appendChild(m);
    }
    function nota(texto) { charla.appendChild(el('p', 'lab__nota lab__nota--charla', texto)); }

    function pedir() {
      charla.innerHTML = '';
      let u = entrada.value.trim();
      if (!/^[a-z]+:\/\//i.test(u)) u = 'https://' + u;
      const m = /^([a-z]+):\/\/([^\/?#]+)([^?#]*)(\?[^#]*)?(#.*)?$/i.exec(u);
      if (!m) { nota('Esa URL no está bien escrita.'); return; }
      let [, proto, host, ruta, query = '', frag = ''] = m;
      host = host.toLowerCase();
      if (!ruta) ruta = '/';
      if (host !== SERVIDOR && host !== 'www.' + SERVIDOR) {
        nota(`🔎 El DNS no encuentra «${host}» en este laboratorio: aquí solo existe ${SERVIDOR}. (En Internet de verdad saldría «No se puede acceder a este sitio».)`);
        return;
      }
      if (proto.toLowerCase() === 'http') {
        mensaje('nav', `GET ${ruta}${query}   (por http://, sin cifrar)`);
        mensaje('srv', `Moved Permanently → vuelve a pedirlo en https://${SERVIDOR}${ruta}${query}`, 301);
        nota('El servidor te redirige solo a la versión segura. El navegador repite la petición:');
      }
      mensaje('nav', `GET ${ruta}${query}`);
      if (frag) nota(`👀 El ${frag} no ha viajado: el fragmento se queda en el navegador, que lo usa para saltar a esa parte cuando llegue la página.`);
      if (ROTAS.includes(ruta)) {
        mensaje('srv', 'Internal Server Error: el servidor ha recibido la petición, pero se ha roto algo al prepararla.', 500);
        return;
      }
      const pag = PAGINAS[ruta];
      if (!pag) {
        mensaje('srv', `Not Found: aquí no hay nada que se llame ${ruta}.` + (PAGINAS[ruta.toLowerCase()] ? ' (Ojo: con minúsculas sí existe. Las rutas distinguen mayúsculas.)' : ''), 404);
        return;
      }
      mensaje('srv', 'OK: aquí la tienes.', 200);
      const vista = el('div', 'lab__pagina');
      const barra = el('div', 'lab__pagina-barra');
      barra.setAttribute('translate', 'no');
      barra.textContent = '🔒 ' + SERVIDOR + ruta + query + frag;
      vista.appendChild(barra);
      vista.appendChild(el('p', 'lab__pagina-titulo', pag[0]));
      let texto = pag[1];
      if (ruta === '/buscar') {
        const q = new URLSearchParams(query).get('q') || '';
        texto = q ? `Has buscado «${q}». El servidor ha leído el parámetro q=${q}.` : 'No has buscado nada: falta ?q=… en la URL.';
      }
      if (texto) vista.appendChild(el('p', 'lab__pagina-texto', texto));
      charla.appendChild(vista);
    }
    fila.addEventListener('submit', e => { e.preventDefault(); pedir(); });
    pedir();
  }

  /* ============================================================
     4. De la URL a la pantalla, con los tres ingredientes
     ============================================================ */

  function labViaje(caja) {
    cabecera(caja);
    const fila = el('div', 'lab__fila');
    const entrada = el('input', 'lab__entrada');
    entrada.type = 'text';
    entrada.spellcheck = false;
    entrada.setAttribute('translate', 'no');
    entrada.setAttribute('aria-label', 'URL de la web');
    entrada.value = 'https://pixelkart.es/circuitos.html';
    fila.appendChild(entrada);
    caja.appendChild(fila);

    const ingr = el('fieldset', 'lab__ingredientes');
    ingr.appendChild(el('legend', null, 'Los tres ingredientes de la web (quita uno y mira qué pasa):'));
    const casillas = {};
    [['dominio', 'Dominio registrado'], ['hosting', 'Hosting: el servidor está encendido'], ['https', 'Certificado HTTPS en vigor']].forEach(([k, t]) => {
      const l = el('label', 'lab__casilla');
      const c = el('input');
      c.type = 'checkbox';
      c.checked = true;
      casillas[k] = c;
      l.appendChild(c);
      l.appendChild(document.createTextNode(' ' + t));
      ingr.appendChild(l);
    });
    caja.appendChild(ingr);

    const mandos = el('div', 'lab__fila');
    const bPaso = boton('Siguiente paso ›', 'lab__boton lab__boton--activo');
    const bTodo = boton('Ver todo');
    const bOtra = boton('↺ Empezar otra vez');
    mandos.appendChild(bPaso); mandos.appendChild(bTodo); mandos.appendChild(bOtra);
    caja.appendChild(mandos);

    const lista = el('ol', 'lab__pasos');
    lista.setAttribute('aria-live', 'polite');
    caja.appendChild(lista);

    let pasos = [];
    let mostrados = 0;

    function calcular() {
      let u = entrada.value.trim();
      if (!/^[a-z]+:\/\//i.test(u)) u = 'https://' + u;
      const m = /^([a-z]+):\/\/([^\/?#]+)([^#]*)/i.exec(u) || [];
      const proto = (m[1] || 'https').toLowerCase();
      const host = (m[2] || 'pixelkart.es').toLowerCase();
      const ruta = m[3] || '/';
      const ip = '93.184.' + (host.length * 7 % 200 + 10) + '.' + (host.length * 13 % 200 + 20);
      const P = [];
      P.push({ i: '⌨', t: `Escribes ${u} y pulsas Intro.` });
      if (!casillas.dominio.checked) {
        P.push({ i: '🔎', t: `El navegador pregunta al DNS: «¿qué IP tiene ${host}?». El DNS contesta: ese nombre no existe.`, mal: true });
        P.push({ i: '🚫', t: 'En pantalla: «No se puede acceder a este sitio». Sin dominio, nadie te encuentra por el nombre.', mal: true, fin: true });
        return P;
      }
      P.push({ i: '🔎', t: `El navegador pregunta al DNS: «¿qué IP tiene ${host}?». Respuesta: ${ip}.` });
      if (!casillas.hosting.checked) {
        P.push({ i: '📡', t: `El navegador llama a ${ip}… y no contesta nadie: no hay ningún servidor encendido con la web.`, mal: true });
        P.push({ i: '🚫', t: 'En pantalla: «Se ha agotado el tiempo de espera». El nombre existe, pero la web no está en ningún sitio.', mal: true, fin: true });
        return P;
      }
      P.push({ i: '📡', t: `El servidor de hosting que hay en ${ip} contesta: está encendido las 24 horas.` });
      if (proto === 'http') {
        P.push({ i: '⚠', t: 'La conexión va por http://, sin cifrar. El navegador avisará de que «No es seguro».', aviso: true });
      } else if (!casillas.https.checked) {
        P.push({ i: '⚠', t: 'El certificado HTTPS ha caducado. El navegador para y enseña «La conexión no es privada». Si sigues, ya no hay garantía de que la conexión vaya cifrada.', aviso: true });
      } else {
        P.push({ i: '🔒', t: 'Comprueban el certificado: es válido. A partir de aquí, todo viaja cifrado.' });
      }
      P.push({ i: '📨', t: `El navegador pide la página: GET ${ruta}` });
      P.push({ i: '✅', t: 'El servidor responde 200 OK y manda el HTML, el CSS y las imágenes.' });
      P.push({ i: '🖥', t: `El navegador lo dibuja en pantalla. En la barra: ${proto === 'https' && casillas.https.checked ? '🔒 ' : '⚠ No es seguro · '}${host}${ruta}`, fin: true, ok: true });
      return P;
    }
    function pintar() {
      lista.innerHTML = '';
      pasos.slice(0, mostrados).forEach((p, n) => {
        const li = el('li', 'lab__paso' + (p.mal ? ' lab__paso--mal' : p.aviso ? ' lab__paso--aviso' : p.ok ? ' lab__paso--ok' : '') + (n === mostrados - 1 ? ' lab__paso--nuevo' : ''));
        const ic = el('span', 'lab__paso-icono', p.i);
        ic.setAttribute('aria-hidden', 'true');
        li.appendChild(ic);
        li.appendChild(el('span', 'lab__paso-texto', p.t));
        lista.appendChild(li);
      });
      const acabado = mostrados >= pasos.length;
      bPaso.disabled = acabado;
      bTodo.disabled = acabado;
    }
    function reiniciar() { pasos = calcular(); mostrados = 1; pintar(); }
    bPaso.addEventListener('click', () => { mostrados = Math.min(pasos.length, mostrados + 1); pintar(); });
    bTodo.addEventListener('click', () => { mostrados = pasos.length; pintar(); });
    bOtra.addEventListener('click', reiniciar);
    entrada.addEventListener('change', reiniciar);
    Object.values(casillas).forEach(c => c.addEventListener('change', reiniciar));
    reiniciar();
  }

  /* ---------- arranque ---------- */

  const LABS = { terminal: labTerminal, url: labUrl, peticion: labPeticion, viaje: labViaje };

  function iniciarLaboratorios(raiz) {
    (raiz || document).querySelectorAll('.lab[data-lab]').forEach(caja => {
      if (caja.dataset.listo) return;
      const f = LABS[caja.dataset.lab];
      if (!f) return;
      caja.dataset.listo = 'si';
      caja.setAttribute('role', 'group');
      caja.innerHTML = '';
      f(caja);
    });
  }
  if (typeof window !== 'undefined') window.iniciarLaboratorios = iniciarLaboratorios;
  if (typeof module !== 'undefined' && module.exports) module.exports = { simular, partirURL };
})();
