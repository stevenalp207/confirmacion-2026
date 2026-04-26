// Sistema de asignacion de grupos basado en Introversion/Extroversion

const GENERO_MASCULINO = new Set(['masculino', 'hombre', 'm'])
const GENERO_FEMENINO = new Set(['femenino', 'mujer', 'f'])

const RESTRICCIONES_POR_DEFECTO = {
  parejas: [
    ['Stacey Camila Soto Segura', 'Ismael Jesus Astorga Calderon'],
    ['Amanda Ramirez Calderon', 'Santiago Lemuel Arrieta Venegas'],
    ['Alejandro Siles Corrales', 'Abigail Ugarte Araya'],
    ['Marlie Monserrat Gomez Ramirez', 'Sebastian Peraza Chinchilla']
  ],
  gruposAmigos: [
    ['Christopher Castro Picado', 'Angelo Ortiz Alvarado']
  ],
  conflictosFuertes: ['Dereck Jimenez Duran', 'Laura Marcela Forbes Segura', 'Fiorella Sequeira Aguilar'],
  separacionesObligatorias: [
    ['Daniel Del Valle Portuguez', 'Dereck Jimenez Duran'],
    ['Daniel Del Valle Portuguez', 'Angelo Ortiz Alvarado']
  ],
  revoltosos: [
    'Terry Anderson Solis Centeno',
    'Dereck Jimenez Duran',
    'Sebastian Lara Herrera',
    'Fabricio Morales Chacon',
    'Angelo Ortiz Alvarado',
    'Roy Madrigal Aguilar',
    'Sebastian Peraza Chinchilla',
    'Ignacio Alvarez Ramirez',
    'Christopher Castro Picado'
  ],
  maxRevoltososPorGrupo: 2,
  maxMismoOrigenPorGrupo: 3
}

