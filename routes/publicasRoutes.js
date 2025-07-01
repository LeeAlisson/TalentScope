const express = require("express")
const Usuario = require("../models/Usuario")
const Tecnologia = require("../models/Tecnologia")
const router = express.Router()
const db = require("../config/database")

router.get("/estatisticas", async (req, res) => {
  try {
    const estatisticasUsuarios = await Usuario.estatisticas()

    const [totalSimulacoes] = await db.execute("SELECT COUNT(*) as total FROM simulacao")

    const [mediaNotas] = await db.execute("SELECT AVG(nota) as media FROM desempenho WHERE nota IS NOT NULL")

    const [melhorNota] = await db.execute("SELECT MAX(nota) as melhor FROM desempenho WHERE nota IS NOT NULL")

    const [piorNota] = await db.execute("SELECT MIN(nota) as pior FROM desempenho WHERE nota IS NOT NULL")

    const [porTecnologia] = await db.execute(`
      SELECT t.nome, COUNT(*) as total
      FROM desempenho d
      JOIN simulacoes s ON d.id_simulacao = s.id
      JOIN tecnologia t ON s.id_tecnologia = t.id
      GROUP BY t.nome
    `)

    const [porSetor] = await db.execute(`
      SELECT s.setor, COUNT(*) as total
      FROM desempenho d
      JOIN simulacoes s ON d.id_simulacao = s.id
      GROUP BY s.setor
    `)

    const [porSenioridade] = await db.execute(`
      SELECT s.senioridade, COUNT(*) as total
      FROM desempenho d
      JOIN simulacoes s ON d.id_simulacao = s.id
      GROUP BY s.senioridade
    `)

    const [feedbacksRecentes] = await db.execute(`
      SELECT d.feedback, d.nota, d.id_simulacao
      FROM desempenho d
      ORDER BY d.id DESC
      LIMIT 5
    `)

    res.json({
      sucesso: true,
      estatisticas: {
        ...estatisticasUsuarios,
        total_simulacoes: totalSimulacoes[0].total,
        media_notas: Number.parseFloat(mediaNotas[0].media || 0).toFixed(1),
        melhor_nota: melhorNota[0].melhor,
        pior_nota: piorNota[0].pior,
        por_tecnologia: porTecnologia.reduce((acc, cur) => ({ ...acc, [cur.nome]: cur.total }), {}),
        por_setor: porSetor.reduce((acc, cur) => ({ ...acc, [cur.setor]: cur.total }), {}),
        por_senioridade: porSenioridade.reduce((acc, cur) => ({ ...acc, [cur.senioridade]: cur.total }), {}),
        feedbacks_recentes: feedbacksRecentes,
      },
    })
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar estatísticas" })
  }
})

router.get("/tecnologias", async (req, res) => {
  try {
    const tecnologias = await Tecnologia.listarTodas()
    res.json({ sucesso: true, tecnologias })
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar tecnologias" })
  }
})

router.get("/status", (req, res) => {
  res.json({
    status: "ONLINE",
    timestamp: new Date().toISOString(),
    servico: "TalentScope API",
    versao: "1.0.0",
  })
})

module.exports = router
