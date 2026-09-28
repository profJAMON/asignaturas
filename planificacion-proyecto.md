# Proyecto intermodular · 2º Grado Básico Informática de Oficina · Curso 2026-27

**Planificación · versión 3.1 (28/09/2026)** · Cambios: grupos formados, estado real de los materiales y S20 con 5 grupos. El estado de la web y los pendientes están en `asignatura-proyecto.md`.

## 1. Datos de partida

| | |
|---|---|
| Grupo | El mismo que Instalaciones 2n · 9 alumnos · sin experiencia en programación |
| Horario | Jueves de 15:55 a 17:45 (una sesión de 2 h) · del 24/09/2026 al 25/02/2027 |
| Sesiones | **21 jueves** (ningún festivo cae en jueves; Navidad del 23/12 al 6/01) ≈ 40 h |
| Aula | VS Code + Live Server, Chrome |
| Tecnologías | HTML, CSS y JavaScript básico. **Arduino queda para el curso que viene**, cuando tengan base |
| Producto final | Web por parejas sobre un tema libre, con requisitos mínimos, publicada con alias |
| Agrupación | **Parejas** para la web y los retos (formados en la S1: 4 parejas y 1 alumno solo, que ya sabe HTML y CSS). **Prueba y presentación individuales** |
| Guardado y publicación | GitHub (subir archivos desde la web, **sin enseñar Git**) + Cloudflare Pages en tu cuenta gratuita (las webs se borran al acabar el curso) |
| Materiales | Tercera asignatura de la web de clase (`?a=proyecto`, id de sesiones con el prefijo `proy-`) |

**Reparto: 16 sesiones con contenido y 5 de colchón.**

---

## 2. Cómo es una sesión de 2 h

Cada sesión tiene una parte **fija y corta** y otra **elástica**, que absorbe los retrasos.

| Momento | Duración | Qué se hace |
|---|---|---|
| Arranque | 10 min | Qué toca hoy. Demo corta en el proyector |
| **Reto del día** | 40-60 min | Explicación breve y un reto guiado, igual para todos, que **se hace ya dentro de su web** |
| **Mi web** | 40-60 min | Lo aplican a su tema y amplían. Esta parte es la que se estira o se encoge |
| Cierre | 10 min | **Subir los archivos a GitHub** y marcar la checklist de "hoy he añadido…" |

- **Trabajo en pareja con un solo ordenador:** uno escribe y el otro dicta y revisa. **Se turnan cada 20-30 min** (lo marcas tú en voz alta o con un temporizador en el proyector).
- **Solo uno de los dos sube a GitHub** al final de la sesión, y se alternan cada semana. Si suben los dos desde ordenadores distintos, uno sobrescribe el trabajo del otro.
- La pareja que va atrasada dedica la sesión al reto. La que va adelantada mejora su web. No hay retos opcionales.
- Como los retos cuentan en la nota del proyecto, **cada reto deja algo visible en su web**, y así puedes comprobar que está hecho.
- Subir a GitHub al final de cada sesión es la copia de seguridad. Si el ordenador se actualiza, se rompe o lo formatean, cualquiera de los dos puede descargar el zip del repositorio y seguir desde otro equipo.

---

## 3. Calendario sesión a sesión

### Bloque 0 · Arranque y copia de seguridad (S1-S2)

| S | Fecha | Contenido | Reto / en su web |
|---|---|---|---|
| 1 | 24/09 | Qué vamos a hacer este curso · VS Code, Live Server, carpeta del proyecto · qué es una web · privacidad y alias | **Formar parejas.** **Ficha en papel:** nuestro tema, nuestros alias y 3 páginas que tendrá la web. `index.html` con título y un párrafo |
| 2 | 01/10 | **Crear la cuenta de GitHub** (cada alumno la suya, usuario con alias y correo del instituto) · un repositorio por pareja, con el compañero como colaborador · subir archivos arrastrándolos · recuperar los archivos (descargar el zip) · quién sube cada semana · estructura HTML, títulos y párrafos | Reto: portada con texto sobre su tema, **subida a GitHub** |

### Bloque 1 · HTML (S3-S7)

