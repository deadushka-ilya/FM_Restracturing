/**
 * Пороговые значения для финансовых коэффициентов (РФ специфика)
 */

/**
 * Пороги для коэффициентов ликвидности
 */
export const LIQUIDITY_THRESHOLDS = {
  currentRatio: {
    critical: 1.0,
    warning: 1.5,
    good: 2.0,
  },
  quickRatio: {
    critical: 0.5,
    warning: 0.8,
    good: 1.0,
  },
  cashRatio: {
    critical: 0.1,
    warning: 0.2,
    good: 0.3,
  },
}

/**
 * Пороги для коэффициентов финансового рычага
 */
export const LEVERAGE_THRESHOLDS = {
  netDebtToEbitda: {
    good: 2.0,
    warning: 3.5,
    critical: 5.0,
  },
  debtToEquity: {
    good: 1.0,
    warning: 2.0,
    critical: 3.0,
  },
  debtToAssets: {
    good: 0.4,
    warning: 0.6,
    critical: 0.8,
  },
}

/**
 * Пороги для коэффициентов покрытия
 */
export const COVERAGE_THRESHOLDS = {
  interestCoverageRatio: {
    critical: 1.0,
    warning: 2.0,
    good: 3.0,
  },
  debtServiceCoverageRatio: {
    critical: 1.0,
    warning: 1.25,
    good: 1.5,
  },
}

/**
 * Пороги для Z-Score моделей
 */
export const Z_SCORE_THRESHOLDS = {
  altman: {
    safe: 2.99,
    grey: 1.81,
    // < 1.81 = distress zone
  },
  taffler: {
    low: 0.3,
    high: 0.2,
    // > 0.3 = low probability, < 0.2 = high probability
  },
  saifullinKadykov: {
    good: 1.0,
    satisfactory: 0.0,
    poor: -1.0,
    // > 1.0 = good, 0-1 = satisfactory, -1-0 = poor, < -1 = crisis
  },
}

/**
 * Признаки банкротства по ФЗ-127
 */
export const BANKRUPTCY_LAW_THRESHOLDS = {
  // Минимальная сумма обязательств для инициирования банкротства (руб)
  minDebtAmount: 300000,
  
  // Период просрочки (месяцы)
  insolvencyPeriodMonths: 3,
  
  // Период просрочки (дни)
  insolvencyPeriodDays: 90,
}

/**
 * Ключевая ставка ЦБ РФ (обновляется)
 */
export const CBR_KEY_RATE = 21.0 // % годовых (по состоянию на ноябрь 2024)

/**
 * Ставки налогов РФ
 */
export const TAX_RATES = {
  vat: {
    standard: 20,
    reduced: 10,
    zero: 0,
  },
  incomeTax: {
    standard: 20,
    federal: 3,
    regional: 17,
  },
  ndfl: 13,
  socialContributions: {
    pensionFund: 22,
    socialInsurance: 2.9,
    medicalInsurance: 5.1,
    total: 30,
  },
}

/**
 * Дисконты для ликвидационной стоимости активов
 */
export const LIQUIDATION_DISCOUNTS = {
  realEstate: 0.3, // 30% от рыночной
  equipment: 0.4,
  vehicles: 0.5,
  inventory: 0.6,
  receivables: 0.7,
  intangibles: 0.1,
}

/**
 * Затраты на процедуру банкротства (% от активов)
 */
export const BANKRUPTCY_COSTS = {
  courtFees: 0.02,
  trusteeRemuneration: 0.03,
  auctionCosts: 0.02,
  otherCosts: 0.03,
  total: 0.10, // 10%
}

/**
 * Advance rates для Borrowing Base
 */
export const ADVANCE_RATES = {
  receivables: {
    current: 0.85, // до 90 дней
    overdue30: 0.70,
    overdue60: 0.50,
    overdue90: 0.00,
  },
  inventory: {
    finishedGoods: 0.65,
    rawMaterials: 0.50,
    workInProgress: 0.30,
  },
  equipment: {
    newEquipment: 0.75,
    usedEquipment: 0.50,
  },
}

/**
 * Параметры Cash Wall (стены ликвидности)
 */
export const CASH_WALL_PARAMS = {
  operationalDays: 7, // Операционный запас на 7 дней
  minCashMultiplier: 1.0, // Минимальный остаток = средний дневной расход
  warningMultiplier: 1.2, // Порог предупреждения = 120% от минимума
}

/**
 * Параметры Collection Matrix по умолчанию
 * Профиль сбора платежей для российского рынка
 */
export const DEFAULT_COLLECTION_PROFILES = {
  b2b: {
    // B2B - отсрочка платежа
    week0: 0.10, // 10% предоплата
    week1: 0.40, // 40% по факту
    week2: 0.30, // 30% через неделю
    week3: 0.15, // 15% через 2 недели
    week4Plus: 0.05, // 5% позже
  },
  b2c: {
    // B2C - розница
    week0: 0.95, // 95% сразу
    week1: 0.05, // 5% возвраты
    week2: 0.00,
    week3: 0.00,
    week4Plus: 0.00,
  },
  crisis: {
    // Кризисный профиль (Downside сценарий)
    week0: 0.05, // Почти нет предоплат
    week1: 0.20, // Задержка платежей
    week2: 0.30,
    week3: 0.25,
    week4Plus: 0.20, // Много просрочки
  },
}

/**
 * Параметры сценариев (Scenario Multipliers)
 */
export const SCENARIO_ADJUSTMENTS = {
  Base: {
    revenue: 1.0,
    costs: 1.0,
    collections: 1.0,
    dpoStretch: 0, // Недель растягивания КЗ
  },
  Downside: {
    revenue: 0.7, // -30% выручки
    costs: 1.0, // Затраты не снижаются автоматически
    collections: 0.85, // Задержка платежей на 15%
    dpoStretch: 2, // +2 недели отсрочки поставщикам
  },
  Restructuring: {
    revenue: 0.85, // -15% выручки
    costs: 0.8, // -20% затрат после оптимизации
    collections: 0.9, // Задержка на 10%
    dpoStretch: 1, // +1 неделя отсрочки
  },
}

/**
 * Параметры DPO по типам поставщиков
 */
export const DPO_BY_VENDOR_TYPE = {
  critical: 7, // Критичные (ЖКХ, зарплата) - оплата сразу
  strategic: 14, // Стратегические поставщики - 2 недели
  standard: 30, // Стандартные - 30 дней
  nonCritical: 45, // Неприоритетные - 45 дней
  stretched: 60, // Растянутые в кризис - 60 дней
}
