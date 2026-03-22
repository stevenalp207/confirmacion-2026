// Sistema de asignación automática de grupos con equilibrio y restricciones

export function asignarGruposEquilibrados(estudiantes, grupos, restricciones = {}) {
  // Excepciones y restricciones personalizadas
  const restNormalizadas = {
    problematicos: [
      'Terry Anderson Solis Centeno',
      'Dereck Jiménez Durán',
      'Lara Herrera Sebastián',
      'Fabricio Morales Chacón',
      'Angelo Ortiz Alvarado',
      'Roy Madrigal Aguilar',
      'Sebastián Peraza Chinchilla',
      'Ignacio Álvarez Ramírez',
      'Laura Marcela Forbes Segura',
      'Fiorella Sequeira Aguilar',
      'Rebeca de los Angeles Artavia Quirós',
      'María Samantha Orozco Mora',
      'Marlie Monserrat Gómez Ramírez',
      'Sebastián Peraza Chinchilla'
    ],
    parejas: [
      ['Stacey Camila Soto Segura', 'Ismael Jesús Astorga Calderón'],
      ['Amanda Ramírez Calderón', 'Santiago Lemuel Arrieta Venegas'],
      ['Marlie Monserrat Gómez Ramírez', 'Sebastián Peraza Chinchilla']
    ],
    gruposAmigos: [
      ['Christopher Castro Picado', 'Angelo Ortiz Alvarado']
    ],
    fortaleza: ['Daniel Del Valle Portuguez'],
    // Problemas fuertes entre ellos
    problemasFuertes: [
      'Dereck Jiménez Durán',
      'Laura Marcela Forbes Segura',
      'Fiorella Sequeira Aguilar'
    ],
    // Parejas que terminaron mal
    parejasMal: [
      ['Marlie Monserrat Gómez Ramírez', 'Sebastián Peraza Chinchilla']
    ]
  }
  // Si se pasan restricciones externas, combinarlas
  if (restricciones.problematicos) {
    restNormalizadas.problematicos = [...new Set([...restNormalizadas.problematicos, ...restricciones.problematicos])]
  }
  if (restricciones.parejas) {
    restNormalizadas.parejas = [...restNormalizadas.parejas, ...restricciones.parejas]
  }
  if (restricciones.gruposAmigos) {
    restNormalizadas.gruposAmigos = [...restNormalizadas.gruposAmigos, ...restricciones.gruposAmigos]
  }
  if (restricciones.fortaleza) {
    restNormalizadas.fortaleza = [...new Set([...restNormalizadas.fortaleza, ...restricciones.fortaleza])]
  }

  if (!estudiantes?.length || !grupos?.length) {
    throw new Error('Se requieren estudiantes y grupos')
  }

  // Pre-calcular conteos por grado para distribución equitativa
  const conteosPorGrado = {}
  estudiantes.forEach(est => {
    const grado = est.ano || est.grado
    if (grado) {
      conteosPorGrado[grado] = (conteosPorGrado[grado] || 0) + 1
    }
  })
  
  // Calcular promedio esperado por grupo para cada grado
  const promediosPorGrado = {}
  Object.entries(conteosPorGrado).forEach(([grado, count]) => {
    promediosPorGrado[grado] = count / grupos.length
  })

  // Calcular máximo de problemáticos permitidos por grupo
  const numProblematicos = restNormalizadas.problematicos.length
  const maxProblematicosPorGrupo = numProblematicos > 0 ? Math.ceil(numProblematicos / grupos.length) : 0

  const gruposAsignados = grupos.map(nombre => ({
    nombre,
    integrantes: [],
    hombres: 0,
    mujeres: 0,
    especialidades: {},
    grados: {},
    problematicos: 0  // Contador de problemáticos en el grupo
  }))

  const estudiantesPendientes = [...estudiantes].sort(() => Math.random() - 0.5)
  const tamañoObjetivo = Math.ceil(estudiantes.length / grupos.length)

  for (const estudiante of estudiantesPendientes) {
    // Restricción especial: Daniel Del Valle Portuguez debe estar en fortaleza
    if (restNormalizadas.fortaleza && restNormalizadas.fortaleza.includes(estudiante.nombre)) {
      const grupoFortaleza = gruposAsignados.find(g => g.nombre.toLowerCase().includes('fortaleza'))
      if (grupoFortaleza && grupoFortaleza.integrantes.length < tamañoObjetivo) {
        asignarEstudianteAGrupo(grupoFortaleza, estudiante, restNormalizadas)
        continue
      }
    }
    const mejorGrupo = encontrarMejorGrupo(
      gruposAsignados,
      estudiante,
      restNormalizadas,
      tamañoObjetivo,
      promediosPorGrado,
      maxProblematicosPorGrupo
    )
    if (mejorGrupo) {
      asignarEstudianteAGrupo(mejorGrupo, estudiante, restNormalizadas)
    }
  }

  optimizarDistribucion(gruposAsignados, restNormalizadas, promediosPorGrado)

  return {
    grupos: gruposAsignados,
    estadisticas: calcularEstadisticas(gruposAsignados),
    advertencias: validarRestricciones(gruposAsignados, restNormalizadas)
  }
}

