import { useState } from 'react';
import { Menu, X } from 'lucide-react';

/**
 * Menú mobile con animación de hamburguesa
 */
export default function MobileMenu({ children, trigger }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      {trigger ? (
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Abrir menú"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      ) : null}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}

      {/* Menu content */}
      <div
        className={`fixed top-0 left-0 h-screen w-64 bg-white shadow-xl transform transition-transform duration-300 z-50 md:relative md:h-auto md:w-auto md:bg-transparent md:shadow-none md:transform-none overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="md:hidden p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Menú</h3>
          <button
            onClick={closeMenu}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="p-4 md:p-0 md:flex md:items-center md:gap-4">
          {typeof children === 'function' ? children(closeMenu) : children}
        </nav>
      </div>
    </>
  );
}
