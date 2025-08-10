import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TopWinnerFilterType } from '@/types/types/commonGame.type';

// Extend Day.js with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

export const generateCurrentDate = () => dayjs.utc();
export const generateNextMonthDate = () => dayjs().add(1, 'month').utc().format('YYYY-MM-DDTHH:mm:ss.SSSZ');
export const currentDayJsObject = (date?: dayjs.ConfigType) => dayjs(date);

export function getStartAndEndDate(filterType: TopWinnerFilterType): { startDate: Date; endDate: Date } {
  const currentDate = dayjs.utc(); // current date in UTC

  let startDate: dayjs.Dayjs, endDate: dayjs.Dayjs;

  switch (filterType) {
    case 'daily':
      // Start of the day (midnight UTC)
      startDate = currentDate.subtract(1, 'day');
      // End of the day (23:59:59.999 UTC)
      endDate = currentDate;
      break;

    case 'weekly':
      // 7 days ago, get the start of that day (Monday, UTC time)
      startDate = currentDate.subtract(1, 'week').startOf('day'); // Previous week's Monday at 00:00:00
      // End of today (23:59:59.999 UTC)
      endDate = currentDate.endOf('day');
      break;

    case 'monthly':
      // Same day last month (start of the day in UTC)
      startDate = currentDate.subtract(1, 'month').startOf('day'); // Same day last month at 00:00:00
      // End of current day (23:59:59.999 UTC)
      endDate = currentDate.endOf('day');
      break;

    default:
      throw new Error('Invalid filter type. Please use "daily", "weekly", or "monthly".');
  }

  return { startDate: startDate.toDate(), endDate: endDate.toDate() };
}
