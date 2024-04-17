import { faker } from "@faker-js/faker";

describe('Testes do recurso Users', function () {
    // Testes de criação de usuário
    describe('Criação de usuário', function () {
      it('Deve ser possível criar um usuário com dados válidos', function () {
        const name = faker.name.firstName();
        const email = faker.internet.email();
        
        cy.request('POST', '/users', {
          name: name,
          email: email,
        }).then(function (response) {
          expect(response.status).to.equal(201);
          expect(response.body).to.have.property('id');
          expect(response.body.name).to.equal(name);
          expect(response.body.email).to.equal(email);
        });
      });

      it('Não deve ser possível criar um usuário sem e-mail', function () {
        cy.request({
          method: 'POST',
          url: '/users',
          body: {
            name: faker.name.firstName(),
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body.error).to.equal('Email is required.');
        });
      });

      it('Não deve ser possível criar um usuário sem nome', function () {
        cy.request({
          method: 'POST',
          url: '/users',
          body: {
            email: faker.internet.email(),
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body.error).to.equal('Name is required.');
        });
      });

      it('Não deve ser possível criar um usuário com e-mail inválido', function () {
        cy.request({
          method: 'POST',
          url: '/users',
          body: {
            name: faker.name.firstName(),
            email: 'invalid-email',
          },
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(400);
          expect(response.body.error).to.equal('Invalid email format.');
        });
      });
    });

    // Testes de consulta de usuário
    describe('Consulta de usuário', function () {
      it('Deve ser possível consultar um usuário existente', function () {
        // Supondo que existe pelo menos um usuário cadastrado para este teste
        cy.intercept('GET', '/users').then(function (response) {
          expect(response.status).to.equal(200);
          expect(response.body.length).to.be.greaterThan(0);

          const randomUser = response.body[Math.floor(Math.random() * response.body.length)];

          cy.request('GET', `/users/${randomUser.id}`).then(function (userResponse) {
            expect(userResponse.status).to.equal(200);
            expect(userResponse.body).to.deep.equal(randomUser);
          });
        });
      });

      it('Deve retornar erro 404 ao tentar consultar um usuário inexistente', function () {
        const userId = 'non-existing-id';
        cy.request({
          method: 'GET',
          url: `/users/${userId}`,
          failOnStatusCode: false,
        }).then((response) => {
          expect(response.status).to.equal(404);
          expect(response.body.error).to.equal('User not found.');
        });
      });
    });
  });
