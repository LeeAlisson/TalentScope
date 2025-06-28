const Tecnologia = require("../models/Tecnologia")

const tecnologiaModel = new Tecnologia()

class TecnologiaController {
  static async listarTodas(req, res) {
    try {
      const tecnologias = await tecnologiaModel.listar()

      res.json({
        sucesso: true,
        tecnologias,
      })
    } catch (error) {
      console.error("Erro ao listar tecnologias:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }

  static async criarOuBuscar(req, res) {
    try {
      const { nome } = req.body

      if (!nome || nome.trim() === "") {
        return res.status(400).json({
          erro: "Nome da tecnologia é obrigatório",
        })
      }

      const tecnologia = await tecnologiaModel.buscarOuCriar(nome)

      res.json({
        sucesso: true,
        tecnologia,
      })
    } catch (error) {
      console.error("Erro ao criar/buscar tecnologia:", error)
      res.status(500).json({
        erro: "Erro interno do servidor",
      })
    }
  }
}

module.exports = TecnologiaController
