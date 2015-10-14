/* eslint-env jasmine,protractor */
describe("empty test suite", function() {
    beforeEach(function() {
        browser.get("http://localhost:3000");
    });
    it("should load the empty website page", function() {
        expect(browser.getTitle()).toEqual("Angular Material App");
    });
});
