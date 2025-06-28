const express = require("express")
const TecnologiaController = require("../controllers/TecnologiaController")
const { verificarToken } = require("../middleware/authMiddleware")
const router = express.Router()

router.get("/listar", TecnologiaController.listarTodas)

router.post("/criar-ou-buscar", verificarToken, TecnologiaController.criarOuBuscar)

module.exports = router
