/* ============================================================
   Lo que el navegador recuerda del alumno
   ============================================================

   Para qué
   --------
   Tres cosas, todas en el localStorage de SU navegador y ninguna en
   ningún servidor:

     ob-visitadas   qué sesiones ha abierto
     ob-lectura     por dónde iba dentro de cada una
     ob-respuestas  qué ha contestado en los tests

   Ojo con la palabra: VISITADA no es COMPLETADA. La web no sabe si
   ha hecho las actividades, ni si las ha hecho bien, ni si ha
   entendido nada. Por eso aquí no hay barras de progreso ni
   porcentajes: contar páginas abiertas y llamarlo avance sería
   mentirle al alumno. Lo único que se dice es "por aquí ya pasaste".

   Cómo se guarda
   --------------
   Misma convención que el resto del sitio (ob-aspecto, ob-idioma,
   ob-ultima-sesion): clave con prefijo "ob-" y todo envuelto en
   try/catch, porque en incógnito o con las cookies bloqueadas
   localStorage lanza excepción. Si falla, la web funciona igual;
   simplemente no recuerda nada.

   Las tres listas tienen tope. Sin él, un curso entero de idas y
   venidas acaba llenando el hueco que el navegador da por dominio y
   entonces empieza a fallar TODO lo guardado, incluido el modo claro.
   Al llegar al tope se tira lo más viejo.
   ============================================================ */

(function () {
  'use strict';

  const CLAVE_VISITADAS = 'ob-visitadas';
  const CLAVE_LECTURA = 'ob-lectura';
  const CLAVE_RESPUESTAS = 'ob-respuestas';

  const TOPE_VISITADAS = 400;   // ids cortos: sobra para las tres asignaturas
  const TOPE_LECTURA = 40;      // solo interesa lo reciente
  const TOPE_RESPUESTAS = 120;

  /* Una posición de lectura vieja no vale para nada: si vuelve un mes
     después, lo que quiere es empezar la sesión, no caer a medias. */
  const DIAS_LECTURA = 21;

  /* ---------- Leer y escribir sin que nada reviente ---------- */

  function leer(clave, porDefecto) {
    try {
      const crudo = localStorage.getItem(clave);
      if (!crudo) return porDefecto;
      const datos = JSON.parse(crudo);
      return datos && typeof datos === 'object' ? datos : porDefecto;
    } catch (e) {
      return porDefecto;
    }
  }

  function escribir(clave, datos) {
    try {
      localStorage.setItem(clave, JSON.stringify(datos));
    } catch (e) {
      /* Sin memoria, pero la web sigue. */
    }
  }

  /* Deja en el objeto solo las `tope` entradas más nuevas. Se ordena
     por el valor guardado (todos llevan marca de tiempo). */
  function podar(objeto, tope, marca) {
    const claves = Object.keys(objeto);
    if (claves.length <= tope) return objeto;
    claves
      .sort((a, b) => marca(objeto[b]) - marca(objeto[a]))
      .slice(tope)
      .forEach(k => delete objeto[k]);
    return objeto;
  }

  function ahora() {
    return Date.now();
  }

  /* ---------- Sesiones visitadas ---------- */

  function visitadas() {
    return leer(CLAVE_VISITADAS, {});
  }

  function estaVisitada(id) {
    return !!(id && visitadas()[id]);
  }

  function marcarVisitada(id) {
    if (!id) return;
    const datos = visitadas();
    datos[id] = ahora();
    escribir(CLAVE_VISITADAS, podar(datos, TOPE_VISITADAS, v => v || 0));
  }

  /* ---------- Por dónde iba ---------- */

  function guardarLectura(id, y) {
    if (!id) return;
    const datos = leer(CLAVE_LECTURA, {});
    /* Menos de una pantalla de scroll no es "ibas por aquí": es que
       acaba de entrar. Guardar eso solo sirve para ofrecerle volver a
       donde ya está. */
    if (y < 500) {
      delete datos[id];
    } else {
      datos[id] = { y: Math.round(y), t: ahora() };
    }
    escribir(CLAVE_LECTURA, podar(datos, TOPE_LECTURA, v => (v && v.t) || 0));
  }

  /* Devuelve la altura guardada, o 0 si no hay o si ya ha caducado. */
  function leerLectura(id) {
    const guardado = leer(CLAVE_LECTURA, {})[id];
    if (!guardado || !guardado.y) return 0;
    const dias = (ahora() - (guardado.t || 0)) / 86400000;
    return dias > DIAS_LECTURA ? 0 : guardado.y;
  }

  function olvidarLectura(id) {
    const datos = leer(CLAVE_LECTURA, {});
    if (!(id in datos)) return;
    delete datos[id];
    escribir(CLAVE_LECTURA, datos);
  }

  /* ---------- Respuestas de las actividades ----------

     Lo que se guarda es lo que el alumno pulsó, no si estaba bien:
     al volver a pintar la actividad se vuelve a comprobar contra el
     json, así que si se corrige una respuesta del temario, lo
     guardado no se queda contradiciendo al material.

     Los ejercicios de generador NO se guardan a propósito: sus
     enunciados se fabrican con números distintos en cada carga, así
     que una respuesta vieja no corresponde al ejercicio de ahora. */

  function claveActividad(sesionId, actividadId) {
    return `${sesionId || '?'}::${actividadId || '?'}`;
  }

  function guardarRespuestas(sesionId, actividadId, valor) {
    const datos = leer(CLAVE_RESPUESTAS, {});
    datos[claveActividad(sesionId, actividadId)] = { v: valor, t: ahora() };
    escribir(CLAVE_RESPUESTAS, podar(datos, TOPE_RESPUESTAS, v => (v && v.t) || 0));
  }

  function leerRespuestas(sesionId, actividadId) {
    const guardado = leer(CLAVE_RESPUESTAS, {})[claveActividad(sesionId, actividadId)];
    return guardado ? guardado.v : null;
  }

  function olvidarRespuestas(sesionId, actividadId) {
    const datos = leer(CLAVE_RESPUESTAS, {});
    const clave = claveActividad(sesionId, actividadId);
    if (!(clave in datos)) return;
    delete datos[clave];
    escribir(CLAVE_RESPUESTAS, datos);
  }

  window.progreso = {
    visitadas,
    estaVisitada,
    marcarVisitada,
    guardarLectura,
    leerLectura,
    olvidarLectura,
    guardarRespuestas,
    leerRespuestas,
    olvidarRespuestas,
  };
})();
