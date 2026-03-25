import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Cpu, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from './ThemeToggle';

const navLinks = [
  { name: 'Services', href: '#services' },
  { name: 'Products', href: '#products' },
  { name: 'Contact', href: '#contact' },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Cpu className="w-10 h-10 text-primary animate-pulse-glow" />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-xl tracking-wider text-foreground">
                DOMAIN
              </span>
              <span className="font-display text-xs tracking-[0.3em] text-primary">
                COMPUTERS
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium text-sm tracking-wide relative group"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Right side actions */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <Button variant="glow" size="lg" onClick={() => navigate('/auth')} className="gap-2">
              <LogIn className="w-4 h-4" />
              Staff Login
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              className="text-foreground p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-border/50 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium py-2"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpen(false);
                    document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {link.name}
                </a>
              ))}
              <Button variant="glow" className="mt-2 gap-2" onClick={() => { navigate('/auth'); setIsOpen(false); }}>
                <LogIn className="w-4 h-4" />
                Staff Login
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
