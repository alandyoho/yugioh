export const createUser = user => ({
    type: 'CREATE_USER',
    user
});
export const updateSelectedDeck = deck => ({
    type: "UPDATE_SELECTED_DECK",
    deck
})
export const updateDeckList = decks => ({
    type: "UPDATE_DECK_LIST",
    decks
})

export const updateHostName = host => ({
    type: "UPDATE_HOST_NAME",
    host
})

export const updatePreferences = preferences => ({
    type: "UPDATE_PREFERENCES",
    preferences
})