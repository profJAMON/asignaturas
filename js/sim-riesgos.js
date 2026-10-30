/* ============================================================
   Simulaciones de la Unidad 2 de Instalaciones (prevención de
   riesgos laborales), 29/10/2026. Usan el marco de js/simulador.js
   y van en tema.html después de él.

   evalua-riesgos  S3 «Evalúa y baja el riesgo»: tres peligros del
                   taller con la probabilidad y la consecuencia que
                   ha estimado el técnico; el alumno saca la
                   valoración con la matriz, elige la medida que baja
                   el riesgo y vuelve a valorarlo.
   ordena-taller   S4 «Ordena el taller»: siete cosas del taller; cinco
                   son peligros (uno de cada riesgo del lugar de
                   trabajo, la caída de objetos dos veces) y dos están
                   bien y no hay que tocarlas.
   coloca-puesto   S6 «Coloca el puesto»: silla, respaldo, pantalla,
                   ventana y teclado, con el dibujo del puesto y lo
                   que notarías con cada cosa mal colocada.

   Cada una va enlazada a una pregunta obligatoria («(Actividad 1)»).
   Sin colores nuevos: el dibujo del puesto usa currentColor y las
   variables que la ventana de la simulación ya redefine.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function') return;

  function select(opciones, valor, etiqueta) {
    const s = document.createElement('select');
    s.className = 'lab__entrada sim__select';
    if (etiqueta) s.setAttribute('aria-label', etiqueta);
    opciones.forEach(([v, t]) => {
      const o = document.createElement('option');
      o.value = v;
      o.textContent = t;
      if (v === valor) o.selected = true;
      s.appendChild(o);
    });
    return s;
  }

  /* ============================================================
     S3 · Evalúa y baja el riesgo
     ============================================================ */
  const P = { B: 'Baja', M: 'Media', A: 'Alta' };
  const CO = { LD: 'Ligeramente dañino', D: 'Dañino', ED: 'Extremadamente dañino' };
  const MATRIZ = {
    B: { LD: 'T', D: 'TO', ED: 'M' },
    M: { LD: 'TO', D: 'M', ED: 'I' },
    A: { LD: 'M', D: 'I', ED: 'IN' },
  };
  const NOMBRE = { T: 'Trivial', TO: 'Tolerable', M: 'Moderado', I: 'Importante', IN: 'Intolerable' };

  const PELIGROS = [
    {
      nombre: 'Una regleta enchufada a otra regleta, llena de aparatos',
      riesgo: 'incendio por sobrecarga',
      p: 'M', c: 'ED',
      medidas: [
        { t: 'Poner un extintor al lado', mal: 'El extintor sirve cuando ya hay fuego. Aquí hay que conseguir que no empiece.' },
        { t: 'Quitar la segunda regleta y repartir los aparatos en los enchufes de la pared', ok: true, p: 'B', c: 'ED', por: 'Sin sobrecarga, es muy difícil que se caliente y arda: baja la probabilidad. Si ardiera, el daño seguiría siendo igual de grave.' },
        { t: 'Tapar la regleta con una caja para que no estorbe', mal: '¡Peor! Si se calienta, el cartón es combustible. Y lo que está tapado nadie lo revisa.' },
      ],
    },
    {
      nombre: 'Cajas de material apiladas hasta lo alto de la estantería',
      riesgo: 'caída de objetos',
      p: 'M', c: 'D',
      medidas: [
        { t: 'Que todos lleven casco en el taller', mal: 'El EPI va lo último. Antes hay que quitar el peligro: que no haya cajas que se puedan caer.' },
        { t: 'Bajar lo pesado a las baldas de abajo y no apilar más alto de lo que alcanzas', ok: true, p: 'B', c: 'D', por: 'Con lo pesado abajo y nada apilado de más, casi nunca se cae nada: baja la probabilidad.' },
        { t: 'Poner una señal de «cuidado» en la estantería', mal: 'La señal avisa, pero las cajas siguen ahí arriba. Si un peligro se puede quitar, se quita.' },
      ],
    },
    {
      nombre: 'Cortar canaleta sin gafas',
      riesgo: 'virutas que saltan a los ojos',
      p: 'A', c: 'D',
      medidas: [
        { t: 'Cortar con guantes', mal: 'Las virutas saltan a los ojos, no a las manos: los guantes no protegen de este riesgo.' },
        { t: 'Cortar más deprisa para acabar antes', mal: 'Con prisas saltan las mismas virutas o más. No baja nada.' },
        { t: 'Ponerse gafas de protección al cortar', ok: true, p: 'A', c: 'LD', por: 'Las virutas seguirán saltando (la probabilidad no cambia), pero ya no llegan al ojo: baja la consecuencia.' },
      ],
    },
  ];

  registrarSimulacion('evalua-riesgos', {
    ventana: 'Evaluación de riesgos · Taller de redes',
    mision: [
      'Valora los tres riesgos con la matriz.',
      'Elige para cada uno una medida que lo baje.',
      'Vuelve a valorar los tres después de la medida.',
    ],
    final: 'Apunta en tu cuaderno, para cada peligro, la valoración de antes, la medida que elegiste y la valoración de después. Y por qué no valían los guantes al cortar canaleta (pregunta 13).',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const est = PELIGROS.map(() => ({ fase: 0, medida: null }));

      function revisar() {
        const f = n => est.every(e => e.fase >= n);
        if (f(1)) ctx.cumple(0); else ctx.deshace(0);
        if (f(2)) ctx.cumple(1); else ctx.deshace(1);
        if (f(3)) ctx.cumple(2); else ctx.deshace(2);
      }

      function botonesValoracion(caja, p, c, alAcertar, quien) {
        const fila = el('div', 'lab__fila');
        fila.setAttribute('role', 'group');
        fila.setAttribute('aria-label', 'Valoración');
        const msg = el('div');
        msg.setAttribute('aria-live', 'polite');
        Object.keys(NOMBRE).forEach(k => {
          const b = boton(NOMBRE[k]);
          b.addEventListener('click', () => {
            msg.innerHTML = '';
            if (k === MATRIZ[p][c]) {
              alAcertar(k);
            } else {
              ctx.falla(`${quien}: «${NOMBRE[k]}» no es.`);
              msg.appendChild(ctx.aviso(`Busca en la matriz la fila «${P[p]}» y la columna «${CO[c]}». Donde se cruzan está la valoración.`));
            }
          });
          fila.appendChild(b);
        });
        caja.appendChild(fila);
        caja.appendChild(msg);
      }

      function pintar() {
        pantalla.innerHTML = '';
        pantalla.appendChild(el('p', 'sim__ayuda', 'El técnico de prevención ya ha estimado la probabilidad y la consecuencia de cada riesgo. Tú sacas la valoración con la matriz de la sesión y decides la medida.'));
        PELIGROS.forEach((pe, i) => {
          const e = est[i];
          const caja = el('div', 'sim__mensaje');
          caja.appendChild(el('p', 'sim__h', `${i + 1}. ${pe.nombre}`));
          caja.appendChild(el('p', null, `Riesgo: ${pe.riesgo}.`));
          caja.appendChild(el('p', 'sim__etiqueta', `Probabilidad: ${P[pe.p]} · Consecuencia: ${CO[pe.c]}`));
          if (e.fase === 0) {
            caja.appendChild(el('p', null, '¿Qué valoración tiene?'));
            botonesValoracion(caja, pe.p, pe.c, k => {
              e.fase = 1;
              ctx.apunta(`${pe.nombre}: ${P[pe.p]} × ${CO[pe.c]} = ${NOMBRE[k]}.`);
              revisar();
              pintar();
            }, pe.nombre);
          } else {
            caja.appendChild(el('p', null, `Valoración: ${NOMBRE[MATRIZ[pe.p][pe.c]]}.`));
          }
          if (e.fase === 1) {
            caja.appendChild(el('p', null, '¿Qué medida lo baja?'));
            const fila = el('div', 'lab__fila');
            const msg = el('div');
            msg.setAttribute('aria-live', 'polite');
            pe.medidas.forEach(m => {
              const b = boton(m.t);
              b.addEventListener('click', () => {
                msg.innerHTML = '';
                if (m.ok) {
                  e.fase = 2;
                  e.medida = m;
                  ctx.apunta(`${pe.nombre}: medida «${m.t}».`);
                  revisar();
                  pintar();
                } else {
                  ctx.falla(`${pe.nombre}: «${m.t}».`);
                  msg.appendChild(ctx.aviso(m.mal));
                }
              });
              fila.appendChild(b);
            });
            caja.appendChild(fila);
            caja.appendChild(msg);
          }
          if (e.fase >= 2) {
            const m = e.medida;
            caja.appendChild(el('p', null, `Medida: ${m.t}.`));
            caja.appendChild(el('p', 'sim__ayuda', m.por));
            caja.appendChild(el('p', 'sim__etiqueta', `Ahora: probabilidad ${P[m.p]} · consecuencia ${CO[m.c]}`));
          }
          if (e.fase === 2) {
            caja.appendChild(el('p', null, '¿Qué valoración tiene ahora?'));
            botonesValoracion(caja, e.medida.p, e.medida.c, k => {
              e.fase = 3;
              ctx.apunta(`${pe.nombre}: después, ${P[e.medida.p]} × ${CO[e.medida.c]} = ${NOMBRE[k]}.`);
              revisar();
              pintar();
            }, pe.nombre + ' (después)');
          }
          if (e.fase === 3) {
            caja.appendChild(ctx.aviso(`De ${NOMBRE[MATRIZ[pe.p][pe.c]]} a ${NOMBRE[MATRIZ[e.medida.p][e.medida.c]]}.`, 'ok'));
          }
          pantalla.appendChild(caja);
        });
      }
      pintar();
    },
  });

  /* ============================================================
     S4 · Ordena el taller
     ============================================================ */
  const COSAS = [
    {
      id: 'latiguillo', icono: '〰️', nombre: 'Un latiguillo cruzando el pasillo', arreglado: 'Latiguillo guardado en su estantería',
      opciones: [
        { t: 'Pasar por encima con cuidado', mal: 'Tú tendrás cuidado, pero el siguiente que pase con una caja en brazos no lo verá.' },
        { t: 'Recogerlo y guardarlo en su estantería', ok: 0, hecho: 'Latiguillo recogido: evita una caída al mismo nivel.' },
      ],
    },
    {
      id: 'silla', icono: '🪑', nombre: 'Un compañero subido a una silla con ruedas para llegar a la pared', arreglado: 'El compañero usa la escalera de tijera, abierta del todo',
      opciones: [
        { t: 'Que alguien le sujete la silla', mal: 'Una silla con ruedas se escapa aunque la sujeten. Para subir, solo escaleras homologadas.' },
        { t: 'Que baje y use la escalera de tijera, abierta del todo', ok: 1, hecho: 'Silla cambiada por la escalera: evita una caída a distinto nivel.' },
      ],
    },
    {
      id: 'herramientas', icono: '🪜', nombre: 'Herramientas dejadas en el último peldaño de la escalera', arreglado: 'Herramientas en el cinturón portaherramientas',
      opciones: [
        { t: 'Llevarlas en el cinturón portaherramientas', ok: 2, hecho: 'Herramientas al cinturón: evita una caída de objetos.' },
        { t: 'Dejarlas, que luego hacen falta', mal: 'Al mover la escalera caen encima del que sujeta. Y arriba tienes que tener las manos libres.' },
      ],
    },
    {
      id: 'bobina', icono: '📦', nombre: 'Una bobina de cable de 10 kg en la balda de arriba', arreglado: 'Bobina en la balda de abajo',
      opciones: [
        { t: 'Bajarla a la balda de abajo', ok: 2, hecho: 'Bobina abajo: evita una caída de objetos (y cogerla por encima de la cabeza).' },
        { t: 'Ponerle las cajas de conectores encima para que no se mueva', mal: 'Así hay todavía más peso arriba. Lo pesado va abajo.' },
      ],
    },
    {
      id: 'rack', icono: '🚪', nombre: 'La puerta del rack abierta en medio del paso', arreglado: 'Puerta del rack cerrada',
      opciones: [
        { t: 'Dejarla abierta, que vuelvo en cinco minutos', mal: 'En cinco minutos alguien se da con la esquina. Se cierra aunque vayas a volver.' },
        { t: 'Cerrarla', ok: 3, hecho: 'Puerta del rack cerrada: evita golpes contra objetos.' },
      ],
    },
    {
      id: 'extintor', icono: '🧯', nombre: 'El extintor, colgado en la pared y sin nada delante', bien: 'Está bien así: a la vista y sin nada que lo tape. No hay que tocarlo.',
      opciones: [
        { t: 'Guardarlo en el armario para que no estorbe', mal: 'Un extintor guardado no se encuentra cuando hace falta. Tiene que estar a la vista y sin nada delante.' },
        { t: 'Dejarlo como está', bueno: true },
      ],
    },
    {
      id: 'conectores', icono: '🗃️', nombre: 'Cajas de conectores RJ-45 en la balda de arriba', bien: 'Está bien: lo ligero puede ir arriba.',
      opciones: [
        { t: 'Bajarlas al suelo', mal: 'En el suelo estorban y hacen tropezar. Lo ligero puede ir arriba; lo pesado, abajo.' },
        { t: 'Dejarlas como están', bueno: true },
      ],
    },
  ];

  registrarSimulacion('ordena-taller', {
    ventana: 'Taller de redes · antes de empezar la clase',
    mision: [
      'Quita lo que puede hacer tropezar a alguien.',
      'Arregla lo que puede hacer caer a alguien desde una altura.',
      'Arregla las dos cosas que pueden caer encima de alguien.',
      'Arregla lo que puede golpear a alguien que pasa.',
    ],
    final: 'Apunta en tu cuaderno los cinco peligros que has arreglado, qué riesgo del lugar de trabajo era cada uno y qué hiciste (pregunta 9).',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const hecho = {};
      let sel = null;

      function revisar() {
        const ok = idx => COSAS.filter(c => c.opciones.some(o => o.ok === idx)).every(c => hecho[c.id]);
        [0, 1, 2, 3].forEach(i => (ok(i) ? ctx.cumple(i) : ctx.deshace(i)));
      }

      function pintar(aviso) {
        pantalla.innerHTML = '';
        pantalla.appendChild(el('p', 'sim__ayuda', 'Toca cada cosa del taller y decide qué haces. Cuidado: no todo está mal.'));
        const lista = el('div', 'lab__fila');
        COSAS.forEach(c => {
          const t = hecho[c.id] ? '✓ ' + c.arreglado : `${c.icono} ${c.nombre}`;
          const b = boton(t, 'lab__boton' + (sel === c ? ' lab__boton--activo' : ''));
          b.setAttribute('aria-pressed', String(sel === c));
          if (hecho[c.id]) b.disabled = true;
          b.addEventListener('click', () => { sel = c; pintar(); });
          lista.appendChild(b);
        });
        pantalla.appendChild(lista);
        if (sel && !hecho[sel.id]) {
          const caja = el('div', 'sim__mensaje');
          caja.appendChild(el('p', 'sim__h', `${sel.icono} ${sel.nombre}`));
          caja.appendChild(el('p', null, '¿Qué haces?'));
          const fila = el('div', 'lab__fila');
          sel.opciones.forEach(o => {
            const b = boton(o.t);
            b.addEventListener('click', () => {
              const c = sel;
              if (o.mal) {
                ctx.falla(`${c.nombre}: «${o.t}».`);
                pintar(ctx.aviso(o.mal));
              } else if (o.bueno) {
                ctx.apunta(`${c.nombre}: ${c.bien}`);
                sel = null;
                pintar(ctx.aviso(c.bien, 'ok'));
              } else {
                hecho[c.id] = true;
                sel = null;
                ctx.apunta(o.hecho);
                revisar();
                pintar(ctx.aviso(o.hecho, 'ok'));
              }
            });
            fila.appendChild(b);
          });
          caja.appendChild(fila);
          pantalla.appendChild(caja);
        }
        if (aviso) pantalla.appendChild(aviso);
      }
      pintar();
    },
  });

  /* ============================================================
     S6 · Coloca el puesto
     ============================================================ */
  const NS = 'http://www.w3.org/2000/svg';
  function dibujoPuesto(s) {
    const silla = { baja: 136, bien: 118, alta: 102 }[s.silla];
    const pies = s.silla === 'alta' ? silla + 30 : 160;
    const rodilla = s.silla === 'baja' ? silla - 12 : silla;
    const respaldo = s.respaldo ? 104 : 92;
    const pant = { arriba: 22, bien: 50, abajo: 72 }[s.altura];
    const px = 150 + s.distancia * 1.6;
    const ojos = silla - 64;
    const linea = (x1, y1, x2, y2, clase) => `<path d="M ${x1} ${y1} L ${x2} ${y2}" class="${clase || 'sim6-l'}"/>`;
    let g = '';
    g += linea(10, 162, 350, 162, 'sim6-t');
    // silla
    g += linea(96, silla - 52, 96, silla) + linea(90, silla, 146, silla) + linea(118, silla, 118, 160) + linea(98, 160, 138, 160);
    // persona
    g += `<circle cx="${respaldo + 14}" cy="${ojos + 2}" r="9" class="sim6-l"/>`;
    g += linea(respaldo + 12, ojos + 11, 104, silla - 4) + linea(104, silla - 4, 156, rodilla) + linea(156, rodilla, 156, pies) + linea(156, pies, 172, pies);
    // brazos y teclado
    const tecX = s.teclado ? 176 : 160;
    g += linea(respaldo + 10, ojos + 20, 112, silla - 22) + linea(112, silla - 22, tecX, 102);
    g += linea(150, 104, 345, 104, 'sim6-t') + linea(335, 104, 335, 160, 'sim6-t');
    g += `<rect x="${tecX}" y="99" width="30" height="5" rx="1" class="sim6-l"/>`;
    // pantalla
    g += linea(px + 4, 104, px + 4, pant + 42) + `<rect x="${px}" y="${pant}" width="8" height="42" rx="1" class="sim6-a"/>`;
    // ventana
    if (s.ventana === 'detras-pantalla') g += `<rect x="${Math.min(px + 24, 330)}" y="16" width="14" height="70" class="sim6-v"/>`;
    if (s.ventana === 'detras-ti') g += `<rect x="20" y="16" width="14" height="70" class="sim6-v"/>`;
    return `<svg viewBox="0 0 360 170" role="img" aria-hidden="true" focusable="false">
<style>.sim6-l{fill:none;stroke:currentColor;stroke-width:2}.sim6-t{fill:none;stroke:currentColor;stroke-width:1.5;opacity:.45}.sim6-a{fill:none;stroke:var(--accent);stroke-width:2.5}.sim6-v{fill:none;stroke:var(--accent);stroke-width:2;stroke-dasharray:4 3}</style>${g}</svg>`;
  }

  registrarSimulacion('coloca-puesto', {
    ventana: 'Tu puesto con ordenador',
    mision: [
      'Ajusta la silla: muslos horizontales, pies apoyados y espalda apoyada.',
      'Pon la pantalla a buena distancia y a buena altura.',
      'Colócala bien respecto a la ventana.',
      'Deja sitio delante del teclado para las muñecas.',
    ],
    final: 'Apunta en tu cuaderno cómo has dejado la silla, la pantalla (distancia y altura), la ventana y el teclado, y qué notabas al principio con cada cosa mal colocada (pregunta 12).',
    crear(ctx) {
      const { el, pantalla } = ctx;
      const s = { silla: 'alta', respaldo: false, distancia: 30, altura: 'abajo', ventana: 'detras-pantalla', teclado: false };
      const dibujo = el('div', 'sim__vista');
      const notas = el('ul');
      notas.setAttribute('aria-live', 'polite');

      function sintomas() {
        const n = [];
        if (s.silla === 'alta') n.push('Los pies te cuelgan y se te duermen las piernas.');
        if (s.silla === 'baja') n.push('Las rodillas te quedan por encima de las caderas y te duele la espalda.');
        if (!s.respaldo) n.push('Estás echado hacia delante, sin apoyar la espalda: al rato te duele.');
        if (s.distancia < 40) n.push('La pantalla está demasiado cerca: te escuecen los ojos.');
        if (s.distancia > 80) n.push('La pantalla está tan lejos que te inclinas para leer.');
        if (s.altura === 'abajo') n.push('Miras hacia abajo todo el rato: te duele el cuello.');
        if (s.altura === 'arriba') n.push('Levantas la barbilla para mirar: te duele la nuca.');
        if (s.ventana === 'detras-pantalla') n.push('La luz de la ventana te da de cara y te deslumbra.');
        if (s.ventana === 'detras-ti') n.push('La ventana se refleja en la pantalla y no ves bien.');
        if (!s.teclado) n.push('El teclado está en el borde: las muñecas quedan en el aire.');
        return n;
      }

      function actualizar(texto) {
        dibujo.innerHTML = dibujoPuesto(s);
        notas.innerHTML = '';
        const n = sintomas();
        if (n.length === 0) notas.appendChild(el('li', null, 'Estás cómodo: no notas nada raro.'));
        n.forEach(t => notas.appendChild(el('li', 'sim__peligro', t)));
        const ok = [
          s.silla === 'bien' && s.respaldo,
          s.distancia >= 40 && s.distancia <= 80 && s.altura === 'bien',
          s.ventana === 'lado',
          s.teclado,
        ];
        ok.forEach((v, i) => (v ? ctx.cumple(i) : ctx.deshace(i)));
        if (texto) ctx.apunta(texto);
      }

      pantalla.appendChild(el('p', 'sim__ayuda', 'Así está el puesto ahora. Cambia cada cosa y mira el dibujo y «Lo que notas».'));
      pantalla.appendChild(dibujo);
      pantalla.appendChild(el('p', 'sim__h', 'Lo que notas'));
      pantalla.appendChild(notas);

      const ajustes = el('div', 'sim__dos');
      function campo(texto, control) {
        const l = el('label', 'sim__campo');
        l.appendChild(el('span', 'sim__ayuda', texto));
        l.appendChild(control);
        ajustes.appendChild(l);
      }
      const sSilla = select([['baja', 'Muy baja'], ['bien', 'A la altura justa'], ['alta', 'Muy alta']], s.silla, 'Altura de la silla');
      sSilla.addEventListener('change', () => { s.silla = sSilla.value; actualizar(`Silla: ${sSilla.selectedOptions[0].textContent.toLowerCase()}.`); });
      campo('Altura de la silla', sSilla);
      const sResp = select([['no', 'Echado hacia delante'], ['si', 'Espalda apoyada']], 'no', 'Respaldo');
      sResp.addEventListener('change', () => { s.respaldo = sResp.value === 'si'; actualizar(`Respaldo: ${sResp.selectedOptions[0].textContent.toLowerCase()}.`); });
      campo('Respaldo', sResp);

      const dist = document.createElement('input');
      dist.type = 'range';
      dist.min = '20';
      dist.max = '100';
      dist.step = '5';
      dist.value = String(s.distancia);
      dist.style.width = '100%';
      dist.style.accentColor = 'var(--accent)';
      const dTexto = el('span', 'sim__etiqueta', `${s.distancia} cm`);
      dist.setAttribute('aria-valuetext', `${s.distancia} centímetros`);
      dist.addEventListener('input', () => {
        s.distancia = Number(dist.value);
        dTexto.textContent = `${s.distancia} cm`;
        dist.setAttribute('aria-valuetext', `${s.distancia} centímetros`);
        actualizar();
      });
      dist.addEventListener('change', () => ctx.apunta(`Pantalla a ${s.distancia} cm.`));
      const lDist = el('label', 'sim__campo');
      lDist.appendChild(el('span', 'sim__ayuda', 'Distancia de los ojos a la pantalla'));
      lDist.appendChild(dist);
      lDist.appendChild(dTexto);
      ajustes.appendChild(lDist);

      const sAlt = select([['abajo', 'Muy baja'], ['bien', 'Borde a la altura de los ojos'], ['arriba', 'Muy alta']], s.altura, 'Altura de la pantalla');
      sAlt.addEventListener('change', () => { s.altura = sAlt.value; actualizar(`Pantalla: ${sAlt.selectedOptions[0].textContent.toLowerCase()}.`); });
      campo('Altura de la pantalla', sAlt);
      const sVen = select([['detras-pantalla', 'Detrás de la pantalla'], ['detras-ti', 'Detrás de mí'], ['lado', 'A un lado']], s.ventana, 'Dónde queda la ventana');
      sVen.addEventListener('change', () => { s.ventana = sVen.value; actualizar(`Ventana: ${sVen.selectedOptions[0].textContent.toLowerCase()}.`); });
      campo('Dónde queda la ventana', sVen);
      const sTec = select([['borde', 'En el borde de la mesa'], ['sitio', 'Con 10 cm delante']], 'borde', 'Teclado');
      sTec.addEventListener('change', () => { s.teclado = sTec.value === 'sitio'; actualizar(`Teclado: ${sTec.selectedOptions[0].textContent.toLowerCase()}.`); });
      campo('Teclado', sTec);

      pantalla.appendChild(el('p', 'sim__h', 'Ajustes'));
      pantalla.appendChild(ajustes);
      actualizar();
    },
  });
})();