| S | Fecha | Contenido | Reto / en su web |
|---|---|---|---|
| 3 | 08/10 | Imágenes: `alt`, carpeta `img`, rutas · de dónde saco imágenes que se pueden usar | Reto: 3 imágenes de su tema con ruta correcta |
| 4 | 15/10 | Enlaces externos y entre páginas propias · menú | Reto: sus 3 páginas enlazadas con el mismo menú |
| 5 | 22/10 | Listas y tablas | Reto: una lista y una tabla sobre su tema |
| 6 | 29/10 | Formularios (solo HTML: `label`, `input`, `select`, `button`) | Reto: un formulario relacionado con su tema (en JS lo harán funcionar) |
| 7 | 05/11 | **Conectar con Cloudflare Pages:** la web queda publicada y se actualiza sola cada vez que suben a GitHub · **qué recorrido hace la web**: ordenador → GitHub → Cloudflare → DNS → navegador · **Colchón 1** | Reto: web publicada con dirección propia + primer borrador de la página **"Cómo llega mi web a tu pantalla"**. Revisión HTML con la checklist |

### Bloque 2 · CSS (S8-S11)

| S | Fecha | Contenido | Reto / en su web |
|---|---|---|---|
| 8 | 12/11 | CSS externo, colores, fuentes, selectores de etiqueta y de clase | Reto: un único `estilos.css` para las 3 páginas |
| 9 | 19/11 | Modelo de caja: `margin`, `padding`, `border`, fondo | Reto: secciones con aspecto de tarjeta |
| 10 | 26/11 | Flexbox: menú en fila y tarjetas en fila | Reto: menú horizontal y tarjetas maquetadas |
| 11 | 03/12 | **Colchón 2 · Hito 1:** revisión de la web de cada pareja (HTML + CSS) con la checklist | Poner al día lo que falte |

### Bloque 3 · JavaScript básico (S12-S17)

Criterio: **pocas instrucciones, siempre las mismas y siempre dentro de su web**. Solo `querySelector`, `addEventListener('click')`, `textContent`, `value`, variables, `if/else`, `classList.toggle` y un bucle `for` sencillo.

| S | Fecha | Contenido | Reto / en su web |
|---|---|---|---|
| 12 | 10/12 | Qué es JS · archivo `script.js` · consola, `console.log`, variables | Reto: calcular en la consola un precio con IVA o un total de su tema |
| 13 | 17/12 | Un botón que hace algo: `querySelector` + `addEventListener` + `textContent` | Reto: botón "mostrar dato curioso" en su web |
| — | *Navidad* | | |
| 14 | 07/01 | **Repaso de lo que se ha olvidado en vacaciones (30 min)** · leer lo que escribe el usuario (`value`) | Reto: su formulario muestra un mensaje con lo que ha escrito el usuario |
| 15 | 14/01 | Decisiones: `if / else` | Reto: mini test o calculadora de su tema con un resultado distinto según la respuesta |
| 16 | 21/01 | Cambiar estilos desde JS: `classList.toggle` | Reto: modo oscuro o mostrar/ocultar una sección |
| 17 | 28/01 | Repetir: bucle `for` sencillo | Reto: generar una lista o una tabla con un bucle |

### Bloque 4 · Cierre (S18-S21)

| S | Fecha | Contenido |
|---|---|---|
| 18 | 04/02 | **Colchón 3** · páginas "Sobre esta web" y "Cómo llega mi web a tu pantalla" terminadas · checklist final de requisitos |
| 19 | 11/02 | **Prueba individual** (primera hora; cada miembro de la pareja sobre una copia de la web en su propio ordenador) · segunda hora: preparar la presentación |
| 20 | 18/02 | **Presentaciones** (5 grupos: 4 parejas y 1 alumno solo, 15-20 min cada uno; preguntas individuales) · entrega final (último envío a GitHub) |
| 21 | 25/02 | **Colchón 4** · recuperación de la prueba o de la presentación de quien lo necesite · cierre |

---

## 4. Requisitos mínimos de la web

Tema libre (elegido por la pareja), pero la web tiene que tener:

1. **Al menos 3 páginas** enlazadas con el mismo menú.
2. Imágenes con `alt` y guardadas en la carpeta `img`.
3. Al menos **una lista y una tabla**.
4. **Un formulario** que funcione con JavaScript.
5. **Un único `estilos.css`** para todas las páginas, con el menú hecho con Flexbox.
6. **Al menos 2 funcionalidades con JavaScript** (test, calculadora, modo oscuro, mostrar/ocultar, lista generada…).
7. Página **"Sobre esta web"**: alias, qué han aprendido y fuentes de las imágenes. **Sin datos personales.**
8. **Guardada en GitHub y publicada con Cloudflare.**
9. **Página "Cómo llega mi web a tu pantalla"** (parte intermodular, relacionada con Instalaciones). Es igual para todas las parejas, sea cual sea el tema: explica con sus palabras y un esquema el recorrido ordenador → GitHub → Cloudflare (servidor) → DNS → navegador.

