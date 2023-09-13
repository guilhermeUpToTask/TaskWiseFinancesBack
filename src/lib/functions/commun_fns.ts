import { getNewResponseError } from "../../error_system/index";

export function parseArrOfStrToInt(arr: string[]): number[] {
    return arr.map((str) => {
        const parsedInt = parseInt(str, 10);
        if (!Number.isNaN(parsedInt))
            return parsedInt;
        else
            throw getNewResponseError('array must be an array of numbers', 400);
    });
}