import { ArrowLeft, Users, Shuffle } from 'lucide-react'
import { useState } from 'react'
import GroupAssignmentPersonalityTool from '../components/GroupAssignmentPersonalityTool'
import RandomAssignmentTool from '../components/RandomAssignmentTool'

export default function PersonalityAssignmentModule({ onBack }) {
  const [metodosSeleccionado, setMetodoSeleccionado] = useState(null)

  const metodos = [
    {
      id: 'personalidad',
      nombre: 'Por Personalidad',
      icono: Users,
      color: 'amber',
      descripcion: 'Distribuye grupos basándose en perfiles introvertidos/extrovertidos',
      caracteristicas: [
        'Ranking de integrantes por personalidad',
        'Balance 50/50 introvertido-extrovertido',
        'Redistribución equilibrada'
      ]
    },
    {
      id: 'aleatorio',
      nombre: 'Totalmente Aleatorio',
      icono: Shuffle,
      color: 'violet',
      descripcion: 'Distribución aleatoria manteniendo equilibrio',
      caracteristicas: [
        'Distribución aleatoria justa',
        'Balance automático de géneros',
        'Evita concentración de grupos de origen'
      ]
    }
  ]

  if (!metodosSeleccionado) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              Volver al Menú Principal
            </button>

            <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
              <div className="text-center mb-4">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                  Asignación de Subgrupos
                </h1>
                <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                  Elige el método de distribución que prefieres
                </p>
              </div>
            </div>
          </div>

          {/* Selección de método */}
          <div className="grid md:grid-cols-2 gap-6">
            {metodos.map((metodo) => {
              const Icono = metodo.icono
              const colorClasses = {
                amber: 'from-amber-50 to-orange-50 border-amber-200 hover:border-amber-400',
                violet: 'from-violet-50 to-purple-50 border-violet-200 hover:border-violet-400'
              }
              const colorBgClasses = {
                amber: 'bg-amber-600 text-white',
                violet: 'bg-violet-600 text-white'
              }
              const colorBtnClasses = {
                amber: 'from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
                violet: 'from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
              }

              return (
                <div
                  key={metodo.id}
                  className={`bg-linear-to-br ${colorClasses[metodo.color]} border-2 rounded-lg p-6 transition-all cursor-pointer hover:shadow-lg`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${colorBgClasses[metodo.color]} rounded-full p-3`}>
                      <Icono className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {metodo.nombre}
                    </h2>
                  </div>

                  <p className="text-gray-700 mb-4">
                    {metodo.descripcion}
                  </p>

                  <div className="bg-white bg-opacity-60 rounded-lg p-3 mb-4">
                    <h3 className="font-bold text-gray-800 text-sm mb-2">Características:</h3>
                    <ul className="space-y-1">
                      {metodo.caracteristicas.map((car, idx) => (
                        <li key={idx} className="text-sm text-gray-700 flex items-center gap-2">
                          <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                          {car}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => setMetodoSeleccionado(metodo.id)}
                    className={`w-full py-3 bg-linear-to-r ${colorBtnClasses[metodo.color]} text-white rounded-lg font-bold transition-colors`}
                  >
                    Seleccionar este método
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => setMetodoSeleccionado(null)}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Cambiar método de asignación
          </button>

          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
                {metodosSeleccionado === 'personalidad' ? (
                  <>
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-amber-600" />
                    Asignación por Personalidad
                  </>
                ) : (
                  <>
                    <Shuffle className="w-6 h-6 sm:w-8 sm:h-8 text-violet-600" />
                    Asignación Aleatoria
                  </>
                )}
              </h1>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                {metodosSeleccionado === 'personalidad' 
                  ? 'Distribuye grupos según el perfil introvertido/extrovertido'
                  : 'Distribuye grupos de forma aleatoria con equilibrio automático'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Contenido según el método seleccionado */}
        <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
          {metodosSeleccionado === 'personalidad' && (
            <GroupAssignmentPersonalityTool />
          )}
          {metodosSeleccionado === 'aleatorio' && (
            <RandomAssignmentTool />
          )}
        </div>
      </div>
    </div>
  )
}
