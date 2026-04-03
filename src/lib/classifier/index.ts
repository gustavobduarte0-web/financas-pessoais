import type { CategoryId, TransactionType } from '@/types'
import { classifyByRules } from './rules'
import { getMemory } from '@/lib/db/classificationMemory'

export interface ClassifyResult {
  category: CategoryId
  confidence: number
  learned: boolean  // true = veio da memória do usuário
}

export async function classify(
  description: string,
  type: TransactionType,
  isInvestment: boolean
): Promise<ClassifyResult> {
  // Camada 1: memória (usuário = confiança 1.0 / IA = confiança 0.75)
  try {
    const mem = await getMemory(description)
    if (mem) {
      if (mem.source === 'ai') {
        return { category: mem.category, confidence: 0.75, learned: false }
      }
      return { category: mem.category, confidence: 1.0, learned: true }
    }
  } catch {
    // Se o DB não estiver disponível (ex: SSR), continua para regras
  }

  // Camada 2: regras de keywords
  const result = classifyByRules(description, type, isInvestment)
  return { ...result, learned: false }
}
