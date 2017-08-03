'use strict';
// https://wiki.guildwars2.com/wiki/User:Manifold/Player_character_quotes
var raceQuotes = {
    charr: {
        imgUrl: '',
        quotes: [
            'Haven\'t seen this yet',
            'Looks like new territory',
            'Can\'t wait to tell my warband about this place',
            'A whole new place to conquer',
            'I need some space!',
            'Ah, I see',
            'Need healing',
            'Medic !',
            'Swiftly',
            'Faster!',
            'I feel...Strong!',
            'Retaliation incoming',
            'Go ahead, hit me',
            'Entertain the awesome',
            'the life for me!'
        ]
    }
};
var races = ['charr'];
module.exports = function () {
    var race = selectRandomElementFromArray(races);
    return {
        imgUrl: raceQuotes[race],
        quote: selectRandomElementFromArray(raceQuotes[race].quotes)
    };
};
function selectRandomElementFromArray(array) {
    if (array.length === 0) {
        return null;
    }
    return array[createRandomIndex(array.length)];
}
function createRandomIndex(maxInt) {
    if (typeof maxInt !== 'number' || maxInt <= 0) {
        return 0;
    }
    maxInt = Math.floor(maxInt);
    return Math.floor(Math.random() * maxInt);
}
