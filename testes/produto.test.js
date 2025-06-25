import request from "supertest";
import app from "../server";

const pool = require("../database/db");

jest.mock("../middleware/autenticacao", () => ({
  verificarToken: jest.fn((req, res, next) => {
    req.usuario = { tipo_usuario: "admin" };
    next();
  }),
  verificarAdmin: jest.fn((req, res, next) => next()),
}));

jest.mock("../database/db", () => ({
  query: jest.fn(),
}));

describe("Testes de produto", () => {
  it("Deve cadastrar produto com sucesso", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1 }],
    });

    const res = await request(app).post("/produto").send({
      nome: "Produto Teste",
      preco: 10.5,
      descricao: "Teste desc",
      imagem: "img.png",
      categoria_id: 1,
    });

    expect(res.statusCode).toBe(201);
    expect(pool.query).toHaveBeenCalled();
  });
});
