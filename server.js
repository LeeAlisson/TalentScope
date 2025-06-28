const express = require("express")
const cors = require("cors")
const Database = require("./config/database")
require("dotenv").config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/simulacoes", require("./routes/simulacaoRoutes"))
app.use("/api/desempenho", require("./routes/desempenhoRoutes"))
app.use("/api/tecnologias", require("./routes/tecnologiaRoutes"))
app.use("/api", require("./routes/publicasRoutes"))

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    erro: "Erro interno do servidor",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  })
})

app.use("*", (req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
  })
})

app.listen(PORT, async () => {
  console.log(`🚀 TalentScope API rodando na porta ${PORT}`)
  console.log(`📊 Ambiente: ${process.env.NODE_ENV}`)
  console.log(`🗄️  Banco: ${process.env.DB_NAME}`)

  await Database.testConnection()
})

process.on("SIGTERM", async () => {
  console.log("🔄 Encerrando servidor...")
  await Database.close()
  process.exit(0)
})
