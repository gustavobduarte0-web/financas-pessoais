# PRD — Controle Financeiro Pessoal (Bradesco)

**Versão:** 1.1
**Data:** 2026-03-05
**Status:** Aprovado para desenvolvimento

---

## 1. Visão Geral

### 1.1 Problema
Usuários do Bradesco com conta corrente e cartão de crédito não têm forma simples de visualizar e analisar seus gastos consolidados. O banco exporta dados em formatos distintos (OFX e XLSX) sem nenhuma categorização.

### 1.2 Solução
App web responsivo, dark mode, estilo Nubank. Importa extrato da conta corrente (OFX) e fatura do cartão (XLSX), categoriza transações automaticamente, e exibe dashboard com gráficos financeiros consolidados — com tag indicando se o gasto foi débito ou crédito.

### 1.3 Usuário
Gustavo Duarte — conta corrente Bradesco + cartão com até 3 portadores (2723, 4761, 1725).

---

## 2. Formatos de Arquivo — Mapeamento Real

### 2.1 Extrato Conta Corrente — OFX (SGML)

**Arquivo:** `extrato.ofx`
**Encoding:** Windows-1252 (CHARSET:1252)
**Banco:** 0237 (Bradesco)
**Conta:** CHECKING

**Estrutura por transação:**
```
<STMTTRN>
  <TRNTYPE>CREDIT | DEBIT
  <DTPOSTED>YYYYMMDDHHMMSS[-03:EST]
  <TRNAMT>valor positivo (crédito) ou negativo (débito)
  <FITID>ID único
  <MEMO>descrição legível
</STMTTRN>
```

**Tipos de transação observados no arquivo real:**
| MEMO contém | Tipo real | Categoria sugerida |
|---|---|---|
| Transfe Pix Rem: [empresa] | Recebimento | Receita |
| Transfe Pix Des: [pessoa] | Envio PIX | Transferências |
| Pix Qrcode Din/Est Des: [loja] | Pagamento QR | variável |
| Apl.invest Fac | Aplicação investimento | Investimentos |
| Resgate Inv Fac | Resgate investimento | Investimentos |
| Rent.inv.facil | Rendimento | Investimentos |
| Aplicacao Cdb | Aplicação CDB | Investimentos |
| Pagto Cobranca [empresa] | Pagamento boleto | variável |
| Gasto c Credito | Débito fatura cartão | Cartão de Crédito |
| Devolucao Pix | Estorno/devolução | Transferências |
| Pix Automatico Des: [empresa] | PIX automático | variável |
| Juros s/ rd fx | Rendimento aplicação | Investimentos |
| Resg.autom.invest Facil* | Resgate automático | Investimentos |

### 2.2 Fatura Cartão de Crédito — XLSX

**Arquivo:** `cartão.xlsx`
**Estrutura:** Excel com seções por portador do cartão

**Portadores identificados:**
- `GUSTAVO B DUARTE - 2723` (cartão físico principal)
- `GUSTAVO B DUARTE - 4761` (cartão adicional)
- `NATHALIA T ERVILHA - 1725` (portador adicional)

**Colunas:** `Data | Histórico | Valor (US$) | Valor(R$)`

**Linhas especiais a ignorar/tratar:**
- `SALDO ANTERIOR` → não é transação
- `PAGTO. POR DEB EM C/C` → pagamento da fatura (valor negativo)
- `Total para [nome]` → linha de subtotal
- `Total da fatura em Real:` → linha de total geral
- Seção `Resumo das Despesas` e `Taxas` → metadados a ignorar

**Parcelamentos:** formato `DESCRIÇÃO X/Y` (ex: `RENNER 2/2`, `TreinoLapaTeam 2/12`)

**Exemplos de estabelecimentos reais:**
- Alimentação: PADARIA AURORA, HORTIFRUTI CEOLIN, VILA RAMOS BAR, IFD*SATORU, MINEIRAO TROPEIRO, BROWN BURGUER, JIM.COM CAMPTOWN BURGER, CHOPP PAMPULHA, ESPETOS STEAK
- Transporte: UBER * PENDING, 99*, WHOOSH BR AL (patinete elétrico)
- Saúde/Farmácia: DROGARIA ARAUJO, DROGASIL, FARMA PONTE NOVA, IFD*DROGARIAS PACHECO
- Vestuário: adidas FO, RENNER, CASA BONOMI
- Combustível: PanoramaPostoDe (posto)
- Hospedagem: HOTEL VILLA LOBOS, APART-HOTEL BEIRADOM, HOTEL PORTOFINO
- Assinaturas: APPLE.COM/BILL, IFOOD CLUB, Globo Premiere
- Supermercado: IFD*ATACADAO SA, DMA DISTRIBUIDORA SA, PRADO SUPERMERCADO

---

