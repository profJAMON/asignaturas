/* ============================================================
   Animaciones de sistemas inalámbricos (Instalaciones UT5)
   js/anim-inalambrico.js — cargado DESPUÉS de js/anim-iso.js.
   Estilo isométrico (ISO.animacion), desde el 10/11/2026.

   wifi-acceso      UT5 S1 · FTTH (fibra hasta casa) frente a HFC
                    (fibra hasta el barrio y coaxial hasta casa).
   wifi-bandas      UT5 S4 · 2,4 GHz llega más lejos y atraviesa
                    paredes; 5 GHz es más rápida pero llega menos; el
                    microondas molesta en 2,4 GHz.
   wifi-cifrado     UT5 S6 · red abierta: el espía lee la contraseña;
                    con WPA2/WPA3 solo ve datos cifrados; WEP se rompe.
   wifi-poe         UT5 S7 · por el mismo cable van los datos y la
                    corriente (PoE); sin switch PoE, el AP no enciende.
   wifi-repetidor   UT5 S8 · repetidor donde la señal ya es débil
                    (mal) o a mitad de camino (bien); repite por turnos
                    y la velocidad baja.
   ============================================================ */

(function () {
  'use strict';
  if (!window.ISO || !window.ANIM) return;
  const ISO = window.ISO;
  const el = window.ANIM.el;
  const ruta = (...p) => p;

  /* Casa sencilla: caja con tejado. */
  function casa(k, x, y, rotulo) {
    const g = el('g', {}, k.svg);
    k.sombra(g, x, y + 16, 50, 16);
    k.caja(g, x, y + 8, 40, 20, 46);
    el('polygon', { points: `${x - 40},${y - 38} ${x},${y - 76} ${x + 40},${y - 38} ${x},${y - 18}`, class: 'i-cara-sup' }, g);
    if (rotulo) k.texto(g, x, y + 48, rotulo, 'i-t i-negrita');
    return g;
  }

  /* ============================================================
     wifi-acceso · UT5 S1
     ============================================================ */
  (function () {
    const C = [90, 200];
    const A = [560, 110], B = [560, 290], N = [330, 290];
    ISO.animacion('wifi-acceso', {
      titulo: 'Fibra hasta casa (FTTH) o fibra hasta el barrio y coaxial hasta casa (HFC)',
      msMovimiento: 1500,
      dibujar(k) {
        k.cable('fa', [C[0] + 30, C[1] - 20], [A[0] - 50, A[1]], [C[0] + 120, A[1]]);
        k.cable('fn', [C[0] + 30, C[1] + 10], [N[0] - 20, N[1]], [C[0] + 120, N[1]]);
        k.cable('co', [N[0] + 20, N[1]], [B[0] - 50, B[1]]);
        k.servidor(k.svg, C[0], C[1], 'Central');
        casa(k, A[0], A[1] - 10, 'Casa A');
        casa(k, B[0], B[1] - 10, 'Casa B');
        el('rect', { x: N[0] - 16, y: N[1] - 18, width: 32, height: 36, rx: 6, class: 'i-cara-sup' }, k.svg);
        k.texto(k.svg, N[0], N[1] - 30, 'Nodo', 'i-t i-tenue');
        k.pastilla(k.svg, 300, A[1] - 34, 'Fibra hasta casa: FTTH', { claseTexto: 'i-t i-negrita' });
        k.nombre('rFibra', k.texto(k.svg, 230, N[1] + 34, 'fibra', 'i-t i-tenue'));
        k.nombre('rCoax', k.texto(k.svg, 445, N[1] + 34, 'coaxial', 'i-t i-tenue'));
        k.nombre('hfc', k.pastilla(k.svg, 380, 200, 'Fibra + coaxial: HFC', { claseTexto: 'i-t i-negrita' }));
        k.nombre('okA', k.marca(k.svg, A[0] + 54, A[1] - 50, true));
        k.nombre('ruido', k.bocadillo(k.svg, 450, 220, 'Interferencias', [450, N[1] - 6]));
      },
      pasos: [
        { texto: 'Dos casas del mismo pueblo. La operadora les lleva Internet desde su <strong>central</strong>.' },
        { texto: '<strong>FTTH</strong>: la fibra va de la central <strong>hasta dentro de casa</strong>, a la ONT.',
          ver: ['okA'], luz: ['fa'],
          paq: [{ id: 'a', ruta: ruta([C[0] + 30, C[1] - 20], [C[0] + 120, A[1]], [A[0] - 50, A[1]]), chips: ['luz'], color: 'lima' }] },
        { texto: '<strong>HFC</strong>: la fibra llega solo hasta un <strong>nodo del barrio</strong>…',
          ver: ['hfc', 'rFibra'], luz: ['fn'],
          paq: [{ id: 'b', ruta: ruta([C[0] + 30, C[1] + 10], [C[0] + 120, N[1]], [N[0] - 20, N[1]]), chips: ['luz'], color: 'lima' }] },
        { texto: '…y desde el nodo hasta casa sigue por <strong>cable coaxial</strong>, con señal eléctrica.',
          ver: ['hfc', 'rFibra', 'rCoax'], luz: ['co'],
          paq: [{ id: 'c', ruta: ruta([N[0] + 20, N[1]], [B[0] - 50, B[1]]), chips: ['eléctrica'], color: 'ambar' }] },
        { texto: 'Al coaxial le afectan las <strong>interferencias</strong> y va más lento. Por eso hoy las operadoras ponen fibra hasta casa.',
          ver: ['hfc', 'rFibra', 'rCoax', 'ruido'], luz: ['co'],
          paq: [{ id: 'c', ruta: ruta([N[0] + 20, N[1]], [B[0] - 50, B[1]]) }] }
      ]
    });
  })();

  /* ============================================================
     wifi-bandas · UT5 S4
     ============================================================ */
  (function () {
    const R = [130, 220], CON = [290, 230], PARED = 420, LEJOS = [560, 230], MICRO = [60, 110];
    ISO.animacion('wifi-bandas', {
      titulo: 'Las bandas de 2,4 GHz y 5 GHz: hasta dónde llega cada una',
      msMovimiento: 1600,
      dibujar(k) {
        el('rect', { x: PARED - 8, y: 120, width: 16, height: 170, rx: 4, class: 'i-cara-izq' }, k.svg);
        k.texto(k.svg, PARED, 112, 'Pared', 'i-t i-tenue');
        k.router(k.svg, R[0], R[1], 'Router');
        k.pc(k.svg, CON[0], CON[1] - 10, 'Consola');
        k.pc(k.svg, LEJOS[0], LEJOS[1] - 10, 'Jardín');
        k.nombre('micro', k.caja(k.svg, MICRO[0], MICRO[1], 34, 17, 24).grupo);
        k.nombre('microT', k.texto(k.svg, MICRO[0], MICRO[1] + 40, 'Microondas', 'i-t i-tenue'));
        k.nombre('b24', k.pastilla(k.svg, 330, 40, '2,4 GHz: más alcance', { claseTexto: 'i-t i-negrita' }));
        k.nombre('b5', k.pastilla(k.svg, 330, 40, '5 GHz: más velocidad', { claseTexto: 'i-t i-negrita' }));
        k.nombre('okLejos', k.marca(k.svg, LEJOS[0] + 44, LEJOS[1] - 70, true));
        k.nombre('okCon', k.marca(k.svg, CON[0] + 44, CON[1] - 70, true));
        k.nombre('choque', k.bocadillo(k.svg, 330, 110, 'Interferencias en 2,4 GHz', [150, 170]));
      },
      pasos: [
        { texto: 'Un router con dos bandas: <strong>2,4 GHz</strong> y <strong>5 GHz</strong>. Una consola cerca y un móvil en el jardín, detrás de una pared.' },
        { texto: '<strong>2,4 GHz</strong> llega más lejos y <strong>atraviesa mejor</strong> las paredes: el móvil del jardín tiene señal.',
          ver: ['b24', 'okLejos'],
          paq: [{ id: 'l', ruta: ruta([R[0] + 30, R[1] - 20], [LEJOS[0] - 30, LEJOS[1] - 30]), chips: ['2,4 GHz'], color: 'ambar' }] },
        { texto: '<strong>5 GHz</strong> es más rápida: perfecta para la consola, que está <strong>cerca</strong> del router.',
          ver: ['b5', 'okCon'],
          paq: [{ id: 'c', ruta: ruta([R[0] + 30, R[1] - 20], [CON[0] - 30, CON[1] - 30]), chips: ['5 GHz'], color: 'azul' }] },
        { texto: 'Pero 5 GHz llega menos y <strong>se queda en la pared</strong>: al jardín no llega.',
          ver: ['b5'],
          paq: [{ id: 'm', ruta: ruta([R[0] + 30, R[1] - 20], [R[0] + 30 + (PARED - R[0] - 40) / 0.55, LEJOS[1] - 30]), chips: ['5 GHz'], color: 'azul', cae: true }] },
        { texto: 'El <strong>microondas</strong> también trabaja en 2,4 GHz: cuando está encendido, el wifi de esa banda va peor.',
          ver: ['b24', 'micro', 'microT', 'choque'],
          paq: [{ id: 'mo', ruta: ruta([MICRO[0] + 20, MICRO[1]], [R[0] - 10, R[1] - 40]), chips: ['ruido'], color: 'rosa' }] },
        { texto: 'Regla: <strong>cerca y mucha velocidad, 5 GHz</strong>. <strong>Lejos o detrás de paredes, 2,4 GHz</strong>.',
          ver: ['okLejos', 'okCon'] }
      ]
    });
  })();

  /* ============================================================
     wifi-cifrado · UT5 S6
     ============================================================ */
  (function () {
    const PC = [120, 150], RT = [520, 150], ES = [330, 300];
    const viaje = ruta([PC[0] + 40, PC[1] - 20], [RT[0] - 40, RT[1] - 20]);
    const copia = ruta([330, PC[1] - 20], [ES[0], ES[1] - 60]);
    ISO.animacion('wifi-cifrado', {
      titulo: 'Wifi abierto o cifrado: lo que ve quien escucha',
      msMovimiento: 1600,
      dibujar(k) {
        k.pc(k.svg, PC[0], PC[1], 'Tu portátil');
        k.router(k.svg, RT[0], RT[1], 'Router');
        k.pc(k.svg, ES[0], ES[1] - 20, 'Alguien escuchando');
        k.nombre('abierta', k.pastilla(k.svg, 330, 40, 'Red abierta, sin cifrar', { claseTexto: 'i-t i-negrita' }));
        k.nombre('wpa', k.pastilla(k.svg, 330, 40, 'Red con WPA2 o WPA3', { claseTexto: 'i-t i-negrita' }));
        k.nombre('wep', k.pastilla(k.svg, 330, 40, 'Red con WEP (antiguo)', { claseTexto: 'i-t i-negrita' }));
        k.nombre('roba', k.bocadillo(k.svg, 500, 300, '¡Ya tengo tu clave!', [ES[0] + 40, ES[1] - 40]));
        k.nombre('nada', k.bocadillo(k.svg, 500, 300, 'No entiendo nada', [ES[0] + 40, ES[1] - 40]));
        k.nombre('no', k.marca(k.svg, ES[0] - 60, ES[1] - 60, false));
        k.nombre('si', k.marca(k.svg, ES[0] - 60, ES[1] - 60, true));
      },
      pasos: [
        { texto: 'Las ondas del wifi llegan a <strong>todo el que esté cerca</strong>, no solo al router.' },
        { texto: 'En una red <strong>abierta</strong>, los datos viajan tal cual. Quien escucha puede leer tu contraseña.',
          ver: ['abierta', 'roba', 'no'],
          paq: [{ id: 'd', ruta: viaje, chips: ['clave: perro123'], color: 'azul' }, { id: 'e', ruta: copia, chips: ['clave: perro123'], color: 'rosa' }] },
        { texto: 'Con <strong>WPA2 o WPA3</strong>, los datos van <strong>cifrados</strong>: quien escucha solo ve letras sin sentido.',
          ver: ['wpa', 'nada', 'si'],
          paq: [{ id: 'd2', ruta: viaje, chips: ['x9#qL2&f'], color: 'lima' }, { id: 'e2', ruta: copia, chips: ['x9#qL2&f'], color: 'lima' }] },
        { texto: '<strong>WEP</strong> también cifra, pero se rompe en <strong>minutos</strong>. Es como no tener nada.',
          ver: ['wep', 'roba', 'no'],
          paq: [{ id: 'd3', ruta: viaje, chips: ['x9#qL2&f'], color: 'ambar' }, { id: 'e3', ruta: copia, chips: ['clave: perro123'], color: 'rosa' }] }
      ]
    });
  })();

  /* ============================================================
     wifi-poe · UT5 S7
     ============================================================ */
  (function () {
    const SW = [130, 270], AP = [500, 90];
    const camino = ruta([SW[0] + 60, SW[1] - 10], [AP[0], SW[1] - 10], [AP[0], AP[1] + 30]);
    ISO.animacion('wifi-poe', {
      titulo: 'PoE: los datos y la corriente por el mismo cable',
      msMovimiento: 1600,
      dibujar(k) {
        el('rect', { x: 300, y: 40, width: 320, height: 14, rx: 4, class: 'i-cara-izq' }, k.svg);
        k.texto(k.svg, 380, 32, 'Techo', 'i-t i-tenue');
        k.cable('c', camino[0], camino[1]);
        k.cable('c2', camino[1], camino[2]);
        k.switch_(k.svg, SW[0], SW[1], 4, 'Switch');
        k.caja(k.svg, AP[0], AP[1], 36, 18, 10);
        k.texto(k.svg, AP[0] - 50, AP[1] + 6, 'Punto de acceso', 'i-t i-negrita', 'end');
        k.nombre('sinEnchufe', k.bocadillo(k.svg, 330, 140, 'Aquí no hay enchufe', [AP[0] - 30, AP[1] + 10]));
        k.nombre('poe', k.pastilla(k.svg, 260, 330, 'Switch PoE', { claseTexto: 'i-t i-negrita' }));
        k.nombre('noPoe', k.pastilla(k.svg, 260, 330, 'Switch sin PoE', { claseTexto: 'i-t i-negrita' }));
        k.nombre('on', k.marca(k.svg, AP[0] + 50, AP[1] - 30, true));
        k.nombre('off', k.marca(k.svg, AP[0] + 50, AP[1] - 30, false));
      },
      pasos: [
        { texto: 'El punto de acceso va en el <strong>techo</strong>, en medio de la oficina. Ahí no hay enchufe.',
          ver: ['sinEnchufe'] },
        { texto: 'Desde el switch le llega un cable de red con los <strong>datos</strong>…',
          ver: ['poe'], luz: ['c', 'c2'],
          paq: [{ id: 'd', ruta: camino, chips: ['datos'], color: 'azul' }] },
        { texto: '…y, por el mismo cable, la <strong>corriente</strong>. Es <strong>PoE</strong>: el punto de acceso enciende sin enchufe.',
          ver: ['poe', 'on'], luz: ['c', 'c2'],
          paq: [{ id: 'd', ruta: camino, chips: ['datos'], color: 'azul' }, { id: 'p', ruta: camino, chips: ['corriente'], color: 'ambar' }] },
        { texto: 'Con un switch <strong>sin PoE</strong>, solo llegan datos: no enciende. Hace falta un <strong>inyector PoE</strong> entre medias.',
          ver: ['noPoe', 'off'], luz: ['c'],
          paq: [{ id: 'd', ruta: camino, chips: ['datos'], color: 'azul' }] }
      ]
    });
  })();

  /* ============================================================
     wifi-repetidor · UT5 S8
     ============================================================ */
  (function () {
    const R = [90, 220], MOV = [580, 220], MAL = [470, 220], BIEN = [330, 220];
    const Y = 190;
    ISO.animacion('wifi-repetidor', {
      titulo: 'Dónde se pone un repetidor wifi',
      msMovimiento: 1600,
      dibujar(k) {
        k.router(k.svg, R[0], R[1], 'Router');
        k.pc(k.svg, MOV[0], MOV[1] - 10, 'Móvil');
        k.nombre('rMal', k.caja(k.svg, MAL[0], MAL[1], 20, 10, 26).grupo);
        k.nombre('rMalT', k.texto(k.svg, MAL[0], MAL[1] + 40, 'Repetidor', 'i-t i-negrita'));
        k.nombre('rBien', k.caja(k.svg, BIEN[0], BIEN[1], 20, 10, 26).grupo);
        k.nombre('rBienT', k.texto(k.svg, BIEN[0], BIEN[1] + 40, 'Repetidor', 'i-t i-negrita'));
        k.nombre('debil', k.bocadillo(k.svg, 470, 80, 'Aquí ya llega poco', [MAL[0], Y - 20]));
        k.nombre('buena', k.bocadillo(k.svg, 330, 80, 'Aquí aún llega bien', [BIEN[0], Y - 20]));
        k.nombre('mitad', k.bocadillo(k.svg, 330, 320, 'Escucha y repite por turnos', [BIEN[0], 250]));
        k.nombre('no', k.marca(k.svg, MOV[0], MOV[1] - 90, false));
        k.nombre('si', k.marca(k.svg, MOV[0], MOV[1] - 90, true));
      },
      pasos: [
        { texto: 'El móvil está <strong>lejos</strong> del router: la señal no le llega.',
          ver: ['no'],
          paq: [{ id: 'a', ruta: ruta([R[0] + 30, Y], [R[0] + 30 + 300 / 0.55, Y]), chips: ['wifi'], color: 'azul', cae: true }] },
        { texto: 'Mal: el repetidor, <strong>donde la señal ya es débil</strong>. Recibe poco, así que repite poco.',
          ver: ['rMal', 'rMalT', 'debil', 'no'],
          paq: [{ id: 'b', ruta: ruta([R[0] + 30, Y], [MAL[0], Y], [MOV[0] - 30, Y]), chips: ['débil'], color: 'rosa' }] },
        { texto: 'Bien: <strong>a mitad de camino</strong>, donde la señal aún es buena. Recibe bien y repite bien.',
          ver: ['rBien', 'rBienT', 'buena', 'si'],
          paq: [{ id: 'c', ruta: ruta([R[0] + 30, Y], [BIEN[0], Y], [MOV[0] - 30, Y]), chips: ['wifi'], color: 'lima' }] },
        { texto: 'Ojo: escucha al router y repite con la misma radio, <strong>por turnos</strong>. La velocidad baja, más o menos a la mitad.',
          ver: ['rBien', 'rBienT', 'mitad', 'si'],
          paq: [{ id: 'c2', ruta: ruta([R[0] + 30, Y], [BIEN[0], Y], [MOV[0] - 30, Y]), chips: ['½'], color: 'ambar' }] }
      ]
    });
  })();
})();
