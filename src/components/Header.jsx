import { useEffect, useState } from 'react';
import { Bell, User, LogOut, Menu, X } from 'lucide-react';

export function Header({ user, onLogout, logo, title, notificationCount = 0 }) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    // Cerrar menú al hacer scroll
    const handleScroll = () => setShowMobileMenu(false);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {logo && (
              <img src={logo} alt="Logo" className="h-8 sm:h-10 w-auto" />
            )}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                {title}
              </h1>
              {user && (
                <p className="text-xs sm:text-sm text-gray-600 truncate">
                  {user.usuario}
                  {user.rol === 'admin' && (
                    <span className="ml-2 inline-block bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-bold">
                      ADMIN
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Notification Bell */}
            {notificationCount > 0 && (
              <div className="relative">
                <button className="text-gray-600 hover:text-blue-600 transition-colors relative p-2 hover:bg-gray-100 rounded-full">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pop-in">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                </button>
              </div>
            )}

            {/* User Info */}
            {user && (
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                  {user.usuario?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden lg:block text-sm">
                  <p className="font-semibold text-gray-800">{user.usuario}</p>
                  <p className="text-gray-500">{user.rol}</p>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center gap-2">
            {notificationCount > 0 && (
              <div className="relative">
                <button className="text-gray-600 p-2 hover:bg-gray-100 rounded-full">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pop-in">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                </button>
              </div>
            )}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="sm:hidden mt-4 pt-4 border-t border-gray-200 animate-fade-in space-y-3">
            {user && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {user.usuario?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-800">{user.usuario}</p>
                  <p className="text-xs text-gray-500">{user.rol}</p>
                </div>
              </div>
            )}
            <button
              onClick={() => {
                onLogout();
                setShowMobileMenu(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export function PageHeader({ title, subtitle, icon: Icon, action, actionLabel }) {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-4 sm:p-6 lg:p-8 -mx-4 sm:-mx-6 lg:-mx-8">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && (
              <div className="p-2 bg-blue-100 rounded-lg">
                <Icon className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{title}</h1>
          </div>
          {subtitle && (
            <p className="text-gray-600 text-sm sm:text-base">{subtitle}</p>
          )}
        </div>
        {action && (
          <button
            onClick={action}
            className="flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 font-semibold shadow-md hover:shadow-lg transform hover:scale-105 whitespace-nowrap"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
