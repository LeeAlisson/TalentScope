const express = require("express")
const Usuario = require("../models/Usuario")
const Simulacao = require("../models/Simulacao")
const Tecnologia = require("../models/Tecnologia")
const router = express.Router()

// Estatísticas públicas da plataforma
router.get("/estatisticas", async (req, res) => {
  try {
    const estatisticasUsuarios = await Usuario.estatisticas()

    const [totalSimulacoes] = await require("../config/database").execute("SELECT COUNT(*) as total FROM simulacoes")

    const [mediaNotas] = await require("../config/database").execute(
      "SELECT AVG(nota) as media FROM desempenho WHERE nota IS NOT NULL",
    )

    res.json({
      sucesso: true,
      estatisticas: {
        ...estatisticasUsuarios,
        total_simulacoes: totalSimulacoes[0].total,
        media_notas: Number.parseFloat(mediaNotas[0].media || 0).toFixed(1),
      },
    })
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar estatísticas" })
  }
})

// Listar tecnologias disponíveis
router.get("/tecnologias", async (req, res) => {
  try {
    const tecnologias = await Tecnologia.listarTodas()
    res.json({ sucesso: true, tecnologias })
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar tecnologias" })
  }
})

// Health check da API
router.get("/status", (req, res) => {
  res.json({
    status: "ONLINE",
    timestamp: new Date().toISOString(),
    servico: "TalentScope API",
    versao: "1.0.0",
  })
})

module.exports = router
