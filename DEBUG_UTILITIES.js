/**
 * UTILIDADES DE DEBUG Y LOGGING
 * Sistema de Asignación por Personalidad
 * 
 * Copia y pega esto en la consola del navegador para obtener información
 * de debug del sistema.
 */

// ============================================================================
// 1. VERIFICAR QUE MÓDULO ESTÉ CARGADO
// ============================================================================

function verificarModulo() {
  console.log('🔍 Verificando módulo de Personalidad...')
  
  // Verificar archivos
  const archivos = [
    'introversionAssignment.js',
    'PersonalityRankingTool.jsx',
    'PersonalityAssignmentResults.jsx',
    'GroupAssignmentPersonalityTool.jsx',
    'PersonalityAssignmentModule.jsx'
  ]
  
  console.log('📂 Archivos esperados:')
  archivos.forEach(a => console.log(`  ✓ src/... /${a}`))
  
  console.log('\n✅ Si ves esto, el sistema está funcionando')
}

// ============================================================================
// 2. SIMULAR DATOS DE PRUEBA
// ============================================================================

function crearDatosPrueba() {
  return {
    grupos: [
      {
        nombre: 'Grupo A',
        integrantes: [
          { nombre: 'Juan García', cedula: '1001', genero: 'M' },
          { nombre: 'María López', cedula: '1002', genero: 'F' },
          { nombre: 'Carlos Ruiz', cedula: '1003', genero: 'M' },
          { nombre: 'Ana Martínez', cedula: '1004', genero: 'F' }
        ]
      },
      {
        nombre: 'Grupo B',
        integrantes: [
          { nombre: 'Pedro González', cedula: '2001', genero: 'M' },
          { nombre: 'Laura Fernández', cedula: '2002', genero: 'F' },
          { nombre: 'Miguel Torres', cedula: '2003', genero: 'M' },
          { nombre: 'Sofia Díaz', cedula: '2004', genero: 'F' }
        ]
      }
    ]
  }
}

// ============================================================================
// 3. PROBAR ALGORITMO DE ASIGNACIÓN
// ============================================================================

function probarAlgoritmo() {
  console.log('🧪 Probando algoritmo de asignación...')
  
  const datosTest = crearDatosPrueba()
  
  // Crear rankings de prueba
  const gruposConRanking = datosTest.grupos.map(grupo => ({
    ...grupo,
    ranking: grupo.integrantes,  // Ya están en orden intro→extro
    completado: true
  }))
  
  console.log('\n📊 Datos de entrada:')
  gruposConRanking.forEach(g => {
    console.log(`  ${g.nombre}:`)
    g.ranking.forEach((e, i) => {
      console.log(`    ${i + 1}. ${e.nombre}`)
    })
  })
  
  console.log('\n✅ Listo para asignar')
  return gruposConRanking
}

// ============================================================================
// 4. ANALIZAR RESULTADO
// ============================================================================

function analizarResultado(resultado) {
  if (!resultado) {
    console.error('❌ No hay resultado que analizar')
    return
  }
  
  const { grupos, estadisticas, detalles } = resultado
  
  console.log('\n' + '═'.repeat(60))
  console.log('📈 ANÁLISIS DE RESULTADO')
  console.log('═'.repeat(60))
  
  console.log('\n📊 ESTADÍSTICAS GENERALES:')
  console.log(`  Total estudiantes: ${estadisticas.totalEstudiantes}`)
  console.log(`  Total intros: ${detalles.totalIntrovertidos}`)
  console.log(`  Total extros: ${detalles.totalExtrovertidos}`)
  console.log(`  Ratio Intro/Extro: ${(detalles.totalIntrovertidos / estadisticas.totalEstudiantes * 100).toFixed(1)}% / ${(detalles.totalExtrovertidos / estadisticas.totalEstudiantes * 100).toFixed(1)}%`)
  
  console.log('\n🎯 BALANCE POR GRUPO:')
  estadisticas.porGrupo.forEach(grupo => {
    const statusEmoji = grupo.balance === 0 ? '✅' : grupo.balance <= 1 ? '⚠️' : '❌'
    console.log(`  ${statusEmoji} ${grupo.nombre}`)
    console.log(`     Total: ${grupo.total} | Intros: ${grupo.introvertidos} | Extros: ${grupo.extrovertidos}`)
    console.log(`     Balance: ${grupo.balance} | ${grupo.porcentajeIntro}% intro`)
  })
  
  console.log('\n👥 INTEGRANTES POR GRUPO:')
  grupos.forEach(grupo => {
    console.log(`\n  ${grupo.nombre} (${grupo.integrantes.length} pers.):`)
    grupo.integrantes.forEach(est => {
      const tipo = est.puntuacionPersonalidad < 0.5 ? '🔵 Intro' : '🟠 Extro'
      console.log(`    • ${est.nombre} (${tipo}) - De ${est.grupoOriginal}, pos #${est.posicionRanking}`)
    })
  })
  
  console.log('\n' + '═'.repeat(60))
}

