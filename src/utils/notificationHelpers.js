/**
 * Utilidades para enviar notificaciones inteligentes basadas en datos
 */

import { showNotification, NOTIFICATION_TYPES } from './notifications';
import { supabase } from '../config/supabase';

/**
 * Analizar asistencia y enviar alertas si es necesario
 */
export async function checkAndNotifyLowAttendance(estudianteId, grupo) {
  // Notificación deshabilitada
  return;
}

/**
 * Notificar sobre pagos pendientes
 */
export async function checkAndNotifyPendingPayments() {
  // Notificación deshabilitada
  return;
}

/**
 * Notificar sobre documentos pendientes
 */
export async function checkAndNotifyPendingDocuments() {
  // Notificación deshabilitada
  return;
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
      url: '/?module=calendario',
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