const RANKING_PERSONALIDAD_POR_DEFECTO = {
  fortaleza: [
    'Ismael Jesus Astorga Calderon',
    'Valentina Cerdas Garcia',
    'Fiorella Sequeira Aguilar',
    'Dereck Sebastian Marchena Cordero',
    'Maria Samantha Orozco Mora',
    'Ian Gabriel Solano Monge',
    'Christopher Castro Picado',
    'Daniel Del Valle Portuguez',
    'Jose Miguel Arias Chacon',
    'Sebastian Chinchilla Solano',
    'Joaquin de Jesus Chinchilla Bonilla',
    'Fabricio Daniel Rodriguez Carvajal',
    'Ariana Acevedo Vargas',
    'Santiago Lemuel Arrieta Venegas',
    'Jimena Valverde Rodriguez',
    'Lucia Alvarez Quiros'
  ],
  piedad: [
    'Hubert Andrey Elizondo Bojorge',
    'Nashelle Aguilar Dixon',
    'Sebastian Peraza Chinchilla',
    'Tania Ramirez Romero',
    'Roy Madrigal Aguilar',
    'Kristel Guzman Villalta',
    'Yaroth Paz Cerdas',
    'Melissa Aguilar Monge',
    'Oscar Andres Saborio Fernandez',
    'Barbara Cordoba Cordoba',
    'Marvin Daniel Camacho Cerdas',
    'Isaac Daniel Piedra Chaves',
    'Marypaz de los Angeles Garcia Campos',
    'Gimena Cantillano Valladares',
    'Noah Morales Fernandez'
  ],
  sabiduria: [
    'Alejandro Siles Corrales',
    'Oscar Josue Pereira Camacho',
    'Allan Gabriel Salazar Jimenez',
    'Mia Sofia Sanchez Chaves',
    'Gabriel Campos Araya',
    'Ariel Esteban Mora Calderon',
    'Stacey Camila Soto Segura',
    'Maria Jimena Bonilla Carpio',
    'Amanda Ramirez Calderon',
    'Tifany Rosales Castro',
    'Jimena Solis Vargas',
    'Sebastian Lara Herrera',
    'Gabriel Santiago Amador Gonzalez',
    'Valeria Vallejos Zamora',
    'Matias Corrales Guzman'
  ],
  ciencia: [
    'Matias Moya Dawkins',
    'Ignacio Alvarez Ramirez',
    'Terry Anderson Solis Centeno',
    'Valentina Chinchilla Araya',
    'Liz Arianna Achi Mora',
    'Alessandro Sanchez Portuguez',
    'Maria Fernanda Torres Retana',
    'Valeria Retana Corrales',
    'Santiago Amador Ramirez',
    'Alison Ariana Retana Zuniga',
    'Allison Samantha Montero Melendez',
    'Gabriel Steven Arias Ramirez',
    'Sandra Tanisha Haylock Aguero',
    'Isaac Valverde Sandi',
    'Joshua Gabriel Vargas Perez'
  ],
  entendimiento: [
    'Abigail Ugarte Araya',
    'Dereck Jimenez Duran',
    'Rebeca Monge Segura',
    'Isabella Corrales Ramirez',
    'Isaac Felipe Flores Chavarria',
    'Mariel Vindas Montero',
    'Adilio Garcia Barquero',
    'Merribeth Jimenez Samudio',
    'Bayron Cubillo Arroyo',
    'Josue Monge Mora',
    'Santiago Salas Alfaro',
    'Eva Mc Adam Umana',
    'Felipe Barboza Mena',
    'Julian Andres Quintero Cuenca',
    'Hilary Gomez'
  ],
  consejo: [
    'Sebastian Montero Palacios',
    'Jimena Maria Segura Estrada',
    'Laura Marcela Forbes Segura',
    'Rebeca de los Angeles Artavia Quiros',
    'Daniel Alejando Alfaro Brenes',
    'Mariangel Sandoval Torres',
    'Gabriel Steven Montero Jimenez',
    'Andre Manzanares Leon',
    'Valerie Obando Valverde',
    'Isaac Sibaja Alvarenga',
    'Mariana de los Angeles Rodriguez Perez',
    'Jose Pablo Flores Rojas',
    'Diego Cardoza Mendoza',
    'Isaac Corrales Guzman',
    'Stephanie Lucia Anchia Fuentes'
  ],
  temordedios: [
    'Valeria Vindas Montes',
    'Mariel Lacey Montero',
    'Mathias Andres Gonzalez Alvarado',
    'Fabricio Morales Chacon',
    'Marlie Monserrat Gomez Ramirez',
    'Angelo Ortiz Alvarado',
    'Adrian Alexander Calvo Araya',
    'Valerie Jimena Retana Mendez',
    'Matias Pinzon Oconitrillo',
    'Valery Nicole Jimenez Batista',
    'Jimena de Los Angeles Chinchilla Bonilla',
    'Adriel Aguilar Monge',
    'Jose Julian Fallas Mora',
    'Isabella Segura Mora',
    'Cesar Solano Castillo',
    'Nazareth Garcia Calderon'
  ]
}

export function ordenarRankingPorDefecto(grupoNombre, integrantes) {
  const llaveGrupo = normalizarLlaveGrupo(grupoNombre)
  const rankingBase = RANKING_PERSONALIDAD_POR_DEFECTO[llaveGrupo]

  if (!rankingBase || !integrantes?.length) {
    return [...(integrantes || [])]
  }

  const ordenMap = new Map(rankingBase.map((nombre, idx) => [idx, nombre]))

  return [...integrantes]
    .map(integrante => ({
      integrante,
      idx: encontrarIndiceRanking(integrante.nombre, ordenMap)
    }))
    .sort((a, b) => a.idx - b.idx || a.integrante.nombre.localeCompare(b.integrante.nombre, 'es'))
    .map(item => item.integrante)
}

function encontrarIndiceRanking(nombre, ordenMap) {
  for (const [idx, candidato] of ordenMap.entries()) {
    if (nombresCoinciden(nombre, candidato)) {
      return idx
    }
  }
  return Number.MAX_SAFE_INTEGER
}

function normalizarLlaveGrupo(grupoNombre) {
  return normalizarTexto(grupoNombre).replace(/\s+/g, '')
}

