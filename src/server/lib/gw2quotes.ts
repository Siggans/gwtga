import {Util} from "./util";

// https://wiki.guildwars2.com/wiki/User:Manifold/Player_character_quotes
const raceQuotes = {
    charr: {
        imgUrl: "",
        quotes: [
            "Haven't seen this yet",
            "Looks like new territory",
            "Can't wait to tell my warband about this place",
            "A whole new place to conquer",
            "I need some space!",
            "Ah, I see",
            "Need healing",
            "Medic!",
            "Swiftly",
            "Faster!",
            "I feel...Strong!",
            "Retaliation incoming",
            "Go ahead, hit me",
            "Entertain the awesome",
            "The life for me!"
        ]
    }
};


// TODO:  Work on this when I have time.
const races = ["charr"];

interface RaceQuote {
    imgUrl: string;
    quote: string;
}

module.exports = function(): RaceQuote {
    const race = selectRandomElementFromArray(races);
    return {
        imgUrl: raceQuotes[race],
        quote: selectRandomElementFromArray(raceQuotes[race].quotes)
    };
};

function selectRandomElementFromArray<T>(array: Array<T>): T {
    if (array.length === 0) {
        return null;
    }
    return array[createRandomIndex(array.length)];
}

function createRandomIndex(maxInt: number): number {
    return Util.GetRandomInt(maxInt);
}
