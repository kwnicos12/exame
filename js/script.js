
// MAIN FUNCTIONALITY [FUNCIONALIDAD PRINCIPAL PARA QUE SIRVA TODO ESTO]

// SECCIÓN 1: UTILIDADES DE LOCALSTORAGE

const DB = {
  get(key) {
    return JSON.parse(localStorage.getItem(key)) || [];
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  getObj(key) {
    return JSON.parse(localStorage.getItem(key)) || null;
  },
  setObj(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  }
};

function generarId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// Hash simple para contraseñas (XOR + base64)
function hashPassword(password) {
  return btoa(
    password.split("").map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ (i % 7 + 1))).join("")
  );
}

// SECCIÓN 2: DATOS INICIALES (admin por defecto)

function inicializarDatos() {
  // Admin por defecto si no existe ninguno
  if (DB.get("administrativos").length === 0) {
    DB.set("administrativos", [
      {
        id: generarId(),
        identificacion: "1000000001",
        nombres: "Admin",
        apellidos: "Principal",
        email: "admin@abc.edu.co",
        telefono: "3001234567",
        cargo: "Administrador Principal",
        password: hashPassword("admin123")
      }
    ]);
  }
}

// SECCIÓN 3: SISTEMA DE NOTIFICACIONES (Toast)

