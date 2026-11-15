/* ============================================================
   Generadores de la Unidad 6 de Instalaciones (dispositivos de
   interconexión), 13/11/2026.

   Archivo aparte, cargado DESPUÉS de js/generadores.js. Solo añade
   entradas al objeto global GENERADORES.

   mac-salida      tabla MAC + trama → ¿por dónde sale? (un puerto,
                   todos menos el de entrada o se descarta)
   dominios-cuenta red descrita con palabras → dominios de colisión
                   o de difusión
   aparato-funcion qué hace → hub, switch, router, punto de acceso,
                   cortafuegos, proxy o VPN
   aparato-capa    aparato → capa del modelo OSI (1, 2 o 3)
   seguridad-red   situación → cortafuegos, proxy o VPN

   Notación de los ejercicios (decidida por Carles el 13/11/2026,
   como en su presentación): MAC cortas (0A, 0B…: el último byte) y
   puertos Fa1, Fa2… FF = broadcast (FF:FF:FF:FF:FF:FF).
   ============================================================ */

(function () {
  if (typeof GENERADORES === 'undefined') return;

  const elige = (lista) => lista[Math.floor(Math.random() * lista.length)];
  const entre = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  function baraja(lista) {
    const l = lista.slice();
    for (let i = l.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [l[i], l[j]] = [l[j], l[i]];
    }
    return l;
  }

  /* ---------- Tabla MAC: ¿por dónde sale la trama? ---------- */
  const MACS = ['0A', '0B', '0C', '0D', '0E', '0F', '1A', '1B'];
  const TODOS = ['todos menos', 'todos', 'por todos', 'por todos menos el de entrada', 'todos menos el de entrada',
    'inundacion', 'inundación', 'flooding', 'por todos menos por el que entro', 'todos menos por el que entro'];

  function genMacSalida() {
    const puertos = entre(4, 6);
    /* Cada equipo en un puerto; en un puerto puede haber dos (un hub). */
    const macs = baraja(MACS).slice(0, puertos + 1);
    const sitio = {};
    macs.forEach((m, i) => { sitio[m] = 'Fa' + (i < puertos ? i + 1 : entre(1, puertos)); });
    const conocidas = baraja(macs).slice(0, entre(2, Math.min(4, macs.length - 1)));
    const origen = elige(macs);
    const entra = sitio[origen];
    const tipo = elige(['unicast', 'unicast', 'desconocido', 'broadcast', 'descarta']);
    let destino;
    if (tipo === 'broadcast') destino = 'FF';
    else if (tipo === 'unicast') {
      const c = conocidas.filter(m => m !== origen && sitio[m] !== entra);
      destino = c.length ? elige(c) : null;
    } else if (tipo === 'desconocido') {
      const c = macs.filter(m => m !== origen && !conocidas.includes(m));
      destino = c.length ? elige(c) : null;
    } else {
      const c = conocidas.filter(m => m !== origen && sitio[m] === entra);
      destino = c.length ? elige(c) : null;
    }
    if (!destino) return genMacSalida();

    const tabla = conocidas.slice().sort((a, b) => sitio[a].localeCompare(sitio[b]))
      .map(m => `${m}→${sitio[m]}`).join(', ');
    const enunciado = `Tabla: ${tabla}. Trama de ${origen} a ${destino}, entra por ${entra} → ¿por dónde sale?`;
    const aprende = conocidas.includes(origen) ? `${origen} ya estaba en la tabla.` : `Primero apunta ${origen}→${entra}.`;

    if (destino === 'FF') {
      return {
        enunciado, respuesta: `todos menos ${entra}`,
        respuestas: TODOS.concat([`todos menos ${entra}`, 'broadcast', `todos menos el ${entra}`]),
        formato: 'texto',
        pista: `${aprende} FF es broadcast: sale por todos los puertos menos por el que entró (${entra}).`
      };
    }
    if (sitio[destino] === entra && conocidas.includes(destino)) {
      return {
        enunciado, respuesta: 'se descarta',
        respuestas: ['se descarta', 'descarta', 'descartada', 'ninguno', 'por ninguno', 'no sale', 'se filtra'],
        formato: 'texto',
        pista: `${aprende} ${destino} está en ${entra}, el mismo puerto por el que entró: ya le ha llegado por el hub. El switch la descarta.`
      };
    }
    if (conocidas.includes(destino)) {
      return {
        enunciado, respuesta: sitio[destino],
        respuestas: [sitio[destino], sitio[destino].replace('Fa', ''), 'solo ' + sitio[destino], 'por ' + sitio[destino]],
        formato: 'texto',
        pista: `${aprende} ${destino} está en la tabla, en ${sitio[destino]}: sale solo por ahí (unicast).`
      };
    }
    return {
      enunciado, respuesta: `todos menos ${entra}`,
      respuestas: TODOS.concat([`todos menos ${entra}`, `todos menos el ${entra}`]),
      formato: 'texto',
      pista: `${aprende} ${destino} no está en la tabla: inundación, sale por todos menos por ${entra}.`
    };
  }

  /* ---------- Dominios: redes contadas con palabras ---------- */
  function descSwitch(n) { return `un switch con ${n} PC`; }
  function descHub(n) { return `un hub con ${n} PC`; }

  function genDominios() {
    const forma = entre(1, 6);
    let texto, col, dif, pistaC, pistaD;
    if (forma === 1) {
      const n = entre(3, 8);
      texto = `${descSwitch(n)}.`;
      col = n; dif = 1;
      pistaC = `cada boca del switch es un dominio: ${n}.`;
    } else if (forma === 2) {
      const n = entre(3, 8);
      texto = `${descHub(n)}.`;
      col = 1; dif = 1;
      pistaC = 'todo lo que cuelga de un hub es un solo dominio: 1.';
    } else if (forma === 3) {
      const a = entre(2, 5), h = entre(2, 4);
      texto = `un switch con ${a} PC y, en otra boca, ${descHub(h)}.`;
      col = a + 1; dif = 1;
      pistaC = `${a} bocas con un PC, más el hub con todo lo suyo: ${a} + 1 = ${col}.`;
    } else if (forma === 4) {
      const a = entre(2, 5), b = entre(2, 5);
      texto = `un router con dos bocas: en una, ${descSwitch(a)}; en la otra, ${descSwitch(b)}.`;
      col = a + b + 2; dif = 2;
      pistaC = `${a} + ${b} bocas de los switches con PC, más los 2 cables router–switch: ${col}.`;
    } else if (forma === 5) {
      const a = entre(2, 5), h = entre(2, 4);
      texto = `un router con dos bocas: en una, ${descSwitch(a)}; en la otra, ${descHub(h)}.`;
      col = a + 1 + 1; dif = 2;
      pistaC = `${a} PC del switch + su cable al router, y el hub con todo lo suyo (cable al router incluido): ${a} + 1 + 1 = ${col}.`;
    } else {
      const a = entre(2, 4), b = entre(2, 4);
      texto = `dos switches unidos por un cable: uno con ${a} PC y otro con ${b} PC.`;
      col = a + b + 1; dif = 1;
      pistaC = `${a} + ${b} bocas con PC, más el cable entre switches: ${col}.`;
    }
    pistaD = dif === 1 ? 'sin router, toda la red es un solo dominio de difusión.' : 'cada boca del router que se usa es un dominio de difusión: 2.';
    const pide = Math.random() < 0.6 ? 'colision' : 'difusion';
    const r = pide === 'colision' ? col : dif;
    return {
      enunciado: `Red: ${texto} ¿Cuántos dominios de ${pide === 'colision' ? 'colisión' : 'difusión'}?`,
      respuesta: String(r),
      formato: 'numero',
      traducible: true,
      pista: 'Colisión: ' + pistaC + ' Difusión: ' + pistaD
    };
  }

  /* ---------- ¿Qué aparato es? ---------- */
  const FUNCION = [
    ['Repite lo que le llega por todas sus bocas, sin mirar a quién va', 'hub', ['hub', 'concentrador']],
    ['Lee la MAC de destino y envía la trama solo por la boca donde está ese equipo', 'switch', ['switch', 'conmutador']],
    ['Une dos redes distintas y decide por dónde va cada paquete mirando la IP', 'router', ['router', 'enrutador', 'encaminador']],
    ['Es la «puerta de enlace» que ves en ipconfig', 'router', ['router', 'enrutador', 'encaminador']],
    ['Da wifi a una red de cable', 'punto de acceso', ['punto de acceso', 'ap', 'access point']],
    ['Aprende qué MAC hay en cada boca y lo guarda en una tabla', 'switch', ['switch', 'conmutador']],
    ['Con él, dos equipos que hablan a la vez chocan (colisión)', 'hub', ['hub', 'concentrador']],
    ['Para los broadcast: no los deja pasar a la otra red', 'router', ['router', 'enrutador', 'encaminador']],
    ['Deja pasar o bloquea conexiones según unas reglas', 'cortafuegos', ['cortafuegos', 'firewall']],
    ['Hace de intermediario: va a la web por ti y puede bloquear páginas', 'proxy', ['proxy']],
    ['Crea un túnel cifrado para entrar desde casa a la red de la empresa', 'VPN', ['vpn']],
    ['Lleva datos y corriente por el cable hasta una cámara del techo', 'switch PoE', ['switch poe', 'poe']]
  ];
  function genFuncion() {
    const [t, r, rs] = elige(FUNCION);
    return {
      enunciado: `${t} → ¿qué es?`,
      respuesta: r,
      respuestas: rs,
      formato: 'texto',
      traducible: true,
      pista: 'Hub: repite a todos. Switch: mira la MAC y entrega al que toca. Router: une redes y mira la IP. Cortafuegos: reglas. Proxy: intermediario. VPN: túnel cifrado.'
    };
  }

  /* ---------- Capa del modelo OSI ---------- */
  const CAPA = [
    ['Hub (concentrador)', '1', 'Solo repite bits: no lee ninguna dirección.'],
    ['Repetidor de cable', '1', 'Solo regenera la señal: capa 1.'],
    ['Switch', '2', 'Lee la MAC de destino: capa 2.'],
    ['Tarjeta de red', '2', 'Tiene la MAC y arma las tramas: capa 2 (y la 1, el conector).'],
    ['Punto de acceso wifi', '2', 'Une el wifi con el cable como un switch: capa 2.'],
    ['Router', '3', 'Lee la IP de destino y elige el camino: capa 3.'],
    ['Switch de capa 3', '3', 'Es un switch que además enruta: llega a la capa 3.']
  ];
  function genCapa() {
    const [t, r, p] = elige(CAPA);
    return {
      enunciado: `${t} → ¿en qué capa del modelo OSI trabaja?`,
      respuesta: r,
      respuestas: [r, 'capa ' + r, 'la ' + r],
      formato: 'texto',
      traducible: true,
      pista: p + ' Recuerda: capa 1 bits, capa 2 MAC, capa 3 IP.'
    };
  }

  /* ---------- Cortafuegos, proxy o VPN ---------- */
  const SEG = [
    ['El instituto no deja entrar en webs de apuestas desde sus ordenadores', 'proxy', ['proxy']],
    ['Una trabajadora entra desde su casa a los archivos de la oficina, con la conexión cifrada', 'VPN', ['vpn']],
    ['Nadie de Internet puede conectarse a los ordenadores de la oficina si no lo han pedido ellos', 'cortafuegos', ['cortafuegos', 'firewall']],
    ['En el wifi gratis de un aeropuerto, quieres que nadie pueda leer lo que envías', 'VPN', ['vpn']],
    ['Windows bloquea un programa que intenta recibir conexiones de fuera', 'cortafuegos', ['cortafuegos', 'firewall']],
    ['La empresa guarda una copia de las páginas que más se visitan para que carguen antes', 'proxy', ['proxy']],
    ['El servidor de la empresa solo acepta conexiones al puerto de la web (443)', 'cortafuegos', ['cortafuegos', 'firewall']],
    ['La web que visitas ve la IP del intermediario, no la de tu ordenador', 'proxy', ['proxy']]
  ];
  function genSeguridad() {
    const [t, r, rs] = elige(SEG);
    return {
      enunciado: `${t} → ¿cortafuegos, proxy o VPN?`,
      respuesta: r,
      respuestas: rs,
      formato: 'texto',
      traducible: true,
      pista: 'Cortafuegos: reglas que dejan pasar o bloquean conexiones. Proxy: intermediario que va a la web por ti (filtra y guarda copias). VPN: túnel cifrado hasta otra red.'
    };
  }

  GENERADORES['mac-salida'] = genMacSalida;
  GENERADORES['dominios-cuenta'] = genDominios;
  GENERADORES['aparato-funcion'] = genFuncion;
  GENERADORES['aparato-capa'] = genCapa;
  GENERADORES['seguridad-red'] = genSeguridad;
})();
