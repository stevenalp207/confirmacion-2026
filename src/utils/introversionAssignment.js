// Sistema de asignación de grupos basado en Introversión/Extroversión

/**
 * Asigna estudiantes a nuevos grupos balanceados según su perfil introvertido/extrovertido
 * @param {Array} gruposConRanking - Grupos con estudiantes rankeados
 * @param {Number} cantidadNuevosGrupos - Cantidad de grupos a crear
 * @returns {Object} Nuevos grupos balanceados
 */
export function asignarPorPersonalidad(gruposConRanking, cantidadNuevosGrupos) {
  // Validación
  if (!gruposConRanking || gruposConRanking.length === 0) {
    throw new Error('Se requieren grupos con ranking')
  }

  if (cantidadNuevosGrupos < 1) {
    throw new Error('Se requiere al menos 1 nuevo grupo')
  }

  // Extraer todos los estudiantes con su puntuación de personalidad
  const estudiantes = extraerEstudiantesConPuntuacion(gruposConRanking)

  // Separar en introvertidos y extrovertidos
  const introvertidos = estudiantes.filter(e => e.puntuacionPersonalidad < 0.5)
  const extrovertidos = estudiantes.filter(e => e.puntuacionPersonalidad >= 0.5)

  console.log(`Total: ${estudiantes.length} | Intros: ${introvertidos.length} | Extros: ${extrovertidos.length}`)

  // Shuffle para aleatoriedad
  const introvertidosShuffled = shuffle([...introvertidos])
  const extrovertidosShuffled = shuffle([...extrovertidos])

  // Crear nuevos grupos con balance
  const nuevosGrupos = Array.from({ length: cantidadNuevosGrupos }, (_, idx) => ({
    id: idx,
    nombre: `Grupo ${idx + 1}`,
    integrantes: [],
    introvertidos: 0,
    extrovertidos: 0
  }))

  // Distribuir alternando entre grupos
  let grupoIdx = 0
  for (const intro of introvertidosShuffled) {
    nuevosGrupos[grupoIdx % cantidadNuevosGrupos].integrantes.push(intro)
    nuevosGrupos[grupoIdx % cantidadNuevosGrupos].introvertidos++
    grupoIdx++
  }

  grupoIdx = 0
  for (const extro of extrovertidosShuffled) {
    nuevosGrupos[grupoIdx % cantidadNuevosGrupos].integrantes.push(extro)
    nuevosGrupos[grupoIdx % cantidadNuevosGrupos].extrovertidos++
    grupoIdx++
  }

  // Optimizar balance
  optimizarBalancePersonalidad(nuevosGrupos)

  return {
    grupos: nuevosGrupos,
    estadisticas: calcularEstadisticasPersonalidad(nuevosGrupos, estudiantes.length),
    detalles: {
      totalIntrovertidos: introvertidos.length,
      totalExtrovertidos: extrovertidos.length
    }
  }
}

/**
 * Extrae estudiantes con puntuación de personalidad basada en ranking
 * Usa la posición en el ranking para calcular intro/extro
 */
function extraerEstudiantesConPuntuacion(gruposConRanking) {
  const estudiantes = []

  gruposConRanking.forEach(grupo => {
    if (!grupo.ranking || grupo.ranking.length === 0) return

    grupo.ranking.forEach((estudiante, index) => {
      // Calcular puntuación: primeros = más extros (1), últimos = más intros (0)
      const puntuacion = 1 - (index / (grupo.ranking.length - 1 || 1))

      estudiantes.push({
        ...estudiante,
        puntuacionPersonalidad: puntuacion,
        grupoOriginal: grupo.nombre,
        posicionRanking: index + 1
      })
    })
  })

  return estudiantes
}

/**
 * Optimiza el balance de introvertidos y extrovertidos entre grupos
 */
