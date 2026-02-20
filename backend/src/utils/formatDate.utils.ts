/**
 * Formatea una fecha al estilo estándar argentino (dd/mm/yyyy)
 * @param date Fecha en formato Date, string o número
 * @returns string formateado
 */

export const formatDateDayMonthYear = (date: Date | string | number): string => {
  const d = new Date(date);
  
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(d);
};