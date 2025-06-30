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

const produtosInvalidos = [
  [
    {
      nome: "",
      preco: 10,
      descricao: "desc",
      imagem: "img.png",
      categoria_id: 1,
    },
    "nome vazio",
  ],
  [
    {
      nome: "Produto",
      preco: 0,
      descricao: "desc",
      imagem: "img.png",
      categoria_id: 1,
    },
    "preço menor que 0.1",
  ],
  [
    {
      nome: "Produto",
      preco: 10,
      descricao: "",
      imagem: "img.png",
      categoria_id: 1,
    },
    "descrição vazia",
  ],
  [
    {
      nome: "Produto",
      preco: 10,
      descricao: "desc",
      imagem: "",
      categoria_id: 1,
    },
    "imagem vazia",
  ],
  [
    {
      nome: "Produto",
      preco: 10,
      descricao: "desc",
      imagem: "img.png",
      categoria_id: 3,
    },
    "categoria inválida",
  ],
];

describe("ProdutoController", () => {
 
  describe("Cadastro de produto", () => {
    test("Deve cadastrar produto com sucesso", async () => {
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
      expect(res.body.mensagem).toBe("Produto cadastrado com sucesso.");
    });

    produtosInvalidos.forEach(([produto, desc]) => {
      test(`Deve retornar 400 para ${desc}`, async () => {
        const res = await request(app).post("/produto").send(produto);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe(
          "Dados inválidos. Confira os campos e tente novamente."
        );
      });
    });

    test("Deve retornar 500 se ocorrer erro interno ao cadastrar produto", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).post("/produto").send({
        nome: "Produto Teste",
        preco: 10.5,
        descricao: "Teste desc",
        imagem: "img.png",
        categoria_id: 1,
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });

  describe("Pegar produtos", () => {
    test("Deve retornar a lista de produtos com sucesso", async () => {
      const produtosMock = [
        { id: 1, nome: "Produto 1", preco: 10.5 },
        { id: 2, nome: "Produto 2", preco: 20.0 },
      ];

      pool.query.mockResolvedValueOnce({ rows: produtosMock });

      const res = await request(app).get("/produto");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(produtosMock);
    });

    test("Deve retornar 500 se ocorrer erro interno ao buscar produtos", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).get("/produto");

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });

  describe("Pegar produto por id", () => {
    test("Deve retornar 400 se o ID não for fornecido ou inválido", async () => {
      const res = await request(app).get("/produto/abc");

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("ID do produto é obrigatório.");
    });

    test("Deve retornar 404 se o produto não for encontrado", async () => {
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app).get("/produto/999");

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Produto não encontrado.");
    });

    test("Deve retornar o produto quando encontrado", async () => {
      const produtoMock = {
        id: 1,
        nome: "Produto Teste",
        preco: 10.5,
        descricao: "desc",
        imagem: "img.png",
        categoria_id: 1,
      };

      pool.query.mockResolvedValueOnce({ rows: [produtoMock] });

      const res = await request(app).get("/produto/1");

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual(produtoMock);
    });

    test("Deve retornar 500 se ocorrer erro interno", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).get("/produto/1");

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });

  describe("Editar produto", () => {
    test("Deve retornar 400 se o ID não for fornecido ou inválido", async () => {
      const res = await request(app).put("/produto/abc").send({
        nome: "Produto Teste",
        preco: 10.5,
        descricao: "Teste desc",
        imagem: "img.png",
        categoria_id: 1,
      });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("ID do produto é obrigatório.");
    });

    produtosInvalidos.forEach(([produto, desc]) => {
      test(`Deve retornar 400 para ${desc}`, async () => {
        const res = await request(app).put("/produto/1").send(produto);

        expect(res.statusCode).toBe(400);
        expect(res.body.error).toBe(
          "Dados inválidos. Confira os campos e tente novamente."
        );
      });
    });

    test("Deve retornar 404 se o produto não for encontrado", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const res = await request(app).put("/produto/999").send({
        nome: "Produto Teste",
        preco: 10.5,
        descricao: "Teste desc",
        imagem: "img.png",
        categoria_id: 1,
      });

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Produto não encontrado.");
    });

    test("Deve editar produto com sucesso", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app).put("/produto/1").send({
        nome: "Produto Teste",
        preco: 10.5,
        descricao: "Teste desc",
        imagem: "img.png",
        categoria_id: 1,
      });

      expect(res.statusCode).toBe(200);
      expect(res.body.mensagem).toBe("Produto editado com sucesso.");
    });

    test("Deve retornar 500 se ocorrer erro interno", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).put("/produto/1").send({
        nome: "Produto Teste",
        preco: 10.5,
        descricao: "Teste desc",
        imagem: "img.png",
        categoria_id: 1,
      });

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });

  describe("Excluir produto", () => {
    test("Deve retornar 400 se o ID não for fornecido ou inválido", async () => {
      const res = await request(app).delete("/produto/abc");

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBe("ID do produto é obrigatório.");
    });

    test("Deve retornar 404 se o produto não for encontrado", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 0 });

      const res = await request(app).delete("/produto/999");

      expect(res.statusCode).toBe(404);
      expect(res.body.error).toBe("Produto não encontrado.");
    });

    test("Deve excluir produto com sucesso", async () => {
      pool.query.mockResolvedValueOnce({ rowCount: 1 });

      const res = await request(app).delete("/produto/1");

      expect(res.statusCode).toBe(200);
      expect(res.body.mensagem).toBe("Produto excluído com sucesso.");
    });

    test("Deve retornar 500 se ocorrer erro interno", async () => {
      pool.query.mockRejectedValueOnce(new Error("Falha no banco"));

      const res = await request(app).delete("/produto/1");

      expect(res.statusCode).toBe(500);
      expect(res.body.erro).toBe("Erro interno no servidor");
    });
  });
});
