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
      const produtoDoPedido = await pool.query(
        "SELECT * FROM produtos WHERE id = $1",
        [produtoId]
      );
      let produto;

      if (produtoDoPedido.rowCount === 0) {
        return res.status(404).json({ error: "Produto não encontrado" });
      } else {
        produto = produtoDoPedido.rows[0];
      }

      const pedido = await pool.query(
        `INSERT INTO pedidos 
          (codigo_pedido, gestor_id, data_criacao, status, quantidade, produto_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          Date.now().toString(),
          req.usuario.id,
          new Date(),
          "Pendente",
          Number(quantidade),
          Number(produtoId),
        ]
      );

      const pedidoBancada = await fetch(
        "http://52.1.197.112:3000/queue/items",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            payload: {
              orderId: pedido.rows[0].id,
              sku: produto.bloco.tamanho,
              cor: produto.bloco.cor,
            },
            callbackUrl: process.env.CALLBACK_URL,
            estoquePos: 26,
          }),
        }
      );

      const respostaBancada = await pedidoBancada.json();

      console.log(respostaBancada.id, pedido.rows[0].id);

      const adicionarIdBancada = await pool.query(
        `UPDATE pedidos
         SET pedido_bancada_id = $1
         WHERE id = $2`,
        [respostaBancada.id, pedido.rows[0].id]
      );

      console.log(adicionarIdBancada);

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

      // resposta.rows.forEach(async (pedido) => {
      //   if (pedido.status !== "COMPLETED") {
      //     const pedidoBancada = await fetch(
      //       `http://52.1.197.112:3000/queue/items/${pedido.pedido_bancada_id}`,
      //       { method: "GET", headers: { "Content-Type": "application/json" } }
      //     );

      //     const respostaBancada = await pedidoBancada.json();

      //     if (pedido.status !== respostaBancada.status) {
      //       console.log(pedido, respostaBancada);

      //       await pool.query(
      //         `UPDATE pedidos
      //          SET status = $1
      //          WHERE id = $2`,
      //         [respostaBancada.status || "null na bancada", pedido.id]
      //       );
      //     }
      //   }
      // });

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
