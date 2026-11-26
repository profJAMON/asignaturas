/* ============================================================
   Unidades 8 y 9 de Instalaciones (cableado estructurado y montaje
   de la red), 15/11/2026. Va en tema.html después de
   js/simulador.js.

   SIMULACIONES (con pregunta enlazada)
     Del 26/11/2026, para ensayar en pantalla antes de cada taller
     (las clases simt-* están en css/estilos.css, «Simulaciones del
     taller»):
     crimpa-latiguillo  S5: capuchones, pelar, ordenar en T568B, cortar
                    a 12-13 mm, crimpar los dos extremos y comprobador.
     lee-comprobador    S6: cuatro cables; mirar las luces y decir qué
                    avería tiene cada uno.
     prueba-bocas       S10: un switch de prácticas con bocas rotas;
                    probarlas con un latiguillo hecho, unir dos switches
                    por bocas buenas y hacer ping.
     poncha-roseta      S7: etiquetar, fila B, ponchar con la cuchilla
                    hacia fuera, panel y comprobador.
     monta-armario  S3 «Monta el armario de la planta»: con N tomas,
                    llenar un armario de 12 U con paneles, pasahilos,
                    switches, bandeja y regleta. Comprueba el 25 % de
                    margen, las bocas de switch, un pasahilos debajo de
                    cada panel, la regleta abajo y que quepa.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof window.registrarSimulacion !== 'function' || !window.LAB) return;
  const { el, boton } = window.LAB;
  const PREG = { armario: 5 };
  const TOTAL_U = 12;
  const PIEZAS = {
    panel: { nombre: 'Panel de parcheo de 24', corto: 'Panel 24', bocas: 24 },
    pasa: { nombre: 'Pasahilos', corto: 'Pasahilos' },
    sw24: { nombre: 'Switch de 24 bocas', corto: 'Switch 24', bocasSw: 24 },
    sw48: { nombre: 'Switch de 48 bocas', corto: 'Switch 48', bocasSw: 48 },
    bandeja: { nombre: 'Bandeja con el router', corto: 'Bandeja + router' },
    regleta: { nombre: 'Regleta de enchufes', corto: 'Regleta' }
  };
  const PLANTAS = [12, 14, 16, 18, 20, 22, 30, 34, 36];

  function avisa(caja, ctx, texto, tipo) {
    caja.innerHTML = '';
    if (texto) caja.appendChild(ctx.aviso(texto, tipo));
  }

  registrarSimulacion('monta-armario', {
    ventana: 'Armario de la planta · 12 U',
    mision: [
      'Pon bocas de panel para todas las tomas, con el 25 % de margen.',
      'Pon bocas de switch para todas esas bocas de panel.',
      'Debajo de cada panel, un pasahilos.',
      'Añade la bandeja del router y la regleta, abajo del todo, sin pasarte de 12 U.'
    ],
    final: `Apunta en tu cuaderno (pregunta ${PREG.armario}): cuántas tomas tenía la planta, cuántas bocas has preparado con el margen, qué has puesto en el armario de arriba abajo y cuántas U has usado.`,
    crear(ctx) {
      const { pantalla } = ctx;
      let tomas = 0, rack = [];
      const ayuda = el('p', 'sim__ayuda', '');
      pantalla.appendChild(ayuda);
      const dos = el('div', 'sim__dos');
      pantalla.appendChild(dos);
      const izq = el('div', 'sim__ajustes'), der = el('div', 'sim__ajustes');
      dos.appendChild(izq);
      dos.appendChild(der);
      izq.appendChild(el('p', 'sim__h', 'Añade, de arriba abajo'));
      Object.entries(PIEZAS).forEach(([k, p]) => {
        const b = boton('+ ' + p.nombre);
        b.addEventListener('click', () => {
          if (rack.length >= TOTAL_U) { avisa(aviso, ctx, 'El armario ya está lleno: 12 U. Quita algo.', 'cuidado'); return; }
          rack.push(k);
          ctx.apunta(`Añado: ${p.nombre}.`);
          revisa();
        });
        izq.appendChild(b);
      });
      const fila = el('div', 'lab__fila');
      const bQuita = boton('Quitar la última');
      const bOtra = boton('Otra planta');
      fila.appendChild(bQuita);
      fila.appendChild(bOtra);
      izq.appendChild(fila);
      der.appendChild(el('p', 'sim__h', 'El armario'));
      const armario = el('ol');
      armario.setAttribute('aria-label', 'Contenido del armario, de arriba abajo');
      armario.style.cssText = 'list-style:none;margin:0;padding:0.3rem;border:2px solid var(--border);border-radius:6px;font-family:var(--font-mono, monospace);font-size:0.85rem;';
      der.appendChild(armario);
      const cuenta = el('p', 'sim__etiqueta', '');
      der.appendChild(cuenta);
      const aviso = el('div');
      aviso.setAttribute('aria-live', 'polite');
      pantalla.appendChild(aviso);

      function nueva() {
        let n;
        do { n = PLANTAS[Math.floor(Math.random() * PLANTAS.length)]; } while (n === tomas);
        tomas = n;
        rack = [];
        ayuda.innerHTML = '';
        ayuda.append('Esta planta tiene ');
        const s = document.createElement('strong');
        s.textContent = `${tomas} tomas`;
        ayuda.append(s, '. Monta su armario de 12 U de arriba abajo: cada botón añade una pieza de 1 U debajo de la anterior.');
        [0, 1, 2, 3].forEach(i => ctx.deshace(i));
        avisa(aviso, ctx, '');
        revisa();
      }

      function pinta() {
        armario.innerHTML = '';
        for (let u = 0; u < TOTAL_U; u++) {
          const li = document.createElement('li');
          const k = rack[u];
          li.style.cssText = 'display:flex;gap:0.6rem;padding:0.15rem 0.4rem;border-bottom:1px dashed var(--border);' + (k ? 'background:color-mix(in srgb, var(--accent) 16%, transparent);' : 'opacity:0.55;');
          const n = el('span', '', `U${u + 1}`);
          n.style.minWidth = '2.4rem';
          li.appendChild(n);
          li.appendChild(el('span', '', k ? PIEZAS[k].corto : '—'));
          armario.appendChild(li);
        }
      }

      function revisa() {
        pinta();
        const necesarias = Math.ceil(tomas * 1.25);
        const bocasPanel = rack.filter(k => k === 'panel').length * 24;
        const bocasSw = rack.reduce((a, k) => a + (PIEZAS[k].bocasSw || 0), 0);
        cuenta.textContent = `Usadas ${rack.length} de 12 U · bocas de panel: ${bocasPanel} · bocas de switch: ${bocasSw}`;
        const paneles = rack.map((k, i) => [k, i]).filter(([k]) => k === 'panel');
        const okPanel = bocasPanel >= necesarias;
        const okSw = okPanel && bocasSw >= necesarias;
        const okPasa = paneles.length > 0 && paneles.every(([, i]) => rack[i + 1] === 'pasa');
        const okFinal = rack.includes('bandeja') && rack[rack.length - 1] === 'regleta' && rack.filter(k => k === 'regleta').length === 1 && rack.length <= TOTAL_U;
        const marcas = [okPanel, okSw, okPasa, okFinal];
        const textos = [
          `Bocas de panel: ${bocasPanel}, y hacían falta ${necesarias} (${tomas} + 25 %).`,
          `Bocas de switch: ${bocasSw}.`,
          'Cada panel tiene su pasahilos debajo.',
          `Bandeja y regleta puestas; ${rack.length} U de 12.`
        ];
        marcas.forEach((m, i) => { if (m) { if (!ctx.hecho(i)) ctx.cumple(i, textos[i]); } else ctx.deshace(i); });
        if (!rack.length) return;
        if (marcas.every(Boolean)) { avisa(aviso, ctx, '¡Armario montado! Todo cabe y cada cosa está en su sitio.', 'ok'); return; }
        const ultima = rack[rack.length - 1];
        let t = '';
        if (ultima === 'panel' || (ultima !== 'pasa' && paneles.some(([, i]) => rack[i + 1] && rack[i + 1] !== 'pasa'))) t = 'Debajo de un panel va un pasahilos: si no, los latiguillos cuelgan por delante del switch.';
        else if (bocasPanel > 0 && bocasPanel < necesarias) t = `Te faltan bocas de panel: necesitas ${necesarias} (${tomas} tomas + 25 % de margen).`;
        else if (rack.includes('regleta') && ultima !== 'regleta') t = 'La regleta va abajo del todo: los cables de corriente, lejos de los de datos.';
        avisa(aviso, ctx, t, 'cuidado');
      }

      bQuita.addEventListener('click', () => {
        if (!rack.length) return;
        const k = rack.pop();
        ctx.apunta(`Quito: ${PIEZAS[k].nombre}.`);
        revisa();
      });
      bOtra.addEventListener('click', () => { ctx.apunta('Otra planta.'); nueva(); });
      nueva();
    }
  });
})();


/* ============================================================
   Simulaciones del taller (26/11/2026). Ver la cabecera.
   ============================================================ */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof window.registrarSimulacion !== 'function' || !window.LAB) return;
  const { el, boton } = window.LAB;
  const HILOS = {
    bn: 'blanco-naranja', n: 'naranja', bv: 'blanco-verde', a: 'azul',
    ba: 'blanco-azul', v: 'verde', bm: 'blanco-marrón', m: 'marrón'
  };
  const T568B = ['bn', 'n', 'bv', 'a', 'ba', 'v', 'bm', 'm'];
  const T568A = ['bv', 'v', 'bn', 'a', 'ba', 'n', 'bm', 'm'];
  const DIRECTO = [1, 2, 3, 4, 5, 6, 7, 8];
  const CRUZADO = [3, 6, 1, 4, 5, 2, 7, 8];
  const mezcla = l => l.map(x => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map(p => p[1]);

  function chip(k) {
    const s = el('span', 'simt-hilo');
    const i = el('i', 'h-' + k);
    i.setAttribute('aria-hidden', 'true');
    s.appendChild(i);
    s.appendChild(el('span', 'simt-hilo__nombre', HILOS[k]));
    return s;
  }
  function avisa(caja, ctx, texto, tipo) {
    caja.innerHTML = '';
    if (texto) caja.appendChild(ctx.aviso(texto, tipo));
  }
  // Las luces del comprobador: para cada pin del principal (1-8), qué
  // pines se encienden en el remoto ([] = ninguno; dos = cortocircuito).
  function luces(mapa, esperado) {
    const caja = el('div', 'simt-luces');
    caja.setAttribute('translate', 'no');
    caja.appendChild(el('span', 'simt-luces__fila', 'P'));
    mapa.forEach((r, i) => caja.appendChild(el('span', 'simt-luz simt-luz--p', String(i + 1))));
    caja.appendChild(el('span', 'simt-luces__fila', 'R'));
    mapa.forEach((r, i) => {
      const bien = esperado && r.length === 1 && r[0] === esperado[i];
      caja.appendChild(el('span', 'simt-luz ' + (r.length ? (bien ? 'simt-luz--ok' : 'simt-luz--mal') : 'simt-luz--off'), r.length ? r.join('+') : '·'));
    });
    const lista = mapa.map((r, i) => `${i + 1}-${r.length ? r.join(' y ') : 'nada'}`).join(', ');
    caja.setAttribute('role', 'img');
    caja.setAttribute('aria-label', 'Luces del comprobador: ' + lista);
    return caja;
  }
  function textoLuces(mapa) {
    return mapa.map((r, i) => `${i + 1}-${r.length ? r.join('+') : '·'}`).join(', ');
  }

  /* ---------- 1. Crimpa un latiguillo (S5) ---------- */
  registrarSimulacion('crimpa-latiguillo', {
    ventana: 'Mesa del taller · latiguillo directo',
    mision: [
      'Mete los capuchones antes de pelar.',
      'Ordena los ocho hilos en T568B en los dos extremos.',
      'Corta los hilos a 12-13 mm antes de meterlos en el conector.',
      'Pasa el comprobador: 1-1, 2-2 … 8-8.'
    ],
    final: 'Apunta en tu hoja de práctica (pregunta 1): el orden T568B, a cuántos milímetros cortas los hilos y qué luces enciende el comprobador con un latiguillo bien hecho.',
    crear(ctx) {
      const { pantalla } = ctx;
      let capuchones = false, ext = 0, paso = 'inicio';
      let orden = [], corte = 0;
      const hechos = [null, null]; // {orden, corte}
      const titulo = el('p', 'sim__h', '');
      const ayuda = el('p', 'sim__ayuda', '');
      const zona = el('div', 'simt-zona');
      const aviso = el('div');
      aviso.setAttribute('aria-live', 'polite');
      pantalla.append(titulo, ayuda, zona, aviso);

      function pinta() {
        zona.innerHTML = '';
        titulo.textContent = ext < 2 ? `Extremo ${ext + 1} de 2` : 'El comprobador';
        if (paso === 'inicio') {
          ayuda.textContent = ext === 0 ? 'Tienes el cable cortado a 1,2 m, dos conectores y dos capuchones.' : 'Ahora el otro extremo del mismo cable.';
          const fila = el('div', 'lab__fila');
          if (ext === 0) {
            const bCap = boton(capuchones ? 'Capuchones puestos ✓' : 'Meter los dos capuchones');
            bCap.disabled = capuchones;
            bCap.addEventListener('click', () => {
              capuchones = true;
              ctx.cumple(0, 'Meto los dos capuchones en el cable, con la parte ancha hacia fuera.');
              pinta();
            });
            fila.appendChild(bCap);
          }
          [['1 cm', 1], ['2-3 cm', 2], ['6 cm', 6]].forEach(([t, cm]) => {
            const b = boton('Pelar ' + t);
            b.addEventListener('click', () => {
              if (cm === 1) { avisa(aviso, ctx, 'Con 1 cm no puedes separar ni ordenar los hilos. Pela un poco más.', 'cuidado'); ctx.falla('Pelo 1 cm: no da para ordenar.'); return; }
              ctx.apunta(`Extremo ${ext + 1}: pelo ${t} de cubierta.`);
              if (cm === 6) avisa(aviso, ctx, 'Has pelado de más. No pasa nada: luego cortarás los hilos a su medida.', 'cuidado');
              else avisa(aviso, ctx, '');
              if (ext === 0 && !capuchones) {
                ctx.falla('He pelado sin meter los capuchones.');
                avisa(aviso, ctx, 'Se te han olvidado los capuchones. En el taller ya no entrarían por la punta pelada: tendrías que cortar el cable y empezar. Pulsa «↺ Empezar otra vez».', 'cuidado');
                return;
              }
              orden = []; paso = 'ordenar'; pinta();
            });
            fila.appendChild(b);
          });
          zona.appendChild(fila);
        } else if (paso === 'ordenar') {
          ayuda.textContent = 'Toca los hilos en el orden en que van en el conector, del pin 1 al 8 (contactos hacia ti, pestaña detrás).';
          const pines = el('ol', 'simt-pines');
          pines.setAttribute('aria-label', 'Pines del conector');
          for (let i = 0; i < 8; i++) {
            const li = el('li', 'simt-pin');
            li.appendChild(el('b', null, String(i + 1)));
            if (orden[i]) li.appendChild(chip(orden[i])); else li.appendChild(el('span', 'simt-hueco', '—'));
            pines.appendChild(li);
          }
          zona.appendChild(pines);
          const fila = el('div', 'lab__fila simt-hilos');
          Object.keys(HILOS).forEach(k => {
            if (orden.includes(k)) return;
            const b = boton('');
            b.classList.add('simt-boton-hilo');
            b.appendChild(chip(k));
            b.setAttribute('aria-label', 'Hilo ' + HILOS[k]);
            b.addEventListener('click', () => { orden.push(k); pinta(); });
            fila.appendChild(b);
          });
          zona.appendChild(fila);
          const f2 = el('div', 'lab__fila');
          const bDes = boton('Deshacer el último');
          bDes.disabled = !orden.length;
          bDes.addEventListener('click', () => { orden.pop(); pinta(); });
          f2.appendChild(bDes);
          if (orden.length === 8) {
            const bOk = boton('Ya están ordenados');
            bOk.addEventListener('click', () => {
              ctx.apunta(`Extremo ${ext + 1}: ordeno ${orden.map(k => HILOS[k]).join(', ')}.`);
              paso = 'cortar'; pinta();
            });
            f2.appendChild(bOk);
          }
          zona.appendChild(f2);
        } else if (paso === 'cortar') {
          ayuda.textContent = '¿A cuánto de la cubierta cortas los ocho hilos, de un solo corte recto?';
          const fila = el('div', 'lab__fila');
          [6, 12, 20].forEach(mm => {
            const b = boton(mm === 12 ? '12-13 mm' : mm + ' mm');
            b.addEventListener('click', () => {
              corte = mm;
              ctx.apunta(`Extremo ${ext + 1}: corto a ${mm === 12 ? '12-13' : mm} mm.`);
              paso = 'revisar'; pinta();
            });
            fila.appendChild(b);
          });
          zona.appendChild(fila);
        } else if (paso === 'revisar') {
          ayuda.textContent = 'Has metido los hilos en el conector. Revísalo antes de crimpar:';
          const ul = el('ul', 'simt-revision');
          ul.appendChild(el('li', null, 'Desde arriba: ' + orden.map(k => HILOS[k]).join(', ') + '.'));
          ul.appendChild(el('li', null, corte === 6 ? 'Desde la punta: solo se ven seis puntitos de cobre; dos hilos no llegan al fondo.' : 'Desde la punta: ocho puntitos de cobre tocando el fondo.'));
          ul.appendChild(el('li', null, corte === 20 ? 'Desde el lado: la cubierta no entra; la cuña queda encima de los hilos de colores.' : 'Desde el lado: la cubierta entra y queda debajo de la cuña.'));
          zona.appendChild(ul);
          const fila = el('div', 'lab__fila');
          const bSaca = boton('Sacar los hilos y volver a ordenar');
          bSaca.addEventListener('click', () => { ctx.apunta(`Extremo ${ext + 1}: saco los hilos para revisarlos.`); orden = []; paso = 'ordenar'; avisa(aviso, ctx, ''); pinta(); });
          const bCrimpa = boton('Crimpar');
          bCrimpa.addEventListener('click', () => {
            hechos[ext] = { orden: orden.slice(), corte };
            ctx.apunta(`Extremo ${ext + 1}: crimpo hasta que suelta la carraca.`);
            if (corte === 20) { ctx.falla('La cuña pisa los hilos: el cable se soltará de un tirón.'); avisa(aviso, ctx, 'La cuña ha apretado hilos en vez de cubierta. Puede pasar el comprobador, pero se soltará de un tirón. En el taller cortarías este conector y lo repetirías.', 'cuidado'); }
            else avisa(aviso, ctx, '');
            const falta = hechos.findIndex(h => !h);
            if (falta < 0) { ext = 2; paso = 'probar'; } else { ext = falta; paso = 'inicio'; }
            pinta();
          });
          fila.append(bSaca, bCrimpa);
          zona.appendChild(fila);
        } else if (paso === 'probar') {
          ayuda.textContent = 'Los dos extremos crimpados. Conecta uno al módulo principal y el otro al remoto.';
          const bProbar = boton('Encender el comprobador');
          bProbar.addEventListener('click', () => {
            const [e1, e2] = hechos;
            const mapa = e1.orden.map((k, i) => {
              if (e1.corte === 6 && i >= 6) return [];
              const j = e2.orden.indexOf(k);
              if (e2.corte === 6 && j >= 6) return [];
              return [j + 1];
            });
            zona.appendChild(luces(mapa, DIRECTO));
            ctx.apunta('Comprobador: ' + textoLuces(mapa) + '.');
            const ordenBien = e1.orden.join() === T568B.join() && e2.orden.join() === T568B.join();
            const corteBien = e1.corte === 12 && e2.corte === 12;
            const pasa = mapa.every((r, i) => r.length === 1 && r[0] === i + 1);
            if (ordenBien) ctx.cumple(1, 'Los dos extremos, en T568B.');
            if (corteBien) ctx.cumple(2, 'Los hilos, cortados a 12-13 mm en los dos extremos.');
            if (pasa && ordenBien) { ctx.cumple(3, 'El comprobador da 1-1, 2-2 … 8-8.'); avisa(aviso, ctx, 'Las ocho luces van a la par. Cable directo bien hecho.', 'ok'); }
            else if (pasa) { ctx.falla('Pasa el comprobador, pero el orden no es T568B.'); avisa(aviso, ctx, 'Las luces van a la par, pero los colores no siguen T568B: los pares no van juntos y el cable fallará a gigabit. Repásalo con la norma.', 'cuidado'); }
            else if (mapa.some(r => !r.length)) { ctx.falla('Alguna luz no se enciende en ningún lado.'); avisa(aviso, ctx, 'Hay luces que no se encienden en ningún lado: algún hilo no llega al fondo del conector.', 'cuidado'); }
            else { ctx.falla('Las luces salen descolocadas.'); avisa(aviso, ctx, 'Las luces salen descolocadas: en algún extremo el orden no es el mismo. Compara los colores de los dos extremos.', 'cuidado'); }
            bProbar.disabled = true;
            if (!(pasa && ordenBien && corteBien)) {
              const f = el('div', 'lab__fila');
              [0, 1].forEach(e => {
                const b = boton(`Cortar el conector del extremo ${e + 1} y repetirlo`);
                b.addEventListener('click', () => { ctx.apunta(`Corto el conector del extremo ${e + 1}.`); hechos[e] = null; ext = e; paso = 'inicio'; avisa(aviso, ctx, ''); [1, 2, 3].forEach(i => ctx.deshace(i)); pinta(); });
                f.appendChild(b);
              });
              zona.appendChild(f);
            }
          });
          zona.appendChild(bProbar);
        }
      }
      pinta();
    }
  });

  /* ---------- 2. Lee el comprobador (S6) ---------- */
  const CABLES = [
    { tipo: 'directo', nombre: 'Latiguillo directo bien hecho', mapa: DIRECTO.map(n => [n]) },
    { tipo: 'cruzado', nombre: 'Cable cruzado bien hecho', mapa: CRUZADO.map(n => [n]) },
    { tipo: 'abierto', nombre: 'Circuito abierto en el hilo 7', mapa: DIRECTO.map(n => n === 7 ? [] : [n]) },
    { tipo: 'abierto', nombre: 'Circuito abierto en el hilo 2', mapa: DIRECTO.map(n => n === 2 ? [] : [n]) },
    { tipo: 'cruzados', nombre: 'Hilos 3 y 6 cambiados en un extremo', mapa: [[1], [2], [6], [4], [5], [3], [7], [8]] },
    { tipo: 'cruzados', nombre: 'Verde y azul cambiados en un extremo', mapa: [[1], [2], [3], [6], [5], [4], [7], [8]] },
    { tipo: 'corto', nombre: 'Cortocircuito entre el 4 y el 5', mapa: [[1], [2], [3], [4, 5], [4, 5], [6], [7], [8]] }
  ];
  const TIPOS = [
    ['directo', 'Directo bien hecho'],
    ['cruzado', 'Cruzado bien hecho'],
    ['abierto', 'Circuito abierto'],
    ['cruzados', 'Hilos cruzados'],
    ['corto', 'Cortocircuito']
  ];
  const PISTAS = {
    directo: 'Mira si cada luz del principal se enciende con la misma del remoto.',
    cruzado: 'Fíjate en la 1, la 2, la 3 y la 6: ¿con cuáles se encienden?',
    abierto: '¿Hay alguna luz que no se encienda en ningún lado?',
    cruzados: 'Casi todas van a la par, pero dos se han cambiado el sitio.',
    corto: 'Mira si en el remoto se encienden dos luces a la vez.'
  };
  registrarSimulacion('lee-comprobador', {
    ventana: 'Comprobador de cable · cuatro cables numerados',
    mision: ['Cable 1: di qué le pasa.', 'Cable 2: di qué le pasa.', 'Cable 3: di qué le pasa.', 'Cable 4: di qué le pasa.'],
    final: 'Apunta en tu hoja de práctica (pregunta 1): de los cuatro cables, dibuja las luces del que tenía hilos cruzados y di qué extremo revisarías y qué harías para arreglarlo.',
    crear(ctx) {
      const { pantalla } = ctx;
      const tipos = ['directo', 'cruzado', 'abierto', 'cruzados', 'corto'];
      const elegidos = [];
      ['abierto', 'cruzados'].forEach(tp => elegidos.push(mezcla(CABLES.filter(c => c.tipo === tp))[0]));
      elegidos.push(mezcla(CABLES.filter(c => c.tipo === 'cruzado' || c.tipo === 'corto'))[0]);
      elegidos.push(CABLES[0]);
      const cables = mezcla(elegidos);
      let actual = -1;
      pantalla.appendChild(el('p', 'sim__ayuda', 'Elige un cable, mira las luces y di qué le pasa. P = módulo principal; R = lo que se enciende en el remoto con cada luz del principal.'));
      const fila = el('div', 'lab__fila');
      const bots = cables.map((c, i) => {
        const b = boton(`Cable ${i + 1}`);
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => elige(i));
        fila.appendChild(b);
        return b;
      });
      pantalla.appendChild(fila);
      const zona = el('div', 'simt-zona');
      const aviso = el('div');
      aviso.setAttribute('aria-live', 'polite');
      pantalla.append(zona, aviso);
      function elige(i) {
        actual = i;
        bots.forEach((b, k) => b.setAttribute('aria-pressed', k === i ? 'true' : 'false'));
        zona.innerHTML = '';
        avisa(aviso, ctx, '');
        zona.appendChild(el('p', 'sim__h', `Cable ${i + 1}`));
        zona.appendChild(luces(cables[i].mapa, null));
        zona.appendChild(el('p', 'sim__etiqueta', '¿Qué le pasa?'));
        const f = el('div', 'lab__fila');
        TIPOS.forEach(([k, txt]) => {
          const b = boton(txt);
          b.addEventListener('click', () => {
            if (k === cables[i].tipo) {
              ctx.cumple(i, `Cable ${i + 1}: ${txt.toLowerCase()} (${textoLuces(cables[i].mapa)}).`);
              avisa(aviso, ctx, `Bien: ${cables[i].nombre.toLowerCase()}.`, 'ok');
            } else {
              ctx.falla(`Cable ${i + 1}: digo «${txt.toLowerCase()}» y no es.`);
              avisa(aviso, ctx, 'No es eso. ' + PISTAS[cables[i].tipo], 'cuidado');
            }
          });
          f.appendChild(b);
        });
        zona.appendChild(f);
      }
      elige(0);
      void tipos;
    }
  });

  /* ---------- 3. Poncha una toma y el panel (toma y panel) ---------- */
  registrarSimulacion('poncha-roseta', {
    ventana: 'Mesa del taller · toma de pared y panel',
    mision: [
      'Etiqueta las dos puntas del cable antes de empezar.',
      'Mete los ocho hilos en la toma siguiendo la fila B.',
      'Poncha con la cuchilla hacia fuera.',
      'Comprueba de la toma al panel: 1-1, 2-2 … 8-8.'
    ],
    final: 'Apunta en tu hoja de práctica (pregunta 1): qué fila de colores usas en la toma y en el panel, hacia dónde va la cuchilla y qué pasa si en una punta usas la A y en la otra la B.',
    crear(ctx) {
      const { pantalla } = ctx;
      let etiqueta = false, filaToma = '', ranuras = Array(8).fill(null), sel = null, ponchado = false, filaPanel = '';
      const zona = el('div', 'simt-zona');
      const aviso = el('div');
      aviso.setAttribute('aria-live', 'polite');
      pantalla.append(zona, aviso);
      const ranurasA = T568A, ranurasB = T568B;
      // La toma tiene las ranuras en un orden propio; junto a cada una, el color de la fila A y el de la B.
      const orden = [2, 0, 3, 1, 5, 7, 4, 6];
      function pinta() {
        zona.innerHTML = '';
        const f0 = el('div', 'lab__fila');
        const bEt = boton(etiqueta ? 'Puntas etiquetadas: T-03 ✓' : 'Etiquetar las dos puntas (T-03)');
        bEt.disabled = etiqueta;
        bEt.addEventListener('click', () => { etiqueta = true; ctx.cumple(0, 'Pongo la etiqueta T-03 en las dos puntas del cable.'); pinta(); });
        f0.appendChild(bEt);
        zona.appendChild(f0);
        zona.appendChild(el('p', 'sim__h', 'La toma'));
        if (!filaToma) {
          zona.appendChild(el('p', 'sim__ayuda', 'Junto a cada ranura hay dos colores pintados: fila A y fila B. ¿Cuál sigues?'));
          const f = el('div', 'lab__fila');
          ['A', 'B'].forEach(x => {
            const b = boton('Fila ' + x);
            b.addEventListener('click', () => {
              if (!etiqueta) ctx.falla('Empiezo sin etiquetar el cable.');
              filaToma = x; ctx.apunta(`En la toma sigo la fila ${x}.`);
              if (!etiqueta) avisa(aviso, ctx, 'Has empezado sin etiquetar. Cuando el cable vaya por la canaleta no sabrás cuál es cuál: etiquétalo ya.', 'cuidado');
              pinta();
            });
            f.appendChild(b);
          });
          zona.appendChild(f);
          return;
        }
        const guia = filaToma === 'A' ? ranurasA : ranurasB;
        zona.appendChild(el('p', 'sim__ayuda', ponchado ? 'Toma ponchada.' : `Toca un hilo y después la ranura que tiene su color en la fila ${filaToma}.`));
        const r = el('ol', 'simt-ranuras');
        r.setAttribute('aria-label', 'Ranuras de la toma');
        orden.forEach(p => {
          const li = el('li');
          const b = boton('');
          b.classList.add('simt-ranura');
          const etA = el('span', 'simt-etq'); etA.append('A ', chip(ranurasA[p]));
          const etB = el('span', 'simt-etq'); etB.append('B ', chip(ranurasB[p]));
          b.append(etA, etB);
          b.appendChild(el('span', 'simt-ranura__dentro', ranuras[p] ? 'dentro: ' + HILOS[ranuras[p]] : 'vacía'));
          b.setAttribute('aria-label', `Ranura: fila A ${HILOS[ranurasA[p]]}, fila B ${HILOS[ranurasB[p]]}. ${ranuras[p] ? 'Tiene el hilo ' + HILOS[ranuras[p]] : 'Vacía'}`);
          b.disabled = ponchado;
          b.addEventListener('click', () => {
            if (!sel) { avisa(aviso, ctx, 'Primero toca un hilo de abajo.', 'cuidado'); return; }
            if (ranuras[p]) { avisa(aviso, ctx, 'Esa ranura ya tiene un hilo.', 'cuidado'); return; }
            if (sel !== guia[p]) { ctx.falla(`Meto el ${HILOS[sel]} en una ranura que no es la suya.`); avisa(aviso, ctx, `En esa ranura, la fila ${filaToma} pide el ${HILOS[guia[p]]}. Mira la etiqueta de color.`, 'cuidado'); return; }
            ranuras[p] = sel; sel = null; avisa(aviso, ctx, ''); pinta();
          });
          li.appendChild(b);
          r.appendChild(li);
        });
        zona.appendChild(r);
        if (!ponchado) {
          const f = el('div', 'lab__fila simt-hilos');
          Object.keys(HILOS).forEach(k => {
            if (ranuras.includes(k)) return;
            const b = boton('');
            b.classList.add('simt-boton-hilo');
            b.setAttribute('aria-pressed', sel === k ? 'true' : 'false');
            b.setAttribute('aria-label', 'Hilo ' + HILOS[k]);
            b.appendChild(chip(k));
            b.addEventListener('click', () => { sel = k; pinta(); });
            f.appendChild(b);
          });
          zona.appendChild(f);
        }
        if (ranuras.every(Boolean) && !ponchado) {
          if (filaToma === 'B') ctx.cumple(1, 'Los ocho hilos, en la fila B de la toma.');
          zona.appendChild(el('p', 'sim__etiqueta', 'Herramienta de impacto: ¿hacia dónde pones la cuchilla?'));
          const f = el('div', 'lab__fila');
          [['Hacia fuera, al lado del hilo que sobra', true], ['Hacia dentro de la toma', false]].forEach(([txt, bien]) => {
            const b = boton(txt);
            b.addEventListener('click', () => {
              if (!bien) { ctx.falla('Poncho con la cuchilla hacia dentro: corto el hilo bueno.'); avisa(aviso, ctx, 'Clic… y has cortado el hilo por el lado de dentro: ya no llega a la cuchilla. Hay que quitarlo, pelar otro trozo y volver a ponerlo. Prueba con la cuchilla al otro lado.', 'cuidado'); return; }
              ponchado = true; ctx.cumple(2, 'Poncho los ocho hilos con la cuchilla hacia fuera: clic y el sobrante, cortado.'); avisa(aviso, ctx, ''); pinta();
            });
            f.appendChild(b);
          });
          zona.appendChild(f);
        }
        if (!ponchado) return;
        zona.appendChild(el('p', 'sim__h', 'El panel'));
        if (!filaPanel) {
          zona.appendChild(el('p', 'sim__ayuda', 'Por detrás del panel, la otra punta. ¿Qué fila sigues aquí?'));
          const f = el('div', 'lab__fila');
          ['A', 'B'].forEach(x => {
            const b = boton('Fila ' + x);
            b.addEventListener('click', () => { filaPanel = x; ctx.apunta(`En el panel sigo la fila ${x}.`); pinta(); });
            f.appendChild(b);
          });
          zona.appendChild(f);
          return;
        }
        zona.appendChild(el('p', 'sim__ayuda', `Panel ponchado en la fila ${filaPanel}. Un latiguillo de la toma al comprobador y otro de la boca del panel al remoto.`));
        const bP = boton('Encender el comprobador');
        bP.addEventListener('click', () => {
          const mapa = filaToma === filaPanel ? DIRECTO.map(n => [n]) : CRUZADO.map(n => [n]);
          zona.appendChild(luces(mapa, DIRECTO));
          ctx.apunta('Comprobador: ' + textoLuces(mapa) + '.');
          if (filaToma === filaPanel && filaToma === 'B') { ctx.cumple(3, 'De la toma al panel: 1-1, 2-2 … 8-8.'); avisa(aviso, ctx, 'Enlace fijo bien hecho.', 'ok'); }
          else if (filaToma === filaPanel) { ctx.falla('Pasa, pero con la fila A.'); avisa(aviso, ctx, 'Pasa el comprobador, pero has usado la fila A. En el instituto todo va en la B, como los latiguillos. Empieza otra vez.', 'cuidado'); }
          else { ctx.falla('Sale 1-3, 2-6…: un cable cruzado.'); avisa(aviso, ctx, 'Una punta en la A y otra en la B: te ha salido un cable cruzado. Vuelve a ponchar el panel.', 'cuidado'); const b = boton('Volver a ponchar el panel'); b.addEventListener('click', () => { filaPanel = ''; avisa(aviso, ctx, ''); pinta(); }); zona.appendChild(b); }
          bP.disabled = true;
        });
        zona.appendChild(bP);
      }
      pinta();
    }
  });

  /* ---------- 4. Prueba las bocas de un switch (S10) ---------- */
  registrarSimulacion('prueba-bocas', {
    ventana: 'Mesa del taller · dos switches de prácticas',
    mision: [
      'Prueba las ocho bocas del switch A con un latiguillo que funcione.',
      'Marca bien qué bocas no funcionan.',
      'Une el switch A con el B por dos bocas que funcionen.',
      'Haz ping del PC 1 (switch A) al PC 2 (switch B) y que responda.'
    ],
    final: 'Apunta en tu hoja de práctica (pregunta 1): por qué se prueba con un latiguillo de los que ya están hechos, qué bocas del switch A no funcionaban y por qué bocas has unido los dos switches.',
    crear(ctx) {
      const { pantalla } = ctx;
      const rotas = mezcla([1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 2);
      let lat = '', probadas = new Set(), marcas = {}, union = null, bocaB = 0;
      const zona = el('div', 'simt-zona');
      const aviso = el('div');
      aviso.setAttribute('aria-live', 'polite');
      pantalla.append(zona, aviso);
      function pinta() {
        zona.innerHTML = '';
        zona.appendChild(el('p', 'sim__ayuda', 'El PC 1 tiene un latiguillo. Elige cuál usas y enchúfalo en cada boca del switch A. Mira la luz LINK.'));
        const f = el('div', 'lab__fila');
        [['hecho', 'Latiguillo hecho (ya comprobado)'], ['mio', 'Mi latiguillo (sin comprobar)']].forEach(([k, txt]) => {
          const b = boton(txt);
          b.setAttribute('aria-pressed', lat === k ? 'true' : 'false');
          b.addEventListener('click', () => { lat = k; ctx.apunta('Cojo: ' + txt.toLowerCase() + '.'); pinta(); });
          f.appendChild(b);
        });
        zona.appendChild(f);
        zona.appendChild(el('p', 'sim__h', 'Switch A'));
        const sw = el('ol', 'simt-switch');
        sw.setAttribute('aria-label', 'Bocas del switch A');
        for (let n = 1; n <= 8; n++) {
          const li = el('li', 'simt-boca');
          const enUso = union === n;
          const luz = probadas.has(n) && !rotas.includes(n);
          li.appendChild(el('span', 'simt-boca__luz ' + (luz || enUso ? 'simt-luz--ok' : 'simt-luz--off'), luz || enUso ? 'LINK' : '·'));
          li.appendChild(el('b', null, String(n)));
          const bP = boton('Enchufar');
          bP.addEventListener('click', () => {
            if (!lat) { avisa(aviso, ctx, 'Primero elige qué latiguillo usas.', 'cuidado'); return; }
            if (lat === 'mio') {
              ctx.falla(`Boca ${n} con mi latiguillo: no se enciende LINK.`);
              avisa(aviso, ctx, 'No se enciende LINK… ¿la boca o tu cable? Con un cable sin comprobar no lo sabes. Usa uno de los que ya están hechos.', 'cuidado');
              return;
            }
            probadas.add(n);
            ctx.apunta(`Boca ${n}: ${rotas.includes(n) ? 'no se enciende LINK' : 'LINK encendida'}.`);
            avisa(aviso, ctx, '');
            if (probadas.size === 8) { ctx.cumple(0, 'Pruebo las ocho bocas con un latiguillo que funciona.'); if (Object.values(marcas).some(Boolean)) revisaMarcas(); }
            pinta();
          });
          li.appendChild(bP);
          const bM = boton(marcas[n] ? '✗ rota' : 'Marcar rota');
          bM.setAttribute('aria-pressed', marcas[n] ? 'true' : 'false');
          bM.setAttribute('aria-label', `Marcar la boca ${n} como rota`);
          bM.addEventListener('click', () => { marcas[n] = !marcas[n]; revisaMarcas(); pinta(); });
          li.appendChild(bM);
          sw.appendChild(li);
        }
        zona.appendChild(sw);
        if (!ctx.hecho(1)) return;
        zona.appendChild(el('p', 'sim__h', 'Une el switch A con el switch B'));
        zona.appendChild(el('p', 'sim__ayuda', '¿Por qué boca del switch A sale el latiguillo hacia el B? (El PC 2 ya está en la boca 1 del B.)'));
        const fU = el('div', 'lab__fila');
        for (let n = 1; n <= 8; n++) {
          const b = boton('A' + n);
          b.setAttribute('aria-pressed', union === n ? 'true' : 'false');
          b.addEventListener('click', () => {
            union = n; bocaB = 8;
            if (rotas.includes(n)) { ctx.deshace(2); ctx.falla(`Uno los switches por la boca A${n}, que está rota.`); avisa(aviso, ctx, `La boca A${n} la habías marcado como rota: por ahí no pasa nada.`, 'cuidado'); }
            else { ctx.cumple(2, `Uno el switch A (boca ${n}) con el B (boca 8) con un latiguillo hecho.`); avisa(aviso, ctx, ''); }
            pinta();
          });
          fU.appendChild(b);
        }
        zona.appendChild(fU);
        if (!union) return;
        const bPing = boton('ping 192.168.10.2 (desde el PC 1)');
        bPing.addEventListener('click', () => {
          const pre = el('pre', 'simt-ping');
          pre.setAttribute('translate', 'no');
          if (ctx.hecho(2)) {
            pre.textContent = 'Respuesta desde 192.168.10.2: bytes=32 tiempo<1m TTL=128\nRespuesta desde 192.168.10.2: bytes=32 tiempo<1m TTL=128';
            ctx.cumple(3, 'Ping del PC 1 al PC 2: responde.');
          } else {
            pre.textContent = 'Error general.\nError general.';
            ctx.falla('El ping no responde.');
          }
          zona.appendChild(pre);
        });
        zona.appendChild(bPing);
        void bocaB;
      }
      function revisaMarcas() {
        const bien = [1, 2, 3, 4, 5, 6, 7, 8].every(n => !!marcas[n] === rotas.includes(n));
        if (bien && probadas.size === 8) ctx.cumple(1, `Las bocas ${rotas.slice().sort((a, b) => a - b).join(' y ')} no funcionan.`);
        else ctx.deshace(1);
        if (!bien && probadas.size === 8 && Object.values(marcas).some(Boolean)) avisa(aviso, ctx, 'Revisa las marcas: marca solo las bocas que no encienden LINK con el latiguillo bueno.', 'cuidado');
        else avisa(aviso, ctx, '');
      }
      pinta();
    }
  });
})();
