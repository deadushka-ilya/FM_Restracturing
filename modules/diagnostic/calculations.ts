/**
 * Расчетные функции для модуля диагностики
 */

import { BalanceSheet, IncomeStatement, CashFlowStatement } from '@/types/company'
import { Debt, DebtSummary } from '@/types/debt'
import {
  DiagnosticResults,
  LiquidityRatios,
  LeverageRatios,
  CoverageRatios,
  ProfitabilityRatios,
  OperationalMetrics,
  BankruptcyIndicators,
  BankruptcyProbability,
  EbitdaAdjustment,
} from '@/types/diagnostic'
import {
  LIQUIDITY_THRESHOLDS,
  LEVERAGE_THRESHOLDS,
  COVERAGE_THRESHOLDS,
  Z_SCORE_THRESHOLDS,
  BANKRUPTCY_LAW_THRESHOLDS,
} from '@/constants/thresholds'

/**
 * Расчет EBITDA
 */
export function calculateEbitda(incomeStatement: IncomeStatement): number {
  // EBITDA = Операционная прибыль + Амортизация
  // Упрощенный расчет: используем операционную прибыль
  // В реальности нужно добавить амортизацию из примечаний к отчетности
  return incomeStatement.operatingProfit
}

/**
 * Расчет нормализованной EBITDA с учетом корректировок
 */
export function calculateAdjustedEbitda(
  reportedEbitda: number,
  adjustments: EbitdaAdjustment[]
): number {
  let adjustedEbitda = reportedEbitda
  
  adjustments.forEach(adj => {
    if (adj.type === 'expense') {
      // Исключаем разовые расходы - увеличиваем EBITDA
      adjustedEbitda += adj.amount
    } else {
      // Исключаем разовые доходы - уменьшаем EBITDA
      adjustedEbitda -= adj.amount
    }
  })
  
  return adjustedEbitda
}

/**
 * Расчет коэффициентов ликвидности
 */
export function calculateLiquidityRatios(balance: BalanceSheet): LiquidityRatios {
  // Оборотные активы
  const currentAssets = 
    balance.inventory +
    balance.receivables +
    balance.cash +
    balance.financialInvestmentsShortTerm +
    balance.otherCurrentAssets
  
  // Краткосрочные обязательства
  const currentLiabilities =
    balance.loansShortTerm +
    balance.payables +
    balance.estimatedLiabilitiesShortTerm +
    balance.otherLiabilitiesShortTerm
  
  // Быстроликвидные активы (без запасов)
  const quickAssets = currentAssets - balance.inventory
  
  // Денежные средства и их эквиваленты
  const cashAndEquivalents = balance.cash + balance.financialInvestmentsShortTerm
  
  return {
    currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
    quickRatio: currentLiabilities > 0 ? quickAssets / currentLiabilities : 0,
    cashRatio: currentLiabilities > 0 ? cashAndEquivalents / currentLiabilities : 0,
    netWorkingCapital: currentAssets - currentLiabilities,
  }
}

/**
 * Расчет коэффициентов финансового рычага
 */
export function calculateLeverageRatios(
  balance: BalanceSheet,
  debtSummary: DebtSummary,
  ebitda: number
): LeverageRatios {
  const totalDebt = balance.loansLongTerm + balance.loansShortTerm
  const cash = balance.cash + balance.financialInvestmentsShortTerm
  const netDebt = totalDebt - cash
  
  const equity = 
    balance.authorizedCapital +
    balance.additionalCapital +
    balance.reserveCapital +
    balance.retainedEarnings -
    balance.ownShares
  
  const totalAssets = 
    // Внеоборотные активы
    balance.intangibleAssets +
    balance.fixedAssets +
    balance.constructionInProgress +
    balance.profitableInvestments +
    balance.financialInvestments +
    balance.deferredTaxAssets +
    balance.otherNonCurrentAssets +
    // Оборотные активы
    balance.inventory +
    balance.receivables +
    balance.cash +
    balance.financialInvestmentsShortTerm +
    balance.otherCurrentAssets
  
  return {
    netDebtToEbitda: ebitda > 0 ? netDebt / ebitda : Infinity,
    debtToEquity: equity > 0 ? totalDebt / equity : Infinity,
    debtToAssets: totalAssets > 0 ? totalDebt / totalAssets : 0,
    equityToAssets: totalAssets > 0 ? equity / totalAssets : 0,
    netDebt: netDebt,
  }
}

