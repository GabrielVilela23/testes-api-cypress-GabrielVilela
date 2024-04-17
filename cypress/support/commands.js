// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { faker } from "@faker-js/faker";

//Custom command to create a new user
Cypress.Commands.add("newUser", () => {
  const usuario = {
    email: faker.internet.email(),
    password: "qa478*",
    name: faker.internet.userName(),
  };

  return cy.request("POST", "users", user).then((response) => {
    const userCreated = response.body;
    const userLogin = {
      email: userCreated.email,
      password: userCreated.password,
    };
    return { user: userCreated, login: userLogin };
  });
});

// Custom command to log in a user
Cypress.Commands.add("loginUser", function () {
    let tokenUsuario;
    cy.request("POST", "auth/login", userLogin).then(function (loginUser) {
      expect(loginUser.status).to.equal(200);
    });
  });

// Custom command to promote a user to admin
  Cypress.Commands.add("promoteAdmin", function () {
    return cy
      .request({
        method: "PATCH",
        url: "users/admin",
        headers: { Authorization: "Bearer " + tokenUsuario },
      })
      .then(function (promoteAdmin) {
        tokenUsuario = promoteAdmin.body.accessToken;
        return { tokenUsuario };
      });
  });
  
// Custom command to delete a user
Cypress.Commands.add("deleteUser", function (id) {
    cy.request("DELETE", "users/" + id);
  });