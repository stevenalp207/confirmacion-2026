/**
 * Utilidades para enviar notificaciones inteligentes basadas en datos
 */

import { showNotification, NOTIFICATION_TYPES } from './notifications';
import { supabase } from '../config/supabase';

/**
 * Analizar asistencia y enviar alertas si es necesario
 */
export async function checkAndNotifyLowAttendance(estudianteId, grupo) {
  try {
    // Obtener todas las asistencias del estudiante
    const { data: asistencias, error } = await supabase
      .from('asistencias')
      .select('estado')
      .eq('estudiante_id', estudianteId)
      .eq('grupo', grupo);

    if (error || !asistencias || asistencias.length === 0) return;

    // Calcular porcentaje de asistencia
    const presente = asistencias.filter(a => a.estado === 'presente').length;
    const porcentaje = (presente / asistencias.length) * 100;

    // Si la asistencia es menor al 70%, enviar alerta
    if (porcentaje < 70 && porcentaje > 0) {
      await showNotification(
        NOTIFICATION_TYPES.LOW_ATTENDANCE_ALERT,
        `⚠️ Estudiante con ${porcentaje.toFixed(0)}% de asistencia en ${grupo}. Requiere seguimiento.`,
        { 
          requireInteraction: true,
          data: { estudianteId, grupo, porcentaje }
        }
      );
    }
  } catch (error) {
    console.error('Error verificando asistencia:', error);
  }
}

/**
 * Notificar sobre pagos pendientes
 */
export async function checkAndNotifyPendingPayments() {
  try {
    // Obtener pagos pendientes
    const { data: pagos, error } = await supabase
      .from('pagos_retiro')
      .select('*')
      .eq('pagado', false);

    if (error || !pagos || pagos.length === 0) return;

    const total = pagos.length;
    const grupos = [...new Set(pagos.map(p => p.grupo))];

    await showNotification(
      NOTIFICATION_TYPES.PAYMENT_REMINDER,
      `💰 Hay ${total} pago${total !== 1 ? 's' : ''} pendiente${total !== 1 ? 's' : ''} en ${grupos.length} grupo${grupos.length !== 1 ? 's' : ''}.`,
      {
        requireInteraction: true,
        data: { total, grupos }
      }
    );
  } catch (error) {
    console.error('Error verificando pagos:', error);
  }
}

/**
 * Notificar sobre documentos pendientes
 */
export async function checkAndNotifyPendingDocuments() {
  try {
    // Obtener total de estudiantes y documentos entregados
    const { data: documentos, error } = await supabase
      .from('documentos_entregados')
      .select('*')
      .eq('entregado', false);

    if (error || !documentos || documentos.length === 0) return;

    const total = documentos.length;
    
    await showNotification(
      NOTIFICATION_TYPES.DOCUMENT_REMINDER,
      `📄 Faltan ${total} documento${total !== 1 ? 's' : ''} por entregar.`,
      {
        data: { total }
      }
    );
  } catch (error) {
    console.error('Error verificando documentos:', error);
  }
}

/**
 * Notificar sobre próximo evento del calendario
 */
export async function notifyUpcomingEvent(evento) {
  const { fecha, titulo, descripcion } = evento;
  
  await showNotification(
    NOTIFICATION_TYPES.UPCOMING_EVENT,
    `📅 Mañana: ${titulo}${descripcion ? ' - ' + descripcion : ''}`,
    {
      requireInteraction: true,
      data: { fecha, titulo }
    }
  );
}

/**
 * Verificar y notificar eventos del día siguiente
 */
export async function checkTomorrowEvents(cronograma) {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const eventos = cronograma.filter(e => e.fecha === tomorrowStr);

    for (const evento of eventos) {
      await notifyUpcomingEvent(evento);
    }
  } catch (error) {
    console.error('Error verificando eventos:', error);
  }
}

/**
 * Notificación de éxito al registrar asistencia
 */
export function notifyAttendanceSuccess(total, grupo) {
  return showNotification(
    NOTIFICATION_TYPES.GENERAL,
    `✅ Asistencia registrada: ${total} estudiante${total !== 1 ? 's' : ''} en ${grupo}`,
    { requireInteraction: false }
  );
}

/**
 * Notificación de pago registrado
 */
export function notifyPaymentSuccess(nombre, monto) {
  return showNotification(
    NOTIFICATION_TYPES.GENERAL,
    `💰 Pago registrado: ${nombre} - ₡${monto.toLocaleString('es-CR')}`,
    { requireInteraction: false }
  );
}

/**
 * Notificación de documento entregado
 */
export function notifyDocumentSuccess(nombre, documento) {
  return showNotification(
    NOTIFICATION_TYPES.GENERAL,
    `📄 Documento entregado: ${documento} de ${nombre}`,
    { requireInteraction: false }
  );
}

export default {
  checkAndNotifyLowAttendance,
  checkAndNotifyPendingPayments,
  checkAndNotifyPendingDocuments,
  checkTomorrowEvents,
  notifyUpcomingEvent,
  notifyAttendanceSuccess,
  notifyPaymentSuccess,
  notifyDocumentSuccess
};