function mostrarToast(mensaje, tipo = "success") {
  // Eliminar toast anterior si existe
  const toastExistente = document.querySelector(".toast-notification");
  if (toastExistente) toastExistente.remove();

  const toast = document.createElement("div");
  toast.className = `toast-notification toast-${tipo}`;
  toast.textContent = mensaje;
  toast.style.cssText = `
    position: fixed; top: 20px; right: 20px; z-index: 9999;
    padding: 12px 20px; border-radius: 8px; font-weight: 600;
    color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    animation: fadeInOut 3s forwards;
    background: ${tipo === "success" ? "#28a745" : tipo === "error" ? "#dc3545" : "#ffc107"};
  `;

  // Animación CSS inline
  if (!document.getElementById("toast-style")) {
    const style = document.createElement("style");
    style.id = "toast-style";
    style.textContent = `
      @keyframes fadeInOut {
        0%   { opacity: 0; transform: translateY(-10px); }
        10%  { opacity: 1; transform: translateY(0); }
        80%  { opacity: 1; }
        100% { opacity: 0; transform: translateY(-10px); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// SECCIÓN 4: AUTENTICACIÓN

// PAGINA DE LOGIN
function inicializarLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const rol = document.getElementById("role").value;

    if (rol === "estudiante") {
      window.location.href = "estudiante.html";
      return;
    }

    if (rol === "docente") {
      const docentes = DB.get("docentes");
      const hashedPwd = hashPassword(password);
      const docente = docentes.find(
        (d) => d.email === email && d.password === hashedPwd
      );

      if (docente) {
        DB.setObj("sesion", {
          usuario_id: docente.id,
          email: docente.email,
          nombre: `${docente.nombres} ${docente.apellidos}`,
          rol: "docente",
          timestamp: Date.now()
        });
        window.location.href = "docente.html";
      } else {
        mostrarErrorLogin("Credenciales de docente incorrectas.");
      }
      return;
    }

    if (rol === "admin") {
      const admins = DB.get("administrativos");
      const usuario = admins.find(
        (a) => a.email === email && a.password === hashPassword(password)
      );

      if (usuario) {
        DB.setObj("sesion", {
          usuario_id: usuario.id,
          email: usuario.email,
          nombre: `${usuario.nombres} ${usuario.apellidos}`,
          rol: "admin",
          timestamp: Date.now()
        });
        window.location.href = "dashboard.html";
      } else {
        mostrarErrorLogin("Credenciales incorrectas. Verifica tu email y contraseña.");
      }
    }
  });
}

function mostrarErrorLogin(mensaje) {
  let errorEl = document.getElementById("login-error");
  if (!errorEl) {
    errorEl = document.createElement("p");
    errorEl.id = "login-error";
    errorEl.style.cssText =
      "color:#dc3545; font-size:0.9rem; margin-top:10px; text-align:center; font-weight:600;";
    document.getElementById("login-form").appendChild(errorEl);
  }
  errorEl.textContent = mensaje;
}

// PROTECCION PARA DASHBOARD
function verificarSesion(rolRequerido = null) {
  const sesion = DB.getObj("sesion");
  if (!sesion) {
    window.location.href = "login.html";
    return null;
  }
  if (rolRequerido && sesion.rol !== rolRequerido) {
    window.location.href = "login.html";
    return null;
  }
  return sesion;
}

// LOG OUT / CERRAR SECCION
function cerrarSesion() {
  DB.remove("sesion");
  window.location.href = "index.html";
}

// SECCIÓN 5: NAVEGACIÓN DEL DASHBOARD

const VISTAS = {
  resumen: { nav: "nav-resumen", view: "view-resumen", titulo: "Panel Principal" },
  cursos: { nav: "nav-cursos", view: "view-cursos", titulo: "Gestión de Cursos" },
  docentes: { nav: "nav-docentes", view: "view-docentes", titulo: "Gestión de Docentes" },
  admins: { nav: "nav-admins", view: "view-admins", titulo: "Administrativos" }
};

function cambiarVista(nombreVista) {
  // Ocultar todas las vistas
  Object.values(VISTAS).forEach(({ view }) => {
    const el = document.getElementById(view);
    if (el) el.style.display = "none";
  });

  // Quitar activo de todos los nav links
  Object.values(VISTAS).forEach(({ nav }) => {
    const el = document.getElementById(nav);
    if (el) el.classList.remove("active");
  });

  // Mostrar vista seleccionada
  const vista = VISTAS[nombreVista];
  if (!vista) return;

  document.getElementById(vista.view).style.display = "block";
  document.getElementById(vista.nav).classList.add("active");
  document.getElementById("main-title").textContent = vista.titulo;

  // Cargar datos de la vista
  if (nombreVista === "resumen") actualizarResumen();
  if (nombreVista === "cursos") renderTablasCursos();
  if (nombreVista === "docentes") renderTablasDocentes();
  if (nombreVista === "admins") renderTablasAdmins();
}

function inicializarNavegacion() {
  Object.keys(VISTAS).forEach((nombre) => {
    const btn = document.getElementById(VISTAS[nombre].nav);
    if (btn) {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        cambiarVista(nombre);
      });
    }
  });

  // Logout
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      cerrarSesion();
    });
  }
}

// SECCIÓN 6: RESUMEN / ESTADÍSTICAS

function actualizarResumen() {
  const cursos = DB.get("cursos");
  const docentes = DB.get("docentes");
  const admins = DB.get("administrativos");

  const elCursos = document.getElementById("count-courses");
  const elDocentes = document.getElementById("count-teachers");
  const elAdmins = document.getElementById("count-admins");

  if (elCursos) elCursos.textContent = cursos.length;
  if (elDocentes) elDocentes.textContent = docentes.length;
  if (elAdmins) elAdmins.textContent = admins.length;
}

// SECCIÓN 7: GESTIÓN DE MODALES

function abrirModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.style.display = "flex";
}

function cerrarModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = "none";
    // Limpiar formulario dentro del modal
    const form = modal.querySelector("form");
    if (form) {
      form.reset();
      form.removeAttribute("data-edit-id");
    }
    // Limpiar módulos dinámicos del curso
    const modulosContainer = document.getElementById("modulos-container");
    if (modulosContainer) modulosContainer.innerHTML = "";
  }
}

function inicializarModales() {
  // Botones X de cierre
  document.querySelectorAll(".close-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const modal = btn.closest(".modal");
      if (modal) cerrarModal(modal.id);
    });
  });

  // Click fuera del modal para cerrar
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) cerrarModal(modal.id);
    });
  });
}

// SECCIÓN 8: GESTIÓN DE DOCENTES

function inicializarDocentesUI() {
  // Botón registrar docente (en header de la vista)
  document.querySelectorAll("#view-docentes .btn-primary").forEach((btn) => {
    btn.addEventListener("click", () => {
        cerrarModal("modal-docente");
        document.getElementById("modal-docente").querySelector("h3").textContent = "Registrar Docente";
        abrirModal("modal-docente");
    });
    });

  // Formulario de docente
    const formDocente = document.getElementById("form-docente");
    if (formDocente) {
    // Asignar IDs a los inputs del form-docente
    asignarIdsFormDocente();
    formDocente.addEventListener("submit", guardarDocente);
    }
}

function asignarIdsFormDocente() {
    const form = document.getElementById("form-docente");
    if (!form) return;
    const labels = form.querySelectorAll(".form-group label");
    const inputs = form.querySelectorAll(".form-group input");
    const mapa = ["codigo", "identificacion", "nombres", "apellidos", "email", "url_foto", "area_academica", "password"];
    inputs.forEach((input, i) => {
    if (mapa[i]) input.id = `docente-${mapa[i]}`;
    });
}

function guardarDocente(e) {
    e.preventDefault();
    const form = e.target;
    const editId = form.getAttribute("data-edit-id");
    const passwordEl = document.getElementById("docente-password");

    const datos = {
    id: editId || generarId(),
    codigo: document.getElementById("docente-codigo")?.value.trim(),
    identificacion: document.getElementById("docente-identificacion")?.value.trim(),
    nombres: document.getElementById("docente-nombres")?.value.trim(),
    apellidos: document.getElementById("docente-apellidos")?.value.trim(),
    email: document.getElementById("docente-email")?.value.trim(),
    url_foto: document.getElementById("docente-url_foto")?.value.trim(),
    area_academica: document.getElementById("docente-area_academica")?.value.trim(),
    password: passwordEl?.value ? hashPassword(passwordEl.value) : undefined
    };

  // Validar campos requeridos
    for (const [campo, valor] of Object.entries(datos)) {
    if (["id", "password"].includes(campo)) continue;
    if (!valor) {
    mostrarToast(`El campo "${campo}" es requerido`, "error");
    return;
    }
    }

    const docentes = DB.get("docentes");

    if (editId) {
    const idx = docentes.findIndex((d) => d.id === editId);
    if (idx !== -1) {
    datos.password = datos.password || docentes[idx].password;
    docentes[idx] = datos;
    }
    mostrarToast("Docente actualizado correctamente ✓");
    } else {
    // Verificar email duplicado
    if (docentes.some((d) => d.email === datos.email)) {
    mostrarToast("Ya existe un docente con ese email", "error");
    return;
    }
    docentes.push(datos);
    mostrarToast("Docente registrado correctamente ✓");
    }

    DB.set("docentes", docentes);
    cerrarModal("modal-docente");
    renderTablasDocentes();
    actualizarResumen();
}

function editarDocente(id) {
    const docentes = DB.get("docentes");
    const doc = docentes.find((d) => d.id === id);
    if (!doc) return;

    document.getElementById("modal-docente").querySelector("h3").textContent = "Editar Docente";
    abrirModal("modal-docente");

    document.getElementById("docente-codigo").value = doc.codigo;
    document.getElementById("docente-identificacion").value = doc.identificacion;
    document.getElementById("docente-nombres").value = doc.nombres;
    document.getElementById("docente-apellidos").value = doc.apellidos;
    document.getElementById("docente-email").value = doc.email;
    document.getElementById("docente-url_foto").value = doc.url_foto;
    document.getElementById("docente-area_academica").value = doc.area_academica;

    const pwEl = document.getElementById("docente-password");
    if (pwEl) { pwEl.value = ""; pwEl.placeholder = "dejar vacío para mantener"; }

    document.getElementById("form-docente").setAttribute("data-edit-id", id);
}

function eliminarDocente(id) {
    const cursos = DB.get("cursos");
    const asignado = cursos.some((c) => c.docente_id === id);

    if (asignado) {
    mostrarToast("No se puede eliminar: el docente está asignado a un curso", "error");
    return;
    }

    if (!confirm("¿Estás seguro de eliminar este docente?")) return;

    const docentes = DB.get("docentes").filter((d) => d.id !== id);
    DB.set("docentes", docentes);
    mostrarToast("Docente eliminado");
    renderTablasDocentes();
    actualizarResumen();
}

function renderTablasDocentes() {
    const tbody = document.getElementById("table-docentes-body");
    if (!tbody) return;

    const docentes = DB.get("docentes");
    const cursos = DB.get("cursos");

    if (docentes.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888">No hay docentes registrados</td></tr>`;
    return;
    }

tbody.innerHTML = docentes.map((doc) => {
    const carga = cursos.filter((c) => c.docente_id === doc.id).length;
    return `
        <tr>
        <td>${doc.codigo}</td>
        <td>${doc.identificacion}</td>
        <td>${doc.nombres} ${doc.apellidos}</td>
        <td>${doc.area_academica}</td>
        <td>${carga} curso(s)</td>
        <td>
        <button class="btn btn-secondary" onclick="editarDocente('${doc.id}')">Editar</button>
        <button class="btn" style="background:#dc3545;color:white" onclick="eliminarDocente('${doc.id}')">Eliminar</button>
        </td>
        </tr>`;
    }).join("");
}

