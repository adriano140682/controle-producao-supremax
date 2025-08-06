import { format, formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

// Obter data/hora atual no fuso horário do Brasil
export const getBrazilTime = (): Date => {
  return toZonedTime(new Date(), BRAZIL_TIMEZONE);
};

// Formatar data no padrão brasileiro (DD/MM/AAAA)
export const formatBrazilDate = (date: Date = getBrazilTime()): string => {
  return formatInTimeZone(date, BRAZIL_TIMEZONE, 'dd/MM/yyyy', { locale: ptBR });
};

// Formatar hora no padrão brasileiro (HH:mm:ss)
export const formatBrazilTime = (date: Date = getBrazilTime()): string => {
  return formatInTimeZone(date, BRAZIL_TIMEZONE, 'HH:mm:ss', { locale: ptBR });
};

// Formatar data e hora no padrão brasileiro
export const formatBrazilDateTime = (date: Date = getBrazilTime()): string => {
  return formatInTimeZone(date, BRAZIL_TIMEZONE, 'dd/MM/yyyy HH:mm:ss', { locale: ptBR });
};

// Obter data no formato YYYY-MM-DD para inputs
export const getBrazilDateForInput = (date: Date = getBrazilTime()): string => {
  return formatInTimeZone(date, BRAZIL_TIMEZONE, 'yyyy-MM-dd');
};

// Obter hora no formato HH:mm para inputs
export const getBrazilTimeForInput = (date: Date = getBrazilTime()): string => {
  return formatInTimeZone(date, BRAZIL_TIMEZONE, 'HH:mm');
};

// Converter timestamp para data do Brasil
export const timestampToBrazilDate = (timestamp: number): Date => {
  return toZonedTime(new Date(timestamp), BRAZIL_TIMEZONE);
};

// Obter timestamp atual ajustado para o Brasil
export const getBrazilTimestamp = (): number => {
  return getBrazilTime().getTime();
};