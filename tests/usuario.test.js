import request from "supertest";
import app from "../server";

const pool = require("../database/db");

jest.mock("../database/db", () => ({
  query: jest.fn(),
}));

const usuarioValido = {
  nome: "Usuário Teste",
  email: "email@teste.com",
  telefone: "12345678901",
  senha: "senhaTeste",
};

const usuariosInvalidos = [
  [
    {
      nome: "",
      email: "email@teste.com",
      telefone: "12345678901",
      senha: "senhaTeste",
    },
    "nome vazio",
  ],
  [
    {
      nome: "Usuário Teste",
      email: "",
      telefone: "12345678901",
      senha: "senhaTeste",
    },
    "email vazio",
  ],
  [
    {
      nome: "Usuário Teste",
      email: "email@teste.com",
      telefone: "",
      senha: "senhaTeste",
    },
    "telefone vazio",
  ],
  [
    {
      nome: "Usuário Teste",
      email: "email@teste.com",
      telefone: "12345678901",
      senha: "",
    },
    "senha vazia",
  ],
];

describe("UsuarioController", () => {
  describe("Cadastro de usuario", () => {
    test("Deve cadastrar usuário com sucesso", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
      });

      const res = await request(app).post("/usuario").send(usuarioValido);
      expect(res.statusCode).toBe(201);
      expect(res.body.mensagem).toBe("Cadastrado com sucesso");
    });

    usuariosInvalidos.forEach(([usuario, desc]) => {
      test(`Deve retornar 400 para ${desc}`, async () => {
        const res = await request(app).post("/usuario").send(usuario);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe(
          "Dados inválidos. Confira os campos e tente novamente."
        );
      });
    });

    test("Deve retornar 500 se ocorrer erro interno ao cadastrar usuário", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).post("/usuario").send(usuarioValido);

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });
});
