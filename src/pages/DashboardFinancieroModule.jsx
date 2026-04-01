import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Wallet, AlertCircle, CheckCircle2, Eye, Download } from 'lucide-react';
import { supabase } from '../config/supabase';
import { catequistas } from '../data/catequistas';
import { gruposData } from '../data/grupos';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { canAccess } from '../utils/permissions';

function DashboardFinancieroModule({ onBack, user }) {
  const canViewDashboard = canAccess('dashboard-financiero', user);
  const [ingresos, setIngresos] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [pagosEstudiantes, setPagosEstudiantes] = useState([]);
  const [pagosCatequistas, setPagosCatequistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  if (!canViewDashboard) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-lg w-full text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">Acceso restringido</h1>
          <p className="text-gray-600 text-sm sm:text-base">
            No tienes permisos para ver el dashboard financiero.
          </p>
          <button
            onClick={onBack}
            className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ingresosRes, gastosRes, pagosEstudiantesRes, pagosCatequistasRes] = await Promise.all([
        supabase.from('ingresos_confirmacion').select('*'),
        supabase.from('gastos_confirmacion').select('*'),
        supabase.from('pagos_retiro').select('*'),
        supabase.from('pagos_catequistas').select('*')
      ]);

      if (ingresosRes.data) setIngresos(ingresosRes.data);
      if (gastosRes.data) setGastos(gastosRes.data);
      if (pagosEstudiantesRes.data) setPagosEstudiantes(pagosEstudiantesRes.data);
      if (pagosCatequistasRes.data) setPagosCatequistas(pagosCatequistasRes.data);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const totales = useMemo(() => {
    const totalIngresos = ingresos.reduce((sum, i) => sum + (i.monto || 0), 0);
    const totalGastos = gastos.reduce((sum, g) => sum + (g.monto || 0), 0);
    const totalPagosEstudiantes = pagosEstudiantes.reduce((sum, p) => sum + (p.monto_pagado || 0), 0);
    const totalPagosCatequistas = pagosCatequistas.reduce((sum, p) => sum + (p.monto_pagado || 0), 0);
    const totalPagosRetiro = totalPagosEstudiantes + totalPagosCatequistas;
    const balance = totalIngresos + totalPagosRetiro - totalGastos;
    
    return {
      ingresos: totalIngresos,
      gastos: totalGastos,
      pagosRetiro: totalPagosRetiro,
      pagosEstudiantes: totalPagosEstudiantes,
      pagosCatequistas: totalPagosCatequistas,
      balance,
      ingresosTotales: totalIngresos + totalPagosRetiro
    };
  }, [ingresos, gastos, pagosEstudiantes, pagosCatequistas]);

  // Gastos por categoría
  const gastosPorCategoria = useMemo(() => {
    const categorias = {};
    gastos.forEach(g => {
      const cat = g.categoria || 'otros';
      categorias[cat] = (categorias[cat] || 0) + (g.monto || 0);
    });
    return Object.entries(categorias).map(([nombre, monto]) => ({ nombre, monto }))
      .sort((a, b) => b.monto - a.monto);
  }, [gastos]);

  // Ingresos por categoría
  const ingresosPorCategoria = useMemo(() => {
    const categorias = {};
    ingresos.forEach(i => {
      const cat = i.categoria || 'otros';
      categorias[cat] = (categorias[cat] || 0) + (i.monto || 0);
    });
    return Object.entries(categorias).map(([nombre, monto]) => ({ nombre, monto }))
      .sort((a, b) => b.monto - a.monto);
  }, [ingresos]);

  // Totales reales desde los datos
  const TOTAL_ESTUDIANTES_ESPERADO = useMemo(() => {
    return Object.values(gruposData).reduce((sum, grupo) => 
      sum + Object.keys(grupo.estudiantes).length, 0
    );
  }, []);
  
  const TOTAL_CATEQUISTAS_ESPERADO = catequistas.length;

  // Pagos del retiro stats - Estudiantes
  const pagosEstudiantesStats = useMemo(() => {
    const registrados = pagosEstudiantes.length;
    const completos = pagosEstudiantes.filter(p => (p.monto_pagado || 0) >= 50000).length;
    const parciales = pagosEstudiantes.filter(p => (p.monto_pagado || 0) > 0 && (p.monto_pagado || 0) < 50000).length;
    const pendientes = TOTAL_ESTUDIANTES_ESPERADO - registrados;
    
    return { total: TOTAL_ESTUDIANTES_ESPERADO, registrados, completos, parciales, pendientes };
  }, [pagosEstudiantes]);

  // Pagos del retiro stats - Catequistas
  const pagosCatequistasStats = useMemo(() => {
    const registrados = pagosCatequistas.length;
    const completos = pagosCatequistas.filter(p => (p.monto_pagado || 0) >= 50000).length;
    const parciales = pagosCatequistas.filter(p => (p.monto_pagado || 0) > 0 && (p.monto_pagado || 0) < 50000).length;
    const pendientes = TOTAL_CATEQUISTAS_ESPERADO - registrados;
    
    return { total: TOTAL_CATEQUISTAS_ESPERADO, registrados, completos, parciales, pendientes };
  }, [pagosCatequistas]);

  const getCategoriaLabel = (cat) => {
    const labels = {
      transporte: 'Transporte',
      alimentacion: 'Alimentación',
      materiales: 'Materiales',
      hospedaje: 'Hospedaje',
      servicios: 'Servicios',
      ventas: 'Ventas',
      donaciones: 'Donaciones',
      actividades: 'Actividades',
      otros: 'Otros'
    };
    return labels[cat] || cat;
  };

  const getCategoriaColor = (cat) => {
    const colors = {
      transporte: 'blue',
      alimentacion: 'green',
      materiales: 'purple',
      hospedaje: 'orange',
      servicios: 'red',
      ventas: 'emerald',
      donaciones: 'pink',
      actividades: 'cyan',
      otros: 'gray'
    };
    return colors[cat] || 'gray';
  };

  const descargarPDF = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte Financiero - Confirmación 2026', pageWidth / 2, 15, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleDateString('es-CR')}`, pageWidth / 2, 22, { align: 'center' });

    // Resumen general
    let yPos = 32;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen General', 15, yPos);
    
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Total Ingresos: ${totales.ingresosTotales.toLocaleString()} CRC`, 15, yPos);
    doc.text(`Total Gastos: ${totales.gastos.toLocaleString()} CRC`, 105, yPos);
    yPos += 6;
    doc.text(`Pagos Retiro: ${totales.pagosRetiro.toLocaleString()} CRC`, 15, yPos);
    doc.text(`Balance: ${totales.balance.toLocaleString()} CRC`, 105, yPos);

    // Tabla de gastos por categoría
    yPos += 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Gastos por Categoria', 15, yPos);

    autoTable(doc, {
      head: [['Categoria', 'Monto']],
      body: gastosPorCategoria.map(c => [getCategoriaLabel(c.nombre), c.monto.toLocaleString()]),
      startY: yPos + 5,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [225, 29, 72], textColor: 255, fontStyle: 'bold' },
      margin: { left: 15, right: 105 }
    });

    // Tabla de ingresos por categoría
    const gastosEndY = doc.lastAutoTable.finalY;
    autoTable(doc, {
      head: [['Categoria', 'Monto']],
      body: ingresosPorCategoria.map(c => [getCategoriaLabel(c.nombre), c.monto.toLocaleString()]),
      startY: yPos + 5,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255, fontStyle: 'bold' },
      margin: { left: 110, right: 15 }
    });

    // Estado de pagos
    yPos = Math.max(gastosEndY, doc.lastAutoTable.finalY) + 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Estado de Pagos del Retiro', 15, yPos);

    // Centrar tabla de pagos (reutiliza pageWidth de arriba)
    const pagosColWidths = { col0: 35, col1: 28, col2: 28, col3: 28, col4: 25 };
    const pagosTableWidth = pagosColWidths.col0 + pagosColWidths.col1 + pagosColWidths.col2 + pagosColWidths.col3 + pagosColWidths.col4;
    const pagosMarginLeft = (pageWidth - pagosTableWidth) / 2;

    autoTable(doc, {
      head: [['Grupo', 'Completos', 'Parciales', 'Pendientes', 'Total']],
      body: [
        ['Estudiantes', pagosEstudiantesStats.completos, pagosEstudiantesStats.parciales, pagosEstudiantesStats.pendientes, pagosEstudiantesStats.total],
        ['Catequistas', pagosCatequistasStats.completos, pagosCatequistasStats.parciales, pagosCatequistasStats.pendientes, pagosCatequistasStats.total]
      ],
      startY: yPos + 5,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 2, halign: 'center' },
      headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: pagosColWidths.col0 },
        1: { cellWidth: pagosColWidths.col1 },
        2: { cellWidth: pagosColWidths.col2 },
        3: { cellWidth: pagosColWidths.col3 },
        4: { cellWidth: pagosColWidths.col4 }
      },
      margin: { left: pagosMarginLeft, right: pagosMarginLeft }
    });

    doc.save('Reporte_Financiero_2026.pdf');
  };


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
                <PieChart className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
                Dashboard Financiero
              </h1>
              <p className="text-gray-600 mt-2 text-xs sm:text-sm lg:text-base">
                Transparencia total de las finanzas del proceso
              </p>
              <div className="mt-2 flex items-center justify-center gap-3">
                <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs">
                  <Eye className="w-3 h-3" />
                  Visible para todos los catequistas    
                <button
                  onClick={descargarPDF}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-full text-xs font-semibold transition-colors"
                >
                  <Download className="w-3 h-3" />
                  Descargar PDF
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cards de resumen */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mb-6">
          {/* Total Ingresos (Ingresos + Pagos Retiro) */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Total Ingresos</p>
                <p className="text-lg sm:text-2xl font-bold text-emerald-600">
                  ₡{totales.ingresosTotales.toLocaleString()}
                </p>
              </div>
              <div className="bg-emerald-100 p-2 sm:p-3 rounded-full">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Ingresos + Pagos</p>
          </div>

          {/* Ingresos (Solo Ingresos) */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Ingresos</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600">
                  ₡{totales.ingresos.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{ingresos.length} registros</p>
          </div>

          {/* Pagos Retiro */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-violet-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Pagos Retiro</p>
                <p className="text-lg sm:text-2xl font-bold text-violet-600">
                  ₡{totales.pagosRetiro.toLocaleString()}
                </p>
              </div>
              <div className="bg-violet-100 p-2 sm:p-3 rounded-full">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{pagosEstudiantes.length + pagosCatequistas.length} total</p>
          </div>

          {/* Total Gastos */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 border-rose-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Total Gastos</p>
                <p className="text-lg sm:text-2xl font-bold text-rose-600">
                  ₡{totales.gastos.toLocaleString()}
                </p>
              </div>
              <div className="bg-rose-100 p-2 sm:p-3 rounded-full">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{gastos.length} registros</p>
          </div>

          {/* Balance Actual */}
          <div className={`bg-white rounded-xl shadow-lg p-4 sm:p-6 border-l-4 ${totales.balance >= 0 ? 'border-blue-500' : 'border-orange-500'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 font-medium">Balance</p>
                <p className={`text-lg sm:text-2xl font-bold ${totales.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                  ₡{totales.balance.toLocaleString()}
                </p>
              </div>
              <div className={`${totales.balance >= 0 ? 'bg-blue-100' : 'bg-orange-100'} p-2 sm:p-3 rounded-full`}>
                <Wallet className={`w-5 h-5 sm:w-6 sm:h-6 ${totales.balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{totales.balance >= 0 ? 'Superávit' : 'Déficit'}</p>
          </div>
        </div>

        {/* Estado de pagos del retiro - Estudiantes */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-violet-600" />
            Pagos Estudiantes (Catequizandos)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{pagosEstudiantesStats.completos}</p>
              <p className="text-xs text-gray-600">Pagos Completos</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{pagosEstudiantesStats.parciales}</p>
              <p className="text-xs text-gray-600">Pagos Parciales</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-2xl font-bold text-gray-600">{pagosEstudiantesStats.pendientes}</p>
              <p className="text-xs text-gray-600">Pendientes</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-600">{pagosEstudiantesStats.registrados}</p>
              <p className="text-xs text-gray-600">Registrados</p>
            </div>
          </div>
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso de recaudación estudiantes</span>
              <span>{Math.round((pagosEstudiantesStats.completos / pagosEstudiantesStats.total) * 100 || 0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-linear-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(pagosEstudiantesStats.completos / pagosEstudiantesStats.total) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Estado de pagos del retiro - Catequistas */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Pagos Catequistas
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-600">{pagosCatequistasStats.completos}</p>
              <p className="text-xs text-gray-600">Pagos Completos</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-yellow-600">{pagosCatequistasStats.parciales}</p>
              <p className="text-xs text-gray-600">Pagos Parciales</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="w-6 h-6 text-gray-500" />
              </div>
              <p className="text-2xl font-bold text-gray-600">{pagosCatequistasStats.pendientes}</p>
              <p className="text-xs text-gray-600">Pendientes</p>
            </div>
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <DollarSign className="w-6 h-6 text-indigo-600" />
              </div>
              <p className="text-2xl font-bold text-indigo-600">{pagosCatequistasStats.registrados}</p>
              <p className="text-xs text-gray-600">Registrados</p>
            </div>
          </div>
          {/* Barra de progreso */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progreso de recaudación catequistas</span>
              <span>{Math.round((pagosCatequistasStats.completos / pagosCatequistasStats.total) * 100 || 0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-linear-to-r from-indigo-500 to-violet-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(pagosCatequistasStats.completos / pagosCatequistasStats.total) * 100 || 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Desglose por categorías */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Gastos por categoría */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-rose-600" />
              Gastos por Categoría
            </h2>
            <div className="space-y-3">
              {gastosPorCategoria.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full bg-${getCategoriaColor(cat.nombre)}-100 text-${getCategoriaColor(cat.nombre)}-700`}>
                      {getCategoriaLabel(cat.nombre)}
                    </span>
                    <span className="text-sm font-bold text-gray-700">₡{cat.monto.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`bg-${getCategoriaColor(cat.nombre)}-500 h-2 rounded-full`}
                      style={{ width: `${(cat.monto / totales.gastos) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {gastosPorCategoria.length === 0 && (
                <p className="text-gray-400 text-center py-4">No hay gastos registrados</p>
              )}
            </div>
          </div>

          {/* Ingresos por categoría */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Ingresos por Categoría
            </h2>
            <div className="space-y-3">
              {ingresosPorCategoria.map((cat, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full bg-${getCategoriaColor(cat.nombre)}-100 text-${getCategoriaColor(cat.nombre)}-700`}>
                      {getCategoriaLabel(cat.nombre)}
                    </span>
                    <span className="text-sm font-bold text-gray-700">₡{cat.monto.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className={`bg-${getCategoriaColor(cat.nombre)}-500 h-2 rounded-full`}
                      style={{ width: `${(cat.monto / totales.ingresos) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {ingresosPorCategoria.length === 0 && (
                <p className="text-gray-400 text-center py-4">No hay ingresos registrados</p>
              )}
            </div>
          </div>
        </div>

        {/* Últimos movimientos */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            Últimos Movimientos
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concepto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...gastos.map(g => ({ ...g, tipo: 'gasto' })), ...ingresos.map(i => ({ ...i, tipo: 'ingreso', concepto: i.origen }))]
                  .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
                  .slice(0, 10)
                  .map((mov, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(mov.fecha).toLocaleDateString('es-CR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                        {mov.concepto}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          mov.tipo === 'ingreso' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-rose-100 text-rose-700'
                        }`}>
                          {mov.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td className={`px-4 py-3 text-sm font-bold text-right ${
                        mov.tipo === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'
                      }`}>
                        {mov.tipo === 'ingreso' ? '+' : '-'}₡{mov.monto.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer informativo */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            Última actualización: {new Date().toLocaleString('es-CR')} • 
            Los datos se actualizan en tiempo real
          </p>
        </div>
      </div>
    </div>
  );
}

export default DashboardFinancieroModule;
