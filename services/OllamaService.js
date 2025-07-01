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

    const prompt = `Você é um avaliador técnico. Analise a resposta do candidato para uma vaga de ${setor} nível ${senioridade}.

PERGUNTA:
${pergunta}

RESPOSTA DO CANDIDATO:
${resposta}

Tecnologias envolvidas: ${tecnologiasStr}

Compare a resposta do candidato com a pergunta e avalie:
- Pontos fortes
- Áreas para melhoria
- Precisão técnica (se está correto tecnicamente)
- Comunicação (clareza e objetividade)
- Completude (se respondeu tudo que foi pedido)

Com base nessa análise, gere OBRIGATORIAMENTE:
- Um feedback detalhado, construtivo e específico sobre a resposta.
- Uma nota de 0 a 10 (nunca deixe em branco, nunca coloque 0 a menos que a resposta seja totalmente errada ou vazia).

Agora, devolva **apenas** UM dos formatos abaixo (não escreva nada além disso):

1. JSON válido:
{
  "nota": <número de 0 a 10, obrigatório, nunca deixe em branco>,
  "feedback": "<feedback detalhado e construtivo, obrigatório>"
}

OU

2. Usando tags:
<nota>8.5</nota>
<feedback>Seu feedback detalhado aqui.</feedback>

Não escreva nada além do JSON ou das tags. Não adicione explicações, comentários ou texto fora desses formatos.
`

    const resposta_ollama = await this.chamarOllama("llama3:latest", prompt)
    return this.parseAvaliacao(resposta_ollama)
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

  static parseAvaliacao(resposta) {
    try {
      const obj = JSON.parse(resposta)
      if (typeof obj.nota !== "undefined" && typeof obj.feedback !== "undefined") {
        return { nota: obj.nota, feedback: obj.feedback }
      }
    } catch (e) {}

    const notaTag = resposta.match(/<nota>([0-9]+(\.[0-9]+)?)<\/nota>/i)
    const feedbackTag = resposta.match(/<feedback>([\s\S]*?)<\/feedback>/i)
    if (notaTag && feedbackTag) {
      return {
        nota: parseFloat(notaTag[1]),
        feedback: feedbackTag[1].trim()
      }
    }

    const notaMatch = resposta.match(/nota[:\s]*([0-9]+(\.[0-9]+)?)/i)
    const feedbackMatch = resposta.match(/feedback[:\s]*([\s\S]*)/i)

    return {
      nota: notaMatch ? parseFloat(notaMatch[1]) : 0,
      feedback: feedbackMatch ? feedbackMatch[1].trim() : resposta
    }
  }
}

module.exports = OllamaService
