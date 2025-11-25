/**
 * Дефолтные параметры сценариев
 * Согласно методологии Restructuring Playbook и ТЗ Mary
 */

import { ScenarioType, ScenarioParameters, CollectionProfile } from '@/types/scenario'
import { CBR_KEY_RATE, TAX_RATES, DEFAULT_COLLECTION_PROFILES } from './thresholds'

/**
 * Базовый сценарий (Base Case)
 * Текущее состояние бизнеса без существенных изменений
 */
export const BASE_SCENARIO: ScenarioParameters = {
  scenarioType: ScenarioType.BASE,
  macro: {
    startDate: new Date().toISOString().split('T')[0],
    forecastHorizon: 13,
    activeScenario: ScenarioType.BASE,
    vatRate: TAX_RATES.vat.standard / 100,
    inflationRate: 7.5, // Прогноз ЦБ РФ на 2024
    fxRates: {
      USD: 95.0,
      EUR: 103.0,
      CNY: 13.0,
    },
    keyRate: CBR_KEY_RATE,
  },
  revenue: {
    volume: 1000, // Базовый объем
    price: 50000, // Средняя цена
    seasonalityCoefficients: [0.9, 0.85, 0.95, 1.0, 1.05, 1.1, 1.15, 1.1, 1.05, 1.0, 0.95, 0.9],
    contractRiskDiscount: 0, // Нет риска расторжения
  },
  costs: {
    variableCostPercent: 60, // 60% от выручки
    fixedCostMonthly: 2000000,
    staffing: {
      headcount: 50,
      avgSalaryGross: 80000,
      socialTaxRate: TAX_RATES.socialContributions.total / 100,
      paymentDates: [10, 25],
    },
  },
  workingCapital: {
    dso: 45, // 45 дней на сбор ДЗ
    badDebtProvision: 2, // 2% резерв
    dio: 30, // 30 дней запасы
    dpo: 30, // 30 дней оплата КЗ
    prepaymentRequired: false,
  },
  collectionProfile: DEFAULT_COLLECTION_PROFILES.b2b,
  implementationCosts: {
    professionalFees: 0, // Нет затрат на реструктуризацию в базовом сценарии
    arbitrationManager: {
      fixedFee: 0,
      percentOfRecovery: 0,
    },
    courtCosts: 0,
    severancePayments: 0,
  },
  nonCoreAssets: [],
  debtOptions: [],
}

/**
 * Негативный сценарий (Downside Case)
 * Падение выручки, задержка платежей, кризис
 */
export const DOWNSIDE_SCENARIO: ScenarioParameters = {
  scenarioType: ScenarioType.DOWNSIDE,
  macro: {
    ...BASE_SCENARIO.macro,
    activeScenario: ScenarioType.DOWNSIDE,
    inflationRate: 10.0, // Повышенная инфляция в кризис
    fxRates: {
      USD: 110.0, // Девальвация рубля
      EUR: 120.0,
      CNY: 15.0,
    },
  },
  revenue: {
    ...BASE_SCENARIO.revenue,
    volume: 700, // -30% объема
    contractRiskDiscount: 15, // Риск расторжения 15% контрактов
  },
  costs: {
    ...BASE_SCENARIO.costs,
    // Затраты остаются, т.к. их сложно снизить быстро
    fixedCostMonthly: 2000000,
  },
  workingCapital: {
    ...BASE_SCENARIO.workingCapital,
    dso: 60, // Клиенты задерживают платежи
    badDebtProvision: 10, // Риск неоплаты возрастает
    dpo: 45, // Растягиваем оплату поставщикам
    prepaymentRequired: true, // Поставщики требуют предоплату
  },
  collectionProfile: DEFAULT_COLLECTION_PROFILES.crisis,
  implementationCosts: {
    ...BASE_SCENARIO.implementationCosts,
    professionalFees: 300000, // Привлекаем консультантов
  },
  nonCoreAssets: [],
  debtOptions: [], // Пока нет реструктуризации
}

/**
 * Сценарий реструктуризации (Restructuring Case)
 * Активное управление изменениями, оптимизация, реструктуризация долга
 */
export const RESTRUCTURING_SCENARIO: ScenarioParameters = {
  scenarioType: ScenarioType.RESTRUCTURING,
  macro: {
    ...BASE_SCENARIO.macro,
    activeScenario: ScenarioType.RESTRUCTURING,
    inflationRate: 8.5,
    fxRates: {
      USD: 100.0,
      EUR: 110.0,
      CNY: 14.0,
    },
  },
  revenue: {
    ...BASE_SCENARIO.revenue,
    volume: 850, // -15% объема (меньше, чем в downside)
    contractRiskDiscount: 5, // Небольшой риск
  },
  costs: {
    variableCostPercent: 55, // Снижение переменных затрат на 5%
    fixedCostMonthly: 1600000, // -20% фиксированных затрат (оптимизация)
    staffing: {
      headcount: 40, // Сокращение штата на 20%
      avgSalaryGross: 80000,
      socialTaxRate: TAX_RATES.socialContributions.total / 100,
      paymentDates: [10, 25],
    },
  },
  workingCapital: {
    dso: 50, // Чуть хуже, чем база
    badDebtProvision: 5,
    dio: 25, // Оптимизация запасов
    dpo: 40, // Умеренное растягивание КЗ
    prepaymentRequired: false,
  },
  collectionProfile: {
    week0: 0.08,
    week1: 0.35,
    week2: 0.30,
    week3: 0.20,
    week4Plus: 0.07,
  },
  implementationCosts: {
    professionalFees: 500000, // Затраты на реструктуризацию
    arbitrationManager: {
      fixedFee: 0, // Пока не в банкротстве
      percentOfRecovery: 0,
    },
    courtCosts: 50000,
    severancePayments: 800000, // 10 человек * 80к * 2 месяца
  },
  nonCoreAssets: [], // Заполняется индивидуально
  debtOptions: [], // Заполняется индивидуально
}

/**
 * Получить параметры сценария по типу
 */
export function getScenarioByType(type: ScenarioType): ScenarioParameters {
  switch (type) {
    case ScenarioType.BASE:
      return BASE_SCENARIO
    case ScenarioType.DOWNSIDE:
      return DOWNSIDE_SCENARIO
    case ScenarioType.RESTRUCTURING:
      return RESTRUCTURING_SCENARIO
    default:
      return BASE_SCENARIO
  }
}

/**
 * Сравнение сценариев - ключевые метрики
 */
export interface ScenarioComparison {
  scenario: ScenarioType
  revenue: number
  costs: number
  ebitda: number
  cashFlow: number
  debtService: number
  endingCash: number
}

/**
 * Список всех доступных сценариев
 */
export const ALL_SCENARIOS = [
  BASE_SCENARIO,
  DOWNSIDE_SCENARIO,
  RESTRUCTURING_SCENARIO,
]
