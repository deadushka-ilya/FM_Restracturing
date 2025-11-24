/**
 * Расчетные функции для модуля управления ликвидностью (TWCF)
 */

import {
  TWCFModel,
  WeeklyCashInflows,
  WeeklyCashOutflows,
  WeeklyCashBalance,
  BorrowingBase,
  StressTestParameters,
  StressTestResult,
  StressScenario,
} from '@/types/liquidity'
import { addWeeks, format } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Генерация пустой 13-недельной модели
 */
export function generateEmptyTWCF(startDate: Date, initialCash: number): TWCFModel {
  const weeks: number[] = Array.from({ length: 13 }, (_, i) => i + 1)
  
  const weeklyInflows: WeeklyCashInflows[] = weeks.map(week => {
    const weekStart = addWeeks(startDate, week - 1)
    const weekEnd = addWeeks(weekStart, 1)
    
    return {
      week,
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      revenueWithVat: 0,
      revenueVatAmount: 0,
      revenueNetOfVat: 0,
      receivablesCollection: 0,
      vatRefund: 0,
      otherTaxRefunds: 0,
      otherInflows: 0,
      subsidies: 0,
      totalInflows: 0,
    }
  })
  
  const weeklyOutflows: WeeklyCashOutflows[] = weeks.map(week => {
    const weekStart = addWeeks(startDate, week - 1)
    const weekEnd = addWeeks(weekStart, 1)
    
    return {
      week,
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      suppliersPayment: 0,
      suppliersVatAmount: 0,
      salaries: 0,
      ndflTax: 0,
      socialContributions: 0,
      rentPayment: 0,
      vatPayment: 0,
      incomeTaxPayment: 0,
      propertyTaxPayment: 0,
      otherTaxPayments: 0,
      principalPayment: 0,
      interestPayment: 0,
      leasingPayment: 0,
      capexPayment: 0,
      otherOutflows: 0,
      totalOutflows: 0,
      currentPaymentsAmount: 0,
    }
  })
  
  const weeklyBalances: WeeklyCashBalance[] = weeks.map(week => {
    const weekStart = addWeeks(startDate, week - 1)
    const weekEnd = addWeeks(weekStart, 1)
    
    return {
      week,
      startDate: format(weekStart, 'yyyy-MM-dd'),
      endDate: format(weekEnd, 'yyyy-MM-dd'),
      openingBalance: week === 1 ? initialCash : 0,
      totalInflows: 0,
      totalOutflows: 0,
      netCashFlow: 0,
      closingBalance: 0,
      minimumCashBalance: 0,
      cashShortfall: 0,
      hasCashShortfall: false,
      currentPaymentsAtRisk: 0,
    }
  })
  
  return {
    modelName: `TWCF - ${format(startDate, 'dd.MM.yyyy', { locale: ru })}`,
    createdDate: new Date().toISOString(),
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(addWeeks(startDate, 13), 'yyyy-MM-dd'),
    weeklyInflows,
    weeklyOutflows,
    weeklyBalances,
    initialCashBalance: initialCash,
    totalInflows: 0,
    totalOutflows: 0,
    netCashFlow: 0,
    finalCashBalance: 0,
    weeksWithShortfall: 0,
    maxShortfallAmount: 0,
    totalFinancingRequired: 0,
    vatPosition: {
      vatCollected: 0,
      vatDeductible: 0,
      vatPayable: 0,
      vatRefundable: 0,
    },
  }
}

/**
 * Расчет итоговых показателей по неделям
 */
export function calculateTWCF(
  inflows: WeeklyCashInflows[],
  outflows: WeeklyCashOutflows[],
  initialCash: number,
  minimumCashRequired: number = 0
): TWCFModel {
  const model = generateEmptyTWCF(new Date(inflows[0].startDate), initialCash)
  
  model.weeklyInflows = inflows
  model.weeklyOutflows = outflows
  
  // Расчет балансов по неделям
  let runningBalance = initialCash
  let totalVatCollected = 0
  let totalVatDeductible = 0
  let totalFinancingNeeded = 0
  let weeksWithShortfall = 0
  let maxShortfall = 0
  
  model.weeklyBalances = inflows.map((inflowWeek, index) => {
    const outflowWeek = outflows[index]
    
    const totalInflows = inflowWeek.totalInflows
    const totalOutflows = outflowWeek.totalOutflows
    const netCashFlow = totalInflows - totalOutflows
    const closingBalance = runningBalance + netCashFlow
    
    // НДС
    totalVatCollected += inflowWeek.revenueVatAmount
    totalVatDeductible += outflowWeek.suppliersVatAmount
    
    // Проверка на кассовый разрыв
    const cashShortfall = Math.max(0, minimumCashRequired - closingBalance)
    const hasCashShortfall = cashShortfall > 0
    
    if (hasCashShortfall) {
      weeksWithShortfall++
      totalFinancingNeeded += cashShortfall
      maxShortfall = Math.max(maxShortfall, cashShortfall)
    }
    
    // Текущие платежи под угрозой
    const currentPaymentsAtRisk = hasCashShortfall ? outflowWeek.currentPaymentsAmount : 0
    
    const balance: WeeklyCashBalance = {
      week: inflowWeek.week,
      startDate: inflowWeek.startDate,
      endDate: inflowWeek.endDate,
      openingBalance: runningBalance,
      totalInflows,
      totalOutflows,
      netCashFlow,
      closingBalance,
      minimumCashBalance: minimumCashRequired,
      cashShortfall,
      hasCashShortfall,
      currentPaymentsAtRisk,
    }
    
    runningBalance = closingBalance
    
    return balance
  })
  
  // Итоговые показатели
  model.totalInflows = inflows.reduce((sum, w) => sum + w.totalInflows, 0)
  model.totalOutflows = outflows.reduce((sum, w) => sum + w.totalOutflows, 0)
  model.netCashFlow = model.totalInflows - model.totalOutflows
  model.finalCashBalance = runningBalance
  model.weeksWithShortfall = weeksWithShortfall
  model.maxShortfallAmount = maxShortfall
  model.totalFinancingRequired = totalFinancingNeeded
  
  // НДС позиция
  model.vatPosition = {
    vatCollected: totalVatCollected,
    vatDeductible: totalVatDeductible,
    vatPayable: Math.max(0, totalVatCollected - totalVatDeductible),
    vatRefundable: Math.max(0, totalVatDeductible - totalVatCollected),
  }
  
  return model
}

