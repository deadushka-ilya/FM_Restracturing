/**
 * Типы кредиторов
 */
export enum CreditorType {
  BANK = 'Банк',
  LEASING = 'Лизинг',
  SUPPLIER = 'Поставщик',
  TAX_AUTHORITY = 'ФНС',
  PENSION_FUND = 'ПФР',
  SOCIAL_INSURANCE = 'ФСС',
  MEDICAL_INSURANCE = 'ФОМС',
  SHAREHOLDER_LOAN = 'Займ участника',
  OTHER = 'Прочее',
}

/**
 * Статус обязательства в процедуре банкротства
 */
export enum DebtStatus {
  REGISTRY = 'Реестровое требование',
  CURRENT = 'Текущий платеж',
  SECURED = 'Обеспеченное залогом',
  UNSECURED = 'Необеспеченное',
  SUBORDINATED = 'Субординированное',
}

/**
 * Приоритет требования (очередность по ФЗ-127)
 */
export enum DebtPriority {
  OUT_OF_QUEUE = 'Внеочередные',
  FIRST = '1-я очередь',
  SECOND = '2-я очередь',
  THIRD = '3-я очередь',
  SUBORDINATED = 'Субординированные',
}

/**
 * Тип обеспечения
 */
export enum CollateralType {
  REAL_ESTATE = 'Недвижимость',
  EQUIPMENT = 'Оборудование',
  VEHICLES = 'Транспорт',
  INVENTORY = 'Запасы',
  RECEIVABLES = 'Дебиторская задолженность',
  GUARANTEE = 'Поручительство',
  NONE = 'Без обеспечения',
}

/**
 * Валюта обязательства
 */
export enum Currency {
  RUB = 'RUB',
  USD = 'USD',
  EUR = 'EUR',
  CNY = 'CNY',
}

/**
 * Тип процентной ставки
 */
export enum InterestRateType {
  FIXED = 'Фиксированная',
  FLOATING = 'Плавающая',
  KEY_RATE = 'Ключевая ставка ЦБ',
  KEY_RATE_PLUS = 'Ключ. ставка + маржа',
}

/**
 * График платежа
 */
export interface PaymentSchedule {
  date: string
  principal: number
  interest: number
  total: number
  balance: number
}

/**
 * Ковенанты
 */
export interface Covenant {
  type: 'net_debt_ebitda' | 'debt_equity' | 'dscr' | 'icr' | 'other'
  description: string
  threshold: number
  currentValue?: number
  isBroken: boolean
}

/**
 * Обязательство
 */
export interface Debt {
  id: string
  creditorName: string
  creditorType: CreditorType
  
  // Основные параметры
  principalAmount: number
  outstandingAmount: number
  currency: Currency
  interestRate: number
  interestRateType: InterestRateType
  
  // Даты
  disbursementDate: string
  maturityDate: string
  nextPaymentDate?: string
  
  // Обеспечение
  collateralType: CollateralType
  collateralValue?: number
  collateralDescription?: string
  
  // Статус
  debtStatus: DebtStatus
  debtPriority: DebtPriority
  isOverdue: boolean
  overdueAmount?: number
  overdueDays?: number
  
  // Пени и штрафы
  penaltiesAmount?: number
  penaltiesRate?: number
  
  // График платежей
  paymentSchedule: PaymentSchedule[]
  
  // Ковенанты
  covenants?: Covenant[]
  
  // Дополнительная информация
  notes?: string
  contractNumber?: string
  isSubordinated: boolean
  canBeRestructured: boolean
  
  // Опции реструктуризации (согласно ТЗ Mary)
  restructuringOption?: 'payAsScheduled' | 'moratorium' | 'restructure'
  moratoriumWeeks?: number
  capitalizeInterest?: boolean // PIK (Payment In Kind)
  accruedPIKInterest?: number // Накопленные капитализированные проценты
}

/**
 * Налоговая задолженность (детализация)
 */
export interface TaxDebt {
  taxType: 'НДС' | 'Налог на прибыль' | 'Налог на имущество' | 'НДФЛ' | 'Страховые взносы' | 'Прочее'
  principalAmount: number
  penaltiesAmount: number
  finesAmount: number
  totalAmount: number
  period: string
  hasRestructuringAgreement: boolean
  restructuringEndDate?: string
}

/**
 * Лизинговое обязательство
 */
export interface LeasingDebt extends Debt {
  assetDescription: string
  residualValue: number
  isFinancialLease: boolean
  buyoutOption: boolean
  buyoutPrice?: number
}

/**
 * Агрегированная информация по долгу
 */
export interface DebtSummary {
  totalDebt: number
  securedDebt: number
  unsecuredDebt: number
  subordinatedDebt: number
  
  bankLoans: number
  leasing: number
  tradePayables: number
  taxDebt: number
  otherDebt: number
  
  currentDebt: number
  longTermDebt: number
  
  overdueDebt: number
  overdueMore90Days: number
  
  totalPenalties: number
  
  // По валютам
  debtByCurrency: Record<Currency, number>
  
  // Средневзвешенная ставка
  weightedAverageRate: number
}