function encontrarMejorGrupo(grupos, estudiante, restricciones, tamañoObjetivo, promediosPorGrado = {}, maxProblematicosPorGrupo = 1) {
  const esProblematico = restricciones.problematicos.includes(estudiante.nombre)
  
  const puntajes = grupos.map(grupo => {
    if (grupo.integrantes.length >= tamañoObjetivo) {
      return { grupo, puntaje: -1000 }
    }

    // Verificar conflicto, pero pasando el máximo permitido de problemáticos
    if (tieneConflictoEnGrupo(estudiante.nombre, grupo, restricciones, maxProblematicosPorGrupo)) {
      return { grupo, puntaje: -2000 }
    }

    let puntaje = 0

    // Si es problemático, preferir grupos con menos problemáticos
    if (esProblematico) {
      const problematicosEnGrupo = grupo.problematicos || 0
      // Bonus grande si el grupo no tiene problemáticos
      if (problematicosEnGrupo === 0) {
        puntaje += 50
      }
      // Penalización por cada problemático ya presente
      else {
        puntaje -= problematicosEnGrupo * 25
      }
    }

    const genero = estudiante.genero?.toLowerCase()
    if (genero === 'masculino' || genero === 'hombre' || genero === 'm') {
      puntaje += (grupo.mujeres - grupo.hombres) * 10
    } else if (genero === 'femenino' || genero === 'mujer' || genero === 'f') {
      puntaje += (grupo.hombres - grupo.mujeres) * 10
    }

    const especialidad = estudiante.especialidad
    if (especialidad) {
      const count = grupo.especialidades[especialidad] || 0
      puntaje -= count * 5
    }

    // Equilibrar por año/grado con promedio esperado
    const grado = estudiante.ano || estudiante.grado
    if (grado) {
      const countGrado = grupo.grados[grado] || 0
      const promedioEsperado = promediosPorGrado[grado] || 1
      
      // Bonus grande si el grupo no tiene ninguno de este grado
      if (countGrado === 0) {
        puntaje += 20
      }
      // Penalización fuerte si ya tiene >= promedio esperado
      else if (countGrado >= Math.ceil(promedioEsperado)) {
        puntaje -= 30
      }
      // Penalización normal por cada uno que ya tiene
      else {
        puntaje -= countGrado * 10
      }
    }

    const espacio = tamañoObjetivo - grupo.integrantes.length
    puntaje += espacio * 2
    puntaje += (Math.random() * 4) - 2  // Reducir aleatoriedad

    return { grupo, puntaje }
  })

  puntajes.sort((a, b) => b.puntaje - a.puntaje)
  return puntajes[0]?.puntaje > -1000 ? puntajes[0].grupo : null
}

