/* ============================================================
   Calendario de ritmo — Instalación y mantenimiento de redes
   ============================================================

   Para qué
   --------
   Carles da esta asignatura a dos grupos con horarios muy distintos
   (1r: 5h/semana, martes+viernes · 2n: 8h/semana, lunes+martes+
   miércoles+viernes), así que a cada grupo le toca cada unidad y
   cada sesión en fechas distintas aunque el contenido es el mismo.
   Este archivo es la ÚNICA fuente de esas fechas: ni las sesiones ni
   el curso.json las llevan dentro, para no tener que tocar 20+
   archivos cada vez que el ritmo real se desvía del calculado.

   Quién lo usa
   ------------
   js/calendario.js lee este objeto para:
   - pintar una fecha junto a cada sesión en la barra lateral y en la
     propia sesión ("fecha prevista de inicio"),
   - construir la página calendario.html con la planificación completa.

   Sobre los exámenes (18/09/2026)
   --------------------------------
   Cada unidad tiene su propio examen (menos cableado estructurado) y
   ESE examen ya está incluido dentro de las horas de la unidad (las
   18h de UT1 ya cuentan con su examen: no se resta tiempo aparte).
   Lo que SÍ es aparte es el "examen-final" (comprensivo, al final de
   todo): se ha añadido como una unidad más de 2h, sin sesiones, al
   final de la lista. Con esto, 1r pasa de +1h de margen a -1h (casi
   exacto, un pequeño recorte lo absorbe sin problema) y 2n empeora de
   -6/-10h a -8/-12h de déficit según la fecha de fin que se use.

   Los "titulo" de sesión de prevencion-riesgos y antes-de-empezar son
   provisionales (esas unidades aún no están publicadas en el sitio):
   revísalos contra el título real cuando se publiquen.

   Cómo se ha calculado
   ---------------------
   Horas de la "ESTRUCTURA ACORDADA" (ver claude/auditoria-material-redes.md
   en el proyecto), repartidas entre los días de clase reales de cada
   grupo según el calendario escolar de les Illes Balears 2026-2027
   (con los festius propios del centro: 13 oct, 7 dic, 2 mar) y
   descontando vacaciones de Nadal y Pasqua. Detalle completo, con las
   asunciones y el contraste contra las evaluaciones reales, en
   claude/calendario-1r-2n.md (proyecto "Instalaciones").

   Cómo actualizar
   ---------------
   Si el ritmo real se retrasa o adelanta respecto a esto: edita las
   fechas de la unidad afectada (y de las que vengan después, si el
   desfase se arrastra) o pide que se recalcule con las fechas reales.
   "fin": null en las últimas unidades para 2n significa que, con el
   calendario actual, esas unidades NO caben en el curso de 2n — ver
   la nota en claude/calendario-1r-2n.md sobre recortar UT9 para ese
   grupo.
   ============================================================ */
