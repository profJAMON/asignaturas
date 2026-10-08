/* ============================================================
   «Toca y mira» (probador) y mandos de CSS (07/10/2026)
   ============================================================
   Un bloque de código que el alumno puede CAMBIAR, con el resultado
   al lado, que se actualiza solo mientras escribe. Sustituye a la
   pareja «código + .salida» de la explicación cuando el concepto se
   entiende mejor cambiándolo (rutas, ul/ol, colores, cajas, flex…).
   Los ejercicios se siguen haciendo en VS Code: esto es para
   entender, no para entregar.

   Cómo se escribe en el .html de una sesión:

     <div class="probador" aria-label="Lista con viñetas">
       <textarea data-lengua="html"><ul>
         <li>12 pilotos</li>
       </ul></textarea>
       <textarea data-lengua="css">li { color: red; }</textarea>   (opcional)
       <textarea data-lengua="js">console.log("hola");</textarea>  (opcional)
       <ul class="probador__prueba">                                 (opcional)
         <li>Cambia <code>ul</code> por <code>ol</code>.</li>
       </ul>
     </div>

   Dentro de un <textarea> el HTML se escribe tal cual (sin &lt;).
   Un <textarea> no puede llevar dentro el texto «</textarea>»: si el
   ejemplo tiene una caja <textarea>, el código va en
   <script type="text/plain" data-lengua="html"> … </script>.

   Mandos (deslizadores, desplegables y paletas de color
   <input type="color">) que cambian una línea del CSS:

     <input type="range" data-sel=".aviso" data-prop="padding"
            data-unidad="px" min="0" max="60">
     <select data-sel=".menu" data-prop="justify-content">
       <option>flex-start</option><option>center</option>
     </select>

   El valor de salida lo lee del CSS. Al moverlo, la línea del CSS
   cambia sola y se ilumina un momento.

   Atributos opcionales del .probador:
     data-base="data/…/carpeta/"  carpeta desde la que se resuelven las
                                  rutas (img/…) del resultado.
     data-alto="200"              alto mínimo del resultado, en px.

   El resultado va en un <iframe sandbox="allow-scripts"> (sin el
   mismo origen): lo que escriba el alumno no puede tocar la web. Por
   eso el alto, console.log, los errores y los enlaces llegan con
   postMessage. Los enlaces no navegan: dicen adónde irían.

   Lo llama js/tema.js (pintarLeccion) con iniciarProbadores().
   El resaltado (et, at, ca, co, kw, fn, nu) es el mismo que el de los
   <pre><code> de la web; window.resaltarCodigo lo usa también
   js/retos-web.js.
   ============================================================ */

