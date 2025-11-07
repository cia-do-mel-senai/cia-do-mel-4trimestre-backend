import pool from "../database/db.js";

class PedidosController {
  async criarPedido(req, res) {
    const { quantidade, produtoNome } = req.body;

    if (isNaN(Number(quantidade)) || quantidade < 1) {
      res.status(400).json({
        error: "Quantidade inválida.",
      });
      return;
    }

    try {
      await pool.query(
        "INSERT INTO pedidos (codigo_pedido, gestor_id, data_criacao, status, quantidade, produto_nome) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          Date.now(),
          req.usuario.id,
          new Date(),
          "Pedido realizado",
          Number(quantidade),
          produtoNome,
        ]
      );

      res.status(201).json({ mensagem: "Pedido feito com sucesso" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async pegarPedidosPorId(req, res) {
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "ID do produto é obrigatório." });
      return;
    }

    try {
      const resposta = await pool.query(
        "SELECT * FROM pedidos WHERE usuario_id = $1",
        [id]
      );

      res.status(200).json(resposta.rows);
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async pegarPedidos(req, res) {
    try {
      const resposta = await pool.query("SELECT * FROM pedidos");

      res.status(200).json(resposta.rows);
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async atualizarStatusPedido(req, res) {
    const { status } = req.body;
    const { id } = req.params;

    if (!id || isNaN(Number(id))) {
      res.status(400).json({ error: "ID do produto é obrigatório." });
      return;
    }

    if (
      ![
        "Pedido realizado",
        "Pedido em preparo",
        "Pedido enviado",
        "Pedido entregue",
        "Pedido cancelado",
      ].includes(status)
    ) {
      res.status(400).json({ error: "Status inválido." });
      return;
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
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }
}

export default PedidosController;
