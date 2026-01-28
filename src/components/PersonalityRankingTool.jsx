import { useState } from 'react'
import { ArrowUp, ArrowDown, Check, X } from 'lucide-react'

export default function PersonalityRankingTool({ gruposOriginales, onRankingComplete }) {
  const [gruposConRanking, setGruposConRanking] = useState(
    gruposOriginales.map(grupo => ({
      ...grupo,
      ranking: [...grupo.integrantes], // Copia inicial sin orden
      completado: false
    }))
  )
  const [grupoActual, setGrupoActual] = useState(0)

  const handleMoverArriba = (index) => {
    if (index === 0) return

    const nuevoRanking = [...gruposConRanking[grupoActual].ranking]
    ;[nuevoRanking[index - 1], nuevoRanking[index]] = [nuevoRanking[index], nuevoRanking[index - 1]]

    const nuevosGrupos = [...gruposConRanking]
    nuevosGrupos[grupoActual].ranking = nuevoRanking
    setGruposConRanking(nuevosGrupos)
  }

  const handleMoverAbajo = (index) => {
    const ranking = gruposConRanking[grupoActual].ranking
    if (index === ranking.length - 1) return

    const nuevoRanking = [...ranking]
    ;[nuevoRanking[index + 1], nuevoRanking[index]] = [nuevoRanking[index], nuevoRanking[index + 1]]

    const nuevosGrupos = [...gruposConRanking]
    nuevosGrupos[grupoActual].ranking = nuevoRanking
    setGruposConRanking(nuevosGrupos)
  }

  const handleGrupoCompletado = () => {
    const nuevosGrupos = [...gruposConRanking]
    nuevosGrupos[grupoActual].completado = true
    setGruposConRanking(nuevosGrupos)

    // Ir al siguiente grupo sin completar
    let siguienteGrupo = grupoActual + 1
    while (siguienteGrupo < nuevosGrupos.length && nuevosGrupos[siguienteGrupo].completado) {
      siguienteGrupo++
    }

    if (siguienteGrupo < nuevosGrupos.length) {
      setGrupoActual(siguienteGrupo)
    }
  }

  const handleIrAlGrupo = (index) => {
    setGrupoActual(index)
  }

  const todosCompletados = gruposConRanking.every(g => g.completado)
  const grupoData = gruposConRanking[grupoActual]

  return (
    <div className="space-y-6">
      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">📋 Instrucciones</h3>
        <p className="text-sm text-blue-800 mb-2">
          Ordena los integrantes de cada grupo de <strong>MÁS INTROVERTIDO</strong> (arriba) a <strong>MÁS EXTROVERTIDO</strong> (abajo).
        </p>
        <p className="text-xs text-blue-700">
          Usa las flechas para reordenar. Marca ✓ cuando termines con cada grupo.
        </p>
      </div>

      {/* Tabs de grupos */}
      <div className="flex flex-wrap gap-2 border-b">
        {gruposConRanking.map((grupo, idx) => (
          <button
            key={idx}
            onClick={() => handleIrAlGrupo(idx)}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              grupoActual === idx
                ? 'border-amber-600 text-amber-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            } flex items-center gap-2`}
          >
            {grupo.nombre}
            {grupo.completado && <Check className="w-4 h-4 text-green-600" />}
          </button>
        ))}
      </div>

      {/* Contenido del grupo actual */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {grupoData.nombre} ({grupoData.ranking.length} integrantes)
          </h2>

          <div className="space-y-2">
            {grupoData.ranking.map((estudiante, index) => (
              <div
                key={`${estudiante.nombre}-${index}`}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                  index === 0
                    ? 'bg-blue-50 border-blue-300'
                    : index === grupoData.ranking.length - 1
                    ? 'bg-orange-50 border-orange-300'
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                {/* Número de posición */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold">
                  {index + 1}
                </div>

                {/* Información del estudiante */}
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{estudiante.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {estudiante.cedula && `Cédula: ${estudiante.cedula}`}
                  </p>
                </div>

                {/* Indicador de tipo */}
                <div className="shrink-0 text-sm font-medium">
                  {index === 0 ? (
                    <span className="px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-xs">
                      Más Introvertido
                    </span>
                  ) : index === grupoData.ranking.length - 1 ? (
                    <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-xs">
                      Más Extrovertido
                    </span>
                  ) : null}
                </div>

                {/* Botones de movimiento */}
                <div className="shrink-0 flex gap-2">
                  <button
                    onClick={() => handleMoverArriba(index)}
                    disabled={index === 0}
                    className="p-2 rounded hover:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Mover hacia arriba (más introvertido)"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMoverAbajo(index)}
                    disabled={index === grupoData.ranking.length - 1}
                    className="p-2 rounded hover:bg-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Mover hacia abajo (más extrovertido)"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Botón de completado */}
        <div className="flex gap-2">
          <button
            onClick={handleGrupoCompletado}
            disabled={grupoData.completado}
            className={`flex-1 py-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 ${
              grupoData.completado
                ? 'bg-green-100 text-green-700 cursor-default'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Check className="w-5 h-5" />
            {grupoData.completado ? 'Grupo Completado' : 'Marcar Grupo como Completado'}
          </button>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="bg-gray-100 rounded-lg p-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progreso</span>
          <span className="text-sm font-bold text-gray-800">
            {gruposConRanking.filter(g => g.completado).length} de {gruposConRanking.length} grupos
          </span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-3">
          <div
            className="bg-green-600 h-3 rounded-full transition-all duration-300"
            style={{
              width: `${(gruposConRanking.filter(g => g.completado).length / gruposConRanking.length) * 100}%`
            }}
          ></div>
        </div>
      </div>

      {/* Botón final */}
      {todosCompletados && (
        <button
          onClick={() => onRankingComplete(gruposConRanking)}
          className="w-full py-4 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg font-bold text-lg hover:from-green-700 hover:to-green-800 transition-colors shadow-lg"
        >
          ✓ Continuar con Asignación de Nuevos Grupos
        </button>
      )}
    </div>
  )
}
