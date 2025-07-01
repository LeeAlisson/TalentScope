const Desempenho = require("../models/Desempenho")
const Simulacao = require("../models/Simulacao")

const desempenhoModel = new Desempenho()
const simulacaoModel = new Simulacao()

class DesempenhoController {
  static async criar(req, res) {
    try {
      const { nota, feedback, id_simulacao } = req.body
      const id_usuario = req.usuario.id

      if (nota === undefined || !feedback || !id_simulacao) {
        return res.status(400).json({
          erro: "Campos obrigatórios: nota, feedback, id_simulacao",
        })
      }

      if (nota < 0 || nota > 10) {
        return res.status(400).json({
          erro: "Nota deve estar entre 0 e 10",
        })
      }

      const simulacao = await simulacaoModel.buscarPorId(id_simulacao)
      if (!simulacao) {
        return res.status(404).json({
          erro: "Simulação não encontrada",
        })
      }

      if (simulacao.id_usuario !== id_usuario) {
        return res.status(403).json({
          erro: "Acesso negado",
        })
      }

      const desempenhoExistente = await desempenhoModel.buscarPorSimulacao(id_simulacao)
      if (desempenhoExistente) {
        return res.status(400).json({
          erro: "Desempenho já registrado para esta simulação",
        })
      }

      const desempenhoId = await desempenhoModel.criar({
        nota,
        feedback,
        id_simulacao,
      })

      const desempenho = await desempenhoModel.buscarPorId(desempenhoId)

      res.status(201).json({
        sucesso: true,
        mensagem: "Desempenho registrado com sucesso",
        desempenho,
      })
    } catch (error) {
      console.error("Erro ao criar desempenho:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }

  static async listarMeus(req, res) {
    try {
      const id_usuario = req.usuario.id
      const desempenhos = await desempenhoModel.listarPorUsuario(id_usuario)

      res.json({
        sucesso: true,
        desempenhos,
      })
    } catch (error) {
      console.error("Erro ao listar desempenhos:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }

  static async buscarPorId(req, res) {
    try {
      const { id } = req.params
      const desempenho = await desempenhoModel.buscarPorId(id)

      if (!desempenho) {
        return res.status(404).json({
          erro: "Desempenho não encontrado",
        })
      }

      const simulacao = await simulacaoModel.buscarPorId(desempenho.id_simulacao)
      if (!simulacao || simulacao.id_usuario !== req.usuario.id) {
        return res.status(403).json({
          erro: "Acesso negado",
        })
      }

      res.json({
        sucesso: true,
        desempenho,
      })
    } catch (error) {
      console.error("Erro ao buscar desempenho:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }
}

module.exports = DesempenhoController
