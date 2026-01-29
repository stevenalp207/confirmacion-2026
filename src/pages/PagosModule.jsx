import { useState, useEffect } from "react";
import { ArrowLeft, DollarSign } from "lucide-react";
import { grupos } from "../data/grupos";
import { nombresCatequistas } from "../data/catequistas";
import Pagos from "../components/Pagos";
import { gruposData } from "../data/grupos";

function PagosModule({ onBack, user }) {
  const [currentGroup, setCurrentGroup] = useState("");
  const [estudiantes, setEstudiantes] = useState(null);
  const [catequistas, setCatequistas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filtrar grupos según el rol del usuario
  // admin y financiero pueden ver todos los grupos
  const gruposDisponibles =
    user?.rol === "admin" || user?.rol === "financiero"
      ? ["Catequistas", ...grupos]
      : [user?.rol]; // Usuarios de grupos específicos ven solo su grupo

  // Manejar navegación del historial para grupos
  useEffect(() => {
    const handlePopState = (event) => {
      const state = event.state;
      if (state?.group && gruposDisponibles.includes(state.group)) {
        setCurrentGroup(state.group);
      } else if (state?.module === 'pagos' && !state?.group) {
        const defaultGroup = user?.rol !== "admin" && user?.usuario !== "logistica" && user?.rol !== "financiero" 
          ? user?.rol 
          : "";
        setCurrentGroup(defaultGroup);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Restaurar grupo del historial si existe
    const currentState = window.history.state;
    if (currentState?.group && gruposDisponibles.includes(currentState.group)) {
      setCurrentGroup(currentState.group);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, gruposDisponibles]);

  // Cargar automáticamente el grupo si el usuario no es admin ni logística
  useEffect(() => {
    if (user && user.rol !== "admin" && user.usuario !== "logistica" && user.rol !== "financiero" && !currentGroup) {
      const defaultGroup = user.rol;
      setCurrentGroup(defaultGroup);
      
      // Actualizar historial con el grupo predeterminado
      if (window.history.state?.module === 'pagos') {
        window.history.replaceState(
          { module: 'pagos', group: defaultGroup },
          '',
          '#pagos'
        );
      }
    }
  }, [user, currentGroup]);

  useEffect(() => {
    if (currentGroup) {
      loadEstudiantes(currentGroup);
    }
  }, [currentGroup]);

  const loadEstudiantes = (grupo) => {
    setLoading(true);
    try {
      if (grupo === "Catequistas") {
        setCatequistas(nombresCatequistas);
        setEstudiantes(null);
      } else {
        setEstudiantes(gruposData[grupo]?.estudiantes || {});
        setCatequistas([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setEstudiantes({});
      setCatequistas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (grupo) => {
    setCurrentGroup(grupo);
    
    // Agregar cambio de grupo al historial
    window.history.pushState(
      { module: 'pagos', group: grupo },
      '',
      `#pagos`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver al Menú Principal
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
                <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                Pagos
              </h1>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                Control de pagos del retiro (₡50.000 por estudiante)
              </p>
              {user && (
                <p className="text-gray-600 text-xs sm:text-sm mt-2">
                  Usuario: <span className="font-semibold">{user.usuario}</span>
                </p>
              )}
            </div>

            {/* Selector de grupo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Grupo
              </label>
              <select
                value={currentGroup}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full sm:w-auto bg-white text-gray-900 px-3 sm:px-4 py-2.5 rounded-lg text-sm sm:text-base border-2 border-gray-300 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all font-medium shadow-sm"
              >
                <option value="">Seleccionar Grupo</option>
                {gruposDisponibles.map((grupo) => (
              <option key={grupo} value={grupo}>
                {grupo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {!currentGroup ? (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
              Módulo de Pagos
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 text-center">
              Selecciona un grupo para controlar los pagos del retiro
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {gruposDisponibles.map((grupo) => (
                <button
                  key={grupo}
                  onClick={() => handleGroupChange(grupo)}
                  className="p-3 sm:p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-300 rounded-lg hover:border-indigo-500 hover:shadow-lg transition-all transform hover:scale-105 text-left"
                >
                  <div className="font-semibold text-gray-800 text-base sm:text-lg">{grupo}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Click para acceder</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
                  <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  Grupo: {currentGroup}
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  {currentGroup === "Catequistas"
                    ? "Registra los pagos del retiro de los catequistas (₡50.000 por catequista)"
                    : "Registra los pagos del retiro de los estudiantes (₡50.000 por estudiante)"}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6">
              {loading ? (
                <div className="flex justify-center items-center p-8">
                  <div className="text-gray-600 text-sm sm:text-base">Cargando datos...</div>
                </div>
              ) : (
                <Pagos
                  grupo={currentGroup}
                  estudiantes={estudiantes}
                  catequistas={catequistas}
                  esCatequistas={currentGroup === "Catequistas"}
                  user={user}
                />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PagosModule;
