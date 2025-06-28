const Usuario = require("../models/Usuario")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const usuarioModel = new Usuario()

class AuthController {
  static async registrar(req, res) {
    try {
      const { nome, email, senha, confirmaSenha, tipo, telefone, linkedin, github } = req.body

      if (!nome || !email || !senha || !confirmaSenha || !tipo) {
        return res.status(400).json({
          erro: "Campos obrigatórios: nome, email, senha, confirmaSenha, tipo",
        })
      }

      if (senha !== confirmaSenha) {
        return res.status(400).json({
          erro: "As senhas não coincidem",
        })
      }

      if (!["candidato", "recrutador"].includes(tipo)) {
        return res.status(400).json({
          erro: "Tipo deve ser: candidato ou recrutador",
        })
      }

      const emailExiste = await usuarioModel.emailExiste(email)
      if (emailExiste) {
        return res.status(400).json({
          erro: "Email já cadastrado",
        })
      }

      const senha_hash = await bcrypt.hash(senha, 10)

      const usuario = await usuarioModel.criar(
        nome,
        email,
        senha_hash,
        tipo,
        telefone || null,
        linkedin || null,
        github || null
      )

      res.status(201).json({
        sucesso: true,
        mensagem: "Usuário criado com sucesso",
        usuario,
      })
    } catch(error) {
      console.error("Erro ao registrar:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }

  static async login(req, res) {
  try {
    const { email, senha } = req.body

    if (!email || !senha) {
      return res.status(400).json({
        erro: "Email e senha são obrigatórios",
      })
    }

    const usuario = await usuarioModel.buscarPorEmail(email)
    if (!usuario) {
      return res.status(401).json({
        erro: "Credenciais inválidas",
      })
    }

    const senhaValida = await usuarioModel.verificarSenha(senha, usuario.senha_hash)
    if (!senhaValida) {
      return res.status(401).json({
        erro: "Credenciais inválidas",
      })
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        tipo: usuario.tipo,
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" },
    )

    delete usuario.senha_hash

    res.json({
      sucesso: true,
      mensagem: "Login realizado com sucesso",
      token,
      usuario,
    })
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    res.status(500).json({
      erro: "Erro interno do servidor",
    })
  }
}

  static async perfil(req, res) {
  try {
    const usuario = await usuarioModel.buscarPorId(req.usuario.id)

    if (!usuario) {
      return res.status(404).json({
        erro: "Usuário não encontrado",
      })
    }

    res.json({
      sucesso: true,
      usuario,
    })
  } catch (error) {
    console.error("Erro ao buscar perfil:", error)
    res.status(500).json({
      erro: "Erro interno do servidor",
    })
  }
}

  static async atualizarPerfil(req, res) {
  try {
    const { nome, telefone, linkedin, github, foto_perfil } = req.body
    const usuarioId = req.usuario.id

    const sucesso = await usuarioModel.atualizar(usuarioId, {
      nome,
      telefone,
      linkedin,
      github,
      foto_perfil
    })

    if (!sucesso) {
      return res.status(400).json({
        erro: "Erro ao atualizar perfil",
      })
    }

    const usuarioAtualizado = await usuarioModel.buscarPorId(usuarioId)

    res.json({
      sucesso: true,
      mensagem: "Perfil atualizado com sucesso",
      usuario: usuarioAtualizado,
    })
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error)
    res.status(500).json({
      erro: "Erro interno do servidor",
    })
  }
}
}

module.exports = AuthController
