/* ============================================================
   Laboratorios de redes (Instalaciones) — js/lab-redes.js
   Cargado DESPUÉS de js/laboratorios.js (usa registrarLab y LAB).

   capas-osi   UT1 S5 (17/11/2026, idea de Protocol Explorer): las
               siete capas apiladas. Al tocar una capa, qué hace, sus
               protocolos, el aparato que trabaja en ella y cómo se
               llaman los datos. Al tocar un protocolo o un aparato, se
               enciende su capa. «Ponte a prueba»: sale un protocolo o
               un aparato y hay que tocar su capa.
               Los datos son los de la tabla «Qué hace cada capa» de
               la sesión: si cambia la tabla, cambiar también CAPAS.
   HTML: <div class="lab" data-lab="capas-osi" aria-label="…"></div>
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarLab !== 'function' || !window.LAB) return;
  const { el, boton, cabecera } = window.LAB;

  const CAPAS = {
    7: { nombre: 'Aplicación', hace: 'Es la que toca el usuario: el programa que pide o entrega la información.',
         prot: 'HTTP / HTTPS (web), SMTP (enviar correo), POP3 e IMAP (recibir correo), FTP / FTPS (archivos)', datos: 'Datos', aparato: '—' },
    6: { nombre: 'Presentación', hace: 'El formato de los datos: codificación, compresión.',
         prot: 'No tiene protocolos destacables.', datos: 'Datos', aparato: '—' },
    5: { nombre: 'Sesión', hace: 'Abre, mantiene y cierra la conversación entre las dos partes.',
         prot: 'SSL y su sucesor TLS, que cifran lo que se transmite', datos: 'Datos', aparato: '—' },
    4: { nombre: 'Transporte', hace: 'Cómo se trocea y si se garantiza o no la entrega.',
         prot: 'TCP (fiable, con confirmación) y UDP (rápido, sin confirmación)', datos: 'Segmento', aparato: '—' },
    3: { nombre: 'Red', hace: 'Llevar la información de origen a destino por la mejor ruta, aunque haya que cruzar varias redes. Da a cada equipo una dirección IP.',
         prot: 'IP', datos: 'Paquete', aparato: 'Router' },
    2: { nombre: 'Enlace de datos', hace: 'Entregar dentro de la misma red, usando direcciones MAC.',
         prot: 'Ethernet, Fast Ethernet, Gigabit Ethernet; ARP', datos: 'Trama', aparato: 'Switch' },
    1: { nombre: 'Física', hace: 'El medio en sí: cable, fibra u ondas, conectores, voltajes.',
         prot: 'El UTP, el RJ-45, la señal eléctrica', datos: 'Bits (ceros y unos)', aparato: 'El cable' }
  };
  /* Protocolos y aparatos: [nombre, capa, explicación al fallar]. */
  const COSAS = [
    ['HTTP', 7, 'Es el protocolo de la web: lo usa el navegador, el programa del usuario.'],
    ['HTTPS', 7, 'Es HTTP con cifrado: sigue siendo de la capa de aplicación.'],
    ['SMTP', 7, 'Sirve para enviar correo: lo usa el programa de correo.'],
    ['POP3', 7, 'Sirve para recibir correo: lo usa el programa de correo.'],
    ['IMAP', 7, 'Sirve para recibir correo: lo usa el programa de correo.'],
    ['FTP', 7, 'Sirve para pasar archivos: lo usa un programa.'],
    ['TLS', 5, 'Abre la conversación cifrada entre las dos partes.'],
    ['TCP', 4, 'Trocea y garantiza la entrega: es transporte.'],
    ['UDP', 4, 'Trocea sin garantizar la entrega: también es transporte.'],
    ['IP', 3, 'Lleva el paquete de una red a otra con la dirección IP.'],
    ['Router', 3, 'Mira la IP de destino para elegir el camino.'],
    ['Ethernet', 2, 'Entrega dentro de la misma red con direcciones MAC.'],
    ['ARP', 2, 'Busca la MAC de una IP: es la bisagra entre la capa 3 y la 2, y trabaja en la 2.'],
    ['Switch', 2, 'Mira la MAC de destino para entregar dentro de la red.'],
    ['Cable UTP', 1, 'Es el medio por el que viajan los bits.'],
    ['RJ-45', 1, 'Es un conector: el medio físico.'],
    ['Señal eléctrica', 1, 'Son los ceros y unos en el cable.']
  ];

  window.registrarLab('capas-osi', function (caja) {
    cabecera(caja, 'Toca y mira');
    const cuerpo = el('div', 'osi');
    const pila = el('div', 'osi__pila');
    pila.setAttribute('role', 'group');
    pila.setAttribute('aria-label', 'Las siete capas');
    const panel = el('div', 'osi__panel');
    const vivo = el('div', 'osi__vivo');
    vivo.setAttribute('aria-live', 'polite');
    panel.appendChild(vivo);
    cuerpo.append(pila, panel);

    const botones = {};
    [7, 6, 5, 4, 3, 2, 1].forEach(n => {
      const b = boton('', 'lab__boton osi__capa');
      b.innerHTML = '<span class="osi__num" translate="no">' + n + '</span> ' + CAPAS[n].nombre;
      b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => (modo === 'prueba' ? responde(n) : elige(n)));
      botones[n] = b;
      pila.appendChild(b);
    });

    const chipsTit = el('p', 'lab__nota', 'Toca un protocolo o un aparato para ver su capa:');
    const chips = el('div', 'lab__fila osi__chips');
    const chipBot = {};
    COSAS.forEach(([n, c]) => {
      const b = boton(n, 'lab__boton osi__chip');
      b.setAttribute('translate', 'no');
      b.addEventListener('click', () => { modo = 'explorar'; ponModo(); elige(c, n); });
      chipBot[n] = b;
      chips.appendChild(b);
    });

    const pie = el('div', 'lab__fila osi__pie');
    const bPrueba = boton('Ponte a prueba', 'lab__boton');
    const bExplorar = boton('Explorar', 'lab__boton');
    pie.append(bExplorar, bPrueba);

    caja.append(cuerpo, chipsTit, chips, pie);

    let modo = 'explorar';
    let pregunta = null;
    let aciertos = 0, intentos = 0;

    function marca(n, cosa) {
      Object.keys(botones).forEach(k => {
        const on = Number(k) === n;
        botones[k].classList.toggle('lab__boton--activo', on);
        botones[k].setAttribute('aria-pressed', String(on));
      });
      Object.keys(chipBot).forEach(k => chipBot[k].classList.toggle('lab__boton--activo', k === cosa));
    }
    function elige(n, cosa) {
      const c = CAPAS[n];
      marca(n, cosa);
      vivo.innerHTML = '';
      if (cosa) vivo.appendChild(el('p', 'osi__aviso', cosa + ' trabaja en la capa ' + n + ': ' + c.nombre + '.'));
      vivo.appendChild(el('p', 'osi__titulo', 'Capa ' + n + ' · ' + c.nombre));
      const dl = el('dl', 'osi__datos');
      [['Qué hace', c.hace], ['Protocolos y ejemplos', c.prot], ['Los datos se llaman', c.datos], ['Aparato que trabaja aquí', c.aparato]].forEach(([t, v]) => {
        dl.appendChild(el('dt', '', t));
        dl.appendChild(el('dd', '', v));
      });
      vivo.appendChild(dl);
    }
    function nuevaPregunta() {
      let q;
      do { q = COSAS[Math.floor(Math.random() * COSAS.length)]; } while (pregunta && q[0] === pregunta[0] && COSAS.length > 1);
      pregunta = q;
      marca(0, null);
      vivo.innerHTML = '';
      vivo.appendChild(el('p', 'osi__titulo', '¿En qué capa trabaja…'));
      const g = el('p', 'osi__pregunta', q[0] + '?');
      g.setAttribute('translate', 'no');
      vivo.appendChild(g);
      vivo.appendChild(el('p', 'lab__nota', 'Toca su capa en la pila. Llevas ' + aciertos + ' de ' + intentos + '.'));
    }
    function responde(n) {
      if (!pregunta) return;
      intentos++;
      const bien = n === pregunta[1];
      if (bien) aciertos++;
      marca(pregunta[1], null);
      vivo.innerHTML = '';
      vivo.appendChild(el('p', bien ? 'osi__bien' : 'osi__mal',
        bien ? '✓ Bien: ' + pregunta[0] + ' está en la capa ' + pregunta[1] + ', ' + CAPAS[pregunta[1]].nombre + '.'
             : '✗ No es la ' + n + '. ' + pregunta[0] + ' está en la capa ' + pregunta[1] + ', ' + CAPAS[pregunta[1]].nombre + '.'));
      vivo.appendChild(el('p', '', pregunta[2]));
      vivo.appendChild(el('p', 'lab__nota', 'Llevas ' + aciertos + ' de ' + intentos + '.'));
      const otra = boton('Otra', 'lab__boton');
      otra.addEventListener('click', nuevaPregunta);
      vivo.appendChild(otra);
      pregunta = null;
    }
    function ponModo() {
      bPrueba.classList.toggle('lab__boton--activo', modo === 'prueba');
      bExplorar.classList.toggle('lab__boton--activo', modo === 'explorar');
      bPrueba.setAttribute('aria-pressed', String(modo === 'prueba'));
      bExplorar.setAttribute('aria-pressed', String(modo === 'explorar'));
      chipsTit.hidden = modo === 'prueba';
      chips.hidden = modo === 'prueba';
    }
    bPrueba.addEventListener('click', () => { modo = 'prueba'; aciertos = 0; intentos = 0; ponModo(); nuevaPregunta(); });
    bExplorar.addEventListener('click', () => { modo = 'explorar'; ponModo(); elige(7); });
    ponModo();
    elige(7);
  });
})();
