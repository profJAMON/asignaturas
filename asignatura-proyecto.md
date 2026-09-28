# Proyecto Intermodular · contexto de la asignatura

Actualizado: 28/09/2026 (revisión de la web y grupos formados). Sustituye a la memoria del antiguo proyecto "Proyecto" de Claude y a `estado-sesiones-proyecto.md` (ya incluido aquí). Documentos relacionados: `planificacion-proyecto.md` (calendario sesión a sesión, requisitos de la web y evaluación, versión 3 del 15/09/2026) y `guia-profesor-github.md` (montaje de la organización y los repositorios de pareja).

## Grupo y horario
- 2º Grado Básico Informática de Oficina: el mismo grupo que Instalaciones 2n. 9 alumnos.
- Jueves de 15:55 a 17:45, una sola sesión de 2 h, del 24/09/2026 al 25/02/2027: 21 sesiones (16 con contenido y 5 de colchón).
- Aula: VS Code + Live Server y Chrome.
- No han programado nunca. Este año no han cursado Operaciones Básicas (con el cambio de plan se repiten asignaturas en 1º y 2º, y cuando la cursen tampoco verán programación).
- No hace falta que cada ejercicio dure la sesión entera: el alumnado se atrasa a menudo.

## Enfoque (decidido)
- La asignatura no tiene una programación cerrada ("cajón desastre"); la única condición es que sea intermodular. Este curso se centra en crear cosas de informática: HTML, CSS y JavaScript básico.
- Arduino (el departamento de Tecnología tiene kits para 5 parejas) queda para el curso que viene, cuando el alumnado llegue con base de programación. Es probable que la planificación cambie ese año.
- Formato: un proyecto final y mini-retos que se van sumando dentro de la propia web.
- Producto final: una web por pareja sobre un tema libre, con 9 requisitos mínimos (ver planificación). Se ha quitado el requisito de una sección relacionada con otro módulo, porque con tema libre no tiene sentido.
- Parte intermodular: una página fija, "Cómo llega mi web a tu pantalla", relacionada con Instalaciones. Es igual para todas las parejas: explica el recorrido ordenador → GitHub → Cloudflare → DNS → navegador.
- Parejas: Carles decide si hay un trío o si alguien con conocimientos previos trabaja solo. No le gustan los grupos de 3 porque tienden a ser caóticos.
- **Grupos formados (S1):** 4 parejas y 1 alumno que trabaja solo porque ya tiene conocimientos de HTML y CSS. En total, 5 grupos y 5 repositorios. Para él no aplican los turnos ni la alternancia al subir, y la prueba la hace sobre su propia web.
- Programación en pareja con un solo ordenador: se turnan cada 20-30 min. Solo uno sube a GitHub al final de la sesión, y se alternan por semanas. Los dos son colaboradores del repositorio.
- GitHub y Cloudflare: no se explica Git. Carles crea en una organización de GitHub un repositorio por pareja e invita a los dos. El alumnado solo crea su cuenta, acepta la invitación y sube archivos, que les sirve de copia de seguridad. Carles conecta Cloudflare desde su cuenta gratuita; las webs se borran al acabar el curso. Todo se publica con alias y sin datos personales.
- Web de ejemplo en las explicaciones: **Pixel Kart**, un videojuego de karts inventado, que crece sesión a sesión. Tiene las páginas index, personajes, circuitos y torneo; el formulario de torneo usa los ids alias, edad, piloto, boton-inscribir y mensaje.
- La Unidad 1 de Operaciones no se copia, porque está pensada para 5 h semanales y otro proyecto. Solo se enlaza con "Para saber más" en puntos concretos.

## Evaluación (decidido)
- Retos 30 % (pareja): cuenta que estén hechos, bien y a tiempo. Solo se comprueban en las revisiones (sesiones 11 y 18); lo que no esté hecho entonces cuenta como 0. Las faltas se tratan como en Instalaciones.
- Web final 20 % (pareja): el resultado final con rúbrica.
- Prueba 30 % (individual): 1 h, sin Internet, con cambios sobre la web de su pareja.
- Presentación 20 % (individual): no se evalúa la expresión oral sino los conocimientos informáticos. Cada miembro responde preguntas distintas sobre el código y sobre la página "Cómo llega mi web a tu pantalla".

