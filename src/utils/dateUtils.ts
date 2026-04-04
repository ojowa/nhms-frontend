// nhms-frontend/src/utils/dateUtils.ts

/**
 * Safely parses a date string or existing Date object into a new Date object.
 * Returns null if the input is null, undefined, an empty string, or results in an invalid Date.
 * @param dateInput The date string (e.g., ISO 8601) or Date object to parse.
 * @returns A Date object if parsing is successful, otherwise null.
 */
export const parseDateString = (dateInput: string | Date | null | undefined): Date | null => {
  if (dateInput === null || dateInput === undefined || dateInput === '') {
    return null;
  }

  // If it's already a Date object, return a new instance to avoid mutation issues
  if (dateInput instanceof Date) {
    return new Date(dateInput);
  }

  const date = new Date(dateInput);

  // Check if the parsed date is valid
  if (isNaN(date.getTime())) {
    console.warn(`[dateUtils] Invalid date input received: ${dateInput}`);
    return null;
  }

  return date;
};