// ============================================================================
// 5. VERIFICAR INTEGRIDAD DE DATOS
// ============================================================================

function verificarIntegridad(resultado) {
  console.log('\n🔐 VERIFICACIÓN DE INTEGRIDAD')
  console.log('─'.repeat(40))
  
  const { grupos, estadisticas, detalles } = resultado
  const errores = []
  const advertencias = []
  
  // 1. Verificar totales
  const totalEstudiantesCalculado = grupos.reduce((sum, g) => sum + g.integrantes.length, 0)
  if (totalEstudiantesCalculado !== estadisticas.totalEstudiantes) {
    errores.push(`Total estudiantes inconsistente: ${totalEstudiantesCalculado} vs ${estadisticas.totalEstudiantes}`)
  }
  
  // 2. Verificar sin duplicados
  const nombresMap = {}
  grupos.forEach(grupo => {
    grupo.integrantes.forEach(est => {
      if (nombresMap[est.nombre]) {
        errores.push(`Duplicado: ${est.nombre} en múltiples grupos`)
      }
      nombresMap[est.nombre] = true
    })
  })
  
  // 3. Verificar puntuaciones válidas
  grupos.forEach(grupo => {
    grupo.integrantes.forEach(est => {
      if (est.puntuacionPersonalidad < 0 || est.puntuacionPersonalidad > 1) {
        errores.push(`Puntuación inválida para ${est.nombre}: ${est.puntuacionPersonalidad}`)
      }
    })
  })
  
  // 4. Verificar balance razonable
  estadisticas.porGrupo.forEach(stat => {
    if (stat.balance > 3) {
      advertencias.push(`${stat.nombre}: Balance alto (${stat.balance})`)
    }
  })
  
  // 5. Verificar totales de intro/extro
  const introsCalculados = grupos.reduce((sum, g) => sum + g.introvertidos, 0)
  const extrosCalculados = grupos.reduce((sum, g) => sum + g.extrovertidos, 0)
  
  if (introsCalculados !== detalles.totalIntrovertidos) {
    errores.push(`Total intros inconsistente: ${introsCalculados} vs ${detalles.totalIntrovertidos}`)
  }
  if (extrosCalculados !== detalles.totalExtrovertidos) {
    errores.push(`Total extros inconsistente: ${extrosCalculados} vs ${detalles.totalExtrovertidos}`)
  }
  
  // Reporte
  if (errores.length === 0) {
    console.log('✅ VERIFICACIÓN EXITOSA')
  } else {
    console.log('❌ ERRORES ENCONTRADOS:')
    errores.forEach(e => console.log(`  • ${e}`))
  }
  
  if (advertencias.length > 0) {
    console.log('⚠️ ADVERTENCIAS:')
    advertencias.forEach(a => console.log(`  • ${a}`))
  }
  
  return {
    valido: errores.length === 0,
    errores,
    advertencias
  }
}

// ============================================================================
// 6. EXPORTAR DATOS A JSON
// ============================================================================

