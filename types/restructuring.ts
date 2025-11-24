/**
 * Типы для модуля финансовой реструктуризации
 */

import { Debt, PaymentSchedule } from './debt'

/**
 * Тип реструктуризации долга
 */
export enum RestructuringType {
  EXTENSION = 'Пролонгация срока',
  RATE_CHANGE = 'Изменение ставки',
  HAIRCUT = 'Частичное списание',
  DEBT_TO_EQUITY = 'Конвертация в капитал',
  REFINANCING = 'Рефинансирование',
  SUBORDINATION = 'Субординация',
  MIXED = 'Комбинированная',
}

/**
 * Параметры реструктуризации долга
 */
export interface DebtRestructuringParams {
  debtId: string
  type: RestructuringType
  
  // Пролонгация
  newMaturityDate?: string
  
  // Изменение ставки
  newInterestRate?: number
  
  // Частичное списание (haircut)
  haircutPercent?: number
  haircutAmount?: number
  
  // Конвертация в капитал
  conversionPercent?: number
  conversionAmount?: number
  equityValuation?: number
  
  // Рефинансирование
  newLender?: string
  refinancingAmount?: number
  refinancingRate?: number
  refinancingTerm?: number
  
  // Субординация
  newPriority?: string
  
  // Прочее
  gracePerio dMonths?: number
  description?: string
}

/**
 * Результат реструктуризации долга
 */
export interface DebtRestructuringResult {
  originalDebt: Debt
  restructuredDebt: Debt
  
  // Финансовый эффект
  principalReduction: number
  interestSavings: number
  totalSavings: number
  npvSavings: number
  
  // Новый график платежей
  newPaymentSchedule: PaymentSchedule[]
  
  // Показатели до/после
  beforeDSCR: number
  afterDSCR: number
  beforeICR: number
  afterICR: number
  
  // Для кредиторов
  creditorRecovery: number
  creditorLoss: number
  creditorLossPercent: number
  
  // Для должника
  cashFlowRelief: number
  debtServiceReduction: number
}

/**
 * Сценарий реструктуризации (несколько долгов)
 */
export interface RestructuringScenario {
  scenarioName: string
  description: string
  debts: DebtRestructuringParams[]
  
  // Дополнительные меры
  newEquityInjection?: number
  assetSales?: {
    assetType: string
    salePrice: number
    debtRepayment: number
  }[]
  
  // Результаты
  totalDebtBefore: number
  totalDebtAfter: number
  totalDebtReduction: number
  totalNPVSavings: number
  
  // Коэффициенты до/после
  netDebtToEbitdaBefore: number
  netDebtToEbitdaAfter: number
  debtToEquityBefore: number
  debtToEquityAfter: number
}

/**
 * Параметры конвертации долга в капитал
 */
export interface DebtToEquityParams {
  debtAmount: number
  companyValuation: number
  existingSharesCount: number
  conversionRatio: number
  
  // Результаты
  newSharesIssued: number
  postConversionSharesCount: number
  newShareholderPercent: number
  existingShareholderDilution: number
}

/**
 * Параметры рефинансирования
 */
export interface RefinancingParams {
  existingDebts: Debt[]
  
  newLoanAmount: number
  newInterestRate: number
  newTermMonths: number
  newLender: string
  
  // Затраты на рефинансирование
  arrangementFees: number
  earlyRepaymentPenalties: number
  legalFees: number
  otherCosts: number
  
  // Результаты
  totalCosts: number
  netProceedsToCompany: number
  monthlySavings: number
  breakEvenMonths: number
  totalNPVBenefit: number
}

/**
 * Мировое соглашение
 */
export interface SettlementAgreement {
  agreementDate: string
  creditors: {
    creditorName: string
    originalClaim: number
    agreedAmount: number
    paymentTermMonths: number
    interestRate: number
  }[]
  
  totalOriginalClaims: number
  totalAgreedAmount: number
  totalHaircut: number
  haircutPercent: number
  
  // Источники погашения
  operatingCashFlow: number
  assetSales: number
  newFinancing: number
  equityInjection: number
  
  // Условия
  moratoriumPeriod: number
  supervisionPeriod: number
  milestones: {
    date: string
    description: string
    amount: number
  }[]
}

/**
 * Реструктуризация капитала
 */
export interface EquityRestructuring {
  type: 'increase' | 'decrease' | 'buyback'
  
  // Увеличение УК
  newCapitalAmount?: number
  contributionType?: 'cash' | 'property' | 'debt_conversion'
  
  // Уменьшение УК
  reductionAmount?: number
  reductionPurpose?: 'loss_coverage' | 'return_to_shareholders'
  
  // Выкуп долей/акций
  buybackAmount?: number
  buybackPrice?: number
  buybackShares?: number
  
  // Корпоративные процедуры
  shareholderApprovalRequired: boolean
  quorumPercent: number
  votesRequiredPercent: number
  
  // Результаты
  authorizedCapitalBefore: number
  authorizedCapitalAfter: number
  shareholdingChanges: {
    shareholder: string
    percentBefore: number
    percentAfter: number
  }[]
}
