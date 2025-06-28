const Simulacao = require("../models/Simulacao")
const Tecnologia = require("../models/Tecnologia")
const OllamaService = require("../services/OllamaService")

const simulacaoModel = new Simulacao()
const tecnologiaModel = new Tecnologia()

class SimulacaoController {
  static async criar(req, res) {
    try {
      const { setor, senioridade, tipo, tecnologia } = req.body
      const id_usuario = req.usuario.id

      if (!setor || !senioridade || !tipo || !tecnologia) {
        return res.status(400).json({
          erro: "Campos obrigatórios: setor, senioridade, tipo, tecnologia",
        })
      }

      if (!["pergunta", "codigo"].includes(tipo)) {
        return res.status(400).json({
          erro: "Tipo deve ser: pergunta ou codigo",
        })
      }

      const tech = await tecnologiaModel.buscarOuCriar(tecnologia)
      const id_tecnologia = tech.id

      const pergunta = await OllamaService.gerarPergunta({
        setor,
        senioridade,
        tipo,
        tecnologias: tecnologia,
      })

      const simulacao = await simulacaoModel.criar(
        setor,
        senioridade,
        pergunta,
        tipo,
        id_usuario,
        id_tecnologia
      )

      res.status(201).json({
        sucesso: true,
        mensagem: "Simulação criada com sucesso",
        simulacao,
      })
    } catch (error) {
      console.error("Erro ao criar simulação:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }

  static async listar(req, res) {
    try {
      let simulacoes

      if (req.usuario.tipo === "candidato") {
        simulacoes = await simulacaoModel.listarPorUsuario(req.usuario.id)
      } else if (req.usuario.tipo === "recrutador") {
        simulacoes = await simulacaoModel.listarTodas()
      }

      res.json({
        sucesso: true,
        simulacoes,
      })
    } catch (error) {
      console.error("Erro ao listar simulações:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }

  static async buscarPorId(req, res) {
    try {
      const { id } = req.params
      const simulacao = await simulacaoModel.buscarPorId(id)

      if (!simulacao) {
        return res.status(404).json({
          erro: "Simulação não encontrada",
        })
      }

      if (req.usuario.tipo === "candidato" && simulacao.id_usuario !== req.usuario.id) {
        return res.status(403).json({
          erro: "Acesso negado",
        })
      }

      res.json({
        sucesso: true,
        simulacao,
      })
    } catch (error) {
      console.error("Erro ao buscar simulação:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }

  static async enviarResposta(req, res) {
    try {
      const { id } = req.params
      const { resposta_usuario } = req.body
      const id_usuario = req.usuario.id

      if (!resposta_usuario) {
        return res.status(400).json({
          erro: "Resposta é obrigatória",
        })
      }

      const simulacao = await simulacaoModel.buscarPorId(id)
      if (!simulacao) {
        return res.status(404).json({
          erro: "Simulação não encontrada",
        })
      }

      if (simulacao.id_usuario !== id_usuario) {
        return res.status(403).json({
          erro: "Você só pode responder suas próprias simulações",
        })
      }

      if (simulacao.resposta_usuario) {
        return res.status(400).json({
          erro: "Esta simulação já foi respondida",
        })
      }

      await simulacaoModel.atualizarResposta(id, resposta_usuario)

      const tecnologiasNomes = simulacao.tecnologias ? simulacao.tecnologias.map((t) => t.nome) : []

      const avaliacao = await OllamaService.avaliarResposta({
        pergunta: simulacao.pergunta,
        resposta: resposta_usuario,
        setor: simulacao.setor,
        senioridade: simulacao.senioridade,
        tecnologias: tecnologiasNomes,
      })

      res.json({
        sucesso: true,
        mensagem: "Resposta enviada com sucesso",
        avaliacao,
      })
    } catch (error) {
      console.error("Erro ao enviar resposta:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }

  static async deletar(req, res) {
    try {
      const { id } = req.params
      const id_usuario = req.usuario.id

      const simulacao = await simulacaoModel.buscarPorId(id)
      if (!simulacao) {
        return res.status(404).json({
          erro: "Simulação não encontrada",
        })
      }

      if (simulacao.id_usuario !== id_usuario) {
        return res.status(403).json({
          erro: "Você só pode deletar suas próprias simulações",
        })
      }

      const sucesso = await simulacaoModel.deletar(id)
      if (!sucesso) {
        return res.status(400).json({
          erro: "Erro ao deletar simulação",
        })
      }

      res.json({
        sucesso: true,
        mensagem: "Simulação deletada com sucesso",
      })
    } catch (error) {
      console.error("Erro ao deletar simulação:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }
}

module.exports = SimulacaoController
