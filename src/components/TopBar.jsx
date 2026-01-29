import { useState, useEffect } from 'react';
import { User, LogOut, X, Menu } from 'lucide-react';
import NotificationManager from './NotificationManager';

function TopBar({ user, onLogout, savedAccounts, onSwitchAccount, onRemoveAccount, onToggleMobileSidebar }) {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);

  useEffect(() => {
    if (showSwitcher) {
      const id = requestAnimationFrame(() => setSheetVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setSheetVisible(false);
    }
  }, [showSwitcher]);

  const closeSwitcher = () => {
    setSheetVisible(false);
    setTimeout(() => setShowSwitcher(false), 200);
  };

  const handleSwitch = (usuario) => {
    onSwitchAccount(usuario);
    setShowSwitcher(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm sticky top-0 z-20">
      {/* Mobile Menu Button */}
      <button
        onClick={onToggleMobileSidebar}
        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors duration-150"
        aria-label="Abrir menú"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* User Info */}
      <div className="flex items-center gap-3 flex-1 lg:flex-initial">
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-gray-800">
            {user?.usuario}
          </p>
          <p className="text-xs text-gray-500">
            {user?.rol === 'admin' ? (
              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded font-bold">ADMIN</span>
            ) : user?.rol === 'financiero' ? (
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-bold">FINANCIERO</span>
            ) : user?.rol === 'formacion' ? (
              <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">FORMACIÓN</span>
            ) : user?.usuario === 'logistica' ? (
              <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-bold">LOGÍSTICA</span>
            ) : (
              user?.rol
            )}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <NotificationManager />
        
        {/* Account Switcher */}
        <div className="relative">
          <button
            onClick={() => (showSwitcher ? closeSwitcher() : setShowSwitcher(true))}
            className="p-2 bg-white border border-gray-200 text-gray-800 rounded-lg hover:bg-gray-50 transition"
            title="Cambiar cuenta"
            aria-label="Cambiar cuenta"
          >
            <User className="w-5 h-5" />
          </button>

          {showSwitcher && (
            <>
              {/* Desktop backdrop */}
              <div
                className="hidden sm:block fixed inset-0 z-40"
                onClick={closeSwitcher}
              />
              {/* Desktop dropdown */}
              <div
                className="hidden sm:block absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-2xl z-50"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Cuentas guardadas</span>
                  <button
                    onClick={closeSwitcher}
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="Cerrar selector"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
                  {savedAccounts.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No hay cuentas guardadas
                    </p>
                  ) : (
                    savedAccounts.map((account, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-2 rounded-lg transition ${
                          account.usuario === user?.usuario
                            ? 'bg-blue-50 border border-blue-200'
                            : 'hover:bg-gray-50 border border-transparent'
                        }`}
                      >
                        <button
                          onClick={() => handleSwitch(account.usuario)}
                          className="flex-1 text-left"
                        >
                          <p className="text-sm font-medium text-gray-900">{account.usuario}</p>
                          <p className="text-xs text-gray-500">{account.rol}</p>
                        </button>
                        {account.usuario !== user?.usuario && (
                          <button
                            onClick={() => onRemoveAccount(account.usuario)}
                            className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
                            title="Eliminar cuenta"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
                <div className="p-3 border-t border-gray-100">
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar sesión
                  </button>
                </div>
              </div>

              {/* Mobile bottom sheet */}
              <div
                className="sm:hidden fixed inset-0 bg-black/30 flex items-end z-50"
                onClick={closeSwitcher}
              >
                <div
                  className={`w-full bg-white rounded-t-2xl transition-transform duration-200 ${
                    sheetVisible ? 'translate-y-0' : 'translate-y-full'
                  }`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Cuentas guardadas</span>
                    <button
                      onClick={closeSwitcher}
                      className="text-gray-400 hover:text-gray-600"
                      aria-label="Cerrar selector"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-2 max-h-96 overflow-y-auto">
                    {savedAccounts.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-8">
                        No hay cuentas guardadas
                      </p>
                    ) : (
                      savedAccounts.map((account, index) => (
                        <div
                          key={index}
                          className={`flex items-center justify-between p-3 rounded-lg transition ${
                            account.usuario === user?.usuario
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                        >
                          <button
                            onClick={() => handleSwitch(account.usuario)}
                            className="flex-1 text-left"
                          >
                            <p className="text-sm font-medium text-gray-900">{account.usuario}</p>
                            <p className="text-xs text-gray-500">{account.rol}</p>
                          </button>
                          {account.usuario !== user?.usuario && (
                            <button
                              onClick={() => onRemoveAccount(account.usuario)}
                              className="ml-2 p-2 text-red-500 hover:bg-red-50 rounded"
                              title="Eliminar cuenta"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100">
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition font-medium"
                    >
                      <LogOut className="w-5 h-5" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
