import pool from "../database/db.js";
import bcrypt from "bcrypt";

class UsuarioController {
  async cadastrar(req, res) {
    const { nome, email, telefone, senha } = req.body;

    if (
      nome.trim().length < 3 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !/^\d{11}$/.test(telefone) ||
      senha.length < 6
    ) {
      res.status(400).json({
        error: "Dados inválidos. Confira os campos e tente novamente.",
      });
      return;
    }
    try {
      const senhaCriptografada = await bcrypt.hash(senha, 12);

      const resultado = await pool.query(
        "INSERT INTO usuarios (nome, email, telefone, senha, tipo_usuario) VALUES ($1, $2, $3, $4, $5)",
        [nome, email, telefone, senhaCriptografada, "usuario"]
      );
      res.status(201).json({ mensagem: "Cadastrado com sucesso" });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }
}

export default UsuarioController;
