class GameLogic {
    constructor() {

    }
    shuffleDeck = (cards) => {
        var m = cards.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = cards[m];
            cards[m] = cards[i];
            cards[i] = t;
        }
        return cards;
    }
    drawCard = (cards) => {
        const drewCard = cards.shift()
        return drewCard
    }
    initialDraw = (cards) => {
        let drawnCards = []
        for (let i = 0; i < 5; i++) {
            drawnCards.push(this.drawCard(cards))
        }
        return drawnCards
    }
}


GameLogic.shared = new GameLogic()

export default GameLogic