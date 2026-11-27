/* ============================================================
   Calendario de ritmo — Proyecto Intermodular
   ============================================================

   Para qué
   --------
   Fecha prevista de cada bloque, de cada sesión y de la prueba
   individual, para que los alumnos y Carles sepan si vamos atrasados.
   Proyecto se da a un único grupo: igual que Operaciones, NO hay nivel
   de "grupos". Este archivo es la ÚNICA fuente de esas fechas: ni las
   sesiones ni curso-proyecto.json las llevan dentro.

   Quién lo usa
   ------------
   js/calendario.js, igual que los de Operaciones e Instalaciones: la
   fecha junto a cada sesión en la barra lateral y en la propia sesión,
   el bloque "esta semana" de la portada y calendario.html?a=proyecto.

   Cómo se ha calculado (24/09/2026)
   ---------------------------------
   - Horario: jueves de 15:55 a 17:45. Una sesión por jueves (la web
     dice "cada semana tenemos una sesión de 2 horas").
   - Primer día: jueves 24/09/2026. "Cómo se evalúa" va ese mismo día,
     al empezar la sesión 1.
   - Días sin clase: los mismos de data/no-lectivo.js. En jueves solo
     caen Navidad (24 y 31 dic) y Pascua (25 mar y 1 abr); Pascua ya
     queda fuera porque el módulo termina antes.
   - Sesiones: las 21 de curso-proyecto.json (s01 a s21).
   - Pruebas: una, la prueba individual. Es la primera hora de la
     sesión 19 (la segunda hora se prepara la presentación), así que
     NO ocupa un jueves aparte. Va como "examen" del Bloque 4 con su
     propio rótulo ("examenTitulo"). Corregido el 29/09/2026: antes
     ocupaba un jueves entero y la sesión 21 caía el 04/03/2027,
     después del final de 2º (prácticas).
   - Las presentaciones (sesión 20) son una sesión normal.
   - "horas" de cada bloque = 2 h por sesión (la prueba no se cuenta).
   - Resultado: s01-s13 antes de Navidad (encaja con la sesión 14,
     "repaso después de Navidad"), prueba el 11/02 y última sesión
     (s21, cierre) el 25/02/2027.
   - 29/09/2026: sesiones reorganizadas en ejercicios individuales +
     talleres en pareja (s03-s06 y s17 con ids nuevos).

   - 25/11/2026: la sesión 9 y la 10 se parten en dos cada una para
     aligerarlas (9a Cajas, 9b Hover y tablas, 10a Flexbox: cajas en
     fila, 10b Flexbox: menú y tarjetas), con las fechas reales de la
     clase (la sesión 8 se dio el 19/11, una semana tarde, y se le pone esa
     fecha): 9a el 26/11,
     9b el 03/12, 10a el 10/12, 10b el 17/12 y el taller de CSS (s11)
     el 07/01. El Bloque 3 (JavaScript, s12-s17) se queda en la web
     pero sin fecha por sesión, solo con el rango del bloque (14/01 a
     28/01), hasta que Carles decida entre JavaScript y la impresora
     3D. El Bloque 4 (s18-s21) no cambia.
   - 27/11/2026: la 9a y la 9b se dieron las dos el 26/11. Todo se
     adelanta una semana: 10a el 03/12, 10b el 10/12 y el taller de CSS
     (s11) el 17/12. Desde enero no cambia.
   - 27/11/2026 (tarde): la 10a pasa a 4 ejercicios y la 10b a 3 (5, 6
     y 7), todos con el HTML en el zip. El 07/01, sesión nueva de
     repaso (s11b): tres ejercicios solo con la imagen, HTML y CSS.
   - 25/11/2026 (tarde): Carles elige la impresora 3D. Bloque 3b nuevo
     (proy-impresora-3d: 3D1 el 14/01, 3D2 el 21/01, 3D3 el 28/01).
     JavaScript pasa a "extra" (si da tiempo al final): se queda en la
     web, sin fechas.

   Cómo actualizar
   ---------------
   Si el ritmo real se desvía: cambia la fecha de la sesión afectada y
   corre las siguientes al jueves siguiente (saltando Navidad), o pide
   que se recalcule a partir de la sesión en la que vais.
   ============================================================ */