## 3. MVP — Escopo Definido

### Fase 1 (MVP — Entregar primeiro)

**Upload e parsing:**
- [x] Upload de OFX (conta corrente)
- [x] Upload de XLSX (fatura cartão)
- [x] Deduplicação por FITID (OFX) e data+valor+descrição (XLSX)

**Classificação:**
- [x] Classificação automática por regras de keyword (sem ML)
- [x] Tag visual "Débito" vs "Crédito" por transação
- [x] Tag de portador do cartão (2723 / 4761 / 1725)
- [x] Edição manual de categoria

**Dashboard:**
- [x] Cards de resumo: total receitas, total despesas, saldo
- [x] Gráfico pizza: despesas por categoria
- [x] Gráfico barras: despesas mensais
- [x] Lista de transações com filtros básicos

**Layout:**
- [x] Dark mode (único tema)
- [x] Responsivo mobile + desktop
- [x] Estilo moderno inspirado Nubank

**Persistência:**
- [x] IndexedDB (100% local, sem servidor, sem login)

### Fora do MVP (futuro)
- Metas e orçamento por categoria
- Gráfico de fluxo de caixa / treemap
- Aprendizado por correção (ML leve)
- Login e sincronização em nuvem
- PWA offline instalável

---

## 4. Categorias e Regras de Classificação

### Categorias
| ID | Nome | Cor | Ícone |
|---|---|---|---|
| alimentacao | Alimentação | #F59E0B | 🍽️ |
| transporte | Transporte | #3B82F6 | 🚗 |
| saude | Saúde | #EF4444 | 💊 |
| vestuario | Vestuário | #8B5CF6 | 👕 |
| moradia | Moradia | #10B981 | 🏠 |
| lazer | Lazer | #F97316 | 🎬 |
| supermercado | Supermercado | #6366F1 | 🛒 |
| assinaturas | Assinaturas | #EC4899 | 📱 |
| investimentos | Investimentos | #14B8A6 | 📈 |
| combustivel | Combustível | #84CC16 | ⛽ |
| hospedagem | Hospedagem | #A78BFA | 🏨 |
| receita | Receita | #22C55E | 💰 |
| transferencias | Transferências | #6B7280 | ↔️ |
| outros | Outros | #374151 | ❓ |

### Regras de keyword (baseadas nos dados reais)
```typescript
const rules = [
  // Investimentos (prioridade alta — aplicar antes das outras)
  { keywords: ['APL.INVEST', 'RESGATE INV', 'RENT.INV', 'APLICACAO CDB', 'RESG.AUTOM.INVEST', 'JUROS S/ RD FX'], category: 'investimentos' },

  // Receita
  { keywords: ['SALARIO', 'PAGAMENTO', 'FOLHA'], category: 'receita' },
  // PIX recebido de empresas conhecidas (Singular Mind = salário do usuário)
  // → tratar TRNTYPE=CREDIT + Transfe Pix Rem como receita por padrão

  // Alimentação
  { keywords: ['PADARIA', 'PANIFICADORA', 'HORTIFRUTI', 'HORT ', 'MERCADO', 'IFOOD', 'IFD*', 'BURGER', 'BAR E RESTA', 'TROPEIRO', 'LANCHONETE', 'CHURRASCARIA', 'PAMPULHA', 'ESPETOS', 'SATORU', 'STEAK', 'CHOPP', 'A GRANEL', 'GRANEL', 'CAFE', 'RESTAURANTE', 'LANCHES', 'TEMAKI', 'GASTROBAR', 'QUIOSQUE', 'FESTAS', 'CANTO GAUCHO', 'PARRILLA', 'LOUNGE', 'PUB', 'PRAINHA'], category: 'alimentacao' },

  // Supermercado
  { keywords: ['SUPERMERCADO', 'ATACADAO', 'DMA DISTRIBUIDORA', 'PRADO SUPER', 'MOMA LTDA', 'DISTRIBUIDORA SA'], category: 'supermercado' },

  // Transporte
  { keywords: ['UBER', '99*', 'WHOOSH', 'METRO', 'BILHETE', 'ONIBUS', 'TAXI', 'CABIFY'], category: 'transporte' },

  // Combustível
  { keywords: ['POSTO', 'COMBUSTIVEL', 'PETROLEO', 'PANORAMA POSTO', 'SHELL', 'PETROBRAS', 'IPIRANGA', 'BR '], category: 'combustivel' },

  // Saúde / Farmácia
  { keywords: ['FARMACIA', 'DROGARIA', 'DROGASIL', 'DROGARIAS', 'FARMA ', 'UNIMED', 'CONSULTA', 'LABORATORIO', 'MEDIC', 'HOSPITAL', 'INDIANA FARMACIA', 'PACHECO', 'HDI SEGUROS'], category: 'saude' },

  // Vestuário
  { keywords: ['RENNER', 'ZARA', 'C&A', 'HERING', 'ADIDAS', 'NIKE', 'SAPATARIA', 'CALCADO', 'MODA', 'LOJAS AMERICANAS'], category: 'vestuario' },

  // Hospedagem
  { keywords: ['HOTEL', 'APART-HOTEL', 'POUSADA', 'AIRBNB', 'APART HOTEL', 'BEIRADOM', 'VILLA LOBOS', 'PORTOFINO'], category: 'hospedagem' },

  // Assinaturas / Digital
  { keywords: ['NETFLIX', 'SPOTIFY', 'APPLE.COM', 'APPLE COM', 'GLOBO PREMIERE', 'STEAM', 'DISNEY', 'AMAZON PRIME', 'YOUTUBE', 'IFOOD CLUB', 'TREINOLAPATEAM', 'HTM*TREINO', 'DOMDIGITAL'], category: 'assinaturas' },

  // Moradia / Contas
  { keywords: ['ALUGUEL', 'CONDOMINIO', 'LUZ', 'AGUA', 'GAS', 'INTERNET', 'CLARO', 'VIVO', 'TIM', 'OI ', 'ENERGIA', 'CELESC', 'CEMIG', 'COPASA', 'SAAE', 'TMB EDUCACAO'], category: 'moradia' },

  // Lazer
  { keywords: ['CINEMA', 'TEATRO', 'SHOW', 'INGRESSO', 'BALADA', 'BILHETERIA', 'FESTAS', 'CPG*FAZ AZUL'], category: 'lazer' },

  // Transferências / PIX enviado
  { keywords: ['TRANSFE PIX DES', 'TRANSFERENCIA PIX DES', 'DEVOLUCAO PIX', 'PIX DES'], category: 'transferencias' },
]
```

