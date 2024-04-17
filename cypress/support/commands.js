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
  const user = {
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

// Comando personalizado para criar um novo filme
Cypress.Commands.add("novoFilme", () => {
  const filme = {
    titulo: faker.lorem.words(),
    diretor: faker.name.findName(),
    genero: faker.random.arrayElement(['Ação', 'Comédia', 'Drama', 'Ficção Científica', 'Suspense']),
    ano: faker.random.number({ min: 1980, max: 2022 }),
    descricao: faker.lorem.paragraph()
  };

  return cy.request("POST", "filmes", filme).then((response) => {
    const filmeCriado = response.body;
    return { filme: filmeCriado };
  });
});

// Comando personalizado para criar uma nova avaliação de filme
Cypress.Commands.add("novaAvaliacaoFilme", (idFilme, idUsuario) => {
  const avaliacao = {
    avaliacao: faker.random.number({ min: 1, max: 5 }),
    comentario: faker.lorem.sentences(),
    idUsuario: idUsuario,
    idFilme: idFilme,
  };

  return cy.request("POST", `filmes/${idFilme}/avaliacoes`, avaliacao).then((response) => {
    const avaliacaoCriada = response.body;
    return { avaliacao: avaliacaoCriada };
  });
});

// Comando personalizado para promover um usuário para crítico
Cypress.Commands.add("promoverParaCritic", (promotorId, userId) => {
  // Verificar se o promotor é um administrador
  cy.request({
    method: "GET",
    url: `users/${promotorId}`,
    headers: {
      Authorization: `Bearer ${Cypress.env("tokenUsuario")}` // Adiciona o accessToken aos headers
    }
  }).then((response) => {
    if (response.body.tipoUsuario !== "administrador") {
      throw new Error("Somente administradores podem promover usuários para crítico.");
    } else {
      // Promover o usuário para crítico
      return cy.request({
        method: "PUT",
        url: `users/apply/${userId}`,
        headers: {
          Authorization: `Bearer ${Cypress.env("tokenUsuario")}` // Adiciona o accessToken aos headers
        },
        body: { type: "critic" }
      }).then((response) => {
        const usuarioPromovido = response.body;
        return { usuario: usuarioPromovido };
      });
    }
  });
});


// Comando personalizado para promover um usuário a administrador
Cypress.Commands.add("promoverParaAdministrador", (userId) => {
  return cy.request("PUT", `usuarios/${userId}/promover`, { tipoUsuario: "administrador" }).then((response) => {
    const usuarioPromovido = response.body;
    return { usuario: usuarioPromovido };
  });
});

// Comando personalizado para desativar uma conta de usuário
Cypress.Commands.add("desativarConta", (userId) => {
  return cy.request("PUT", `usuarios/${userId}/desativar`).then((response) => {
    const usuarioDesativado = response.body;
    return { usuario: usuarioDesativado };
  });
});

// Comando personalizado para excluir uma conta de usuário por um administrador
Cypress.Commands.add("excluirContaUsuario", (userId) => {
  return cy.request("DELETE", `usuarios/${userId}`).then(() => {
    return { userId: userId };
  });
});

// Comando personalizado para excluir um filme por um administrador
Cypress.Commands.add("excluirFilme", (movieId) => {
  return cy.request("DELETE", `filmes/${movieId}`).then(() => {
    return { movieId: movieId };
  });
});

// Comando personalizado para tentar autopromoção de usuário
Cypress.Commands.add("tentarAutopromocao", (tipoUsuario) => {
  return cy.request("PUT", "usuarios/self/promover", { tipoUsuario: tipoUsuario }).then(() => {
    cy.log("Tentativa de autopromoção de usuário foi feita, mas não deve ser permitida.");
  }).catch((error) => {
    expect(error.response.body.message).to.equal("Autopromoção não é permitida.");
  });
});

// Comando personalizado para tentar exclusão não autorizada de conta de usuário
Cypress.Commands.add("tentarExclusaoNaoAutorizada", (userId) => {
  return cy.request("DELETE", `usuarios/${userId}`).then(() => {
    cy.log("Tentativa de exclusão não autorizada de conta de usuário foi feita, mas não deve ser permitida.");
  }).catch((error) => {
    expect(error.response.body.message).to.equal("Não autorizado a excluir conta de usuário.");
  });
});

// Comando personalizado para recuperar dados pessoais por um usuário não autorizado
Cypress.Commands.add("tentarAcessoNaoAutorizadoDados", (userId) => {
  return cy.request("GET", `usuarios/${userId}/dados-pessoais`).then(() => {
    cy.log("Tentativa não autorizada de acessar dados pessoais foi feita, mas não deve ser permitida.");
  }).catch((error) => {
    expect(error.response.body.message).to.equal("Não autorizado a acessar dados pessoais.");
  });
});

Cypress.Commands.add("loginAdmin", () => {
  // Realiza a solicitação de login como administrador
  return cy.request({
    method: "POST",
    url: "auth/login",
    body: {
      email: "admin@example.com",
      password: "admin123"
    }
  }).then((response) => {
    // Extrai o token de autenticação do corpo da resposta
    const tokenUsuario = response.body.tokenUsuario;
    return { tokenUsuario: tokenUsuario };
  });
});

Cypress.Commands.add("loginUser", () => {
  const usuarioLogin = {
    email: faker.internet.email(),
    password: faker.internet.password(),
  };

  return cy.request("POST", "auth/login", usuarioLogin).then((response) => {
    expect(response.status).to.equal(200);
    return response.body.tokenUsuario;
  });
});

Cypress.Commands.add("turnAdmin", (tokenUsuario) => {
  return cy.request({
    method: "PATCH",
    url: "users/admin",
    headers: { Authorization: "Bearer " + tokenUsuario },
  }).then((response) => {
    expect(response.status).to.equal(204);
  });
});

Cypress.Commands.add("deleteUser", (userId, tokenUsuario) => {
  return cy.request({
    method: "DELETE",
    url: `users/${userId}`,
    headers: { Authorization: "Bearer " + tokenUsuario },
  }).then((response) => {
    expect(response.status).to.equal(204);
  });
});