// SECCIÓN 9: GESTIÓN DE CURSOS

// -- DYNAMIC BUILDER PARA LOS MODULOS [digale a nandy que busque que es para explicar el codigo despues] --
let modulosTemp = []; // módulos en construcción [son modulos temporales para generarlos despues y que esteen permanentes]

function inicializarCursosUI() {
  // Botones "nuevo curso" (en vista cursos y en accesos rápidos)
    document.querySelectorAll(".btn-primary").forEach((btn) => {
    if (btn.textContent.trim() === "+ nuevo curso") {
        btn.addEventListener("click", () => {
        modulosTemp = [];
        cerrarModal("modal-curso");
        document.getElementById("modal-curso").querySelector("h3").textContent = "Crear / Editar Curso";
        cargarSelectDocentes();
        renderModulosBuilder();
        abrirModal("modal-curso");
        });
    }
    });

  // Botón "agregar módulo"
    const btnAgregarModulo = document.querySelector(".module-builder .btn-secondary");
    if (btnAgregarModulo) {
    btnAgregarModulo.addEventListener("click", agregarModuloDesdeForm);
    }

  // Formulario curso
    const formCurso = document.getElementById("form-curso");
    if (formCurso) {
    asignarIdsFormCurso();
    formCurso.addEventListener("submit", guardarCurso);
    }

  // Filtros
    inicializarFiltrosCursos();
}