/**
 * Asigna estudiantes a nuevos grupos balanceados por personalidad y restricciones sociales.
 * @param {Array} gruposConRanking - Grupos con estudiantes rankeados (arriba mas extrovertido)
 * @param {Number} cantidadNuevosGrupos - Cantidad de grupos a crear
 * @param {Object} restriccionesPersonalizadas - Restricciones adicionales o sobreescritas
 * @returns {Object} Nuevos grupos balanceados
 */
export function asignarPorPersonalidad(
  gruposConRanking,
  cantidadNuevosGrupos,
  restriccionesPersonalizadas = {}
) {
  if (!gruposConRanking || gruposConRanking.length === 0) {
    throw new Error('Se requieren grupos con ranking')
  }

  if (cantidadNuevosGrupos < 1) {
    throw new Error('Se requiere al menos 1 nuevo grupo')
  }

  const restricciones = normalizarRestricciones(restriccionesPersonalizadas)
  const estudiantes = extraerEstudiantesConPuntuacion(gruposConRanking)
  const grupos = crearGruposVacios(cantidadNuevosGrupos)
  const tamanoMin = Math.floor(estudiantes.length / cantidadNuevosGrupos)
  const tamanoMax = Math.ceil(estudiantes.length / cantidadNuevosGrupos)

  const ordenAsignacion = [...estudiantes].sort((a, b) => prioridadEstudiante(b, restricciones) - prioridadEstudiante(a, restricciones))

  for (const estudiante of ordenAsignacion) {
    asignarMejorGrupo(grupos, estudiante, restricciones, tamanoMin, tamanoMax)
  }

  optimizarPorIntercambio(grupos, restricciones, tamanoMin, tamanoMax)

  const introvertidos = estudiantes.filter(e => e.puntuacionPersonalidad < 0.5)
  const extrovertidos = estudiantes.filter(e => e.puntuacionPersonalidad >= 0.5)

  return {
    grupos,
    estadisticas: calcularEstadisticasPersonalidad(grupos, estudiantes.length, restricciones),
    advertencias: validarRestriccionesPersonalidad(grupos, restricciones),
    detalles: {
      totalIntrovertidos: introvertidos.length,
      totalExtrovertidos: extrovertidos.length,
      totalHombres: estudiantes.filter(e => e.sexo === 'H').length,
      totalMujeres: estudiantes.filter(e => e.sexo === 'M').length,
      totalSinGenero: estudiantes.filter(e => e.sexo === 'N').length
    }
  }
}

function crearGruposVacios(cantidad) {
  return Array.from({ length: cantidad }, (_, idx) => ({
    id: idx,
    nombre: `Grupo ${idx + 1}`,
    integrantes: [],
    introvertidos: 0,
    extrovertidos: 0,
    hombres: 0,
    mujeres: 0,
    sinGenero: 0,
    origenes: {},
    revoltosos: 0,
    conflictosFuertes: 0
  }))
}

function prioridadEstudiante(estudiante, restricciones) {
  let prioridad = Math.abs(estudiante.puntuacionPersonalidad - 0.5)

  if (esNombreEnLista(estudiante.nombre, restricciones.conflictosFuertes)) {
    prioridad += 10
  }
  if (esNombreEnLista(estudiante.nombre, restricciones.revoltosos)) {
    prioridad += 5
  }
  if (apareceEnRelacion(estudiante.nombre, restricciones.separacionesObligatorias) || apareceEnRelacion(estudiante.nombre, restricciones.parejas)) {
    prioridad += 8
  }

  return prioridad
}

function asignarMejorGrupo(grupos, estudiante, restricciones, tamanoMin, tamanoMax) {
  let mejorGrupo = null
  let mejorPuntaje = Number.POSITIVE_INFINITY

  for (const grupo of grupos) {
    if (grupo.integrantes.length >= tamanoMax) continue

    const puntaje = costoInsercion(grupo, estudiante, restricciones, tamanoMin, tamanoMax)
    if (puntaje < mejorPuntaje) {
      mejorPuntaje = puntaje
      mejorGrupo = grupo
    }
  }

  if (!mejorGrupo) {
    // Fallback seguro si todos alcanzaron tamano max por redondeo.
    mejorGrupo = [...grupos].sort((a, b) => a.integrantes.length - b.integrantes.length)[0]
  }

  insertarEnGrupo(mejorGrupo, estudiante, restricciones)
}

