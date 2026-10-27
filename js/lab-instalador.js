/* ============================================================
   Laboratorios de la instalación de un sistema operativo
   (26/10/2026, Operaciones U5 S3)
   ============================================================
   Va en tema.html DESPUÉS de js/laboratorios.js, que define
   registrarLab y las ayudas window.LAB (el, boton, cabecera).

     <div class="lab" data-lab="instalador" aria-label="…"></div>
     <div class="lab" data-lab="averias-instalacion" aria-label="…"></div>

   instalador  Un simulador: crear una máquina virtual en VirtualBox
               (nombre, RAM en MB, procesadores, disco), meterle la ISO
               de Linux Mint, arrancar, instalar (idioma, teclado,
               «Borrar disco e instalar», usuario y contraseña), quitar
               la ISO, entrar y hacer la post-instalación. Las pantallas
               imitan las de verdad, sin capturas. Las decisiones tienen
               consecuencias (poca RAM: se para; sin ISO: no arranca;
               ISO puesta al reiniciar: vuelve el instalador; disco
               pequeño: no cabe). A la derecha, «Lo que has hecho»: la
               lista de pasos que sirve para el manual de instalación.
               No instala nada ni ocupa espacio en el ordenador.
   averias-instalacion  «¿Qué ha fallado?»: un síntoma y cuatro
               causas; al acertar, la explicación.

   Los textos de las pantallas en inglés (arranque) van con
   translate="no"; todo lo demás se traduce.
   ============================================================ */

