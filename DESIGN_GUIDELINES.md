# 🎨 Cerámico Arte & Café - Guía de Diseño

> **IMPORTANTE**: Este archivo debe ser consultado ANTES de realizar cualquier cambio en el proyecto. Contiene las pautas de diseño fundamentales que mantienen la identidad visual y experiencia de usuario de Cerámico.

## 📋 Índice
1. [Filosofía de Diseño](#filosofía-de-diseño)
2. [Paleta de Colores](#paleta-de-colores)
3. [Tipografía](#tipografía)
4. [Componentes UI](#componentes-ui)
5. [Espaciado y Layout](#espaciado-y-layout)
6. [Animaciones y Transiciones](#animaciones-y-transiciones)
7. [Iconografía](#iconografía)
8. [Imágenes y Assets](#imágenes-y-assets)
9. [Responsive Design](#responsive-design)
10. [Reglas de Implementación](#reglas-de-implementación)

---

## 🎯 Filosofía de Diseño

### Principios Fundamentales
- **Warm & Welcoming**: Diseño cálido que invita a la creatividad
- **Artisanal & Authentic**: Refleja la naturaleza artesanal de la cerámica
- **Simple & Intuitive**: Experiencia de usuario clara y sin fricciones
- **Premium & Quality**: Transmite calidad y profesionalismo

### Personalidad de Marca
- **Cálida**: Tonos terrosos y beiges que evocan calidez
- **Creativa**: Elementos que inspiran la expresión artística
- **Acogedora**: Diseño que hace sentir cómodo al usuario
- **Profesional**: Mantiene credibilidad y confianza

---

## 🎨 Paleta de Colores

### Colores Primarios
```css
/* Terracotta - Color principal de marca */
--terracotta: 22 42% 39%;           /* #8B5E3C */
--terracotta-light: 22 42% 50%;     /* Variante más clara */

/* Beige - Color de fondo principal */
--beige: 38 50% 93%;                /* #F5F0E6 */
--beige-dark: 38 30% 85%;           /* Variante más oscura */

/* Olive - Color de acento */
--olive: 54 14% 61%;                /* #A6A48D */
--olive-dark: 54 14% 50%;           /* Variante más oscura */
```

### Colores del Sistema
- **Background**: Beige (#F5F0E6)
- **Foreground**: Warm Gray (#3F3F3F)
- **Card**: Pure White (#FFFFFF)
- **Primary**: Terracotta (#8B5E3C)
- **Secondary**: Olive (#A6A48D)

### Uso de Colores
- **Terracotta**: Botones primarios, elementos de navegación activos, acentos importantes
- **Beige**: Fondos de sección, fondos de tarjetas secundarias
- **Olive**: Estados hover, elementos de información, bordes sutiles
- **White**: Fondos de tarjetas principales, contenido destacado

---

## ✍️ Tipografía

### Fuentes
```css
/* Display - Para títulos y encabezados */
font-family: 'Playfair Display', serif;

/* Body - Para texto general */
font-family: 'Poppins', sans-serif;
```

### Jerarquía Tipográfica
- **H1**: `text-4xl sm:text-5xl md:text-7xl` - Títulos hero
- **H2**: `text-4xl md:text-5xl` - Títulos de sección
- **H3**: `text-2xl` - Subtítulos
- **H4**: `text-lg` - Encabezados de componente
- **Body**: `text-base` - Texto general
- **Small**: `text-sm` - Texto secundario

### Reglas Tipográficas
- **Playfair Display**: Solo para títulos y elementos de marca
- **Poppins**: Para todo el texto del cuerpo y UI
- **Peso**: Regular (400) para texto, Medium (500) para énfasis, Bold (700) para títulos
- **Interlineado**: 1.5 para texto largo, 1.2 para títulos

---

## 🧩 Componentes UI

### Botones

#### Botón Primario (.btn-ceramica)
```css
.btn-ceramica {
  @apply bg-primary text-primary-foreground hover:bg-primary/90 
         px-8 py-4 rounded-lg font-medium transition-all duration-150
         shadow-[0_4px_14px_0_hsl(var(--terracotta)/0.2)]
         hover:shadow-[0_6px_20px_0_hsl(var(--terracotta)/0.3)]
         hover:-translate-y-0.5;
}
```

#### Botón Secundario (.btn-ceramica-outline)
```css
.btn-ceramica-outline {
  @apply border-2 border-primary text-primary bg-transparent
         hover:bg-primary hover:text-primary-foreground
         px-8 py-4 rounded-lg font-medium transition-all duration-150
         hover:-translate-y-0.5;
}
```

### Tarjetas
- **Sombra suave**: `shadow-soft` para tarjetas normales
- **Sombra cálida**: `shadow-warm` para tarjetas destacadas
- **Border radius**: `rounded-2xl` para tarjetas principales
- **Padding**: `p-6` o `p-8` según contenido

### Navegación
```css
.nav-link {
  @apply relative text-foreground font-medium transition-all duration-300 ease-out;
  @apply after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary;
  @apply after:left-0 after:bottom-[-4px] after:scale-x-0 after:origin-right;
  @apply after:transition-transform after:duration-300 after:ease-out;
  @apply hover:text-primary hover:after:scale-x-100 hover:after:origin-left;
}
```

---

## 📏 Espaciado y Layout

### Sistema de Espaciado
- **Secciones**: `py-16 lg:py-24` (section-padding)
- **Contenedores**: `container mx-auto px-4`
- **Grid gaps**: `gap-8` para tarjetas, `gap-12` para secciones
- **Padding interno**: `p-6` para contenido estándar, `p-8` para contenido destacado

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Layout Patterns
- **Hero**: Aspect ratio 16:9 en desktop, 4:5 en mobile
- **Grid**: 1 columna en mobile, 2 en tablet, 3+ en desktop
- **Cards**: Máximo 4xl de ancho, centradas

---

## ✨ Animaciones y Transiciones

### Transiciones Estándar
```css
--transition-smooth: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
```

### Animaciones Personalizadas
- **fade-in**: `animate-fade-in` - Entrada suave
- **slide-up**: `animate-slide-up` - Deslizamiento hacia arriba
- **step-transition**: `animate-step-transition` - Transiciones de pasos

### Efectos Hover
- **Botones**: Elevación sutil (`-translate-y-0.5`)
- **Tarjetas**: Elevación y sombra aumentada
- **Enlaces**: Subrayado animado
- **Imágenes**: Escala suave (`hover:scale-105`)

---

## 🎯 Iconografía

### Librería de Iconos
- **Lucide React**: Iconos consistentes y modernos
- **Tamaños estándar**: 16px, 18px, 20px, 24px
- **Colores**: `text-primary` para iconos activos, `text-muted-foreground` para secundarios

### Iconos Comunes
- **Navegación**: Menu, X, ArrowLeft
- **Reservas**: Calendar, Clock, Users
- **Contacto**: MapPin, Phone, Mail, Instagram
- **UX**: CheckCircle, Heart, Sparkles

---

## 🖼️ Imágenes y Assets

### Hero Images
- **Aspect ratio**: 16:9 (desktop), 4:5 (mobile)
- **Calidad**: Alta resolución, optimizadas para web
- **Estilo**: Cálidas, artesanales, mostrando personas creando

### Logo
- **Versión principal**: `ceramico-logo-new.png`
- **Tamaños**: h-10 (mobile nav), h-12 (desktop nav), h-28 (footer)
- **Efectos**: `hover:scale-105` para interactividad

### Texturas
- **ceramic-texture**: Patrón sutil de fondo con gradientes radiales
- **Uso**: Secciones alternadas para crear profundidad visual

---

## 📱 Responsive Design

### Mobile First
- **Enfoque**: Diseño primero para móvil, luego escalar
- **Navegación**: Hamburger menu en mobile, nav completo en desktop
- **Hero**: Cambio de aspect ratio y layout de contenido
- **Grids**: 1 columna → 2 columnas → 3+ columnas

### Breakpoints Específicos
```css
/* Mobile */
@media (max-width: 768px) {
  .hero-container { aspect-ratio: 4/5; }
}

/* Desktop */
@media (min-width: 768px) {
  .hero-container { aspect-ratio: 16/9; }
}
```

---

## ⚙️ Reglas de Implementación

### ✅ Hacer
- **Siempre usar** las clases CSS personalizadas definidas
- **Mantener consistencia** en espaciado y colores
- **Aplicar animaciones** suaves y naturales
- **Priorizar accesibilidad** (contraste, focus states)
- **Optimizar imágenes** para web
- **Usar TypeScript** para type safety
- **Validar formularios** con mensajes claros

### ❌ No Hacer
- **NO crear** nuevas clases CSS sin consultar esta guía
- **NO usar** colores fuera de la paleta definida
- **NO mezclar** tipografías diferentes
- **NO ignorar** el responsive design
- **NO sobrecargar** con animaciones complejas
- **NO usar** iconos de diferentes librerías

### 🔧 Herramientas de Desarrollo
- **Tailwind CSS**: Para estilos utilitarios
- **shadcn/ui**: Para componentes base
- **Lucide React**: Para iconografía
- **date-fns**: Para manejo de fechas
- **React Hook Form**: Para formularios
- **Zod**: Para validación

### 📁 Estructura de Archivos
```
src/
├── components/
│   ├── ui/           # Componentes base (shadcn/ui)
│   ├── reservation/  # Componentes específicos de reservas
│   └── ...           # Otros componentes
├── assets/           # Imágenes y recursos
├── hooks/            # Custom hooks
├── lib/              # Utilidades
└── pages/            # Páginas principales
```

---

## ✅ Checklist de Cambios

Antes de implementar cualquier cambio, verificar:

- [ ] ¿Usa los colores de la paleta definida?
- [ ] ¿Mantiene la tipografía consistente?
- [ ] ¿Sigue los patrones de espaciado?
- [ ] ¿Incluye estados hover apropiados?
- [ ] ¿Es responsive en todos los breakpoints?
- [ ] ¿Mantiene la accesibilidad?
- [ ] ¿Usa las animaciones definidas?
- [ ] ¿Sigue la estructura de componentes?

---

*Última actualización: Enero 2025*
*Versión: 1.0*
