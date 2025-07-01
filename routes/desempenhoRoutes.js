const express = require("express")
const DesempenhoController = require("../controllers/DesempenhoController")
const { verificarToken, exigirCandidato } = require("../middleware/authMiddleware")
const router = express.Router()

router.use(verificarToken)

router.post("/criar", DesempenhoController.criar)

router.get("/meus", exigirCandidato, DesempenhoController.listarMeus)

router.get("/:id", DesempenhoController.buscarPorId)

module.exports = router