function asignarIdsFormCurso() {
    const form = document.getElementById("form-curso");
    if (!form) return;
    const inputs = form.querySelectorAll(".form-grid .form-group input, .form-grid .form-group select");
    const ids = ["curso-codigo", "curso-nombre", "curso-categoria", "curso-duracion", "curso-etiquetas", "curso-visibilidad", "curso-docente"];
    inputs.forEach((el, i) => { if (ids[i]) el.id = ids[i]; });
    const textarea = form.querySelector(".form-group textarea");
    if (textarea) textarea.id = "curso-descripcion";

  // IDs del builder de módulo/lección
    const moduleInputs = form.querySelectorAll(".module-builder .form-group input, .module-builder .form-group textarea");
    const moduleIds = ["mod-codigo", "mod-nombre", "mod-descripcion", "lec-titulo", "lec-contenido", "lec-multimedia"];
    moduleInputs.forEach((el, i) => { if (moduleIds[i]) el.id = moduleIds[i]; });

  // Contenedor para lista de módulos añadidos
    const modulesSection = form.querySelector(".modules-section");
    if (modulesSection && !document.getElementById("modulos-container")) {
    const container = document.createElement("div");
    container.id = "modulos-container";
    modulesSection.appendChild(container);
    }
}

function cargarSelectDocentes() {
    const select = document.getElementById("curso-docente");
    if (!select) return;
    const docentes = DB.get("docentes");
    select.innerHTML = `<option value="">-- Seleccionar docente --</option>` +
    docentes.map((d) => `<option value="${d.id}">${d.nombres} ${d.apellidos} (${d.area_academica})</option>`).join("");
}