function costoInsercion(grupo, estudiante, restricciones, tamanoMin, tamanoMax) {
  let costo = 0

  if (tieneSeparacionObligatoria(grupo, estudiante, restricciones)) {
    costo += 200000
  }

  if (grupo.integrantes.length >= tamanoMax) {
    costo += 50000
  }

  const nuevoTamano = grupo.integrantes.length + 1
  if (nuevoTamano < tamanoMin) {
    costo += 5
  }
  costo += Math.max(0, nuevoTamano - tamanoMax) * 200

  costo += costoGenero(grupo, estudiante) * 25
  costo += costoPersonalidad(grupo, estudiante) * 30
  costo += costoOrigen(grupo, estudiante, restricciones)
  costo += costoRevoltosos(grupo, estudiante, restricciones)
  costo += costoConflictosFuertes(grupo, estudiante, restricciones)

  return costo
}

function costoGenero(grupo, estudiante) {
  if (estudiante.sexo === 'N') return 1

  const nuevoH = grupo.hombres + (estudiante.sexo === 'H' ? 1 : 0)
  const nuevoM = grupo.mujeres + (estudiante.sexo === 'M' ? 1 : 0)
  return Math.abs(nuevoH - nuevoM)
}

function costoPersonalidad(grupo, estudiante) {
  const nuevoIntro = grupo.introvertidos + (estudiante.puntuacionPersonalidad < 0.5 ? 1 : 0)
  const nuevoExtro = grupo.extrovertidos + (estudiante.puntuacionPersonalidad >= 0.5 ? 1 : 0)
  return Math.abs(nuevoIntro - nuevoExtro)
}

function costoOrigen(grupo, estudiante, restricciones) {
  const actual = grupo.origenes[estudiante.grupoOriginal] || 0
  if (actual >= restricciones.maxMismoOrigenPorGrupo) {
    return 4000 + actual * 600
  }
  return actual * 80
}

function costoRevoltosos(grupo, estudiante, restricciones) {
  if (!esNombreEnLista(estudiante.nombre, restricciones.revoltosos)) return 0

  const nuevoTotal = grupo.revoltosos + 1
  if (nuevoTotal > restricciones.maxRevoltososPorGrupo) {
    return 3500 + (nuevoTotal - restricciones.maxRevoltososPorGrupo) * 1000
  }
  return nuevoTotal * 40
}

function costoConflictosFuertes(grupo, estudiante, restricciones) {
  if (!esNombreEnLista(estudiante.nombre, restricciones.conflictosFuertes)) return 0

  const nuevoTotal = grupo.conflictosFuertes + 1
  if (nuevoTotal > 1) {
    return 8000 + nuevoTotal * 1200
  }
  return 0
}

function optimizarPorIntercambio(grupos, restricciones, tamanoMin, tamanoMax) {
  let mejoro = true
  let intentos = 0

  while (mejoro && intentos < 50) {
    mejoro = false
    intentos += 1

    for (let i = 0; i < grupos.length && !mejoro; i++) {
      for (let j = i + 1; j < grupos.length && !mejoro; j++) {
        const g1 = grupos[i]
        const g2 = grupos[j]

        for (const est1 of [...g1.integrantes]) {
          for (const est2 of [...g2.integrantes]) {
            const actual = costoGrupo(g1, restricciones, tamanoMin, tamanoMax) + costoGrupo(g2, restricciones, tamanoMin, tamanoMax)

            const copia1 = clonarGrupo(g1)
            const copia2 = clonarGrupo(g2)
            removerDeGrupo(copia1, est1, restricciones)
            removerDeGrupo(copia2, est2, restricciones)
            insertarEnGrupo(copia1, est2, restricciones)
            insertarEnGrupo(copia2, est1, restricciones)

            const nuevo = costoGrupo(copia1, restricciones, tamanoMin, tamanoMax) + costoGrupo(copia2, restricciones, tamanoMin, tamanoMax)

            if (nuevo + 0.001 < actual) {
              removerDeGrupo(g1, est1, restricciones)
              removerDeGrupo(g2, est2, restricciones)
              insertarEnGrupo(g1, est2, restricciones)
              insertarEnGrupo(g2, est1, restricciones)
              mejoro = true
              break
            }
          }
          if (mejoro) break
        }
      }
    }
  }
}

