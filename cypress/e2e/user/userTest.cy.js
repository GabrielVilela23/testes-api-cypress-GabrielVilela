import { faker } from "@faker-js/faker";

describe('Validação do registro de um novo usuário', () => {
    it('Deve ser possível registrar um novo usuário', () => {
      cy.newUser().then((response) => {
        const { user, login } = response;
        // Assegura que o status da resposta seja 201 (Created)
        expect(user).to.have.property('id');
        expect(user.email).to.equal(login.email);
        // Agora você pode adicionar mais asserções conforme necessário
      });
    });

        describe("Promover usuário a Administrador", function () {
            let adminToken;
            let userId;
          
            before(function () {
              // Realiza login como administrador e obtém o token de autenticação
              cy.loginAdmin().then((response) => {
                adminToken = response.tokenUsuario;
              });
          
              // Cria um novo usuário para ser promovido
              cy.newUser().then((response) => {
                userId = response.user._id;
              });
            });
          
            it("Deve promover o usuário para administrador com sucesso", function () {
              // Chama o comando personalizado para promover o usuário para administrador
              cy.promoverParaAdministrador(userId).then((response) => {
                // Verifica se a resposta retorna o usuário promovido com sucesso
                expect(response.usuario.tipoUsuario).to.equal("administrador");
              });
            });
          
            after(function () {
              // Após o teste, exclui o usuário criado para limpar o ambiente
              cy.deleteUser(userId, adminToken);
            });
          });
          
      });
      