function createFormatter(
  options: Intl.DateTimeFormatOptions,
  timeZone?: string,
) {
  return new Intl.DateTimeFormat('en-GB', {
    ...options,
    ...(timeZone ? { timeZone } : {}),
  });
}

export function formatChartDay(date: Date, timeZone?: string) {
  return createFormatter({ day: '2-digit', month: 'short' }, timeZone).format(
    date,
  );
}

export function formatChartMonthYear(date: Date, timeZone?: string) {
  const month = createFormatter({ month: 'short' }, timeZone).format(date);
  const year = createFormatter({ year: '2-digit' }, timeZone).format(date);
  return `${month} '${year}`;
}
