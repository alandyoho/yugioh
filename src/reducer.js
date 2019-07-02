
const INITIAL_STATE = { user: {}, cards: [], selectedDeck: "" };

export default reducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case "CREATE_USER":
            return { ...state, user: action.user };
        case "ADD_CARDS":
            return { ...state, stations: action.cards };
        case "UPDATE_SELECTED_DECK":
            return { ...state, selectedDeck: action.deck };
        default:
            return state
    }
};