const CALENDARIO_PROYECTO = 
{
  "actualizado": "2026-11-25",
  "nota": "Una sesión por semana, los jueves de 15:55 a 17:45, con el calendario escolar 2026-2027. La prueba individual es la primera hora de la sesión 19. Las fechas son previstas: sirven para saber si vas bien de tiempo, no como fecha exacta.",
  "unidades": [
    {
      "id": "proy-antes-de-empezar",
      "titulo": "Antes de empezar",
      "sesiones": [
        "proy-como-se-evalua"
      ],
      "fechas": {
        "inicio": "2026-09-24",
        "fin": "2026-09-24"
      }
    },
    {
      "id": "proy-arranque",
      "titulo": "Bloque 0. Arranque",
      "horas": 4,
      "sesiones": [
        "proy-s01-arranque",
        "proy-s02-github-textos"
      ],
      "fechas": {
        "inicio": "2026-09-24",
        "fin": "2026-10-01"
      }
    },
    {
      "id": "proy-html",
      "titulo": "Bloque 1. HTML",
      "horas": 10,
      "sesiones": [
        "proy-s03-listas-imagenes",
        "proy-s04-enlaces-tablas",
        "proy-s05-formularios",
        "proy-s06-taller-html",
        "proy-s07-publicar"
      ],
      "fechas": {
        "inicio": "2026-10-08",
        "fin": "2026-11-05"
      }
    },
    {
      "id": "proy-css",
      "titulo": "Bloque 2. CSS",
      "horas": 12,
      "sesiones": [
        "proy-s08-css",
        "proy-s09-caja",
        "proy-s09b-hover",
        "proy-s10-flexbox",
        "proy-s10b-menu-tarjetas",
        "proy-s11-revision-1",
        "proy-s11b-repaso"
      ],
      "fechas": {
        "inicio": "2026-11-12",
        "fin": "2027-01-07"
      }
    },
    {
      "id": "proy-javascript",
      "titulo": "Bloque 3. JavaScript (extra)",
      "horas": 12,
      "sesiones": [
        "proy-s12-js-variables",
        "proy-s13-botones",
        "proy-s14-leer-formulario",
        "proy-s15-if-else",
        "proy-s16-classlist",
        "proy-s17-taller-js"
      ]
    },
    {
      "id": "proy-impresora-3d",
      "titulo": "Bloque 3b. Impresora 3D",
      "horas": 6,
      "sesiones": [
        "proy-3d-s1-llavero",
        "proy-3d-s2-producto",
        "proy-3d-s3-pieza"
      ],
      "fechas": {
        "inicio": "2027-01-14",
        "fin": "2027-01-28"
      }
    },
    {
      "id": "proy-cierre",
      "titulo": "Bloque 4. Cierre",
      "horas": 8,
      "sesiones": [
        "proy-s18-revision-final",
        "proy-s19-prueba",
        "proy-s20-presentaciones",
        "proy-s21-cierre"
      ],
      "fechas": {
        "inicio": "2027-02-04",
        "fin": "2027-02-25"
      },
      "examen": "2027-02-11",
      "examenTitulo": "Prueba individual"
    }
  ],
  "sesiones": {
    "proy-como-se-evalua": {
      "titulo": "Cómo se evalúa",
      "unidad": "proy-antes-de-empezar",
      "fecha": "2026-09-24"
    },
    "proy-s01-arranque": {
      "titulo": "Sesión 1 — Empezamos: tema, carpeta y primera página",
      "unidad": "proy-arranque",
      "fecha": "2026-09-24"
    },
    "proy-s02-github-textos": {
      "titulo": "Sesión 2 — VS Code, textos y GitHub",
      "unidad": "proy-arranque",
      "fecha": "2026-10-01"
    },
    "proy-s03-listas-imagenes": {
      "titulo": "Sesión 3 — Listas e imágenes",
      "unidad": "proy-html",
      "fecha": "2026-10-08"
    },
    "proy-s04-enlaces-tablas": {
      "titulo": "Sesión 4 — Enlaces, menú y tablas",
      "unidad": "proy-html",
      "fecha": "2026-10-15"
    },
    "proy-s05-formularios": {
      "titulo": "Sesión 5 — Formularios y repaso de HTML",
      "unidad": "proy-html",
      "fecha": "2026-10-22"
    },
    "proy-s06-taller-html": {
      "titulo": "Sesión 6 — Taller: montamos la web",
      "unidad": "proy-html",
      "fecha": "2026-10-29"
    },
    "proy-s07-publicar": {
      "titulo": "Sesión 7 — Taller: la web publicada",
      "unidad": "proy-html",
      "fecha": "2026-11-05"
    },
    "proy-s08-css": {
      "titulo": "Sesión 8 — Introducción a CSS",
      "unidad": "proy-css",
      "fecha": "2026-11-19"
    },
    "proy-s09-caja": {
      "titulo": "Sesión 9a — Cajas",
      "unidad": "proy-css",
      "fecha": "2026-11-26"
    },
    "proy-s09b-hover": {
      "titulo": "Sesión 9b — Hover y tablas",
      "unidad": "proy-css",
      "fecha": "2026-11-26"
    },
    "proy-s10-flexbox": {
      "titulo": "Sesión 10a — Flexbox: cajas en fila",
      "unidad": "proy-css",
      "fecha": "2026-12-03"
    },
    "proy-s10b-menu-tarjetas": {
      "titulo": "Sesión 10b — Flexbox: menú y tarjetas",
      "unidad": "proy-css",
      "fecha": "2026-12-10"
    },
    "proy-s11-revision-1": {
      "titulo": "Sesión 11 — Taller de CSS y primera revisión",
      "unidad": "proy-css",
      "fecha": "2026-12-17"
    },
    "proy-s11b-repaso": {
      "titulo": "Sesión 11b — Repaso: hazlo todo tú",
      "unidad": "proy-css",
      "fecha": "2027-01-07"
    },
    "proy-s12-js-variables": {
      "titulo": "Sesión 12 — JavaScript: consola y variables",
      "unidad": "proy-javascript"
    },
    "proy-s13-botones": {
      "titulo": "Sesión 13 — Botones que hacen cosas",
      "unidad": "proy-javascript"
    },
    "proy-s14-leer-formulario": {
      "titulo": "Sesión 14 — Ensayo de la prueba y leer formularios",
      "unidad": "proy-javascript"
    },
    "proy-s15-if-else": {
      "titulo": "Sesión 15 — Tomar decisiones con if",
      "unidad": "proy-javascript"
    },
    "proy-s16-classlist": {
      "titulo": "Sesión 16 — Cambiar el aspecto con classList",
      "unidad": "proy-javascript"
    },
    "proy-s17-taller-js": {
      "titulo": "Sesión 17 — Taller de JavaScript",
      "unidad": "proy-javascript"
    },
    "proy-3d-s1-llavero": {
      "titulo": "Sesión 3D1 — Tinkercad y tu llavero",
      "unidad": "proy-impresora-3d",
      "fecha": "2027-01-14"
    },
    "proy-3d-s2-producto": {
      "titulo": "Sesión 3D2 — El producto de vuestra empresa",
      "unidad": "proy-impresora-3d",
      "fecha": "2027-01-21"
    },
    "proy-3d-s3-pieza": {
      "titulo": "Sesión 3D3 — La pieza, la foto y la ficha de empresa",
      "unidad": "proy-impresora-3d",
      "fecha": "2027-01-28"
    },
    "proy-s18-revision-final": {
      "titulo": "Sesión 18 — Taller final y revisión de la web",
      "unidad": "proy-cierre",
      "fecha": "2027-02-04"
    },
    "proy-s19-prueba": {
      "titulo": "Sesión 19 — Prueba individual",
      "unidad": "proy-cierre",
      "fecha": "2027-02-11"
    },
    "proy-s20-presentaciones": {
      "titulo": "Sesión 20 — Presentaciones",
      "unidad": "proy-cierre",
      "fecha": "2027-02-18"
    },
    "proy-s21-cierre": {
      "titulo": "Sesión 21 — Cierre del curso",
      "unidad": "proy-cierre",
      "fecha": "2027-02-25"
    }
  }
}
;
