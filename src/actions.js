export const createUser = user => ({
    type: 'CREATE_USER',
    user
});
export const updateSelectedDeck = deck => ({
    type: "UPDATE_SELECTED_DECK",
    deck
})