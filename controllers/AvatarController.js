const Database = require("../models/Database")
const path = require("path")
const fs = require("fs")

class AvatarController {
  // Listar avatares disponíveis
  static async listarAvatares(req, res) {
    try {
      const avatares = await Database.query(`
        SELECT nome_arquivo, descricao, categoria 
        FROM avatares_disponiveis 
        WHERE ativo = TRUE 
        ORDER BY categoria, descricao
      `)

      res.json({
        sucesso: true,
        avatares,
        total: avatares.length,
      })
    } catch (error) {
      console.error("Erro ao listar avatares:", error)
      res.status(500).json({ erro: "Falha ao listar avatares" })
    }
  }

  // Atualizar foto de perfil do usuário
  static async atualizarFotoPerfil(req, res) {
    try {
      const { foto_perfil } = req.body
      const userId = req.session?.user?.id || req.usuario?.id

      if (!userId) {
        return res.status(401).json({ erro: "Usuário não autenticado" })
      }

      // Verificar se o avatar existe na biblioteca
      const avatarExiste = await Database.query(
        "SELECT id FROM avatares_disponiveis WHERE nome_arquivo = ? AND ativo = TRUE",
        [foto_perfil],
      )

      if (avatarExiste.length === 0) {
        return res.status(400).json({ erro: "Avatar não encontrado na biblioteca" })
      }

      // Atualizar foto do usuário
      await Database.query("UPDATE usuarios SET foto_perfil = ?, atualizado_em = CURRENT_TIMESTAMP WHERE id = ?", [
        foto_perfil,
        userId,
      ])

      res.json({
        sucesso: true,
        mensagem: "Foto de perfil atualizada com sucesso",
        foto_perfil,
      })
    } catch (error) {
      console.error("Erro ao atualizar foto de perfil:", error)
      res.status(500).json({ erro: "Falha ao atualizar foto de perfil" })
    }
  }

  // Servir imagem do avatar
  static async servirAvatar(req, res) {
    try {
      const { nomeArquivo } = req.params
      const caminhoImagem = path.join(__dirname, "../public/avatares", nomeArquivo)

      // Verificar se arquivo existe
      if (!fs.existsSync(caminhoImagem)) {
        // Retornar avatar padrão se não encontrar
        const avatarPadrao = path.join(__dirname, "../public/avatares/default-avatar.png")
        return res.sendFile(avatarPadrao)
      }

      res.sendFile(caminhoImagem)
    } catch (error) {
      console.error("Erro ao servir avatar:", error)
      res.status(404).json({ erro: "Avatar não encontrado" })
    }
  }

  // Upload de novo avatar (para administradores)
  static async uploadAvatar(req, res) {
    try {
      // Este método seria implementado com multer para upload de arquivos
      // Por enquanto, apenas um placeholder
      res.status(501).json({
        erro: "Funcionalidade de upload ainda não implementada",
        mensagem: "Use a biblioteca de avatares disponível",
      })
    } catch (error) {
      console.error("Erro no upload de avatar:", error)
      res.status(500).json({ erro: "Falha no upload do avatar" })
    }
  }
}

module.exports = AvatarController
