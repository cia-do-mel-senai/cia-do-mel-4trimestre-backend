import express from "express";
import cors from "cors";
import UsuarioController from "./Controllers/UsuarioController.js";
import AutenticacaoController from "./Controllers/AutenticacaoController.js";
import { verificarToken } from "./middleware/autenticacao.js";
import ProdutoController from "./Controllers/ProdutoController.js";
import PedidosController from "./Controllers/PedidosController.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors("*"));

const usuarioController = new UsuarioController();

app.post("/usuario", usuarioController.cadastrar);

const autenticacaoController = new AutenticacaoController();

app.post("/login", autenticacaoController.logar);
app.get("/perfil", verificarToken, autenticacaoController.pegarPerfil);

const produtoController = new ProdutoController();

app.post("/produto", verificarToken, produtoController.cadastrarProduto);
app.get("/produto", produtoController.pegarProdutos);
app.get("/produto/ultimos", produtoController.ultimosProdutos);
app.get("/produto/:id", produtoController.pegarProdutoPorId);
app.put(
  "/produto/:id",
  verificarToken,

  produtoController.editarProduto
);
app.delete(
  "/produto/:id",
  verificarToken,

  produtoController.excluirProduto
);

const pedidosController = new PedidosController();

app.post("/pedidos", verificarToken, pedidosController.criarPedido);
app.get(
  "/pedidos",
  verificarToken,

  pedidosController.pegarPedidos
);
app.get("/pedidos/:id", verificarToken, pedidosController.pegarPedidosPorId);
app.patch(
  "/pedidos/:id",
  verificarToken,

  pedidosController.atualizarStatusPedido
);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});

export default app;