## Estado en la web
Las 21 sesiones y "Cómo se evalúa" están publicadas (subidas el 15/09/2026). Revisado en main el 28/09/2026 (commit f552d25):
- "Cómo se evalúa" tiene la tabla de pesos, las revisiones S11/S18, la prueba, la presentación, los 9 requisitos, cómo se trabaja en pareja y las faltas. **No tiene rúbrica con niveles.**
- Esquema de referencia de "Cómo llega mi web a tu pantalla": está en la S7 (diagrama publicar/visitar con los 5 pasos).
- Guía de Cloudflare para el alumno: cubierta por la S7 (cómo funciona, dirección .pages.dev, aviso de privacidad y tabla de problemas).
- Guía de GitHub: cubierta por la S2, pero sin capturas (no hay imágenes de Proyecto en la web).
- Ficha en papel del tema: la S1 la describe y pone el ejemplo de Pixel Kart, pero la ficha imprimible no existe. Es la tercera asignatura de la web (`?a=proyecto`).
- `js/asignaturas.js`: entrada `proyecto` (base `data/proyecto`, curso `data/curso-proyecto.json`).
- Estructura (unidad → sesiones):
  - proy-antes-de-empezar: proy-como-se-evalua
  - proy-arranque: proy-s01-arranque, proy-s02-github-textos
  - proy-html: proy-s03-imagenes, proy-s04-enlaces-menu, proy-s05-listas-tablas, proy-s06-formularios, proy-s07-publicar
  - proy-css: proy-s08-css, proy-s09-caja, proy-s10-flexbox, proy-s11-revision-1
  - proy-javascript: proy-s12-js-variables, proy-s13-botones, proy-s14-leer-formulario, proy-s15-if-else, proy-s16-classlist, proy-s17-bucles
  - proy-cierre: proy-s18-revision-final, proy-s19-prueba, proy-s20-presentaciones, proy-s21-cierre
- Formato de cada sesión de contenido: explicación breve → "Antes de seguir" (con la respuesta en un details) → "Reto de hoy" (checklist, pistas escalonadas y sin soluciones) → "Aplícalo en tu web" → "Antes de irte" (sube a GitHub el miembro al que le toca) → autoevaluación (quiz o relacionar).
- Voz: primera persona del profesor, dirigida a la pareja ("vosotros").
- En la web de ejemplo hay un archivo JS por página, con el mismo nombre que la página. Así se evitan errores de null en las páginas que no tienen el elemento.

## Avisos y pendientes
- **Resaltado JS (28/09/2026):** la subida de `css/estilos.css` del 16/09/2026 (commit 0755ea8) había borrado `--code-keyword`, `--code-function` y `--code-number` y las reglas `.leccion pre .kw / .fn / .nu`, que usan las sesiones 12-17. Restaurado el 28/09/2026 sobre main f552d25 (valores #0000ff, #795e26 y #098658 en los dos temas, con un comentario de "no borrar"). Pendiente: que Carles suba el archivo y que se apunte en `guia-web.md` (tabla de convenciones: `.kw`, `.fn`, `.nu` junto a `.et`, `.at`, `.ca`, `.co`; y que `.checklist` ya pinta el ☐).
- Pendiente (aún no pedido): tarjetas de la prueba, banco de preguntas de la presentación, rúbrica de la web y, si se quiere, la ficha imprimible del tema y capturas para la S2. Antes de hacerlas, hay que preguntar a Carles si van en la web o solo en papel: la prueba se hace sobre su propia web y no conviene que la conozcan antes.
- Organización de GitHub creada el 28/09/2026. Pendiente de Carles: invitar a cada alumno a su repositorio en la S2 (rol Write) y, antes de la S7 (05/11), probar la conexión con Cloudflare con un repositorio de prueba.
- Si algo no está claro, preguntar antes de generar nada, para evitar correcciones.
