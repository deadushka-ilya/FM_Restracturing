/**
 * Типы организационно-правовых форм
 */
export enum LegalForm {
  OOO = 'ООО',
  AO = 'АО',
  PAO = 'ПАО',
  IP = 'ИП',
  OTHER = 'Другое',
}

/**
 * Статус компании в процедуре банкротства
 */
export enum BankruptcyStatus {
  NONE = 'Нет процедуры',
  PRE_TRIAL = 'Досудебная реструктуризация',
  OBSERVATION = 'Наблюдение',
  FINANCIAL_RECOVERY = 'Финансовое оздоровление',
  EXTERNAL_MANAGEMENT = 'Внешнее управление',
  BANKRUPTCY = 'Конкурсное производство',
  SETTLEMENT = 'Мировое соглашение',
}

/**
 * Базовая информация о компании
 */
export interface CompanyInfo {
  name: string
  inn: string
  legalForm: LegalForm
  industry: string
  bankruptcyStatus: BankruptcyStatus
  employeeCount?: number
  foundedYear?: number
}

/**
 * Данные баланса (Форма 1 РСБУ)
 */
export interface BalanceSheet {
  date: string
  
  // Актив
  // Внеоборотные активы
  intangibleAssets: number
  fixedAssets: number
  constructionInProgress: number
  profitableInvestments: number
  financialInvestments: number
  deferredTaxAssets: number
  otherNonCurrentAssets: number
  
  // Оборотные активы
  inventory: number
  materialReserves: number
  workInProgress: number
  finishedGoods: number
  vat: number
  receivables: number
  receivablesLongTerm: number
  financialInvestmentsShortTerm: number
  cash: number
  otherCurrentAssets: number
  
  // Пассив
  // Капитал и резервы
  authorizedCapital: number
  ownShares: number
  revaluation: number
  additionalCapital: number
  reserveCapital: number
  retainedEarnings: number
  
  // Долгосрочные обязательства
  loansLongTerm: number
  deferredTaxLiabilities: number
  estimatedLiabilitiesLongTerm: number
  otherLiabilitiesLongTerm: number
  
  // Краткосрочные обязательства
  loansShortTerm: number
  payables: number
  payablesToSuppliers: number
  payablesToPersonnel: number
  payablesToGovernment: number
  payablesToFunds: number
  incomeReceivedInAdvance: number
  estimatedLiabilitiesShortTerm: number
  otherLiabilitiesShortTerm: number
}

/**
 * Отчет о финансовых результатах (Форма 2 РСБУ)
 */
export interface IncomeStatement {
  date: string
  period: 'year' | 'quarter' | 'month'
  
  // Доходы и расходы
  revenue: number
  costOfSales: number
  grossProfit: number
  
  commercialExpenses: number
  administrativeExpenses: number
  operatingProfit: number
  
  // Прочие доходы и расходы
  incomeFromParticipation: number
  percentReceivable: number
  percentPayable: number
  otherIncome: number
  otherExpenses: number
  
  profitBeforeTax: number
  currentIncomeTax: number
  deferredIncomeTax: number
  otherTax: number
  
  netProfit: number
}

/**
 * Отчет о движении денежных средств (ОДДС)
 */
export interface CashFlowStatement {
  date: string
  period: 'year' | 'quarter' | 'month'
  
  // Операционная деятельность
  cashFromOperations: number
  cashFromCustomers: number
  cashToSuppliers: number
  cashToEmployees: number
  interestPaid: number
  incomeTaxPaid: number
  otherOperatingCash: number
  
  // Инвестиционная деятельность
  cashFromInvesting: number
  purchaseOfFixedAssets: number
  saleOfFixedAssets: number
  purchaseOfInvestments: number
  saleOfInvestments: number
  
  // Финансовая деятельность
  cashFromFinancing: number
  proceedsFromLoans: number
  repaymentOfLoans: number
  proceedsFromEquity: number
  dividendsPaid: number
  
  netCashFlow: number
  cashBeginning: number
  cashEnding: number
}