(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof window.registrarLab !== 'function') return;
  const { el, boton, cabecera } = window.LAB;

  const RAM_PC = 8192, CPU_PC = 4;
  const ISO = 'linuxmint-22-xfce-64bit.iso';
  const lento = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function campo(etiqueta, control, ayuda) {
    const l = el('label', 'inst__campo');
    l.appendChild(el('span', 'inst__etiqueta', etiqueta));
    l.appendChild(control);
    if (ayuda) l.appendChild(el('span', 'inst__ayuda', ayuda));
    return l;
  }
  function texto(valor, noTraducir) {
    const i = el('input', 'lab__entrada');
    i.type = 'text';
    i.spellcheck = false;
    i.autocomplete = 'off';
    i.value = valor || '';
    if (noTraducir) i.setAttribute('translate', 'no');
    return i;
  }
  function lista(opciones, valor) {
    const s = el('select', 'lab__entrada');
    opciones.forEach(o => {
      const op = el('option', null, o);
      op.value = o;
      if (o === valor) op.selected = true;
      s.appendChild(op);
    });
    return s;
  }
  function deslizador(min, max, paso, valor) {
    const r = el('input', 'inst__deslizador');
    r.type = 'range';
    r.min = min; r.max = max; r.step = paso; r.value = valor;
    return r;
  }
  function eleccion(nombre, opciones, valor) {
    const f = el('fieldset', 'inst__eleccion');
    const radios = opciones.map(o => {
      const l = el('label', 'lab__casilla');
      const r = el('input');
      r.type = 'radio';
      r.name = nombre;
      r.value = o;
      if (o === valor) r.checked = true;
      l.appendChild(r);
      l.appendChild(document.createTextNode(' ' + o));
      f.appendChild(l);
      return r;
    });
    f.valor = () => (radios.find(r => r.checked) || {}).value;
    return f;
  }
  function negra(lineas) {
    const p = el('pre', 'inst__negra');
    p.setAttribute('translate', 'no');
    p.textContent = lineas;
    return p;
  }

  /* ============================================================
     Simulador del instalador
     ============================================================ */
  function labInstalador(caja) {
    cabecera(caja);
    caja.appendChild(el('p', 'lab__nota', 'Un simulador: no instala nada de verdad ni ocupa espacio. Tu PC de mentira tiene 8 GB de RAM (8192 MB) y 4 núcleos, como los del aula.'));

    const cuerpo = el('div', 'inst');
    const ventana = el('div', 'inst__ventana');
    const barra = el('div', 'inst__barra');
    const tituloVentana = el('span');
    barra.appendChild(tituloVentana);
    ventana.appendChild(barra);
    const pantalla = el('div', 'inst__pantalla');
    ventana.appendChild(pantalla);
    cuerpo.appendChild(ventana);

    const registro = el('div', 'inst__registro');
    registro.tabIndex = 0;
    registro.setAttribute('role', 'region');
    registro.setAttribute('aria-label', 'Lo que has hecho');
    registro.appendChild(el('p', 'inst__registro-titulo', 'Lo que has hecho'));
    registro.appendChild(el('p', 'inst__ayuda', 'Te servirá para el manual de instalación.'));
    const hechos = el('ol', 'inst__lista');
    hechos.setAttribute('aria-live', 'polite');
    registro.appendChild(hechos);
    cuerpo.appendChild(registro);
    caja.appendChild(cuerpo);

    const pie = el('div', 'lab__fila');
    const bOtra = boton('↺ Empezar otra vez');
    pie.appendChild(bOtra);
    caja.appendChild(pie);

    let s, reloj = null, primera = true;

    function nuevo() {
      s = {
        paso: 'inicio', creada: false, nombre: '', tipo: 'Linux', version: 'Ubuntu (64-bit)',
        ram: 2048, cpu: 1, disco: 25, iso: false, idioma: 'Español', teclado: 'Español',
        codecs: true, zona: 'Madrid', alias: '', equipo: '', usuario: '', clave: '',
        instalado: false, post: { act: false, ctrl: false, inst: false }, averias: []
      };
      hechos.innerHTML = '';
    }
    function apunta(t, mal) {
      const li = el('li', mal ? 'inst__mal' : null, t);
      hechos.appendChild(li);
      registro.scrollTop = registro.scrollHeight;
    }
    function averia(t) {
      if (s.averias.indexOf(t) === -1) s.averias.push(t);
    }
    function ir(paso) {
      s.paso = paso;
      pintar();
    }
    function cabeza(t, ventanaTitulo) {
      tituloVentana.textContent = ventanaTitulo || 'Oracle VirtualBox';
      const h = el('p', 'inst__h', t);
      h.tabIndex = -1;
      pantalla.appendChild(h);
      return h;
    }
    function aviso(t, tipo) {
      const p = el('p', 'inst__aviso' + (tipo ? ' inst__aviso--' + tipo : ''), t);
      p.setAttribute('role', tipo === 'ok' ? 'status' : 'alert');
      return p;
    }
    function mandos(...botones) {
      const f = el('div', 'lab__fila inst__mandos');
      botones.forEach(b => f.appendChild(b));
      pantalla.appendChild(f);
      return f;
    }
    function siguiente(t) { return boton(t || 'Siguiente ›', 'lab__boton lab__boton--activo'); }

    function pintar() {
      if (reloj) { clearTimeout(reloj); reloj = null; }
      pantalla.innerHTML = '';
      const h = PANTALLAS[s.paso]();
      if (!primera && h) h.focus({ preventScroll: true });
      primera = false;
    }

    const PANTALLAS = {
      inicio() {
        const h = cabeza('VirtualBox');
        pantalla.appendChild(el('p', null, 'Todavía no tienes ninguna máquina virtual. Pulsa «Nueva» para crear una.'));
        const b = siguiente('Nueva');
        b.addEventListener('click', () => ir('nombre'));
        mandos(b);
        return h;
      },

      nombre() {
        const h = cabeza('Nueva máquina: nombre y sistema operativo');
        const iNombre = texto(s.nombre, true);
        iNombre.placeholder = 'por ejemplo, Mint';
        const sTipo = lista(['Linux', 'Windows', 'macOS'], s.tipo);
        const sVer = lista(['Ubuntu (64-bit)', 'Debian (64-bit)', 'Otro Linux (64-bit)'], s.version);
        pantalla.appendChild(campo('Nombre', iNombre));
        pantalla.appendChild(campo('Tipo', sTipo));
        pantalla.appendChild(campo('Versión', sVer, 'Linux Mint está hecho a partir de Ubuntu.'));
        const msg = el('div');
        pantalla.appendChild(msg);
        const b = siguiente();
        b.addEventListener('click', () => {
          msg.innerHTML = '';
          const n = iNombre.value.trim();
          if (!n) { msg.appendChild(aviso('Ponle un nombre a la máquina: así la distinguirás de las demás.')); iNombre.focus(); return; }
          if (sTipo.value !== 'Linux') { msg.appendChild(aviso('Linux Mint es un Linux: en «Tipo» elige Linux.')); sTipo.focus(); return; }
          s.nombre = n; s.tipo = sTipo.value; s.version = sVer.value;
          apunta(`Nueva máquina: nombre «${n}», tipo Linux, versión ${s.version}.`);
          ir('memoria');
        });
        mandos(b);
        return h;
      },

      memoria() {
        const h = cabeza('Memoria y procesadores');
        const rRam = deslizador(512, RAM_PC, 256, s.ram);
        const oRam = el('output', 'inst__valor');
        const rCpu = deslizador(1, CPU_PC, 1, s.cpu);
        const oCpu = el('output', 'inst__valor');
        pantalla.appendChild(campo('Memoria base (RAM)', rRam));
        pantalla.appendChild(oRam);
        pantalla.appendChild(campo('Procesadores', rCpu));
        pantalla.appendChild(oCpu);
        const msg = el('div');
        msg.setAttribute('aria-live', 'polite');
        pantalla.appendChild(msg);
        function ver() {
          const ram = +rRam.value, cpu = +rCpu.value;
          oRam.textContent = `${ram} MB (${(ram / 1024).toLocaleString('es-ES')} GB) de ${RAM_PC} MB`;
          oCpu.textContent = `${cpu} de ${CPU_PC} núcleos`;
          msg.innerHTML = '';
          if (ram < 2048) msg.appendChild(aviso('Poca memoria: Linux Mint pide 2048 MB.', 'cuidado'));
          if (ram > RAM_PC / 2) msg.appendChild(aviso('Más de la mitad de la RAM: a Windows no le queda bastante.', 'cuidado'));
          if (cpu > CPU_PC / 2) msg.appendChild(aviso('Más de la mitad de los núcleos: el PC irá justo.', 'cuidado'));
        }
        rRam.addEventListener('input', ver);
        rCpu.addEventListener('input', ver);
        ver();
        const b = siguiente();
        b.addEventListener('click', () => {
          s.ram = +rRam.value; s.cpu = +rCpu.value;
          apunta(`Memoria: ${s.ram} MB. Procesadores: ${s.cpu}.`);
          ir('disco');
        });
        mandos(b);
        return h;
      },

      disco() {
        const h = cabeza('Disco duro virtual');
        pantalla.appendChild(el('p', null, 'Se crea un disco duro virtual nuevo: para Windows será un archivo .vdi. Crece a medida que lo llenas, no ocupa todo de golpe.'));
        const r = deslizador(10, 60, 1, s.disco);
        const o = el('output', 'inst__valor');
        pantalla.appendChild(campo('Tamaño del disco', r));
        pantalla.appendChild(o);
        const msg = el('div');
        msg.setAttribute('aria-live', 'polite');
        pantalla.appendChild(msg);
        function ver() {
          o.textContent = `${r.value} GB`;
          msg.innerHTML = '';
          if (+r.value < 20) msg.appendChild(aviso('Linux Mint necesita unos 20 GB.', 'cuidado'));
        }
        r.addEventListener('input', ver);
        ver();
        const b = siguiente();
        b.addEventListener('click', () => {
          s.disco = +r.value;
          apunta(`Disco duro virtual nuevo de ${s.disco} GB.`);
          ir('resumen');
        });
        mandos(b);
        return h;
      },

      resumen() {
        const h = cabeza('Resumen');
        const t = el('table', 'inst__tabla');
        [['Nombre', s.nombre], ['Sistema', `${s.tipo} · ${s.version}`], ['Memoria', `${s.ram} MB`],
          ['Procesadores', String(s.cpu)], ['Disco', `${s.disco} GB`]].forEach(([a, b]) => {
          const tr = el('tr');
          tr.appendChild(el('th', null, a));
          const td = el('td', null, b);
          tr.appendChild(td);
          t.appendChild(tr);
        });
        pantalla.appendChild(t);
        const atras = boton('‹ Cambiar algo');
        atras.addEventListener('click', () => ir('memoria'));
        const b = siguiente('Terminar');
        b.addEventListener('click', () => {
          s.creada = true;
          apunta('Terminar: la máquina aparece apagada en la lista.');
          ir('lista');
        });
        mandos(atras, b);
        return h;
      },

      lista() {
        const h = cabeza('VirtualBox');
        const ficha = el('div', 'inst__ficha');
        ficha.appendChild(el('strong', null, s.nombre));
        ficha.appendChild(el('span', 'inst__ayuda', s.instalado ? 'Apagada · Linux Mint instalado' : 'Apagada'));
        ficha.appendChild(el('span', 'inst__ayuda', 'Lector óptico: ' + (s.iso ? ISO : 'vacío')));
        pantalla.appendChild(ficha);
        const conf = boton('⚙ Configuración');
        conf.addEventListener('click', () => ir('almacen'));
        const ini = siguiente('▶ Iniciar');
        ini.addEventListener('click', () => {
          apunta('Iniciar la máquina.');
          ir(s.instalado && !s.iso ? 'login' : 'arranque');
        });
        mandos(conf, ini);
        return h;
      },

      almacen() {
        const h = cabeza('Configuración → Almacenamiento');
        pantalla.appendChild(el('p', null, 'Aquí están los discos de la máquina: el disco virtual y el lector de DVD virtual.'));
        const estado = el('p', 'inst__ficha', 'Lector óptico: ' + (s.iso ? ISO : 'vacío'));
        estado.setAttribute('translate', 'no');
        pantalla.appendChild(estado);
        const msg = el('div');
        pantalla.appendChild(msg);
        const archivos = el('div', 'lab__fila');
        archivos.hidden = true;
        [[ISO, true], ['Windows7.iso', 'win'], ['fotos-del-viaje.zip', 'zip']].forEach(([n, ok]) => {
          const b = boton('📄 ' + n, 'lab__boton lab__boton--codigo');
          b.setAttribute('translate', 'no');
          b.addEventListener('click', () => {
            msg.innerHTML = '';
            if (ok === true) {
              s.iso = true;
              estado.textContent = 'Lector óptico: ' + ISO;
              archivos.hidden = true;
              msg.appendChild(aviso('Hecho: la ISO está en el lector, como un DVD metido.', 'ok'));
              apunta(`Configuración → Almacenamiento → lector óptico: ${ISO}.`);
            } else if (ok === 'win') {
              msg.appendChild(aviso('Esa es la ISO de Windows 7. Tú vas a instalar Linux Mint.'));
            } else {
              msg.appendChild(aviso('Eso no es una ISO: es un archivo comprimido.'));
            }
          });
          archivos.appendChild(b);
        });
        const elegir = boton('💿 Elegir un archivo de disco…');
        elegir.addEventListener('click', () => { archivos.hidden = false; });
        if (s.iso) {
          const quitar = boton('⏏ Quitar el disco del lector');
          quitar.addEventListener('click', () => {
            s.iso = false;
            estado.textContent = 'Lector óptico: vacío';
            msg.innerHTML = '';
            msg.appendChild(aviso('Lector vacío.', 'ok'));
            apunta('Configuración → Almacenamiento → quitar la ISO del lector.');
          });
          mandos(elegir, quitar);
        } else {
          mandos(elegir);
        }
        pantalla.appendChild(archivos);
        const ok = siguiente('Aceptar');
        ok.addEventListener('click', () => ir('lista'));
        mandos(ok);
        return h;
      },

      arranque() {
        if (!s.iso) {
          const h = cabeza('La máquina no arranca', s.nombre + ' [Corriendo]');
          pantalla.appendChild(negra('FATAL: No bootable medium found! System halted.'));
          pantalla.appendChild(el('p', null, 'Dice: «No he encontrado nada con qué arrancar». El disco virtual está vacío y en el lector no hay ninguna ISO.'));
          apunta('No arranca: «No bootable medium found» (no había ISO en el lector).', true);
          averia('Iniciaste sin ISO: «No bootable medium found».');
          const b = siguiente('Apagar la máquina');
          b.addEventListener('click', () => ir('lista'));
          mandos(b);
          return h;
        }
        const h = cabeza(s.instalado ? '¡Otra vez el instalador!' : 'Ha arrancado desde la ISO', s.nombre + ' [Corriendo]');
        if (s.instalado) {
          pantalla.appendChild(aviso('Linux ya estaba instalado, pero la ISO sigue en el lector y la máquina ha vuelto a arrancar desde ella.'));
        }
        pantalla.appendChild(negra('  Start Linux Mint 22 Xfce 64-bit\n  Start in compatibility mode\n  OEM install (for manufacturers)'));
        const msg = el('div');
        pantalla.appendChild(msg);
        if (s.instalado) {
          const b = siguiente('Apagar, quitar la ISO y volver a iniciar');
          b.addEventListener('click', () => {
            s.iso = false;
            apunta('Apagar, quitar la ISO del lector y volver a iniciar.');
            ir('login');
          });
          mandos(b);
          return h;
        }
        pantalla.appendChild(el('p', null, 'Es el menú de la ISO. Elige la primera opción:'));
        const b1 = boton('Start Linux Mint', 'lab__boton lab__boton--activo');
        b1.setAttribute('translate', 'no');
        b1.addEventListener('click', () => {
          apunta('Menú de la ISO → «Start Linux Mint».');
          ir('live');
        });
        const b2 = boton('OEM install');
        b2.setAttribute('translate', 'no');
        b2.addEventListener('click', () => {
          msg.innerHTML = '';
          msg.appendChild(aviso('Esa opción es para fabricantes de ordenadores. Elige la primera.'));
        });
        mandos(b1, b2);
        return h;
      },

      live() {
        const h = cabeza('Linux Mint, todavía sin instalar', s.nombre + ' [Corriendo]');
        pantalla.appendChild(el('p', null, 'Linux funciona desde la ISO, en la memoria: todavía no está en el disco. Si apagas ahora, se pierde todo. En el escritorio hay un icono para instalarlo.'));
        const esc = el('div', 'inst__escritorio');
        const icono = boton('💿 Install Linux Mint', 'lab__boton lab__boton--activo');
        icono.setAttribute('translate', 'no');
        icono.addEventListener('click', () => {
          apunta('Doble clic en el icono «Install Linux Mint».');
          ir('idioma');
        });
        esc.appendChild(icono);
        pantalla.appendChild(esc);
        return h;
      },

      idioma() {
        const h = cabeza('Instalación: idioma', s.nombre + ' [Corriendo]');
        const f = eleccion('inst-idioma', ['Español', 'Català', 'English', 'Deutsch'], s.idioma);
        pantalla.appendChild(f);
        const b = siguiente('Continuar');
        b.addEventListener('click', () => {
          s.idioma = f.valor();
          apunta(`Idioma: ${s.idioma}.`);
          ir('teclado');
        });
        mandos(b);
        return h;
      },

      teclado() {
        const h = cabeza('Instalación: distribución del teclado', s.nombre + ' [Corriendo]');
        const f = eleccion('inst-teclado', ['Español', 'Inglés (EE. UU.)'], s.teclado);
        pantalla.appendChild(f);
        const msg = el('div');
        msg.setAttribute('aria-live', 'polite');
        pantalla.appendChild(msg);
        f.addEventListener('change', () => {
          msg.innerHTML = '';
          if (f.valor() !== 'Español') msg.appendChild(aviso('Con el teclado inglés, la tecla ñ no escribe ñ y los símbolos no salen donde están pintados.', 'cuidado'));
        });
        const b = siguiente('Continuar');
        b.addEventListener('click', () => {
          s.teclado = f.valor();
          apunta(`Teclado: ${s.teclado}.`, s.teclado !== 'Español');
          if (s.teclado !== 'Español') averia('Elegiste el teclado inglés: la ñ y los símbolos no salen donde tocan.');
          ir('codecs');
        });
        mandos(b);
        return h;
      },

      codecs() {
        const h = cabeza('Instalación: códecs multimedia', s.nombre + ' [Corriendo]');
        const l = el('label', 'lab__casilla');
        const c = el('input');
        c.type = 'checkbox';
        c.checked = s.codecs;
        l.appendChild(c);
        l.appendChild(document.createTextNode(' Instalar los códecs multimedia'));
        pantalla.appendChild(l);
        pantalla.appendChild(el('p', 'inst__ayuda', 'Los códecs son los programas que hacen falta para ver algunos vídeos y escuchar música. Es buena idea marcarlo.'));
        const b = siguiente('Continuar');
        b.addEventListener('click', () => {
          s.codecs = c.checked;
          apunta(s.codecs ? 'Marcar «Instalar los códecs multimedia».' : 'Sin códecs multimedia.');
          ir('tipo');
        });
        mandos(b);
        return h;
      },

      tipo() {
        const h = cabeza('Instalación: tipo de instalación', s.nombre + ' [Corriendo]');
        const f = eleccion('inst-tipo', ['Borrar disco e instalar Linux Mint', 'Algo más'], 'Borrar disco e instalar Linux Mint');
        pantalla.appendChild(f);
        const msg = el('div');
        pantalla.appendChild(msg);
        const b = siguiente('Instalar ahora');
        b.addEventListener('click', () => {
          msg.innerHTML = '';
          if (f.valor() !== 'Borrar disco e instalar Linux Mint') {
            msg.appendChild(aviso('«Algo más» sirve para hacer las particiones a mano. Hoy, no: elige «Borrar disco».'));
            return;
          }
          if (s.disco < 20) {
            ir('sinsitio');
            return;
          }
          ir('confirmar');
        });
        mandos(b);
        return h;
      },

      sinsitio() {
        const h = cabeza('No hay espacio suficiente', s.nombre + ' [Corriendo]');
        pantalla.appendChild(aviso(`Linux Mint necesita al menos 20 GB y el disco virtual tiene ${s.disco} GB.`));
        apunta(`El instalador dice que no hay sitio: el disco solo tenía ${s.disco} GB.`, true);
        averia(`El disco virtual de ${s.disco} GB era pequeño: no cabía Linux Mint.`);
        const b = siguiente('Apagar y hacer el disco más grande');
        b.addEventListener('click', () => ir('disco'));
        mandos(b);
        return h;
      },

      confirmar() {
        const h = cabeza('¿Escribir los cambios en el disco?', s.nombre + ' [Corriendo]');
        pantalla.appendChild(el('p', null, `Se va a borrar todo el disco /dev/sda: el disco virtual de ${s.disco} GB.`));
        pantalla.appendChild(aviso('En la máquina virtual no pasa nada: el disco es virtual y está vacío. En un ordenador de verdad, esto borraría Windows y tus archivos.', 'cuidado'));
        const atras = boton('‹ Volver');
        atras.addEventListener('click', () => ir('tipo'));
        const b = siguiente('Continuar');
        b.addEventListener('click', () => {
          apunta('Tipo: «Borrar disco e instalar Linux Mint» → Instalar ahora → Continuar.');
          ir('zona');
        });
        mandos(atras, b);
        return h;
      },

      zona() {
        const h = cabeza('Instalación: ¿dónde estás?', s.nombre + ' [Corriendo]');
        const z = lista(['Madrid', 'Canarias', 'Londres', 'Lisboa'], s.zona);
        pantalla.appendChild(campo('Zona horaria', z, 'Mallorca va con la hora de Madrid.'));
        const b = siguiente('Continuar');
        b.addEventListener('click', () => {
          s.zona = z.value;
          apunta(`Zona horaria: ${s.zona}.`, s.zona !== 'Madrid');
          if (s.zona !== 'Madrid') averia(`Elegiste la zona de ${s.zona}: el reloj no irá con la hora de aquí.`);
          ir('usuario');
        });
        mandos(b);
        return h;
      },

      usuario() {
        const h = cabeza('Instalación: ¿quién eres?', s.nombre + ' [Corriendo]');
        pantalla.appendChild(el('p', 'inst__ayuda', 'Usa tu alias, no tu nombre de verdad.'));
        const iAlias = texto(s.alias, true);
        const iEquipo = texto(s.equipo, true);
        const iUser = texto(s.usuario, true);
        const iC1 = el('input', 'lab__entrada'); iC1.type = 'password'; iC1.autocomplete = 'new-password';
        const iC2 = el('input', 'lab__entrada'); iC2.type = 'password'; iC2.autocomplete = 'new-password';
        iAlias.addEventListener('input', () => {
          const base = iAlias.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
          iUser.value = base;
          iEquipo.value = base ? base + '-virtualbox' : '';
        });
        pantalla.appendChild(campo('Tu nombre (tu alias)', iAlias));
        pantalla.appendChild(campo('Nombre del equipo', iEquipo, 'Así se llamará el ordenador en la red.'));
        pantalla.appendChild(campo('Nombre de usuario', iUser, 'En minúsculas y sin espacios.'));
        pantalla.appendChild(campo('Contraseña', iC1));
        pantalla.appendChild(campo('Confirma la contraseña', iC2));
        const msg = el('div');
        pantalla.appendChild(msg);
        const b = siguiente('Continuar');
        b.addEventListener('click', () => {
          msg.innerHTML = '';
          const u = iUser.value.trim();
          if (!iAlias.value.trim()) { msg.appendChild(aviso('Escribe tu alias.')); iAlias.focus(); return; }
          if (!u || /[^a-z0-9_-]/.test(u)) { msg.appendChild(aviso('El nombre de usuario va en minúsculas, sin espacios ni acentos.')); iUser.focus(); return; }
          if (!iEquipo.value.trim()) { msg.appendChild(aviso('Ponle un nombre al equipo.')); iEquipo.focus(); return; }
          if (!iC1.value) { msg.appendChild(aviso('La contraseña no puede estar vacía.')); iC1.focus(); return; }
          if (iC1.value !== iC2.value) { msg.appendChild(aviso('Las dos contraseñas no son iguales. Vuelve a escribirlas.')); iC2.value = ''; iC2.focus(); return; }
          s.alias = iAlias.value.trim(); s.usuario = u; s.equipo = iEquipo.value.trim(); s.clave = iC1.value;
          apunta(`Usuario: ${u}, equipo: ${s.equipo}, con contraseña (apúntala en un sitio seguro).`);
          ir('instalando');
        });
        mandos(b);
        return h;
      },

      instalando() {
        const h = cabeza('Instalando el sistema', s.nombre + ' [Corriendo]');
        const fases = ['Copiando archivos…', 'Instalando el sistema…', 'Configurando el hardware…', 'Instalando el gestor de arranque…', 'Terminando…'];
        const barraP = el('div', 'inst__progreso');
        const relleno = el('div', 'inst__progreso-relleno');
        barraP.appendChild(relleno);
        barraP.setAttribute('role', 'progressbar');
        barraP.setAttribute('aria-valuemin', '0');
        barraP.setAttribute('aria-valuemax', '100');
        pantalla.appendChild(barraP);
        const estado = el('p', null, fases[0]);
        estado.setAttribute('aria-live', 'polite');
        pantalla.appendChild(estado);
        const resto = el('div');
        pantalla.appendChild(resto);
        const parar = s.ram < 1024 ? 3 : 99;
        let i = 0;
        function avanza() {
          const pct = Math.round((i + 1) / fases.length * 100);
          relleno.style.width = pct + '%';
          barraP.setAttribute('aria-valuenow', String(pct));
          estado.textContent = fases[i];
          if (i === parar) {
            resto.appendChild(aviso(`Se ha quedado parado al ${pct} %. Todo va a trompicones: la máquina solo tiene ${s.ram} MB de memoria.`));
            apunta(`La instalación se para: solo ${s.ram} MB de memoria.`, true);
            averia(`Le diste ${s.ram} MB de memoria: muy poca, la instalación se paraba.`);
            const b = siguiente('Apagar y darle más memoria');
            b.addEventListener('click', () => ir('memoria'));
            resto.appendChild(b);
            return;
          }
          i++;
          if (i < fases.length) {
            reloj = setTimeout(avanza, lento() ? 0 : 700);
          } else {
            estado.textContent = 'Instalación terminada.';
            s.instalado = true;
            apunta('Esperar a que acabe la instalación.');
            const b = siguiente('Reiniciar ahora');
            b.addEventListener('click', () => ir('quitar'));
            resto.appendChild(b);
          }
        }
        avanza();
        return h;
      },

      quitar() {
        const h = cabeza('Reiniciando…', s.nombre + ' [Corriendo]');
        pantalla.appendChild(negra('Please remove the installation medium, then press ENTER:'));
        pantalla.appendChild(el('p', null, 'Dice: «Quita el disco de instalación y pulsa Intro». En VirtualBox, la ISO se saca desde el menú Dispositivos → Unidades ópticas → Quitar disco del lector.'));
        const b1 = siguiente('Quitar la ISO y pulsar Intro');
        b1.addEventListener('click', () => {
          s.iso = false;
          apunta('Reiniciar: quitar la ISO del lector y pulsar Intro.');
          ir('login');
        });
        const b2 = boton('Pulsar Intro sin quitarla');
        b2.addEventListener('click', () => {
          apunta('Reiniciar sin quitar la ISO: vuelve a salir el instalador.', true);
          averia('No quitaste la ISO al reiniciar: volvió a salir el instalador.');
          ir('arranque');
        });
        mandos(b1, b2);
        return h;
      },

      login() {
        const h = cabeza('Linux Mint: inicio de sesión', s.nombre + ' [Corriendo]');
        const quien = el('p', 'inst__ficha', '👤 ' + (s.alias || s.usuario));
        quien.setAttribute('translate', 'no');
        pantalla.appendChild(quien);
        const c = el('input', 'lab__entrada');
        c.type = 'password';
        c.autocomplete = 'current-password';
        pantalla.appendChild(campo('Contraseña', c));
        const msg = el('div');
        pantalla.appendChild(msg);
        const b = siguiente('Entrar');
        function entrar() {
          msg.innerHTML = '';
          if (c.value !== s.clave) {
            msg.appendChild(aviso('Contraseña incorrecta. Cuidado con las mayúsculas y con el teclado que elegiste.'));
            c.value = '';
            c.focus();
            return;
          }
          apunta('Entrar con el usuario y la contraseña.');
          ir('escritorio');
        }
        b.addEventListener('click', entrar);
        c.addEventListener('keydown', e => { if (e.key === 'Enter') entrar(); });
        mandos(b);
        return h;
      },

      escritorio() {
        const h = cabeza('Linux Mint instalado', s.nombre + ' [Corriendo]');
        pantalla.appendChild(el('p', null, 'Ya funciona. Falta la post-instalación: lo que se hace justo después de instalar.'));
        const TAREAS = [
          ['act', '🔄 Gestor de actualizaciones → Instalar actualizaciones', 'Instalar las actualizaciones: el sistema de la ISO ya es viejo, y las actualizaciones arreglan fallos y agujeros de seguridad.'],
          ['ctrl', '🧩 Gestor de controladores → Comprobar', 'Comprobar los controladores: Linux busca si a algún aparato le falta el suyo. En la máquina virtual, todo está bien.'],
          ['inst', '📸 VirtualBox: Máquina → Tomar instantánea', 'Tomar una instantánea: VirtualBox guarda cómo está la máquina ahora. Si un día se estropea, se vuelve a este momento con un clic.'],
        ];
        const msg = el('div');
        msg.setAttribute('aria-live', 'polite');
        const fila = el('div', 'inst__tareas');
        TAREAS.forEach(([k, t, explica]) => {
          const b = boton((s.post[k] ? '✓ ' : '') + t, 'lab__boton' + (s.post[k] ? ' lab__boton--activo' : ''));
          b.addEventListener('click', () => {
            if (s.post[k]) return;
            s.post[k] = true;
            b.textContent = '✓ ' + t;
            b.classList.add('lab__boton--activo');
            msg.innerHTML = '';
            msg.appendChild(aviso(explica, 'ok'));
            apunta(explica.split(':')[0] + '.');
            if (s.post.act && s.post.ctrl && s.post.inst) final();
          });
          fila.appendChild(b);
        });
        pantalla.appendChild(fila);
        pantalla.appendChild(msg);
        const fin = el('div');
        pantalla.appendChild(fin);
        function final() {
          fin.innerHTML = '';
          fin.appendChild(aviso('¡Instalación terminada! Ahora haz tu manual de instalación mirando «Lo que has hecho».', 'ok'));
          const notas = [];
          if (s.ram > RAM_PC / 2) notas.push(`Le diste ${s.ram} MB de memoria: más de la mitad. Mientras la máquina funcionaba, el Windows de fuera iba lento.`);
          if (s.cpu > CPU_PC / 2) notas.push(`Le diste ${s.cpu} núcleos de ${CPU_PC}: más de la mitad. El PC iba justo.`);
          if (s.ram >= 1024 && s.ram < 2048) notas.push(`Le diste ${s.ram} MB: funciona, pero lento. Linux Mint pide 2048 MB.`);
          const todas = s.averias.concat(notas);
          if (todas.length) {
            fin.appendChild(el('p', 'inst__registro-titulo', 'Cosas que han ido mal (pregúntate por qué):'));
            const ul = el('ul');
            todas.forEach(t => ul.appendChild(el('li', null, t)));
            fin.appendChild(ul);
          } else {
            fin.appendChild(el('p', null, 'Sin ningún fallo. Prueba a empezar otra vez y equivócate a propósito: sin ISO, con 512 MB de memoria o sin quitar la ISO al reiniciar.'));
          }
        }
        if (s.post.act && s.post.ctrl && s.post.inst) final();
        return h;
      },
    };

    bOtra.addEventListener('click', () => { nuevo(); pintar(); });
    nuevo();
    pintar();
  }

  /* ============================================================
     ¿Qué ha fallado?
     ============================================================ */
  const CAUSAS = {
    iso: 'No hay ninguna ISO en el lector',
    quitar: 'No se quitó la ISO al reiniciar',
    bios: 'La virtualización está desactivada en la BIOS',
    poca: 'La máquina virtual tiene muy poca memoria',
    mucha: 'Le has dado demasiada memoria a la máquina',
    disco: 'El disco virtual es demasiado pequeño',
    teclado: 'Se eligió el teclado inglés al instalar',
    clave: 'La contraseña está mal escrita',
  };
  const SINTOMAS = [
    { c: 'iso', t: 'Pulsas «Iniciar» y sale una pantalla negra que dice «No bootable medium found».', e: 'El disco virtual está vacío y en el lector no hay ISO: la máquina no tiene nada con qué arrancar.' },
    { c: 'quitar', t: 'Instalas Linux, reinicias… y vuelve a salir el menú del instalador.', e: 'La ISO seguía en el lector y la máquina ha arrancado otra vez desde ella. Hay que quitarla.' },
    { c: 'bios', t: 'VirtualBox no deja arrancar ninguna máquina y habla de «VT-x» o «AMD-V».', e: 'VT-x y AMD-V son los nombres de la virtualización del procesador. Está desactivada en la BIOS.' },
    { c: 'poca', t: 'El instalador va a trompicones y se queda parado a la mitad.', e: 'Con muy poca memoria (512 MB, por ejemplo) Linux Mint no puede instalarse. Pide 2048 MB.' },
    { c: 'mucha', t: 'Mientras la máquina virtual funciona, el Windows de tu PC va lentísimo.', e: 'Le has dado más de la mitad de la RAM: a Windows no le queda bastante.' },
    { c: 'disco', t: 'El instalador dice que no hay espacio suficiente.', e: 'Linux Mint necesita unos 20 GB y el disco virtual es más pequeño.' },
    { c: 'teclado', t: 'Ya instalado, pulsas la tecla ñ y sale otra cosa.', e: 'En la instalación se eligió el teclado inglés. Se cambia en la configuración del teclado de Linux.' },
    { c: 'clave', t: 'Linux te dice «Contraseña incorrecta» y tú juras que es la buena.', e: 'Mira si tienes las mayúsculas activadas. Si elegiste mal el teclado, algunos símbolos tampoco salen donde están pintados.' },
  ];

  function labAverias(caja) {
    cabecera(caja);
    const sint = el('p', 'lab__pregunta-texto');
    sint.setAttribute('aria-live', 'polite');
    caja.appendChild(sint);
    const opciones = el('div', 'lab__fila');
    caja.appendChild(opciones);
    const estado = el('p', 'lab__estado');
    estado.setAttribute('aria-live', 'polite');
    caja.appendChild(estado);
    const pie = el('div', 'lab__fila');
    const otra = boton('Otra avería ›');
    pie.appendChild(otra);
    caja.appendChild(pie);

    let ultimo = -1;
    function nueva() {
      let k;
      do { k = Math.floor(Math.random() * SINTOMAS.length); } while (k === ultimo && SINTOMAS.length > 1);
      ultimo = k;
      const caso = SINTOMAS[k];
      sint.textContent = '🔧 ' + caso.t + ' ¿Qué ha fallado?';
      estado.textContent = '';
      estado.className = 'lab__estado';
      opciones.innerHTML = '';
      const otras = Object.keys(CAUSAS).filter(c => c !== caso.c).sort(() => Math.random() - 0.5).slice(0, 3);
      otras.concat(caso.c).sort(() => Math.random() - 0.5).forEach(c => {
        const b = boton(CAUSAS[c]);
        b.addEventListener('click', () => {
          if (c === caso.c) {
            estado.textContent = '✓ Eso es. ' + caso.e;
            estado.className = 'lab__estado lab__estado--bien';
            opciones.querySelectorAll('button').forEach(x => { x.disabled = x !== b; });
            b.classList.add('lab__boton--activo');
          } else {
            estado.textContent = '✗ No es eso. Vuelve a leer el síntoma: ¿en qué momento pasa?';
            estado.className = 'lab__estado lab__estado--mal';
            b.disabled = true;
          }
        });
        opciones.appendChild(b);
      });
    }
    otra.addEventListener('click', nueva);
    nueva();
  }

  window.registrarLab('instalador', labInstalador);
  window.registrarLab('averias-instalacion', labAverias);
})();