function optimizarBalancePersonalidad(grupos, maxIteraciones = 30) {
  for (let i = 0; i < maxIteraciones; i++) {
    const desequilibrio = calcularDesequilibrioPersonalidad(grupos)

    if (desequilibrio < 1) {
      break // Suficientemente balanceado
    }

    let mejoro = false

    for (let j = 0; j < grupos.length; j++) {
      for (let k = j + 1; k < grupos.length; k++) {
        if (intentarIntercambioPersonalidad(grupos[j], grupos[k])) {
          mejoro = true
          break
        }
      }
      if (mejoro) break
    }

    if (!mejoro) break
  }
}

/**
 * Intenta intercambiar estudiantes entre dos grupos para mejorar el balance
 */
function intentarIntercambioPersonalidad(grupo1, grupo2) {
  const desequilibrioActual = Math.abs(grupo1.introvertidos - grupo1.extrovertidos) +
                              Math.abs(grupo2.introvertidos - grupo2.extrovertidos)

  // Buscar un introvertido en grupo1 y extrovertido en grupo2
  for (const est1 of grupo1.integrantes) {
    if (est1.puntuacionPersonalidad < 0.5) {
      for (const est2 of grupo2.integrantes) {
        if (est2.puntuacionPersonalidad >= 0.5) {
          // Simular intercambio
          const nuevoDesequilibrio = 
            Math.abs((grupo1.introvertidos - 1) - (grupo1.extrovertidos + 1)) +
            Math.abs((grupo2.introvertidos + 1) - (grupo2.extrovertidos - 1))

          if (nuevoDesequilibrio < desequilibrioActual) {
            // Hacer intercambio
            grupo1.integrantes = grupo1.integrantes.filter(e => e.nombre !== est1.nombre)
            grupo2.integrantes = grupo2.integrantes.filter(e => e.nombre !== est2.nombre)

            grupo1.integrantes.push(est2)
            grupo2.integrantes.push(est1)

            grupo1.introvertidos--
            grupo1.extrovertidos++
            grupo2.introvertidos++
            grupo2.extrovertidos--

            return true
          }
        }
      }
    }
  }

  return false
}

/**
 * Calcula el desequilibrio promedio de personalidad en los grupos
 */
function calcularDesequilibrioPersonalidad(grupos) {
  const desequilibrios = grupos.map(g => 
    Math.abs(g.introvertidos - g.extrovertidos)
  )
  return Math.max(...desequilibrios)
}

/**
 * Calcula estadísticas de los grupos por personalidad
 */
function calcularEstadisticasPersonalidad(grupos, totalEstudiantes) {
  const stats = {
    totalEstudiantes,
    porGrupo: []
  }

  for (const grupo of grupos) {
    stats.porGrupo.push({
      nombre: grupo.nombre,
      total: grupo.integrantes.length,
      introvertidos: grupo.introvertidos,
      extrovertidos: grupo.extrovertidos,
      balance: Math.abs(grupo.introvertidos - grupo.extrovertidos),
      porcentajeIntro: grupo.integrantes.length > 0 
        ? ((grupo.introvertidos / grupo.integrantes.length) * 100).toFixed(1)
        : 0,
      integrantes: grupo.integrantes.map(e => ({
        nombre: e.nombre,
        cedula: e.cedula,
        tipo: e.puntuacionPersonalidad < 0.5 ? 'Introvertido' : 'Extrovertido',
        grupoOriginal: e.grupoOriginal,
        posicion: e.posicionRanking
      }))
    })
  }

  return stats
}

/**
 * Función auxiliar para shuffle aleatorio
 */
function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Valida que los rankings estén completos
 */
export function validarRankings(gruposConRanking) {
  const errores = []

  gruposConRanking.forEach((grupo, idx) => {
    if (!grupo.ranking || grupo.ranking.length === 0) {
      errores.push(`Grupo "${grupo.nombre}" no tiene ranking`)
    } else {
      const ranking = grupo.ranking
      if (ranking.length < 2) {
        errores.push(`Grupo "${grupo.nombre}" debe tener al menos 2 integrantes rankeados`)
      }
    }
  })

  return {
    valido: errores.length === 0,
    errores
  }
}
