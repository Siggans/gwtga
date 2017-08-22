const MsPerDay = 24 * 3600 * 1000;

export class Util {
    public static addDayToDate(date: Date, day: number): Date {
        return new Date(date.getTime() + day * MsPerDay);
    }
}
