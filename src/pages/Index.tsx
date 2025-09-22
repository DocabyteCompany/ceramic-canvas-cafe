import Navigation from '@/components/Navigation';
import ReservationForm from '@/components/ReservationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Users, Palette, Coffee, MapPin, Phone, Instagram, MessageCircle, CheckCircle, Heart, Sparkles } from 'lucide-react';
import heroImage from '@/assets/hero-ceramica.jpg';
import ceramicsCollection from '@/assets/ceramicas-collection.jpg';
import paintingProcess from '@/assets/painting-process.jpg';
import ceramicoLogo from '@/assets/ceramico-logo.png';

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
      <footer className="ceramic-texture border-t border-border/20">
        <div className="container mx-auto px-4 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 mb-12">
            
            {/* Logo & CTA Column */}
            <div className="lg:col-span-1">
              <div className="mb-6">
                <img 
                  src={ceramicoLogo} 
                  alt="Cerámico, Arte & Café logo" 
                  className="h-12 mb-4"
                />
                <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                  ¿Tienes alguna pregunta? ¡Nuestro equipo está aquí para ayudarte a vivir una experiencia única!
                </p>
                <Button 
                  onClick={() => scrollToSection('contacto')}
                  variant="outline" 
                  className="w-full md:w-auto border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Contáctanos
                </Button>
              </div>
            </div>

            {/* Navigation Column */}
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Navegación</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => scrollToSection('hero')}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Inicio
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('nosotros')}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Quiénes Somos
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('experiencia')}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Experiencia
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('galeria')}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Galería
                  </button>
                </li>
              </ul>
            </div>

            {/* Experience Column */}
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Experiencia</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => scrollToSection('reservaciones')}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Reservaciones
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('menu')}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Menú
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('galeria')}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Proceso de Cerámica
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Column */}
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground mb-4">Contacto</h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => scrollToSection('contacto')}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Ubicación
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => scrollToSection('contacto')}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    Horarios
                  </button>
                </li>
                <li>
                  <a 
                    href="https://wa.me/5219995555555" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/20">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-muted-foreground text-sm text-center md:text-left">
                Copyright © 2025 | All Rights Reserved to Cerámico, Arte & Café | Web Design by Docabyte
              </p>
              <div className="flex items-center gap-4">
                <a 
                  href="https://instagram.com/ceramico_arte_cafe" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Síguenos en Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.017 0C8.396 0 7.929.013 6.71.072 5.493.131 4.73.333 4.058.63c-.68.3-1.18.66-1.72 1.2-.54.54-.9 1.04-1.2 1.72-.297.672-.499 1.435-.558 2.652C.013 7.929 0 8.396 0 12.017c0 3.624.013 4.09.072 5.311.059 1.217.261 1.98.558 2.652.3.68.66 1.18 1.2 1.72.54.54 1.04.9 1.72 1.2.672.297 1.435.499 2.652.558C7.929 23.987 8.396 24 12.017 24c3.624 0 4.09-.013 5.311-.072 1.217-.059 1.98-.261 2.652-.558a4.994 4.994 0 001.72-1.2c.54-.54.9-1.04 1.2-1.72.297-.672.499-1.435.558-2.652.059-1.22.072-1.687.072-5.311 0-3.621-.013-4.088-.072-5.309-.059-1.217-.261-1.98-.558-2.652a4.994 4.994 0 00-1.2-1.72c-.54-.54-1.04-.9-1.72-1.2-.672-.297-1.435-.499-2.652-.558C16.107.013 15.64 0 12.017 0zM12.017 2.163c3.204 0 3.584.012 4.849.07 1.366.062 2.633.336 3.608 1.311.975.975 1.249 2.242 1.311 3.608.058 1.265.07 1.645.07 4.849 0 3.204-.012 3.584-.07 4.849-.062 1.366-.336 2.633-1.311 3.608-.975.975-2.242 1.249-3.608 1.311-1.265.058-1.645.07-4.849.07-3.204 0-3.584-.012-4.849-.07-1.366-.062-2.633-.336-3.608-1.311-.975-.975-1.249-2.242-1.311-3.608-.058-1.265-.07-1.645-.07-4.849 0-3.204.012-3.584.07-4.849.062-1.366.336-2.633 1.311-3.608.975-.975 2.242-1.249 3.608-1.311 1.265-.058 1.645-.07 4.849-.07z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M12.017 5.838a6.18 6.18 0 100 12.36 6.18 6.18 0 000-12.36zM12.017 16a4 4 0 110-8 4 4 0 010 8z" clipRule="evenodd" />
                    <circle cx="18.406" cy="5.595" r="1.44" />
                  </svg>
                </a>
                <a 
                  href="https://wa.me/5219995555555" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                  aria-label="Contáctanos por WhatsApp"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                </a>
              </div>
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