const CALENDARIO_INSTALACIONES = {
  "grupos": [
    {
      "id": "1r",
      "nombre": "1r"
    },
    {
      "id": "2n",
      "nombre": "2n"
    }
  ],
  "actualizado": "2026-09-18",
  "unidades": [
    {
      "id": "antes-de-empezar",
      "titulo": "Antes de empezar",
      "horas": 1,
      "sesiones": [
        "inst-formas-de-evaluar"
      ],
      "fechas": {
        "1r": {
          "inicio": "2026-09-22",
          "fin": "2026-09-22"
        },
        "2n": {
          "inicio": "2026-09-21",
          "fin": "2026-09-21"
        }
      }
    },
    {
      "id": "evaluacion-inicial",
      "titulo": "Unidad 0. Evaluación inicial",
      "horas": 3,
      "sesiones": [
        "inst-u0-de-que-va-el-modulo",
        "inst-u0-prueba-inicial"
      ],
      "fechas": {
        "1r": {
          "inicio": "2026-09-22",
          "fin": "2026-09-25"
        },
        "2n": {
          "inicio": "2026-09-21",
          "fin": "2026-09-22"
        }
      }
    },
    {
      "id": "introduccion-redes",
      "titulo": "Unidad 1. Introducción a las redes",
      "horas": 18,
      "sesiones": [
        "inst-u1-comunicacion",
        "inst-u1-binario",
        "inst-u1-unidades",
        "inst-u1-que-es-una-red",
        "inst-u1-osi",
        "inst-u1-mac",
        "inst-u1-ip",
        "inst-u1-subredes",
        "inst-u1-dhcp-comandos",
        "inst-u1-repaso"
      ],
      "fechas": {
        "1r": {
          "inicio": "2026-09-25",
          "fin": "2026-10-23"
        },
        "2n": {
          "inicio": "2026-09-23",
          "fin": "2026-10-07"
        }
      }
    },
    {
      "id": "prevencion-riesgos",
      "titulo": "Unidad 2. Prevención de riesgos laborales",
      "horas": 18,
      "sesiones": [
        "inst-u2-trabajo-y-salud",
        "inst-u2-siniestralidad",
        "inst-u2-evaluacion-riesgos",
        "inst-u2-lugar-de-trabajo",
        "inst-u2-riesgo-electrico-incendios",
        "inst-u2-carga-fisica-y-pvd",
        "inst-u2-riesgos-psicosociales",
        "inst-u2-epi-y-senalizacion",
        "inst-u2-raee",
        "inst-u2-repaso"
      ],
      "fechas": {
        "1r": {
          "inicio": "2026-10-27",
          "fin": "2026-11-17"
        },
        "2n": {
          "inicio": "2026-10-09",
          "fin": "2026-10-27"
        }
      }
    },
    {
      "id": "medios-cobre",
      "titulo": "Unidad 3. Medios de transmisión: cobre",
      "horas": 30,
      "sesiones": [],
      "fechas": {
        "1r": {
          "inicio": "2026-11-20",
          "fin": "2027-01-19"
        },
        "2n": {
          "inicio": "2026-10-28",
          "fin": "2026-11-23"
        }
      }
    },
    {
      "id": "fibra-optica",
      "titulo": "Unidad 4. Fibra óptica",
      "horas": 10,
      "sesiones": [],
      "fechas": {
        "1r": {
          "inicio": "2027-01-19",
          "fin": "2027-02-02"
        },
        "2n": {
          "inicio": "2026-11-24",
          "fin": "2026-12-01"
        }
      }
    },
    {
      "id": "sistemas-inalambricos",
      "titulo": "Unidad 5. Sistemas inalámbricos",
      "horas": 20,
      "sesiones": [],
      "fechas": {
        "1r": {
          "inicio": "2027-02-02",
          "fin": "2027-03-09"
        },
        "2n": {
          "inicio": "2026-12-02",
          "fin": "2026-12-22"
        }
      }
    },
    {
      "id": "dispositivos-interconexion",
      "titulo": "Unidad 6. Dispositivos de interconexión",
      "horas": 24,
      "sesiones": [],
      "fechas": {
        "1r": {
          "inicio": "2027-03-09",
          "fin": "2027-04-20"
        },
        "2n": {
          "inicio": "2027-01-08",
          "fin": "2027-01-27"
        }
      }
    },
    {
      "id": "subredes",
      "titulo": "Unidad 7. Direccionamiento y subredes",
      "horas": 18,
      "sesiones": [],
      "fechas": {
        "1r": {
          "inicio": "2027-04-20",
          "fin": "2027-05-14"
        },
        "2n": {
          "inicio": "2027-01-29",
          "fin": "2027-02-12"
        }
      }
    },
    {
      "id": "cableado-estructurado",
      "titulo": "Unidad 8. Cableado estructurado y canalizaciones",
      "horas": 12,
      "sesiones": [],
      "fechas": {
        "1r": {
          "inicio": "2027-05-18",
          "fin": "2027-06-01"
        },
        "2n": {
          "inicio": "2027-02-15",
          "fin": "2027-02-23"
        }
      }
    },
    {
      "id": "montaje-oficina",
      "titulo": "Unidad 9. Montaje de la red de la oficina",
      "horas": 12,
      "sesiones": [],
      "fechas": {
        "1r": {
          "inicio": "2027-06-01",
          "fin": "2027-06-18"
        },
        "2n": {
          "inicio": "2027-02-24",
          "fin": null
        }
      }
    },
    {
      "id": "examen-final",
      "titulo": "Examen final",
      "horas": 2,
      "sesiones": [],
      "fechas": {
        "1r": {
          "inicio": "2027-06-18",
          "fin": null
        },
        "2n": {
          "inicio": null,
          "fin": null
        }
      }
    }
  ],
  "sesiones": {
    "inst-formas-de-evaluar": {
      "titulo": "Formas de evaluar",
      "unidad": "antes-de-empezar",
      "1r": "2026-09-22",
      "2n": "2026-09-21"
    },
    "inst-u0-de-que-va-el-modulo": {
      "titulo": "Sesión 1 — De qué va este módulo",
      "unidad": "evaluacion-inicial",
      "1r": "2026-09-22",
      "2n": "2026-09-21"
    },
    "inst-u0-prueba-inicial": {
      "titulo": "Sesión 2 — La prueba inicial",
      "unidad": "evaluacion-inicial",
      "1r": "2026-09-22",
      "2n": "2026-09-22"
    },
    "inst-u1-comunicacion": {
      "titulo": "Sesión 1 — Comunicación, ruido y protocolos",
      "unidad": "introduccion-redes",
      "1r": "2026-09-25",
      "2n": "2026-09-23"
    },
    "inst-u1-binario": {
      "titulo": "Sesión 2 — El sistema binario",
      "unidad": "introduccion-redes",
      "1r": "2026-09-29",
      "2n": "2026-09-23"
    },
    "inst-u1-unidades": {
      "titulo": "Sesión 3 — Unidades de medida de la información",
      "unidad": "introduccion-redes",
      "1r": "2026-09-29",
      "2n": "2026-09-25"
    },
    "inst-u1-que-es-una-red": {
      "titulo": "Sesión 4 — Qué es una red y de qué está hecha",
      "unidad": "introduccion-redes",
      "1r": "2026-10-02",
      "2n": "2026-09-28"
    },
    "inst-u1-osi": {
      "titulo": "Sesión 5 — Protocolos y el modelo OSI",
      "unidad": "introduccion-redes",
      "1r": "2026-10-06",
      "2n": "2026-09-29"
    },
    "inst-u1-mac": {
      "titulo": "Sesión 6 — La dirección MAC",
      "unidad": "introduccion-redes",
      "1r": "2026-10-09",
      "2n": "2026-09-30"
    },
    "inst-u1-ip": {
      "titulo": "Sesión 7 — La dirección IP, la máscara y las clases",
      "unidad": "introduccion-redes",
      "1r": "2026-10-09",
      "2n": "2026-10-02"
    },
    "inst-u1-subredes": {
      "titulo": "Sesión 8 — Primer contacto con las subredes",
      "unidad": "introduccion-redes",
      "1r": "2026-10-16",
      "2n": "2026-10-05"
    },
    "inst-u1-dhcp-comandos": {
      "titulo": "Sesión 9 — IPv6, DHCP y los comandos de red",
      "unidad": "introduccion-redes",
      "1r": "2026-10-20",
      "2n": "2026-10-06"
    },
    "inst-u1-repaso": {
      "titulo": "Sesión 10 — Repaso y banco de preguntas del examen",
      "unidad": "introduccion-redes",
      "1r": "2026-10-23",
      "2n": "2026-10-07"
    },
    "inst-u2-trabajo-y-salud": {
      "titulo": "Sesión 1 — Trabajo y salud",
      "unidad": "prevencion-riesgos",
      "1r": "2026-10-27",
      "2n": "2026-10-09"
    },
    "inst-u2-siniestralidad": {
      "titulo": "Sesión 2 — Siniestralidad",
      "unidad": "prevencion-riesgos",
      "1r": "2026-10-27",
      "2n": "2026-10-09"
    },
    "inst-u2-evaluacion-riesgos": {
      "titulo": "Sesión 3 — Evaluación de riesgos",
      "unidad": "prevencion-riesgos",
      "1r": "2026-10-30",
      "2n": "2026-10-14"
    },
    "inst-u2-lugar-de-trabajo": {
      "titulo": "Sesión 4 — El lugar de trabajo",
      "unidad": "prevencion-riesgos",
      "1r": "2026-11-03",
      "2n": "2026-10-16"
    },
    "inst-u2-riesgo-electrico-incendios": {
      "titulo": "Sesión 5 — Riesgo eléctrico e incendios",
      "unidad": "prevencion-riesgos",
      "1r": "2026-11-03",
      "2n": "2026-10-19"
    },
    "inst-u2-carga-fisica-y-pvd": {
      "titulo": "Sesión 6 — Carga física y pantallas de visualización",
      "unidad": "prevencion-riesgos",
      "1r": "2026-11-06",
      "2n": "2026-10-20"
    },
    "inst-u2-riesgos-psicosociales": {
      "titulo": "Sesión 7 — Riesgos psicosociales",
      "unidad": "prevencion-riesgos",
      "1r": "2026-11-10",
      "2n": "2026-10-21"
    },
    "inst-u2-epi-y-senalizacion": {
      "titulo": "Sesión 8 — EPI y señalización",
      "unidad": "prevencion-riesgos",
      "1r": "2026-11-10",
      "2n": "2026-10-23"
    },
    "inst-u2-raee": {
      "titulo": "Sesión 9 — RAEE: residuos electrónicos",
      "unidad": "prevencion-riesgos",
      "1r": "2026-11-13",
      "2n": "2026-10-26"
    },
    "inst-u2-repaso": {
      "titulo": "Sesión 10 — Repaso y banco de preguntas",
      "unidad": "prevencion-riesgos",
      "1r": "2026-11-17",
      "2n": "2026-10-27"
    }
  }
}
;
