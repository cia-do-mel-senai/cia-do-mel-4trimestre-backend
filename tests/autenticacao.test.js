import request from "supertest";
import app from "../server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const pool = require("../database/db");

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../database/db", () => ({
  query: jest.fn(),
}));
jest.mock("../middleware/autenticacao", () => ({
  verificarToken: jest.fn((req, res, next) => {
    req.usuario = { tipo_usuario: "usuario" };
    next();
  }),
  verificarAdmin: jest.fn((req, res, next) => next()),
}));

const informacoesInvalidas = [
  [
    {
      email: "",
      senha: "senhaTeste",
    },
    "email vazio",
  ],
  [
    {
      email: "email@teste.com",
      senha: "",
    },
    "senha vazia",
  ],
];

describe("Autenticação", () => {
  describe("Login", () => {
    test("Deve fazer login com sucesso", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: "email@teste.com",
            senha: "hash_fake",
            tipo_usuario: "admin",
          },
        ],
      });

      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValue("token_fake");

      const res = await request(app).post("/login").send({
        email: "email@teste.com",
        senha: "senhaTeste",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("mensagem", "Login bem-sucedido");
      expect(res.body).toHaveProperty("token", "token_fake");
    });

    informacoesInvalidas.forEach(([credenciais, desc]) => {
      test(`Deve retornar 400 para ${desc}`, async () => {
        const res = await request(app).post("/login").send(credenciais);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe(
          "Dados inválidos. Confira os campos e tente novamente."
        );
      });
    });

    test("Deve retornar 401 ao não encontrar usuário", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [],
      });

      const res = await request(app).post("/login").send({
        email: "email@teste.com",
        senha: "senhaTeste",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.erro).toBe("Email ou senha inválidos");
    });

    test("Deve retornar 401 quando a senha for incorreta", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: "email@teste.com",
            senha: "hash_fake",
            tipo_usuario: "admin",
          },
        ],
      });

      bcrypt.compare.mockResolvedValueOnce(false);

      const res = await request(app).post("/login").send({
        email: "email@teste.com",
        senha: "senhaTeste",
      });

      expect(res.statusCode).toBe(401);
      expect(res.body.erro).toBe("Email ou senha inválidos");
    });

    test("Deve retornar 500 se ocorrer erro interno ao efetuar login", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).post("/login").send({
        email: "email@teste.com",
        senha: "senhaTeste",
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });

  describe("Pegar perfil", () => {
    test("Pegar perfil com sucesso", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            tipo_usuario: "admin",
          },
        ],
      });

      const res = await request(app).get("/perfil");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        usuario: {
          id: 1,
          tipo_usuario: "admin",
        },
      });
    });

    test("Pegar perfil com sucesso", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [],
      });

      const res = await request(app).get("/perfil");

      expect(res.statusCode).toBe(404);
      expect(res.body.erro).toEqual("Usuário não encontrado");
    });

    test("Deve retornar 500 se ocorrer erro interno ao pegar perfil", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).get("/perfil");

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });
});
