
const INITIAL_STATE = { user: {}, decks: [], selectedDeck: "", hostName: "", preferences: {} };

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
            newState.selectedDeck = action.deck
            return newState
        case "UPDATE_HOST_NAME":
            newState.hostName = action.hostName
        case "UPDATE_PREFERENCES":
            console.log("saved preferences", action.preferences)
            newState.preferences = { ...newState.preferences, ...action.preferences }
        default:
            return newState
    }
};
