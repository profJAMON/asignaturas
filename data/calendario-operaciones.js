/* ============================================================
   Calendario de ritmo — Operaciones Básicas (OACE, 3030)
   ============================================================

   Para qué
   --------
   Fecha prevista de cada unidad, de cada sesión y de cada examen, para
   saber a lo largo del curso si vamos bien de tiempo. Operaciones solo
   se da en 1º (un único grupo), así que, a diferencia de
   data/calendario-instalaciones.js, aquí NO hay nivel de "grupos":
   cada unidad lleva directamente { inicio, fin }, su "examen" y cada
   sesión su "fecha". Este archivo es la ÚNICA fuente de esas fechas:
   ni las sesiones ni curso-operaciones.json las llevan dentro.

   Quién lo usa
   ------------
   js/calendario.js (el mismo que usa Instalaciones) lo lee para pintar
   la fecha junto a cada sesión en la barra lateral, en la propia sesión
   y en calendario.html?a=operaciones.

   Cambio de enfoque (28/09/2026)
   ------------------------------
   Todo el curso hasta Semana Santa es teórico; HTML/CSS pasa al final
   (desde el lunes 5 de abril de 2027). JavaScript, Python y Git salen
   de la asignatura. Las unidades se han renumerado; los id de unidad
   y de sesión NO cambian (romperían enlaces):
     - el-ordenador-y-tus-archivos  → Unidad 1 (antes U0)
     - fundamentos-internet         → Unidad 2
     - publicacion-web              → Unidad 3. Servicios de Internet
                                      (sin "Publicar de verdad", que pasa
                                      a la unidad de HTML)
     - html-css-practico            → Unidad 9 (antes U1). Sus sesiones
                                      están ocultas en curso-operaciones.json
                                      hasta abril, por eso aquí va con
                                      "sesiones": [].
   Unidad 4 (navegador-servicios-internet): creada el 01/10/2026, con
   3 sesiones (16/11, 19/11 y 23/11) + glosario; examen el jue 26/11.
   Unidades 5-8: aún no existen en la web; id y títulos provisionales.
   La Unidad 8 (Redes) está PENDIENTE DE DECIDIR: los alumnos son los
   mismos que los de 1r de Instalaciones y se solaparía. Si se quita,
   sus horas pasan a Windows y Linux o quedan de margen.

   Cómo se ha calculado
   ---------------------
   - Horario 2026-27: lunes 2 h (15:00-16:50) + jueves 3 h (18:15-20:55).
   - Del 21/09/2026 al 18/06/2027 (en 1º no hay prácticas en empresa).
   - Sin clase: 12 y 13 oct, 1 nov, 7 y 8 dic, Navidad (23/12-06/01),
     26 feb, 1 y 2 mar, Pascua (25/03-04/04), 1 may.
   - Los exámenes son siempre en jueves, de 19:10 a 21:00 (2 h), así que
     cada unidad con examen termina en jueves y ese día queda ~1 h de
     clase antes del examen (repaso de la unidad).
   - Teoría: 107 h del 01/10 al 18/03, con margen en Windows y Linux
     (las unidades más prácticas). Evaluaciones: 1ª = Unidades 1-5
     (examen de la U5 el 17/12); 2ª = Unidades 6-8 (examen de la U8 el
     18/03, en la semana de evaluación). El lunes 22/03 queda libre.
   - HTML/CSS: 45 h del 05/04 al 03/06; la semana del 07/06 queda para
     recuperaciones, antes de la semana de la 3ª evaluación (14/06).
   - Dentro de una unidad las sesiones se reparten a partes iguales sobre
     las horas de clase (mismo método que Instalaciones). La fecha de una
     sesión es el día en que empieza. Los glosarios no llevan fecha.

   Cómo actualizar
   ---------------
   Si el ritmo real se desvía: edita las fechas de la unidad afectada
   (y las siguientes si el desfase se arrastra), o pide que se
   recalcule a partir de la fecha real en la que vais.

   Aviso del examen en cada sesión (08/10/2026)
   --------------------------------------------
   Con "avisoExamen": true, cada sesión de una unidad con "examen"
   empieza con un recuadro grande: «Examen de la Unidad N · jueves 22
   de octubre · 19:10 · faltan N días» (js/calendario.js,
   pintarAvisoExamen). Para mover un examen basta con cambiar aquí su
   "examen": se actualiza solo en todas las sesiones de la unidad, en
   la barra lateral y en el calendario. "horaExamen" es la hora que
   sale en el aviso.
   ============================================================ */
