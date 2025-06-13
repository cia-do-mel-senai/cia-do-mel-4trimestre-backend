import express from "express";
import pool from "./database/db.js";
import bcrypt from "bcrypt";
import cors from "cors";
import UsuarioController from "./Controllers/UsuarioController.js";
import AutenticacaoController from "./Controllers/AutenticacaoController.js";

const app = express();
app.use(express.json());
app.use(cors("*"));

const usuarioController = new UsuarioController();

app.get("/usuario", usuarioController.pegarUsuarios);
app.post("/usuario", usuarioController.cadastrar);

const autenticacaoController = new AutenticacaoController();

app.post("/login", autenticacaoController.logar);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
