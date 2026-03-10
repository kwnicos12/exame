# IE ABC LMS - Plataforma de Gestión Educativa

Tu proyecto es un **Learning Management System (LMS)** completo llamado "IE ABC LMS", desarrollado como una aplicación web full-stack de una sola página con múltiples vistas. Permite a administradores gestionar cursos, docentes y usuarios; a docentes editar módulos y lecciones; y a estudiantes explorar catálogos públicos.[file:1]

## ✨ Funcionalidades Principales

- **📋 Catálogo público**: Muestra cursos accesibles con detalles como docente, módulos y lecciones (página `index.html`)
- **🔐 Autenticación**: Login para admin, docentes y estudiantes con roles diferenciados y hashing de contraseñas
- **📊 Dashboard Admin**: Estadísticas, CRUD de cursos (con builder de módulos/lecciones), docentes y administrativos (`dashboard.html`)
- **👨‍🏫 Dashboard Docente**: Gestión de cursos asignados, módulos y lecciones (`docente.html`)
- **🎓 Dashboard Estudiante**: Exploración de cursos públicos y detalles (`estudiante.html`)

## 🛠️ Tecnologías Utilizadas

| Categoría | Tecnologías |
|-----------|-------------|
| **Frontend** | HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript |
| **Estilos** | `style.css`, `dashboard.css`, `docente.css`, `estudiante.css`, `components.css` |
| **Persistencia** | LocalStorage (colecciones: `cursos`, `docentes`, `administrativos`, `sesion`) |
| **Características** | Modales dinámicos, filtros, notificaciones toast, responsive design |

## 🚀 Instalación y Uso

1. **Abrir proyecto**: `index.html` en cualquier navegador moderno
2. **Credenciales por defecto**:
Admin: admin@abc.edu.co / admin123 (rol: admin)

3. **Navegación por roles**:
- Admin → Dashboard completo
- Docente → Gestión de contenidos
- Estudiante → Catálogo público

4. **Reset datos**: Borrar LocalStorage del navegador

## 📁 Estructura de Archivos

📁 IE-ABC-LMS/
├── index.html # Página principal y catálogo público
├── login.html # Formulario de login con roles
├── dashboard.html # Panel admin (gestión completa)
├── docente.html # Panel docente (edición contenidos)
├── estudiante.html # Vista estudiante (exploración)
├── css/
│ ├── style.css # Estilos base
│ ├── dashboard.css # Dashboard admin
│ ├── docente.css # Dashboard docente
│ ├── estudiante.css # Vista estudiante
│ └── components.css # Componentes reutilizables
└── js/
└── script.js # Lógica principal (DB, auth, CRUD, UI)


## 🎯 Notas de Desarrollo

### ✅ Características implementadas
- Admin por defecto se crea automáticamente
- CRUD completo para cursos, docentes y administrativos
- Builder dinámico de módulos y lecciones
- Sistema de roles y sesiones
- Responsive design completo
- Notificaciones toast

### 🔒 Seguridad
- Hashing simple (XOR base64) - **Solo para demo**
- No apto para producción multiusuario

### 🚀 Mejoras recomendadas

1. Backend real: Node.js/Express + MongoDB/PostgreSQL

2. Autenticación JWT

3. API RESTful

4. Deploy: Vercel/Netlify (frontend) + Railway/Render (backend)


### 📱 Deploy rápido
- **GitHub Pages/Netlify**: Solo subir archivos estáticos
- **Funciona 100% offline** (LocalStorage)

## 📈 Roadmap futuro

- [ ] Sistema de calificaciones
- [ ] Foros de discusión
- [ ] Certificados automáticos
- [ ] Gamificación (puntos, insignias)
- [ ] API para apps móviles

---

**👨‍💻 Desarrollado por Angelux, Juan Mora, Nandy Nicolas Barros**  
**📅 Marzo 2026 - Bucaramanga, Colombia**  
**🎓 Proyecto académico - Maestría en Desarrollo Web**
