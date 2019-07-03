
const INITIAL_STATE = { user: {}, decks: [], selectedDeck: "" };

export default reducer = (state = INITIAL_STATE, action) => {
    const newState = { ...state }
    switch (action.type) {
        case "CREATE_USER":
            newState.user = action.user
            return newState
        case "UPDATE_DECK_LIST":
            newState.decks = action.decks
            return newState
        case "UPDATE_SELECTED_DECK":
            console.log("updating the selected deck!", action.deck)
            newState.selectedDeck = action.deck
            return newState
        default:
            return newState
    }
};
