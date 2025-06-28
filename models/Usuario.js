const Database = require("../config/database")
const bcrypt = require("bcryptjs")

class Usuario {
  constructor() {
    this.db = Database
  }

  async criar(nome, email, senhaHash, tipo, telefone = null, linkedin = null, github = null) {
    const sql = `
      INSERT INTO usuarios (nome, email, senha_hash, tipo, telefone, linkedin, github)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const result = await this.db.query(sql, [nome, email, senhaHash, tipo, telefone, linkedin, github])
    return await this.buscarPorId(result.insertId)
  }

  async emailExiste(email) {
    const sql = "SELECT * FROM usuarios WHERE email = ?"
    const result = await this.db.query(sql, [email])
    return result.length > 0
  }

  async verificarSenha(senha, senha_hash) {
    return await bcrypt.compare(senha, senha_hash)
  }

  async buscarPorEmail(email) {
    const sql = "SELECT * FROM usuarios WHERE email = ?"
    const result = await this.db.query(sql, [email])
    return result[0] || null
  }

  async buscarPorId(id) {
    const sql = `
      SELECT id, nome, email, tipo, telefone, linkedin, github, foto_perfil, 
             criado_em, atualizado_em 
      FROM usuarios WHERE id = ?
    `
    const result = await this.db.query(sql, [id])
    return result[0] || null
  }

  async atualizar(id, dados) {
    dados.atualizado_em = new Date();
    const campos = Object.keys(dados)
      .map((campo) => `${campo} = ?`)
      .join(", ")
    const valores = Object.values(dados)

    const sql = `UPDATE usuarios SET ${campos} WHERE id = ?`
    await this.db.query(sql, [...valores, id])

    return await this.buscarPorId(id)
  }

  async listarCandidatos(filtros = {}) {
    let sql = `
      SELECT DISTINCT u.id, u.nome, u.email, u.linkedin, u.github,
             AVG(d.nota) as nota_media,
             COUNT(s.id) as total_simulacoes
      FROM usuarios u
      JOIN simulacoes s ON u.id = s.id_usuario
      LEFT JOIN desempenho d ON s.id = d.id_simulacao
      WHERE u.tipo = 'candidato'
    `

    const params = []

    if (filtros.setor) {
      sql += " AND s.setor = ?"
      params.push(filtros.setor)
    }

    if (filtros.senioridade) {
      sql += " AND s.senioridade = ?"
      params.push(filtros.senioridade)
    }

    if (filtros.tecnologia) {
      sql += " AND s.id_tecnologia = (SELECT id FROM tecnologias WHERE nome = ?)"
      params.push(filtros.tecnologia)
    }

    sql += `
      GROUP BY u.id, u.nome, u.email, u.linkedin, u.github
      HAVING COUNT(d.id) > 0
    `

    if (filtros.notaMinima) {
      sql += " AND AVG(d.nota) >= ?"
      params.push(filtros.notaMinima)
    }

    sql += " ORDER BY nota_media DESC, total_simulacoes DESC"

    return await this.db.query(sql, params)
  }
}

module.exports = Usuario