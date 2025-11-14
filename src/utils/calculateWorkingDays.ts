export const calculateWorkingDays = (
    startDate: Date,
    endDate: Date,
    holidays: { date: string }[]
) => {
    let count = 0;
    const current = new Date(startDate);

    const holidaySet = new Set(
        holidays.map(h => new Date(h.date).toDateString())
    );

    while (current <= endDate) {
        const day = current.getDay();

        const isWeekend = day === 0 || day === 6; // Sunday=0, Saturday=6
        const isHoliday = holidaySet.has(current.toDateString());

        if (!isWeekend && !isHoliday) {
            count++;
        }

        current.setDate(current.getDate() + 1);
    }

    return count;
};
