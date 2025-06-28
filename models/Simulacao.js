const Database = require("../config/database")

class Simulacao {
  constructor() {
    this.db = Database
  }

  async criar(setor, senioridade, pergunta, tipo, idUsuario, idTecnologia) {
    const sql = `
      INSERT INTO simulacoes (setor, senioridade, pergunta, tipo, id_usuario, id_tecnologia)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    const result = await this.db.query(sql, [setor, senioridade, pergunta, tipo, idUsuario, idTecnologia])
    return await this.buscarPorId(result.insertId)
  }

  async buscarPorId(id) {
    const sql = `
      SELECT s.*, t.nome as tecnologia_nome, u.nome as usuario_nome
      FROM simulacoes s
      JOIN tecnologias t ON s.id_tecnologia = t.id
      JOIN usuarios u ON s.id_usuario = u.id
      WHERE s.id = ?
    `

    const result = await this.db.query(sql, [id])
    return result[0] || null
  }

  async buscarPorUsuario(idUsuario) {
    const sql = `
      SELECT s.*, t.nome as tecnologia_nome, u.nome as usuario_nome
      FROM simulacoes s
      JOIN tecnologias t ON s.id_tecnologia = t.id
      JOIN usuarios u ON s.id_usuario = u.id
      WHERE s.id_usuario = ?
      ORDER BY s.criado_em DESC
    `

    return await this.db.query(sql, [idUsuario])
  }

  async atualizarResposta(id, respostaUsuario) {
    const sql = "UPDATE simulacoes SET resposta_usuario = ? WHERE id = ?"
    await this.db.query(sql, [respostaUsuario, id])
    return await this.buscarPorId(id)
  }

  async obterEstatisticas(idUsuario) {
    const sql = `
      SELECT 
        COUNT(s.id) as total_simulacoes,
        COUNT(d.id) as simulacoes_avaliadas,
        COALESCE(AVG(d.nota), 0) as nota_media,
        COUNT(CASE WHEN d.nota >= 7 THEN 1 END) as aprovacoes
      FROM simulacoes s
      LEFT JOIN desempenho d ON s.id = d.id_simulacao
      WHERE s.id_usuario = ?
    `

    const result = await this.db.query(sql, [idUsuario])
    return result[0]
  }
}

module.exports = Simulacao