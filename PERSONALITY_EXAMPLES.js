/**
 * EJEMPLO: Cómo conectar el sistema de Personalidad con datos reales
 * 
 * Este archivo muestra ejemplos de cómo usar el módulo con datos reales
 * de tu aplicación (desde API, base de datos, etc.)
 */

// ============================================================================
// EJEMPLO 1: Obtener grupos desde tu API/Base de datos
// ============================================================================

/**
 * Si tienes un endpoint o función que devuelve grupos con estudiantes
 */
async function obtenerGruposDelBackend() {
  try {
    const response = await fetch('/api/grupos')
    const grupos = await response.json()
    
    // Transformar a formato que espera el componente
    const gruposFormateados = grupos.map(grupo => ({
      nombre: grupo.nombre,
      integrantes: grupo.estudiantes.map(est => ({
        nombre: est.nombre,
        cedula: est.cedula,
        genero: est.genero,
        // Otros datos opcionales que quieras mantener
        email: est.email,
        año: est.año
      }))
    }))
    
    return gruposFormateados
  } catch (error) {
    console.error('Error al obtener grupos:', error)
    return []
  }
}

// ============================================================================
// EJEMPLO 2: Hacer el ranking en un componente personalizado
// ============================================================================

import { useState } from 'react'
import PersonalityRankingTool from '../components/PersonalityRankingTool'
import { asignarPorPersonalidad, validarRankings } from '../utils/introversionAssignment'