/**
 * Расчет коэффициентов покрытия долга
 */
export function calculateCoverageRatios(
  incomeStatement: IncomeStatement,
  cashFlow: CashFlowStatement,
  debtSummary: DebtSummary,
  ebitda: number
): CoverageRatios {
  // Годовые процентные расходы
  const interestExpense = Math.abs(incomeStatement.percentPayable)
  
  // Годовое обслуживание долга (проценты + погашение основного долга)
  // Упрощенный расчет: берем из кэш-фло
  const principalRepayment = Math.abs(cashFlow.repaymentOfLoans)
  const totalDebtService = interestExpense + principalRepayment
  
  // CFADS - Cash Flow Available for Debt Service
  const cfads = cashFlow.cashFromOperations
  
  // ICR - Interest Coverage Ratio
  const icr = interestExpense > 0 ? ebitda / interestExpense : Infinity
  
  // DSCR - Debt Service Coverage Ratio
  const dscr = totalDebtService > 0 ? cfads / totalDebtService : Infinity
  
  // CFADS coverage
  const cfadsCoverage = totalDebtService > 0 ? cfads / totalDebtService : Infinity
  
  // Asset Coverage Ratio
  const totalAssets = 10000000 // Placeholder - нужно рассчитать из баланса
  const totalLiabilities = debtSummary.totalDebt
  const assetCoverage = totalLiabilities > 0 ? totalAssets / totalLiabilities : Infinity
  
  return {
    interestCoverageRatio: icr,
    debtServiceCoverageRatio: dscr,
    cfadsToDebtService: cfadsCoverage,
    assetCoverageRatio: assetCoverage,
  }
}

/**
 * Расчет коэффициентов рентабельности
 */
export function calculateProfitabilityRatios(
  balance: BalanceSheet,
  incomeStatement: IncomeStatement,
  ebitda: number
): ProfitabilityRatios {
  const totalAssets = 10000000 // Placeholder
  const equity = balance.authorizedCapital + balance.retainedEarnings
  
  return {
    returnOnAssets: totalAssets > 0 ? (incomeStatement.netProfit / totalAssets) * 100 : 0,
    returnOnEquity: equity > 0 ? (incomeStatement.netProfit / equity) * 100 : 0,
    returnOnSales: incomeStatement.revenue > 0 ? (incomeStatement.netProfit / incomeStatement.revenue) * 100 : 0,
    ebitdaMargin: incomeStatement.revenue > 0 ? (ebitda / incomeStatement.revenue) * 100 : 0,
    operatingMargin: incomeStatement.revenue > 0 ? (incomeStatement.operatingProfit / incomeStatement.revenue) * 100 : 0,
  }
}

/**
 * Расчет операционных показателей
 */
export function calculateOperationalMetrics(
  balance: BalanceSheet,
  incomeStatement: IncomeStatement
): OperationalMetrics {
  // Оборачиваемость дебиторской задолженности (дни)
  const dso = incomeStatement.revenue > 0 
    ? (balance.receivables / incomeStatement.revenue) * 365 
    : 0
  
  // Оборачиваемость кредиторской задолженности (дни)
  const dpo = incomeStatement.costOfSales > 0
    ? (balance.payables / incomeStatement.costOfSales) * 365
    : 0
  
  // Оборачиваемость запасов (дни)
  const dio = incomeStatement.costOfSales > 0
    ? (balance.inventory / incomeStatement.costOfSales) * 365
    : 0
  
  // Операционный цикл
  const operatingCycle = dso + dio
  
  // Финансовый цикл (Cash Conversion Cycle)
  const ccc = operatingCycle - dpo
  
  return {
    daysReceivablesOutstanding: dso,
    daysPayablesOutstanding: dpo,
    daysInventoryOutstanding: dio,
    operatingCycle: operatingCycle,
    cashConversionCycle: ccc,
  }
}

/**
 * Определение признаков банкротства по ФЗ-127
 */