function tieneConflictoEnGrupo(nombre, grupo, restricciones, maxProblematicosPorGrupo = 1) {
  const integrantes = grupo.integrantes.map(i => i.nombre)
  
  // Para problemáticos: solo es conflicto si el grupo ya alcanzó el máximo permitido
  if (restricciones.problematicos.includes(nombre)) {
    const problematicosEnGrupo = grupo.problematicos || 0
    if (problematicosEnGrupo >= maxProblematicosPorGrupo) {
      return true
    }
  }
  
  for (const pareja of restricciones.parejas) {
    if (pareja.includes(nombre)) {
      const otro = pareja.find(p => p !== nombre)
      if (integrantes.includes(otro)) return true
    }
  }
  
  for (const grupo2 of restricciones.gruposAmigos) {
    if (grupo2.includes(nombre)) {
      if (integrantes.some(n => grupo2.includes(n) && n !== nombre)) return true
    }
  }
  
  return false
}

function asignarEstudianteAGrupo(grupo, estudiante, restricciones = {}) {
  grupo.integrantes.push(estudiante)
  
  // Incrementar contador de problemáticos si aplica
  if (restricciones.problematicos && restricciones.problematicos.includes(estudiante.nombre)) {
    grupo.problematicos = (grupo.problematicos || 0) + 1
  }
  
  const genero = estudiante.genero?.toLowerCase()
  if (genero === 'masculino' || genero === 'hombre' || genero === 'm') {
    grupo.hombres++
  } else if (genero === 'femenino' || genero === 'mujer' || genero === 'f') {
    grupo.mujeres++
  }
  
  if (estudiante.especialidad) {
    grupo.especialidades[estudiante.especialidad] = 
      (grupo.especialidades[estudiante.especialidad] || 0) + 1
  }

  // Contar por año/grado
  const grado = estudiante.ano || estudiante.grado
  if (grado) {
    grupo.grados[grado] = (grupo.grados[grado] || 0) + 1
  }
}

function optimizarDistribucion(grupos, restricciones, promediosPorGrado = {}, intentos = 50) {
  for (let i = 0; i < intentos; i++) {
    const mejoro = intentarIntercambio(grupos, restricciones, promediosPorGrado)
    if (!mejoro) break
  }
}

function intentarIntercambio(grupos, restricciones, promediosPorGrado = {}) {
  const desequilibrios = calcularDesequilibrios(grupos)
  
  if (desequilibrios.maxDesbalance < 2 && desequilibrios.maxDesbalanceGrado < 2) {
    return false
  }

  for (let i = 0; i < grupos.length; i++) {
    for (let j = i + 1; j < grupos.length; j++) {
      const grupo1 = grupos[i]
      const grupo2 = grupos[j]

      for (const est1 of grupo1.integrantes) {
        for (const est2 of grupo2.integrantes) {
          if (intercambioMejora(grupo1, grupo2, est1, est2, restricciones, promediosPorGrado)) {
            realizarIntercambio(grupo1, grupo2, est1, est2, restricciones)
            return true
          }
        }
      }
    }
  }

  return false
}

