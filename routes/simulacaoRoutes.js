const express = require("express")
const SimulacaoController = require("../controllers/SimulacaoController")
const { verificarToken, exigirCandidato } = require("../middleware/authMiddleware")
const router = express.Router()

router.use(verificarToken)

router.post("/criar", exigirCandidato, SimulacaoController.criar)

router.get("/listar", SimulacaoController.listar)

router.get("/:id", SimulacaoController.buscarPorId)

router.post("/:id/responder", exigirCandidato, SimulacaoController.enviarResposta)

router.delete("/:id/deletar", exigirCandidato, SimulacaoController.deletar)

module.exports = router
