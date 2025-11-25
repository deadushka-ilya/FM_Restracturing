/**
 * Расширенные расчеты для модуля ликвидности
 * Реализация методологии Restructuring Playbook:
 * - Collection Matrix (профили сбора платежей)
 * - AP Aging (старение кредиторской задолженности)
 * - Payment Waterfall (очередность по 127-ФЗ)
 * - Cash Wall (стена ликвидности)
 */

import { CollectionProfile, PaymentPriority, LiquidityStatus, CashWallParameters } from '@/types/scenario'

/**
 * Расчет поступлений на основе Collection Matrix
 * Распределяет выручку по неделям оплаты с учетом профиля сбора
 */
export function calculateCollectionMatrix(
  salesByWeek: number[], // Выручка с НДС по неделям
  collectionProfile: CollectionProfile,
  weeksToForecast: number = 13
): number[] {
  const collections: number[] = new Array(weeksToForecast).fill(0)

  for (let week = 0; week < weeksToForecast; week++) {
    // Поступления от продаж текущей недели
    if (week < salesByWeek.length) {
      collections[week] += salesByWeek[week] * collectionProfile.week0
    }

    // Поступления от продаж прошлых недель
    if (week >= 1 && week - 1 < salesByWeek.length) {
      collections[week] += salesByWeek[week - 1] * collectionProfile.week1
    }
    if (week >= 2 && week - 2 < salesByWeek.length) {
      collections[week] += salesByWeek[week - 2] * collectionProfile.week2
    }
    if (week >= 3 && week - 3 < salesByWeek.length) {
      collections[week] += salesByWeek[week - 3] * collectionProfile.week3
    }
    if (week >= 4 && week - 4 < salesByWeek.length) {
      collections[week] += salesByWeek[week - 4] * collectionProfile.week4Plus
    }
  }

  return collections
}

/**
 * Интерфейс для платежа в очереди
 */
interface WaterfallPayment {
  priority: PaymentPriority
  name: string
  amount: number
  paid: number
  shortfall: number
}

/**
 * Расчет распределения платежей по очередности (Waterfall)
 * Согласно ст. 134 127-ФЗ "О несостоятельности (банкротстве)"
 */
export function calculatePaymentWaterfall(
  availableCash: number,
  payments: Omit<WaterfallPayment, 'paid' | 'shortfall'>[]
): WaterfallPayment[] {
  // Сортируем платежи по приоритету
  const sortedPayments = [...payments].sort((a, b) => a.priority - b.priority)
  
  let remainingCash = availableCash
  const result: WaterfallPayment[] = []

  for (const payment of sortedPayments) {
    const amountToPay = Math.min(remainingCash, payment.amount)
    const shortfall = payment.amount - amountToPay

    result.push({
      ...payment,
      paid: amountToPay,
      shortfall: shortfall,
    })

    remainingCash -= amountToPay

    // Если деньги закончились, остальные платежи не выполняются
    if (remainingCash <= 0) {
      // Добавляем оставшиеся платежи с нулевой оплатой
      const unpaidPayments = sortedPayments.slice(result.length)
      for (const unpaid of unpaidPayments) {
        result.push({
          ...unpaid,
          paid: 0,
          shortfall: unpaid.amount,
        })
      }
      break
    }
  }

  return result
}

/**
 * AP Aging - Расчет распределения платежей поставщикам
 * на основе условий отсрочки (DPO)
 */
export interface APAgingBucket {
  weekNumber: number
  purchases: number // Закупки, сделанные в эту неделю
  dueWeek: number // Неделя, когда нужно оплатить
  amount: number // Сумма к оплате
}

export function calculateAPAging(
  purchasesByWeek: number[], // Закупки по неделям
  dpo: number, // Days Payables Outstanding
  weeksToForecast: number = 13
): APAgingBucket[] {
  const weeksDelay = Math.floor(dpo / 7) // Конвертируем дни в недели
  const aging: APAgingBucket[] = []

  for (let week = 0; week < purchasesByWeek.length; week++) {
    const dueWeek = week + weeksDelay
    
    aging.push({
      weekNumber: week,
      purchases: purchasesByWeek[week],
      dueWeek: dueWeek,
      amount: purchasesByWeek[week],
    })
  }

  return aging
}

/**
 * Расчет платежей поставщикам на конкретную неделю
 * на основе AP Aging
 */
export function getPaymentsDueForWeek(
  apAging: APAgingBucket[],
  targetWeek: number
): number {
  return apAging
    .filter(bucket => bucket.dueWeek === targetWeek)
    .reduce((sum, bucket) => sum + bucket.amount, 0)
}

/**
 * Рычаг ликвидности: Растягивание платежей (DPO Stretching)
 * В сценарии Restructuring можно отложить платежи неприоритетным поставщикам
 */
export function applyDPOStretching(
  apAging: APAgingBucket[],
  additionalWeeks: number,
  percentToStretch: number = 1.0 // Какую долю закупок растягиваем (0-1)
): APAgingBucket[] {
  return apAging.map(bucket => ({
    ...bucket,
    dueWeek: bucket.dueWeek + Math.floor(additionalWeeks * percentToStretch),
  }))
}