function intercambioMejora(grupo1, grupo2, est1, est2, restricciones, promediosPorGrado = {}) {
  const temp1 = { ...grupo1, integrantes: grupo1.integrantes.filter(e => e !== est1), problematicos: grupo1.problematicos || 0 }
  const temp2 = { ...grupo2, integrantes: grupo2.integrantes.filter(e => e !== est2), problematicos: grupo2.problematicos || 0 }
  
  // Ajustar contadores temporales de problemáticos
  if (restricciones.problematicos?.includes(est1.nombre)) temp1.problematicos--
  if (restricciones.problematicos?.includes(est2.nombre)) temp2.problematicos--
  
  // Calcular max permitido
  const numGrupos = 7 // Asumimos 7 grupos
  const maxProblematicos = Math.ceil((restricciones.problematicos?.length || 0) / numGrupos)
  
  if (tieneConflictoEnGrupo(est2.nombre, temp1, restricciones, maxProblematicos)) return false
  if (tieneConflictoEnGrupo(est1.nombre, temp2, restricciones, maxProblematicos)) return false

  // Evaluar mejora en balance de género
  const desbalanceActual = Math.abs(grupo1.hombres - grupo1.mujeres) + 
                           Math.abs(grupo2.hombres - grupo2.mujeres)

  const gen1 = est1.genero?.toLowerCase()
  const gen2 = est2.genero?.toLowerCase()
  
  const esHombre1 = gen1 === 'masculino' || gen1 === 'hombre' || gen1 === 'm'
  const esHombre2 = gen2 === 'masculino' || gen2 === 'hombre' || gen2 === 'm'

  const delta1 = esHombre1 ? -1 : 1
  const delta2 = esHombre2 ? 1 : -1

  const nuevoDesbalance = Math.abs((grupo1.hombres + delta1) - (grupo1.mujeres - delta1)) +
                          Math.abs((grupo2.hombres + delta2) - (grupo2.mujeres - delta2))
  
  // Evaluar mejora en balance de grado
  const grado1 = est1.ano || est1.grado
  const grado2 = est2.ano || est2.grado
  
  let mejoraGrado = 0
  if (grado1 && grado1 !== grado2) {
    const count1EnGrupo1 = grupo1.grados[grado1] || 0
    const count1EnGrupo2 = grupo2.grados[grado1] || 0
    // Si grupo1 tiene más de este grado y grupo2 tiene menos, mejora
    if (count1EnGrupo1 > count1EnGrupo2) mejoraGrado += 5
  }
  if (grado2 && grado2 !== grado1) {
    const count2EnGrupo1 = grupo1.grados[grado2] || 0
    const count2EnGrupo2 = grupo2.grados[grado2] || 0
    if (count2EnGrupo2 > count2EnGrupo1) mejoraGrado += 5
  }

  return (nuevoDesbalance < desbalanceActual) || (nuevoDesbalance === desbalanceActual && mejoraGrado > 0)
}

function realizarIntercambio(grupo1, grupo2, est1, est2, restricciones = {}) {
  grupo1.integrantes = grupo1.integrantes.filter(e => e !== est1)
  grupo2.integrantes = grupo2.integrantes.filter(e => e !== est2)

  actualizarContadores(grupo1, restricciones)
  actualizarContadores(grupo2, restricciones)

  asignarEstudianteAGrupo(grupo2, est1, restricciones)
  asignarEstudianteAGrupo(grupo1, est2, restricciones)
}

function actualizarContadores(grupo, restricciones = {}) {
  grupo.hombres = 0
  grupo.mujeres = 0
  grupo.especialidades = {}
  grupo.grados = {}
  grupo.problematicos = 0

  for (const est of grupo.integrantes) {
    const genero = est.genero?.toLowerCase()
    if (genero === 'masculino' || genero === 'hombre' || genero === 'm') {
      grupo.hombres++
    } else if (genero === 'femenino' || genero === 'mujer' || genero === 'f') {
      grupo.mujeres++
    }

    if (est.especialidad) {
      grupo.especialidades[est.especialidad] = 
        (grupo.especialidades[est.especialidad] || 0) + 1
    }
    
    const grado = est.ano || est.grado
    if (grado) {
      grupo.grados[grado] = (grupo.grados[grado] || 0) + 1
    }
    
    // Contar problemáticos
    if (restricciones.problematicos && restricciones.problematicos.includes(est.nombre)) {
      grupo.problematicos++
    }
  }
}

function calcularDesequilibrios(grupos) {
  const desbalancesGenero = grupos.map(g => Math.abs(g.hombres - g.mujeres))
  const tamaños = grupos.map(g => g.integrantes.length)
  
  // Calcular desbalance máximo de grados
  const todosGrados = new Set()
  grupos.forEach(g => Object.keys(g.grados || {}).forEach(grado => todosGrados.add(grado)))
  
  let maxDesbalanceGrado = 0
  todosGrados.forEach(grado => {
    const countsPorGrupo = grupos.map(g => (g.grados || {})[grado] || 0)
    const maxCount = Math.max(...countsPorGrupo)
    const minCount = Math.min(...countsPorGrupo)
    maxDesbalanceGrado = Math.max(maxDesbalanceGrado, maxCount - minCount)
  })

  return {
    maxDesbalance: Math.max(...desbalancesGenero),
    maxDesbalanceGrado,
    desviacionTamaño: Math.max(...tamaños) - Math.min(...tamaños)
  }
}

