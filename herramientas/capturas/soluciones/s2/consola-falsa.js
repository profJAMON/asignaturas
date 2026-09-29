// Solo para las capturas de JavaScript (Proyecto, sesiones 12-16).
// Dibuja debajo de la página un panel que imita la consola de Chrome y
// escribe en él lo que salga con console.log, con el archivo y la línea
// reales. Se carga en los *-cap.html ANTES del script del ejercicio.
(function () {
  var css = document.createElement('style');
  css.textContent =
    '#cap-consola{margin:26px 8px 0 -30px;border:1px solid #c4c7c5;background:#fff;font:13px Consolas,"Courier New",monospace;color:#1f1f1f}' +
    '#cap-consola .pest{display:flex;gap:16px;padding:6px 10px 0;border-bottom:1px solid #c4c7c5;background:#f1f3f4;font:12px Arial,sans-serif;color:#5f6368}' +
    '#cap-consola .pest span{padding-bottom:5px}#cap-consola .pest .sel{color:#1a73e8;border-bottom:2px solid #1a73e8}' +
    '#cap-consola .msg{display:flex;justify-content:space-between;gap:12px;padding:9px 10px;border-bottom:1px solid #eee;white-space:pre-wrap}' +
    '#cap-consola .msg .arch{color:#5f6368;text-decoration:underline;flex:none}' +
    '#cap-consola .num{color:#1a1aa6}#cap-consola .err{background:#fdecea;color:#c5221f}#cap-consola .err .arch{color:#c5221f}' +
    '#cap-consola .prompt{padding:4px 10px;color:#1a73e8}';
  document.head.appendChild(css);
  var panel = document.createElement('div');
  panel.id = 'cap-consola';
  panel.innerHTML = '<div class="pest"><span>Elements</span><span class="sel">Console</span><span>Sources</span><span>Network</span></div><div class="lineas"></div><div class="prompt">&gt;</div>';
  document.body.appendChild(panel);
  var lineas = panel.querySelector('.lineas');
  function donde() {
    var st = (new Error().stack || '').split('\n');
    for (var i = 0; i < st.length; i++) {
      var m = st[i].match(/([\w.-]+\.js):(\d+):\d+/);
      if (m && m[1] !== 'consola-falsa.js') return m[1] + ':' + m[2];
    }
    return '';
  }
  function linea(texto, clase, arch) {
    var d = document.createElement('div');
    d.className = 'msg ' + (clase || '');
    var t = document.createElement('span'); t.textContent = texto;
    var a = document.createElement('span'); a.className = 'arch'; a.textContent = arch;
    d.appendChild(t); d.appendChild(a); lineas.appendChild(d);
  }
  console.log = function () {
    var partes = [].slice.call(arguments);
    var solo = partes.length === 1 && typeof partes[0] === 'number';
    linea(partes.map(String).join(' '), solo ? 'num' : '', donde());
  };
  window.addEventListener('error', function (e) {
    var arch = (e.filename || '').split('/').pop() + ':' + e.lineno;
    linea('✖ Uncaught ' + e.message.replace(/^Uncaught /, ''), 'err', arch);
  });
})();
