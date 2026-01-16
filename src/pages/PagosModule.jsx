import { useState, useEffect } from "react";
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

  // Cargar automáticamente el grupo si el usuario no es admin ni logística
  useEffect(() => {
    if (user && user.rol !== "admin" && user.usuario !== "logistica" && user.rol !== "financiero" && !currentGroup) {
      setCurrentGroup(user.rol);
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
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 sm:py-0 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={onBack}
                className="hover:bg-blue-500 px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                ← Atrás
              </button>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold">
                Pagos del Retiro - Confirmación 2026
              </h1>
            </div>

            <div className="w-full sm:w-auto">
              <select
                value={currentGroup}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full sm:w-auto bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm sm:text-base border border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
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
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
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
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                Grupo: {currentGroup}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {currentGroup === "Catequistas"
                  ? "Registra los pagos del retiro de los catequistas (₡15.000 por catequista)"
                  : "Registra los pagos del retiro de los estudiantes (₡50.000 por estudiante)"}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
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
