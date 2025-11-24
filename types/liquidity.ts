/**
 * Типы для модуля управления ликвидностью (TWCF - 13-недельная модель)
 */

/**
 * Недельные поступления
 */
export interface WeeklyCashInflows {
  week: number
  startDate: string
  endDate: string
  
  // Операционные поступления
  revenueWithVat: number
  revenueVatAmount: number
  revenueNetOfVat: number
  
  // Возврат дебиторской задолженности
  receivablesCollection: number
  
  // Налоговые возвраты
  vatRefund: number
  otherTaxRefunds: number
  
  // Прочие поступления
  otherInflows: number
  subsidies: number
  
  // Итого поступления
  totalInflows: number
}

/**
 * Недельные выплаты
 */
export interface WeeklyCashOutflows {
  week: number
  startDate: string
  endDate: string
  
  // Операционные расходы
  suppliersPayment: number
  suppliersVatAmount: number
  
  // Фонд оплаты труда
  salaries: number
  ndflTax: number
  socialContributions: number
  
  // Аренда
  rentPayment: number
  
  // Налоги и сборы
  vatPayment: number
  incomeTaxPayment: number
  propertyTaxPayment: number
  otherTaxPayments: number
  
  // Обслуживание долга
  principalPayment: number
  interestPayment: number
  
  // Лизинг
  leasingPayment: number
  
  // Капитальные затраты
  capexPayment: number
  
  // Прочие выплаты
  otherOutflows: number
  
  // Итого выплаты
  totalOutflows: number
  
  // Маркировка текущих платежей (для процедур банкротства)
  currentPaymentsAmount: number
}

/**
 * Недельный кассовый баланс
 */
export interface WeeklyCashBalance {
  week: number
  startDate: string
  endDate: string
  
  openingBalance: number
  totalInflows: number
  totalOutflows: number
  netCashFlow: number
  closingBalance: number
  
  // Минимально необходимый остаток
  minimumCashBalance: number
  
  // Кассовый разрыв
  cashShortfall: number
  hasCashShortfall: boolean
  
  // Текущие платежи под угрозой
  currentPaymentsAtRisk: number
}

/**
 * 13-недельная модель денежного потока
 */
export interface TWCFModel {
  modelName: string
  createdDate: string
  startDate: string
  endDate: string
  
  // Недельные данные
  weeklyInflows: WeeklyCashInflows[]
  weeklyOutflows: WeeklyCashOutflows[]
  weeklyBalances: WeeklyCashBalance[]
  
  // Начальный остаток
  initialCashBalance: number
  
  // Итоговые показатели
  totalInflows: number
  totalOutflows: number
  netCashFlow: number
  finalCashBalance: number
  
  // Анализ
  weeksWithShortfall: number
  maxShortfallAmount: number
  totalFinancingRequired: number
  
  // НДС позиция
  vatPosition: {
    vatCollected: number
    vatDeductible: number
    vatPayable: number
    vatRefundable: number
  }
}

/**
 * Сценарии стресс-тестирования
 */
export enum StressScenario {
  BASE = 'Базовый',
  REVENUE_DELAY = 'Задержка поступлений',
  REVENUE_DROP = 'Снижение выручки',
  SUPPLIER_PRESSURE = 'Ужесточение условий поставщиков',
  CREDITOR_ACCELERATION = 'Ускоренные требования кредиторов',
  COMBINED = 'Комбинированный',
}

/**
 * Параметры стресс-теста
 */
export interface StressTestParameters {
  scenario: StressScenario
  
  // Влияние на выручку
  revenueDelayWeeks?: number
  revenueDropPercent?: number
  
  // Влияние на оборотный капитал
  dsoIncrease?: number // увеличение дней дебиторки
  dpoDecrease?: number // сокращение дней кредиторки
  
  // Влияние на долг
  acceleratedDebtAmount?: number
  acceleratedDebtWeek?: number
}

/**
 * Результат стресс-теста
 */
export interface StressTestResult {
  scenario: StressScenario
  parameters: StressTestParameters
  
  baseModel: TWCFModel
  stressModel: TWCFModel
  
  // Сравнительный анализ
  additionalFinancingRequired: number
  criticalWeeks: number[]
  
  recommendations: string[]
}

/**
 * Borrowing Base (Залоговая база)
 */
export interface BorrowingBase {
  calculationDate: string
  
  // Компоненты залоговой базы
  eligibleReceivables: number
  receivablesAdvanceRate: number // %
  receivablesBorrowingBase: number
  
  eligibleInventory: number
  inventoryAdvanceRate: number // %
  inventoryBorrowingBase: number
  
  eligibleEquipment: number
  equipmentAdvanceRate: number // %
  equipmentBorrowingBase: number
  
  // Итого
  totalBorrowingBase: number
  
  // Доступное финансирование
  existingBorrowings: number
  availableCredit: number
  
  // Динамика по неделям
  weeklyBorrowingBase: {
    week: number
    date: string
    borrowingBase: number
    utilizationAmount: number
    availableCredit: number
  }[]
}

/**
 * Меры по закрытию кассовых разрывов
 */
export interface LiquidityAction {
  id: string
  week: number
  actionType: 'payment_delay' | 'asset_sale' | 'financing' | 'negotiation' | 'other'
  description: string
  expectedImpact: number
  probability: number
  status: 'planned' | 'in_progress' | 'completed'
  responsibleParty: string
  notes?: string
}
