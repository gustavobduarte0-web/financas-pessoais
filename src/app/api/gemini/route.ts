import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextRequest, NextResponse } from 'next/server'

const CATEGORY_IDS = [
  'alimentacao', 'supermercado', 'transporte', 'combustivel',
  'saude', 'vestuario', 'moradia', 'hospedagem', 'lazer',
  'assinaturas', 'investimentos', 'receita', 'transferencias', 'outros',
] as const

type CategoryId = (typeof CATEGORY_IDS)[number]

function getClient() {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('GEMINI_API_KEY não configurada')
  return new GoogleGenerativeAI(key)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    if (action === 'classify-batch') {
      return handleClassifyBatch(body.descriptions as string[])
    }
    if (action === 'chat') {
      return handleChat(body.messages, body.transactions, body.summary)
    }

    return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
  } catch (err) {
    console.error('Gemini API error:', err)
    const message = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

async function handleClassifyBatch(descriptions: string[]) {
  if (!descriptions || descriptions.length === 0) {
    return NextResponse.json({ categories: [] })
  }

  const genAI = getClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const list = descriptions.map((d, i) => `${i + 1}. "${d}"`).join('\n')

  const prompt = `Você é um classificador de transações bancárias brasileiras.
Classifique cada transação abaixo em UMA das categorias disponíveis.
Responda APENAS com um JSON array de strings, na mesma ordem das transações.
Exemplo: ["alimentacao", "supermercado", "transporte"]

Categorias disponíveis:
- alimentacao: restaurantes, lanchonetes, fast food, delivery (iFood, Rappi), bares, cafés
- supermercado: supermercados, mercados, atacados, hortifruti
- transporte: uber, táxi, ônibus, metrô, estacionamento, pedágio, passagens
- combustivel: postos de gasolina, etanol, GNV
- saude: farmácias, médicos, hospitais, planos de saúde, dentistas, academias
- vestuario: lojas de roupa, calçados, moda, acessórios
- moradia: aluguel, condomínio, energia elétrica, internet, água, gás, materiais de construção
- hospedagem: hotéis, pousadas, airbnb, resorts
- lazer: cinema, teatro, shows, parques, jogos, passeios
- assinaturas: streaming, apps, serviços digitais mensais (Netflix, Spotify, etc.)
- investimentos: aplicações financeiras, resgates, CDB, fundos
- receita: salário, rendimentos recebidos, transferências recebidas
- transferencias: transferências enviadas, PIX enviado para pessoa física
- outros: não se encaixa em nenhuma categoria acima

Transações:
${list}

Responda apenas com o JSON array:`

  const result = await model.generateContent(prompt)
  const text = result.response.text().trim()

  // Extract JSON array from response
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) {
    // fallback: all 'outros'
    return NextResponse.json({ categories: descriptions.map(() => 'outros') })
  }

  let parsed: unknown[]
  try {
    parsed = JSON.parse(match[0])
  } catch {
    return NextResponse.json({ categories: descriptions.map(() => 'outros') })
  }

  const categories: CategoryId[] = parsed.map((c) =>
    typeof c === 'string' && CATEGORY_IDS.includes(c as CategoryId)
      ? (c as CategoryId)
      : 'outros'
  )

  // Pad if response has fewer items than input
  while (categories.length < descriptions.length) {
    categories.push('outros')
  }

  return NextResponse.json({ categories })
}

async function handleChat(
  messages: Array<{ role: 'user' | 'model'; content: string }>,
  transactions: unknown[],
  summary: unknown,
) {
  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: 'Sem mensagens' }, { status: 400 })
  }

  const genAI = getClient()
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const systemContext = `Você é um assistente financeiro pessoal inteligente e amigável para um brasileiro.
Você tem acesso completo aos dados financeiros do usuário importados do banco Bradesco.
Ajude-o a entender seus gastos, identificar padrões, encontrar oportunidades de economia e responder perguntas financeiras.
Responda sempre em português brasileiro, de forma clara e objetiva, usando dados concretos quando possível.
Use emojis moderadamente para tornar a leitura mais agradável.
Ao mencionar valores, use o formato R$ X.XXX,XX.

DADOS FINANCEIROS DO USUÁRIO:
Resumo: ${JSON.stringify(summary)}

Transações (formato: {date, desc, amount (positivo=receita, negativo=despesa), cat, src}):
${JSON.stringify(transactions)}`

  const history = [
    {
      role: 'user' as const,
      parts: [{ text: systemContext }],
    },
    {
      role: 'model' as const,
      parts: [{ text: 'Entendido! Analisei seus dados financeiros e estou pronto para ajudá-lo. O que você gostaria de saber?' }],
    },
    ...messages.slice(0, -1).map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
  ]

  const chat = model.startChat({ history })
  const lastMsg = messages[messages.length - 1]
  const result = await chat.sendMessage(lastMsg.content)
  const text = result.response.text()

  return NextResponse.json({ text })
}
