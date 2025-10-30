import pool from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

class AutenticacaoController {
  async logar(req, res) {
    const { email, senha } = req.body;

    if (email.trim() === "" || senha.trim() === "") {
      res.status(400).json({
        error: "Dados inválidos. Confira os campos e tente novamente.",
      });
      return;
    }

    try {
      const resultado = await pool.query(
        "SELECT * FROM gestores WHERE email = $1",
        [email]
      );

      const usuario = resultado.rows[0];

      if (!usuario) {
        return res.status(401).json({ erro: "Email ou senha inválidos" });
      }

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

      if (!senhaCorreta) {
        return res.status(401).json({ erro: "Email ou senha inválidos" });
      }

      const token = jwt.sign({ id: usuario.id }, JWT_SECRET, {
        expiresIn: "2h",
      });

      res.status(200).json({ mensagem: "Login bem-sucedido", token });
      return;
    } catch (error) {
      console.log(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }

  async pegarPerfil(req, res) {
    try {
      const usuarioId = req.usuario.id;

      const resultado = await pool.query(
        "SELECT * FROM gestores WHERE id = $1",
        [usuarioId]
      );

      if (resultado.rows.length === 0) {
        res.status(404).json({ erro: "Usuário não encontrado" });
        return;
      }

      const usuarioEncontrado = resultado.rows[0];

      const usuario = {
        tipo_usuario: usuarioEncontrado.tipo_usuario,
        id: usuarioEncontrado.id,
      };

      res.status(200).json({ usuario });
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno no servidor" });
    }
  }
}

export default AutenticacaoController;
