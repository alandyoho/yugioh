class Shuffle {
    constructor(cards) {
        this.cards = cards
    }
    shuffleDeck = function () {
        var m = this.cards.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return this.cards;
    }
    drawCard = function () {
        return this.cards.shift()
    }

}

export default Shuffle