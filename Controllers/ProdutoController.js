import pool from "../database/db.js";

class ProdutoController {
  async cadastrarProduto(req, res) {
    const { nome, preco, descricao, imagem, categoria_id } = req.body;

    try {
      const resposta = pool.query(
        "INSERT INTO produtos (nome, preco, descricao, imagem, categoria_id) VALUES ($1, $2, $3, $4, $5)",
        [nome, preco, descricao, imagem, categoria_id]
      );

      return res
        .status(201)
        .json({ mensagem: "Produto cadastrado com sucesso." });
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async pegarProdutos(req, res) {
    try {
      const resposta = await pool.query("SELECT * FROM produtos");
      res.status(200).json(resposta.rows);
    } catch (error) {}
  }

  async pegarProdutoPorId(req, res) {
    const { id } = req.params;

    try {
      const resposta = await pool.query(
        "SELECT * FROM produtos WHERE id = $1",
        [id]
      );

      const produto = resposta.rows[0];

      res.status(200).json(produto);
    } catch (error) {}
    res.status(200);
  }
}

export default ProdutoController;
