import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Hexagon, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Artists', path: '/artists' },
    { name: 'Discography', path: '/discography' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
    { name: 'About Us', path: '/about' },
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10">
              <Hexagon className="absolute w-10 h-10 text-slate-300 group-hover:text-white transition-colors duration-300 stroke-[1.5]" />
              <div className="w-4 h-4 bg-white clip-hexagon group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-[0.2em] text-white uppercase leading-none">
                ZEFETO
              </span>
              <span className="text-[10px] font-medium tracking-[0.4em] text-slate-500 uppercase mt-1">
                Music
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-2">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`px-5 py-2 text-xs uppercase tracking-widest font-semibold transition-all duration-300 hover:text-white ${
                  isActive(link.path) 
                    ? 'text-white border-b-2 border-white' 
                    : 'text-slate-500 border-b-2 border-transparent'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action Button & Mobile Toggle */}
          <div className="flex items-center gap-4">
            <Link 
              to="/admin/login" 
              className="hidden md:flex items-center justify-center px-6 py-2.5 bg-white text-black text-xs uppercase tracking-widest font-bold hover:bg-slate-200 transition-all duration-300"
            >
              Management
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-white/5 bg-black/95 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-8 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 text-sm uppercase tracking-widest font-semibold transition-colors ${
                    isActive(link.path)
                      ? 'text-white border-l-2 border-white bg-white/5'
                      : 'text-slate-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 mt-4 border-t border-white/5">
                <Link
                  to="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-4 bg-white text-black font-bold uppercase tracking-widest text-sm"
                >
                  Admin Management
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
