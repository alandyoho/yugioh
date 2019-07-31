// import console = require("console");

class GameLogic {
    constructor() {
        this.user = null
    }


    initialShuffleDeck = (cards) => {
        
        // const shallowCards = [...cards]

        const expandedCards = []
        for (let i = 0; i < cards.length; i++) {
            const cardQuantity = cards[i].quantity
            for (let a = 0; a < cardQuantity; a++) {
                // //
                cards[i].user = this.user

                expandedCards.push(cards[i])
            }
        }
        var m = expandedCards.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = expandedCards[m];
            expandedCards[m] = expandedCards[i];
            expandedCards[i] = t;
        }
        // //
        return expandedCards;
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
        // //
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
    addUser = (user) => {
        this.user = user
    }
}


GameLogic.shared = new GameLogic()

export default GameLogic