function calcularEstadisticas(grupos) {
  const stats = {
    totalEstudiantes: 0,
    totalHombres: 0,
    totalMujeres: 0,
    porGrupo: [],
    especialidades: {}
  }

  for (const grupo of grupos) {
    stats.totalEstudiantes += grupo.integrantes.length
    stats.totalHombres += grupo.hombres
    stats.totalMujeres += grupo.mujeres

    stats.porGrupo.push({
      nombre: grupo.nombre,
      total: grupo.integrantes.length,
      hombres: grupo.hombres,
      mujeres: grupo.mujeres,
      especialidades: { ...grupo.especialidades }
    })

    for (const [esp, count] of Object.entries(grupo.especialidades)) {
      stats.especialidades[esp] = (stats.especialidades[esp] || 0) + count
    }
  }

  return stats
}

function validarRestricciones(grupos, restricciones) {
  const advertencias = []

  for (const grupo of grupos) {
    const problematicosEnGrupo = grupo.integrantes.filter(e => 
      restricciones.problematicos.includes(e.nombre)
    )
    
    if (problematicosEnGrupo.length > 1) {
      advertencias.push({
        tipo: 'PROBLEMATICOS_JUNTOS',
        mensaje: `⚠️ Problemáticos juntos en ${grupo.nombre}: ${problematicosEnGrupo.map(e => e.nombre).join(', ')}`,
        grupo: grupo.nombre
      })
    }
  }

  for (const pareja of restricciones.parejas) {
    for (const grupo of grupos) {
      const personasEnGrupo = grupo.integrantes.filter(e => pareja.includes(e.nombre))
      
      if (personasEnGrupo.length > 1) {
        advertencias.push({
          tipo: 'PAREJA_JUNTA',
          mensaje: `⚠️ Pareja junta en ${grupo.nombre}: ${pareja.join(' y ')}`,
          grupo: grupo.nombre
        })
      }
    }
  }

  for (const grupoAmigos of restricciones.gruposAmigos) {
    for (const grupo of grupos) {
      const amigosEnGrupo = grupo.integrantes.filter(e => grupoAmigos.includes(e.nombre))
      
      if (amigosEnGrupo.length > 1) {
        advertencias.push({
          tipo: 'GRUPO_AMIGOS_JUNTO',
          mensaje: `⚠️ Grupo de amigos junto en ${grupo.nombre}: ${amigosEnGrupo.map(e => e.nombre).join(', ')}`,
          grupo: grupo.nombre
        })
      }
    }
  }

  return advertencias
}



  // Exporta en formato Excel (HTML table) compatible con .xls
  export function exportarAsignacionExcel(resultado) {
    let html = '<table border="1"><tr><th>Grupo</th><th>Nombre</th><th>Especialidad</th><th>Grado</th><th>Número</th><th>Nombre Madre</th><th>Tel. Madre</th><th>Nombre Padre</th><th>Tel. Padre</th></tr>'

    resultado.grupos.forEach((grupo, index) => {
      grupo.integrantes.forEach(est => {
        html += '<tr>'
        html += `<td>${grupo.nombre || ''}</td>`
        html += `<td>${est.nombre || ''}</td>`
        html += `<td>${est.especialidad || ''}</td>`
        html += `<td>${est.ano || est.grado || ''}</td>`
        html += `<td>${est.cedula || est.numero || ''}</td>`
        html += `<td>${est.nombreMadre || ''}</td>`
        html += `<td>${est.telMadre || ''}</td>`
        html += `<td>${est.nombrePadre || ''}</td>`
        html += `<td>${est.telPadre || ''}</td>`
        html += '</tr>'
      })
      // Fila vacía para separar grupos (excepto después del último)
      if (index < resultado.grupos.length - 1) {
        html += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
      }
    })

    html += '</table>'
    return '\ufeff' + html // BOM para compatibilidad en Excel
  }

