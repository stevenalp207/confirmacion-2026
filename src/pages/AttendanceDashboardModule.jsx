import { useEffect, useState } from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import AttendanceSummaryDashboard from '../components/AttendanceSummaryDashboard';
import { numeroCatequesis, getCatequesisLabel } from '../data/grupos';
import { supabase } from '../config/supabase';

const GLOBAL_UNLOCK_KEY = 'GLOBAL';

function AttendanceDashboardModule({ onBack, user }) {
  const [maxEnabledCatequesis, setMaxEnabledCatequesis] = useState(0);

  useEffect(() => {
    const loadUnlockState = async () => {
      try {
        const { data, error } = await supabase
          .from('asistencia_desbloqueo')
          .select('max_enabled_catequesis')
          .eq('grupo', GLOBAL_UNLOCK_KEY)
          .maybeSingle();

        if (error) {
          console.error('Error loading unlock state:', error);
          setMaxEnabledCatequesis(0);
          return;
        }

        const value = typeof data?.max_enabled_catequesis === 'number' ? data.max_enabled_catequesis : 0;
        setMaxEnabledCatequesis(Math.max(0, Math.min(value, numeroCatequesis - 1)));
      } catch (error) {
        console.error('Error loading unlock state:', error);
        setMaxEnabledCatequesis(0);
      }
    };

    loadUnlockState();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver al Menú Principal
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                Dashboard de Asistencia
              </h1>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                Resumen general por grupo y ranking de ausencias
              </p>
              <p className="text-gray-600 text-xs sm:text-sm mt-2">
                Última catequesis desbloqueada: <span className="font-semibold">{getCatequesisLabel(maxEnabledCatequesis)}</span>
              </p>
              {user && (
                <p className="text-gray-600 text-xs sm:text-sm mt-1">
                  Usuario: <span className="font-semibold">{user.usuario}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        <AttendanceSummaryDashboard maxEnabledCatequesis={maxEnabledCatequesis} />
      </div>
    </div>
  );
}

export default AttendanceDashboardModule;