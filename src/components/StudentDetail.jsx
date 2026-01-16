import { useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

function StudentDetail({ grupo, estudianteId, estudiante, user }) {
  const [asistencias, setAsistencias] = useState({});
  const [documentos, setDocumentos] = useState({});
  const [pagos, setPagos] = useState({});
  const [notas, setNotas] = useState('');
  const [editandoNotas, setEditandoNotas] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [fechasAsistencia, setFechasAsistencia] = useState([]);

  useEffect(() => {
    loadAllData();
  }, [estudianteId, grupo]);

  const loadAllData = async () => {
    try {
      setLoadingData(true);

      // Cargar asistencias
      const { data: asistenciasData } = await supabase
        .from('asistencias')
        .select('*')
        .eq('estudiante_id', estudianteId)
        .eq('grupo', grupo);

      if (asistenciasData) {
        const asistObj = {};
        const fechas = [];
        asistenciasData.forEach(a => {
          asistObj[a.fecha] = a.estado;
          if (!fechas.includes(a.fecha)) {
            fechas.push(a.fecha);
          }
        });
        // Ordenar fechas
        fechas.sort();
        setFechasAsistencia(fechas);
        setAsistencias(asistObj);
      }

      // Cargar documentos
      const { data: documentosData } = await supabase
        .from('documentos_entregados')
        .select('*')
        .eq('estudiante_id', estudianteId)
        .eq('grupo', grupo);

      if (documentosData) {
        const docObj = {};
        documentosData.forEach(d => {
          docObj[d.tipo_documento] = d.entregado;
        });
        setDocumentos(docObj);
      }

      // Cargar pagos
      const { data: pagosData } = await supabase
        .from('pagos_retiro')
        .select('*')
        .eq('estudiante_id', estudianteId)
        .eq('grupo', grupo)
        .single();

      if (pagosData) {
        setPagos(pagosData);
      }

      // Cargar notas
      const { data: notasData } = await supabase
        .from('notas_estudiantes')
        .select('notas')
        .eq('estudiante_id', estudianteId)
        .eq('grupo', grupo)
        .single();

      if (notasData) {
        setNotas(notasData.notas || '');
      }
    } catch (error) {
      console.error('Error loading student data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSaveNotas = async () => {
    try {
      const { error } = await supabase
        .from('notas_estudiantes')
        .upsert({
          estudiante_id: estudianteId,
          grupo: grupo,
          notas: notas
        });

      if (error) {
        console.error('Error:', error);
        alert('Error al guardar notas: ' + error.message);
      } else {
        setEditandoNotas(false);
        alert('Notas guardadas correctamente');
      }
    } catch (error) {
      console.error('Error saving notas:', error);
      alert('Error al guardar notas');
    }
  };

  const asistenciaCount = Object.values(asistencias).filter(a => a === 'presente').length;
  const documentosCount = Object.values(documentos).filter(d => d === true).length;
  const pagoCuota = pagos?.monto_pagado || 0;
  const totalJueves = fechasAsistencia.length; // Sin valor por defecto

  if (loadingData) {
    return <div className="text-gray-600">Cargando datos del estudiante...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Información del estudiante */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg">
        <div className="flex items-start justify-between mb-3 sm:mb-4 gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-1 sm:mb-2 break-words">{estudiante.nombre}</h2>
            <p className="text-blue-100 text-sm sm:text-base lg:text-lg">Estudiante de {grupo}</p>
          </div>
          <div className="text-3xl sm:text-4xl lg:text-5xl flex-shrink-0">👨‍🎓</div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-blue-400">
          <div>
            <p className="text-blue-100 text-xs sm:text-sm uppercase tracking-wide">ID</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{estudianteId}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs sm:text-sm uppercase tracking-wide">Grupo</p>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold">{grupo}</p>
          </div>
        </div>
      </div>

      {/* Resumen de estado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Asistencia */}
        <div className="bg-white border-2 border-green-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-bold text-green-800 text-base sm:text-lg">✓ Asistencia</h3>
            <div className="text-2xl sm:text-3xl">📋</div>
          </div>
          {totalJueves > 0 ? (
            <>
              <p className="text-3xl sm:text-4xl font-bold text-green-600 mb-2">{asistenciaCount}</p>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">de {totalJueves} jueves</p>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 sm:h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(asistenciaCount / totalJueves) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{Math.round((asistenciaCount / totalJueves) * 100)}% completado</p>
            </>
          ) : (
            <p className="text-gray-600 text-center py-4 text-sm">Sin registros</p>
          )}
        </div>

        {/* Documentos */}
        <div className="bg-white border-2 border-blue-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-bold text-blue-800 text-base sm:text-lg">📄 Documentos</h3>
            <div className="text-2xl sm:text-3xl">📂</div>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-blue-600 mb-2">{documentosCount}</p>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">entregados</p>
          <div className="space-y-2">
            {Object.entries(documentos).slice(0, 2).map(([tipo, entregado]) => (
              <div key={tipo} className="flex items-center gap-2 text-xs sm:text-sm">
                <span className={entregado ? 'text-green-600 text-base sm:text-lg' : 'text-gray-400'}>
                  {entregado ? '✓' : '○'}
                </span>
                <span className={entregado ? 'text-gray-800' : 'text-gray-500'}>{tipo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pagos */}
        <div className="bg-white border-2 border-purple-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow hover:shadow-lg transition">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="font-bold text-purple-800 text-base sm:text-lg">💰 Pagos</h3>
            <div className="text-2xl sm:text-3xl">₡</div>
          </div>
          <p className="text-3xl sm:text-4xl font-bold text-purple-600 mb-2">₡{pagoCuota.toLocaleString('es-CR')}</p>
          <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">de ₡50.000</p>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
            <div
              className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 sm:h-3 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((pagoCuota / 50000) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">{Math.round((pagoCuota / 50000) * 100)}% completado</p>
        </div>
      </div>

      {/* Detalles de asistencia */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow">
        <h3 className="font-bold text-gray-800 mb-4 text-lg flex items-center gap-2">
          📅 Historial de Asistencias
        </h3>
        {fechasAsistencia.length > 0 ? (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {fechasAsistencia.map(fecha => {
              const estado = asistencias[fecha] || 'ausente';
              const colors = {
                'presente': { bg: 'bg-green-100', text: 'text-green-800', badge: '✓' },
                'justificado': { bg: 'bg-blue-100', text: 'text-blue-800', badge: '⊙' },
                'ausente': { bg: 'bg-red-100', text: 'text-red-800', badge: '✕' }
              };
              const color = colors[estado];
              return (
                <div key={fecha} className={`flex items-center justify-between p-3 rounded-lg ${color.bg} transition`}>
                  <span className="text-sm font-medium text-gray-700">{fecha}</span>
                  <span className={`px-4 py-1 rounded-full text-sm font-bold ${color.text} bg-white border-2`}>
                    {color.badge} {estado.charAt(0).toUpperCase() + estado.slice(1)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No hay registros de asistencia aún</p>
        )}
      </div>

      {/* Notas */}
      <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-yellow-900 text-lg flex items-center gap-2">
            ⚠️ Notas Importantes
          </h3>
          {(user?.rol === 'admin' || user?.usuario === 'logistica') && (
            <button
              onClick={() => setEditandoNotas(!editandoNotas)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-1 ${
                editandoNotas
                  ? 'bg-gray-600 hover:bg-gray-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {editandoNotas ? '✕ Cancelar' : '✏️ Editar'}
            </button>
          )}
        </div>

        <p className="text-sm text-yellow-800 mb-4 font-medium">
          Alergias, medicinas, restricciones dietéticas, información de salud importante
        </p>

        {editandoNotas ? (
          <div className="space-y-3">
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Alergia a penicilina, toma pastillas para asma, vegetariano..."
              className="w-full px-4 py-3 border-2 border-yellow-300 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200"
              rows="4"
            />
            <button
              onClick={handleSaveNotas}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              💾 Guardar Notas
            </button>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-lg border border-yellow-200 min-h-20">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
              {notas || 'Sin notas registradas'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentDetail;
