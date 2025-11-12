import pool from "../database/db.js";

class PedidosController {
  async criarPedido(req, res) {
    const { quantidade, produtoId } = req.body;

    if (isNaN(Number(quantidade)) || quantidade < 1) {
      return res.status(400).json({
        error: "Quantidade inválida.",
      });
    }

    if (!produtoId || isNaN(Number(produtoId))) {
      return res.status(400).json({
        error: "ID do produto é obrigatório.",
      });
    }

    try {
      await pool.query(
        `INSERT INTO pedidos 
          (codigo_pedido, gestor_id, data_criacao, status, quantidade, produto_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          Date.now().toString(),
          req.usuario.id,
          new Date(),
          "Pedido realizado",
          Number(quantidade),
          Number(produtoId),
        ]
      );

      res.status(201).json({ mensagem: "Pedido feito com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async pegarPedidosPorId(req, res) {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "ID do gestor é obrigatório." });
    }

    try {
      const resposta = await pool.query(
        `SELECT p.*, pr.nome AS nome_produto 
         FROM pedidos p
         JOIN produtos pr ON p.produto_id = pr.id
         WHERE p.gestor_id = $1`,
        [id]
      );

      res.status(200).json(resposta.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async pegarPedidos(req, res) {
    try {
      const resposta = await pool.query(
        `SELECT p.*, pr.nome AS nome_produto 
         FROM pedidos p
         JOIN produtos pr ON p.produto_id = pr.id`
      );

      res.status(200).json(resposta.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async atualizarStatusPedido(req, res) {
    const { status } = req.body;
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ error: "ID do pedido é obrigatório." });
    }

    try {
      const resposta = await pool.query(
        "UPDATE pedidos SET status = $1 WHERE id = $2;",
        [status, id]
      );

      if (resposta.rowCount === 0) {
        return res.status(404).json({ error: "Pedido não encontrado." });
      }

      res.status(200).json({ mensagem: "Status atualizado com sucesso" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }
}

export default PedidosController;