/**
 * Стресс-тест: Задержка поступлений
 */
export function applyRevenueDelayStress(
  baseModel: TWCFModel,
  delayWeeks: number
): TWCFModel {
  const stressedInflows = baseModel.weeklyInflows.map((week, index) => {
    if (index < delayWeeks) {
      // Первые недели - нет поступлений
      return {
        ...week,
        revenueWithVat: 0,
        revenueVatAmount: 0,
        revenueNetOfVat: 0,
        receivablesCollection: 0,
        totalInflows: week.vatRefund + week.otherTaxRefunds + week.otherInflows + week.subsidies,
      }
    }
    return week
  })
  
  return calculateTWCF(
    stressedInflows,
    baseModel.weeklyOutflows,
    baseModel.initialCashBalance
  )
}

/**
 * Стресс-тест: Снижение выручки
 */
export function applyRevenueDropStress(
  baseModel: TWCFModel,
  dropPercent: number
): TWCFModel {
  const stressedInflows = baseModel.weeklyInflows.map(week => ({
    ...week,
    revenueWithVat: week.revenueWithVat * (1 - dropPercent / 100),
    revenueVatAmount: week.revenueVatAmount * (1 - dropPercent / 100),
    revenueNetOfVat: week.revenueNetOfVat * (1 - dropPercent / 100),
    receivablesCollection: week.receivablesCollection * (1 - dropPercent / 100),
    totalInflows: (week.totalInflows - week.revenueWithVat - week.receivablesCollection) +
                   (week.revenueWithVat * (1 - dropPercent / 100)) +
                   (week.receivablesCollection * (1 - dropPercent / 100)),
  }))
  
  return calculateTWCF(
    stressedInflows,
    baseModel.weeklyOutflows,
    baseModel.initialCashBalance
  )
}

/**
 * Расчет Borrowing Base
 */
export function calculateBorrowingBase(
  receivables: number,
  inventory: number,
  equipment: number,
  receivablesAdvanceRate: number = 0.85,
  inventoryAdvanceRate: number = 0.65,
  equipmentAdvanceRate: number = 0.75
): BorrowingBase {
  const receivablesBB = receivables * receivablesAdvanceRate
  const inventoryBB = inventory * inventoryAdvanceRate
  const equipmentBB = equipment * equipmentAdvanceRate
  const totalBB = receivablesBB + inventoryBB + equipmentBB
  
  return {
    calculationDate: new Date().toISOString(),
    eligibleReceivables: receivables,
    receivablesAdvanceRate,
    receivablesBorrowingBase: receivablesBB,
    eligibleInventory: inventory,
    inventoryAdvanceRate,
    inventoryBorrowingBase: inventoryBB,
    eligibleEquipment: equipment,
    equipmentAdvanceRate,
    equipmentBorrowingBase: equipmentBB,
    totalBorrowingBase: totalBB,
    existingBorrowings: 0,
    availableCredit: totalBB,
    weeklyBorrowingBase: [],
  }
}

/**
 * Проведение комплексного стресс-теста
 */
export function runStressTest(
  baseModel: TWCFModel,
  parameters: StressTestParameters
): StressTestResult {
  let stressModel = baseModel
  
  switch (parameters.scenario) {
    case StressScenario.REVENUE_DELAY:
      stressModel = applyRevenueDelayStress(baseModel, parameters.revenueDelayWeeks || 2)
      break
      
    case StressScenario.REVENUE_DROP:
      stressModel = applyRevenueDropStress(baseModel, parameters.revenueDropPercent || 20)
      break
      
    case StressScenario.COMBINED:
      stressModel = applyRevenueDelayStress(baseModel, parameters.revenueDelayWeeks || 1)
      stressModel = applyRevenueDropStress(stressModel, parameters.revenueDropPercent || 15)
      break
      
    default:
      stressModel = baseModel
  }
  
  // Определение критических недель
  const criticalWeeks = stressModel.weeklyBalances
    .filter(w => w.hasCashShortfall)
    .map(w => w.week)
  
  // Рекомендации
  const recommendations: string[] = []
  if (stressModel.weeksWithShortfall > 0) {
    recommendations.push(
      `Выявлено ${stressModel.weeksWithShortfall} недель с кассовым разрывом`
    )
    recommendations.push(
      `Требуется дополнительное финансирование: ${stressModel.totalFinancingRequired.toLocaleString('ru-RU')} руб.`
    )
    recommendations.push('Рекомендуется переговоры с кредиторами о переносе платежей')
    recommendations.push('Рассмотреть продажу непрофильных активов')
  } else {
    recommendations.push('Компания сохраняет платежеспособность в стресс-сценарии')
  }
  
  return {
    scenario: parameters.scenario,
    parameters,
    baseModel,
    stressModel,
    additionalFinancingRequired: stressModel.totalFinancingRequired,
    criticalWeeks,
    recommendations,
  }
}
