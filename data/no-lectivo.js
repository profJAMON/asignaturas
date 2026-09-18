/* ============================================================
   Días sin clase — curso 2026-2027
   ============================================================

   Para qué
   --------
   Hasta ahora los días sin clase solo existían como comentario en la
   cabecera de data/calendario-operaciones.js, así que la web no sabía
   distinguir "esta semana no hay sesiones porque son vacaciones" de
   "esta semana no hay sesiones porque el curso aún no ha empezado".
   Este archivo lo convierte en dato, y con él la portada puede decirlo
   (ver el bloque "Esta semana" en js/main.js).

   Es el calendario del CENTRO, no el de una asignatura: vale para
   todas, y por eso vive en su propio archivo y no dentro del
   calendario de ritmo de cada una.

   OJO: las fechas salen del comentario de calendario-operaciones.js
   ("Sin clase: 12 y 13 oct, 1 nov, 7 y 8 dic, Navidad 23/12-06/01,
   26 feb, 1 y 2 mar, Pascua 25/03-04/04, 1 may"). Los nombres los he
   puesto yo: revísalos, sobre todo los días de libre disposición, que
   cada centro pone donde quiere.

   Para añadir o corregir un día: una línea más aquí y ya está.
   "desde" y "hasta" son inclusivos; para un solo día, los dos iguales.
   ============================================================ */

const NO_LECTIVO = [
  { desde: '2026-10-12', hasta: '2026-10-12', titulo: 'Fiesta Nacional', tipo: 'festivo' },
  { desde: '2026-10-13', hasta: '2026-10-13', titulo: 'Día de libre disposición', tipo: 'festivo' },
  { desde: '2026-11-01', hasta: '2026-11-01', titulo: 'Todos los Santos', tipo: 'festivo' },
  { desde: '2026-12-07', hasta: '2026-12-08', titulo: 'Puente de diciembre', tipo: 'festivo' },
  { desde: '2026-12-23', hasta: '2027-01-06', titulo: 'Vacaciones de Navidad', tipo: 'vacaciones' },
  { desde: '2027-02-26', hasta: '2027-02-26', titulo: 'Día de libre disposición', tipo: 'festivo' },
  { desde: '2027-03-01', hasta: '2027-03-02', titulo: 'Día de les Illes Balears', tipo: 'festivo' },
  { desde: '2027-03-25', hasta: '2027-04-04', titulo: 'Vacaciones de Pascua', tipo: 'vacaciones' },
  { desde: '2027-05-01', hasta: '2027-05-01', titulo: 'Día del Trabajo', tipo: 'festivo' },
];

/* ------------------------------------------------------------
   Las pullas
   ------------------------------------------------------------
   Lo que se enseña tachado es siempre "Venir a clase"; esto es lo que
   va encima, como un sello.

   TODO EL TONO DE LA BROMA ESTÁ AQUÍ: si algún día quieres bajarlo
   (la web es pública y la puede abrir cualquiera, no solo tu clase),
   cambias estas frases y no hay que tocar nada más. */

const PULLAS = {
  festivo: [
    'Y una mierda, es festivo',
    'Ni de coña, hoy no se viene',
    'De eso nada: es festivo',
  ],
  vacaciones: [
    'Ni de coña, son vacaciones',
    'Y una mierda, estamos de vacaciones',
    'Nanai: vacaciones',
  ],
};

(function () {
  'use strict';

  /* El día que se le pregunte, en ISO. Devuelve el periodo que lo
     incluye, o null. Las fechas son cadenas "aaaa-mm-dd", así que se
     comparan como texto y no hace falta construir ningún Date. */
  function periodoDe(iso) {
    if (!iso) return null;
    return NO_LECTIVO.find(p => iso >= p.desde && iso <= p.hasta) || null;
  }

  /* ¿Están TODOS estos días sin clase? Sirve para saber si la semana
     entera se va de vacaciones o si solo cae un puente suelto. */
  function periodoDeTodos(dias) {
    if (!dias || dias.length === 0) return null;
    const periodos = dias.map(periodoDe);
    if (periodos.some(p => !p)) return null;
    /* Si la semana cae en dos periodos distintos (raro, pero pasa con
       un puente pegado a vacaciones), manda el primero. */
    return periodos[0];
  }

  /* La frase, elegida por la fecha y no al azar: así no cambia cada
     vez que el alumno recarga, pero sí es distinta en cada puente. */
  function pulla(periodo) {
    if (!periodo) return '';
    const frases = PULLAS[periodo.tipo] || PULLAS.festivo;
    const semilla = periodo.desde.split('-').reduce((total, parte) => total + Number(parte), 0);
    return frases[semilla % frases.length];
  }

  window.sinClase = { periodoDe, periodoDeTodos, pulla };
})();