**Lógica de prioridade:**
1. Investimentos primeiro (evitar falso positivo com "resgate")
2. Transações com `TRNTYPE=CREDIT` no OFX + "Transfe Pix Rem" → Receita
3. `Gasto c Credito` no OFX → ignorar (já está no XLSX do cartão)
4. Restante → percorrer regras em ordem, primeiro match vence
5. Nenhuma regra → "Outros"

---

## 5. Modelo de Dados

```typescript
interface Transaction {
  id: string                    // FITID (OFX) ou hash(data+valor+desc) (XLSX)
  date: Date
  description: string           // MEMO (OFX) | Histórico (XLSX)
  amount: number                // positivo = entrada, negativo = saída
  type: 'credit' | 'debit'     // TRNTYPE (OFX) | inferido (XLSX)
  source: 'conta' | 'cartao'   // origem do arquivo
  cardHolder?: string           // '2723' | '4761' | '1725' (só cartão)
  category: CategoryId
  categoryConfidence: number    // 0–1
  isInvestment: boolean         // transações de Apl/Resgate/Rend
  installment?: {               // parcelamentos (cartão)
    current: number
    total: number
  }
  note?: string                 // anotação manual do usuário
  importedAt: Date
}

interface Category {
  id: CategoryId
  name: string
  color: string
  icon: string
  keywords: string[]            // editável pelo usuário
}

type CategoryId =
  | 'alimentacao' | 'transporte' | 'saude' | 'vestuario'
  | 'moradia' | 'lazer' | 'supermercado' | 'assinaturas'
  | 'investimentos' | 'combustivel' | 'hospedagem'
  | 'receita' | 'transferencias' | 'outros'
```

---

## 6. Stack Técnica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Framework | Next.js 14 (App Router) | SSG + ecosistema React |
| Linguagem | TypeScript | Tipagem forte |
| Estilo | Tailwind CSS + CSS vars | Dark mode nativo, responsivo |
| Componentes | shadcn/ui | Acessível, sem overhead |
| Gráficos | Recharts | Integração React, customizável |
| Parse OFX | parser custom (regex/string) | OFX SGML é simples demais pra lib |
| Parse XLSX | SheetJS (xlsx) | Padrão para Excel no browser |
| Persistência | Dexie.js (IndexedDB) | API simples, queries assíncronas |
| Estado | Zustand | Leve, sem boilerplate |

---

## 7. Arquitetura de Pastas (MVP)

