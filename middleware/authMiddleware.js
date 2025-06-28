const jwt = require("jsonwebtoken")
const Usuario = require("../models/Usuario")

const usuarioModel = new Usuario()

const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(" ")[1]

    if (!token) {
      return res.status(401).json({ erro: "Token de acesso requerido" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const usuario = await usuarioModel.buscarPorId(decoded.id)

    if (!usuario) {
      return res.status(401).json({ erro: "Usuário não encontrado" })
    }

    req.usuario = usuario
    next()
  } catch (error) {
    return res.status(403).json({ erro: "Token inválido" })
  }
}

const exigirCandidato = (req, res, next) => {
  if (req.usuario.tipo !== "candidato") {
    return res.status(403).json({ erro: "Acesso restrito a candidatos" })
  }
  next()
}

const exigirEntrevistador = (req, res, next) => {
  if (req.usuario.tipo !== "entrevistador") {
    return res.status(403).json({ erro: "Acesso restrito a entrevistadores" })
  }
  next()
}

module.exports = {
  verificarToken,
  exigirCandidato,
  exigirEntrevistador,
}
