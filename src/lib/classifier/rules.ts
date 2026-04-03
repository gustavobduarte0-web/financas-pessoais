import type { CategoryId, TransactionType } from '@/types'

interface Rule {
  keywords: string[]
  category: CategoryId
}

// Rules ordered by priority — first match wins
// Keywords are checked case-insensitively against the transaction description
const RULES: Rule[] = [
  // Investimentos (alta prioridade — verificar antes das outras)
  {
    keywords: [
      'APL.INVEST', 'RESGATE INV', 'RENT.INV', 'APLICACAO CDB',
      'RESG.AUTOM.INVEST', 'JUROS S/ RD FX', 'INVEST FACIL',
    ],
    category: 'investimentos',
  },

  // Supermercado (antes de alimentacao para evitar conflitos)
  {
    keywords: [
      'SUPERMERCADO', 'ATACADAO', 'DMA DISTRIBUIDORA', 'PRADO SUPER',
      'MOMA LTDA', 'DISTRIBUIDORA SA', 'HORT LINHARES', 'HORTIFRUTI',
      'A GRANEL', 'CARREFOUR', 'EXTRA HIPER', 'ASSAI', 'FORT ATACADISTA',
      'ATACADISTA', 'SAO JOAO ALIMENTOS', 'CONDOR', 'BISTEK', 'ANGELONI',
      'MAXXI ATACADO', 'MERCADINHO', 'MINI MERCADO', 'MERCEARIA',
    ],
    category: 'supermercado',
  },

  // Alimentação
  {
    keywords: [
      'PADARIA', 'PANIFICADORA', 'LANCHONETE', 'RESTAURANTE', 'LANCHET',
      'IFOOD', 'IFD*', 'RAPPI', 'BURGER', 'BAR E RESTA', 'TROPEIRO',
      'CHURRASCARIA', 'ESPETOS', 'SATORU', 'STEAK', 'CHOPP',
      'CAFE', 'CAFETERIA', 'PIZZARIA', 'SUSHI', 'TEMAKI', 'GASTROBAR',
      'QUIOSQUE', 'CANTO GAUCHO', 'PARRILLA', 'MANO S', 'LANCHES',
      'JIM.COM', 'BROWN BURGUER', 'CAMPTOWN', 'MINEIRAO', 'VILA RAMOS',
      'LOUNGE', 'PUB', 'COMERCIO DE FESTAS', 'O PASSO',
      'NORTH PUB', 'ILHA DO FRANC', 'VILA PRAIA',
      'MCDONALD', 'KFC', 'SUBWAY', 'BOBS ', "BOB'S", 'GIRAFFAS',
      'SPOLETO', 'OUTBACK', 'FRANGO ASSADO', 'CHINA IN BOX', 'COCO BAMBU',
      'VIVENDA DO CAMARAO', 'HABIBS', 'DOMINOS', 'PIZZA HUT', 'MADERO',
      'ACAI ', 'TAPIOCA', 'SMOOTHIE', 'SORVETERIA', 'CONFEITARIA',
    ],
    category: 'alimentacao',
  },

  // Transporte
  {
    keywords: [
      'UBER', '99*', 'WHOOSH', 'METRO ', 'ONIBUS', 'TAXI', 'CABIFY', 'BUSER',
      'LIME ', 'GROW ', 'YELLOW ', 'BICICLETARIO',
      'ESTACIONAMENTO', 'ESTAC.', 'AUTOPARK', 'PARK ',
      'BILHETE UNICO', 'CARTAO BILHETE',
      'GONTIJO', 'UTIL ', 'COMETA', 'CATARINENSE', 'JBL TURISMO',
      'PASSAGEM ONIBUS', 'PASSAGEM AEREA',
    ],
    category: 'transporte',
  },

  // Combustível
  {
    keywords: [
      'POSTO', 'COMBUSTIVEL', 'PETROLEO', 'PANORAMA POSTO',
      'SHELL', 'PETROBRAS', 'IPIRANGA', 'RAIZEN', 'BR DISTRIBUIDORA',
      'GASOLINA', 'ETANOL', 'GNV',
    ],
    category: 'combustivel',
  },

  // Saúde / Farmácia
  {
    keywords: [
      'FARMACIA', 'DROGARIA', 'DROGASIL', 'DROGARIAS', 'FARMA ',
      'DROGA RAIA', 'RAIA DROGASIL', 'PAGUE MENOS', 'ULTRAFARMA',
      'FARMADEPA', 'NISSEI',
      'UNIMED', 'CONSULTA', 'LABORATORIO', 'MEDIC', 'HOSPITAL',
      'PACHECO', 'HDI SEGUROS', 'SEGURO SAUDE', 'CLINICA',
      'AMIL', 'BRADESCO SAUDE', 'SULAMERICA SAUDE',
      'ODONTO', 'DENTISTA', 'PSICO', 'TERAPEUTA',
      'VACINA', 'EXAME MEDICO', 'RAIO-X', 'FISIOTERAPIA',
    ],
    category: 'saude',
  },

  // Vestuário
  {
    keywords: [
      'RENNER', 'ZARA', 'C&A', 'HERING', 'ADIDAS', 'NIKE',
      'SAPATARIA', 'CALCADO', 'MODA ', 'LOJAS AMERICANAS',
      'AMERICANAS', 'RIACHUELO', 'MARISA',
      'SHEIN', 'CENTAURO', 'NETSHOES', 'DAFITI',
      'FARM ', 'ANIMALE', 'RESERVA', 'ARAMIS', 'DUDALINA',
      'BROOKSFIELD', 'OSKLEN', 'HAVAIANAS',
    ],
    category: 'vestuario',
  },

  // Hospedagem
  {
    keywords: [
      'HOTEL', 'APART-HOTEL', 'APART HOTEL', 'POUSADA', 'AIRBNB',
      'BEIRADOM', 'VILLA LOBOS', 'PORTOFINO', 'MORADA VERENA',
      'BOOKING', 'DECOLAR', 'EXPEDIA', 'TRIVAGO', 'HURB',
      'HOSTEL', 'RESORT', 'FLAT ',
    ],
    category: 'hospedagem',
  },

  // Lazer / Entretenimento
  {
    keywords: [
      'CINEMA', 'TEATRO', 'SHOW ', 'INGRESSO', 'BALADA',
      'BILHETERIA', 'CPG*FAZ AZUL', 'INGRESSOS',
      'TICKETMASTER', 'EVENTIM', 'SYMPLA',
      'PARQUE ', 'ZOOLOGICO', 'MUSEU', 'AQUARIO', 'BOLICHE',
      'KARTING', 'ESCAPE ROOM',
    ],
    category: 'lazer',
  },

  // Assinaturas / Digital
  {
    keywords: [
      'NETFLIX', 'SPOTIFY', 'APPLE.COM', 'APPLE COM',
      'GLOBOPLAY', 'GLOBO PREMIERE', 'PARAMOUNT', 'HBO MAX',
      'STEAM', 'DISNEY', 'AMAZON PRIME', 'PRIME VIDEO',
      'YOUTUBE PREMIUM', 'DEEZER', 'CRUNCHYROLL',
      'IFOOD CLUB', 'TREINOLAPATEAM', 'HTM*TREINO',
      'DOMDIGITAL', 'BR1*DOMDIGITAL',
      'DUOLINGO', 'CANVA', 'NOTION', 'DROPBOX',
      'CHATGPT', 'OPENAI', 'MICROSOFT 365', 'OFFICE 365',
      'ADOBE', 'GITHUB', 'FIGMA',
    ],
    category: 'assinaturas',
  },

  // Moradia / Contas fixas
  {
    keywords: [
      'ALUGUEL', 'CONDOMINIO', 'ENERGIA ELETRICA', 'INTERNET',
      'CLARO', 'VIVO', 'TIM ', 'OI ', 'CELESC', 'CEMIG', 'COPASA',
      'SAAE', 'TMB EDUCACAO', 'ESCOLA', 'FACULDADE',
      'SANEPAR', 'SABESP', 'LIGHT ', 'ENEL ', 'CPFL', 'ELEKTRO',
      'AES ELETROPAULO', 'VIVO FIXO', 'NET VIRTUA', 'SKY ',
      'LEROY MERLIN', 'CASSOL', 'C&C ',
    ],
    category: 'moradia',
  },

  // Transferências enviadas
  {
    keywords: [
      'TRANSFE PIX DES', 'TRANSFERENCIA PIX DES', 'DEVOLUCAO PIX',
      'PIX DES',
    ],
    category: 'transferencias',
  },
]

