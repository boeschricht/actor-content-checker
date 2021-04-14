module.exports = (input) => {
    // check inputs
    if (!input || !input.url1 || !input.contentSelector1 || !input.url2 || !input.contentSelector2 || !input.url3 || !input.contentSelector3) {
        throw new Error('Invalid input, must be a JSON object with the '
        + '"url1", "contentSelector1", "url1", "contentSelector1", "url1", "contentSelector1"');
    }
};