function costoGrupo(grupo, restricciones, tamanoMin, tamanoMax) {
  let costo = 0
  const tam = grupo.integrantes.length

  if (tam < tamanoMin) costo += (tamanoMin - tam) * 120
  if (tam > tamanoMax) costo += (tam - tamanoMax) * 1200

  costo += Math.abs(grupo.hombres - grupo.mujeres) * 25
  costo += Math.abs(grupo.introvertidos - grupo.extrovertidos) * 30

  for (const conteo of Object.values(grupo.origenes)) {
    if (conteo > restricciones.maxMismoOrigenPorGrupo) {
      costo += (conteo - restricciones.maxMismoOrigenPorGrupo) * 2000
    }
    costo += Math.max(0, conteo - 2) * 50
  }

  if (grupo.revoltosos > restricciones.maxRevoltososPorGrupo) {
    costo += (grupo.revoltosos - restricciones.maxRevoltososPorGrupo) * 3500
  }
  if (grupo.conflictosFuertes > 1) {
    costo += (grupo.conflictosFuertes - 1) * 9000
  }

  const advertencias = validarGrupo(grupo, restricciones)
  costo += advertencias.length * 5000

  return costo
}

function clonarGrupo(grupo) {
  return {
    ...grupo,
    integrantes: [...grupo.integrantes],
    origenes: { ...grupo.origenes }
  }
}

function insertarEnGrupo(grupo, estudiante, restricciones) {
  grupo.integrantes.push(estudiante)

  if (estudiante.puntuacionPersonalidad < 0.5) grupo.introvertidos += 1
  else grupo.extrovertidos += 1

  if (estudiante.sexo === 'H') grupo.hombres += 1
  else if (estudiante.sexo === 'M') grupo.mujeres += 1
  else grupo.sinGenero += 1

  grupo.origenes[estudiante.grupoOriginal] = (grupo.origenes[estudiante.grupoOriginal] || 0) + 1

  if (esNombreEnLista(estudiante.nombre, restricciones.revoltosos)) {
    grupo.revoltosos += 1
  }
  if (esNombreEnLista(estudiante.nombre, restricciones.conflictosFuertes)) {
    grupo.conflictosFuertes += 1
  }
}

function removerDeGrupo(grupo, estudiante, restricciones) {
  const idx = grupo.integrantes.findIndex(e => e.nombre === estudiante.nombre)
  if (idx < 0) return
  grupo.integrantes.splice(idx, 1)

  if (estudiante.puntuacionPersonalidad < 0.5) grupo.introvertidos -= 1
  else grupo.extrovertidos -= 1

  if (estudiante.sexo === 'H') grupo.hombres -= 1
  else if (estudiante.sexo === 'M') grupo.mujeres -= 1
  else grupo.sinGenero -= 1

  if (grupo.origenes[estudiante.grupoOriginal]) {
    grupo.origenes[estudiante.grupoOriginal] -= 1
    if (grupo.origenes[estudiante.grupoOriginal] <= 0) {
      delete grupo.origenes[estudiante.grupoOriginal]
    }
  }

  if (esNombreEnLista(estudiante.nombre, restricciones.revoltosos)) {
    grupo.revoltosos -= 1
  }
  if (esNombreEnLista(estudiante.nombre, restricciones.conflictosFuertes)) {
    grupo.conflictosFuertes -= 1
  }
}

