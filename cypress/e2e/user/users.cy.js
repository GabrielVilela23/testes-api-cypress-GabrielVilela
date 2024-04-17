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

    it("Deve promover um usuário para crítico com sucesso", () => {
      cy.newUser().then(({ user }) => {
        cy.promoverParaCritic(user.id).then(({ usuario }) => {
          expect(usuario.tipoUsuario).to.equal("critic");
        });
      });
    });
  
    it("Deve inativar a conta do usuário com sucesso", () => {
      cy.newUser().then(({ user }) => {
        cy.desativarConta(user.id).then(({ usuario }) => {
          expect(usuario.ativo).to.equal(false);
        });
      });
    });
  
    it("Deve excluir a conta de um usuário pelo administrador com sucesso", () => {
      cy.newUser().then(({ user }) => {
        cy.excluirContaUsuario(user.id).then(() => {
          cy.request("GET", `usuarios/${user.id}`).then((response) => {
            expect(response.status).to.equal(404);
          });
        });
      });
    });
  
    it("Deve permitir que um usuário não logado visualize a lista de filmes", () => {
      cy.request("GET", "filmes").then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.length.above(0);
      });
    });
  
    it("Deve adicionar uma review com sucesso para um filme cadastrado", () => {
      cy.newUser().then(({ user }) => {
        cy.novoFilme().then(({ filme }) => {
          cy.novaAvaliacaoFilme(filme.id, user.id).then(({ avaliacao }) => {
            expect(avaliacao).to.have.property("avaliacao");
            expect(avaliacao).to.have.property("comentario");
            expect(avaliacao).to.have.property("idUsuario");
            expect(avaliacao).to.have.property("idFilme");
          });
        });
      });
    });
  
    it("Deve atualizar uma review existente com sucesso", () => {
      cy.newUser().then(({ user }) => {
        cy.novoFilme().then(({ filme }) => {
          cy.novaAvaliacaoFilme(filme.id, user.id).then(({ avaliacao }) => {
            const novoComentario = "Este filme é incrível!";
            cy.request("PUT", `filmes/${filme.id}/avaliacoes/${avaliacao.id}`, { comentario: novoComentario }).then((response) => {
              expect(response.status).to.equal(200);
              expect(response.body.comentario).to.equal(novoComentario);
            });
          });
        });
      });
    });
  
    it("Deve promover um usuário para administrador com sucesso", () => {
      cy.newUser().then(({ user }) => {
        cy.promoverParaAdministrador(user.id).then(({ usuario }) => {
          expect(usuario.tipoUsuario).to.equal("administrador");
        });
      });
    });
  
    it("Não deve permitir que um usuário se promova para crítico ou administrador", () => {
      cy.newUser().then(({ user }) => {
        cy.tentarAutopromocao("critic");
        cy.tentarAutopromocao("administrador");
      });
    });
  
    it("Deve permitir que um usuário exclua sua própria conta", () => {
      cy.newUser().then(({ user }) => {
        cy.desativarConta(user.id).then(() => {
          cy.request("GET", `usuarios/${user.id}`).then((response) => {
            expect(response.status).to.equal(404);
          });
        });
      });
    });
  
    it("Não deve permitir que um usuário exclua a conta de outro usuário", () => {
      cy.newUser().then(({ user }) => {
        cy.newUser().then(({ user: otherUser }) => {
          cy.tentarExclusaoNaoAutorizada(otherUser.id);
        });
      });
    });
  
    it("Deve permitir que um usuário consulte seus próprios dados pessoais", () => {
      cy.newUser().then(({ user }) => {
        cy.request("GET", `usuarios/${user.id}/dados-pessoais`).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body.email).to.equal(user.email);
          expect(response.body.name).to.equal(user.name);
        });
      });
    });
  
    it("Deve permitir que um administrador consulte os dados pessoais de outro usuário", () => {
      cy.newUser().then(({ user }) => {
        cy.promoverParaAdministrador(user.id).then(() => {
          cy.newUser().then(({ user: otherUser }) => {
            cy.request("GET", `usuarios/${otherUser.id}/dados-pessoais`).then((response) => {
              expect(response.status).to.equal(200);
              expect(response.body.email).to.equal(otherUser.email);
              expect(response.body.name).to.equal(otherUser.name);
            });
          });
        });
      });
    });
  
    it("Não deve permitir que um usuário comum altere o tipo de usuário de outro usuário", () => {
      cy.newUser().then(({ user }) => {
        cy.newUser().then(({ user: otherUser }) => {
          cy.tentarAutopromocao("critic");
          cy.tentarAutopromocao("administrador");
        });
      });
    });
  
    it("Não deve permitir que um usuário não autorizado acesse os dados pessoais de outro usuário", () => {
      cy.newUser().then(({ user }) => {
        cy.newUser().then(({ user: otherUser }) => {
          cy.tentarAcessoNaoAutorizadoDados(otherUser.id);
        });
      });
    });
  
    it("Deve permitir que um administrador cadastre um novo filme no sistema", () => {
      cy.newUser().then(({ user }) => {
        cy.promoverParaAdministrador(user.id).then(() => {
          cy.novoFilme().then(({ filme }) => {
            expect(filme).to.have.property("titulo");
            expect(filme).to.have.property("diretor");
            expect(filme).to.have.property("genero");
            expect(filme).to.have.property("ano");
            expect(filme).to.have.property("descricao");
          });
        });
      });
    });
  
    it("Deve permitir que um administrador exclua um filme do sistema", () => {
      cy.newUser().then(({ user }) => {
        cy.promoverParaAdministrador(user.id).then(() => {
          cy.novoFilme().then(({ filme }) => {
            cy.excluirFilme(filme.id).then(() => {
              cy.request("GET", `filmes/${filme.id}`).then((response) => {
                expect(response.status).to.equal(404);
              });
            });
          });
        });
      });
    });
  
    it("Deve permitir que um usuário visualize detalhes de um filme específico", () => {
      cy.newUser().then(({ user }) => {
        cy.novoFilme().then(({ filme }) => {
          cy.request("GET", `filmes/${filme.id}`).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body).to.have.property("titulo", filme.titulo);
            expect(response.body).to.have.property("diretor", filme.diretor);
            expect(response.body).to.have.property("genero", filme.genero);
            expect(response.body).to.have.property("ano", filme.ano);
            expect(response.body).to.have.property("descricao", filme.descricao);
          });
        });
      });
    });
  
    it("Não deve permitir que um usuário comum cadastre um novo filme", () => {
      cy.newUser().then(({ user }) => {
        cy.tentarExclusaoNaoAutorizada(user.id);
      });
    });
  
    it("Não deve permitir que um usuário comum exclua um filme do sistema", () => {
      cy.newUser().then(({ user }) => {
        cy.promoverParaAdministrador(user.id).then(() => {
          cy.newUser().then(({ user: otherUser }) => {
            cy.excluirFilme(otherUser.id);
          });
        });
      });
    });
});