function agregarModuloDesdeForm() {
    const codigo = document.getElementById("mod-codigo")?.value.trim();
    const nombre = document.getElementById("mod-nombre")?.value.trim();
    const descripcion = document.getElementById("mod-descripcion")?.value.trim();
    const lecTitulo = document.getElementById("lec-titulo")?.value.trim();
    const lecContenido = document.getElementById("lec-contenido")?.value.trim();
    const lecMultimedia = document.getElementById("lec-multimedia")?.value.trim();

if (!codigo || !nombre) {
    mostrarToast("El módulo necesita al menos código y nombre", "error");
    return;
    }

    const modulo = {
    id: generarId(),
    codigo, nombre, descripcion,
    lecciones: []
    };

if (lecTitulo) {
    modulo.lecciones.push({
    id: generarId(),
    titulo: lecTitulo,
    intensidad_horaria: "",
    contenido: lecContenido,
    multimedia: lecMultimedia ? lecMultimedia.split(",").map(s => s.trim()) : []
    });
    }

    modulosTemp.push(modulo);
    renderModulosBuilder();

  // Limpiar campos del builder
    ["mod-codigo", "mod-nombre", "mod-descripcion", "lec-titulo", "lec-contenido", "lec-multimedia"]
    .forEach((id) => { const el = document.getElementById(id); if (el) el.value = ""; });

    mostrarToast(`Módulo "${nombre}" agregado ✓`);
}

function renderModulosBuilder() {
    const container = document.getElementById("modulos-container");
    if (!container) return;

    if (modulosTemp.length === 0) {
    container.innerHTML = `<p style="color:#888;font-size:0.9rem">No hay módulos añadidos aún.</p>`;
    return;
    }

container.innerHTML = `<h5>Módulos añadidos (${modulosTemp.length})</h5>` +
        modulosTemp.map((mod, i) => `
        <div style="background:#f0f4ff;border-radius:8px;padding:10px;margin:8px 0;border-left:4px solid #4361ee">
        <strong>${mod.codigo} - ${mod.nombre}</strong>
        <span style="float:right;cursor:pointer;color:#dc3545" onclick="eliminarModuloTemp(${i})">✕</span>
        <p style="margin:4px 0;font-size:0.85rem">${mod.descripcion || ""}</p>
        <small>${mod.lecciones.length} lección(es)</small>
        </div>`).join("");
}

function eliminarModuloTemp(index) {
    modulosTemp.splice(index, 1);
    renderModulosBuilder();
}

function guardarCurso(e) {
    e.preventDefault();
    const form = e.target;
    const editId = form.getAttribute("data-edit-id");

    const docenteId = document.getElementById("curso-docente")?.value;
    if (!docenteId) {
    mostrarToast("Debes seleccionar un docente", "error");
    return;
    }

const datos = {
    id: editId || generarId(),
    codigo: document.getElementById("curso-codigo")?.value.trim(),
    nombre: document.getElementById("curso-nombre")?.value.trim(),
    descripcion: document.getElementById("curso-descripcion")?.value.trim(),
    categoria: document.getElementById("curso-categoria")?.value.trim(),
    duracion: document.getElementById("curso-duracion")?.value.trim(),
    etiquetas: document.getElementById("curso-etiquetas")?.value.trim(),
    visibilidad: document.getElementById("curso-visibilidad")?.value,
    docente_id: docenteId,
    modulos: modulosTemp,
    fecha_creacion: editId ? undefined : new Date().toISOString().split("T")[0]
    };

    for (const [k, v] of Object.entries(datos)) {
    if (["modulos", "fecha_creacion", "etiquetas"].includes(k)) continue;
    if (!v) { mostrarToast(`El campo "${k}" es requerido`, "error"); return; }
    }

    const cursos = DB.get("cursos");

if (editId) {
    const idx = cursos.findIndex((c) => c.id === editId);
    if (idx !== -1) { datos.fecha_creacion = cursos[idx].fecha_creacion; cursos[idx] = datos; }
    mostrarToast("Curso actualizado ✓");
    } else {
    datos.fecha_creacion = new Date().toISOString().split("T")[0];
    cursos.push(datos);
    mostrarToast("Curso creado ✓");
    }

    DB.set("cursos", cursos);
    cerrarModal("modal-curso");
    renderTablasCursos();
    actualizarResumen();
    modulosTemp = [];
}

