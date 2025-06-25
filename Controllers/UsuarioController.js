import pool from "../database/db.js";
import bcrypt from "bcrypt";

class UsuarioController {
  async pegarUsuarios(req, res) {
    try {
      const resultado = await pool.query("SELECT * FROM usuarios");
      res.status(200).json(resultado.rows);
    } catch (error) {
      console.log(error);
      res.status(500);
    }
  }

  async cadastrar(req, res) {
    const { nome, email, telefone, senha } = req.body;

    try {
      const senhaCriptografada = await bcrypt.hash(senha, 12);

      const resultado = await pool.query(
        "INSERT INTO usuarios (nome, email, telefone, senha, tipo_usuario) VALUES ($1, $2, $3, $4, 'usuario')",
        [nome, email, telefone, senhaCriptografada]
      );
      res.status(200).json({ mensagem: "Cadastrado com sucesso" });
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }
}

export default UsuarioController;