**Temas que suelen funcionar:** un videojuego, un equipo o deporte, un grupo de música, recetas, mascotas, coches o motos, una serie o un anime, una tienda inventada.

---

## 5. Evaluación

| Parte | Peso | Quién | Qué se evalúa |
|---|---|---|---|
| **Retos** | 30 % | Pareja | Que cada reto esté **hecho, bien y a tiempo**. Solo se comprueba en las revisiones (S11 y S18), en la propia web y en GitHub, que guarda la fecha de cada subida. Lo que no esté hecho entonces cuenta como 0. Las faltas se tratan como en Instalaciones |
| **Web final** | 20 % | Pareja | **Resultado final** con la rúbrica de los 9 requisitos y la calidad del código (orden, sangrado, nombres de clases con sentido) |
| **Prueba** | 30 % | **Individual** | 1 h, sin Internet, **sobre la web de su pareja**: una tarjeta con 4-5 cambios (añadir una fila a la tabla, cambiar el color del menú, que un botón muestre otro texto, añadir una condición…) |
| **Presentación** | 20 % | **Individual** | **No se evalúa la expresión oral**, sino los conocimientos: enseñan la web y **cada miembro** responde 2-3 preguntas distintas sobre el código ("¿qué pasa si borro esta línea?", "¿dónde cambiarías el color del menú?") y sobre la página "Cómo llega mi web a tu pantalla" |

**Equilibrio:** el 50 % es trabajo de pareja y el otro 50 % es individual. Quien se deja arrastrar por su compañero no puede aprobar solo con la web.

---

## 6. GitHub y Cloudflare: cómo montarlo

- **GitHub:** una cuenta por alumno (usuario con alias y correo del instituto) y **un repositorio por pareja**, con los dos miembros dentro. Tú creas el repositorio en la organización de la clase e invitas a los dos (pasos en `guia-profesor-github.md`). En la sesión 2 aprenden solo a **aceptar la invitación, subir archivos arrastrándolos y descargar el zip** para recuperar su trabajo. Sin comandos de Git.
- **Cloudflare:** su política de privacidad dice que sus servicios no están pensados para menores de 18 años. Por eso las webs se publican desde **tu cuenta gratuita** y los alumnos no necesitan cuenta. Al acabar el curso las borras. Si alguien quiere conservar su web, se queda con el repositorio de GitHub.
  - Con una **organización de GitHub de la clase** y los repositorios de pareja dentro, conectas Cloudflare una sola vez a la organización.
  - El alumnado sigue haciendo lo mismo: subir sus archivos. La web se publica sola.
- Publicar con alias: ni el usuario de GitHub, ni el nombre del repositorio, ni la dirección de la web llevan el nombre real.

---

## 7. Materiales para la web de clase

**Sesiones propias de Proyecto, cortas**: explicación breve, un reto guiado (con pistas escalonadas y comprobaciones observables) y un apartado "Aplícalo en tu web". **No se copian las sesiones de la Unidad 1 de Operaciones**: están pensadas para 5 h semanales, con varios ejercicios y 3 retos por sesión, y para otro proyecto (la web personal con resúmenes). En los puntos concretos, un enlace "Para saber más" lleva a la sección correspondiente de Operaciones (Flexbox, selectores, glosario).

Lista de materiales:

- ✅ 16 sesiones con contenido + páginas de colchón (checklist) — publicadas.
- ✅ Página "Cómo se evalúa" con los requisitos y los pesos — publicada. **Falta la rúbrica con niveles.**
- ✅ Esquema de referencia para la página "Cómo llega mi web a tu pantalla" — en la S7.
- ✅ Guía de GitHub (crear cuenta, repositorio, subir y descargar) — en la S2, **sin capturas**.
- ✅ Guía de publicación con Cloudflare, desde el lado del alumno — en la S7.
- Ficha en papel para elegir el tema: la S1 la describe, pero falta la versión imprimible.
- Tarjetas de la prueba y banco de preguntas individuales para la presentación (pendiente: preguntar si van en la web o solo en papel).

---

## 8. Pendiente de confirmar

Todo lo esencial está decidido. Queda por hacer:

1. ✅ Organización de GitHub creada (28/09/2026). Falta comprobar la conexión con Cloudflare con un repositorio de prueba antes de la S7.
2. ✅ Grupos formados en la S1: 4 parejas y 1 alumno solo.