export function calculateBankruptcyIndicators(
  balance: BalanceSheet,
  debts: Debt[],
  cashFlow: CashFlowStatement
): BankruptcyIndicators {
  // Расчет просроченных обязательств
  const overdueDebts = debts.filter(d => d.isOverdue)
  const overdueAmount = overdueDebts.reduce((sum, d) => sum + (d.overdueAmount || 0), 0)
  const maxOverdueDays = Math.max(...overdueDebts.map(d => d.overdueDays || 0), 0)
  
  // Признак неплатежеспособности
  const hasInsolvency = 
    overdueAmount >= BANKRUPTCY_LAW_THRESHOLDS.minDebtAmount &&
    maxOverdueDays >= BANKRUPTCY_LAW_THRESHOLDS.insolvencyPeriodDays
  
  // Собственный капитал
  const equity = 
    balance.authorizedCapital +
    balance.additionalCapital +
    balance.reserveCapital +
    balance.retainedEarnings
  
  // Обязательства
  const totalLiabilities = 
    balance.loansLongTerm +
    balance.loansShortTerm +
    balance.payables +
    balance.estimatedLiabilitiesLongTerm +
    balance.estimatedLiabilitiesShortTerm
  
  // Активы
  const totalAssets = 10000000 // Placeholder
  
  // Признак недостаточности имущества
  const hasAssetDeficiency = totalAssets < totalLiabilities
  const assetDeficiency = hasAssetDeficiency ? totalLiabilities - totalAssets : 0
  
  // Критические показатели
  const hasNegativeEquity = equity < 0
  const hasNegativeCashFlow = cashFlow.netCashFlow < 0
  const hasCriticalLiquidity = balance.cash < (totalLiabilities * 0.05)
  
  // Риски субсидиарной ответственности
  const subsidiaryRisks: string[] = []
  if (hasAssetDeficiency) {
    subsidiaryRisks.push('Недостаточность имущества - возможна субсидиарная ответственность')
  }
  if (hasNegativeEquity) {
    subsidiaryRisks.push('Отрицательный капитал - признак неэффективного управления')
  }
  
  return {
    hasInsolvencyIndicator: hasInsolvency,
    insolvencyDescription: hasInsolvency 
      ? `Просрочка ${maxOverdueDays} дней на сумму ${overdueAmount.toLocaleString('ru-RU')} руб.`
      : 'Признаков неплатежеспособности не выявлено',
    overdueObligationsAmount: overdueAmount,
    overdueObligationsDays: maxOverdueDays,
    hasAssetDeficiency: hasAssetDeficiency,
    assetDeficiencyAmount: assetDeficiency,
    hasNegativeEquity: hasNegativeEquity,
    hasNegativeCashFlow: hasNegativeCashFlow,
    hasCriticalLiquidity: hasCriticalLiquidity,
    subsidiaryLiabilityRisks: subsidiaryRisks,
  }
}

/**
 * Расчет вероятности банкротства (Z-Score модели)
 */
