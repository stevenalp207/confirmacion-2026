import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Shield, RefreshCw, Save, Users, CheckCircle, ExternalLink, AlertTriangle, Download, MessageCircle } from 'lucide-react';
import { calendarioSeguridad, seleccionarCatequistasAleatorios, getCatequistasDisponibles, generarAsignacionesEquitativas } from '../data/seguridadCalendario';
import { supabase } from '../config/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const GROUP_STYLES = {
  piedad: {
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800'
  },
  consejo: {
    text: 'text-purple-700',
    badge: 'bg-purple-100 text-purple-800'
  },
  fortaleza: {
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800'
  },
  sabiduria: {
    text: 'text-yellow-700',
    badge: 'bg-yellow-100 text-yellow-800'
  },
  ciencia: {
    text: 'text-green-700',
    badge: 'bg-green-100 text-green-800'
  },
  temor: {
    text: 'text-[oklch(28.6%_0.066_53.813)]',
    badge: 'bg-[oklch(28.6%_0.066_53.813_/_0.18)] text-[oklch(28.6%_0.066_53.813)]'
  },
  entendimiento: {
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-800'
  }
};

const normalizeGroupName = (value = '') => {
  return value
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
};

function SeguridadModule({ onBack, user }) {
  const [asignaciones, setAsignaciones] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  

  // Cargar asignaciones guardadas desde Supabase
  const loadAsignaciones = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('seguridad_asignaciones')
        .select('*')
        .order('catequesis_num', { ascending: true });

      if (error) {
        console.error('Error loading asignaciones:', error);
      } else if (data) {
        const asignacionesMap = {};
        data.forEach(item => {
          asignacionesMap[item.catequesis_num] = {
            catequistas: item.catequistas || [],
            fecha_asignacion: item.fecha_asignacion
          };
        });
        setAsignaciones(asignacionesMap);
      }
    } catch (error) {
      console.error('Error loading asignaciones:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAsignaciones();
  }, [loadAsignaciones]);

  // Generar asignaciones aleatorias para una catequesis
  const generarAsignacion = async (numeroCatequesis) => {
    const seleccionados = seleccionarCatequistasAleatorios(numeroCatequesis, 3);
    const catequistasNombres = seleccionados.map(c => c.nombre);

    try {
      setSaving(true);
      const { error } = await supabase
        .from('seguridad_asignaciones')
        .upsert({
          catequesis_num: numeroCatequesis,
          catequistas: catequistasNombres,
          fecha_asignacion: new Date().toISOString(),
          asignado_por: user?.usuario || 'sistema'
        }, {
          onConflict: 'catequesis_num'
        });

      if (error) {
        console.error('Error saving asignacion:', error);
        alert('Error al guardar la asignación');
        return;
      }

      setAsignaciones(prev => ({
        ...prev,
        [numeroCatequesis]: {
          catequistas: catequistasNombres,
          fecha_asignacion: new Date().toISOString()
        }
      }));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar asignación');
    } finally {
      setSaving(false);
    }
  };

  // Generar todas las asignaciones de forma EQUITATIVA
  const generarTodasAsignaciones = async () => {
    if (!confirm('¿Estás seguro de que quieres generar asignaciones EQUITATIVAS para TODAS las catequesis? Esto sobrescribirá las asignaciones existentes.')) {
      return;
    }

    setSaving(true);
    try {
      // Usar algoritmo equitativo que distribuye las asignaciones
      const { asignaciones: nuevasAsignaciones, conteo } = generarAsignacionesEquitativas();

      for (const [numCatequesis, catequistasNombres] of Object.entries(nuevasAsignaciones)) {
        await supabase
          .from('seguridad_asignaciones')
          .upsert({
            catequesis_num: parseInt(numCatequesis),
            catequistas: catequistasNombres,
            fecha_asignacion: new Date().toISOString(),
            asignado_por: user?.usuario || 'sistema'
          }, {
            onConflict: 'catequesis_num'
          });
      }

      await loadAsignaciones();
      
      // Mostrar resumen del conteo
      const resumen = Object.entries(conteo)
        .sort((a, b) => b[1] - a[1])
        .map(([nombre, veces]) => `${nombre.split(' ')[0]}: ${veces}`)
        .join('\n');
      
      alert(`Asignaciones generadas equitativamente.\n\nVeces asignado por catequista:\n${resumen}`);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al generar asignaciones');
    } finally {
      setSaving(false);
    }
  };

  // Compartir asignación en WhatsApp
  const compartirWhatsApp = (catequesis) => {
    const asignacion = asignaciones[catequesis.numero];
    if (!asignacion?.catequistas?.length) return;

    const fechaActual = new Date().toLocaleDateString('es-CR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const grupo = catequesis.grupoPresentador;
    const [catequista1, catequista2, catequista3] = asignacion.catequistas;

    const texto = `-- Cronograma de Cuido Catequesis #${catequesis.numero} / ${fechaActual} --

*Entrada de la iglesia (2 personas mínimo):*
  • ${grupo} (1 del grupo que expone)
  • ${catequista1 || 'Sin asignar'} (catequista)

*Escuela:* ${grupo} (1 del grupo que expone)

*Calle principal de la iglesia al patio y mural de peces:* ${catequista2 || 'Sin asignar'}

*Pista de atletismo:* ${catequista3 || 'Sin asignar'}

Favor estar en sus lugares correspondientes a la hora de la salida.`;

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(texto)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Descargar PDF con todas las asignaciones
  const descargarPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'letter'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Anchos de columnas
    const colWidths = { col0: 10, col1: 50, col2: 28, col3: 80 };
    const tableWidth = colWidths.col0 + colWidths.col1 + colWidths.col2 + colWidths.col3;
    const marginLeft = (pageWidth - tableWidth) / 2;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Asignaciones de Seguridad - Confirmación 2026', pageWidth / 2, 12, { align: 'center' });

    const tableData = calendarioSeguridad.map(cat => {
      const asignacion = asignaciones[cat.numero];
      const catequistasTexto = asignacion?.catequistas?.join(', ') || 'Sin asignar';
      return [
        `#${cat.numero}`,
        cat.nombre,
        cat.grupoPresentador,
        catequistasTexto
      ];
    });

    autoTable(doc, {
      head: [['#', 'Catequesis', 'Grupo Presentador', 'Asignados a Seguridad']],
      body: tableData,
      startY: 18,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        lineColor: [0, 0, 0],
        lineWidth: 0.2,
        textColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center',
        fontSize: 8.5
      },
      columnStyles: {
        0: { cellWidth: colWidths.col0, halign: 'center' },
        1: { cellWidth: colWidths.col1 },
        2: { cellWidth: colWidths.col2, halign: 'center' },
        3: { cellWidth: colWidths.col3 }
      },
      margin: { left: marginLeft, right: marginLeft }
    });

    doc.save('Asignaciones_Seguridad_2026.pdf');
  };

  const getGrupoColor = (grupo) => {
    const groupKey = normalizeGroupName(grupo);

    if (groupKey.includes('temor')) return GROUP_STYLES.temor.badge;

    return GROUP_STYLES[groupKey]?.badge || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-4 sm:py-8 px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold transition mb-3 sm:mb-4 text-sm sm:text-base"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            Volver al Menú Principal
          </button>
          
          <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6">
            <div className="text-center mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center justify-center gap-2 sm:gap-3">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                Seguridad
              </h1>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                Asignación aleatoria de catequistas para seguridad en cada catequesis
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {import.meta.env.DEV && (
                <button
                  onClick={generarTodasAsignaciones}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base transition-colors shadow-md disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${saving ? 'animate-spin' : ''}`} />
                  Generar Todas
                </button>
              )}
              <button
                onClick={descargarPDF}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base transition-colors shadow-md"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                Descargar PDF
              </button>
            </div>

            {/* Enlace al protocolo original */}
            <div className="flex justify-center mt-4">
              <a
                href="https://docs.google.com/document/d/1llOji7MEnfZLt6P6kgWlXg7VqUd9v0J6/edit?usp=sharing&ouid=112234919645278192952&rtpof=true&sd=true"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Ver Protocolo de Seguridad (Google Docs)
              </a>
            </div>
            
          </div>
        </div>

        {/* Tabla de Asignaciones */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          {loading ? (
            <div className="flex justify-center items-center p-8">
              <div className="text-gray-600 text-sm sm:text-base">Cargando asignaciones...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">#</th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Catequesis</th>
                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">Grupo Presentador</th>
                    <th className="px-3 py-3 text-left text-xs sm:text-sm font-semibold text-gray-700">Asignados a Seguridad</th>
                    <th className="px-3 py-3 text-center text-xs sm:text-sm font-semibold text-gray-700">WhatsApp</th>
                  </tr>
                </thead>
                <tbody>
                  {calendarioSeguridad.map((catequesis) => {
                    const asignacion = asignaciones[catequesis.numero];
                    const tieneAsignacion = asignacion?.catequistas?.length > 0;
                    
                    return (
                      <tr key={catequesis.numero} className="border-t border-gray-200 hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm font-bold text-gray-800">
                          {catequesis.numero}
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-800">
                          {catequesis.nombre}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getGrupoColor(catequesis.grupoPresentador)}`}>
                            {catequesis.grupoPresentador}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {tieneAsignacion ? (
                            <div className="flex flex-wrap gap-1">
                              {asignacion.catequistas.map((nombre, idx) => (
                                <span 
                                  key={idx} 
                                  className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium"
                                >
                                  {nombre}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm flex items-center gap-1">
                              <AlertTriangle className="w-4 h-4" />
                              Sin asignar
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => compartirWhatsApp(catequesis)}
                            disabled={!tieneAsignacion}
                            className={`p-2 rounded-lg transition ${tieneAsignacion ? 'bg-green-500 hover:bg-green-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            title={tieneAsignacion ? 'Enviar a WhatsApp' : 'Sin asignación para enviar'}
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Leyenda */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-sm text-gray-700 mb-3">Información:</h4>
            <ul className="text-xs sm:text-sm text-gray-600 space-y-1">
              <li>• El <strong>Grupo Presentador</strong> es el grupo que da la catequesis ese día y cubre accesos (iglesia y soda).</li>
              <li>• Se seleccionan <strong>3 catequistas</strong> para cubrir calle, escuela y pista.</li>
              <li>• La distribución es <strong>equitativa</strong>: cada catequista cubre aproximadamente la misma cantidad de veces.</li>
              <li>• Los catequistas de <strong>Formación</strong> no participan en seguridad.</li>
              <li>• Haz clic en el botón de <strong>WhatsApp</strong> para enviar el cronograma al grupo que elijas.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeguridadModule;
