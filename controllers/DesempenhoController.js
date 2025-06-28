const Desempenho = require("../models/Desempenho")
const Simulacao = require("../models/Simulacao")

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

      const simulacao = await Simulacao.buscarPorId(id_simulacao)
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

      const desempenhoExistente = await Desempenho.buscarPorSimulacao(id_simulacao)
      if (desempenhoExistente) {
        return res.status(400).json({
          erro: "Desempenho já registrado para esta simulação",
        })
      }

      const desempenhoId = await Desempenho.criar({
        nota,
        feedback,
        id_usuario,
        id_simulacao,
      })

      const desempenho = await Desempenho.buscarPorId(desempenhoId)

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
      const desempenhos = await Desempenho.listarPorUsuario(id_usuario)

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
      const desempenho = await Desempenho.buscarPorId(id)

      if (!desempenho) {
        return res.status(404).json({
          erro: "Desempenho não encontrado",
        })
      }

      if (desempenho.id_usuario !== req.usuario.id) {
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

  static async estatisticas(req, res) {
    try {
      const id_usuario = req.usuario.id
      const stats = await Desempenho.estatisticasUsuario(id_usuario)

      res.json({
        sucesso: true,
        estatisticas: stats,
      })
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }

  static async atualizar(req, res) {
    try {
      const { id } = req.params
      const { nota, feedback } = req.body

      const desempenho = await Desempenho.buscarPorId(id)
      if (!desempenho) {
        return res.status(404).json({
          erro: "Desempenho não encontrado",
        })
      }

      if (desempenho.id_usuario !== req.usuario.id) {
        return res.status(403).json({
          erro: "Acesso negado",
        })
      }

      if (nota !== undefined && (nota < 0 || nota > 10)) {
        return res.status(400).json({
          erro: "Nota deve estar entre 0 e 10",
        })
      }

      const sucesso = await Desempenho.atualizar(id, { nota, feedback })
      if (!sucesso) {
        return res.status(400).json({
          erro: "Erro ao atualizar desempenho",
        })
      }

      const desempenhoAtualizado = await Desempenho.buscarPorId(id)

      res.json({
        sucesso: true,
        mensagem: "Desempenho atualizado com sucesso",
        desempenho: desempenhoAtualizado,
      })
    } catch (error) {
      console.error("Erro ao atualizar desempenho:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }
}

module.exports = DesempenhoController