export default function MiComponenteConDatos() {
  const [grupos, setGrupos] = useState([])
  const [resultado, setResultado] = useState(null)
  const [loading, setLoading] = useState(true)

  // Cargar grupos al montar el componente
  useState(() => {
    obtenerGruposDelBackend().then(setGrupos)
    setLoading(false)
  }, [])

  const handleRankingComplete = (gruposConRanking) => {
    // gruposConRanking tiene este formato:
    // [{
    //   nombre: 'Grupo A',
    //   ranking: [est1, est2, est3, est4],  // ORDENADO de intro a extro
    //   completado: true
    // }]

    // Validar que todo esté OK
    const validacion = validarRankings(gruposConRanking)
    if (!validacion.valido) {
      console.error('Rankings inválidos:', validacion.errores)
      return
    }

    // Asignar a 3 nuevos grupos
    const nuevoResultado = asignarPorPersonalidad(gruposConRanking, 3)
    
    console.log('Resultado:', nuevoResultado)
    // nuevoResultado.grupos contiene los nuevos grupos asignados
    // nuevoResultado.estadisticas tiene stats detalladas
    // nuevoResultado.detalles tiene totales intro/extro
    
    setResultado(nuevoResultado)
    
    // Aquí podrías guardar en tu backend:
    guardarResultado(nuevoResultado)
  }

  async function guardarResultado(resultado) {
    try {
      await fetch('/api/asignaciones-personalidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: new Date(),
          gruposOriginales: grupos.map(g => g.nombre),
          nuevoResultado: resultado
        })
      })
    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }

  if (loading) return <div>Cargando grupos...</div>

  return (
    <>
      {!resultado ? (
        <PersonalityRankingTool 
          gruposOriginales={grupos}
          onRankingComplete={handleRankingComplete}
        />
      ) : (
        <div>
          <h2>✓ Asignación completada</h2>
          <p>Total intros: {resultado.detalles.totalIntrovertidos}</p>
          <p>Total extros: {resultado.detalles.totalExtrovertidos}</p>
          
          {/* Ver resultados detallados */}
          {resultado.grupos.map(grupo => (
            <div key={grupo.nombre}>
              <h3>{grupo.nombre}</h3>
              <ul>
                {grupo.integrantes.map(est => (
                  <li key={est.nombre}>
                    {est.nombre} ({est.puntuacionPersonalidad < 0.5 ? 'Intro' : 'Extro'})
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

// ============================================================================
// EJEMPLO 3: Procesar ranking manualmente
// ============================================================================

function procesoManual() {
  const gruposConRanking = [
    {
      nombre: 'Grupo A',
      ranking: [
        { nombre: 'Juan', cedula: '123' },
        { nombre: 'María', cedula: '456' },
        { nombre: 'Carlos', cedula: '789' },
        { nombre: 'Ana', cedula: '012' }
      ],
      completado: true
    }
  ]

  // Asignar a nuevos grupos
  const resultado = asignarPorPersonalidad(gruposConRanking, 1)

  // Acceder a los datos
  console.log('Estudiante 0:', resultado.grupos[0].integrantes[0])
  // {
  //   nombre: 'Juan',
  //   cedula: '123',
  //   puntuacionPersonalidad: 0,        // Más introvertido
  //   grupoOriginal: 'Grupo A',
  //   posicionRanking: 1
  // }

  console.log('Estudiante 3:', resultado.grupos[0].integrantes[3])
  // {
  //   nombre: 'Ana',
  //   cedula: '012',
  //   puntuacionPersonalidad: 1,        // Más extrovertido
  //   grupoOriginal: 'Grupo A',
  //   posicionRanking: 4
  // }
}

// ============================================================================
// EJEMPLO 4: Usar con componente completo integrado
// ============================================================================

import GroupAssignmentPersonalityTool from '../components/GroupAssignmentPersonalityTool'

// El componente GroupAssignmentPersonalityTool es STANDALONE
// Maneja todo internamente: selección de grupos, ranking, resultados
// Solo necesitas renderizarlo

export function PaginaCompleta() {
  return (
    <div>
      <h1>Sistema de Asignación por Personalidad</h1>
      <GroupAssignmentPersonalityTool />
    </div>
  )
}

// ============================================================================
// EJEMPLO 5: Estadísticas y análisis post-asignación
// ============================================================================

function analizarResultado(resultado) {
  const { grupos, estadisticas, detalles } = resultado

  console.log('=== ANÁLISIS ===')
  
  // Balance general
  console.log(`Total estudiantes: ${estadisticas.totalEstudiantes}`)
  console.log(`Introvertidos: ${detalles.totalIntrovertidos} (${(detalles.totalIntrovertidos / estadisticas.totalEstudiantes * 100).toFixed(1)}%)`)
  console.log(`Extrovertidos: ${detalles.totalExtrovertidos} (${(detalles.totalExtrovertidos / estadisticas.totalEstudiantes * 100).toFixed(1)}%)`)

  // Por grupo
  estadisticas.porGrupo.forEach(stats => {
    console.log(`\n${stats.nombre}:`)
    console.log(`  Total: ${stats.total}`)
    console.log(`  Intros: ${stats.introvertidos} | Extros: ${stats.extrovertidos}`)
    console.log(`  Balance: ${stats.balance} (${stats.porcentajeIntro}% intro)`)
    
    // Verificar que esté balanceado (máximo 1-2 de diferencia es ideal)
    if (stats.balance <= 1) {
      console.log(`  ✓ Balance perfecto`)
    } else if (stats.balance <= 2) {
      console.log(`  ⚠ Balance bueno`)
    } else {
      console.log(`  ⚠ Balance podría mejorar`)
    }
  })
}

// ============================================================================
// EJEMPLO 6: Integración con Redux o Context
// ============================================================================

import { createContext, useContext, useState } from 'react'

const PersonalityContext = createContext()

export function PersonalityProvider({ children }) {
  const [asignaciones, setAsignaciones] = useState([])
  const [asignacionActual, setAsignacionActual] = useState(null)

  const guardarAsignacion = (resultado) => {
    const nuevaAsignacion = {
      id: Date.now(),
      timestamp: new Date(),
      resultado
    }
    setAsignaciones([...asignaciones, nuevaAsignacion])
    setAsignacionActual(nuevaAsignacion)
  }

  const value = {
    asignaciones,
    asignacionActual,
    guardarAsignacion
  }

  return (
    <PersonalityContext.Provider value={value}>
      {children}
    </PersonalityContext.Provider>
  )
}

export function usePersonality() {
  return useContext(PersonalityContext)
}

// Uso en componente:
function MiComponente() {
  const { guardarAsignacion } = usePersonality()

  const handleCompletado = (resultado) => {
    guardarAsignacion(resultado)  // Guarda en context
  }

  return <GroupAssignmentPersonalityTool />
}

// ============================================================================
// EJEMPLO 7: Exportar datos personalizados
// ============================================================================

import { exportarAsignacionPersonalidadExcel } from '../utils/groupAssignment'

function exportarConFormato(resultado) {
  const { grupos, estadisticas } = resultado

  // Excel directo
  exportarAsignacionPersonalidadExcel(grupos, estadisticas)

  // O JSON para tu API
  const json = JSON.stringify({
    timestamp: new Date().toISOString(),
    grupos: grupos.map(g => ({
      nombre: g.nombre,
      integrantes: g.integrantes.map(e => ({
        nombre: e.nombre,
        cedula: e.cedula,
        tipo: e.puntuacionPersonalidad < 0.5 ? 'intro' : 'extro'
      }))
    }))
  }, null, 2)

  // Descargar JSON
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `asignacion_${new Date().toISOString().split('T')[0]}.json`
  link.click()
}

// ============================================================================
// EJEMPLO 8: Validaciones personalizadas
// ============================================================================

import { validarRankings } from '../utils/introversionAssignment'

function miValidacionPersonalizada(gruposConRanking) {
  // Validación básica del módulo
  const { valido, errores } = validarRankings(gruposConRanking)
  
  if (!valido) {
    return { valido: false, errores }
  }

  // Tus validaciones adicionales
  const erroresPersonalizados = []

  gruposConRanking.forEach(grupo => {
    // Validar que no haya duplicados en el ranking
    const nombres = grupo.ranking.map(e => e.nombre)
    const duplicados = nombres.filter((n, idx) => nombres.indexOf(n) !== idx)
    if (duplicados.length > 0) {
      erroresPersonalizados.push(`Duplicados en ${grupo.nombre}: ${duplicados.join(', ')}`)
    }

    // Validar mínimo de integrantes
    if (grupo.ranking.length < 2) {
      erroresPersonalizados.push(`${grupo.nombre} necesita al menos 2 integrantes`)
    }
  })

  return {
    valido: erroresPersonalizados.length === 0,
    errores: erroresPersonalizados
  }
}

// ============================================================================
// TIPS & TRICKS
// ============================================================================

/*
1. INTEGRACIÓN CON API:
   - Obtén grupos de tu backend
   - Guarda rankings en backend durante el proceso
   - Guarda resultado final para auditoría

2. RENDIMIENTO:
   - Usa lazy loading para el módulo
   - Cache de grupos si no cambian frecuentemente
   - Limita a máximo 10-15 grupos para mejor UX

3. DATOS:
   - Asegúrate que estudiantes tengan al menos:
     - nombre
     - cedula (opcional pero recomendado)
   - Puedes incluir otros campos que se preservarán

4. PERSONALIZACIÓN:
   - Modifica las etiquetas de "Introvertido/Extrovertido" en los componentes
   - Cambia colores: azul/naranja a otros en el CSS Tailwind
   - Ajusta cantidad de grupos en el range input

5. TESTING:
   - Usa los datos ejemplo en GroupAssignmentPersonalityTool
   - Simula diferentes escenarios (2-10 estudiantes)
   - Verifica que el balance sea correcto matemáticamente
*/
