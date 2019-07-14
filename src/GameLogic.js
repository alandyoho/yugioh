
class GameLogic {
    constructor() {

    }
    shuffleDeck = (cards) => {
        // const shallowCards = [...cards]
        const expandedCards = []
        for (let i = 0; i < cards.length; i++) {
            const cardQuantity = cards[i].quantity
            for (let a = 0; a < cardQuantity; a++) {
                console.log("card,", cards[i])
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
        console.log("expanded Cards", expandedCards)
        return expandedCards;
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