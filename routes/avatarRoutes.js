const express = require("express")
const AvatarController = require("../controllers/AvatarController")
const { verificarToken } = require("../middleware/authMiddleware")
const router = express.Router()

// Listar avatares disponíveis (público)
router.get("/biblioteca", AvatarController.listarAvatares)

// Servir imagem do avatar (público)
router.get("/imagem/:nomeArquivo", AvatarController.servirAvatar)

// Atualizar foto de perfil (protegido)
router.put("/atualizar-perfil", verificarToken, AvatarController.atualizarFotoPerfil)

// Upload de novo avatar (admin apenas)
router.post("/upload", verificarToken, AvatarController.uploadAvatar)

module.exports = router
