/**
 * Типы для сценарного управления и операционных драйверов
 * Согласно методологии Restructuring Playbook и требованиям Mary (Business Analyst)
 */

/**
 * Типы сценариев
 */
export enum ScenarioType {
  BASE = 'Base',
  DOWNSIDE = 'Downside',
  RESTRUCTURING = 'Restructuring',
}

/**
 * Макроэкономические параметры и настройки модели
 */
export interface MacroSettings {
  startDate: string // Дата начала прогноза (YYYY-MM-DD)
  forecastHorizon: 13 | 18 | 26 // Горизонт прогноза в неделях
  activeScenario: ScenarioType
  vatRate: number // Ставка НДС (обычно 20%, 10%, 0%)
  inflationRate: number // Прогноз инфляции (CPI), %
  fxRates: {
    USD: number // Курс USD/RUB
    EUR: number // Курс EUR/RUB
    CNY: number // Курс CNY/RUB
  }
  keyRate: number // Ключевая ставка ЦБ РФ, %
}

/**
 * Операционные драйверы выручки
 */
export interface RevenueDrivers {
  volume: number // Объем продаж в натуральном выражении
  price: number // Средняя цена реализации (ASP) без НДС
  seasonalityCoefficients: number[] // Коэффициенты сезонности по месяцам [1-12]
  contractRiskDiscount: number // % снижения выручки при банкротстве
}

/**
 * Операционные драйверы себестоимости
 */
export interface CostDrivers {
  variableCostPercent: number // % переменных затрат от выручки
  fixedCostMonthly: number // Фиксированные затраты в месяц
  staffing: {
    headcount: number // Численность персонала
    avgSalaryGross: number // Средняя зарплата (гросс)
    socialTaxRate: number // Ставка страховых взносов (~30%)
    paymentDates: number[] // Даты выплат в месяце [10, 25]
  }
}

/**
 * Драйверы оборотного капитала (Working Capital)
 */
export interface WorkingCapitalDrivers {
  dso: number // Days Sales Outstanding - срок сбора ДЗ, дни
  badDebtProvision: number // Резерв по сомнительным долгам, %
  dio: number // Days Inventory Outstanding - оборачиваемость запасов, дни
  dpo: number // Days Payables Outstanding - срок оплаты КЗ, дни
  prepaymentRequired: boolean // Требуется ли предоплата (стресс-сценарий)
}

/**
 * Профиль сбора платежей (Collection Matrix)
 * Распределение выручки по неделям оплаты
 */
export interface CollectionProfile {
  week0: number // % оплаты в текущую неделю (предоплата)
  week1: number // % оплаты через 1 неделю
  week2: number // % оплаты через 2 недели
  week3: number // % оплаты через 3 недели
  week4Plus: number // % оплаты позже 4 недель
}

/**
 * Затраты на реструктуризацию и банкротство
 */
export interface ImplementationCosts {
  professionalFees: number // Юристы, консультанты (в месяц)
  arbitrationManager: {
    fixedFee: number // Фиксированное вознаграждение АУ
    percentOfRecovery: number // % от погашения/продажи активов
  }
  courtCosts: number // Госпошлины, публикации
  severancePayments: number // Выходные пособия при сокращении
}

/**
 * Непрофильные активы для реализации
 */
export interface NonCoreAsset {
  id: string
  name: string
  assetType: 'property' | 'equipment' | 'receivables' | 'other'
  bookValue: number // Балансовая стоимость
  marketValue: number // Рыночная оценка
  liquidationDiscount: number // Дисконт за срочную продажу (Fire Sale), %
  expectedSaleWeek: number // Ожидаемая неделя поступления денег
}

/**
 * Расширенные параметры долга с опциями реструктуризации
 */
export interface DebtRestructuringOptions {
  debtId: string
  option: 'payAsScheduled' | 'moratorium' | 'restructure'
  moratoriumWeeks?: number // Длительность моратория в неделях
  capitalizeInterest?: boolean // Капитализация процентов (PIK)
  newInterestRate?: number // Новая процентная ставка после реструктуризации
  newMaturityDate?: string // Новая дата погашения
}

/**
 * Параметры сценария (набор драйверов для каждого сценария)
 */
export interface ScenarioParameters {
  scenarioType: ScenarioType
  macro: MacroSettings
  revenue: RevenueDrivers
  costs: CostDrivers
  workingCapital: WorkingCapitalDrivers
  collectionProfile: CollectionProfile
  implementationCosts: ImplementationCosts
  nonCoreAssets: NonCoreAsset[]
  debtOptions: DebtRestructuringOptions[]
}

/**
 * Очередность платежей по 127-ФЗ (Payment Waterfall)
 */
export enum PaymentPriority {
  TIER_1_LEGAL_COSTS = 1, // Судебные расходы, вознаграждение АУ
  TIER_2_PAYROLL = 2, // Текущая зарплата
  TIER_3_UTILITIES = 3, // ЖКХ, эксплуатационные расходы
  TIER_4_SECURED_CREDITORS = 4, // Залоговые кредиторы
  TIER_5_UNSECURED_CREDITORS = 5, // Незалоговые кредиторы
  TIER_6_SUBORDINATED = 6, // Субординированные обязательства
}

/**
 * Индикаторы ликвидности (RAG Status)
 */
export enum LiquidityStatus {
  RED = 'Критично', // Кассовый разрыв неизбежен
  AMBER = 'Внимание', // Близко к минимальному остатку
  GREEN = 'Хорошо', // Достаточная ликвидность
}

/**
 * Расчет минимального остатка денежных средств (Cash Wall)
 */
export interface CashWallParameters {
  minCashRequired: number // Неснижаемый остаток (Operational Buffer)
  operationalDays: number // Количество дней операционного запаса (обычно 5-7)
  dailyBurnRate: number // Средний дневной расход
}
