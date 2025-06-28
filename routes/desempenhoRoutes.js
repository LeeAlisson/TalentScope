const express = require("express")
const DesempenhoController = require("../controllers/DesempenhoController")
const { verificarToken, exigirCandidato } = require("../middleware/authMiddleware")
const router = express.Router()

// Middleware global - todas as rotas precisam de autenticação
router.use(verificarToken)

// Criar registro de desempenho
router.post("/criar", DesempenhoController.criar)

// Listar meus desempenhos - apenas candidatos
router.get("/meus", exigirCandidato, DesempenhoController.listarMeus)

// Buscar desempenho por ID
router.get("/:id", DesempenhoController.buscarPorId)

// Estatísticas de desempenho - apenas candidatos
router.get("/estatisticas/usuario", exigirCandidato, DesempenhoController.estatisticas)

// Atualizar desempenho
router.put("/:id/atualizar", DesempenhoController.atualizar)

module.exports = router
