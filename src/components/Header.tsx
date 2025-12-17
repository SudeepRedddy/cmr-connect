import { useState } from 'react';
import { Menu, X, Search, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { label: 'Home', href: '#home' },
  { 
    label: 'About Us', 
    href: '#about',
    submenu: ['Vision & Mission', 'Management', 'Infrastructure', 'Accreditations']
  },
  { 
    label: 'Academics', 
    href: '#courses',
    submenu: ['B.Tech Programs', 'M.Tech Programs', 'MBA', 'Regulations']
  },
  { 
    label: 'Departments', 
    href: '#departments',
    submenu: ['CSE', 'IT', 'ECE', 'EEE', 'Mechanical', 'Civil', 'MBA']
  },
  { label: 'Placements', href: '#placements' },
  { label: 'Research', href: '#research' },
  { label: 'Contact', href: '#contact' },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground py-2 hidden md:block">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span>EAMCET Code: <strong>CMRK</strong></span>
            <span className="text-primary-foreground/60">|</span>
            <span>UGC Autonomous</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-secondary transition-colors">LMS</a>
            <a href="#" className="hover:text-secondary transition-colors">RTI</a>
            <a href="#" className="hover:text-secondary transition-colors">Virtual Tour</a>
            <a href="#" className="hover:text-secondary transition-colors">AICTE Feedback</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-card/95 backdrop-blur-md shadow-soft">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <a href="#home" className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary">CMR</span>
                <span className="text-xs text-muted-foreground -mt-1">COLLEGE OF ENGINEERING</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 ml-4 pl-4 border-l border-border">
                <div className="flex flex-col items-center px-2">
                  <span className="text-xs font-semibold text-muted-foreground">NAAC</span>
                  <span className="text-lg font-bold text-secondary">A+</span>
                </div>
                <div className="flex flex-col items-center px-2">
                  <span className="text-xs font-semibold text-muted-foreground">Years</span>
                  <span className="text-lg font-bold text-primary">23</span>
                </div>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => (
                <div
                  key={item.label}
                  className="relative group"
                  onMouseEnter={() => setActiveSubmenu(item.label)}
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  <a
                    href={item.href}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                  >
                    {item.label}
                    {item.submenu && <ChevronDown className="w-3 h-3" />}
                  </a>
                  {item.submenu && activeSubmenu === item.label && (
                    <div className="absolute top-full left-0 w-48 bg-card rounded-lg shadow-medium py-2 animate-fade-in">
                      {item.submenu.map((subItem) => (
                        <a
                          key={subItem}
                          href="#"
                          className="block px-4 py-2 text-sm text-foreground hover:bg-muted hover:text-primary transition-colors"
                        >
                          {subItem}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Search className="w-5 h-5" />
              </Button>
              <Button variant="hero" size="default" className="hidden sm:flex">
                Admission Enquiry
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border shadow-medium animate-slide-up">
          <nav className="container mx-auto px-4 py-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block py-3 text-foreground hover:text-primary transition-colors border-b border-border last:border-0"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Button variant="hero" className="w-full mt-4">
              Admission Enquiry
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