export function generarReporte(resultado) {
  let reporte = '=== ASIGNACIÓN DE GRUPOS ===\n\n'
  
  for (const grupo of resultado.grupos) {
    reporte += `${grupo.nombre.toUpperCase()}\n`
    reporte += `Total: ${grupo.integrantes.length} | Hombres: ${grupo.hombres} | Mujeres: ${grupo.mujeres}\n`
    
    if (Object.keys(grupo.especialidades).length > 0) {
      reporte += 'Especialidades: '
      reporte += Object.entries(grupo.especialidades)
        .map(([esp, count]) => `${esp} (${count})`)
        .join(', ')
      reporte += '\n'
    }
    
    reporte += 'Integrantes:\n'
    grupo.integrantes.forEach((est, idx) => {
      reporte += `  ${idx + 1}. ${est.nombre} - ${est.especialidad} - ${est.ano} - ${est.cedula}\n`
    })
    reporte += '\n'
  }
  
  reporte += '=== ESTADÍSTICAS GENERALES ===\n'
  reporte += `Total estudiantes: ${resultado.estadisticas.totalEstudiantes}\n`
  reporte += `Total hombres: ${resultado.estadisticas.totalHombres}\n`
  reporte += `Total mujeres: ${resultado.estadisticas.totalMujeres}\n`
  
  if (resultado.advertencias.length > 0) {
    reporte += '\n=== ADVERTENCIAS ===\n'
    resultado.advertencias.forEach(adv => {
      reporte += `${adv.mensaje}\n`
    })
  }
  
  return reporte
}