(function () {
  'use strict';

  /* ---------- Resaltado ---------- */

  function esc(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function sp(clase, t) {
    return `<span class="${clase}">${esc(t)}</span>`;
  }

  const PALABRAS_JS = new Set(['let', 'const', 'var', 'if', 'else', 'function', 'return',
    'true', 'false', 'null', 'undefined', 'new', 'for', 'while', 'of', 'in', 'typeof']);

  function resaltarJS(t) {
    let out = '';
    let i = 0;
    while (i < t.length) {
      const resto = t.slice(i);
      let m;
      if (resto.startsWith('//')) {
        const j = t.indexOf('\n', i);
        const fin = j < 0 ? t.length : j;
        out += sp('co', t.slice(i, fin)); i = fin; continue;
      }
      if (resto.startsWith('/*')) {
        const j = t.indexOf('*/', i + 2);
        const fin = j < 0 ? t.length : j + 2;
        out += sp('co', t.slice(i, fin)); i = fin; continue;
      }
      if (t[i] === '"' || t[i] === "'" || t[i] === '`') {
        const q = t[i];
        let j = i + 1;
        while (j < t.length && t[j] !== q && t[j] !== '\n') { if (t[j] === '\\') j++; j++; }
        const fin = Math.min(t.length, j + 1);
        out += sp('ca', t.slice(i, fin)); i = fin; continue;
      }
      if ((m = /^\d+(\.\d+)?/.exec(resto)) && !/[\w$]/.test(t[i - 1] || '')) {
        out += sp('nu', m[0]); i += m[0].length; continue;
      }
      if ((m = /^[A-Za-z_$][\w$]*/.exec(resto))) {
        const w = m[0];
        const despues = t.slice(i + w.length);
        if (PALABRAS_JS.has(w)) out += sp('kw', w);
        else if (/^\s*\(/.test(despues)) out += sp('fn', w);
        else out += esc(w);
        i += w.length; continue;
      }
      out += esc(t[i]); i++;
    }
    return out;
  }

  function resaltarCSS(t) {
    let out = '';
    let i = 0;
    let dentro = false;     /* entre { } */
    let enValor = false;    /* después de los dos puntos */
    while (i < t.length) {
      const c = t[i];
      if (t.startsWith('/*', i)) {
        const j = t.indexOf('*/', i + 2);
        const fin = j < 0 ? t.length : j + 2;
        out += sp('co', t.slice(i, fin)); i = fin; continue;
      }
      if (c === '{') { dentro = true; enValor = false; out += '{'; i++; continue; }
      if (c === '}') { dentro = false; enValor = false; out += '}'; i++; continue; }
      if (!dentro) {
        /* Selector: hasta la llave. */
        let j = i;
        while (j < t.length && t[j] !== '{' && !t.startsWith('/*', j)) j++;
        const trozo = t.slice(i, j);
        const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(trozo);
        out += esc(m[1]) + (m[2] ? sp('et', m[2]) : '') + esc(m[3]);
        i = j; continue;
      }
      if (c === ';') { enValor = false; out += ';'; i++; continue; }
      if (!enValor) {
        if (c === ':') { enValor = true; out += ':'; i++; continue; }
        const m = /^[\w-]+/.exec(t.slice(i));
        if (m) { out += sp('at', m[0]); i += m[0].length; continue; }
        out += esc(c); i++; continue;
      }
      /* Valor: hasta ; o } (sin comerse los espacios del principio). */
      let j = i;
      while (j < t.length && t[j] !== ';' && t[j] !== '}' && t[j] !== '\n') j++;
      const trozo = t.slice(i, j);
      const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(trozo);
      out += esc(m[1]) + (m[2] ? sp('ca', m[2]) : '') + esc(m[3]);
      i = j;
    }
    return out;
  }

  function resaltarHTML(t) {
    let out = '';
    let i = 0;
    while (i < t.length) {
      if (t.startsWith('<!--', i)) {
        const j = t.indexOf('-->', i + 4);
        const fin = j < 0 ? t.length : j + 3;
        out += sp('co', t.slice(i, fin)); i = fin; continue;
      }
      const m = t[i] === '<' ? /^<\/?[A-Za-z!][\w-]*/.exec(t.slice(i)) : null;
      if (m) {
        const nombre = m[0].replace(/^<\/?/, '').toLowerCase();
        const cierre = m[0][1] === '/';
        out += sp('et', m[0]);
        i += m[0].length;
        while (i < t.length && t[i] !== '>' && t[i] !== '<') {
          const c = t[i];
          if (c === '"' || c === "'") {
            const j = t.indexOf(c, i + 1);
            const fin = j < 0 ? t.length : j + 1;
            out += sp('ca', t.slice(i, fin)); i = fin; continue;
          }
          const a = /^[A-Za-z_:@][\w:.-]*/.exec(t.slice(i));
          if (a) { out += sp('at', a[0]); i += a[0].length; continue; }
          if (c === '/') { out += sp('et', '/'); i++; continue; }
          out += esc(c); i++;
        }
        if (t[i] === '>') { out += sp('et', '>'); i++; }
        /* Lo de dentro de <style> y <script>, con su resaltado. */
        if (!cierre && (nombre === 'style' || nombre === 'script')) {
          const j = t.toLowerCase().indexOf('</' + nombre, i);
          const fin = j < 0 ? t.length : j;
          const dentro = t.slice(i, fin);
          out += nombre === 'style' ? resaltarCSS(dentro) : resaltarJS(dentro);
          i = fin;
        }
        continue;
      }
      out += esc(t[i]); i++;
    }
    return out;
  }

  function resaltarCodigo(texto, lengua) {
    if (lengua === 'css') return resaltarCSS(texto);
    if (lengua === 'js') return resaltarJS(texto);
    return resaltarHTML(texto);
  }
  window.resaltarCodigo = resaltarCodigo;

  /* ---------- Página del resultado ---------- */

  /* Lo que va dentro del iframe antes del código del alumno. Manda al
     padre: alto, console.log, errores y enlaces pulsados. */
  function puente(token) {
    return `<script>(function(){var T=${JSON.stringify(token)};
function E(t,d){try{parent.postMessage({probador:T,tipo:t,datos:d},'*')}catch(e){}}
function S(v){if(typeof v==='string')return v;if(v&&v.nodeType===1)return '<'+v.tagName.toLowerCase()+(v.id?' id="'+v.id+'"':'')+'>';try{return JSON.stringify(v)}catch(e){return String(v)}}
function L(){var m=/:(\\d+):\\d+\\)?\\s*$/.exec((new Error().stack||'').split('\\n')[3]||'');return m?+m[1]:0}
console.log=function(){var l=L();E('log',{p:Array.prototype.map.call(arguments,function(v){return [typeof v==='number'||typeof v==='boolean'?'n':'s',S(v)]}),l:l})};
window.addEventListener('error',function(ev){if(ev.message)E('error',{m:String(ev.message),l:ev.lineno||0})});
document.addEventListener('click',function(ev){var a=ev.target.closest&&ev.target.closest('a[href]');if(a){ev.preventDefault();E('enlace',a.getAttribute('href'))}},true);
document.addEventListener('submit',function(ev){ev.preventDefault();E('envio','')},true);
function A(){var h=document.documentElement;E('alto',Math.ceil(h.getBoundingClientRect().height))}
window.addEventListener('load',function(){A();E('titulo',document.title||'');if(window.ResizeObserver)new ResizeObserver(A).observe(document.documentElement)});
})();<\/script>`;
  }

  /* Monta el documento entero. Devuelve también en qué línea empieza
     el JavaScript, para decir bien la línea de un error. */
  function montarDocumento(partes, token, base) {
    const cabeza = '<meta charset="utf-8">' +
      (base ? `<base href="${esc(base)}">` : '') +
      '<style>:root{color-scheme:light}</style>' +
      puente(token) +
      (partes.css ? `<style>\n${partes.css}\n</style>` : '');
    let html = partes.html || '';
    let doc;
    if (/<head[\s>]/i.test(html)) {
      doc = html.replace(/<head(\s[^>]*)?>/i, m => m + cabeza);
    } else if (/<html[\s>]/i.test(html)) {
      doc = html.replace(/<html(\s[^>]*)?>/i, m => m + '<head>' + cabeza + '</head>');
    } else {
      doc = '<!DOCTYPE html><html><head>' + cabeza + '</head><body>\n' + html + '\n</body></html>';
    }
    let lineaJS = 0;
    if (partes.js) {
      const marca = '<script>\n';
      const pos = /<\/body>/i.test(doc) ? doc.search(/<\/body>/i) : doc.length;
      const antes = doc.slice(0, pos) + marca;
      lineaJS = antes.split('\n').length;   /* la 1.ª línea del JS */
      doc = antes + partes.js + '\n<\/script>' + doc.slice(pos);
    }
    return { doc, lineaJS };
  }

  /* Los errores de JavaScript más típicos, en castellano. */
  function traducirError(m) {
    let r;
    if ((r = /^(?:Uncaught )?ReferenceError: (\S+) is not defined/.exec(m))) {
      return `No existe nada que se llame «${r[1]}». ¿Está bien escrito? Mayúsculas y minúsculas cuentan.`;
    }
    if (/Cannot (?:set|read) properties of null/.test(m) || /null has no properties/.test(m)) {
      return 'querySelector no ha encontrado el elemento. Revisa el selector («#» para id, «.» para clase) y que el id exista en el HTML.';
    }
    if ((r = /(\S+) is not a function/.exec(m))) {
      return `«${r[1]}» no es una función. ¿Está bien escrito el nombre?`;
    }
    if (/missing \) after argument list/.test(m)) return 'Falta un paréntesis «)» o unas comillas.';
    if (/Unexpected end of input/.test(m)) return 'Falta cerrar algo: una llave «}» o un paréntesis «)».';
    if (/Invalid or unexpected token/.test(m) || /unterminated string/i.test(m)) return 'Hay unas comillas sin cerrar o un símbolo raro.';
    if (/Unexpected token/.test(m) || /Unexpected identifier/.test(m)) return 'Sobra o falta un símbolo (paréntesis, llave, comillas, punto y coma…).';
    if (/Assignment to constant/.test(m)) return 'Has intentado cambiar una constante.';
    if (/has already been declared/.test(m)) return 'Has creado dos veces la misma variable con «let». La segunda vez, sin «let».';
    return '';
  }

  /* Qué pasaría al pulsar un enlace (en el resultado no se navega). */
  function textoEnlace(href) {
    if (/^https?:\/\//i.test(href)) return '🔗 Abriría otra web: ' + href;
    if (/^#/.test(href)) return '🔗 Saltaría a otra parte de esta misma página: ' + href;
    if (/^mailto:/i.test(href)) return '✉️ Abriría el correo para escribir a: ' + href.slice(7);
    if (/\.html?$/i.test(href)) return '🔗 Abriría tu página «' + href + '», un archivo de tu carpeta.';
    if (!href.trim()) return '⚠️ Este enlace no tiene dirección: el href está vacío.';
    return '⚠️ Buscaría un archivo llamado «' + href + '» en tu carpeta y no lo encontraría. Si es otra web, ¿falta https://?';
  }

  /* ---------- Mandos: cambiar una línea del CSS ---------- */

  function escRe(t) { return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  /* Busca el bloque «sel { … }» y dentro la declaración «prop: …;».
     Devuelve { ini, fin } del valor o, si no está, dónde insertarla. */
  function buscarDeclaracion(css, sel, prop) {
    const reBloque = new RegExp('(^|[\\s}])' + escRe(sel) + '\\s*\\{', 'g');
    const mb = reBloque.exec(css);
    if (!mb) return null;
    const abre = mb.index + mb[0].length;
    const cierra = css.indexOf('}', abre);
    if (cierra < 0) return null;
    const cuerpo = css.slice(abre, cierra);
    const reProp = new RegExp('(^|[;{\\s])(' + escRe(prop) + ')\\s*:\\s*([^;}]*)', 'm');
    const mp = reProp.exec(cuerpo);
    if (mp) {
      const iniValor = abre + mp.index + mp[0].length - mp[3].length;
      let valor = mp[3];
      const sinEspacios = valor.replace(/\s+$/, '');
      return { ini: iniValor, fin: iniValor + sinEspacios.length, valor: sinEspacios };
    }
    return { insertar: cierra };
  }

  function leerMando(css, mando) {
    const d = buscarDeclaracion(css, mando.dataset.sel, mando.dataset.prop);
    return d && d.valor !== undefined ? d.valor : null;
  }

  function ponerMando(css, mando, valor) {
    const d = buscarDeclaracion(css, mando.dataset.sel, mando.dataset.prop);
    if (!d) return { css, pos: -1 };
    if (d.valor !== undefined) {
      return { css: css.slice(0, d.ini) + valor + css.slice(d.fin), pos: d.ini };
    }
    const linea = `    ${mando.dataset.prop}: ${valor};\n`;
    let p = d.insertar;
    /* Que la línea nueva vaya antes de la llave, en su propia línea. */
    const antes = css.slice(0, p).replace(/[ \t]*$/, '');
    const sep = antes.endsWith('\n') ? '' : '\n';
    const nuevo = antes + sep + linea + css.slice(p);
    return { css: nuevo, pos: antes.length + sep.length + 4 };
  }

  /* ---------- La consola (como la de Chrome) ---------- */

  function crearConsola() {
    const el = crear('div', 'probador__consola');
    el.setAttribute('role', 'log');
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', 'Consola');
    el.setAttribute('translate', 'no');
    const cab = crear('div', 'probador__consola-cab', 'Consola');
    cab.setAttribute('translate', 'yes');
    el.appendChild(cab);
    const lista = crear('div', 'probador__consola-lista');
    el.appendChild(lista);
    function linea(clase, linea) {
      const l = crear('div', 'probador__log' + (clase ? ' ' + clase : ''));
      if (linea) {
        const d = crear('span', 'probador__log-linea', 'línea ' + linea);
        d.setAttribute('translate', 'yes');
        l.appendChild(d);
      }
      lista.appendChild(l);
      el.scrollTop = el.scrollHeight;
      return l;
    }
    return {
      el,
      limpiar() { lista.innerHTML = ''; },
      log(datos, numLinea) {
        const l = linea('', numLinea);
        (datos.p || []).forEach((par, i) => {
          if (i) l.appendChild(document.createTextNode(' '));
          l.appendChild(crear('span', par[0] === 'n' ? 'probador__log-num' : null, par[1]));
        });
      },
      error(texto, numLinea) {
        const l = linea('probador__log--error', numLinea);
        const t = crear('span', null, texto);
        t.setAttribute('translate', 'yes');
        l.appendChild(t);
      },
    };
  }

  /* ---------- El componente ---------- */

  const instancias = new Map();
  let contador = 0;

  window.addEventListener('message', ev => {
    const d = ev.data;
    if (!d || typeof d !== 'object' || !d.probador) return;
    const inst = instancias.get(d.probador);
    if (!inst || ev.source !== inst.marco.contentWindow) return;
    inst.recibir(d.tipo, d.datos);
  });

  const NOMBRE_LENGUA = { html: 'HTML', css: 'CSS', js: 'JavaScript' };

  function crear(etiqueta, clase, texto) {
    const el = document.createElement(etiqueta);
    if (clase) el.className = clase;
    if (texto !== undefined) el.textContent = texto;
    return el;
  }

  /* Quita la sangría común a todas las líneas (para poder sangrar el
     <textarea> dentro del HTML de la sesión) y los saltos de los bordes. */
  function limpiar(t) {
    const lineas = t.replace(/\r/g, '').replace(/^\n+|\s+$/g, '').split('\n');
    const sangrias = lineas.filter(l => l.trim()).map(l => l.match(/^[ \t]*/)[0].length);
    const comun = sangrias.length ? Math.min(...sangrias) : 0;
    return lineas.map(l => l.slice(comun)).join('\n');
  }

  function iniciarUno(caja) {
    if (caja.dataset.listo) return;
    caja.dataset.listo = 'si';
    const token = 'p' + (++contador) + '-' + Math.random().toString(36).slice(2, 8);

    /* El código va en <textarea data-lengua>; si el ejemplo lleva su
       propio <textarea>, en <script type="text/plain" data-lengua>. */
    const areas = Array.from(caja.querySelectorAll(':scope > textarea[data-lengua], :scope > script[type="text/plain"][data-lengua]'));
    const mandos = Array.from(caja.querySelectorAll(':scope input[type="range"][data-prop], :scope input[type="color"][data-prop], :scope select[data-prop]'));
    const prueba = caja.querySelector(':scope > .probador__prueba');
    const titulo = caja.getAttribute('aria-label') || '';
    const base = caja.dataset.base ? new URL(caja.dataset.base, document.baseURI).href : '';
    const altoMin = Number(caja.dataset.alto) || 60;
    const conJS = areas.some(a => a.dataset.lengua === 'js');

    const paneles = areas.map(a => ({
      lengua: a.dataset.lengua,
      original: limpiar(a.tagName === 'TEXTAREA' ? a.value : a.textContent),
      area: null, pre: null, viva: null,
    }));

    caja.innerHTML = '';
    caja.setAttribute('role', 'group');
    caja.classList.add('notranslate');
    if (!caja.getAttribute('aria-label')) caja.setAttribute('aria-label', 'Toca y mira');

    /* Cabecera */
    const cab = crear('div', 'probador__cabecera');
    cab.appendChild(crear('span', 'probador__etiqueta', 'Toca y mira'));
    if (titulo) {
      const t = crear('span', 'probador__titulo', titulo);
      t.setAttribute('translate', 'yes');
      cab.appendChild(t);
    }
    const btnDeshacer = crear('button', 'probador__deshacer', '↺ Deshacer cambios');
    btnDeshacer.type = 'button';
    btnDeshacer.setAttribute('translate', 'yes');
    cab.appendChild(btnDeshacer);
    caja.appendChild(cab);

    /* Mandos */
    let filaMandos = null;
    if (mandos.length) {
      filaMandos = crear('div', 'probador__mandos');
      filaMandos.setAttribute('translate', 'yes');
      mandos.forEach(m => {
        const et = crear('label', 'probador__mando');
        const nombre = crear('span', 'probador__mando-nombre');
        nombre.innerHTML = `<code translate="no">${esc(m.dataset.prop)}</code>` +
          (mandos.some(o => o !== m && o.dataset.sel !== m.dataset.sel)
            ? ` <span class="probador__mando-sel">de <code translate="no">${esc(m.dataset.sel)}</code></span>` : '');
        const salida = crear('output', 'probador__mando-valor');
        salida.setAttribute('translate', 'no');
        et.appendChild(nombre);
        et.appendChild(m);
        et.appendChild(salida);
        m.classList.add('probador__control');
        m._salida = salida;
        filaMandos.appendChild(et);
      });
      caja.appendChild(filaMandos);
    }

    /* Código + resultado */
    const cuerpo = crear('div', 'probador__cuerpo');
    const zonaCodigo = crear('div', 'probador__codigo');
    paneles.forEach(p => {
      const panel = crear('div', 'probador__panel');
      panel.appendChild(crear('span', 'probador__lengua', NOMBRE_LENGUA[p.lengua] || p.lengua));
      const editor = crear('div', 'probador__editor');
      const pre = crear('pre', 'probador__resaltado');
      pre.setAttribute('aria-hidden', 'true');
      const code = crear('code');
      pre.appendChild(code);
      const viva = crear('div', 'probador__linea-viva');
      viva.setAttribute('aria-hidden', 'true');
      const area = crear('textarea', 'probador__area');
      area.value = p.original;
      area.spellcheck = false;
      area.setAttribute('autocapitalize', 'off');
      area.setAttribute('autocomplete', 'off');
      area.setAttribute('wrap', 'off');
      area.setAttribute('translate', 'no');
      area.setAttribute('aria-label', `Código ${NOMBRE_LENGUA[p.lengua] || ''} que puedes cambiar`);
      editor.appendChild(viva);
      editor.appendChild(pre);
      editor.appendChild(area);
      panel.appendChild(editor);
      zonaCodigo.appendChild(panel);
      p.area = area; p.pre = pre; p.code = code; p.viva = viva;
    });
    cuerpo.appendChild(zonaCodigo);

    const vista = crear('div', 'probador__vista');
    const barra = crear('div', 'probador__navegador');
    barra.setAttribute('aria-hidden', 'true');
    barra.innerHTML = '<span></span><span></span><span></span><b>resultado</b>';
    const rotuloBarra = barra.querySelector('b');
    vista.appendChild(barra);
    const marco = crear('iframe', 'probador__marco');
    marco.setAttribute('sandbox', 'allow-scripts');
    marco.setAttribute('title', 'Resultado del código' + (titulo ? ': ' + titulo : ''));
    marco.style.height = altoMin + 'px';
    vista.appendChild(marco);
    const aviso = crear('p', 'probador__aviso');
    aviso.setAttribute('role', 'status');
    aviso.setAttribute('translate', 'yes');
    aviso.hidden = true;
    vista.appendChild(aviso);
    let consola = null;
    if (conJS) {
      consola = crearConsola();
      vista.appendChild(consola.el);
    }
    /* Solo JavaScript (sin HTML ni CSS): no hay página que enseñar,
       solo la consola. */
    if (conJS && !areas.some(a => a.dataset.lengua !== 'js')) {
      vista.classList.add('probador__vista--consola');
      barra.hidden = true;
      marco.hidden = true;
    }
    cuerpo.appendChild(vista);
    caja.appendChild(cuerpo);

    if (prueba) {
      const bloque = crear('div', 'probador__pruebas');
      bloque.setAttribute('translate', 'yes');
      bloque.appendChild(crear('p', 'probador__pruebas-titulo', 'Prueba a…'));
      bloque.appendChild(prueba);
      caja.appendChild(bloque);
    }

    /* --- comportamiento --- */
    let lineaJS = 0;
    let temporizador = null;

    function pintarResaltado(p) {
      const t = p.area.value;
      p.code.innerHTML = resaltarCodigo(t, p.lengua) + (t.endsWith('\n') ? ' ' : '');
      ajustarAlto(p);
    }
    function ajustarAlto(p) {
      const lineas = p.area.value.split('\n').length;
      p.area.rows = Math.max(2, lineas);
    }
    function sincronizarScroll(p) {
      p.pre.scrollLeft = p.area.scrollLeft;
      p.pre.scrollTop = p.area.scrollTop;
      p.viva.style.transform = `translateY(${-p.area.scrollTop}px)`;
    }

    function partes() {
      const r = {};
      paneles.forEach(p => { r[p.lengua] = p.area.value; });
      return r;
    }

    function ejecutar() {
      const montado = montarDocumento(partes(), token, base);
      lineaJS = montado.lineaJS;
      if (consola) consola.limpiar();
      aviso.hidden = true;
      marco.srcdoc = montado.doc;
    }
    function programar() {
      clearTimeout(temporizador);
      temporizador = setTimeout(ejecutar, 300);
    }

    function lineaDelJS(l) {
      return lineaJS && l >= lineaJS ? l - lineaJS + 1 : 0;
    }

    const inst = {
      marco,
      recibir(tipo, datos) {
        if (tipo === 'alto') {
          const h = Math.min(Math.max(Number(datos) || 0, altoMin), 520);
          marco.style.height = h + 'px';
        } else if (tipo === 'titulo') {
          /* Como la pestaña del navegador: el <title> de la página. */
          rotuloBarra.textContent = String(datos).trim() || 'resultado';
        } else if (tipo === 'log') {
          if (consola) consola.log(datos, lineaDelJS(datos.l));
        } else if (tipo === 'error') {
          const linea = lineaDelJS(datos.l);
          const es = traducirError(datos.m);
          const texto = '✖ ' + (es || datos.m) + (es ? `  (${datos.m})` : '');
          if (consola) consola.error(texto, linea);
          else { aviso.textContent = texto; aviso.hidden = false; }
        } else if (tipo === 'enlace') {
          aviso.textContent = textoEnlace(String(datos));
          aviso.hidden = false;
        } else if (tipo === 'envio') {
          aviso.textContent = '📨 Se enviaría el formulario (aquí no se envía a ningún sitio).';
          aviso.hidden = false;
        }
      },
    };
    instancias.set(token, inst);

    const panelCSS = paneles.find(p => p.lengua === 'css');

    function refrescarMandos() {
      if (!panelCSS) return;
      mandos.forEach(m => {
        const v = leerMando(panelCSS.area.value, m);
        if (v === null) { m._salida.textContent = '—'; return; }
        if (m.tagName === 'SELECT') {
          if (Array.from(m.options).some(o => o.value === v)) m.value = v;
        } else if (m.type === 'color') {
          const hex = /^#([0-9a-f]{3}){1,2}$/i.test(v) ? v : null;
          if (hex) m.value = hex.length === 4 ? '#' + hex.slice(1).split('').map(c => c + c).join('') : hex;
        } else {
          const n = parseFloat(v);
          if (!isNaN(n)) m.value = n;
        }
        m._salida.textContent = v;
      });
    }

    function iluminarLinea(p, pos) {
      if (pos < 0) return;
      const linea = p.area.value.slice(0, pos).split('\n').length - 1;
      const estilo = getComputedStyle(p.area);
      const alto = parseFloat(estilo.lineHeight) || 20;
      const arriba = parseFloat(estilo.paddingTop) || 0;
      p.viva.style.top = (arriba + linea * alto) + 'px';
      p.viva.style.height = alto + 'px';
      p.viva.classList.remove('probador__linea-viva--on');
      void p.viva.offsetWidth;
      p.viva.classList.add('probador__linea-viva--on');
    }

    mandos.forEach(m => {
      const alCambiar = () => {
        if (!panelCSS) return;
        const valor = m.tagName === 'SELECT' || m.type === 'color' ? m.value : m.value + (m.dataset.unidad || '');
        const r = ponerMando(panelCSS.area.value, m, valor);
        panelCSS.area.value = r.css;
        pintarResaltado(panelCSS);
        m._salida.textContent = valor;
        iluminarLinea(panelCSS, r.pos);
        programar();
      };
      m.addEventListener('input', alCambiar);
      m.addEventListener('change', alCambiar);
    });

    paneles.forEach(p => {
      p.area.addEventListener('input', () => {
        pintarResaltado(p);
        if (p === panelCSS) refrescarMandos();
        programar();
      });
      p.area.addEventListener('scroll', () => sincronizarScroll(p));
      pintarResaltado(p);
    });

    btnDeshacer.addEventListener('click', () => {
      paneles.forEach(p => { p.area.value = p.original; pintarResaltado(p); sincronizarScroll(p); });
      refrescarMandos();
      ejecutar();
    });

    refrescarMandos();
    ejecutar();
  }

  function iniciarProbadores(raiz) {
    (raiz || document).querySelectorAll('.probador').forEach(iniciarUno);
  }
  window.iniciarProbadores = iniciarProbadores;

  /* Una ventana de resultado suelta (sin editor), con el mismo puente:
     la usa js/retos-web.js. Devuelve { el, mostrar(partes) }. */
  function crearVista(opciones) {
    const op = opciones || {};
    const token = 'v' + (++contador) + '-' + Math.random().toString(36).slice(2, 8);
    const altoMin = op.alto || 40;
    const el = crear('div', 'probador__vista probador__vista--suelta');
    const barra = crear('div', 'probador__navegador');
    barra.setAttribute('aria-hidden', 'true');
    barra.innerHTML = '<span></span><span></span><span></span><b></b>';
    barra.querySelector('b').textContent = op.rotulo || 'resultado';
    el.appendChild(barra);
    const marco = crear('iframe', 'probador__marco');
    marco.setAttribute('sandbox', 'allow-scripts');
    marco.setAttribute('title', op.titulo || 'Resultado');
    marco.style.height = altoMin + 'px';
    el.appendChild(marco);
    const aviso = crear('p', 'probador__aviso');
    aviso.setAttribute('role', 'status');
    aviso.hidden = true;
    el.appendChild(aviso);
    const base = op.base ? new URL(op.base, document.baseURI).href : '';
    const consola = op.consola ? crearConsola() : null;
    if (consola) el.appendChild(consola.el);
    if (op.soloConsola) { barra.hidden = true; marco.hidden = true; el.classList.add('probador__vista--consola'); }
    let lineaJS = 0;
    const lineaDelJS = l => (lineaJS && l >= lineaJS ? l - lineaJS + 1 : 0);
    instancias.set(token, {
      marco,
      recibir(tipo, datos) {
        if (tipo === 'alto') marco.style.height = Math.min(Math.max(Number(datos) || 0, altoMin), 420) + 'px';
        else if (tipo === 'titulo' && String(datos).trim()) barra.querySelector('b').textContent = (op.rotulo || 'resultado') + ' · pestaña: ' + String(datos).trim();
        else if (tipo === 'enlace') { aviso.textContent = textoEnlace(String(datos)); aviso.hidden = false; }
        else if (tipo === 'log' && consola) consola.log(datos, lineaDelJS(datos.l));
        else if (tipo === 'error' && consola) {
          const es = traducirError(datos.m);
          consola.error('✖ ' + (es || datos.m), lineaDelJS(datos.l));
        }
      },
    });
    return {
      el,
      mostrar(partes) {
        aviso.hidden = true;
        if (consola) consola.limpiar();
        const m = montarDocumento(partes, token, base);
        lineaJS = m.lineaJS;
        marco.srcdoc = m.doc;
      },
    };
  }

  /* Lo usa js/retos-web.js. */
  window.PROBADOR = { crearVista, esc };
})();