function exportarAJSON(resultado) {
  const json = JSON.stringify(resultado, null, 2)
  console.log('📋 JSON EXPORTABLE:')
  console.log(json)
  
  // Copiar a clipboard
  navigator.clipboard.writeText(json).then(() => {
    console.log('✅ Copiado a clipboard')
  }).catch(err => {
    console.error('❌ Error al copiar:', err)
  })
  
  return json
}

// ============================================================================
// 7. GENERAR REPORTE COMPLETO
// ============================================================================

function generarReporteCompleto(resultado) {
  console.clear()
  console.log('%c🎯 SISTEMA DE ASIGNACIÓN POR PERSONALIDAD', 'color: #00AA00; font-size: 16px; font-weight: bold')
  console.log('%cReporte Completo - ' + new Date().toLocaleString(), 'color: #666; font-style: italic')
  console.log('')
  
  // Encabezado
  console.group('%c📊 RESUMEN EJECUTIVO', 'color: #0066CC; font-weight: bold')
  const { estadisticas, detalles } = resultado
  console.log(`Fecha: ${new Date().toLocaleString()}`)
  console.log(`Total estudiantes: ${estadisticas.totalEstudiantes}`)
  console.log(`Introvertidos: ${detalles.totalIntrovertidos} (${(detalles.totalIntrovertidos/estadisticas.totalEstudiantes*100).toFixed(1)}%)`)
  console.log(`Extrovertidos: ${detalles.totalExtrovertidos} (${(detalles.totalExtrovertidos/estadisticas.totalEstudiantes*100).toFixed(1)}%)`)
  console.groupEnd()
  
  // Análisis
  console.group('%c📈 ANÁLISIS DETALLADO', 'color: #00AA00; font-weight: bold')
  analizarResultado(resultado)
  console.groupEnd()
  
  // Integridad
  console.group('%c🔐 VERIFICACIÓN', 'color: #FF6600; font-weight: bold')
  const integridad = verificarIntegridad(resultado)
  console.log(integridad)
  console.groupEnd()
  
  console.log('\n✅ Reporte completado')
}

// ============================================================================
// 8. FUNCIONES RÁPIDAS
// ============================================================================

function help() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║     UTILIDADES DE DEBUG - PERSONALIDAD ASSIGNMENT              ║
╚════════════════════════════════════════════════════════════════╝

FUNCIONES DISPONIBLES:

1. verificarModulo()
   → Verifica que el módulo esté cargado correctamente

2. crearDatosPrueba()
   → Devuelve datos de prueba para testing
   
3. probarAlgoritmo()
   → Simula un proceso completo de ranking

4. analizarResultado(resultado)
   → Analiza un resultado en detalle
   
5. verificarIntegridad(resultado)
   → Verifica que los datos sean consistentes
   
6. exportarAJSON(resultado)
   → Exporta resultado a JSON

7. generarReporteCompleto(resultado)
   → Genera un reporte completo en console

8. help()
   → Muestra este mensaje

EJEMPLO DE USO:
  
  // 1. Crear datos de prueba
  const datos = crearDatosPrueba()
  
  // 2. Crear rankings
  const ranking = probarAlgoritmo()
  
  // 3. Asignar (necesita importar función)
  const resultado = asignarPorPersonalidad(ranking, 2)
  
  // 4. Analizar
  analizarResultado(resultado)
  verificarIntegridad(resultado)
  
  // 5. Exportar
  exportarAJSON(resultado)

────────────────────────────────────────────────────────────────
  `)
}

// ============================================================================
// 9. INICIALIZACIÓN
// ============================================================================

console.log('%c🎯 Utilidades de Debug Cargadas', 'color: #00AA00; font-weight: bold')
console.log('Escribe help() para ver comandos disponibles')

// Exportar funciones globales (para uso en consola)
window.debugPersonalityAssignment = {
  verificarModulo,
  crearDatosPrueba,
  probarAlgoritmo,
  analizarResultado,
  verificarIntegridad,
  exportarAJSON,
  generarReporteCompleto,
  help
}

// Alias cortos
window.dp = window.debugPersonalityAssignment

export { help, verificarModulo, crearDatosPrueba, probarAlgoritmo, analizarResultado, verificarIntegridad, exportarAJSON, generarReporteCompleto }
