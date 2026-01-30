import { useState, useEffect } from 'react'
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'
import { Pencil, ArrowLeft } from 'lucide-react'
import logo from '../assets/logo.png'
import ConfirmationModal from '../components/ConfirmationModal'

function BoletasModule({ onBack, user }) {
  // Cargar datos desde localStorage al inicializar el estado
  const [formData, setFormData] = useState(() => {
    try {
      const savedData = localStorage.getItem('confirmacionBoletasData')
      if (savedData) {
        return JSON.parse(savedData)
      }
    } catch (error) {
      console.error('Error loading saved data:', error)
    }
    return {
      // Datos del Confirmando
      nombre: '',
      idCatequizando: '',
      
      // Bautismo
      parroquia: '',
      libro: '',
      folio: '',
      asiento: '',
      fechabautismo: '',
      
      // Padres
      nombreMadre: '',
      idMadre: '',
      nombrePadre: '',
      idPadre: '',
      
      // Padrinos
      nombrePadrino: '',
      idPadrino: '',
      parroquiaPadrino: '',
    }
  })

  // Lista de boletas guardadas
  const [boletasList, setBoletasList] = useState(() => {
    try {
      const savedList = localStorage.getItem('confirmacionBoletasList')
      if (savedList) {
        return JSON.parse(savedList)
      }
    } catch (error) {
      console.error('Error loading boletas list:', error)
    }
    return []
  })

  // Estado para animación
  const [lastAddedIndex, setLastAddedIndex] = useState(null)

  // Estado para edición
  const [editingId, setEditingId] = useState(null)

  // Estado para modal
  const [modal, setModal] = useState({ isOpen: false, type: 'success', title: '', message: '' })

  // Guardar en localStorage cuando cambian los datos del formulario
  useEffect(() => {
    localStorage.setItem('confirmacionBoletasData', JSON.stringify(formData))
  }, [formData])

  // Guardar lista de boletas en localStorage
  useEffect(() => {
    localStorage.setItem('confirmacionBoletasList', JSON.stringify(boletasList))
  }, [boletasList])

  // Función para formatear IDs (solo números y guiones)
  const formatID = (value) => {
    return value.replace(/[^0-9-]/g, '')
  }

  // Función para convertir texto a Title Case
  const toTitleCase = (str) => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Función para convertir fecha a formato legible
  const formatDateToReadable = (dateStr) => {
    if (!dateStr) return ''
    
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ]
    
    const date = new Date(dateStr + 'T00:00:00')
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    return `${day} de ${month} de ${year}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    // Formatear IDs (solo números y guiones)
    if (name.includes('id') || name.includes('Id')) {
      formattedValue = formatID(value)
    }

    // Formatear nombres a Title Case
    if (name.includes('nombre') || name.includes('Nombre')) {
      formattedValue = toTitleCase(value)
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }))
  }

  // Validar datos del formulario
  const validateFormData = () => {
    if (!formData.nombre.trim()) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Campo Requerido',
        message: 'Por favor ingrese el nombre del confirmando.'
      })
      return false
    }
    if (!formData.idCatequizando.trim()) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Campo Requerido',
        message: 'Por favor ingrese la identificación del confirmando.'
      })
      return false
    }
    return true
  }

  const handleCloseModal = () => {
    setModal({ isOpen: false, type: 'success', title: '', message: '' })
  }

  // Añadir boleta a la lista o actualizar existente
  const addToList = () => {
    if (!validateFormData()) return

    const boletaData = {
      nombre: formData.nombre,
      'id-catequizando': formData.idCatequizando,
      parroquia: formData.parroquia,
      libro: formData.libro,
      folio: formData.folio,
      asiento: formData.asiento,
      fechabautismo: formatDateToReadable(formData.fechabautismo),
      'nombre-madre': formData.nombreMadre,
      'id-madre': formData.idMadre,
      'nombre-padre': formData.nombrePadre,
      'id-padre': formData.idPadre,
      'nombre-padrino': formData.nombrePadrino,
      'id-padrino': formData.idPadrino,
      'parroquia-padrino': formData.parroquiaPadrino,
    }

    if (editingId !== null) {
      // Actualizar boleta existente
      setBoletasList(prev => prev.map(boleta => 
        boleta.id === editingId ? { ...boletaData, id: editingId } : boleta
      ))
      setEditingId(null)
    } else {
      // Añadir nueva boleta
      const newBoleta = {
        id: Date.now(),
        ...boletaData
      }
      setBoletasList(prev => [...prev, newBoleta])
      setLastAddedIndex(boletasList.length)
      
      // Remover animación después de 1 segundo
      setTimeout(() => setLastAddedIndex(null), 1000)
    }
    
    // Limpiar formulario
    clearForm()
  }

  // Limpiar formulario
  const clearForm = () => {
    setFormData({
      nombre: '',
      idCatequizando: '',
      parroquia: '',
      libro: '',
      folio: '',
      asiento: '',
      fechabautismo: '',
      nombreMadre: '',
      idMadre: '',
      nombrePadre: '',
      idPadre: '',
      nombrePadrino: '',
      idPadrino: '',
      parroquiaPadrino: '',
    })
  }

  // Editar boleta - cargar datos en el formulario
  const editBoleta = (boleta) => {
    // Convertir formato de fecha legible de vuelta a formato YYYY-MM-DD para el input
    let dateValue = ''
    if (boleta.fechabautismo) {
      // Si la fecha ya está en formato legible, intentar convertirla de vuelta
      const readableMatch = boleta.fechabautismo.match(/(\d+) de (\w+) de (\d{4})/)
      if (readableMatch) {
        const months = {
          'enero': '01', 'febrero': '02', 'marzo': '03', 'abril': '04',
          'mayo': '05', 'junio': '06', 'julio': '07', 'agosto': '08',
          'septiembre': '09', 'octubre': '10', 'noviembre': '11', 'diciembre': '12'
        }
        const day = readableMatch[1].padStart(2, '0')
        const month = months[readableMatch[2]]
        const year = readableMatch[3]
        dateValue = `${year}-${month}-${day}`
      } else {
        dateValue = boleta.fechabautismo
      }
    }

    setFormData({
      nombre: boleta.nombre,
      idCatequizando: boleta['id-catequizando'],
      parroquia: boleta.parroquia,
      libro: boleta.libro,
      folio: boleta.folio,
      asiento: boleta.asiento,
      fechabautismo: dateValue,
      nombreMadre: boleta['nombre-madre'],
      idMadre: boleta['id-madre'],
      nombrePadre: boleta['nombre-padre'],
      idPadre: boleta['id-padre'],
      nombrePadrino: boleta['nombre-padrino'],
      idPadrino: boleta['id-padrino'],
      parroquiaPadrino: boleta['parroquia-padrino'],
    })
    setEditingId(boleta.id)
    
    // Scroll al formulario
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Cancelar edición
  const cancelEdit = () => {
    clearForm()
    setEditingId(null)
  }

  // Eliminar boleta de la lista
  const deleteBoleta = (id) => {
    setBoletasList(prev => prev.filter(boleta => boleta.id !== id))
  }

  // Generar documento con todas las boletas
  const generateAllDocuments = async () => {
    if (boletasList.length === 0) {
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Lista Vacía',
        message: 'No hay boletas en la lista para generar. Agregue al menos una boleta primero.'
      })
      return
    }

    try {
      // Fetch the template from public folder
      const response = await fetch('/template.docx')
      if (!response.ok) {
        throw new Error('No se pudo cargar la plantilla. Asegúrese de que template.docx existe en la carpeta public/')
      }
      
      // Convert to array buffer
      const arrayBuffer = await response.arrayBuffer()
      
      // Load the template with PizZip
      const zip = new PizZip(arrayBuffer)
      
      // Create docxtemplater instance
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      })
      
      // Set data with the boletas array
      doc.setData({ boletas: boletasList })
      
      // Render the document (replace all tags)
      doc.render()
      
      // Generate the output as a blob
      const blob = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      })
      
      // Download the file
      const timestamp = new Date().toISOString().split('T')[0]
      saveAs(blob, `Boletas_Confirmacion_${timestamp}_${boletasList.length}.docx`)
      
      setModal({
        isOpen: true,
        type: 'success',
        title: 'Documento Generado',
        message: `Se generó exitosamente el documento con ${boletasList.length} boleta(s). El archivo se ha descargado.`
      })
    } catch (error) {
      console.error('Error al generar el documento:', error)
      setModal({
        isOpen: true,
        type: 'error',
        title: 'Error al Generar',
        message: `No se pudo generar el documento: ${error.message}`
      })
    }
  }

  return (
    <>
      <ConfirmationModal
        isOpen={modal.isOpen}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onConfirm={handleCloseModal}
        confirmText="Entendido"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al Menú Principal
          </button>
        </div>

        <div className="text-center mb-8">
          <img src={logo} alt="Logo" className="h-40 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-blue-900 mb-2">
            Generador de Boletas de Confirmación
          </h1>
          <p className="text-blue-600">
            Complete el formulario para añadir boletas a la lista
          </p>
          {user && (
            <p className="text-sm text-gray-600 mt-2">
              Usuario: <span className="font-semibold">{user.usuario}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna Izquierda - Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Datos del Confirmando */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Datos del Confirmando
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Nombre completo del confirmando"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Identificación
                </label>
                <input
                  type="text"
                  name="idCatequizando"
                  value={formData.idCatequizando}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Cédula o documento de identidad"
                />
              </div>
            </div>
          </div>

          {/* Información de Bautismo */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Información de Bautismo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Libro
                </label>
                <input
                  type="text"
                  name="libro"
                  value={formData.libro}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Ej: 15"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Folio
                </label>
                <input
                  type="text"
                  name="folio"
                  value={formData.folio}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Ej: 234"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asiento
                </label>
                <input
                  type="text"
                  name="asiento"
                  value={formData.asiento}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Ej: 56"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Bautismo
                </label>
                <input
                  type="date"
                  name="fechabautismo"
                  value={formData.fechabautismo}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parroquia de Bautismo
                </label>
                <input
                  type="text"
                  name="parroquia"
                  value={formData.parroquia}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Nombre de la parroquia"
                />
              </div>
            </div>
          </div>

          {/* Información de Padres */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Información de Padres
            </h2>
            
            {/* Padre */}
            <div className="bg-white rounded-lg p-4 mb-3 border-2 border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 uppercase tracking-wide">Padre</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Padre
                  </label>
                  <input
                    type="text"
                    name="nombrePadre"
                    value={formData.nombrePadre}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Nombre completo del padre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identificación del Padre
                  </label>
                  <input
                    type="text"
                    name="idPadre"
                    value={formData.idPadre}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="ID del padre"
                  />
                </div>
              </div>
            </div>

            {/* Madre */}
            <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
              <h3 className="text-sm font-semibold text-blue-800 mb-3 uppercase tracking-wide">Madre</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Madre
                  </label>
                  <input
                    type="text"
                    name="nombreMadre"
                    value={formData.nombreMadre}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Nombre completo de la madre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identificación de la Madre
                  </label>
                  <input
                    type="text"
                    name="idMadre"
                    value={formData.idMadre}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="ID de la madre"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Información de Padrinos */}
          <div className="bg-blue-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Información de Padrinos
            </h2>
            <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Padrino
                  </label>
                  <input
                    type="text"
                    name="nombrePadrino"
                    value={formData.nombrePadrino}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="Nombre completo del padrino"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Identificación del Padrino
                  </label>
                  <input
                    type="text"
                    name="idPadrino"
                    value={formData.idPadrino}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    placeholder="ID del padrino"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Parroquia del Padrino
                </label>
                <input
                  type="text"
                  name="parroquiaPadrino"
                  value={formData.parroquiaPadrino}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  placeholder="Parroquia del padrino"
                />
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={addToList}
              className={`${
                editingId !== null
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                  : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
              } text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200 flex items-center space-x-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {editingId !== null ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                )}
              </svg>
              <span>{editingId !== null ? 'Actualizar Registro' : 'Añadir a la Lista'}</span>
            </button>
            
            {editingId !== null && (
              <button
                onClick={cancelEdit}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200 flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancelar Edición</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Columna Derecha - Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-blue-900 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Lista de Boletas
            </h2>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-900">{boletasList.length}</p>
              <p className="text-sm text-blue-600">Boletas listas para generar</p>
            </div>
          </div>

          {boletasList.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-16 h-16 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm">No hay boletas en la lista</p>
              <p className="text-xs mt-1">Complete el formulario y presione "Añadir a la Lista"</p>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {boletasList.map((boleta, index) => (
                  <div
                    key={boleta.id}
                    className={`bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border-2 border-blue-200 flex items-center justify-between transition-all duration-500 ${
                      lastAddedIndex === index ? 'animate-pulse scale-105' : ''
                    } ${editingId === boleta.id ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-blue-900 truncate">{boleta.nombre}</p>
                      <p className="text-xs text-blue-600 truncate">ID: {boleta['id-catequizando']}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                      <button
                        onClick={() => editBoleta(boleta)}
                        className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 transition duration-200"
                        title="Editar boleta"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteBoleta(boleta.id)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition duration-200"
                        title="Eliminar boleta"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={generateAllDocuments}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition duration-200 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Descargar Todas las Boletas</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>

    <div className="mt-8 text-center text-sm text-gray-600 max-w-7xl mx-auto">
      <p>Los datos se guardan automáticamente en su navegador</p>
      <p className="text-xs text-gray-500 mt-2">
        Cada boleta se generará en una página separada en el documento Word
      </p>
    </div>
        </div>
      </div>
    </>
  )
}

export default BoletasModule
