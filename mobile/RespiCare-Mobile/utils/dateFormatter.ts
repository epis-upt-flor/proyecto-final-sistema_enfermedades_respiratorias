/**
 * Date Formatter Utility
 * Formatea fechas para el sistema móvil.
 * Esta función será desarrollada usando TDD.
 */

/**
 * Formatea una fecha a formato legible para el usuario
 * @param date - Fecha a formatear (Date o string)
 * @param includeTime - Si incluir hora en el formato
 * @returns String formateado
 */
export function formatDateForDisplay(date: Date | string, includeTime: boolean = false): string {
  // Validación de entrada
  if (!date) {
    throw new Error('La fecha es requerida');
  }

  let dateObj: Date;

  // Convertir string a Date si es necesario
  if (typeof date === 'string') {
    dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Fecha inválida');
    }
  } else {
    dateObj = date;
  }

  // Formatear fecha DD/MM/YYYY
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  let formatted = `${day}/${month}/${year}`;

  // Agregar hora si se requiere
  if (includeTime) {
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    formatted += ` ${hours}:${minutes}`;
  }

  return formatted;
}

/**
 * Calcula el tiempo relativo desde una fecha (ej: "hace 2 días")
 * @param date - Fecha a calcular
 * @returns String con tiempo relativo
 */
export function getRelativeTime(date: Date | string): string {
  // Validación de entrada
  if (!date) {
    throw new Error('La fecha es requerida');
  }

  let dateObj: Date;

  // Convertir string a Date si es necesario
  if (typeof date === 'string') {
    dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Fecha inválida');
    }
  } else {
    dateObj = date;
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Menos de 1 minuto
  if (diffSecs < 60) {
    return 'hace unos momentos';
  }

  // Menos de 1 hora
  if (diffMins < 60) {
    return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
  }

  // Menos de 24 horas
  if (diffHours < 24) {
    return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  }

  // Menos de 7 días
  if (diffDays < 7) {
    return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
  }

  // Más de 7 días: retornar fecha formateada
  return formatDateForDisplay(dateObj);
}

