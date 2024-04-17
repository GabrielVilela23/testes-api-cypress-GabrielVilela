import { faker } from '@faker-js/faker';

describe('Testes da rota /users', function () {
  describe('Testes de Bad requests', function () {
    it('Deve receber bad request ao tentar cadastrar um usuário sem e-mail', function () {
      cy.request({
        method: 'POST',
        url: '/users',
        body: {
          name: faker.name.firstName(),
        },
        failOnStatusCode: false,
      }).then((response) => {
        expect(response.status).to.equal(400);
        expect(response.body).to.be.undefined;
      });
    })
})});