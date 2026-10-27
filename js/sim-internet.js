/* ============================================================
   Simulaciones de la Unidad 4 de Operaciones (el navegador,
   buscadores y correo), 27/10/2026. Usan el marco de
   js/simulador.js y van en tema.html después de él.

   navegador  S1 «Ordena este navegador»: recuperar una pestaña,
              ordenar favoritos en una carpeta, encontrar una web en
              el historial y dejar el zoom al 100 %, con botones de
              atajos de teclado.
   buscador   S2 «Encuéntralo»: un buscador de mentira que entiende
              los cinco operadores de la sesión (" ", -, site:,
              filetype:, OR) y cinco retos. Los anuncios no hacen
              caso de los operadores, como en uno de verdad.
   bandeja    S3 «Revisa la bandeja»: seis correos; denunciar los de
              phishing, mandar la publicidad a spam y quedarse con
              los buenos. «Ver adónde lleva» enseña el enlace real.

   Todo inventado: webs, correos y nombres. Nada se guarda.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window.registrarSimulacion !== 'function') return;

  const norm = t => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
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
     S1 · Ordena este navegador
     ============================================================ */
  registrarSimulacion('navegador', {
    ventana: 'Chrome de mentira',
    mision: [
      'Recupera la pestaña de la web de materiales, que se ha cerrado sin querer.',
      'Mete en la carpeta «Clase» los tres favoritos de clase. «Juegos gratis» se queda fuera.',
      'Encuentra en el historial la tienda de bicis que viste el martes y ábrela.',
      'La pestaña de Wikipedia está al 150 %: déjala al 100 %.',
    ],
    final: 'Apunta en tu cuaderno el atajo que usaste para cada una de las cuatro cosas, o dónde pulsaste si no había atajo (pregunta 12).',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const s = {
        tabs: [
          { n: 'YouTube', url: 'youtube.com', zoom: 100 },
          { n: 'Wikipedia', url: 'es.wikipedia.org', zoom: 150 },
        ],
        activa: 1,
        cerradas: [{ n: 'Materiales', url: 'asignaturas.profesorjamon.workers.dev', zoom: 100 }],
        favs: [
          { n: 'Web de materiales', clase: true, en: 'barra' },
          { n: 'Juegos gratis', clase: false, en: 'barra' },
          { n: 'Classroom', clase: true, en: 'barra' },
          { n: 'Gmail del instituto', clase: true, en: 'barra' },
        ],
        vista: 'web', busca: '', abierta: false,
      };
      const HIST = [
        { d: 'Hoy', h: '16:02', n: 'Wikipedia: Navegador web', url: 'es.wikipedia.org' },
        { d: 'Hoy', h: '15:40', n: 'YouTube', url: 'youtube.com' },
        { d: 'Hoy', h: '15:05', n: 'Web de materiales', url: 'asignaturas.profesorjamon.workers.dev' },
        { d: 'Martes', h: '18:31', n: 'Pedalea: tienda de bicis', url: 'pedalea-bicis.es', bici: true },
        { d: 'Martes', h: '18:20', n: 'Gmail del instituto', url: 'mail.google.com' },
        { d: 'Martes', h: '18:15', n: 'El tiempo en Palma', url: 'eltiempo-palma.es' },
        { d: 'Lunes', h: '15:10', n: 'Classroom', url: 'classroom.google.com' },
      ];
      const marco = el('div', 'sim__nav');
      const tiras = el('div', 'sim__pestanas');
      const fav = el('div', 'sim__favoritos');
      const dir = el('div', 'sim__direccion');
      dir.setAttribute('translate', 'no');
      const web = el('div', 'sim__web');
      marco.appendChild(tiras);
      marco.appendChild(dir);
      marco.appendChild(fav);
      marco.appendChild(web);
      pantalla.appendChild(marco);
      const msg = el('div');
      msg.setAttribute('aria-live', 'polite');
      pantalla.appendChild(msg);
      pantalla.appendChild(el('p', 'sim__etiqueta', 'Teclado: pulsa un atajo'));
      const teclas = el('div', 'lab__fila');
      pantalla.appendChild(teclas);

      const ATAJOS = [
        ['Ctrl + T', () => { s.tabs.push({ n: 'Pestaña nueva', url: '', zoom: 100 }); s.activa = s.tabs.length - 1; s.vista = 'web'; ctx.apunta('Ctrl + T: pestaña nueva.'); }],
        ['Ctrl + W', () => {
          if (!s.tabs.length) return;
          const t = s.tabs.splice(s.activa, 1)[0];
          s.cerradas.unshift(t);
          s.activa = Math.max(0, s.activa - 1);
          ctx.apunta(`Ctrl + W: cerrar la pestaña «${t.n}».`);
          if (t.n === 'Materiales' && ctx.hecho(0)) { ctx.deshace(0); ctx.falla('Has vuelto a cerrar la pestaña de materiales.'); }
        }],
        ['Ctrl + Shift + T', () => {
          const t = s.cerradas.shift();
          if (!t) { aviso('No queda ninguna pestaña cerrada que recuperar.'); return; }
          s.tabs.push(t);
          s.activa = s.tabs.length - 1;
          s.vista = 'web';
          if (t.n === 'Materiales') ctx.cumple(0, 'Ctrl + Shift + T: vuelve la pestaña de la web de materiales.');
          else ctx.apunta(`Ctrl + Shift + T: vuelve «${t.n}».`);
        }],
        ['Ctrl + Tab', () => { if (s.tabs.length) s.activa = (s.activa + 1) % s.tabs.length; s.vista = 'web'; }],
        ['Ctrl + H', () => { s.vista = 'historial'; ctx.apunta('Ctrl + H: abrir el historial.'); }],
        ['Ctrl + J', () => { s.vista = 'descargas'; ctx.apunta('Ctrl + J: abrir la lista de descargas.'); }],
        ['Ctrl + +', () => zoom(+10)],
        ['Ctrl + -', () => zoom(-10)],
        ['Ctrl + 0', () => zoom(0)],
      ];
      ATAJOS.forEach(([t, f]) => {
        const b = boton(t, 'lab__boton sim__tecla');
        b.setAttribute('translate', 'no');
        b.addEventListener('click', () => { msg.innerHTML = ''; f(); pintar(); });
        teclas.appendChild(b);
      });
      function aviso(t, tipo) { msg.innerHTML = ''; msg.appendChild(ctx.aviso(t, tipo)); }
      function zoom(d) {
        const t = s.tabs[s.activa];
        if (!t || s.vista !== 'web') { aviso('El zoom se cambia en una página. Vuelve a una pestaña.'); return; }
        t.zoom = d === 0 ? 100 : Math.min(200, Math.max(50, t.zoom + d));
        if (t.n === 'Wikipedia') {
          if (t.zoom === 100) ctx.cumple(3, d === 0 ? 'Ctrl + 0 en Wikipedia: zoom al 100 %.' : 'Ctrl + - en Wikipedia hasta el 100 %.');
          else if (ctx.hecho(3)) ctx.deshace(3);
        }
      }
      function compruebaFavs() {
        const bien = s.favs.every(f => (f.en === 'clase') === f.clase);
        if (bien) ctx.cumple(1, 'Favoritos: Web de materiales, Classroom y Gmail del instituto dentro de «Clase»; «Juegos gratis», fuera.');
        else if (ctx.hecho(1)) ctx.deshace(1);
      }

      function pintar() {
        tiras.innerHTML = '';
        s.tabs.forEach((t, i) => {
          const b = boton(t.n, 'sim__pestana' + (i === s.activa && s.vista === 'web' ? ' sim__pestana--activa' : ''));
          b.addEventListener('click', () => { s.activa = i; s.vista = 'web'; msg.innerHTML = ''; pintar(); });
          tiras.appendChild(b);
        });
        if (!s.tabs.length) tiras.appendChild(el('span', 'sim__ayuda', 'No hay pestañas abiertas.'));
        const t = s.tabs[s.activa];
        dir.textContent = s.vista === 'historial' ? 'chrome://history' : s.vista === 'descargas' ? 'chrome://downloads' : (t && t.url) || '';

        fav.innerHTML = '';
        const enBarra = s.favs.filter(f => f.en === 'barra');
        const enClase = s.favs.filter(f => f.en === 'clase');
        const carpeta = el('div', 'sim__carpeta');
        const sum = boton(`📁 Clase (${enClase.length}) ${s.abierta ? '▾' : '▸'}`, 'sim__tema');
        sum.setAttribute('aria-expanded', String(!!s.abierta));
        sum.addEventListener('click', () => { s.abierta = !s.abierta; pintar(); });
        carpeta.appendChild(sum);
        if (s.abierta) {
          enClase.forEach(f => carpeta.appendChild(favorito(f)));
          if (!enClase.length) carpeta.appendChild(el('p', 'sim__ayuda', 'Vacía.'));
        }
        fav.appendChild(carpeta);
        enBarra.forEach(f => fav.appendChild(favorito(f)));

        web.innerHTML = '';
        if (s.vista === 'historial') return pintarHistorial();
        if (s.vista === 'descargas') {
          web.appendChild(el('p', 'sim__h', 'Descargas'));
          web.appendChild(el('p', null, 'horario-1r.pdf · Mostrar en la carpeta'));
          web.appendChild(el('p', 'sim__ayuda', 'Esto es la lista de descargas, no el historial.'));
          return;
        }
        if (!t) { web.appendChild(el('p', 'sim__ayuda', 'Abre una pestaña con Ctrl + T o recupera una cerrada.')); return; }
        const cont = el('div', 'sim__web-cont');
        cont.style.fontSize = (t.zoom / 100) + 'em';
        cont.appendChild(el('p', 'sim__h', t.n));
        cont.appendChild(el('p', null, t.url ? 'Así se ve la página.' : 'Pestaña nueva: escribe una dirección arriba.'));
        web.appendChild(cont);
        web.appendChild(el('p', 'sim__zoom', `🔍 ${t.zoom} %`));
      }
      function favorito(f) {
        const d = el('span', 'sim__fav');
        d.appendChild(el('span', null, '⭐ ' + f.n));
        const m = select([['barra', 'En la barra'], ['clase', 'En «Clase»']], f.en, 'Dónde está ' + f.n);
        m.addEventListener('change', () => {
          f.en = m.value;
          ctx.apunta(`Mover «${f.n}» ${f.en === 'clase' ? 'a la carpeta «Clase»' : 'a la barra'}.`);
          if (f.en === 'clase' && !f.clase) aviso('«Juegos gratis» no es de clase: no va en esa carpeta.');
          compruebaFavs();
          pintar();
        });
        d.appendChild(m);
        return d;
      }
      function pintarHistorial() {
        web.appendChild(el('p', 'sim__h', 'Historial'));
        const b = document.createElement('input');
        b.type = 'search';
        b.className = 'lab__entrada';
        b.placeholder = 'Buscar en el historial';
        b.setAttribute('aria-label', 'Buscar en el historial');
        b.value = s.busca;
        const lista = el('div', 'sim__hist');
        function filtra() {
          s.busca = b.value;
          lista.innerHTML = '';
          const q = norm(b.value.trim());
          let dia = '';
          HIST.filter(h => !q || norm(h.n + ' ' + h.url).includes(q)).forEach(h => {
            if (h.d !== dia) { dia = h.d; lista.appendChild(el('p', 'sim__etiqueta', dia)); }
            const fila = el('div', 'sim__hist-fila');
            fila.appendChild(el('span', 'sim__ayuda', h.h));
            const a = boton(h.n, 'sim__tema');
            a.addEventListener('click', () => {
              s.tabs.push({ n: h.n.split(':')[0], url: h.url, zoom: 100 });
              s.activa = s.tabs.length - 1;
              s.vista = 'web';
              if (h.bici) ctx.cumple(2, `Ctrl + H, buscar «${b.value.trim() || 'bici'}» y abrir «${h.n}» (martes, ${h.h}).`);
              else ctx.apunta(`Abrir desde el historial «${h.n}».`);
              pintar();
            });
            fila.appendChild(a);
            lista.appendChild(fila);
          });
          if (!lista.childNodes.length) lista.appendChild(el('p', 'sim__ayuda', 'No hay nada con esa palabra.'));
        }
        b.addEventListener('input', filtra);
        web.appendChild(b);
        web.appendChild(lista);
        filtra();
      }
      pintar();
    },
  });

  /* ============================================================
     S2 · Encuéntralo
     ============================================================ */
  const PAGINAS = [
    { t: 'Receta de lentejas con chorizo', u: 'recetasfaciles.es/lentejas-chorizo', x: 'receta lentejas con chorizo y morcilla, el guiso de la abuela' },
    { t: 'Lentejas estofadas con verduras', u: 'cocinaconana.es/lentejas-verduras', x: 'receta lentejas estofadas con zanahoria, pimiento y patata' },
    { t: 'Lentejas al curry', u: 'verdeplato.es/lentejas-curry', x: 'receta lentejas veganas al curry con leche de coco' },
    { t: 'Chorizo a la sidra', u: 'recetasfaciles.es/chorizo-sidra', x: 'receta chorizo a la sidra, tapa asturiana' },
    { t: 'Tortilla de patatas jugosa', u: 'cocinaconana.es/tortilla-patatas', x: 'receta tortilla de patatas con cebolla' },
    { t: 'Croquetas de jamón caseras', u: 'abuelacocina.es/croquetas', x: 'receta croquetas de jamón con bechamel' },
    { t: 'Historia de la tortilla de patatas', u: 'historiasdecomida.es/tortilla', x: 'de donde viene la tortilla de patatas' },
    { t: 'Calendario escolar 2026-2027', u: 'iesramonllull.net/calendario', x: 'calendario escolar del curso, festivos y evaluaciones del instituto' },
    { t: 'Calendario escolar de las Illes Balears', u: 'caib.es/educacio/calendario', x: 'calendario escolar oficial para todos los centros de baleares' },
    { t: 'Horario de clases de 1.º de FP', u: 'iesramonllull.net/horario-fp1', x: 'horario de clases semanal de formacion profesional' },
    { t: 'Apuntes de redes locales', u: 'iesramonllull.net/apuntes/redes.pdf', x: 'apuntes de redes locales: cables, switch y router', pdf: true },
    { t: 'Redes locales explicadas fácil', u: 'blogtec.es/redes-locales', x: 'apuntes y explicacion de las redes locales en casa' },
    { t: 'Guía de redes sociales para familias', u: 'internetsegura.es/guia-redes.pdf', x: 'guia de redes sociales y privacidad para familias', pdf: true },
    { t: '¿Qué es la red de área local (LAN)?', u: 'wikired.es/lan', x: 'la red de area local une los ordenadores de un mismo edificio' },
    { t: 'Bar La Red: comida local', u: 'barlared.es', x: 'la red de amigos del barrio: comida local en un area tranquila' },
    { t: 'Jaguar, el felino de América', u: 'animalesdelmundo.es/jaguar', x: 'el jaguar es el felino mas grande de america' },
    { t: 'Jaguar F-Type: precio del coche', u: 'motorhoy.es/jaguar-f-type', x: 'jaguar coche deportivo precio y prueba' },
  ];
  const ANUNCIOS = [
    { para: 'lentejas', t: 'Lentejas con chorizo en lata · 2x1', u: 'superpaco.es/ofertas', x: 'compra ya lentejas con chorizo listas para calentar' },
    { para: 'tortilla', t: 'Tortilla precocinada a domicilio', u: 'comidarapida.es', x: 'pide tortilla y croquetas en 30 minutos' },
  ];
  function analizar(q) {
    const terms = [];
    let resto = q.replace(/"([^"]*)"/g, (_, f) => { terms.push({ tipo: 'frase', v: norm(f.trim()) }); return ' '; });
    const toks = resto.split(/\s+/).filter(Boolean);
    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      if (t === 'OR' && terms.length && toks[i + 1]) {
        const prev = terms.pop();
        const sig = norm(toks[++i]);
        const ops = prev.tipo === 'o' ? prev.v.concat(sig) : [prev.v, sig];
        terms.push({ tipo: 'o', v: ops });
      } else if (/^-./.test(t)) terms.push({ tipo: 'no', v: norm(t.slice(1)) });
      else if (/^site:./i.test(t)) terms.push({ tipo: 'site', v: norm(t.slice(5)) });
      else if (/^filetype:./i.test(t)) terms.push({ tipo: 'tipo', v: norm(t.slice(9)) });
      else terms.push({ tipo: 'si', v: norm(t) });
    }
    return terms;
  }
  function casa(p, terms) {
    const txt = norm(p.t + ' ' + p.x + ' ' + p.u);
    const palabras = txt.split(/[^a-z0-9ñ]+/);
    const tiene = w => palabras.indexOf(w) !== -1;
    return terms.every(t => {
      if (t.tipo === 'frase') return txt.replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').includes(t.v);
      if (t.tipo === 'no') return !tiene(t.v);
      if (t.tipo === 'site') return p.u.startsWith(t.v);
      if (t.tipo === 'tipo') return t.v === 'pdf' ? !!p.pdf : false;
      if (t.tipo === 'o') return t.v.some(tiene);
      return tiene(t.v);
    });
  }
  const tieneP = (p, w) => norm(p.t + ' ' + p.x).split(/[^a-z0-9ñ]+/).indexOf(w) !== -1;
  const RETOS = [
    { r: res => res.length > 0 && res.every(p => tieneP(p, 'lentejas') && !tieneP(p, 'chorizo')) },
    { r: res => res.length > 0 && res.every(p => p.u.startsWith('iesramonllull.net') && tieneP(p, 'calendario')) },
    { r: res => res.length > 0 && res.every(p => p.pdf && tieneP(p, 'apuntes') && tieneP(p, 'redes')) },
    { r: res => res.length === 1 && res[0].u === 'wikired.es/lan' },
    { r: res => res.some(p => tieneP(p, 'tortilla')) && res.some(p => tieneP(p, 'croquetas')) && res.every(p => tieneP(p, 'receta')) },
  ];

  registrarSimulacion('buscador', {
    ventana: 'Buscador de mentira',
    mision: [
      'Recetas de lentejas, pero ninguna con chorizo.',
      'El calendario escolar, pero solo de la web del instituto (iesramonllull.net).',
      'Apuntes de redes que sean un PDF.',
      'Solo la página que tenga, tal cual, «la red de área local».',
      'Recetas de tortilla o de croquetas, las dos a la vez.',
    ],
    final: 'Apunta en tu cuaderno la búsqueda exacta que escribiste para cada reto (pregunta 8).',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      pantalla.appendChild(el('p', 'sim__ayuda', 'Este buscador solo tiene unas pocas webs inventadas, pero entiende los cinco operadores de la tabla. Escribe, pulsa «Buscar» y mira si los resultados cumplen un reto.'));
      const fila = el('div', 'lab__fila');
      const q = document.createElement('input');
      q.type = 'search';
      q.className = 'lab__entrada';
      q.setAttribute('translate', 'no');
      q.setAttribute('aria-label', 'Lo que buscas');
      q.placeholder = 'por ejemplo: receta lentejas';
      q.spellcheck = false;
      const buscar = boton('Buscar', 'lab__boton lab__boton--activo');
      fila.appendChild(q);
      fila.appendChild(buscar);
      pantalla.appendChild(fila);
      const msg = el('div');
      msg.setAttribute('aria-live', 'polite');
      pantalla.appendChild(msg);
      const res = el('div', 'sim__resultados');
      pantalla.appendChild(res);

      function hacer() {
        const texto = q.value.trim();
        msg.innerHTML = '';
        res.innerHTML = '';
        if (!texto) return;
        if (/(^|\s)-\s/.test(texto)) msg.appendChild(ctx.aviso('El - va pegado a la palabra: -chorizo, no - chorizo.', 'cuidado'));
        if (/(site|filetype):\s/i.test(texto)) msg.appendChild(ctx.aviso('Después de site: y filetype: no va espacio.', 'cuidado'));
        if (/\sor\s/.test(texto)) msg.appendChild(ctx.aviso('El OR va en mayúsculas. En minúsculas, es una palabra más.', 'cuidado'));
        const terms = analizar(texto);
        const encontrados = PAGINAS.filter(p => casa(p, terms));
        const pos = terms.filter(t => t.tipo === 'si' || t.tipo === 'o').map(t => [].concat(t.v)).flat();
        const anuncio = ANUNCIOS.find(a => pos.indexOf(a.para) !== -1);
        if (anuncio) res.appendChild(tarjeta(anuncio, true));
        res.appendChild(el('p', 'sim__ayuda', `${encontrados.length} resultado${encontrados.length === 1 ? '' : 's'}`));
        encontrados.forEach(p => res.appendChild(tarjeta(p)));
        let algo = false;
        RETOS.forEach((r, i) => {
          if (!ctx.hecho(i) && r.r(encontrados)) { ctx.cumple(i, `Reto ${i + 1}: ${texto}`); algo = true; }
        });
        if (!algo) ctx.apunta(`Buscar: ${texto}`);
      }
      function tarjeta(p, anuncio) {
        const c = el('div', 'sim__resultado');
        if (anuncio) c.appendChild(el('span', 'sim__patrocinado', 'Patrocinado'));
        const u = el('p', 'sim__ayuda', p.u);
        u.setAttribute('translate', 'no');
        c.appendChild(u);
        const tt = el('p', 'sim__resultado-titulo', p.t);
        if (p.pdf) tt.prepend(el('span', 'sim__pdf', 'PDF'));
        c.appendChild(tt);
        c.appendChild(el('p', 'sim__resultado-texto', p.x));
        return c;
      }
      buscar.addEventListener('click', hacer);
      q.addEventListener('keydown', e => { if (e.key === 'Enter') hacer(); });
    },
  });

  /* ============================================================
     S3 · Revisa la bandeja
     ============================================================ */
  const CORREOS = [
    { de: 'Secretaría <secretaria@iesramonllull.net>', as: 'Horario de exámenes de la 1.ª evaluación', cu: 'Hola: os dejamos el horario de los exámenes en la web del instituto.', enlace: ['Ver el horario', 'https://iesramonllull.net/examenes'], tipo: 'bueno', por: 'Viene del dominio del instituto y el enlace lleva a la web del instituto.' },
    { de: 'Netflix <avisos@netfIix-pagos.com>', as: '⚠️ Tu cuenta se cancelará HOY', cu: 'No hemos podido cobrar tu suscripción. Actualiza tus datos de pago en las próximas 2 horas o perderás tu cuenta.', enlace: ['Actualizar el pago', 'http://netfIix-pagos.com/login'], tipo: 'phishing', por: 'Mira bien el remitente: «netfIix» lleva una i mayúscula en vez de una l. Además mete prisa y pide datos de pago.' },
    { de: 'Correos <info@correos-envio-paquete.top>', as: 'Tu paquete está retenido', cu: 'Tu paquete no se ha podido entregar. Abre el adjunto para ver el justificante y pagar 1,99 € de gastos.', adjunto: 'justificante.pdf.exe', tipo: 'phishing', por: 'El adjunto acaba en .exe: no es un PDF, es un programa. Y Correos no escribe desde un dominio .top.' },
    { de: 'Ana Serra <ana.serra@iesramonllull.net>', as: 'Apuntes de la U3', cu: '¡Hola! Te paso los apuntes que me pediste. Nos vemos el lunes.', adjunto: 'apuntes-u3.pdf', tipo: 'bueno', por: 'Es una compañera, desde el correo del instituto, con un PDF de verdad que le habías pedido.' },
    { de: 'Superofertas <ofertas@superpaco.es>', as: 'Este finde, 2x1 en lentejas', cu: 'Ofertas de la semana en tu súper. Si no quieres recibir más correos, pulsa aquí para darte de baja.', tipo: 'spam', por: 'Es publicidad: no te pide datos ni te mete prisa. Es spam, no phishing.' },
    { de: 'Banco Seguro <seguridad@banco-seguro-verificar.com>', as: 'Hemos detectado un acceso extraño', cu: 'Estimado cliente: para proteger tu cuenta, confirma tu usuario y tu contraseña pulsando el botón.', enlace: ['Confirmar mis datos', 'http://banco-seguro-verificar.com/acceso'], tipo: 'phishing', por: 'Ningún banco te pide la contraseña por correo. Saludo genérico («Estimado cliente») y un dominio raro.' },
  ];
  registrarSimulacion('bandeja', {
    ventana: 'Correo de mentira · Recibidos',
    mision: [
      'Denuncia como phishing los tres correos trampa.',
      'Marca como «de fiar» los dos correos buenos.',
      'Manda a spam la publicidad.',
    ],
    final: 'Apunta en tu cuaderno los tres correos de phishing y, de cada uno, la señal que te hizo sospechar (pregunta 13).',
    crear(ctx) {
      const { el, boton, pantalla } = ctx;
      const estado = CORREOS.map(() => '');
      let abierto = -1;
      const NOMBRE = { bueno: 'de fiar', phishing: 'phishing', spam: 'spam' };
      function recalcula() {
        const ok = t => CORREOS.every((c, i) => c.tipo !== t || estado[i] === t);
        [['phishing', 0], ['bueno', 1], ['spam', 2]].forEach(([t, i]) => {
          if (ok(t)) ctx.cumple(i);
          else if (ctx.hecho(i)) ctx.deshace(i);
        });
      }
      function lista() {
        abierto = -1;
        ctx.barra('Correo de mentira · Recibidos');
        pantalla.innerHTML = '';
        pantalla.appendChild(el('p', 'sim__ayuda', 'Abre cada correo, míralo bien y decide qué es.'));
        const ul = el('ul', 'sim__temas');
        CORREOS.forEach((c, i) => {
          const li = el('li');
          const b = boton(c.as, 'sim__tema');
          b.addEventListener('click', () => abrir(i));
          li.appendChild(b);
          const de = el('span', 'sim__ayuda', c.de.split(' <')[0] + (estado[i] ? ' · ' + (estado[i] === 'bueno' ? '✓ de fiar' : estado[i] === 'spam' ? '🗑 spam' : '⚠ denunciado') : ''));
          li.appendChild(de);
          ul.appendChild(li);
        });
        pantalla.appendChild(ul);
      }
      function abrir(i) {
        abierto = i;
        const c = CORREOS[i];
        ctx.barra('Correo de mentira · ' + c.as);
        pantalla.innerHTML = '';
        const volver = boton('‹ Recibidos');
        volver.addEventListener('click', lista);
        pantalla.appendChild(volver);
        pantalla.appendChild(el('p', 'sim__h', c.as));
        const de = el('p', 'sim__ayuda', 'De: ' + c.de);
        de.setAttribute('translate', 'no');
        pantalla.appendChild(de);
        pantalla.appendChild(el('p', null, c.cu));
        const msg = el('div');
        msg.setAttribute('aria-live', 'polite');
        if (c.enlace) {
          const f = el('div', 'lab__fila');
          const b = boton(c.enlace[0], 'lab__boton sim__enlace');
          b.addEventListener('click', () => {
            msg.innerHTML = '';
            msg.appendChild(ctx.aviso('Antes de pulsar un enlace de un correo, mira adónde lleva. Usa «Ver adónde lleva».', 'cuidado'));
          });
          const ver = boton('🔍 Ver adónde lleva');
          const url = el('code', 'sim__url', '');
          url.setAttribute('translate', 'no');
          ver.addEventListener('click', () => { url.textContent = c.enlace[1]; ctx.apunta(`«${c.as}»: el enlace lleva a ${c.enlace[1]}.`); });
          f.appendChild(b);
          f.appendChild(ver);
          pantalla.appendChild(f);
          pantalla.appendChild(url);
        }
        if (c.adjunto) {
          const a = el('p', 'sim__adjunto', '📎 ' + c.adjunto);
          a.setAttribute('translate', 'no');
          pantalla.appendChild(a);
        }
        pantalla.appendChild(el('p', 'sim__etiqueta', '¿Qué es este correo?'));
        const fila = el('div', 'lab__fila');
        [['bueno', '✓ Es de fiar'], ['spam', '🗑 Spam'], ['phishing', '⚠ Denunciar phishing']].forEach(([t, txt]) => {
          const b = boton(txt, 'lab__boton' + (estado[i] === t ? ' lab__boton--activo' : ''));
          b.setAttribute('aria-pressed', String(estado[i] === t));
          b.addEventListener('click', () => {
            estado[i] = t;
            if (t === c.tipo) {
              ctx.apunta(`«${c.as}»: ${NOMBRE[t]}. ${c.por}`);
              recalcula();
              lista();
              pantalla.appendChild(ctx.aviso('Bien visto. ' + c.por, 'ok'));
            } else {
              ctx.falla(`«${c.as}»: lo marcaste como ${NOMBRE[t]}, pero no lo es.`);
              recalcula();
              abrir(i);
              const pista = c.tipo === 'phishing' ? 'Míralo otra vez: el remitente, el enlace, el adjunto, si mete prisa o te pide datos.' : c.tipo === 'spam' ? 'No pide datos ni mete prisa: es publicidad que no has pedido.' : 'Mira el remitente y adónde lleva: ¿hay algo raro de verdad?';
              pantalla.appendChild(ctx.aviso('No es eso. ' + pista));
            }
          });
          fila.appendChild(b);
        });
        pantalla.appendChild(fila);
        pantalla.appendChild(msg);
      }
      lista();
    },
  });
})();
