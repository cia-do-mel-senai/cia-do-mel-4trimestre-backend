import pool from "../database/db.js";

const mapEnumsToCodes = {
  tamanho: { Pequeno: "Pequeno", Médio: "Médio", Grande: "Grande" },
  rotulo: { "Sem rótulo": 1, Preto: 2, Branco: 3 },
  tipo_embalagem: { Vidro: 1, Plástico: 2, Acrílico: 3 },
  cor_tampa: { Verde: "azul", Laranja: "vermelho", Roxo: "amarelo" },
  acabamento_superficie: { Fosco: "A1", Brilhante: "B1", Texturizado: "C1" },
};

function traduzirParaBloco(produto) {
  return {
    tamanho: mapEnumsToCodes.tamanho[produto.tamanho],
    lamina1: mapEnumsToCodes.rotulo[produto.rotulo],
    lamina2: mapEnumsToCodes.tipo_embalagem[produto.tipo_embalagem],
    cor: mapEnumsToCodes.cor_tampa[produto.cor_tampa],
    padrao1:
      mapEnumsToCodes.acabamento_superficie[produto.acabamento_superficie],
  };
}

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
      !["Sem rótulo", "Preto", "Branco"].includes(rotulo) ||
      !["Vidro", "Plástico", "Acrílico"].includes(tipo_embalagem) ||
      !["Verde", "Laranja", "Roxo"].includes(cor_tampa) ||
      !["Fosco", "Brilhante", "Texturizado"].includes(acabamento_superficie)
    ) {
      return res.status(400).json({
        erro: "Dados inválidos. Confira os campos e tente novamente.",
      });
    }

    const produto = {
      tamanho,
      rotulo,
      tipo_embalagem,
      cor_tampa,
      acabamento_superficie,
    };

    const bloco = traduzirParaBloco(produto);

    try {
      await pool.query(
        `INSERT INTO produtos
        (nome, preco, descricao, imagem, tamanho, rotulo, tipo_embalagem, cor_tampa, acabamento_superficie, bloco)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
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
          bloco,
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

    const produto = {
      tamanho,
      rotulo,
      tipo_embalagem,
      cor_tampa,
      acabamento_superficie,
    };

    const bloco = traduzirParaBloco(produto);

    try {
      const resposta = await pool.query(
        `UPDATE produtos 
         SET nome = $1, preco = $2, descricao = $3, imagem = $4,
             tamanho = $5, rotulo = $6, tipo_embalagem = $7, cor_tampa = $8, acabamento_superficie = $9, bloco = $10
         WHERE id = $11
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
          bloco,
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
