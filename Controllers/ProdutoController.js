import pool from "../database/db.js";

class ProdutoController {
  async cadastrarProduto(req, res) {
    const {
      nome,
      preco,
      descricao,
      imagem,
      tamanho,
      rotulo,
      tipo_embalagem,
      cor_tampa,
      acabamento_superficie,
    } = req.body;

    if (
      nome.trim() === "" ||
      isNaN(Number(preco)) ||
      Number(preco) < 0.1 ||
      Number(preco) > 1000000 ||
      descricao.trim() === "" ||
      imagem.trim() === "" ||
      !["Pequeno", "Médio", "Grande"].includes(tamanho) ||
      !["Sem rótulo", "Padrão", "Personalizado"].includes(rotulo) ||
      !["Vidro", "Plástico", "Acrílico"].includes(tipo_embalagem) ||
      !["Verde", "Laranja", "Roxo"].includes(cor_tampa) ||
      !["Fosco", "Brilhante", "Texturizado"].includes(acabamento_superficie)
    ) {
      return res.status(400).json({
        erro: "Dados inválidos. Confira os campos e tente novamente.",
      });
    }

    try {
      await pool.query(
        `INSERT INTO produtos
        (nome, preco, descricao, imagem, tamanho, rotulo, tipo_embalagem, cor_tampa, acabamento_superficie)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          nome,
          preco,
          descricao,
          imagem,
          tamanho,
          rotulo,
          tipo_embalagem,
          cor_tampa,
          acabamento_superficie,
        ]
      );

      return res
        .status(201)
        .json({ mensagem: "Produto cadastrado com sucesso." });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ erro: "Erro interno no servidor" });
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
    const {
      nome,
      preco,
      descricao,
      imagem,
      tamanho,
      rotulo,
      tipo_embalagem,
      cor_tampa,
      acabamento_superficie,
    } = req.body;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "ID do produto é obrigatório." });
      return;
    }

    // Validação dos campos
    if (
      !nome.trim() ||
      isNaN(Number(preco)) ||
      Number(preco) < 0.1 ||
      Number(preco) > 1000000 ||
      !descricao.trim() ||
      !imagem.trim() ||
      !tamanho ||
      !rotulo ||
      !tipo_embalagem ||
      !cor_tampa ||
      !acabamento_superficie
    ) {
      res.status(400).json({
        error: "Dados inválidos. Confira todos os campos e tente novamente.",
      });
      return;
    }

    try {
      const resposta = await pool.query(
        `UPDATE produtos 
         SET nome = $1, preco = $2, descricao = $3, imagem = $4,
             tamanho = $5, rotulo = $6, tipo_embalagem = $7, cor_tampa = $8, acabamento_superficie = $9
         WHERE id = $10
         RETURNING *`,
        [
          nome,
          preco,
          descricao,
          imagem,
          tamanho,
          rotulo,
          tipo_embalagem,
          cor_tampa,
          acabamento_superficie,
          id,
        ]
      );

      if (resposta.rowCount === 0) {
        res.status(404).json({ error: "Produto não encontrado." });
        return;
      }

      res.status(200).json({ mensagem: "Produto editado com sucesso." });
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
