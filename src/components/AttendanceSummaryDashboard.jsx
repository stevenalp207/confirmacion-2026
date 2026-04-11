import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart3, UserX, Users } from 'lucide-react';
import { grupos, gruposData, getCatequesisLabel } from '../data/grupos';
import { supabase } from '../config/supabase';

function AttendanceSummaryDashboard({ maxEnabledCatequesis = 0 }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupSummaries, setGroupSummaries] = useState([]);
  const [globalTopAbsences, setGlobalTopAbsences] = useState([]);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      setError('');

      try {
        const latestCatequesis = Math.max(0, Number(maxEnabledCatequesis) || 0);

        const { data, error: queryError } = await supabase
          .from('asistencias')
          .select('grupo,estudiante_id,catequesis_num,estado')
          .in('grupo', grupos)
          .lte('catequesis_num', latestCatequesis);

        if (queryError) {
          throw queryError;
        }

        const asistenciaMap = {};
        (data || []).forEach((item) => {
          if (!asistenciaMap[item.grupo]) {
            asistenciaMap[item.grupo] = {};
          }

          if (!asistenciaMap[item.grupo][item.estudiante_id]) {
            asistenciaMap[item.grupo][item.estudiante_id] = {};
          }

          asistenciaMap[item.grupo][item.estudiante_id][item.catequesis_num] = item.estado;
        });

        const allStudents = [];
        const summaries = grupos.map((grupo) => {
          const estudiantes = Object.values(gruposData[grupo]?.estudiantes || {});

          const latestStats = {
            presente: 0,
            justificado: 0,
            ausente: 0,
            total: estudiantes.length
          };

          const ranking = estudiantes
            .map((estudiante) => {
              const estudianteId = estudiante.id;
              let ausencias = 0;

              for (let i = 0; i <= latestCatequesis; i += 1) {
                const estado = asistenciaMap[grupo]?.[estudianteId]?.[i] || 'ausente';

                if (estado === 'ausente') {
                  ausencias += 1;
                }

                if (i === latestCatequesis) {
                  if (estado === 'presente') {
                    latestStats.presente += 1;
                  } else if (estado === 'justificado') {
                    latestStats.justificado += 1;
                  } else {
                    latestStats.ausente += 1;
                  }
                }
              }

              const studentSummary = {
                id: estudianteId,
                nombre: estudiante.nombre,
                grupo,
                ausencias,
                porcentajeAusencia: Math.round((ausencias / (latestCatequesis + 1)) * 100)
              };

              allStudents.push(studentSummary);
              return studentSummary;
            })
            .sort((a, b) => {
              if (b.ausencias !== a.ausencias) {
                return b.ausencias - a.ausencias;
              }
              return a.nombre.localeCompare(b.nombre);
            });

          const asistenciaUltimaCatequesis = latestStats.total > 0
            ? Math.round(((latestStats.presente + latestStats.justificado) / latestStats.total) * 100)
            : 0;

          return {
            grupo,
            latestStats,
            asistenciaUltimaCatequesis,
            topAusencias: ranking.slice(0, 3)
          };
        });

        const globalTop = allStudents
          .sort((a, b) => {
            if (b.ausencias !== a.ausencias) {
              return b.ausencias - a.ausencias;
            }
            return a.nombre.localeCompare(b.nombre);
          })
          .slice(0, 10);

        setGroupSummaries(summaries);
        setGlobalTopAbsences(globalTop);
      } catch (err) {
        console.error('Error loading attendance dashboard:', err);
        setError('No se pudo cargar el resumen de asistencia.');
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [maxEnabledCatequesis]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <p className="text-sm sm:text-base text-gray-600">Cargando dashboard de asistencia...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
        <p className="text-red-700 text-sm sm:text-base font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Dashboard Logistica/Admin
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Basado en: {getCatequesisLabel(maxEnabledCatequesis)}
          </p>
        </div>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-semibold">
          <AlertTriangle className="w-4 h-4" />
          Chicos con mas ausencias
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {groupSummaries.map((summary) => (
          <div key={summary.grupo} className="border border-gray-200 rounded-xl p-4 bg-linear-to-br from-slate-50 to-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                {summary.grupo}
              </h3>
              <span className="text-xs sm:text-sm font-semibold text-indigo-700 bg-indigo-100 px-2.5 py-1 rounded-full">
                Asistencia ultima: {summary.asistenciaUltimaCatequesis}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 text-xs sm:text-sm">
              <div className="rounded-lg bg-green-50 p-2 text-green-700 font-semibold text-center">
                Presente: {summary.latestStats.presente}
              </div>
              <div className="rounded-lg bg-yellow-50 p-2 text-yellow-700 font-semibold text-center">
                Justificado: {summary.latestStats.justificado}
              </div>
              <div className="rounded-lg bg-red-50 p-2 text-red-700 font-semibold text-center">
                Ausente: {summary.latestStats.ausente}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold mb-2">
                Top ausencias acumuladas (hasta la ultima desbloqueada)
              </p>
              <div className="space-y-2">
                {summary.topAusencias.map((student) => (
                  <div key={student.id} className="flex items-center justify-between text-sm bg-white border border-gray-100 rounded-lg px-3 py-2">
                    <span className="text-gray-700 font-medium">{student.nombre}</span>
                    <span className="text-red-700 font-bold">
                      {student.ausencias} ({student.porcentajeAusencia}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-gray-200 rounded-xl p-4 bg-slate-50">
        <h3 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          <UserX className="w-4 h-4 text-red-600" />
          Ranking general de ausencias
        </h3>
        <div className="space-y-2">
          {globalTopAbsences.map((student, index) => (
            <div
              key={`${student.grupo}-${student.id}`}
              className="grid grid-cols-[40px_1fr_auto] items-center gap-3 bg-white rounded-lg border border-gray-100 px-3 py-2"
            >
              <span className="text-sm font-bold text-gray-500">#{index + 1}</span>
              <div>
                <p className="text-sm font-semibold text-gray-800">{student.nombre}</p>
                <p className="text-xs text-gray-500">{student.grupo}</p>
              </div>
              <span className="text-sm font-bold text-red-700">{student.ausencias}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AttendanceSummaryDashboard;