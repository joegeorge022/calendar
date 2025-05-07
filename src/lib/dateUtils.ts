export type DateRange = {
  start: Date;
  end: Date;
};

export const formatMonthYear = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
};

export const formatMonthDay = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

export const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const day = date.getDay(); 
  result.setDate(date.getDate() - day);
  return result;
};

export const getWeekDates = (date: Date): Date[] => {
  const startOfWeek = getStartOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    return date;
  });
};

export const getNextWeek = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(date.getDate() + 7);
  return result;
};

export const getPrevWeek = (date: Date): Date => {
  const result = new Date(date);
  result.setDate(date.getDate() - 7);
  return result;
};

export const getNextMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(date.getMonth() + 1);
  return result;
};

export const getPrevMonth = (date: Date): Date => {
  const result = new Date(date);
  result.setMonth(date.getMonth() - 1);
  return result;
};

export const getToday = (): Date => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

export const getMonthDates = (date: Date): { date: Date | null; isCurrentMonth: boolean }[] => {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  
  const startOffset = firstDay.getDay(); 
  const daysInMonth = lastDay.getDate();
  const totalCells = Math.ceil((startOffset + daysInMonth) / 7) * 7;
  
  const monthDates = [];
  
  for (let i = 0; i < startOffset; i++) {
    monthDates.push({ date: null, isCurrentMonth: false });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(date.getFullYear(), date.getMonth(), i);
    monthDates.push({ date: currentDate, isCurrentMonth: true });
  }
  
  const remaining = totalCells - monthDates.length;
  for (let i = 1; i <= remaining; i++) {
    monthDates.push({ date: null, isCurrentMonth: false });
  }
  
  return monthDates;
};

export const formatTime = (hours: number, minutes: number = 0): string => {
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const parseTime = (timeString: string): { hours: number; minutes: number } => {
  const [hoursStr, minutesStr] = timeString.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  return { hours, minutes };
};

export const formatTime12Hour = (timeString: string): string => {
  const { hours, minutes } = parseTime(timeString);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12; 
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const formatWeekDay = (date: Date, format: 'short' | 'narrow' = 'short'): string => {
  return date.toLocaleDateString('en-US', { weekday: format }).toUpperCase();
}; 