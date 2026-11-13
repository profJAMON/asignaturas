# Especificación de la app de entreno

App web instalable (PWA) para el iPhone de Carles. Uso personal, en castellano, modo oscuro.
Los datos viven solo en el móvil (IndexedDB); no hay servidor ni cuentas.

## Decisiones generales

- **Web instalable**: se abre en Safari y se añade a la pantalla de inicio. Sin App Store.
- **Alojamiento**: repositorio privado en GitHub publicado con Cloudflare Pages.
- **Código**: HTML, CSS y JavaScript sin frameworks ni dependencias, comentado en castellano.
- **Datos**: solo en el iPhone. Copia de seguridad manual (JSON) con aviso semanal y exportación a CSV.
  La sincronización automática se decidirá más adelante.
- **Unidades**: siempre kilos.

## Modelo de datos

- **Músculo**: lista fija (pecho, dorsales, espalda alta/trapecio, lumbar, hombro anterior,
  lateral y posterior, bíceps, tríceps, antebrazo, abdominales, cuádriceps, glúteos,
  isquiotibiales, aductores, gemelos).
- **Patrón (tipo de ejercicio)**: nombre y músculos con peso: 1 principal, 0,5 secundario,
  0,25 implicación menor. Ejemplo: press de pecho = pecho 1, tríceps 0,5, hombro anterior 0,5.
  La hakka no cuenta femoral.
- **Variante (máquina)**: patrón, nombre, tipo de carga (pila de placas, discos por lado,
  discos en total, mancuernas por mano, polea, peso corporal, sin especificar), sumador (kg),
  unilateral, rango de reps, incremento, nota, archivada, peso de referencia (con "por confirmar", ??).
  `cargaAntes` guarda la carga que tenía antes de marcar «Por lado», para volver a ella al desmarcarlo.
  **El historial y la progresión van siempre por variante.**
- **Lugar**: Megasport (por defecto, donde entrena casi siempre) o Gym Valhalla (el rack de casa de Xisco).
  Cada máquina y cada plantilla tienen `lugar`; las antiguas sin lugar son de Megasport. El lugar de un entreno
  no se guarda: es el de la mayoría de sus máquinas con series (o el de su plantilla si aún no tiene series).
- **Plantilla**: lugar y lista de huecos. Cada hueco: nombre, máquina por defecto, alternativas,
  número de series, calentamiento, opcional.
- **Entreno (sesión)**: fecha, hora de inicio y fin, plantilla de origen, nota y ejercicios.
  Cada ejercicio: máquina, opciones, objetivo de series, molestia (0 nada, 1 leve, 2 fuerte),
  calentamientos (marcas de tiempo) y series `{ peso, mas, reps, extra, hora }`.
  - `mas`: sumador usado (se muestra "100 + 2,5").
  - `extra`: **drop set** de esa serie (uno como máximo; 95 × 5 + 90 × 3). No suma series al volumen;
    para récords y progresión se usa la parte principal.
- **Actividad**: escalada, senderismo, pádel, kickboxing u otra; fecha, minutos y nota.
  Solo cuentan en el calendario, nunca en el mapa muscular.
- **Marcas en peso libre**: en los ajustes (`marcasLibres`), cada una con ejercicio estándar, kilos,
  reps, fecha y nota. Así entran en la copia de seguridad sin cambiar la base de datos.

## Reglas

- Las series se proponen con lo que se hizo la última vez en esa misma serie y máquina.
- Calentamiento: solo se marca como hecho (sin peso ni reps).
- **Sumador**: botón «+ 2,5» debajo de los kilos de cada serie y de cada drop, en todas las máquinas (también peso libre).
  Vale lo que diga la ficha de la máquina o, si está vacía, 2,5. Encendido en bronce; se guarda en `mas`.
  Al encenderlo o apagarlo en una serie, las series por hacer de debajo toman lo mismo, y al marcar una serie las
  siguientes heredan su sumador. En un drop solo cambia ese drop. Récords, RM y rangos cuentan peso + sumador.
- Descanso: 3 min entre series, 1 min entre calentamientos (ajustable). El cronómetro se calcula
  desde la hora de la última serie. iOS no deja avisar con la pantalla bloqueada: el aviso fiable es el reloj.
- Los entrenos nunca se cierran del todo: "Terminar" solo guarda la hora y se pueden editar siempre.
- **Entreno vacío** (sin series, sin calentamientos y sin nota): no se guarda. Se descarta al salir de él
  (salvo para ir a ver una máquina y volver) o al pulsar «Terminar», y los de días anteriores se borran
  al abrir la app.
