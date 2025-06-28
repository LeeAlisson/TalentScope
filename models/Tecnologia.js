const Database = require("../config/database")

class Tecnologia {
  constructor() {
    this.db = Database
  }

  async criar(nome) {
    const sql = "INSERT INTO tecnologias (nome) VALUES (?)"
    const result = await this.db.query(sql, [nome])
    return await this.buscarPorId(result.insertId)
  }

  async buscarPorId(id) {
    const sql = "SELECT * FROM tecnologias WHERE id = ?"
    const result = await this.db.query(sql, [id])
    return result[0] || null
  }

  async buscarPorNome(nome) {
    const sql = "SELECT * FROM tecnologias WHERE nome = ?"
    const result = await this.db.query(sql, [nome])
    return result[0] || null
  }

  async listar() {
    const sql = "SELECT * FROM tecnologias ORDER BY nome"
    return await this.db.query(sql)
  }

  async buscarOuCriar(nome) {
    let tecnologia = await this.buscarPorNome(nome)
    if (tecnologia) {
      return tecnologia
    }

    return await this.criar(nome)
  }
}

module.exports = Tecnologia