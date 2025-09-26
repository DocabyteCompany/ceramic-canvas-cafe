import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Instagram } from 'lucide-react';
import ceramicoLogo from '../assets/ceramico-logo-white.png';

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

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-terracotta/90 backdrop-blur-md border-b border-terracotta/20' 
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="container mx-auto px-4 py-3">
        <div className="hidden md:grid md:grid-cols-3 items-center">
          {/* Left Navigation */}
          <div className="flex items-center justify-start space-x-6">
            <button 
              onClick={() => scrollToSection('nosotros')}
              className="nav-link"
            >
              Nosotros
            </button>
            <button 
              onClick={() => scrollToSection('experiencia')}
              className="nav-link"
            >
              Experiencia
            </button>
          </div>

          {/* Centered Logo */}
          <div className="flex items-center justify-center">
            <button 
              onClick={() => scrollToSection('inicio')}
              className="hover:scale-105 transition-transform duration-200"
            >
              <img 
                src={ceramicoLogo} 
                alt="Cerámico Logo" 
                className="h-12 w-auto"
              />
            </button>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center justify-end space-x-6">
            <button 
              onClick={() => scrollToSection('contacto')}
              className="nav-link"
            >
              Contacto
            </button>
            <Button 
              onClick={() => scrollToSection('reservaciones')}
              className="btn-ceramica-white-outline"
            >
              Reservar ahora
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex items-center justify-between">
          <button 
            onClick={() => scrollToSection('inicio')}
            className="hover:scale-105 transition-transform duration-200"
          >
            <img 
              src={ceramicoLogo} 
              alt="Cerámico Logo" 
              className="h-10 w-auto"
            />
          </button>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-white hover:text-white/90 transition-all duration-300"
          >
            <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </div>
          </button>
        </div>

        {/* Mobile Menu - Full Screen Overlay */}
        <div className={`md:hidden fixed inset-0 bg-terracotta z-40 transition-transform duration-500 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex flex-col justify-between h-full">
            {/* Top Section - Logo */}
            <div className="flex justify-center pt-16">
              <button 
                onClick={() => scrollToSection('inicio')}
                className="hover:scale-105 transition-transform duration-200"
              >
                <img 
                  src={ceramicoLogo} 
                  alt="Cerámico Logo" 
                  className="h-12 w-auto"
                />
              </button>
            </div>

            {/* Center Section - Navigation Links */}
            <div className="flex-1 flex flex-col justify-center items-center space-y-8 px-6">
              <button 
                onClick={() => scrollToSection('nosotros')}
                className="text-white text-3xl font-medium hover:text-white/80 transition-colors duration-200"
              >
                Nosotros
              </button>
              <button 
                onClick={() => scrollToSection('experiencia')}
                className="text-white text-3xl font-medium hover:text-white/80 transition-colors duration-200"
              >
                Experiencia
              </button>
              <button 
                onClick={() => scrollToSection('contacto')}
                className="text-white text-3xl font-medium hover:text-white/80 transition-colors duration-200"
              >
                Contacto
              </button>
              <Button 
                onClick={() => scrollToSection('reservaciones')}
                className="btn-ceramica-white-outline mt-8 px-8 max-w-xs"
              >
                Reservar ahora
              </Button>
            </div>

            {/* Bottom Section - Instagram Icon */}
            <div className="flex justify-center pb-12">
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-white/80 transition-colors duration-200"
              >
                <Instagram size={32} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;