// Sistema de asignación automática de grupos con equilibrio y restricciones

export function asignarGruposEquilibrados(estudiantes, grupos, restricciones = {}) {
  const restNormalizadas = {
    problematicos: restricciones.problematicos || [],
    parejas: restricciones.parejas || [],
    gruposAmigos: restricciones.gruposAmigos || []
  }

  if (!estudiantes?.length || !grupos?.length) {
    throw new Error('Se requieren estudiantes y grupos')
  }

  const gruposAsignados = grupos.map(nombre => ({
    nombre,
    integrantes: [],
    hombres: 0,
    mujeres: 0,
    especialidades: {}
  }))

  const estudiantesPendientes = [...estudiantes].sort(() => Math.random() - 0.5)
  const tamañoObjetivo = Math.ceil(estudiantes.length / grupos.length)

  for (const estudiante of estudiantesPendientes) {
    const mejorGrupo = encontrarMejorGrupo(
      gruposAsignados,
      estudiante,
      restNormalizadas,
      tamañoObjetivo
    )
    
    if (mejorGrupo) {
      asignarEstudianteAGrupo(mejorGrupo, estudiante)
    }
  }

  optimizarDistribucion(gruposAsignados, restNormalizadas)

  return {
    grupos: gruposAsignados,
    estadisticas: calcularEstadisticas(gruposAsignados),
    advertencias: validarRestricciones(gruposAsignados, restNormalizadas)
  }
}

function encontrarMejorGrupo(grupos, estudiante, restricciones, tamañoObjetivo) {
  const puntajes = grupos.map(grupo => {
    if (grupo.integrantes.length >= tamañoObjetivo) {
      return { grupo, puntaje: -1000 }
    }

    if (tieneConflictoEnGrupo(estudiante.nombre, grupo, restricciones)) {
      return { grupo, puntaje: -2000 }
    }

    let puntaje = 0

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

    const espacio = tamañoObjetivo - grupo.integrantes.length
    puntaje += espacio * 2
    puntaje += (Math.random() * 6) - 3

    return { grupo, puntaje }
  })

  puntajes.sort((a, b) => b.puntaje - a.puntaje)
  return puntajes[0]?.puntaje > -1000 ? puntajes[0].grupo : null
}

