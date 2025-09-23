import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import ceramicoLogo from '../assets/ceramico-logo-new.png';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
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
            <button 
              onClick={() => scrollToSection('galeria')}
              className="nav-link"
            >
              Galería
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
              onClick={() => scrollToSection('menu')}
              className="nav-link"
            >
              Menú
            </button>
            <button 
              onClick={() => scrollToSection('contacto')}
              className="nav-link"
            >
              Contacto
            </button>
            <Button 
              onClick={() => scrollToSection('reservaciones')}
              className="btn-ceramica"
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
            className="p-2 text-foreground hover:text-primary"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <button 
              onClick={() => scrollToSection('nosotros')}
              className="block w-full text-left text-foreground hover:text-primary transition-colors"
            >
              Nosotros
            </button>
            <button 
              onClick={() => scrollToSection('experiencia')}
              className="block w-full text-left text-foreground hover:text-primary transition-colors"
            >
              Experiencia
            </button>
            <button 
              onClick={() => scrollToSection('galeria')}
              className="block w-full text-left text-foreground hover:text-primary transition-colors"
            >
              Galería
            </button>
            <button 
              onClick={() => scrollToSection('menu')}
              className="block w-full text-left text-foreground hover:text-primary transition-colors"
            >
              Menú
            </button>
            <button 
              onClick={() => scrollToSection('contacto')}
              className="block w-full text-left text-foreground hover:text-primary transition-colors"
            >
              Contacto
            </button>
            <Button 
              onClick={() => scrollToSection('reservaciones')}
              className="btn-ceramica w-full mt-4"
            >
              Reservar ahora
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;