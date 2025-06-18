import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ erro: "Token não fornecido" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ erro: "Token inválido ou expirado" });
    }
    req.usuario = usuario;
    next();
  });
}

export function verificarAdmin(req, res, next) {
  if (req.usuario.tipo_usuario !== "admin") {
    return res
      .status(403)
      .json({ mensagem: "Acesso negado: apenas administradores" });
  }
  next();
}
