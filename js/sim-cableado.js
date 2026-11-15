/* ============================================================
   Unidades 8 y 9 de Instalaciones (cableado estructurado y montaje
   de la red), 15/11/2026. Va en tema.html después de
   js/simulador.js.

   SIMULACIÓN (con pregunta enlazada)
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