// Función de asignación aleatoria con restricciones de género y grupo de origen
export function asignarGruposAleatorios(estudiantes, cantidadGrupos) {
  // Normalizar restricciones
  const restricciones = {
    problematicos: [
      'Terry Anderson Solis Centeno',
      'Dereck Jiménez Durán',
      'Lara Herrera Sebastián',
      'Fabricio Morales Chacón',
      'Angelo Ortiz Alvarado',
      'Roy Madrigal Aguilar',
      'Sebastián Peraza Chinchilla',
      'Ignacio Álvarez Ramírez',
      'Laura Marcela Forbes Segura',
      'Fiorella Sequeira Aguilar',
      'Rebeca de los Angeles Artavia Quirós',
      'María Samantha Orozco Mora',
      'Marlie Monserrat Gómez Ramírez',
    ],
    parejas: [
      ['Stacey Camila Soto Segura', 'Ismael Jesús Astorga Calderón'],
      ['Amanda Ramírez Calderón', 'Santiago Lemuel Arrieta Venegas'],
      ['Marlie Monserrat Gómez Ramírez', 'Sebastián Peraza Chinchilla']
    ],
    gruposAmigos: [
      ['Christopher Castro Picado', 'Angelo Ortiz Alvarado']
    ]
  }

  // Copiar y mezclar estudiantes
  let estudiantesCopia = [...estudiantes].sort(() => Math.random() - 0.5)
  
  // Separar por género
  const hombres = estudiantesCopia.filter(est => {
    const gen = est.genero?.toLowerCase()
    return gen === 'masculino' || gen === 'hombre' || gen === 'm'
  })
  
  const mujeres = estudiantesCopia.filter(est => {
    const gen = est.genero?.toLowerCase()
    return gen === 'femenino' || gen === 'mujer' || gen === 'f'
  })
  
  // Separar por grupo de origen
  const estudiantesPorGrupo = {}
  for (const est of estudiantesCopia) {
    const grupoOrigen = est.grupoOrigen || 'Sin grupo'
    if (!estudiantesPorGrupo[grupoOrigen]) {
      estudiantesPorGrupo[grupoOrigen] = []
    }
    estudiantesPorGrupo[grupoOrigen].push(est)
  }
  
  // Inicializar grupos nuevos
  const gruposNuevos = Array.from({ length: cantidadGrupos }, (_, i) => ({
    nombre: `Grupo ${i + 1}`,
    integrantes: [],
    hombres: 0,
    mujeres: 0,
    gruposOrigenCount: {},
    especialidades: {},
    grados: {},
    problematicos: 0
  }))
  
  // Función para encontrar mejor grupo para un estudiante
  function encontrarMejorGrupoAleatorio(est, gruposDisp) {
    const candidatos = gruposDisp.map((g, idx) => {
      const gen = est.genero?.toLowerCase()
      const esHombre = gen === 'masculino' || gen === 'hombre' || gen === 'm'
      
      // Penalización por desbalance de género
      let puntaje = 0
      const difGen = Math.abs(g.hombres - g.mujeres)
      puntaje -= difGen * 10
      
      // Si es hombre, bonus si el grupo necesita más hombres
      if (esHombre) {
        puntaje += (g.mujeres - g.hombres) * 15
      } else {
        puntaje += (g.hombres - g.mujeres) * 15
      }
      
      // Penalización por duplicar grupo de origen
      const grupoOrigen = est.grupoOrigen || 'Sin grupo'
      const countGrupoOrigen = g.gruposOrigenCount[grupoOrigen] || 0
      puntaje -= countGrupoOrigen * 20
      
      // Bonus por tamaño equilibrado
      puntaje += -Math.abs(g.integrantes.length - (Math.ceil(estudiantesCopia.length / cantidadGrupos)))
      
      return { grupo: g, idx, puntaje }
    })
    
    candidatos.sort((a, b) => b.puntaje - a.puntaje)
    return candidatos[0]?.grupo || gruposDisp[0]
  }
  
  // Asignar hombres interleando entre grupos
  const hombresPorGrupo = Math.floor(hombres.length / cantidadGrupos)
  for (let i = 0; i < hombres.length; i++) {
    const grupoIdx = i % cantidadGrupos
    const grupo = gruposNuevos[grupoIdx]
    const est = hombres[i]
    
    grupo.integrantes.push(est)
    grupo.hombres++
    
    const grupoOrigen = est.grupoOrigen || 'Sin grupo'
    grupo.gruposOrigenCount[grupoOrigen] = (grupo.gruposOrigenCount[grupoOrigen] || 0) + 1
  }
  
  // Asignar mujeres interleando entre grupos
  for (let i = 0; i < mujeres.length; i++) {
    const grupoIdx = i % cantidadGrupos
    const grupo = gruposNuevos[grupoIdx]
    const est = mujeres[i]
    
    grupo.integrantes.push(est)
    grupo.mujeres++
    
    const grupoOrigen = est.grupoOrigen || 'Sin grupo'
    grupo.gruposOrigenCount[grupoOrigen] = (grupo.gruposOrigenCount[grupoOrigen] || 0) + 1
  }
  
  // Calcular estadísticas
  const estadisticas = {
    totalEstudiantes: estudiantesCopia.length,
    totalHombres: hombres.length,
    totalMujeres: mujeres.length,
    desbalancePromedio: gruposNuevos.reduce((sum, g) => sum + Math.abs(g.hombres - g.mujeres), 0) / cantidadGrupos,
    tamañoPromedio: Math.round(estudiantesCopia.length / cantidadGrupos)
  }
  
  // Validar advertencias
  const advertencias = []
  for (const grupo of gruposNuevos) {
    const desbalance = Math.abs(grupo.hombres - grupo.mujeres)
    if (desbalance > 3) {
      advertencias.push({
        tipo: 'DESBALANCE_GENERO',
        mensaje: `⚠️ Desbalance de género en ${grupo.nombre}: ${grupo.hombres} hombres, ${grupo.mujeres} mujeres`,
        grupo: grupo.nombre
      })
    }
  }
  
  return {
    grupos: gruposNuevos,
    estadisticas,
    advertencias,
    metodo: 'aleatorio'
  }
}