- **Borrar un entreno**: desde el calendario, en la hoja del día, deslizándolo a la izquierda y tocando el
  botón rojo «Borrar». También con «Borrar este entreno» dentro del propio entreno.
- Si cambias de máquina con series ya hechas, esas se quedan en la máquina antigua y la nueva se añade debajo.
- **Por lado**: interruptor en cada ejercicio del entreno que se guarda en la máquina. Antes de cambiar,
  una hoja muestra el peso actual y deja elegir «Mantener este peso» o «Nuevo peso». Con un peso nuevo,
  todo el historial de la máquina se multiplica por la misma proporción (redondeado al cuarto de kilo).
  «Cancelar» no cambia nada.
- **Peso total**: en una máquina por lado, el total es el doble. El rango de fuerza se calcula con el total.
  Los rangos por máquina (mejora en %), las mesetas y el volumen no dependen de ello.
- No hay sugerencias automáticas de subir peso. (Fase 2) Aviso de "level up" con **3 semanas y al menos
  3 sesiones** en una variante sin mejorar peso ni reps. Bajar con molestia marcada no cuenta como estancamiento.
- Objetivo: 5 días de gimnasio por semana.

## Lugares

- Máquinas: selector Megasport / Gym Valhalla / Todas (por defecto Megasport). Una máquina nueva nace en el lugar que se está viendo.
- Hoy: primero las plantillas de Megasport; las del Valhalla debajo con su título y sin aviso de atrasada.
- Entreno: al cambiar o añadir máquina salen primero las del lugar del entreno; las del otro lugar, al final.
- Calendario y semana de Hoy: el día en el Valhalla lleva el punto de gimnasio hueco.
- Catálogo del Valhalla (se añade una sola vez con una migración): jalón en polea del rack, dominadas, remo, encogimientos,
  press plano, press inclinado y press francés en Smith, hombro posterior y aperturas en poleas cruzadas, contractora,
  pullover y curl en polea, tríceps unilateral en polea, curl y elevación lateral con mancuernas. Sin pesos de referencia.
  Plantillas «Valhalla · Tirón» y «Valhalla · Empuje».

## Semana tipo

- Domingo: empuje o tirón (con Chisco, alternando).
- Martes: el que no se hizo el domingo.
- Miércoles: Pierna B (glúteo y femoral), más ligera, por si hay kickboxing después.
- Jueves: Torso.
- Sábado: Pierna A (hakka).
- Lunes y viernes: descanso.

La app no impone días: en Hoy muestra cuánto hace de cada plantilla.

## Plantillas iniciales

- **Tirón**: calentamiento en jalón; jalón agarre amplio; dorsal PANATTA (alt. Hammer MTS front pulldown);
  hombro posterior PANATTA (alt. máquina, 55??); encogimientos multipower 55/lado sin barra (alt. trapecio PANATTA);
  remo T con apoyo 75 en total; curl martillo 20 (alt. predicador PANATTA 22,5, curl inclinado 16); abdominales.
- **Empuje**: calentamiento en press inclinado; press inclinado máquina 40/lado; apertura PANATTA 25/lado
  (alt. sentado 68); elevación lateral PANATTA 15–20/lado (alt. placas 60 total, discos 30/lado);
  press militar PANATTA 40/lado; press sentado Hammer 45; tríceps: francés máquina 35 (alt. francés PANATTA 20??,
  fondos PANATTA 60/lado, unilateral polea 30); abdominales.
- **Pierna A**: calentamiento en femoral; femoral sentado 77; aductor 77; hakka 65 (solo discos);
  hip thrust Glute Builder 40/lado; extensión unilateral 45; gemelo sentado 95 (10–15 reps); abdominales.
- **Pierna B**: calentamiento en curl arrodillado; curl femoral arrodillado MTS 40??; hip thrust;
  prensa pies altos 90/lado??; extensión unilateral; aductor; gemelo; abdominales. Sin bisagra de cadera
  por la espalda baja.
- **Torso**: calentamiento en back extension; back extension 45??; press inclinado; aperturas; remo T;
  jalón; pullover 60??; abdominales.

Abdominales: 2 series opcionales al final de todas (máquina de placas 62–68, 10–12 reps).

## Fases

1. **Fase 1 (hecha)**: plantillas editables, entreno con alternativas, series con sumador y extra,
   molestia, historial por máquina, calendario con actividades y recuento semanal,
   cronómetro, copia de seguridad JSON, CSV, funcionamiento sin conexión.
