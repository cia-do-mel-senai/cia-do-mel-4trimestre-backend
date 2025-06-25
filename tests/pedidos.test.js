import request from "supertest";
import app from "../server";

const pool = require("../database/db");

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

describe("PedidosController", () => {
  describe("Cadastro de pedido", () => {
    test("Deve cadastrar pedido com sucesso", async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1 }],
      });

      const res = await request(app).post("/pedidos").send({
        valor_total: 1000,
      });

      expect(res.statusCode).toBe(201);
      expect(res.body.mensagem).toBe("Pedido feito com sucesso");
    });

    test("Deve retornar 400 ao receber valor total inválido", async () => {
      const res = await request(app).post("/pedidos").send({
        valor_total: "abc",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Valor total inválido.");
    });

    test("Deve retornar 500 se ocorrer erro interno ao cadastrar pedido", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).post("/pedidos").send({
        valor_total: 1000,
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });

  describe("Pegar pedidos", () => {
    test("Pegar pedidos com sucesso", async () => {
      const pedidosMock = [{ id: 1 }, { id: 2 }];

      pool.query.mockResolvedValueOnce({ rows: pedidosMock });

      const res = await request(app).get("/pedidos");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(pedidosMock);
    });

    test("Deve retornar 500 se ocorrer erro interno ao pegar pedidos", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).get("/pedidos");

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });

  describe("Pegar pedidos por id", () => {
    test("Deve pegar pedidos por id com sucesso", async () => {
      const pedidosMock = [{ id: 1 }, { id: 1 }];
      pool.query.mockResolvedValueOnce({ rows: pedidosMock });

      const res = await request(app).get("/pedidos/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(pedidosMock);
    });

    test("Deve retornar 400 se o ID não for fornecido ou inválido", async () => {
      const res = await request(app).get("/pedidos/abc");

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("ID do produto é obrigatório.");
    });

    test("Deve retornar 500 se ocorrer erro interno ao pegar pedidos por id", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).get("/pedidos/1");

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });

  describe("Atualizar status do pedido", () => {
    test("Deve retornar 400 se o ID for inválido", async () => {
      const res = await request(app).patch("/pedidos/abc").send({
        status: "Pedido enviado",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("ID do produto é obrigatório.");
    });

    test("Deve retornar 400 se o status for inválido", async () => {
      const res = await request(app).patch("/pedidos/1").send({
        status: "Status inventado",
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("Status inválido.");
    });

    test("Deve retornar 404 se o pedido não for encontrado", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const res = await request(app).patch("/pedidos/1").send({
        status: "Pedido enviado",
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Pedido não encontrado.");
    });

    test("Deve atualizar o status com sucesso", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app).patch("/pedidos/1").send({
        status: "Pedido entregue",
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.mensagem).toBe("Status atualizado com sucesso");
    });

    test("Deve retornar 500 se ocorrer erro interno", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).patch("/pedidos/1").send({
        status: "Pedido enviado",
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });
});