const CALENDARIO_OPERACIONES = 
{
  "actualizado": "2026-10-08",
  "avisoExamen": true,
  "horaExamen": "19:10",
  "nota": "Fechas calculadas a partir de las horas por unidad y el horario real (lunes 2 h + jueves 3 h), con el calendario escolar 2026-2027. Los exámenes son los jueves de 19:10 a 21:00. Pueden retrasarse; sirven para saber si vas bien de tiempo, no como fecha exacta.",
  "unidades": [
    {
      "id": "antes-de-empezar",
      "titulo": "Antes de empezar",
      "horas": 1,
      "sesiones": [
        "formas-de-evaluar"
      ],
      "fechas": {
        "inicio": "2026-09-21",
        "fin": "2026-09-21"
      }
    },
    {
      "id": "el-ordenador-y-tus-archivos",
      "titulo": "Unidad 1. El ordenador y tus archivos",
      "horas": 5,
      "sesiones": [
        "sesion-1-teclado-explorador",
        "sesion-2-rutas-descargas",
        "sesion-3-propiedades-este-equipo",
        "sesion-4-copia-seguridad-drive"
      ],
      "fechas": {
        "inicio": "2026-09-21",
        "fin": "2026-09-28"
      }
    },
    {
      "id": "fundamentos-internet",
      "titulo": "Unidad 2. Fundamentos de Internet",
      "horas": 16,
      "sesiones": [
        "sesion-1-cliente-servidor-ip-dns",
        "sesion-2-red-desde-la-terminal",
        "sesion-3-navegador-devtools",
        "sesion-4-url-http-basico",
        "sesion-5-que-hace-falta-publicar"
      ],
      "fechas": {
        "inicio": "2026-10-01",
        "fin": "2026-10-22"
      },
      "examen": "2026-10-22"
    },
    {
      "id": "publicacion-web",
      "titulo": "Unidad 3. Servicios de Internet",
      "horas": 15,
      "sesiones": [
        "sesion-2-blogs-wikis",
        "sesion-3-redes-sociales-nube",
        "sesion-4-gestores-contenidos-p2p"
      ],
      "fechas": {
        "inicio": "2026-10-26",
        "fin": "2026-11-12"
      },
      "examen": "2026-11-12"
    },
    {
      "id": "navegador-servicios-internet",
      "titulo": "Unidad 4. El navegador, buscadores y correo",
      "horas": 10,
      "sesiones": [
        "sesion-1-el-navegador",
        "sesion-2-buscadores-privacidad",
        "sesion-3-correo-mensajeria"
      ],
      "fechas": {
        "inicio": "2026-11-16",
        "fin": "2026-11-26"
      },
      "examen": "2026-11-26"
    },
    {
      "id": "sistemas-operativos",
      "titulo": "Unidad 5. Sistemas operativos: virtualización e instalación",
      "horas": 13,
      "sesiones": [],
      "fechas": {
        "inicio": "2026-11-30",
        "fin": "2026-12-17"
      },
      "examen": "2026-12-17"
    },
    {
      "id": "windows",
      "titulo": "Unidad 6. Windows",
      "horas": 20,
      "sesiones": [],
      "fechas": {
        "inicio": "2026-12-21",
        "fin": "2027-01-28"
      },
      "examen": "2027-01-28"
    },
    {
      "id": "linux",
      "titulo": "Unidad 7. Linux",
      "horas": 20,
      "sesiones": [],
      "fechas": {
        "inicio": "2027-02-01",
        "fin": "2027-02-25"
      },
      "examen": "2027-02-25"
    },
    {
      "id": "redes-recursos-compartidos",
      "titulo": "Unidad 8. Redes",
      "horas": 13,
      "sesiones": [],
      "fechas": {
        "inicio": "2027-03-04",
        "fin": "2027-03-18"
      },
      "examen": "2027-03-18"
    },
    {
      "id": "html-css-practico",
      "titulo": "Unidad 9. Crea y publica tu web: HTML y CSS",
      "horas": 45,
      "sesiones": [],
      "fechas": {
        "inicio": "2027-04-05",
        "fin": "2027-06-03"
      },
      "examen": "2027-06-03"
    }
  ],
  "sesiones": {
    "formas-de-evaluar": {
      "titulo": "Formas de evaluar",
      "unidad": "antes-de-empezar",
      "fecha": "2026-09-21"
    },
    "sesion-1-teclado-explorador": {
      "titulo": "Sesión 1 — El teclado y el explorador de archivos",
      "unidad": "el-ordenador-y-tus-archivos",
      "fecha": "2026-09-21"
    },
    "sesion-2-rutas-descargas": {
      "titulo": "Sesión 2 — Rutas y descargas",
      "unidad": "el-ordenador-y-tus-archivos",
      "fecha": "2026-09-24"
    },
    "sesion-3-propiedades-este-equipo": {
      "titulo": "Sesión 3 — Propiedades de un archivo y Este equipo",
      "unidad": "el-ordenador-y-tus-archivos",
      "fecha": "2026-09-24"
    },
    "sesion-4-copia-seguridad-drive": {
      "titulo": "Sesión 4 — Copia de seguridad en Drive",
      "unidad": "el-ordenador-y-tus-archivos",
      "fecha": "2026-09-24"
    },
    "sesion-1-cliente-servidor-ip-dns": {
      "titulo": "Sesión 1. Cliente-servidor, IP y DNS",
      "unidad": "fundamentos-internet",
      "fecha": "2026-10-01"
    },
    "sesion-2-red-desde-la-terminal": {
      "titulo": "Sesión 2. La red desde la terminal",
      "unidad": "fundamentos-internet",
      "fecha": "2026-10-05"
    },
    "sesion-3-navegador-devtools": {
      "titulo": "Sesión 3. El navegador y sus herramientas (DevTools)",
      "unidad": "fundamentos-internet",
      "fecha": "2026-10-08"
    },
    "sesion-4-url-http-basico": {
      "titulo": "Sesión 4. Anatomía de una URL y HTTP básico",
      "unidad": "fundamentos-internet",
      "fecha": "2026-10-15"
    },
    "sesion-5-que-hace-falta-publicar": {
      "titulo": "Sesión 5. Qué hace falta para publicar",
      "unidad": "fundamentos-internet",
      "fecha": "2026-10-19"
    },
    "sesion-2-blogs-wikis": {
      "titulo": "Sesión 1. Blogs, foros y wikis",
      "unidad": "publicacion-web",
      "fecha": "2026-10-26"
    },
    "sesion-3-redes-sociales-nube": {
      "titulo": "Sesión 2. Redes sociales, sindicación y la nube",
      "unidad": "publicacion-web",
      "fecha": "2026-11-02"
    },
    "sesion-4-gestores-contenidos-p2p": {
      "titulo": "Sesión 3. Gestores de contenidos y redes P2P",
      "unidad": "publicacion-web",
      "fecha": "2026-11-09"
    },
    "sesion-1-el-navegador": {
      "titulo": "Sesión 1. El navegador: pestañas, favoritos e historial",
      "unidad": "navegador-servicios-internet",
      "fecha": "2026-11-16"
    },
    "sesion-2-buscadores-privacidad": {
      "titulo": "Sesión 2. Buscadores y privacidad al navegar",
      "unidad": "navegador-servicios-internet",
      "fecha": "2026-11-19"
    },
    "sesion-3-correo-mensajeria": {
      "titulo": "Sesión 3. Correo electrónico, mensajería y videollamadas",
      "unidad": "navegador-servicios-internet",
      "fecha": "2026-11-23"
    }
  }
}
;
