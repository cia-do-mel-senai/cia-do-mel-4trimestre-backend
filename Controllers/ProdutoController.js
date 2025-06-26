import pool from "../database/db.js";

class ProdutoController {
  async cadastrarProduto(req, res) {
    const { nome, preco, descricao, imagem, categoria_id } = req.body;

    if (
      nome.trim() === "" ||
      Number(preco) < 0.1 ||
      Number(preco) > 1000000 ||
      isNaN(Number(preco)) ||
      descricao.trim() === "" ||
      imagem.trim() === "" ||
      ![1, 2].includes(Number(categoria_id))
    ) {
      res.status(400).json({
        error: "Dados inválidos. Confira os campos e tente novamente.",
      });
      return;
    }

    try {
      await pool.query(
        "INSERT INTO produtos (nome, preco, descricao, imagem, categoria_id) VALUES ($1, $2, $3, $4, $5)",
        [nome, preco, descricao, imagem, categoria_id]
      );

      res.status(201).json({ mensagem: "Produto cadastrado com sucesso." });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async pegarProdutos(req, res) {
    try {
      const resposta = await pool.query("SELECT * FROM produtos");
      const produtos = resposta.rows;
      res.status(200).json(produtos);
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async pegarProdutoPorId(req, res) {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "ID do produto é obrigatório." });
      return;
    }

    try {
      const resposta = await pool.query(
        "SELECT * FROM produtos WHERE id = $1",
        [id]
      );

      if (resposta.rows.length === 0) {
        res.status(404).json({ error: "Produto não encontrado." });
        return;
      }

      const produto = resposta.rows[0];

      res.status(200).json(produto);
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async editarProduto(req, res) {
    const { id } = req.params;
    const { nome, preco, descricao, imagem, categoria_id } = req.body;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "ID do produto é obrigatório." });
      return;
    }

    if (
      nome.trim() === "" ||
      Number(preco) <= 0.1 ||
      Number(preco) >= 1000000 ||
      isNaN(Number(preco)) ||
      descricao.trim() === "" ||
      imagem.trim() === "" ||
      ![1, 2].includes(categoria_id)
    ) {
      res.status(400).json({
        error: "Dados inválidos. Confira os campos e tente novamente.",
      });
      return;
    }

    try {
      const resposta = await pool.query(
        "UPDATE produtos SET nome = $1, preco = $2, descricao = $3, imagem = $4, categoria_id = $5 WHERE id = $6 RETURNING *",
        [nome, preco, descricao, imagem, categoria_id, id]
      );

      if (resposta.rowCount === 0) {
        res.status(404).json({ error: "Produto não encontrado." });
        return;
      }

      res.status(200).json({ mensagem: "Produto editado com sucesso." });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async excluirProduto(req, res) {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "ID do produto é obrigatório." });
      return;
    }

    try {
      const resposta = await pool.query("DELETE FROM produtos WHERE id = $1", [
        id,
      ]);

      if (resposta.rowCount === 0) {
        res.status(404).json({ error: "Produto não encontrado." });
        return;
      }

      res.status(200).json({ mensagem: "Produto excluído com sucesso." });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async ultimosProdutos(req, res) {
    try {
      const resposta = await pool.query(
        "SELECT * FROM produtos ORDER BY id DESC LIMIT 3"
      );
      res.status(200).json(resposta.rows);
    } catch (err) {
      res.status(500).json({ erro: "Erro ao buscar os produtos" });
    }
  }
}

export default ProdutoController;