function tieneSeparacionObligatoria(grupo, estudiante, restricciones) {
  const integrantes = grupo.integrantes.map(i => i.nombre)
  const relaciones = [
    ...restricciones.parejas,
    ...restricciones.gruposAmigos,
    ...restricciones.separacionesObligatorias
  ]

  for (const relacion of relaciones) {
    if (incluyeNombre(relacion, estudiante.nombre)) {
      const otraPersona = relacion.find(n => !nombresCoinciden(n, estudiante.nombre))
      if (otraPersona && integrantes.some(n => nombresCoinciden(n, otraPersona))) {
        return true
      }
    }
  }

  if (esNombreEnLista(estudiante.nombre, restricciones.conflictosFuertes)) {
    return grupo.integrantes.some(i => esNombreEnLista(i.nombre, restricciones.conflictosFuertes))
  }

  return false
}

function validarRestriccionesPersonalidad(grupos, restricciones) {
  const advertencias = []

  for (const grupo of grupos) {
    advertencias.push(...validarGrupo(grupo, restricciones))
  }

  return advertencias
}

function validarGrupo(grupo, restricciones) {
  const advertencias = []

  const relaciones = [
    ...restricciones.parejas.map(r => ({ tipo: 'PAREJA_JUNTA', relacion: r })),
    ...restricciones.gruposAmigos.map(r => ({ tipo: 'AMIGOS_JUNTOS', relacion: r })),
    ...restricciones.separacionesObligatorias.map(r => ({ tipo: 'SEPARACION_VIOLADA', relacion: r }))
  ]

  for (const item of relaciones) {
    const encontrados = grupo.integrantes.filter(est => incluyeNombre(item.relacion, est.nombre))
    if (encontrados.length > 1) {
      advertencias.push({
        tipo: item.tipo,
        grupo: grupo.nombre,
        mensaje: `${item.tipo.replaceAll('_', ' ')} en ${grupo.nombre}: ${encontrados.map(e => e.nombre).join(', ')}`
      })
    }
  }

  const fuertes = grupo.integrantes.filter(est => esNombreEnLista(est.nombre, restricciones.conflictosFuertes))
  if (fuertes.length > 1) {
    advertencias.push({
      tipo: 'CONFLICTOS_FUERTES_JUNTOS',
      grupo: grupo.nombre,
      mensaje: `Conflictos fuertes juntos en ${grupo.nombre}: ${fuertes.map(e => e.nombre).join(', ')}`
    })
  }

  if (grupo.revoltosos > restricciones.maxRevoltososPorGrupo) {
    advertencias.push({
      tipo: 'REVOLTOSOS_CONCENTRADOS',
      grupo: grupo.nombre,
      mensaje: `Demasiados revoltosos en ${grupo.nombre}: ${grupo.revoltosos}`
    })
  }

  for (const [origen, total] of Object.entries(grupo.origenes)) {
    if (total > restricciones.maxMismoOrigenPorGrupo) {
      advertencias.push({
        tipo: 'ORIGEN_CONCENTRADO',
        grupo: grupo.nombre,
        mensaje: `Concentracion de ${origen} en ${grupo.nombre}: ${total}`
      })
    }
  }

  return advertencias
}

function calcularEstadisticasPersonalidad(grupos, totalEstudiantes, restricciones) {
  const stats = {
    totalEstudiantes,
    totalHombres: 0,
    totalMujeres: 0,
    totalSinGenero: 0,
    advertencias: validarRestriccionesPersonalidad(grupos, restricciones),
    porGrupo: []
  }

  for (const grupo of grupos) {
    stats.totalHombres += grupo.hombres
    stats.totalMujeres += grupo.mujeres
    stats.totalSinGenero += grupo.sinGenero

    stats.porGrupo.push({
      nombre: grupo.nombre,
      total: grupo.integrantes.length,
      introvertidos: grupo.introvertidos,
      extrovertidos: grupo.extrovertidos,
      hombres: grupo.hombres,
      mujeres: grupo.mujeres,
      sinGenero: grupo.sinGenero,
      revoltosos: grupo.revoltosos,
      origenes: { ...grupo.origenes },
      balance: Math.abs(grupo.introvertidos - grupo.extrovertidos),
      balanceGenero: Math.abs(grupo.hombres - grupo.mujeres),
      porcentajeIntro: grupo.integrantes.length > 0
        ? ((grupo.introvertidos / grupo.integrantes.length) * 100).toFixed(1)
        : 0,
      integrantes: grupo.integrantes.map(e => ({
        nombre: e.nombre,
        cedula: e.cedula,
        genero: e.genero,
        tipo: e.puntuacionPersonalidad < 0.5 ? 'Introvertido' : 'Extrovertido',
        grupoOriginal: e.grupoOriginal,
        posicion: e.posicionRanking
      }))
    })
  }

  return stats
}

