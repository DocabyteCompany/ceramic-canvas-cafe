import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import ReservationWizard from '@/components/ReservationWizard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Clock, Users, Palette, Coffee, MapPin, Phone, Instagram, MessageCircle, CheckCircle, Heart, Sparkles, ChevronDown } from 'lucide-react';
import heroImage1 from '@/assets/hero-ceramica-new1.jpg';
import heroImage2 from '@/assets/hero-ceramica-new2.jpg';
import heroImage3 from '@/assets/hero-ceramica-new3.jpg';
import ceramicsWorkshopTools from '@/assets/ceramics-workshop-tools.jpg';
import imagenDestacada from '@/assets/imagen-destacada.png';
import imagenPrincipal from '@/assets/imagen-principal.png';
import imagen2 from '@/assets/imagen-2.jpg';
import imagen3 from '@/assets/imagen-3.png';

import ceramicoLogo from '@/assets/ceramico-logo-new.png';
import Autoplay from 'embla-carousel-autoplay';

const Index = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const heroImages = [
    { src: heroImage1, alt: "Taller de cerámica artesanal" },
    { src: ceramicsWorkshopTools, alt: "Herramientas de cerámica" },
    { src: heroImage3, alt: "Creaciones únicas en cerámica" }
  ];

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


  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section id="inicio" className="relative h-screen w-full overflow-hidden">
        {/* Navigation positioned absolutely over hero */}
        <div className="absolute top-0 left-0 right-0 z-20">
          <Navigation />
        </div>
        
        <div className="relative w-full h-full">
          <Carousel 
            className="w-full h-full"
            plugins={[
              Autoplay({
                delay: 6000,
                stopOnInteraction: false,
                stopOnMouseEnter: true,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
            }}
          >
            <CarouselContent className="h-full">
              {heroImages.map((image, index) => (
                <CarouselItem key={index} className="h-full">
                  <div className="relative h-full">
                     <img 
                      src={image.src} 
                      alt={image.alt}
                      className="w-full h-full object-cover object-center md:object-[center_20%] transition-opacity duration-1000 ease-in-out"
                    />
                    
                    {/* Dark overlay for text legibility */}
                    <div className="absolute inset-0 bg-black/40"></div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
          
          {/* Centered Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4 z-10">
            <h1 
              className="font-display text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-bold leading-tight tracking-tight slide-up-fade mb-6 text-beige/70" 
              style={{animationDelay: '0.2s'}}
            >
              Disfruta y Crea
            </h1>
            <p 
              className="font-body text-lg sm:text-xl md:text-2xl font-light leading-relaxed max-w-2xl slide-up-fade text-beige-dark/60" 
              style={{animationDelay: '0.6s'}}
            >
              La creatividad y el café se encuentran en un solo lugar.
            </p>
          </div>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
            <button 
              onClick={() => scrollToSection('nosotros')}
              className="text-white hover:text-white/80 transition-colors duration-300 group"
              aria-label="Scroll hacia abajo"
            >
              <ChevronDown className="h-8 w-8 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      {/* Acerca de Cerámico */}
      <section id="nosotros" className="section-padding ceramic-texture">
        <div className="container mx-auto px-4">
          {/* Título y Descripción */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start mb-16">
            {/* Título - Left side on desktop */}
            <div className="space-y-2">
              <h2 className="font-display text-5xl md:text-7xl font-bold text-primary leading-none">
                Acerca de
              </h2>
              <h2 className="font-display text-5xl md:text-7xl font-bold text-primary leading-none">
                Cerámico
              </h2>
            </div>

            {/* Descripción - Right side on desktop */}
            <div className="space-y-6 lg:pt-4">
              <p className="text-sm md:text-base text-terracotta/80 leading-relaxed font-medium">
                En Cerámico creemos que la creatividad se mezcla perfectamente con el sabor. 
                Cada pincelada es un momento para ti, un respiro del mundo exterior donde puedes 
                conectar contigo mismo y con tus seres queridos.
              </p>
              
              <p className="text-sm md:text-base text-terracotta/80 leading-relaxed font-medium">
                Nuestro taller es un refugio de paz donde las familias se reúnen, los amigos 
                crean recuerdos y cada persona descubre el artista que lleva dentro. El aroma 
                del café recién hecho acompaña cada creación, convirtiendo cada visita en una 
                experiencia sensorial completa.
              </p>
            </div>
          </div>

          {/* Layout de imágenes - 2 columnas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda - Imagen destacada con toda la altura */}
            <div className="rounded-xl shadow-soft overflow-hidden h-[400px] md:h-[500px]">
              <img 
                src={imagenDestacada} 
                alt="Imagen destacada del taller de cerámica"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Columna derecha - Imagen principal arriba + 2 imágenes horizontales abajo */}
            <div className="space-y-4">
              {/* Imagen principal */}
              <div className="rounded-xl shadow-soft overflow-hidden h-[240px] md:h-[240px]">
                <img 
                  src={imagenPrincipal} 
                  alt="Imagen principal del taller"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>

              {/* Imágenes 2 y 3 lado a lado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl shadow-soft overflow-hidden h-[240px] md:h-[240px]">
                  <img 
                    src={imagen2} 
                    alt="Ambiente del taller de cerámica"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="rounded-xl shadow-soft overflow-hidden h-[240px] md:h-[240px]">
                  <img 
                    src={imagen3} 
                    alt="Creaciones de cerámica"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
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
          <ReservationWizard />
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
                        <p className="text-muted-foreground">Plaza Acueducto, Morelia, Mich.</p>
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
                        <p className="text-muted-foreground">Mar - Vie: 10:00 AM - 8:00 PM, Dom: 10:00 AM - 3:00 PM</p>
                        <p className="text-muted-foreground text-sm">Lunes y Sábados cerrado</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 mt-8">
                    <Button variant="outline" size="sm" className="flex items-center gap-2" asChild>
                      <a href="https://www.instagram.com/ceramico_mx?igsh=ZGhmbXk3c2c4eTBj" target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-4 w-4" />
                        Instagram
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Mapa */}
            <div className="h-96 rounded-2xl overflow-hidden">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d234.7719984506018!2d-101.1749372379003!3d19.697633502308957!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x842d0e08f422531d%3A0x23444ea7533127a8!2sAv%20Acueducto%20902%2C%20Chapultepec%20Nte.%2C%2058260%20Morelia%2C%20Mich.!5e0!3m2!1ses-419!2smx!4v1758754203742!5m2!1ses-419!2smx" 
                width="100%" 
                height="100%" 
                style={{border: 0}} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de Cerámico Arte & Café"
              />
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
                ¿Tienes alguna pregunta? ¡Nuestro equipo está<br className="hidden md:block" /> aquí para ayudarte a vivir una experiencia única!
              </p>
              
              {/* Social Links */}
              <div className="mt-8">
                <div className="flex items-center gap-4 justify-center md:justify-start">
                  <h3 className="font-display text-xl font-bold text-terracotta">Social</h3>
                  <a 
                    href="https://www.instagram.com/ceramico_mx?igsh=ZGhmbXk3c2c4eTBj" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-warm-gray-500 hover:text-terracotta transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                </div>
              </div>
            </div>

            {/* Navigation Columns - 2 Column Layout */}
            <div className="md:col-span-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 md:pl-8 md:ml-auto md:max-w-xl">
              {/* Navigation */}
              <div className="text-center md:text-left">
                <h3 className="font-display text-lg font-bold text-terracotta mb-4">Navegación</h3>
                <ul className="space-y-3">
                  <li>
                     <button 
                      onClick={() => scrollToSection('inicio')}
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium hover:translate-x-1 transform block mx-auto md:mx-0"
                    >
                      Inicio
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('nosotros')}
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium hover:translate-x-1 transform block mx-auto md:mx-0"
                    >
                      Quiénes Somos
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('experiencia')}
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium hover:translate-x-1 transform block mx-auto md:mx-0"
                    >
                      Experiencia
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => scrollToSection('reservaciones')}
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium hover:translate-x-1 transform block mx-auto md:mx-0"
                    >
                      Reservaciones
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
                      href="https://maps.app.goo.gl/RfBAbxjatFm2uQGo9"
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
                      Mar-Vie: 10:00-20:00, Dom: 10:00-15:00
                    </span>
                  </li>
                  <li>
                    <a 
                      href="https://www.instagram.com/ceramico_mx?igsh=ZGhmbXk3c2c4eTBj"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-warm-gray-600 hover:text-terracotta transition-all duration-200 text-sm font-medium flex items-center gap-2 justify-center md:justify-start hover:translate-x-1 transform"
                    >
                      <Instagram className="h-4 w-4 text-olive" />
                      Instagram
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
      <div className="sticky-cta fixed bottom-4 right-4 z-40 md:hidden">
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