const express = require("express")
const AuthController = require("../controllers/AuthController")
const { verificarToken } = require("../middleware/authMiddleware")
const router = express.Router()

router.post("/registrar", AuthController.registrar)

router.post("/entrar", AuthController.login)

router.get("/perfil", verificarToken, AuthController.perfil)

router.put("/perfil/atualizar", verificarToken, AuthController.atualizarPerfil)

router.get("/verificar-token", verificarToken, (req, res) => {
  res.json({
    sucesso: true,
    usuario: req.usuario,
  })
})

module.exports = router
