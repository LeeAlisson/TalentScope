class OllamaService {
  static async gerarPergunta(params) {
    const { setor, senioridade, tipo, tecnologias } = params

    const tecnologiasStr = Array.isArray(tecnologias) ? tecnologias.join(", ") : tecnologias

    let prompt = ""

    if (tipo === "pergunta") {
      prompt = `Gere uma pergunta técnica de entrevista para uma vaga de ${setor} nível ${senioridade}.

Tecnologias para focar: ${tecnologiasStr}

Requisitos:
- Dificuldade deve ser ajustada para nível ${senioridade}
- Formule uma pergunta de forma clara e objetiva, sem mostrar ao candidato seus pensamentos para gerar a pergunta, sem mostrar requisitos, e que seja somente uma pergunta

Gere da seguinte forma:
- Titulo;
- Pergunta
- Exemplo (sem etapas e conclusão, quero exemplos simples)`

    } else if (tipo === "codigo") {
      prompt = `Crie um desafio de programação para uma vaga de ${setor} nível ${senioridade}.

Tecnologias para usar: ${tecnologiasStr}

Requisitos:
- O desafio deve ser resolvido em um único arquivo de código (editor de texto)
- Dificuldade apropriada para nível ${senioridade}
- Formule o desafio de forma clara e objetiva, NÃO mostre ao candidato seus pensamentos para gerar o desafio, tudo deve ser limpo, somente o que o candidato precisa saber (sem requisitos, sem dificuldades)
- Gere um desafio que possa ser resolvido em um tempo razoável (10-20 minutos)
- O ideal é que você foque em gerar algoritmos, funções, classes, desafios rápidos, mas que sejam desafiadores para o candidato baseado em sua senioridade (${senioridade})

Gere:
- Título do desafio (ideal ser um título 'unico' pois o usuario vai ter mais de um chat com você)
- Descrição do desafio
- Exemplos para auxilio (e restrição se houver)
`
    }

    return await this.chamarOllama("codellama:latest", prompt)
  }

  static async avaliarResposta(params) {
    const { pergunta, resposta, setor, senioridade, tecnologias } = params

    const tecnologiasStr = Array.isArray(tecnologias) ? tecnologias.join(", ") : (tecnologias || "Não especificado");

    const prompt = `Analise esta resposta para uma vaga de ${setor} nível ${senioridade}:

PERGUNTA:
${pergunta}

RESPOSTA DO CANDIDATO:
${resposta}

Tecnologias envolvidas: ${tecnologiasStr}

Forneça uma análise abrangente com:

1. PONTOS FORTES: O que o candidato fez bem
2. ÁREAS PARA MELHORIA: Pontos específicos para trabalhar
3. PRECISÃO TÉCNICA: Quão correto está o conteúdo técnico
4. COMUNICAÇÃO: Quão bem explicaram seu raciocínio
5. COMPLETUDE: Abordaram todas as partes da pergunta

Então forneça:
- NOTA: Avalie de 0-10 (seja realista e justo)
- TAXA DE COMPATIBILIDADE: Porcentagem (0-100%) indicando prontidão para o trabalho
- FEEDBACK ESPECÍFICO: Conselhos práticos para melhoria

Seja construtivo, específico e útil. Foque no crescimento e aprendizado.

Formate como JSON:
{
  "nota": 7.5,
  "feedback": "feedback detalhado aqui",
}`

    const resposta_ollama = await this.chamarOllama("codellama:latest", prompt)

    try {
      return JSON.parse(resposta_ollama)
    } catch (error) {
      console.error("Falha ao analisar resposta do Ollama como JSON:", error)
      return {
        nota: 0,
        feedback: resposta_ollama
      }
    }
  }

  static async chamarOllama(modelo, prompt) {
    try {
      const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelo,
          prompt: prompt,
          stream: false,
          options: {
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 2000,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro da API Ollama: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.response) {
        throw new Error("Nenhuma resposta do Ollama")
      }

      return data.response
    } catch (error) {
      console.error("Erro do serviço Ollama:", error)

      if (error.message.includes("ECONNREFUSED")) {
        console.warn("Ollama não está rodando, usando resposta de fallback")
        return this.obterRespostaFallback(prompt)
      }

      throw new Error("Falha ao comunicar com o serviço Ollama")
    }
  }

  static async verificarSaudeOllama() {
    try {
      const response = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`)
      return response.ok
    } catch (error) {
      return false
    }
  }
}

module.exports = OllamaService
