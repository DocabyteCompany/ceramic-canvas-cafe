# 🏺 Cerámico Arte & Café

> **Una experiencia única donde la creatividad se encuentra con el sabor del café**

Una aplicación web moderna para reservar sesiones de pintura en cerámica en el establecimiento Cerámico Arte & Café, ubicado en Morelia, Michoacán. Combina la pasión por el arte cerámico con la calidez de una cafetería artesanal.

## ✨ Características Principales

### 🎨 Experiencia de Usuario
- **Interfaz intuitiva** diseñada para inspirar creatividad
- **Sistema de reservas paso a paso** con validación en tiempo real
- **Diseño responsive** optimizado para todos los dispositivos
- **Animaciones suaves** que mejoran la experiencia

### 📅 Sistema de Reservas
- **Selección de fecha y hora** con calendario interactivo
- **Disponibilidad en tiempo real** (preparado para integración con Supabase)
- **Validación de formularios** con mensajes claros
- **Confirmación visual** con resumen completo de la reserva

### 🚀 Funcionalidades Clave
- **Navegación suave** entre secciones
- **Información detallada** sobre la experiencia
- **Horarios dinámicos** según el día de la semana
- **Integración con redes sociales** (Instagram)
- **Mapa interactivo** con ubicación del establecimiento

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para mayor robustez
- **Vite** - Herramienta de build rápida y moderna
- **Tailwind CSS** - Framework de estilos utilitarios

### Componentes UI
- **shadcn/ui** - Biblioteca de componentes accesibles
- **Radix UI** - Componentes primitivos sin estilos
- **Lucide React** - Iconografía consistente y moderna

### Funcionalidades
- **React Router DOM** - Navegación entre páginas
- **React Hook Form** - Manejo de formularios
- **Zod** - Validación de esquemas
- **date-fns** - Manipulación de fechas
- **TanStack Query** - Manejo de estado del servidor

### Herramientas de Desarrollo
- **ESLint** - Linter para mantener código limpio
- **PostCSS** - Procesamiento de CSS
- **Autoprefixer** - Compatibilidad con navegadores

## 🚀 Instalación y Configuración

### Prerrequisitos
- **Node.js** 18+ 
- **npm** o **yarn** para gestión de paquetes

### Pasos de Instalación

1. **Clonar el repositorio**
```powershell
git clone https://github.com/tu-usuario/ceramic-canvas-cafe-1.git
cd ceramic-canvas-cafe-1
```

2. **Instalar dependencias**
```powershell
npm install
```

3. **Ejecutar en modo desarrollo**
```powershell
npm run dev
```

4. **Abrir en el navegador**
```
http://localhost:5173
```

### Scripts Disponibles

```powershell
# Desarrollo con hot reload
npm run dev

# Build para producción
npm run build

# Preview del build de producción
npm run preview

# Linter
npm run lint
```

## 📁 Estructura del Proyecto

```
ceramic-canvas-cafe-1/
├── public/                 # Archivos estáticos
├── src/
│   ├── assets/            # Imágenes y recursos
│   ├── components/        # Componentes React
│   │   ├── ui/           # Componentes base (shadcn/ui)
│   │   ├── reservation/  # Componentes de reservas
│   │   ├── Navigation.tsx
│   │   └── ReservationWizard.tsx
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilidades y configuración
│   ├── pages/            # Páginas principales
│   ├── App.tsx           # Componente principal
│   └── main.tsx          # Punto de entrada
├── tailwind.config.ts    # Configuración de Tailwind
├── components.json       # Configuración de shadcn/ui
└── package.json          # Dependencias y scripts
```

## 🎨 Sistema de Diseño

El proyecto implementa un sistema de diseño cohesivo inspirado en la calidez artesanal de la cerámica:

### Paleta de Colores
- **Terracotta** (#8B5E3C) - Color principal de marca
- **Beige** (#F5F0E6) - Fondo cálido y acogedor
- **Olive** (#A6A48D) - Acentos y elementos secundarios

### Tipografía
- **Playfair Display** - Títulos y elementos de marca
- **Poppins** - Texto del cuerpo y UI

### Componentes
- **Botones personalizados** con efectos hover suaves
- **Tarjetas con sombras cálidas** para profundidad visual
- **Animaciones fluidas** que mejoran la experiencia

> 📖 **Consulta [DESIGN_GUIDELINES.md](./DESIGN_GUIDELINES.md) para pautas detalladas de diseño**

## 🔧 Configuración Avanzada

### Integración con Supabase (Pendiente)
El sistema de reservas está preparado para integrarse con Supabase:

```typescript
// Ejemplo de configuración futura
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
```

### Variables de Entorno
Crear archivo `.env.local`:
```env
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Personalización de Horarios
Los horarios se configuran en `DateTimeSelection.tsx`:
```typescript
const weekdayTimeSlots = [
  { value: '10:00', label: '10:00 AM - 11:45 AM', available: 16 },
  // ... más horarios
];
```

## 📱 Características Responsive

- **Mobile First**: Diseño optimizado para dispositivos móviles
- **Breakpoints**: 768px (tablet), 1024px (desktop)
- **Navegación adaptativa**: Menú hamburguesa en móvil
- **Hero dinámico**: Aspect ratio adaptativo según dispositivo

## 🔮 Próximas Funcionalidades

- [ ] **Integración con Supabase** para reservas reales
- [ ] **Sistema de notificaciones** por email/SMS
- [ ] **Panel de administración** para gestión de reservas
- [ ] **Galería de obras** de clientes
- [ ] **Sistema de reseñas** y calificaciones
- [ ] **Programa de lealtad** para clientes frecuentes

## 🤝 Contribución

### Cómo Contribuir
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código
- Usar **TypeScript** para todos los componentes
- Seguir las **pautas de diseño** definidas
- Escribir **componentes reutilizables**
- Mantener **accesibilidad** en mente
- Incluir **documentación** para funciones complejas

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Contacto

**Cerámico Arte & Café**
- 📍 **Ubicación**: Plaza Acueducto, Morelia, Mich.
- 📱 **Teléfono**: +52 999 123 4567
- 📧 **Instagram**: [@ceramico_mx](https://www.instagram.com/ceramico_mx)
- 🕒 **Horarios**: Mar-Vie: 10:00-20:00, Dom: 10:00-15:00

---

**Desarrollado con ❤️ por [Docabyte](https://docabyte.com)**

*Una experiencia donde cada pincelada cuenta y cada café es especial.*
