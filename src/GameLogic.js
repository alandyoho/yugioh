class GameLogic {
    constructor() {

    }
    shuffleDeck = (cards) => {
        // const shallowCards = [...cards]
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
        const shallowCards = [...cards]
        const drewCard = shallowCards.shift()
        return { drewCard, shallowCards }
    }
    initialDraw = (cards) => {
        const shallowCards = [...cards]
        let drawnCards = []
        for (let i = 0; i < 5; i++) {
            const topCard = shallowCards.shift()
            drawnCards.push(topCard)
        }
        return { drawnCards, shallowCards }
    }
}


GameLogic.shared = new GameLogic()

export default GameLogic