function editarCurso(id) {
    const cursos = DB.get("cursos");
    const curso = cursos.find((c) => c.id === id);
    if (!curso) return;

    modulosTemp = [...(curso.modulos || [])];
    cargarSelectDocentes();
    abrirModal("modal-curso");

    document.getElementById("curso-codigo").value = curso.codigo;
    document.getElementById("curso-nombre").value = curso.nombre;
    document.getElementById("curso-categoria").value = curso.categoria;
    document.getElementById("curso-duracion").value = curso.duracion;
    document.getElementById("curso-etiquetas").value = curso.etiquetas || "";
    document.getElementById("curso-visibilidad").value = curso.visibilidad;
    document.getElementById("curso-docente").value = curso.docente_id;
    document.getElementById("curso-descripcion").value = curso.descripcion;

    renderModulosBuilder();
    document.getElementById("form-curso").setAttribute("data-edit-id", id);
    document.getElementById("modal-curso").querySelector("h3").textContent = "Editar Curso";
}

function eliminarCurso(id) {
    if (!confirm("¿Eliminar este curso?")) return;
    const cursos = DB.get("cursos").filter((c) => c.id !== id);
    DB.set("cursos", cursos);
    mostrarToast("Curso eliminado");
    renderTablasCursos();
    actualizarResumen();
}

let filtrosCursos = { texto: "", estado: "", tipo: "" };

function inicializarFiltrosCursos() {
    const filtersBar = document.querySelector("#view-cursos .filters-bar");
    if (!filtersBar) return;

    const inputs = filtersBar.querySelectorAll("input[type='text'], select");
    if (inputs[0]) inputs[0].addEventListener("input", (e) => { filtrosCursos.texto = e.target.value; renderTablasCursos(); });
    if (inputs[1]) inputs[1].addEventListener("change", (e) => { filtrosCursos.estado = e.target.value; renderTablasCursos(); });
    if (inputs[2]) inputs[2].addEventListener("change", (e) => { filtrosCursos.tipo = e.target.value; renderTablasCursos(); });
}

function renderTablasCursos() {
    const tbody = document.getElementById("table-cursos-body");
    if (!tbody) return;

    let cursos = DB.get("cursos");
    const docentes = DB.get("docentes");

  // Aplicar filtros
    if (filtrosCursos.texto)
    cursos = cursos.filter((c) => c.nombre.toLowerCase().includes(filtrosCursos.texto.toLowerCase()));
    if (filtrosCursos.estado)
    cursos = cursos.filter((c) => c.visibilidad === filtrosCursos.estado);
    if (filtrosCursos.tipo)
    cursos = cursos.filter((c) => c.categoria?.toLowerCase().includes(filtrosCursos.tipo.toLowerCase()));

    if (cursos.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:#888">No hay cursos registrados</td></tr>`;
    return;
    }

tbody.innerHTML = cursos.map((curso) => {
    const doc = docentes.find((d) => d.id === curso.docente_id);
    const docNombre = doc ? `${doc.nombres} ${doc.apellidos}` : "Sin asignar";
    const badge = curso.visibilidad === "publico"
    ? `<span style="background:#28a745;color:white;padding:2px 8px;border-radius:12px;font-size:0.8rem">Público</span>`
    : `<span style="background:#6c757d;color:white;padding:2px 8px;border-radius:12px;font-size:0.8rem">Oculto</span>`;
    return `
        <tr>
        <td>${curso.codigo}</td>
        <td>${curso.nombre}</td>
        <td>${curso.categoria}</td>
        <td>${docNombre}</td>
        <td>${badge}</td>
        <td>
        <button class="btn btn-secondary" onclick="editarCurso('${curso.id}')">Editar</button>
        <button class="btn" style="background:#dc3545;color:white" onclick="eliminarCurso('${curso.id}')">Eliminar</button>
        </td>
        </tr>`;
    }).join("");
}

// SECCIÓN 10: GESTIÓN DE ADMINISTRATIVOS