// Remove prefixos de gateway de pagamento: "IFD*", "BR1*", "APL*", "HTM*", etc.
// Ex: "IFD*RESTAURANTE JOSE" → "RESTAURANTE JOSE"
function stripGatewayPrefix(upper: string): string {
  return upper.replace(/^[A-Z0-9]{2,4}\*/, '')
}

export function classifyByRules(
  description: string,
  type: TransactionType,
  isInvestment: boolean
): { category: CategoryId; confidence: number } {
  const upper = description.toUpperCase()
  const normalized = stripGatewayPrefix(upper)

  // Investimentos
  if (isInvestment) return { category: 'investimentos', confidence: 1 }

  // Receita: crédito de empresa (PIX Rem = recebido)
  if (type === 'credit' && upper.includes('TRANSFE PIX REM')) {
    return { category: 'receita', confidence: 0.9 }
  }
  if (type === 'credit' && upper.includes('TRANSFERENCIA PIX REM')) {
    return { category: 'receita', confidence: 0.9 }
  }
  if (type === 'credit' && (upper.includes('SALARIO') || upper.includes('PAGAMENTO'))) {
    return { category: 'receita', confidence: 1 }
  }
  // Outros créditos não especificados são receita
  if (type === 'credit') {
    return { category: 'receita', confidence: 0.7 }
  }

  // Percorrer regras de keywords — testar tanto original quanto versão sem prefixo
  for (const rule of RULES) {
    for (const kw of rule.keywords) {
      const kwUpper = kw.toUpperCase()
      if (upper.includes(kwUpper) || normalized.includes(kwUpper)) {
        return { category: rule.category, confidence: 0.85 }
      }
    }
  }

  return { category: 'outros', confidence: 0.3 }
}
