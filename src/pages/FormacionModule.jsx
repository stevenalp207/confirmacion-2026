import { BookOpen } from 'lucide-react';
import FormacionAsistencia from '../components/FormacionAsistencia';

function FormacionModule({ onBack, user }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3 sm:py-0 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={onBack}
                className="hover:bg-indigo-500 px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                ← Atrás
              </button>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Asistencia Formación - Confirmación 2026
              </h1>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 lg:p-6">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Registro de Asistencia
            </h2>
            <p className="text-gray-600">
              Registra la asistencia en las 15 formaciones del retiro
            </p>
          </div>
          
          <FormacionAsistencia user={user} />
        </div>
      </div>
    </div>
  );
}

export default FormacionModule;
