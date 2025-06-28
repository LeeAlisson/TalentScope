// Middleware para tratamento de erros
const tratarErros = (err, req, res, next) => {
  console.error("Erro ocorrido:", {
    mensagem: err.message,
    stack: err.stack,
    url: req.originalUrl,
    metodo: req.method,
    usuario: req.usuario?.id || "anonimo",
    timestamp: new Date().toISOString(),
  })

  // Erro de validação
  if (err.name === "ValidationError") {
    return res.status(400).json({
      erro: "Dados inválidos",
      detalhes: err.details || err.message,
    })
  }

  // Erros de JWT
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      erro: "Token inválido",
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      erro: "Token expirado",
    })
  }

  // Erros de banco de dados MySQL
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      erro: "Recurso já existe",
    })
  }

  if (err.code === "ER_NO_REFERENCED_ROW_2") {
    return res.status(400).json({
      erro: "Referência inválida",
    })
  }

  if (err.code === "ECONNREFUSED") {
    return res.status(500).json({
      erro: "Erro de conexão com o banco de dados",
    })
  }

  // Erro customizado com status
  if (err.status || err.statusCode) {
    return res.status(err.status || err.statusCode).json({
      erro: err.message || "Erro na aplicação",
    })
  }

  // Erro genérico
  res.status(500).json({
    erro: process.env.NODE_ENV === "production" ? "Erro interno do servidor" : err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  })
}

// Handler para rotas não encontradas
const rotaNaoEncontrada = (req, res) => {
  res.status(404).json({
    erro: "Rota não encontrada",
    caminho: req.originalUrl,
    metodo: req.method,
  })
}

module.exports = {
  tratarErros,
  rotaNaoEncontrada,
}
