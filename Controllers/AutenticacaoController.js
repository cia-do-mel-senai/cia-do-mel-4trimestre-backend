import pool from "../database/db.js";
import bcrypt from "bcrypt";

class AutenticacaoController {
  async logar(req, res) {
    const { email, senha } = req.body;

    try {
      const resultado = await pool.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [email]
      );

      const usuario = resultado.rows[0];

      const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
      if (!senhaCorreta) {
        res.status(401).json({ erro: "Email ou senha inválidos" });
      }
      res.status(200).json(usuario);
    } catch (error) {
      console.log(error);
      res.status(500).json("Erro interno no servidor");
    }
  }
}

export default AutenticacaoController;
