import dayjs  from 'dayjs';

export function getFirstAndLastDayOfMonth(year: number, month: number) {
    const firstDay = dayjs(`${year}-${month}-01`);
    const lastDay = firstDay.endOf('month');

    return { firstDay: firstDay.format('YYYY-MM-DD'), lastDay: lastDay.format('YYYY-MM-DD') }
}
