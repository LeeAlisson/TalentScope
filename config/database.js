const mysql = require("mysql2/promise")

class Database {
  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "talent_scope",
      port: process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      charset: "utf8mb4",
    })
  }

  async query(sql, params = []) {
    try {
      const [rows] = await this.pool.execute(sql, params)
      return rows
    } catch (error) {
      console.error("Erro na query:", error)
      throw error
    }
  }

  async getConnection() {
    return await this.pool.getConnection()
  }

  async close() {
    await this.pool.end()
  }

  async testConnection() {
    try {
      const [rows] = await this.pool.execute("SELECT 1 as test")
      console.log("✅ Conexão com MySQL estabelecida com sucesso!")
      return true
    } catch (error) {
      console.error("❌ Erro ao conectar com MySQL:", error.message)
      return false
    }
  }
}

module.exports = new Database()