/**
 * Расчет Cash Wall (стены ликвидности)
 * Визуализация остатка ДС против минимального неснижаемого остатка
 */
export function calculateCashWall(
  cashBalances: number[], // Остатки ДС по неделям
  params: CashWallParameters
): {
  weekNumber: number
  cashBalance: number
  minCashRequired: number
  surplus: number
  status: LiquidityStatus
}[] {
  return cashBalances.map((balance, index) => {
    const surplus = balance - params.minCashRequired
    let status: LiquidityStatus

    if (balance < params.minCashRequired) {
      status = LiquidityStatus.RED
    } else if (balance < params.minCashRequired * 1.2) {
      status = LiquidityStatus.AMBER
    } else {
      status = LiquidityStatus.GREEN
    }

    return {
      weekNumber: index + 1,
      cashBalance: balance,
      minCashRequired: params.minCashRequired,
      surplus: surplus,
      status: status,
    }
  })
}

/**
 * Расчет револьверной кредитной линии (RCF Logic)
 * Автоматическая балансировка кассы через овердрафт
 */
export interface RCFParameters {
  limit: number // Лимит кредитной линии
  currentDrawn: number // Текущая выборка
  minCash: number // Минимальный остаток для авто-выборки
  targetCash: number // Целевой остаток для авто-погашения
}

export function calculateRCFMovement(
  cashBalance: number,
  params: RCFParameters
): {
  autoDraw: number // Автоматическая выборка
  autoRepay: number // Автоматическое погашение
  newDrawn: number // Новая выборка
  availableLimit: number // Доступный лимит
} {
  let autoDraw = 0
  let autoRepay = 0

  // Автоматическая выборка, если денег не хватает
  if (cashBalance < params.minCash) {
    const needed = params.minCash - cashBalance
    const available = params.limit - params.currentDrawn
    autoDraw = Math.min(needed, available)
  }

  // Автоматическое погашение, если есть излишек
  if (cashBalance > params.targetCash) {
    const excess = cashBalance - params.targetCash
    autoRepay = Math.min(excess, params.currentDrawn)
  }

  const newDrawn = params.currentDrawn + autoDraw - autoRepay

  return {
    autoDraw,
    autoRepay,
    newDrawn,
    availableLimit: params.limit - newDrawn,
  }
}

/**
 * Расчет процентов с учетом капитализации (PIK - Payment In Kind)
 * Для случаев моратория на выплату процентов
 */
export function calculatePIKInterest(
  principal: number,
  annualRate: number,
  weeks: number,
  capitalize: boolean = true
): {
  interest: number // Начисленные проценты
  newPrincipal: number // Новое тело долга (если капитализация)
} {
  const weeklyRate = annualRate / 52 / 100
  const interest = principal * weeklyRate * weeks

  const newPrincipal = capitalize ? principal + interest : principal

  return {
    interest,
    newPrincipal,
  }
}

/**
 * Сценарный множитель (Scenario Multiplier)
 * Корректировка драйверов в зависимости от выбранного сценария
 */
export function applyScenarioAdjustment(
  baseValue: number,
  scenarioType: 'Base' | 'Downside' | 'Restructuring',
  adjustmentType: 'revenue' | 'costs' | 'collections'
): number {
  const adjustments = {
    revenue: {
      Base: 1.0,
      Downside: 0.7, // -30% выручки в кризисе
      Restructuring: 0.85, // -15% при реструктуризации
    },
    costs: {
      Base: 1.0,
      Downside: 1.0, // Затраты остаются
      Restructuring: 0.8, // -20% затрат при оптимизации
    },
    collections: {
      Base: 1.0,
      Downside: 0.85, // Задержка платежей на 15%
      Restructuring: 0.9, // Задержка на 10%
    },
  }

  return baseValue * adjustments[adjustmentType][scenarioType]
}

/**
 * Расчет налогов по ЕНС (Единый налоговый счет)
 * С учетом российской специфики
 */
export interface TaxPayments {
  vat: number // НДС (28 число)
  incomeTax: number // Налог на прибыль (28 число)
  socialTaxes: number // Страховые взносы (15 число)
  ndfl: number // НДФЛ (28 число)
}

export function calculateTaxPaymentSchedule(
  revenue: number,
  payroll: number,
  vatRate: number = 0.20,
  incomeTaxRate: number = 0.20,
  socialTaxRate: number = 0.30,
  ndflRate: number = 0.13
): TaxPayments {
  // НДС от выручки
  const vat = revenue * (vatRate / (1 + vatRate))

  // Налог на прибыль (упрощенно)
  const incomeTax = (revenue * 0.2) * incomeTaxRate

  // Страховые взносы от ФОТ
  const socialTaxes = payroll * socialTaxRate

  // НДФЛ от ФОТ
  const ndfl = payroll * ndflRate

  return {
    vat,
    incomeTax,
    socialTaxes,
    ndfl,
  }
}
