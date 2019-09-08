
const INITIAL_STATE = { user: {}, decks: [], selectedDeck: "", hostName: "", preferences: {}, storedCards: {} };

export default reducer = (state = INITIAL_STATE, action) => {
    const newState = { ...state }
    switch (action.type) {
        case "UPDATE_USER":
            newState.user = { ...newState.user, ...action.val }
            console.log("updated store", newState)
            return newState
        case "CREATE_USER":
            newState.user = action.user
            return newState
        case "UPDATE_DECK_LIST":
            newState.decks = action.decks
            return newState
        case "UPDATE_SELECTED_DECK":
            newState.selectedDeck = action.deck
            return newState
        case "UPDATE_HOST_NAME":
            newState.hostName = action.hostName
            return newState
        case "UPDATE_PREFERENCES":
            newState.preferences = { ...newState.preferences, ...action.preferences }
            return newState
        case "UPDATE_STORED_CARDS_LIST":
            newState.storedCards = action.storedCards
            return newState
        default:
            return newState
    }

};