export function calculateBankruptcyProbability(
  balance: BalanceSheet,
  incomeStatement: IncomeStatement,
  leverageRatios: LeverageRatios
): BankruptcyProbability {
  // Altman Z-Score (модифицированная модель для непубличных компаний)
  // Z = 0.717*X1 + 0.847*X2 + 3.107*X3 + 0.420*X4 + 0.998*X5
  
  const totalAssets = 10000000 // Placeholder
  const workingCapital = balance.cash + balance.receivables - balance.payables
  const retainedEarnings = balance.retainedEarnings
  const ebit = incomeStatement.operatingProfit
  const equity = balance.authorizedCapital + balance.retainedEarnings
  const totalLiabilities = balance.loansLongTerm + balance.loansShortTerm + balance.payables
  const sales = incomeStatement.revenue
  
  const x1 = totalAssets > 0 ? workingCapital / totalAssets : 0
  const x2 = totalAssets > 0 ? retainedEarnings / totalAssets : 0
  const x3 = totalAssets > 0 ? ebit / totalAssets : 0
  const x4 = totalLiabilities > 0 ? equity / totalLiabilities : 0
  const x5 = totalAssets > 0 ? sales / totalAssets : 0
  
  const altmanZ = 0.717 * x1 + 0.847 * x2 + 3.107 * x3 + 0.420 * x4 + 0.998 * x5
  
  let altmanInterpretation: 'Безопасная зона' | 'Серая зона' | 'Зона бедствия'
  if (altmanZ > Z_SCORE_THRESHOLDS.altman.safe) {
    altmanInterpretation = 'Безопасная зона'
  } else if (altmanZ > Z_SCORE_THRESHOLDS.altman.grey) {
    altmanInterpretation = 'Серая зона'
  } else {
    altmanInterpretation = 'Зона бедствия'
  }
  
  // Модель Таффлера
  // Z = 0.53*X1 + 0.13*X2 + 0.18*X3 + 0.16*X4
  const currentLiabilities = balance.loansShortTerm + balance.payables
  const t1 = currentLiabilities > 0 ? incomeStatement.profitBeforeTax / currentLiabilities : 0
  const t2 = totalAssets > 0 ? (balance.cash + balance.receivables) / totalAssets : 0
  const t3 = totalAssets > 0 ? currentLiabilities / totalAssets : 0
  const t4 = totalAssets > 0 ? sales / totalAssets : 0
  
  const tafflerZ = 0.53 * t1 + 0.13 * t2 + 0.18 * t3 + 0.16 * t4
  
  let tafflerInterpretation: 'Низкая вероятность' | 'Средняя вероятность' | 'Высокая вероятность'
  if (tafflerZ > Z_SCORE_THRESHOLDS.taffler.low) {
    tafflerInterpretation = 'Низкая вероятность'
  } else if (tafflerZ > Z_SCORE_THRESHOLDS.taffler.high) {
    tafflerInterpretation = 'Средняя вероятность'
  } else {
    tafflerInterpretation = 'Высокая вероятность'
  }
  
  // Модель Сайфуллина-Кадыкова (для РФ)
  // R = 2*K1 + 0.1*K2 + 0.08*K3 + 0.45*K4 + K5
  const k1 = totalAssets > 0 ? equity / totalAssets : 0
  const k2 = currentLiabilities > 0 ? (balance.cash + balance.receivables) / currentLiabilities : 0
  const k3 = sales > 0 ? sales / totalAssets : 0
  const k4 = incomeStatement.revenue > 0 ? incomeStatement.netProfit / sales : 0
  const k5 = equity > 0 ? incomeStatement.netProfit / equity : 0
  
  const saifullinZ = 2 * k1 + 0.1 * k2 + 0.08 * k3 + 0.45 * k4 + k5
  
  let saifullinInterpretation: 'Благополучное' | 'Удовлетворительное' | 'Неудовлетворительное' | 'Кризисное'
  if (saifullinZ > Z_SCORE_THRESHOLDS.saifullinKadykov.good) {
    saifullinInterpretation = 'Благополучное'
  } else if (saifullinZ > Z_SCORE_THRESHOLDS.saifullinKadykov.satisfactory) {
    saifullinInterpretation = 'Удовлетворительное'
  } else if (saifullinZ > Z_SCORE_THRESHOLDS.saifullinKadykov.poor) {
    saifullinInterpretation = 'Неудовлетворительное'
  } else {
    saifullinInterpretation = 'Кризисное'
  }
  
  // Общий вердикт
  let overallRisk: 'Низкий' | 'Средний' | 'Высокий' | 'Критический'
  const riskScore = 
    (altmanInterpretation === 'Зона бедствия' ? 2 : altmanInterpretation === 'Серая зона' ? 1 : 0) +
    (tafflerInterpretation === 'Высокая вероятность' ? 2 : tafflerInterpretation === 'Средняя вероятность' ? 1 : 0) +
    (saifullinInterpretation === 'Кризисное' ? 2 : saifullinInterpretation === 'Неудовлетворительное' ? 1 : 0)
  
  if (riskScore >= 5) {
    overallRisk = 'Критический'
  } else if (riskScore >= 3) {
    overallRisk = 'Высокий'
  } else if (riskScore >= 1) {
    overallRisk = 'Средний'
  } else {
    overallRisk = 'Низкий'
  }
  
  return {
    altmanZScore: altmanZ,
    altmanInterpretation: altmanInterpretation,
    tafflerZScore: tafflerZ,
    tafflerInterpretation: tafflerInterpretation,
    saifullinKadykovScore: saifullinZ,
    saifullinKadykovInterpretation: saifullinInterpretation,
    overallRisk: overallRisk,
  }
}
