// Todas as datas/horas usam o horário LOCAL do aparelho (sem conversão de fuso).

const pad = (n: number) => String(n).padStart(2, '0');

// Data/hora atual do aparelho
export const getBrazilTime = (): Date => new Date();

// Formatar data no padrão brasileiro (DD/MM/AAAA)
export const formatBrazilDate = (date: Date = new Date()): string =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

// Formatar hora no padrão brasileiro (HH:mm:ss)
export const formatBrazilTime = (date: Date = new Date()): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;

// Formatar data e hora
export const formatBrazilDateTime = (date: Date = new Date()): string =>
  `${formatBrazilDate(date)} ${formatBrazilTime(date)}`;

// Data no formato YYYY-MM-DD para inputs (local, nunca UTC)
export const getBrazilDateForInput = (date: Date = new Date()): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

// Hora no formato HH:mm para inputs
export const getBrazilTimeForInput = (date: Date = new Date()): string =>
  `${pad(date.getHours())}:${pad(date.getMinutes())}`;

// Converter timestamp para Date local
export const timestampToBrazilDate = (timestamp: number): Date => new Date(timestamp);

// Timestamp atual
export const getBrazilTimestamp = (): number => Date.now();
