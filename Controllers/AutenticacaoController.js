import pool from "../database/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

class AutenticacaoController {
  async logar(req, res) {
    const { email, senha } = req.body;

    try {
      const resultado = await pool.query(
        "SELECT * FROM usuarios WHERE email = $1",
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

      const token = jwt.sign(
        { id: usuario.id, tipo_usuario: usuario.tipo_usuario },
        JWT_SECRET,
        { expiresIn: "2h" }
      );

      return res.status(200).json({ mensagem: "Login bem-sucedido", token });
    } catch (error) {
      console.log(error);
      res.status(500).json("Erro interno no servidor");
    }
  }

  async pegarPerfil(req, res) {
    try {
      const usuarioId = req.usuario.id;

      const resultado = await pool.query(
        "SELECT * FROM usuarios WHERE id = $1",
        [usuarioId]
      );

      if (resultado.rows.length === 0) {
        return res.status(404).json({ erro: "Usuário não encontrado" });
      }

      const usuarioEncontrado = resultado.rows[0];

      const usuario = {
        tipo_usuario: usuarioEncontrado.tipo_usuario,
        id: usuarioEncontrado.id,
      };

      res.status(200).json({ usuario });
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Erro interno do servidor" });
    }
  }
}

export default AutenticacaoController;
