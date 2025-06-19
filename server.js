import express from "express";
import cors from "cors";
import UsuarioController from "./Controllers/UsuarioController.js";
import AutenticacaoController from "./Controllers/AutenticacaoController.js";
import { verificarAdmin, verificarToken } from "./middleware/autenticacao.js";
import ProdutoController from "./Controllers/ProdutoController.js";

const app = express();
app.use(express.json());
app.use(cors("*"));

const usuarioController = new UsuarioController();

app.get("/usuario", usuarioController.pegarUsuarios);
app.post("/usuario", usuarioController.cadastrar);

const autenticacaoController = new AutenticacaoController();

app.post("/login", autenticacaoController.logar);
app.get("/perfil", verificarToken, autenticacaoController.pegarPerfil);

const produtoController = new ProdutoController();

app.post(
  "/produto",
  verificarToken,
  verificarAdmin,
  produtoController.cadastrarProduto
);
app.get("/produto", produtoController.pegarProdutos);
app.get("/produto/:id", produtoController.pegarProdutoPorId);
app.put(
  "/produto/:id",
  verificarToken,
  verificarAdmin,
  produtoController.editarProduto
);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
