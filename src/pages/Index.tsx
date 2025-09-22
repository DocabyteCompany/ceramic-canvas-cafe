import Navigation from '@/components/Navigation';
import ReservationForm from '@/components/ReservationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, Palette, Coffee, MapPin, Phone, Instagram, MessageCircle, CheckCircle, Heart, Sparkles } from 'lucide-react';
import heroImage from '@/assets/hero-ceramica.jpg';
import ceramicsCollection from '@/assets/ceramicas-collection.jpg';
import paintingProcess from '@/assets/painting-process.jpg';
import ceramicoLogo from '@/assets/ceramico-logo-new.png';

const Index = () => {
  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  const importantInfo = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Duración de la sesión",
      description: "Cada reserva dura 1 hora y 45 minutos, tiempo perfecto para crear tu obra maestra."
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Proceso de esmaltado",
      description: "Las piezas deben dejarse de 1 a 3 semanas para esmaltado y horneado profesional."
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Para recoger tu pieza",
      description: "Debes mostrar una foto de la misma. Las piezas se guardan por 30 días después de estar listas."
    },
    {
      icon: <Coffee className="h-6 w-6" />,
      title: "Bebidas y postres",
      description: "No incluidos en el precio de la cerámica. Disfruta nuestro menú por separado."
    }
  ];

  const menuItems = [
    {
      category: "Cafés Especiales",
      items: [
        { name: "Café de Olla", price: "$45", description: "Con canela y piloncillo" },
        { name: "Cappuccino Artesanal", price: "$65", description: "Con espuma cremosa" },
        { name: "Latte de Vainilla", price: "$70", description: "Con extracto natural" }
      ]
    },
    {
      category: "Postres Caseros",
      items: [
        { name: "Cheesecake de Frutos Rojos", price: "$85", description: "Cremoso y fresco" },
        { name: "Brownie Tibio", price: "$75", description: "Con helado de vainilla" },
        { name: "Galletas Artesanales", price: "$35", description: "Recién horneadas" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section id="inicio" className="relative h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-overlay"></div>
        </div>
        
        <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
          <div className="font-display text-6xl md:text-8xl font-bold mb-6 animate-fade-in">
            Cerámico
          </div>
          <h1 className="font-display text-4xl md:text-6xl font-medium mb-6 animate-slide-up">
            Crea, pinta y disfruta
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light animate-slide-up opacity-90">
            Vive una experiencia única: café, postres y arte en un solo lugar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
            <Button 
              onClick={() => scrollToSection('reservaciones')}
              size="lg"
              className="btn-ceramica text-lg px-8 py-6"
            >
              Reservar ahora
            </Button>
            <Button 
              onClick={() => scrollToSection('nosotros')}
              variant="outline"
              size="lg"
              className="btn-ceramica-outline text-lg px-8 py-6"
            >
              Conoce nuestra experiencia
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-75">
            Reserva tu lugar y crea tu próxima obra maestra
          </p>
        </div>
      </section>

      {/* Quiénes Somos */}
      <section id="nosotros" className="section-padding ceramic-texture">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-6">
                Más que una cafetería, un espacio para expresarte
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                En Cerámico creemos que la creatividad se mezcla perfectamente con el sabor. 
                Cada pincelada es un momento para ti, un respiro del mundo exterior donde puedes 
                conectar contigo mismo y con tus seres queridos.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nuestro taller es un refugio de paz donde las familias se reúnen, los amigos 
                crean recuerdos y cada persona descubre el artista que lleva dentro. El aroma 
                del café recién hecho acompaña cada creación, convirtiendo cada visita en una 
                experiencia sensorial completa.
              </p>
              <div className="flex items-center gap-2 text-primary font-medium">
                <Heart className="h-5 w-5" />
                <span>Aquí la creatividad se mezcla con el sabor, cada pincelada es un momento para ti.</span>
              </div>
            </div>
            <div className="relative">
              <img 
                src={ceramicsCollection} 
                alt="Colección de piezas de cerámica artesanales" 
                className="rounded-2xl shadow-warm w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Antes de Reservar */}
      <section id="experiencia" className="section-padding bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Antes de empezar
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Conoce estos detalles para que tu experiencia sea perfecta
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {importantInfo.map((info, index) => (
              <Card key={index} className="border-border/50 shadow-soft hover:shadow-warm transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 p-3 rounded-full bg-primary/10 text-primary">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        {info.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {info.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-12">
            <div className="flex items-center justify-center gap-2 text-primary font-medium">
              <Sparkles className="h-5 w-5" />
              <span>Tu pieza será única, igual que el momento que vivas al crearla.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Reservaciones */}
      <section id="reservaciones" className="section-padding ceramic-texture">
        <div className="container mx-auto px-4">
          <ReservationForm />
        </div>
      </section>

      {/* Galería & Testimonios */}
      <section id="galeria" className="section-padding bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Momentos que ya han cobrado vida
            </h2>
            <p className="text-xl text-muted-foreground">
              Descubre la inspiración de quienes ya pintaron con nosotros
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="relative group overflow-hidden rounded-2xl">
              <img 
                src={paintingProcess} 
                alt="Proceso de pintura de cerámica" 
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative group overflow-hidden rounded-2xl">
              <img 
                src={ceramicsCollection} 
                alt="Piezas terminadas" 
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="relative group overflow-hidden rounded-2xl">
              <img 
                src={heroImage} 
                alt="Taller de cerámica" 
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          {/* Testimonios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border-border/50">
              <CardContent className="p-6">
                <p className="text-muted-foreground italic mb-4">
                  "Una experiencia maravillosa. El ambiente es súper relajante y el café delicioso. 
                  Mi hija y yo pasamos una tarde increíble creando juntas."
                </p>
                <div className="font-medium text-foreground">— María González</div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-6">
                <p className="text-muted-foreground italic mb-4">
                  "Perfecto para una cita diferente. Nos encantó poder crear algo único mientras 
                  disfrutábamos de un cappuccino perfecto."
                </p>
                <div className="font-medium text-foreground">— Carlos y Ana</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Menú de Café y Postres */}
      <section id="menu" className="section-padding ceramic-texture">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Acompaña tu creatividad
            </h2>
            <p className="text-xl text-muted-foreground mb-2">
              Con un sabor especial
            </p>
            <p className="text-sm text-muted-foreground">
              Los alimentos y bebidas se pagan por separado
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {menuItems.map((category, categoryIndex) => (
              <Card key={categoryIndex} className="border-border/50 shadow-soft">
                <CardContent className="p-8">
                  <h3 className="font-display text-2xl font-bold text-primary mb-6 text-center">
                    {category.category}
                  </h3>
                  <div className="space-y-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                        <div className="font-bold text-primary ml-4">{item.price}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Nuestros postres y bebidas son el complemento perfecto para tu experiencia
            </p>
          </div>
        </div>
      </section>

      {/* Contacto y Ubicación */}
      <section id="contacto" className="section-padding bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-primary mb-4">
              Visítanos
            </h2>
            <p className="text-xl text-muted-foreground">
              Déjate inspirar por el aroma del café y la magia de la cerámica
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Información de Contacto */}
            <div className="space-y-8">
              <Card className="border-border/50 shadow-soft">
                <CardContent className="p-8">
                  <h3 className="font-display text-2xl font-bold text-primary mb-6">
                    Información de Contacto
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Dirección</p>
                        <p className="text-muted-foreground">Calle Artesanos 123, Centro, Ciudad</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Teléfono</p>
                        <p className="text-muted-foreground">+52 999 123 4567</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="font-medium text-foreground">Horarios</p>
                        <p className="text-muted-foreground">Mar - Dom: 10:00 AM - 7:00 PM</p>
                        <p className="text-muted-foreground text-sm">Lunes cerrado</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Mapa */}
            <div className="h-96 bg-muted rounded-2xl flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Mapa interactivo próximamente
                </p>
                <Button className="mt-4 btn-ceramica">
                  Cómo llegar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-beige border-t border-warm-gray-200">
        <div className="container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-6 relative">
            {/* Logo and Description */}
            <div className="md:col-span-6 text-center md:text-left relative md:border-r md:border-warm-gray-300 md:pr-8">
              <img 
                src={ceramicoLogo} 
                alt="Cerámico, Arte & Café logo" 
                className="h-28 mb-6 mx-auto md:mx-0 transition-transform duration-300 hover:scale-105"
              />
              <p className="text-warm-gray-700 mb-8 text-base leading-relaxed font-medium">
                ¿Tienes alguna pregunta? ¡Nuestro equipo está aquí para ayudarte a vivir una experiencia única!
              </p>
              
              {/* Social Links */}
              <div className="mt-8">
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <h3 className="font-display text-xl font-bold text-terracotta">Social</h3>
                  <a 
                    href="https://instagram.com/ceramico_arte_cafe" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-warm-gray-500 hover:text-terracotta transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                  <a 
                    href="https://wa.me/573001234567" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-warm-gray-500 hover:text-terracotta transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Columns - Compact and Right Aligned */}
            <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-8 md:pl-8 md:ml-auto md:max-w-2xl">
              {/* Navigation */}
              <div className="text-center md:text-left">
                <h3 className="font-display text-lg font-bold text-terracotta mb-4">Navegación</h3>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={() => scrollToSection('hero')}
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium hover:translate-x-1 transform block"
                    >
                      Inicio
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('nosotros')}
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium hover:translate-x-1 transform block"
                    >
                      Quiénes Somos
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('experiencia')}
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium hover:translate-x-1 transform block"
                    >
                      Experiencia
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('galeria')}
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium hover:translate-x-1 transform block"
                    >
                      Galería
                    </button>
                  </li>
                </ul>
              </div>

              {/* Experience */}
              <div className="text-center md:text-left">
                <h3 className="font-display text-lg font-bold text-terracotta mb-4">Experiencia</h3>
                <ul className="space-y-3">
                  <li>
                    <button 
                      onClick={() => scrollToSection('reservaciones')}
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium hover:translate-x-1 transform block"
                    >
                      Reservaciones
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('menu')}
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium hover:translate-x-1 transform block"
                    >
                      Menú
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('galeria')}
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium hover:translate-x-1 transform block"
                    >
                      Proceso de Cerámica
                    </button>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div className="text-center md:text-left">
                <h3 className="font-display text-lg font-bold text-terracotta mb-4">Contacto</h3>
                <ul className="space-y-3">
                  <li>
                    <a 
                      href="https://maps.google.com/?q=Cra+45+%2326-85,+Bogotá"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium flex items-center gap-2 justify-center md:justify-start hover:translate-x-1 transform"
                    >
                      <MapPin className="h-4 w-4 text-olive" />
                      Ubicación
                    </a>
                  </li>
                  <li>
                    <span className="text-warm-gray-600 text-sm font-medium flex items-center gap-2 justify-center md:justify-start">
                      <Clock className="h-4 w-4 text-olive" />
                      Lun-Dom: 9:00-22:00
                    </span>
                  </li>
                  <li>
                    <a 
                      href="https://wa.me/573001234567"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium flex items-center gap-2 justify-center md:justify-start hover:translate-x-1 transform"
                    >
                      <MessageCircle className="h-4 w-4 text-olive" />
                      WhatsApp
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-warm-gray-300 bg-warm-gray-100">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
              <p className="text-sm text-warm-gray-600 text-center sm:text-left font-medium">
                Designed by Docabyte
              </p>
              <p className="text-sm text-warm-gray-600 text-center sm:text-right font-medium">
                © 2025 | All Rights Reserved to Cerámico, Arte & Café
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky CTA */}
      <div className="fixed bottom-4 right-4 z-40 md:hidden">
        <Button 
          onClick={() => scrollToSection('reservaciones')}
          className="btn-ceramica shadow-warm"
          size="lg"
        >
          Reservar
        </Button>
      </div>
    </div>
  );
};

export default Index;