function inicializarAdminsUI() {
    document.querySelectorAll("#view-admins .btn-primary").forEach((btn) => {
    btn.addEventListener("click", () => {
    cerrarModal("modal-admin");
    document.getElementById("modal-admin").querySelector("h3").textContent = "Registrar Administrativo";
    abrirModal("modal-admin");
    });
    });

    const formAdmin = document.getElementById("form-admin");
    if (formAdmin) {
    asignarIdsFormAdmin();
    formAdmin.addEventListener("submit", guardarAdmin);
    }
}

function asignarIdsFormAdmin() {
    const form = document.getElementById("form-admin");
    if (!form) return;
    const inputs = form.querySelectorAll(".form-group input");
    const ids = ["admin-identificacion", "admin-nombres", "admin-apellidos", "admin-email", "admin-telefono", "admin-cargo", "admin-password"];
    inputs.forEach((el, i) => { if (ids[i]) el.id = ids[i]; });

  // Agregar campo contraseña si no existe
    if (!document.getElementById("admin-password")) {
    const lastGroup = form.querySelector("button[type='submit']");
    const div = document.createElement("div");
    div.className = "form-group";
    div.innerHTML = `<label>contraseña</label><input type="password" id="admin-password" class="form-control" required>`;
    form.insertBefore(div, lastGroup);
    }
}

function guardarAdmin(e) {
    e.preventDefault();
    const form = e.target;
    const editId = form.getAttribute("data-edit-id");

    const passwordEl = document.getElementById("admin-password");
    const datos = {
    id: editId || generarId(),
    identificacion: document.getElementById("admin-identificacion")?.value.trim(),
    nombres: document.getElementById("admin-nombres")?.value.trim(),
    apellidos: document.getElementById("admin-apellidos")?.value.trim(),
    email: document.getElementById("admin-email")?.value.trim(),
    telefono: document.getElementById("admin-telefono")?.value.trim(),
    cargo: document.getElementById("admin-cargo")?.value.trim(),
    password: passwordEl?.value ? hashPassword(passwordEl.value) : undefined
    };

    for (const [k, v] of Object.entries(datos)) {
    if (["id", "password"].includes(k)) continue;
    if (!v) { mostrarToast(`El campo "${k}" es requerido`, "error"); return; }
    }

    const admins = DB.get("administrativos");

if (editId) {
    const idx = admins.findIndex((a) => a.id === editId);
    if (idx !== -1) {
    datos.password = datos.password || admins[idx].password;
    admins[idx] = datos;
    }
    mostrarToast("Administrativo actualizado ✓");
    } else {
    if (!datos.password) { mostrarToast("La contraseña es requerida", "error"); return; }
    if (admins.some((a) => a.email === datos.email)) {
    mostrarToast("Ya existe un administrativo con ese email", "error");
    return;
    }
    admins.push(datos);
    mostrarToast("Administrativo registrado ✓");
    }

    DB.set("administrativos", admins);
    cerrarModal("modal-admin");
    renderTablasAdmins();
    actualizarResumen();
}

function editarAdmin(id) {
    const admins = DB.get("administrativos");
    const admin = admins.find((a) => a.id === id);
    if (!admin) return;

    document.getElementById("modal-admin").querySelector("h3").textContent = "Editar Administrativo";
    abrirModal("modal-admin");

    document.getElementById("admin-identificacion").value = admin.identificacion;
    document.getElementById("admin-nombres").value = admin.nombres;
    document.getElementById("admin-apellidos").value = admin.apellidos;
    document.getElementById("admin-email").value = admin.email;
    document.getElementById("admin-telefono").value = admin.telefono;
    document.getElementById("admin-cargo").value = admin.cargo;

    const pwEl = document.getElementById("admin-password");
    if (pwEl) { pwEl.required = false; pwEl.placeholder = "Dejar vacío para mantener"; }

    document.getElementById("form-admin").setAttribute("data-edit-id", id);
}

function eliminarAdmin(id) {
    const sesion = DB.getObj("sesion");
    const admins = DB.get("administrativos");
    const target = admins.find((a) => a.id === id);

    if (target && target.email === sesion?.email) {
    mostrarToast("No puedes eliminar tu propia cuenta", "error");
    return;
    }

    if (!confirm("¿Eliminar este administrativo?")) return;

    DB.set("administrativos", admins.filter((a) => a.id !== id));
    mostrarToast("Administrativo eliminado");
    renderTablasAdmins();
    actualizarResumen();
}

