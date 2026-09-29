"""Genera las capturas numeradas de los ejercicios a partir de sus soluciones.

Uso:  python3 generar.py specs/sesion-2.json

Cada spec es una lista de imágenes:
  {"solucion": "soluciones/s2/practica.html",        # HTML de la solución (limpio, sin nada de la captura)
   "salida":   "../../data/unidades/.../x.webp",      # dónde se guarda la imagen
   "url":      "127.0.0.1:5500/index.html",           # lo que se ve en la barra del navegador
   "numeros":  [{"sel": "ul", "n": 1}],               # selector CSS y número; "lado": "texto" = sin marco, al final del texto
   "notas":    [{"n": 3, "texto": "..."}],            # cosas que no se ven en la imagen
   "pie":      "texto opcional bajo la página"}
La solución se renderiza con los estilos por defecto de Chrome (Times New Roman),
que es lo que ve el alumno en clase. El marco, los números y las notas se añaden
solo en la captura: el archivo de la solución no se toca.
"""
import json, sys, io, os
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image

NARANJA = "#e8590c"

CSS = """
html { font-family: "Times New Roman", serif; padding: 46px 0 0 46px !important; }
#cap-barra { position:absolute; top:0; left:0; right:0; height:34px; background:#e8eaed;
  border-bottom:1px solid #c4c7c5; display:flex; align-items:center; gap:10px; padding:0 12px;
  font:13px Arial, sans-serif; color:#3c4043; box-sizing:border-box; }
#cap-barra .pts { color:#9aa0a6; letter-spacing:2px; font-size:16px; }
#cap-barra .url { flex:1; background:#fff; border-radius:14px; padding:5px 12px; }
.cap-marco { position:absolute; border:2px dashed %(c)s; border-radius:4px; pointer-events:none; }
.cap-num { position:absolute; left:8px; width:26px; height:26px; border-radius:50%%; background:%(c)s;
  color:#fff; font:bold 15px Arial, sans-serif; display:flex; align-items:center; justify-content:center; }
#cap-notas { margin:28px 8px 12px -30px; border:2px dashed %(c)s; border-radius:8px; padding:10px 14px;
  background:#fff4e6; font:15px Arial, sans-serif; color:#1e1e1e; }
#cap-notas b.t { display:block; margin-bottom:6px; }
#cap-notas div { margin:5px 0; display:flex; gap:8px; align-items:flex-start; }
#cap-notas .n { flex:none; width:22px; height:22px; border-radius:50%%; background:%(c)s; color:#fff;
  font:bold 13px Arial; display:flex; align-items:center; justify-content:center; }
#cap-pie { margin:10px 8px 6px -30px; font:italic 13px Arial, sans-serif; color:#5f6368; }
""" % {"c": NARANJA}

JS = """
([numeros, notas, url, pie]) => {
  const barra = document.createElement('div'); barra.id = 'cap-barra';
  barra.innerHTML = '<span class="pts">● ● ●</span><span class="url"></span>';
  barra.querySelector('.url').textContent = url;
  document.documentElement.appendChild(barra);
  const usadas = [];
  for (const {sel, n, lado} of numeros) {
    const el = document.querySelector(sel);
    if (!el) throw new Error('Selector no encontrado: ' + sel);
    const r = el.getBoundingClientRect(), sy = window.scrollY;
    if (lado === 'texto') {
      // Número pegado al final del texto, sin marco (para elementos muy juntos)
      const rg = document.createRange(); rg.selectNodeContents(el);
      const rs = [...rg.getClientRects()], u = rs[rs.length - 1];
      const b = document.createElement('div'); b.className = 'cap-num';
      Object.assign(b.style, {left:(u.right+10)+'px', top:(u.top+sy+(u.height-26)/2)+'px'});
      b.textContent = n; document.documentElement.appendChild(b);
      continue;
    }
    const m = document.createElement('div'); m.className = 'cap-marco';
    Object.assign(m.style, {left:(r.left-4)+'px', top:(r.top+sy-3)+'px', width:(r.width+8)+'px', height:(r.height+6)+'px'});
    document.documentElement.appendChild(m);
    let top = r.top + sy - 2;
    while (usadas.some(t => Math.abs(t - top) < 28)) top += 28;
    usadas.push(top);
    const b = document.createElement('div'); b.className = 'cap-num'; b.textContent = n;
    b.style.top = top + 'px';
    document.documentElement.appendChild(b);
  }
  if (notas.length) {
    const c = document.createElement('div'); c.id = 'cap-notas';
    c.innerHTML = '<b class="t">Esto no se ve en la imagen, pero tiene que estar:</b>';
    for (const {n, texto} of notas) {
      const d = document.createElement('div');
      d.innerHTML = '<span class="n"></span><span></span>';
      d.children[0].textContent = n; d.children[1].textContent = texto;
      c.appendChild(d);
    }
    document.body.appendChild(c);
  }
  if (pie) { const p = document.createElement('div'); p.id = 'cap-pie'; p.textContent = pie; document.body.appendChild(p); }
}
"""

def main(spec_path):
    base = Path(spec_path).resolve().parent.parent
    specs = json.load(open(spec_path, encoding="utf-8"))
    with sync_playwright() as p:
        br = p.chromium.launch()
        for s in specs:
            pg = br.new_page(viewport={"width": s.get("ancho", 760), "height": 100}, device_scale_factor=1.5)
            pg.goto((base / s["solucion"]).as_uri())
            # Los selectores se buscan antes de añadir el marco, sobre el HTML original
            pg.add_style_tag(content=CSS)
            pg.evaluate(JS, [s.get("numeros", []), s.get("notas", []), s["url"], s.get("pie", "")])
            png = pg.screenshot(full_page=True)
            out = (base / s["salida"]).resolve()
            out.parent.mkdir(parents=True, exist_ok=True)
            Image.open(io.BytesIO(png)).convert("RGB").save(out, "WEBP", quality=82, method=6)
            print(f"{out.name}: {os.path.getsize(out)//1024} KB")
            pg.close()
        br.close()

if __name__ == "__main__":
    main(sys.argv[1])
