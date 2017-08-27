export {LoginUser, QueryUserResult, LoginUserUtil} from "./login-user-util";
import {createLogger} from "./logger";
import {LoginUserUtil} from "./login-user-util";

const logger = createLogger("lib/util");
const MsPerDay = 24 * 3600 * 1000;

export class Util {

    public static LoginUser = LoginUserUtil;

    public static CreateLogger = createLogger;

    public static AddDayToDate(date: Date, day: number): Date {
        return new Date(date.getTime() + day * MsPerDay);
    }

    public static GenerateRandomKey(length: number): string {
        if (length > 100) {
            length = 100;
        }
        let result = "";
        while (length > 0) {
            result += createRandomLetterOrNumber();
            length--;
        }
        return result;
    }

    public static GetRandomInt(maxInt: number): number {
        if (maxInt <= 0) {
            return 0;
        }
        // Return a number between [0, maxInt)
        return Math.floor(Math.random() * Math.floor(maxInt));
    }
}

function createRandomLetterOrNumber() {
    let possibleNumber = Util.GetRandomInt(62);
    if (possibleNumber < 26) {
        return String.fromCharCode("a".charCodeAt(0) + possibleNumber);
    }
    else if (possibleNumber < 52) {
        return String.fromCharCode("A".charCodeAt(0) + possibleNumber - 26);
    }
    return String.fromCharCode("0".charCodeAt(0) + possibleNumber - 52);
}

export default Util;
