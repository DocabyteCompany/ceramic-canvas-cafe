import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Instagram } from 'lucide-react';
import ceramicoLogoWhite from '../assets/ceramico-logo-white.png';
import imagoTerracotta from '../assets/imago_terracota.png';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('menu-open');
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.classList.remove('menu-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.classList.remove('menu-open');
    };
  }, [isOpen]);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${
      isOpen 
        ? 'bg-transparent backdrop-blur-0 border-transparent'
        : isScrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-terracotta/20' 
          : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="hidden md:grid md:grid-cols-3 items-center">
          {/* Left Navigation */}
          <div className="flex items-center justify-start space-x-6">
            <button 
              onClick={() => scrollToSection('nosotros')}
              className={`nav-link ${isScrolled ? 'nav-link-scrolled' : 'nav-link-transparent'}`}
            >
              Nosotros
            </button>
            <button 
              onClick={() => scrollToSection('experiencia')}
              className={`nav-link ${isScrolled ? 'nav-link-scrolled' : 'nav-link-transparent'}`}
            >
              Experiencia
            </button>
          </div>

          {/* Centered Logo */}
          <div className="flex items-center justify-center">
            <button 
              onClick={() => scrollToSection('inicio')}
              className="hover:scale-105 transition-transform duration-200 logo-container"
            >
              <img 
                src={isScrolled ? imagoTerracotta : ceramicoLogoWhite} 
                alt="Cerámico Logo" 
                className="nav-logo"
              />
            </button>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center justify-end space-x-6">
            <button 
              onClick={() => scrollToSection('contacto')}
              className={`nav-link ${isScrolled ? 'nav-link-scrolled' : 'nav-link-transparent'}`}
            >
              Contacto
            </button>
            <Button 
              onClick={() => scrollToSection('reservaciones')}
              className={isScrolled ? 'btn-ceramica-white-outline' : 'btn-ceramica-white-outline-transparent'}
            >
              Reservar ahora
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between">
          <button 
            onClick={() => scrollToSection('inicio')}
            className="hover:scale-105 transition-transform duration-200 logo-container-mobile"
          >
            <img 
              src={isScrolled ? imagoTerracotta : ceramicoLogoWhite} 
              alt="Cerámico Logo" 
              className="nav-logo-mobile"
            />
          </button>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 transition-all duration-300 ${
              isScrolled 
                ? 'text-terracotta hover:text-terracotta/90' 
                : 'text-white hover:text-white/90'
            }`}
            aria-expanded={isOpen}
            aria-label="Toggle menu"
          >
            <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Full Screen Overlay */}
      <div 
        className={`md:hidden fixed inset-0 z-[1100] mobile-menu-overlay bg-terracotta w-screen h-[100dvh] overflow-y-auto transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="relative h-full flex flex-col">
          {/* Close button - Top Right */}
          <div className="absolute top-6 right-6 z-10">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-terracotta hover:text-terracotta/80 transition-all duration-300"
              aria-label="Close menu"
            >
              <X size={32} />
            </button>
          </div>

          {/* Top Section - Logo */}
          <div className="flex justify-center items-center pt-16 mb-12">
            <button 
              onClick={() => scrollToSection('inicio')}
              className="hover:scale-105 transition-transform duration-200 logo-container-mobile-menu"
            >
              <img 
                src={imagoTerracotta} 
                alt="Cerámico Logo" 
                className="nav-logo-mobile-menu"
              />
            </button>
          </div>

          {/* Center Section - Navigation Links */}
          <div className="flex-1 flex flex-col justify-center items-center space-y-10 px-6 mb-12">
            <button 
              onClick={() => scrollToSection('inicio')}
              className="text-terracotta text-4xl font-bold uppercase hover:text-terracotta/80 transition-colors duration-200 tracking-wide"
            >
              INICIO
            </button>
            <button 
              onClick={() => scrollToSection('nosotros')}
              className="text-terracotta text-4xl font-bold uppercase hover:text-terracotta/80 transition-colors duration-200 tracking-wide"
            >
              NOSOTROS
            </button>
            <button 
              onClick={() => scrollToSection('experiencia')}
              className="text-terracotta text-4xl font-bold uppercase hover:text-terracotta/80 transition-colors duration-200 tracking-wide"
            >
              EXPERIENCIA
            </button>
            <button 
              onClick={() => scrollToSection('contacto')}
              className="text-terracotta text-4xl font-bold uppercase hover:text-terracotta/80 transition-colors duration-200 tracking-wide"
            >
              CONTACTO
            </button>
            <Button 
              onClick={() => scrollToSection('reservaciones')}
              className="btn-ceramica-white-outline mt-8 px-12 py-4 text-xl font-bold uppercase tracking-wide"
            >
              RESERVAR AHORA
            </Button>
          </div>

          {/* Bottom Section - Instagram Icon */}
          <div className="flex justify-center pb-16">
            <a 
              href="https://instagram.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-terracotta hover:text-terracotta/80 transition-colors duration-200"
            >
              <Instagram size={40} />
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;