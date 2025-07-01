const Database = require("../config/database")

class Desempenho {
  constructor() {
    this.db = Database
  }

  async criar(nota, feedback, idSimulacao) {
    const sql = `
      INSERT INTO desempenho (nota, feedback, id_simulacao)
      VALUES (?, ?, ?)
    `

    const result = await this.db.query(sql, [nota, feedback, idSimulacao])
    return await this.buscarPorId(result.insertId)
  }

  async buscarPorId(id) {
    const sql = "SELECT * FROM desempenho WHERE id = ?"
    const result = await this.db.query(sql, [id])
    return result[0] || null
  }

  async buscarPorSimulacao(idSimulacao) {
    const sql = "SELECT * FROM desempenho WHERE id_simulacao = ?"
    const result = await this.db.query(sql, [idSimulacao])
    return result[0] || null
  }

  async listarPorUsuario(id_usuario) {
    return await this.db.query(
      `SELECT d.* FROM desempenho d
       JOIN simulacoes s ON d.id_simulacao = s.id
       WHERE s.id_usuario = ?`,
      [id_usuario]
    );
  }
}

module.exports = Desempenho