/**
 * Extrae estudiantes con puntuacion de personalidad basada en ranking.
 * Primeros lugares = mas extrovertidos, ultimos = mas introvertidos.
 */
function extraerEstudiantesConPuntuacion(gruposConRanking) {
  const estudiantes = []

  gruposConRanking.forEach(grupo => {
    if (!grupo.ranking || grupo.ranking.length === 0) return

    grupo.ranking.forEach((estudiante, index) => {
      const puntuacion = 1 - (index / (grupo.ranking.length - 1 || 1))

      estudiantes.push({
        ...estudiante,
        puntuacionPersonalidad: puntuacion,
        grupoOriginal: grupo.nombre,
        posicionRanking: index + 1,
        sexo: resolverSexo(estudiante.genero)
      })
    })
  })

  return shuffle(estudiantes)
}

function resolverSexo(genero) {
  const valor = (genero || '').toString().trim().toLowerCase()
  if (GENERO_MASCULINO.has(valor)) return 'H'
  if (GENERO_FEMENINO.has(valor)) return 'M'
  return 'N'
}

function normalizarRestricciones(personalizadas) {
  return {
    parejas: [...RESTRICCIONES_POR_DEFECTO.parejas, ...(personalizadas.parejas || [])],
    gruposAmigos: [...RESTRICCIONES_POR_DEFECTO.gruposAmigos, ...(personalizadas.gruposAmigos || [])],
    conflictosFuertes: [...RESTRICCIONES_POR_DEFECTO.conflictosFuertes, ...(personalizadas.conflictosFuertes || [])],
    separacionesObligatorias: [
      ...RESTRICCIONES_POR_DEFECTO.separacionesObligatorias,
      ...(personalizadas.separacionesObligatorias || [])
    ],
    revoltosos: [...RESTRICCIONES_POR_DEFECTO.revoltosos, ...(personalizadas.revoltosos || [])],
    maxRevoltososPorGrupo: personalizadas.maxRevoltososPorGrupo ?? RESTRICCIONES_POR_DEFECTO.maxRevoltososPorGrupo,
    maxMismoOrigenPorGrupo: personalizadas.maxMismoOrigenPorGrupo ?? RESTRICCIONES_POR_DEFECTO.maxMismoOrigenPorGrupo
  }
}

function incluyeNombre(listaNombres, nombre) {
  return listaNombres.some(item => nombresCoinciden(item, nombre))
}

function apareceEnRelacion(nombre, relaciones) {
  return relaciones.some(relacion => incluyeNombre(relacion, nombre))
}

function esNombreEnLista(nombre, lista) {
  return lista.some(item => nombresCoinciden(item, nombre))
}

function nombresCoinciden(nombreA, nombreB) {
  const a = normalizarTexto(nombreA)
  const b = normalizarTexto(nombreB)

  if (!a || !b) return false
  if (a === b) return true

  return a.includes(b) || b.includes(a)
}

function normalizarTexto(texto) {
  return (texto || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\bdereck\b/g, 'derek')
    .replace(/\bsebastian\b/g, 'sebastian')
    .replace(/\bjose\b/g, 'jose')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function shuffle(array) {
  const arr = [...array]
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Valida que los rankings esten completos.
 */
export function validarRankings(gruposConRanking) {
  const errores = []

  gruposConRanking.forEach(grupo => {
    if (!grupo.ranking || grupo.ranking.length === 0) {
      errores.push(`Grupo "${grupo.nombre}" no tiene ranking`)
      return
    }

    if (grupo.ranking.length < 2) {
      errores.push(`Grupo "${grupo.nombre}" debe tener al menos 2 integrantes rankeados`)
    }
  })

  return {
    valido: errores.length === 0,
    errores
  }
}
