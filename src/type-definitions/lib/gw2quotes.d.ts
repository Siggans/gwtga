declare const raceQuotes: {
    charr: {
        imgUrl: string;
        quotes: string[];
    };
};
declare const races: string[];
interface RaceQuote {
    imgUrl: string;
    quote: string;
}
declare function selectRandomElementFromArray<T>(array: Array<T>): T;
declare function createRandomIndex(maxInt: number): number;