export function exportarAsignacionPersonalidadExcel(grupos, estadisticas) {
  let html = `<table border="1" style="border-collapse: collapse; font-family: Arial;">
    <tr style="background-color: #f59e0b;">
      <th style="padding: 8px; font-weight: bold; color: white;">Grupo</th>
      <th style="padding: 8px; font-weight: bold; color: white;">Nombre</th>
      <th style="padding: 8px; font-weight: bold; color: white;">Tel</th>
      <th style="padding: 8px; font-weight: bold; color: white;">Tipo</th>
      <th style="padding: 8px; font-weight: bold; color: white;">Grupo Original</th>
      <th style="padding: 8px; font-weight: bold; color: white;">Posición Ranking</th>
    </tr>`

  grupos.forEach(grupo => {
    grupo.integrantes.forEach((est, idx) => {
      const bgColor = est.puntuacionPersonalidad < 0.5 ? '#dbeafe' : '#fed7aa'
      const tipo = est.puntuacionPersonalidad < 0.5 ? 'Introvertido' : 'Extrovertido'
      
      html += `<tr style="background-color: ${bgColor};">`
      html += `<td style="padding: 8px;">${grupo.nombre}</td>`
      html += `<td style="padding: 8px;">${est.nombre || ''}</td>`
      html += `<td style="padding: 8px;">${est.cedula || ''}</td>`
      html += `<td style="padding: 8px; font-weight: bold;">${tipo}</td>`
      html += `<td style="padding: 8px;">${est.grupoOriginal || ''}</td>`
      html += `<td style="padding: 8px; text-align: center;">${est.posicionRanking || ''}</td>`
      html += `</tr>`
    })
  })

  // Agregar resumen
  html += `<tr style="background-color: #f3f4f6; font-weight: bold;">
    <td colspan="6" style="padding: 12px; text-align: center;">RESUMEN ESTADÍSTICO</td>
  </tr>`

  estadisticas.porGrupo.forEach(grupoStat => {
    html += `<tr style="background-color: #fff7ed;">`
    html += `<td style="padding: 8px; font-weight: bold;">${grupoStat.nombre}</td>`
    html += `<td style="padding: 8px; text-align: center; font-weight: bold;">Total: ${grupoStat.total}</td>`
    html += `<td style="padding: 8px; text-align: center;">Introvertido: ${grupoStat.introvertidos}</td>`
    html += `<td style="padding: 8px; text-align: center;">Extrovertido: ${grupoStat.extrovertidos}</td>`
    html += `<td style="padding: 8px; text-align: center;">Balance: ${grupoStat.balance}</td>`
    html += `<td style="padding: 8px; text-align: center;">${grupoStat.porcentajeIntro}%</td>`
    html += `</tr>`
  })

  html += '</table>'

  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `asignacion_personalidad_${new Date().toISOString().split('T')[0]}.xls`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportarAsignacionAleatoriaExcel(grupos, estadisticas) {
  let html = `<table border="1" style="border-collapse: collapse; font-family: Arial;">
    <tr style="background-color: #3b82f6;">
      <th style="padding: 8px; font-weight: bold; color: white;">Grupo</th>
      <th style="padding: 8px; font-weight: bold; color: white;">Nombre</th>
      <th style="padding: 8px; font-weight: bold; color: white;">Género</th>
      <th style="padding: 8px; font-weight: bold; color: white;">Grupo Original</th>
    </tr>`

  grupos.forEach(grupo => {
    grupo.integrantes.forEach((est, idx) => {
      const bgColor = idx % 2 === 0 ? '#f0f9ff' : '#e0f2fe'
      
      html += `<tr style="background-color: ${bgColor};">`
      html += `<td style="padding: 8px; font-weight: bold;">${grupo.nombre}</td>`
      html += `<td style="padding: 8px;">${est.nombre || ''}</td>`
      html += `<td style="padding: 8px; text-align: center;">${est.genero || ''}</td>`
      html += `<td style="padding: 8px;">${est.grupoOrigen || ''}</td>`
      html += `</tr>`
    })
  })

  // Agregar resumen
  html += `<tr style="background-color: #f3f4f6; font-weight: bold;">
    <td colspan="4" style="padding: 12px; text-align: center;">RESUMEN ESTADÍSTICO</td>
  </tr>`

  grupos.forEach(grupo => {
    html += `<tr style="background-color: #fef3c7;">`
    html += `<td style="padding: 8px; font-weight: bold;">${grupo.nombre}</td>`
    html += `<td style="padding: 8px; text-align: center; font-weight: bold;">Total: ${grupo.integrantes.length}</td>`
    html += `<td style="padding: 8px; text-align: center;">👨 ${grupo.hombres}</td>`
    html += `<td style="padding: 8px; text-align: center;">👩 ${grupo.mujeres}</td>`
    html += `</tr>`
  })

  html += '</table>'

  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + html], { type: 'application/vnd.ms-excel;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `asignacion_aleatoria_${new Date().toISOString().split('T')[0]}.xls`)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