function tieneConflictoEnGrupo(nombre, grupo, restricciones) {
  const integrantes = grupo.integrantes.map(i => i.nombre)
  
  if (restricciones.problematicos.includes(nombre)) {
    if (integrantes.some(n => restricciones.problematicos.includes(n))) {
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

function asignarEstudianteAGrupo(grupo, estudiante) {
  grupo.integrantes.push(estudiante)
  
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
}

function optimizarDistribucion(grupos, restricciones, intentos = 50) {
  for (let i = 0; i < intentos; i++) {
    const mejoro = intentarIntercambio(grupos, restricciones)
    if (!mejoro) break
  }
}

function intentarIntercambio(grupos, restricciones) {
  const desequilibrios = calcularDesequilibrios(grupos)
  
  if (desequilibrios.maxDesbalance < 2) {
    return false
  }

  for (let i = 0; i < grupos.length; i++) {
    for (let j = i + 1; j < grupos.length; j++) {
      const grupo1 = grupos[i]
      const grupo2 = grupos[j]

      for (const est1 of grupo1.integrantes) {
        for (const est2 of grupo2.integrantes) {
          if (intercambioMejora(grupo1, grupo2, est1, est2, restricciones)) {
            realizarIntercambio(grupo1, grupo2, est1, est2)
            return true
          }
        }
      }
    }
  }

  return false
}

function intercambioMejora(grupo1, grupo2, est1, est2, restricciones) {
  const temp1 = { ...grupo1, integrantes: grupo1.integrantes.filter(e => e !== est1) }
  const temp2 = { ...grupo2, integrantes: grupo2.integrantes.filter(e => e !== est2) }
  
  if (tieneConflictoEnGrupo(est2.nombre, temp1, restricciones)) return false
  if (tieneConflictoEnGrupo(est1.nombre, temp2, restricciones)) return false

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

  return nuevoDesbalance < desbalanceActual
}

function realizarIntercambio(grupo1, grupo2, est1, est2) {
  grupo1.integrantes = grupo1.integrantes.filter(e => e !== est1)
  grupo2.integrantes = grupo2.integrantes.filter(e => e !== est2)

  actualizarContadores(grupo1)
  actualizarContadores(grupo2)

  asignarEstudianteAGrupo(grupo2, est1)
  asignarEstudianteAGrupo(grupo1, est2)
}

function actualizarContadores(grupo) {
  grupo.hombres = 0
  grupo.mujeres = 0
  grupo.especialidades = {}

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
  }
}

function calcularDesequilibrios(grupos) {
  const desbalancesGenero = grupos.map(g => Math.abs(g.hombres - g.mujeres))
  const tamaños = grupos.map(g => g.integrantes.length)

  return {
    maxDesbalance: Math.max(...desbalancesGenero),
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

export function parsearCSV(csvString) {
  const lineas = csvString.trim().split('\n')
  if (lineas.length < 2) return []
  
  const headers = lineas[0].split(',').map(h => h.trim().toLowerCase())
  const estudiantes = []
  
  for (let i = 1; i < lineas.length; i++) {
    if (!lineas[i].trim()) continue
    
    const valores = lineas[i].split(',').map(v => v.trim())
    const estudiante = {}
    
    headers.forEach((header, idx) => {
      if (header.includes('nombre')) estudiante.nombre = valores[idx]
      else if (header.includes('género') || header.includes('genero')) estudiante.genero = valores[idx]
      else if (header.includes('especialidad')) estudiante.especialidad = valores[idx]
      else if (header.includes('grado')) estudiante.grado = valores[idx]
      else if (header.includes('número') || header.includes('numero')) estudiante.numero = valores[idx]
    })
    
    if (estudiante.nombre) {
      estudiantes.push(estudiante)
    }
  }
  
  return estudiantes
}

export function exportarAsignacion(resultado) {
  const lineas = ['Grupo,Nombre,Especialidad,Grado,Número,Género']
  
  for (const grupo of resultado.grupos) {
    for (const estudiante of grupo.integrantes) {
      lineas.push([
        grupo.nombre,
        estudiante.nombre,
        estudiante.especialidad || '',
        estudiante.grado || '',
        estudiante.numero || '',
        estudiante.genero || ''
      ].join(','))
    }
  }
  
  return lineas.join('\n')
}

  // Exporta en formato Excel (HTML table) compatible con .xls
  export function exportarAsignacionExcel(resultado) {
    let html = '<table border="1"><tr><th>Grupo</th><th>Nombre</th><th>Especialidad</th><th>Grado</th><th>Número</th></tr>'

    resultado.grupos.forEach(grupo => {
      grupo.integrantes.forEach(est => {
        html += '<tr>'
        html += `<td>${grupo.nombre || ''}</td>`
        html += `<td>${est.nombre || ''}</td>`
        html += `<td>${est.especialidad || ''}</td>`
        html += `<td>${est.ano || est.grado || ''}</td>`
        html += `<td>${est.cedula || est.numero || ''}</td>`
        html += '</tr>'
      })
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

export function exportarAsignacionPersonalidadExcel(grupos, estadisticas) {
  let html = `<table border="1" style="border-collapse: collapse; font-family: Arial;">
    <tr style="background-color: #f59e0b;">
      <th style="padding: 8px; font-weight: bold; color: white;">Grupo</th>
      <th style="padding: 8px; font-weight: bold; color: white;">Nombre</th>
      <th style="padding: 8px; font-weight: bold; color: white;">Cédula</th>
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
    html += `<td style="padding: 8px; text-align: center;">Intro: ${grupoStat.introvertidos}</td>`
    html += `<td style="padding: 8px; text-align: center;">Extro: ${grupoStat.extrovertidos}</td>`
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
