const validarRegistro = (req, res, next) => {
  const { nome, email, senha, tipo } = req.body

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" })
  }

  if (!["candidato", "entrevistador"].includes(tipo)) {
    return res.status(400).json({ erro: "Tipo deve ser candidato ou entrevistador" })
  }

  if (senha.length < 6) {
    return res.status(400).json({ erro: "Senha deve ter pelo menos 6 caracteres" })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ erro: "Email inválido" })
  }

  next()
}

const validarDadosSimulacao = (req, res, next) => {
  const { setor, senioridade, pergunta, tipo } = req.body

  if (!setor || !senioridade || !pergunta || !tipo) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" })
  }

  if (!["pergunta", "codigo"].includes(tipo)) {
    return res.status(400).json({ erro: "Tipo deve ser pergunta ou codigo" })
  }

  next()
}

const validarResposta = (req, res, next) => {
  const { resposta_usuario } = req.body

  if (!resposta_usuario || resposta_usuario.trim().length === 0) {
    return res.status(400).json({ erro: "Resposta é obrigatória" })
  }

  next()
}

const validarDesempenho = (req, res, next) => {
  const { nota, feedback, id_simulacao } = req.body

  if (nota === undefined || !feedback || !id_simulacao) {
    return res.status(400).json({ erro: "Todos os campos são obrigatórios" })
  }

  if (nota < 0 || nota > 10) {
    return res.status(400).json({ erro: "Nota deve estar entre 0 e 10" })
  }

  next()
}

module.exports = {
  validarRegistro,
  validarDadosSimulacao,
  validarResposta,
  validarDesempenho,
}
