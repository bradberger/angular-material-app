/* eslint-env node */
exports.config = {
    specs: [ "e2e/**/*Spec.js" ],
    seleniumServerJar: "./node_modules/protractor/selenium/selenium-server-standalone-2.47.1.jar",
    multiCapabilities: [
      {"browserName": "chrome"}
    ],
    baseUrl: "http://localhost:3000/index.html",
    jasmineNodeOpts: {
        showColors: true
    }
};
