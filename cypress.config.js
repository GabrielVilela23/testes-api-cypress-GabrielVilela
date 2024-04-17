const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "https://raromdb-3c39614e42d4.herokuapp.com/api/",
    accessToken: "tokenUsuario",
    testIsolation: false
  },
});