```
src/
  app/
    page.tsx                  # Dashboard
    transactions/page.tsx     # Lista de transações
    import/page.tsx           # Upload de arquivos
    layout.tsx                # Root layout com dark mode

  components/
    dashboard/
      SummaryCards.tsx        # Cards: receita, despesa, saldo
      CategoryPieChart.tsx    # Gráfico pizza por categoria
      MonthlyBarChart.tsx     # Barras por mês
    transactions/
      TransactionList.tsx     # Tabela paginada
      TransactionRow.tsx      # Linha: badge conta/cartão, categoria, valor
      CategoryBadge.tsx       # Pill colorido com ícone
      Filters.tsx             # Filtros: período, tipo, categoria, busca
    import/
      DropZone.tsx            # Upload drag-and-drop
      ImportPreview.tsx       # Prévia antes de confirmar
      ImportProgress.tsx      # Feedback de progresso
    ui/                       # shadcn components

  lib/
    parsers/
      ofx.ts                  # Parser OFX → Transaction[]
      xlsx.ts                 # Parser XLSX cartão → Transaction[]
    classifier/
      rules.ts                # Regras keyword → categoria
      index.ts                # Função classify(transaction)
    db/
      index.ts                # Dexie setup + migrations
      transactions.ts         # CRUD + queries agregadas
    utils/
      currency.ts             # formatBRL, parseBRL
      date.ts                 # parseBradescoDate, formatDate pt-BR

  hooks/
    useTransactions.ts        # Lista com filtros aplicados
    useDashboard.ts           # Totais e dados para gráficos
    useImport.ts              # Estado do fluxo de importação

  types/
    index.ts                  # Transaction, Category, Filter, etc.
```

---

## 8. Fluxo de Telas (MVP)

```
/import  (entrada padrão para usuário novo)
  → DropZone para OFX ou XLSX
  → Parser roda no browser (sem servidor)
  → Classificação automática
  → ImportPreview: lista de transações identificadas
  → Usuário confirma → salvo no IndexedDB
  → Redirect para /

/ (dashboard)
  → SummaryCards: Receitas | Despesas | Saldo | Maior categoria
  → CategoryPieChart: pizza com filtro de período
  → MonthlyBarChart: conta corrente vs cartão por mês
  → Link para /transactions

/transactions
  → Filters: período, fonte (conta/cartão), portador, categoria, busca
  → TransactionList paginada
  → Click em linha: editar categoria / adicionar nota
```

---

## 9. Decisões de Design (Dark Mode / Nubank-inspired)

**Paleta de cores:**
```css
--bg-primary: #0D0D0D       /* fundo principal */
--bg-card: #1A1A1A          /* cards */
--bg-elevated: #242424      /* modais, dropdowns */
--border: #2E2E2E           /* bordas suaves */
--text-primary: #F5F5F5     /* texto principal */
--text-secondary: #888888   /* texto secundário */
--accent-purple: #820AD1    /* cor Nubank */
--accent-green: #03DAC6     /* valores positivos */
--accent-red: #CF6679       /* valores negativos */
```

**Princípios visuais:**
- Cards com fundo elevado, sem bordas pesadas, sombras sutis
- Valores positivos em verde, negativos em vermelho/rosa
- Badge `Conta` (outline roxo) e `Cartão` (outline azul) em cada transação
- Badge do portador do cartão (2723 / 4761 / 1725) em cinza discreto
- Tipografia: Inter ou Geist, peso 400/600/700
- Animações suaves (Framer Motion ou CSS transitions)
- Inputs e botões com hover states claros

---

## 10. Comportamentos Especiais do Parser

### OFX
- Encoding: ler como binary, decode com TextDecoder('windows-1252')
- Ignorar linhas antes de `<OFX>`
- `Gasto c Credito` → marcar como `isCardPayment: true`, não duplicar com XLSX
- `Resgate Inv Fac` que coincide em valor/data com `Apl.invest Fac` → são pares (não cancelar, apenas marcar)
- Datas: `YYYYMMDDHHMMSS[-03:EST]` → extrair apenas YYYYMMDD

### XLSX Cartão
- Detectar início de seção por linha com formato `NOME - XXXX` (portador + últimos 4 dígitos)
- Pular: SALDO ANTERIOR, PAGTO. POR DEB EM C/C (valores negativos = pagamento da fatura)
- Parar leitura de transações ao encontrar `Total para`, `Resumo das Despesas`, `Taxas`
- Parcelamentos: extrair X/Y do final da string, guardar em `installment`
- Valores: string `"1.070,00"` → parseFloat(s.replace('.','').replace(',','.'))
- Todos os valores são débitos (gastos), exceto PAGTO que é crédito

---

## 11. Critérios de Aceitação do MVP

- [ ] Importar `extrato.ofx` real sem erros, todas as transações aparecem
- [ ] Importar `cartão.xlsx` real sem erros, portadores corretos identificados
- [ ] Deduplicação: reimportar mesmo arquivo não cria duplicatas
- [ ] >= 80% das transações classificadas automaticamente (sem "Outros")
- [ ] Dashboard carrega em < 1s após importação
- [ ] Badge "Conta" ou "Cartão" visível em cada transação
- [ ] Funciona em Chrome mobile (iOS e Android)
- [ ] Dados persistem após fechar e reabrir o browser