function renderTablasAdmins() {
    const tbody = document.getElementById("table-admins-body");
    if (!tbody) return;

    const admins = DB.get("administrativos");

    if (admins.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#888">No hay administrativos registrados</td></tr>`;
    return;
    }

tbody.innerHTML = admins.map((admin) => `
    <tr>
    <td>${admin.identificacion}</td>
    <td>${admin.nombres} ${admin.apellidos}</td>
    <td>${admin.email}</td>
    <td>${admin.cargo}</td>
    <td>
    <button class="btn btn-secondary" onclick="editarAdmin('${admin.id}')">Editar</button>
    <button class="btn" style="background:#dc3545;color:white" onclick="eliminarAdmin('${admin.id}')">Eliminar</button>
    </td>
    </tr>`).join("");
}

// SECCIÓN 11: PÁGINA PÚBLICA - index.html (catálogo de cursos)

function renderCursosPublicos() {
    const container = document.getElementById("public-courses-container");
    if (!container) return;

    const cursos = DB.get("cursos").filter((c) => c.visibilidad === "publico");
    const docentes = DB.get("docentes");

    if (cursos.length === 0) {
    container.innerHTML = `<p style="color:#888;text-align:center;grid-column:1/-1">No hay cursos disponibles por el momento.</p>`;
    return;
    }

    container.innerHTML = cursos.map((curso) => {
    const doc = docentes.find((d) => d.id === curso.docente_id);
    const docNombre = doc ? `${doc.nombres} ${doc.apellidos}` : "Sin asignar";
    const modCount = (curso.modulos || []).length;
    return `
        <article class="course-card">
        <div class="course-image">
        <div class="img-placeholder">${curso.categoria || "Curso"}</div>
        </div>
        <div class="course-content">
        <span class="course-tag">${curso.categoria}</span>
        <h3>${curso.nombre}</h3>
        <p class="course-description">${curso.descripcion}</p>
        <div class="course-meta">
        <span><strong>Docente:</strong> ${docNombre}</span>
        <span><strong>Módulos:</strong> ${modCount}</span>
        </div>
        </div>
        <div class="course-footer">
        <a href="#" class="btn btn-secondary btn-block">ver detalles</a>
        </div>
        </article>`;
    }).join("");
}

// SECCIÓN 12: ACCESOS RÁPIDOS [quick actions para los resumenes]

function inicializarAccesosRapidos() {
    document.querySelectorAll(".quick-actions .btn-primary").forEach((btn) => {
    if (btn.textContent.includes("curso")) {
        btn.addEventListener("click", () => {
        cambiarVista("cursos");
        modulosTemp = [];
        cargarSelectDocentes();
        renderModulosBuilder();
        abrirModal("modal-curso");
        });
    }
    });

    document.querySelectorAll(".quick-actions .btn-secondary").forEach((btn) => {
    if (btn.textContent.includes("docente")) {
        btn.addEventListener("click", () => {
        cambiarVista("docentes");
        abrirModal("modal-docente");
        });
    }
    });
}


// SECCIÓN 13: INICIALIZACIÓN PRINCIPAL (DOMContentLoaded) [TODO: checkear si funciona de manera organizada]

document.addEventListener("DOMContentLoaded", () => {
    const pagina = window.location.pathname.split("/").pop() || "index.html";

    inicializarDatos();

    if (pagina === "index.html" || pagina === "") {
    renderCursosPublicos();
    }

    if (pagina === "login.html") {
    inicializarLogin();
    }

if (pagina === "dashboard.html") {
    const sesion = verificarSesion("admin");
    if (!sesion) return;

    // Mostrar nombre del usuario en el header
    const headerUser = document.querySelector(".header-user span");
    if (headerUser) headerUser.textContent = sesion.nombre || sesion.email;

    inicializarNavegacion();
    inicializarModales();
    inicializarDocentesUI();
    inicializarCursosUI();
    inicializarAdminsUI();
    inicializarAccesosRapidos();

    // Carga vista preview [resumen]
    cambiarVista("resumen");
    }
});