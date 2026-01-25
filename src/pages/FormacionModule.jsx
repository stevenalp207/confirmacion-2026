import { BookOpen } from 'lucide-react';
import FormacionAsistencia from '../components/FormacionAsistencia';

function FormacionModule({ onBack, user }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-indigo-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold">FORMACIÓN</h1>
            <button
              onClick={onBack}
              className="bg-white text-indigo-600 hover:bg-gray-100 px-5 py-3 rounded-lg transition-colors font-semibold text-base sm:text-lg w-full sm:w-auto"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-5 sm:py-6 lg:py-8">
        <div className="bg-white rounded-lg shadow-md p-5 sm:p-6 lg:p-8">
          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              Registro de Asistencia
            </h2>
            <p className="text-base sm:text-lg text-gray-600">
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