2. **Fase 2 (hecha)**: tabla de series (serie, previa, kg, reps, ✓), tiempo de entreno, racha semanal
   (semanas seguidas con el mínimo de 3 días), gráfica por máquina (peso de la mejor serie y RM estimado),
   recorrido de pesos ("40 kg 3 semanas → 42,5 kg…"), rangos por máquina según la mejora del RM estimado
   (Bronce… Élite; **sustituidos en la fase 5** por los 9 rangos de fuerza), rango general,
   aviso "prueba a subir", pestaña Cuerpo con volumen semanal por músculo (series, indirectas ponderadas)
   y mapa del cuerpo coloreado respecto al objetivo editable de cada músculo.
3. **Fase 3 (hecha salvo la sincronización)**: perfil (sexo, año de nacimiento, altura), peso y composición
   corporal con gráfica, rango de fuerza orientativo en peso libre (RM estimado / peso corporal) para las
   máquinas con estándar asignado y para las **marcas en peso libre** apuntadas a mano en Cuerpo.
   Pendiente: sincronización automática.
4. **Calculadora de rango** (Cuerpo): rango de fuerza de cualquier persona (sexo, edad, peso corporal, kg × reps) frente a la
   población, sin guardar nada. Estándares de peso libre y, marcados como muy orientativos, de jalón, press de pecho en máquina
   y curl y tríceps en polea. A partir de los 40 años se exige un 1 % menos por año (1,5 % desde los 60).
   Dominadas: el RM sale de (peso corporal + lastre) con las reps, también en las marcas y máquinas con ese estándar.

### Objetivos de series semanales por defecto

Pierna en prioridad: cuádriceps y glúteos 12–20, isquios 10–16, aductores y gemelos 6–12.
Mantenimiento: pecho, dorsales, hombro lateral y posterior, bíceps y tríceps 6–12; hombro anterior y trapecio 4–10;
abdominales 4–10; lumbar 2–8; antebrazo 0–8. Todos editables tocando el músculo.

## Fase 5: rangos de fuerza en 9 niveles, drops y borrar deslizando (hecha, 10 de noviembre de 2026)

- **Rangos de fuerza en 9 niveles**, frente a la población (RM estimado / peso corporal, ajustado por sexo y edad):
  Mortal, Hoplita, Espartano, Matagorgonas, Héroe, Semidiós, Titán, Ares, Señor del Olimpo.
  Insignias propias en `insignias.html` del proyecto (Héroe = maza de Hércules; Semidiós = casco mitad mortal,
  mitad dios; Titán = puño con grillete y cadena rota). Nada de God of War ni de ningún juego.
  Colores en escalera: hierro, bronce, plata, oro, rojo, verde, azul, morado, blanco dorado; siempre con el nombre al lado.
- **Barra de experiencia** bajo cada insignia: «30 % hacia Semidiós · te faltan 4,5 kg de RM».
  Sustituye al rango por mejora en % (Bronce → Élite), que desaparece. Máquinas sin estándar: solo «+X % desde que empezaste».
- **Cuerpo**: selector Fuerza / Semana encima del mapa, con Fuerza por defecto. En Fuerza, cada músculo toma el mejor
  rango de sus ejercicios; sin datos, gris. Rango global encima (media de los músculos). La calculadora también pasa a 9 rangos.
- **Estándares** (`ESTANDARES` en `js/cuerpo.js`): 5 niveles de población por ejercicio (principiante, novato, intermedio,
  avanzado, élite) de las tablas públicas de Strength Level, como múltiplos del peso corporal. Los 8 cortes salen de ahí
  (Hoplita = principiante, Espartano = punto medio, Matagorgonas = novato, Héroe = medio, Semidiós = intermedio,
  Titán = medio, Ares = avanzado, Señor del Olimpo = élite). Ajuste por sexo y por edad (desde los 40). En máquinas por lado
  el total es el doble y en las unilaterales también se dobla. Las máquinas del catálogo reciben su estándar
  (`ESTANDAR_CATALOGO`) con una migración que se hace una sola vez; las poleas del Valhalla, el pullover y el francés en
  Smith se quedan sin estándar.
- **Borrar series deslizando** a la izquierda (series hechas, drops y filas vacías), con botón rojo «Borrar» y
  **siempre** hoja de confirmación. Borrar una fila baja el objetivo en uno.
- **Drop set** (el actual `extra`, sin cambiar los datos): uno como máximo por serie. Sub-fila debajo de la serie,
  metida a la derecha y más pequeña, marcada «I ↓». Botón «+ Drop» en la fila al marcarla con ✓, con un escalón menos
  de peso propuesto. No suma series al volumen; récords y progresión usan solo la serie principal. El cronómetro de
  descanso arranca al apuntar el drop.
